-- ==============================================================================
-- Migration: Add business_type column to public.tenants
-- Location: supabase/migrations/20260915000001_add_business_type_to_tenants.sql
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenants' 
          AND column_name = 'business_type'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN business_type TEXT DEFAULT 'e-commerce';
    END IF;
END $$;
