-- ============================================================
-- 20260711000005_create_inventory_reservations.sql
-- Implements:
--   1. inventory_reservations table
--   2. reservation_duration_seconds on tenants
--   3. reserve_inventory() SECURITY DEFINER function
--   4. release_reservation() SECURITY DEFINER function
--   5. confirm_and_deduct_stock() SECURITY DEFINER function
--   6. handle_order_cancellation_stock_restore() trigger
--   7. pg_cron cleanup job
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Add reservation_duration_seconds to tenants
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS reservation_duration_seconds INTEGER NOT NULL DEFAULT 300;

-- ────────────────────────────────────────────────────────────
-- 2. Create inventory_reservations table
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  size TEXT DEFAULT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  session_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One reservation per session per item+size
CREATE UNIQUE INDEX idx_reservations_unique
  ON public.inventory_reservations(tenant_id, item_id, COALESCE(size, ''), session_id);

-- Fast lookup for active reservations
CREATE INDEX idx_reservations_active
  ON public.inventory_reservations(item_id, size, expires_at);

-- Enable RLS
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

-- Reservations are managed entirely by SECURITY DEFINER functions;
-- deny direct access by default.
CREATE POLICY "reservations_deny_direct"
  ON public.inventory_reservations
  FOR ALL
  USING (false);

-- ────────────────────────────────────────────────────────────
-- 3. reserve_inventory()
--    Atomically checks availability and creates reservations.
--    Uses Smart Reserve: only reserves when
--    (available - existing_reservations) <= cart_quantity.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reserve_inventory(
  p_tenant_id UUID,
  p_items JSONB,       -- [{item_id, size, quantity}]
  p_session_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_item_id UUID;
  v_size TEXT;
  v_cart_qty INTEGER;
  v_stock INTEGER;
  v_size_stock INTEGER;
  v_reserved INTEGER;
  v_available INTEGER;
  v_duration INTEGER;
  v_expires_at TIMESTAMPTZ;
  v_needs_reserve BOOLEAN := false;
  v_unavailable JSONB := '[]'::JSONB;
  v_item_title TEXT;
BEGIN
  -- Get tenant reservation duration
  SELECT reservation_duration_seconds INTO v_duration
  FROM public.tenants WHERE id = p_tenant_id;
  v_duration := COALESCE(v_duration, 300);
  v_expires_at := now() + (v_duration * INTERVAL '1 second');

  -- Process each item in the cart
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id := (v_item->>'item_id')::UUID;
    v_size := v_item->>'size';  -- NULL if not sized
    v_cart_qty := COALESCE((v_item->>'quantity')::INTEGER, 1);

    -- Lock the item row to serialize concurrent calls
    SELECT quantity, title INTO v_stock, v_item_title
    FROM public.items
    WHERE id = v_item_id AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- For sized items, use the size-level quantity
    IF v_size IS NOT NULL THEN
      SELECT COALESCE(
        (elem->>'quantity')::INTEGER, 0
      ) INTO v_size_stock
      FROM public.items,
           jsonb_array_elements(sizes) AS elem
      WHERE id = v_item_id
        AND elem->>'size' = v_size;
      v_stock := COALESCE(v_size_stock, 0);
    END IF;

    -- Count active reservations for this item+size (excluding current session)
    SELECT COALESCE(SUM(r.quantity), 0) INTO v_reserved
    FROM public.inventory_reservations r
    WHERE r.item_id = v_item_id
      AND r.expires_at > now()
      AND r.session_id != p_session_id
      AND COALESCE(r.size, '') = COALESCE(v_size, '');

    v_available := v_stock - v_reserved;

    -- Check if we can fulfil the order at all
    IF v_available < v_cart_qty THEN
      v_unavailable := v_unavailable || jsonb_build_object(
        'item_id', v_item_id,
        'title', v_item_title,
        'available', v_available,
        'requested', v_cart_qty
      );
    END IF;

    -- Smart Reserve: flag if stock is tight relative to cart quantity
    IF v_available <= v_cart_qty THEN
      v_needs_reserve := true;
    END IF;
  END LOOP;

  -- If any item is unavailable, abort
  IF jsonb_array_length(v_unavailable) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_stock',
      'unavailable_items', v_unavailable
    );
  END IF;

  -- Create reservations for items that need them
  IF v_needs_reserve THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_item_id := (v_item->>'item_id')::UUID;
      v_size := v_item->>'size';
      v_cart_qty := COALESCE((v_item->>'quantity')::INTEGER, 1);

      -- Upsert: update if session already has a reservation for this item
      INSERT INTO public.inventory_reservations
        (tenant_id, item_id, size, quantity, session_id, expires_at)
      VALUES
        (p_tenant_id, v_item_id, v_size, v_cart_qty, p_session_id, v_expires_at)
      ON CONFLICT (tenant_id, item_id, COALESCE(size, ''), session_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        expires_at = EXCLUDED.expires_at;
    END LOOP;

    RETURN jsonb_build_object(
      'success', true,
      'reserved', true,
      'expires_at', v_expires_at,
      'duration_seconds', v_duration
    );
  END IF;

  -- Plenty of stock, no reservation needed
  RETURN jsonb_build_object(
    'success', true,
    'reserved', false,
    'expires_at', NULL
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 4. release_reservation()
--    Explicitly frees reservations for a session.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.release_reservation(
  p_session_id TEXT,
  p_tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.inventory_reservations
  WHERE session_id = p_session_id
    AND tenant_id = p_tenant_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 5. confirm_and_deduct_stock()
--    Final atomic stock deduction called at order placement.
--    Acts as safety net even for non-reserved items.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.confirm_and_deduct_stock(
  p_tenant_id UUID,
  p_session_id TEXT,
  p_items JSONB  -- [{item_id, size, quantity}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_item_id UUID;
  v_size TEXT;
  v_deduct_qty INTEGER;
  v_current_qty INTEGER;
  v_current_sizes JSONB;
  v_new_qty INTEGER;
  v_new_sizes JSONB;
  v_new_status TEXT;
  v_item_title TEXT;
  v_reserved INTEGER;
  v_available INTEGER;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id := (v_item->>'item_id')::UUID;
    v_size := v_item->>'size';
    v_deduct_qty := COALESCE((v_item->>'quantity')::INTEGER, 1);

    -- Lock row
    SELECT quantity, sizes, title INTO v_current_qty, v_current_sizes, v_item_title
    FROM public.items
    WHERE id = v_item_id AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Item ' || v_item_id || ' not found');
    END IF;

    -- Count active reservations by OTHER sessions (current session's reservation is being consumed)
    SELECT COALESCE(SUM(r.quantity), 0) INTO v_reserved
    FROM public.inventory_reservations r
    WHERE r.item_id = v_item_id
      AND r.expires_at > now()
      AND r.session_id != p_session_id
      AND COALESCE(r.size, '') = COALESCE(v_size, '');

    -- For sized items
    IF v_size IS NOT NULL AND v_current_sizes IS NOT NULL THEN
      SELECT COALESCE((elem->>'quantity')::INTEGER, 0) INTO v_current_qty
      FROM jsonb_array_elements(v_current_sizes) AS elem
      WHERE elem->>'size' = v_size;

      v_available := v_current_qty - v_reserved;

      IF v_available < v_deduct_qty THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', v_item_title || ' (size ' || v_size || ') is no longer available in the requested quantity'
        );
      END IF;

      -- Update size quantity in JSONB array
      SELECT jsonb_agg(
        CASE
          WHEN elem->>'size' = v_size
          THEN jsonb_set(elem, '{quantity}', to_jsonb(GREATEST(0, (elem->>'quantity')::INTEGER - v_deduct_qty)))
          ELSE elem
        END
      ) INTO v_new_sizes
      FROM jsonb_array_elements(v_current_sizes) AS elem;

      -- Recalculate total quantity from sizes
      SELECT COALESCE(SUM((elem->>'quantity')::INTEGER), 0) INTO v_new_qty
      FROM jsonb_array_elements(v_new_sizes) AS elem;

    ELSE
      -- Non-sized item
      v_available := v_current_qty - v_reserved;

      IF v_available < v_deduct_qty THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', v_item_title || ' is no longer available in the requested quantity'
        );
      END IF;

      v_new_qty := GREATEST(0, v_current_qty - v_deduct_qty);
      v_new_sizes := v_current_sizes;
    END IF;

    -- Determine new stock_status
    IF v_new_qty = 0 THEN
      v_new_status := 'out_of_stock';
    ELSIF v_new_qty <= 5 THEN
      v_new_status := 'low_stock';
    ELSE
      v_new_status := 'in_stock';
    END IF;

    -- Update the item
    UPDATE public.items
    SET
      quantity = v_new_qty,
      sizes = v_new_sizes,
      stock_status = v_new_status,
      updated_at = now()
    WHERE id = v_item_id AND tenant_id = p_tenant_id;
  END LOOP;

  -- Release the session's reservations
  DELETE FROM public.inventory_reservations
  WHERE session_id = p_session_id AND tenant_id = p_tenant_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. handle_order_cancellation_stock_restore()
--    Restores stock quantities when an order is cancelled.
--    Guards against double-restore on re-cancel.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_order_cancellation_stock_restore()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_item RECORD;
  v_current_qty INTEGER;
  v_current_sizes JSONB;
  v_new_qty INTEGER;
  v_new_sizes JSONB;
  v_new_status TEXT;
BEGIN
  -- Only fire when status transitions TO 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN

    FOR v_order_item IN
      SELECT oi.item_id, oi.quantity, oi.size
      FROM public.order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      -- Get current item state
      SELECT quantity, sizes INTO v_current_qty, v_current_sizes
      FROM public.items
      WHERE id = v_order_item.item_id
      FOR UPDATE;

      IF NOT FOUND THEN
        CONTINUE; -- item may have been deleted, skip
      END IF;

      IF v_order_item.size IS NOT NULL AND v_current_sizes IS NOT NULL THEN
        -- Restore size-level quantity
        SELECT jsonb_agg(
          CASE
            WHEN elem->>'size' = v_order_item.size
            THEN jsonb_set(elem, '{quantity}', to_jsonb((elem->>'quantity')::INTEGER + v_order_item.quantity))
            ELSE elem
          END
        ) INTO v_new_sizes
        FROM jsonb_array_elements(v_current_sizes) AS elem;

        -- Recalculate total
        SELECT COALESCE(SUM((elem->>'quantity')::INTEGER), 0) INTO v_new_qty
        FROM jsonb_array_elements(v_new_sizes) AS elem;
      ELSE
        v_new_qty := v_current_qty + v_order_item.quantity;
        v_new_sizes := v_current_sizes;
      END IF;

      -- Recalculate stock_status
      IF v_new_qty = 0 THEN
        v_new_status := 'out_of_stock';
      ELSIF v_new_qty <= 5 THEN
        v_new_status := 'low_stock';
      ELSE
        v_new_status := 'in_stock';
      END IF;

      UPDATE public.items
      SET
        quantity = v_new_qty,
        sizes = v_new_sizes,
        stock_status = v_new_status,
        updated_at = now()
      WHERE id = v_order_item.item_id;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_cancelled_restore_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancellation_stock_restore();

-- ────────────────────────────────────────────────────────────
-- 7. pg_cron: cleanup expired reservations every minute
--    (only schedules if pg_cron extension is enabled)
-- ────────────────────────────────────────────────────────────
DO $cron_setup$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-expired-reservations',
      '* * * * *',
      'DELETE FROM public.inventory_reservations WHERE expires_at < now()'
    );
  END IF;
END;
$cron_setup$;
