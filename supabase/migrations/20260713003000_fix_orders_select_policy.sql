-- ============================================================
-- 20260713003000_fix_orders_select_policy.sql
-- Updates orders_select policy to allow guest checkouts to proceed
-- even when browser session is authenticated (customer_id is null).
-- ============================================================

DROP POLICY IF EXISTS "orders_select" ON public.orders;

CREATE POLICY "orders_select" ON public.orders FOR SELECT
  USING (
    is_superadmin()
    -- Tenant Admin
    OR (auth.role() = 'authenticated' AND tenant_id = current_tenant_id())
    -- Storefront Customer
    OR (auth.role() = 'authenticated' AND customer_id = auth.uid())
    -- Anon Tracker Lookup
    OR (auth.role() = 'anon')
    -- Guest Orders Lookup (allows guest checkout and tracking to select guest orders)
    OR (customer_id IS NULL)
  );
