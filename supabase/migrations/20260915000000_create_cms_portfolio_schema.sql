-- ==============================================================================
-- Migration: Create Isolated CMS Schema for Multi-Tenant Client Portfolios
-- Location: supabase/migrations/20260915000000_create_cms_portfolio_schema.sql
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS cms;

-- 1. Clients / Tenants Registry in CMS
CREATE TABLE IF NOT EXISTS cms.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Universal Inquiries (Franchise, Catering, Contact Leads)
CREATE TABLE IF NOT EXISTS cms.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES cms.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT DEFAULT 'general', -- 'franchise', 'bulk_order', 'general'
    message TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product / Menu Showcase
CREATE TABLE IF NOT EXISTS cms.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES cms.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Steamed Siomai', 'Fried Dimsum', 'Sauces & Drinks'
    description TEXT,
    price NUMERIC(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE cms.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms.products ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read tenants' AND tablename = 'tenants' AND schemaname = 'cms') THEN
        CREATE POLICY "Public read tenants" ON cms.tenants FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read products' AND tablename = 'products' AND schemaname = 'cms') THEN
        CREATE POLICY "Public read products" ON cms.products FOR SELECT USING (is_available = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public submit inquiries' AND tablename = 'inquiries' AND schemaname = 'cms') THEN
        CREATE POLICY "Public submit inquiries" ON cms.inquiries FOR INSERT WITH CHECK (tenant_id IS NOT NULL);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read inquiries' AND tablename = 'inquiries' AND schemaname = 'cms') THEN
        CREATE POLICY "Authenticated read inquiries" ON cms.inquiries FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'SuperAdmin manage all cms' AND tablename = 'tenants' AND schemaname = 'cms') THEN
        CREATE POLICY "SuperAdmin manage all cms" ON cms.tenants FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- 6. Seed Misis Siomai Tenant
INSERT INTO cms.tenants (id, name, industry, domain, settings)
VALUES (
    'misis-siomai',
    'Misis Siomai',
    'food',
    'misissiomai.com',
    '{
        "tagline": "Ang Paboritong Siomai ng Bayan - Authentic Dimsum & Food Cart Franchise",
        "phone": "+63 917 123 4567",
        "email": "franchise@misissiomai.com"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 7. Seed Misis Siomai Products
INSERT INTO cms.products (tenant_id, name, category, description, price, is_bestseller, display_order, image_url)
VALUES 
    ('misis-siomai', 'Classic Steamed Pork Siomai', 'Steamed Siomai', '100% pure tender pork with crisp jicama, steamed fresh daily in bamboo baskets.', 45.00, true, 1, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'),
    ('misis-siomai', 'Signature Beef Siomai', 'Steamed Siomai', 'Hearty savory beef blended with aromatic spices and sesame oil.', 50.00, true, 2, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80'),
    ('misis-siomai', 'Crispy Fried Japanese Nori Siomai', 'Fried Dimsum', 'Wrapped in premium roasted seaweed sheets and deep-fried to golden perfection.', 55.00, false, 3, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'),
    ('misis-siomai', 'Golden Fried Quail Egg Siomai', 'Fried Dimsum', 'Juicy savory meat wrapper stuffed with whole fresh boiled quail eggs.', 50.00, false, 4, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'),
    ('misis-siomai', 'Artisan Toasted Chili Garlic Oil (Bottle)', 'Sauces & Drinks', 'Slow-cooked toasted garlic flakes infused with hot native chili and sesame.', 120.00, true, 5, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'),
    ('misis-siomai', 'Iced Black Gulaman Cooler', 'Sauces & Drinks', 'Traditional refreshing brown sugar and grass jelly drink, served ice-cold.', 30.00, false, 6, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;
