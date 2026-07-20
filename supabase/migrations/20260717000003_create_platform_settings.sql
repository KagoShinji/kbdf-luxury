-- ============================================================
-- 20260717000003_create_platform_settings.sql
-- Creates the platform_settings table to manage platform-wide
-- parameters dynamically, and seeds the default plans pricing list.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Select policy (everyone can view public configuration parameters)
CREATE POLICY "platform_settings_select" ON public.platform_settings FOR SELECT
  USING (true);

-- Write/Modify policy (only superadmins can adjust configurations)
CREATE POLICY "platform_settings_write" ON public.platform_settings FOR ALL
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- Seed initial pricing plans
INSERT INTO public.platform_settings (key, value)
VALUES (
  'pricing_plans',
  '[
    {
      "name": "Basic",
      "description": "For new boutique owners starting their luxury retail business.",
      "priceMonthly": 1499,
      "priceYearly": 1199,
      "features": [
        "Single Store Tenant (1 Brand)",
        "Up to 200 Catalog Products",
        "Standard Checkout Flow",
        "E-mail Order Notifications",
        "Shared DB Resources"
      ],
      "cta": "Launch Basic",
      "popular": false,
      "gradient": "from-slate-800 to-slate-900"
    },
    {
      "name": "Grow",
      "description": "The gold standard for growing luxury brands with high volumes.",
      "priceMonthly": 3999,
      "priceYearly": 3199,
      "features": [
        "Custom Brand Domain Bindings",
        "Unlimited Catalog Products",
        "Leeway Pre-Approval Installments",
        "Advanced Sales Reports & Analytics",
        "Inventory Reservation Timer Flow",
        "Multiple Admin Staff & Permissions",
        "Priority Customer Support"
      ],
      "cta": "Go Grow",
      "popular": true,
      "gradient": "from-brand-navy to-slate-950"
    },
    {
      "name": "Enterprise",
      "description": "Tailored database scale, SLA, and custom enterprise tools.",
      "priceMonthly": "Custom",
      "priceYearly": "Custom",
      "features": [
        "Dedicated Database Sharding",
        "White-glove Migrations & Store Setup",
        "99.9% Uptime SLA Agreement",
        "Custom API Integrations & Webhooks",
        "Unlimited Admin Staff & Accounts",
        "Dedicated Success Manager"
      ],
      "cta": "Contact Sales",
      "popular": false,
      "gradient": "from-slate-900 to-black"
    }
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;
