-- ============================================================
-- 20260918000001_fix_leads_rls_policies.sql
-- Ensures guest and authenticated storefront users can submit
-- contact inquiries (leads) without encountering RLS errors.
-- ============================================================

-- 1. Enable RLS on leads table (idempotent)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_anon" ON public.leads;
DROP POLICY IF EXISTS "leads_write" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_public" ON public.leads;
DROP POLICY IF EXISTS "leads_admin_all" ON public.leads;

-- 3. Public Insert Policy: Allows guest buyers and storefront visitors to submit inquiries
CREATE POLICY "leads_insert_public" ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Admin Select Policy: Allows admins and superadmins to view leads
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    is_superadmin() 
    OR tenant_id = current_tenant_id()
  );

-- 5. Admin Update Policy: Allows admins to update lead status and notes
CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    is_superadmin() 
    OR tenant_id = current_tenant_id()
  )
  WITH CHECK (
    is_superadmin() 
    OR tenant_id = current_tenant_id()
  );

-- 6. Admin Delete Policy: Allows admins to delete leads
CREATE POLICY "leads_delete" ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    is_superadmin() 
    OR tenant_id = current_tenant_id()
  );
