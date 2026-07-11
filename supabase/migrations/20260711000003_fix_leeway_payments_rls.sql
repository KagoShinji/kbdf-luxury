-- ============================================================
-- 20260711000003_fix_leeway_payments_rls.sql
-- Fixes RLS INSERT policy on leeway_payments so authenticated
-- customers can submit follow-up installment payments for their
-- own leeway accounts without being blocked by RLS on the
-- leeway_accounts lookup.
-- ============================================================

-- Drop the old too-broad insert policy
DROP POLICY IF EXISTS "leeway_payments_insert" ON public.leeway_payments;

-- Create a corrected insert policy that verifies the leeway account
-- belongs to the authenticated user by bypassing the circular RLS
-- check using a SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.user_owns_leeway_account(p_leeway_account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leeway_accounts
    WHERE id = p_leeway_account_id
      AND customer_id = auth.uid()
  );
$$;

-- New insert policy: authenticated user can insert a payment only
-- for a leeway account that belongs to them.
CREATE POLICY "leeway_payments_insert" ON public.leeway_payments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_owns_leeway_account(leeway_account_id)
  );
