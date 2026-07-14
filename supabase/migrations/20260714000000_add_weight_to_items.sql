-- ============================================================
-- 20260714000000_add_weight_to_items.sql
-- Adds a weight column to the items table for dynamic weight-based shipping.
-- ============================================================

ALTER TABLE public.items ADD COLUMN weight NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
