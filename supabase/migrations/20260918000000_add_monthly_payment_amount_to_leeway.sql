-- ============================================================
-- 20260918000000_add_monthly_payment_amount_to_leeway.sql
-- Adds monthly_payment_amount column to leeway_accounts and leeway_requests
-- ============================================================

ALTER TABLE public.leeway_accounts
ADD COLUMN IF NOT EXISTS monthly_payment_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.leeway_requests
ADD COLUMN IF NOT EXISTS monthly_payment_amount DECIMAL(12, 2) DEFAULT NULL;
