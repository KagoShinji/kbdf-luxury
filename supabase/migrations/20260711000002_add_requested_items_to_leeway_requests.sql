-- ============================================================
-- 20260711000002_add_requested_items_to_leeway_requests.sql
-- Adds requested_items column to leeway_requests.
-- ============================================================

ALTER TABLE public.leeway_requests 
  ADD COLUMN requested_items JSONB NOT NULL DEFAULT '[]'::jsonb;
