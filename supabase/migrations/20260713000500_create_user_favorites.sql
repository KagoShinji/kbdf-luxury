-- ============================================================
-- 20260713000500_create_user_favorites.sql
-- Create user_favorites table for saving items
-- ============================================================

CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can only view their own favorites
CREATE POLICY "user_favorites_select" ON public.user_favorites FOR SELECT
  USING (user_id = auth.uid() AND (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL));

-- Insert policy: Users can only add their own favorites
CREATE POLICY "user_favorites_insert" ON public.user_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid() AND (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL));

-- Delete policy: Users can only remove their own favorites
CREATE POLICY "user_favorites_delete" ON public.user_favorites FOR DELETE
  USING (user_id = auth.uid() AND (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL));
