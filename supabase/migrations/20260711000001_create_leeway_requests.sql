-- ============================================================
-- 20260711000001_create_leeway_requests.sql
-- Implements table structure and RLS security for leeway pre-approval requests.
-- ============================================================

CREATE TABLE public.leeway_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, customer_id)
);

-- Trigger for leeway_requests updated_at
CREATE TRIGGER leeway_requests_updated_at
  BEFORE UPDATE ON public.leeway_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.leeway_requests ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "leeway_requests_select" ON public.leeway_requests FOR SELECT
  USING (
    is_superadmin()
    OR tenant_id = current_tenant_id()
    OR (auth.role() = 'authenticated' AND customer_id = auth.uid())
  );

CREATE POLICY "leeway_requests_insert" ON public.leeway_requests FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "leeway_requests_write" ON public.leeway_requests FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());
