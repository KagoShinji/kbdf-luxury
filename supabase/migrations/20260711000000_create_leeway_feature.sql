-- ============================================================
-- 20260711000000_create_leeway_feature.sql
-- Implements database schema changes for leeway checkout, installment trackers, and payment approval flows.
-- ============================================================

-- 1. Extend items table
ALTER TABLE public.items
ADD COLUMN leeway_enabled BOOLEAN DEFAULT false,
ADD COLUMN leeway_down_payment_required BOOLEAN DEFAULT false,
ADD COLUMN leeway_down_payment_amount DECIMAL(12, 2) DEFAULT 0;

-- 2. Extend admin_users table to add access flag
ALTER TABLE public.admin_users
ADD COLUMN access_leeway BOOLEAN DEFAULT true;

-- 3. Create leeway_accounts table
CREATE TABLE public.leeway_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  total_amount DECIMAL(12, 2) NOT NULL,
  down_payment_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_schedule TEXT NOT NULL CHECK (payment_schedule IN ('weekly', 'monthly', 'flexible')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for leeway_accounts updated_at
CREATE TRIGGER leeway_accounts_updated_at
  BEFORE UPDATE ON public.leeway_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Create leeway_payments table
CREATE TABLE public.leeway_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  leeway_account_id UUID NOT NULL REFERENCES public.leeway_accounts(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  proof_of_payment_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
  payment_type TEXT NOT NULL DEFAULT 'installment' CHECK (payment_type IN ('down_payment', 'installment')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for leeway_payments updated_at
CREATE TRIGGER leeway_payments_updated_at
  BEFORE UPDATE ON public.leeway_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.leeway_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leeway_payments ENABLE ROW LEVEL SECURITY;

-- 6. Define RLS Policies for leeway_accounts
CREATE POLICY "leeway_accounts_select" ON public.leeway_accounts FOR SELECT
  USING (
    is_superadmin()
    OR tenant_id = current_tenant_id()
    OR (auth.role() = 'authenticated' AND customer_id = auth.uid())
  );

CREATE POLICY "leeway_accounts_insert" ON public.leeway_accounts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "leeway_accounts_write" ON public.leeway_accounts FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- 7. Define RLS Policies for leeway_payments
CREATE POLICY "leeway_payments_select" ON public.leeway_payments FOR SELECT
  USING (
    is_superadmin()
    OR tenant_id = current_tenant_id()
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.leeway_accounts
        WHERE leeway_accounts.id = leeway_payments.leeway_account_id
        AND leeway_accounts.customer_id = auth.uid()
      )
    )
  );

CREATE POLICY "leeway_payments_insert" ON public.leeway_payments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "leeway_payments_write" ON public.leeway_payments FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- 8. Trigger Function: Deduct verified payment from remaining balance
CREATE OR REPLACE FUNCTION public.handle_leeway_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    UPDATE public.leeway_accounts
    SET remaining_balance = GREATEST(0, remaining_balance - NEW.amount),
        status = CASE 
          WHEN remaining_balance - NEW.amount <= 0 THEN 'completed'::TEXT
          ELSE status
        END,
        updated_at = now()
    WHERE id = NEW.leeway_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_leeway_payment_verified
  AFTER UPDATE OF status ON public.leeway_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_leeway_payment_verification();

-- 9. Trigger Function: Automatically verify downpayment when order status changes to 'verified'
CREATE OR REPLACE FUNCTION public.handle_order_verification_for_leeway()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status != 'verified' AND NEW.payment_method_type = 'leeway' THEN
    UPDATE public.leeway_payments
    SET status = 'verified',
        updated_at = now()
    WHERE leeway_account_id IN (
      SELECT id FROM public.leeway_accounts WHERE order_id = NEW.id
    ) AND status = 'pending_verification';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_verified_for_leeway
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_verification_for_leeway();
