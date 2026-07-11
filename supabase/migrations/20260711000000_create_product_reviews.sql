-- ============================================================
-- 20260711000000_create_product_reviews.sql
-- Create product_reviews table
-- ============================================================

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  size TEXT,
  color TEXT,
  is_verified_buyer BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can read approved reviews for the current tenant
CREATE POLICY "product_reviews_select" ON product_reviews FOR SELECT
  USING ((is_approved = true OR is_superadmin()) AND (tenant_id = current_tenant_id() OR current_tenant_id() IS NULL));

-- Insert policy: Anyone can submit a review
CREATE POLICY "product_reviews_insert" ON product_reviews FOR INSERT
  WITH CHECK (true);

-- Update/Delete policies: Only admin can update or delete
CREATE POLICY "product_reviews_update" ON product_reviews FOR UPDATE
  USING (is_superadmin() OR tenant_id = current_tenant_id());
  
CREATE POLICY "product_reviews_delete" ON product_reviews FOR DELETE
  USING (is_superadmin() OR tenant_id = current_tenant_id());
