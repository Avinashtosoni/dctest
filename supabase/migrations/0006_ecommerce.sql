-- =============================================
-- E-commerce System Database Schema
-- For Service-based Business (Subscriptions & One-time)
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- Pricing type enum
DO $$ BEGIN
    CREATE TYPE pricing_type AS ENUM ('subscription', 'one_time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Billing cycle enum
DO $$ BEGIN
    CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription status enum
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order status enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service category enum
DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('social_media', 'website', 'app', 'marketing', 'design', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment gateway enum
DO $$ BEGIN
    CREATE TYPE payment_gateway_type AS ENUM ('razorpay', 'stripe', 'paypal', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- SERVICE PACKAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    short_description text,
    category service_category DEFAULT 'other',
    pricing_type pricing_type DEFAULT 'subscription',
    
    -- Pricing (in cents/paise for precision)
    currency text DEFAULT 'INR',
    monthly_price integer DEFAULT 0,
    quarterly_price integer,
    yearly_price integer,
    one_time_price integer,
    
    -- Support for one-time purchases
    support_duration_days integer DEFAULT 30,
    
    -- Features as JSON array
    features jsonb DEFAULT '[]',
    
    -- Display
    icon text,
    image_url text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    
    -- Limits
    max_users integer,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
    
    status subscription_status DEFAULT 'active',
    billing_cycle billing_cycle DEFAULT 'monthly',
    
    -- Amount in cents/paise
    amount integer NOT NULL,
    currency text DEFAULT 'INR',
    
    -- Billing dates
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz,
    next_billing_date timestamptz,
    
    -- Trial period
    trial_ends_at timestamptz,
    
    -- Cancellation
    cancelled_at timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    cancellation_reason text,
    
    -- Gateway info
    payment_gateway payment_gateway_type,
    gateway_subscription_id text,
    gateway_customer_id text,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- COUPONS TABLE (Must be created BEFORE orders table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    description text,
    
    -- Discount
    discount_type text DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value integer NOT NULL,
    
    -- Limits
    max_uses integer,
    uses_count integer DEFAULT 0,
    max_uses_per_user integer DEFAULT 1,
    
    -- Validity
    min_order_amount integer,
    valid_from timestamptz DEFAULT now(),
    valid_until timestamptz,
    
    -- Applicability
    applicable_packages uuid[] DEFAULT '{}',
    applicable_categories service_category[],
    
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- ORDERS TABLE (One-time purchases)
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
    
    status order_status DEFAULT 'pending',
    
    -- Pricing
    subtotal integer NOT NULL,
    discount_amount integer DEFAULT 0,
    tax_amount integer DEFAULT 0,
    total_amount integer NOT NULL,
    currency text DEFAULT 'INR',
    
    -- Coupon
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
    coupon_code text,
    
    -- Support period
    support_starts_at timestamptz,
    support_ends_at timestamptz,
    
    -- Notes
    notes text,
    admin_notes text,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number text UNIQUE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Reference to order or subscription
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    
    -- Amount
    amount integer NOT NULL,
    currency text DEFAULT 'INR',
    
    status payment_status DEFAULT 'pending',
    
    -- Payment method
    payment_gateway payment_gateway_type,
    payment_method text, -- card, upi, netbanking, wallet, etc.
    
    -- Gateway response
    gateway_payment_id text,
    gateway_order_id text,
    gateway_signature text,
    gateway_response jsonb DEFAULT '{}',
    
    -- Failure info
    failure_reason text,
    failure_code text,
    
    -- Refund info
    refunded_amount integer DEFAULT 0,
    refund_reason text,
    refunded_at timestamptz,
    
    -- Timestamps
    paid_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- PAYMENT GATEWAYS CONFIGURATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name payment_gateway_type UNIQUE NOT NULL,
    display_name text NOT NULL,
    description text,
    
    is_active boolean DEFAULT false,
    is_test_mode boolean DEFAULT true,
    
    -- Configuration (store API keys securely)
    config jsonb DEFAULT '{}',
    test_config jsonb DEFAULT '{}',
    
    -- Webhook
    webhook_url text,
    webhook_secret text,
    
    -- Supported methods
    supported_methods text[] DEFAULT '{}',
    supported_currencies text[] DEFAULT ARRAY['INR', 'USD'],
    
    -- Fees
    transaction_fee_percent numeric(5,2) DEFAULT 2.00,
    transaction_fee_fixed integer DEFAULT 0,
    
    icon_url text,
    sort_order integer DEFAULT 0,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number text UNIQUE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
    
    -- Billing info (snapshot at time of invoice)
    billing_name text,
    billing_email text,
    billing_address jsonb DEFAULT '{}',
    
    -- Amounts
    subtotal integer NOT NULL,
    discount_amount integer DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount integer DEFAULT 0,
    total_amount integer NOT NULL,
    currency text DEFAULT 'INR',
    
    -- Status
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void', 'overdue')),
    
    -- Dates
    invoice_date timestamptz DEFAULT now(),
    due_date timestamptz,
    paid_at timestamptz,
    
    -- Line items
    line_items jsonb DEFAULT '[]',
    
    -- PDF
    pdf_url text,
    
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id ON public.subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_service_packages_category ON public.service_packages(category);
CREATE INDEX IF NOT EXISTS idx_service_packages_is_active ON public.service_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Service Packages: Everyone can view active, Admin can manage
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.service_packages;
CREATE POLICY "Anyone can view active packages"
    ON public.service_packages FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage packages" ON public.service_packages;
CREATE POLICY "Admins can manage packages"
    ON public.service_packages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Subscriptions: Users see own, Admin sees all
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Orders: Users see own, Admin sees all
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
    ON public.orders FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Payments: Users see own, Admin sees all
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
    ON public.payments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Payment Gateways: Only Admin
DROP POLICY IF EXISTS "Admins can manage gateways" ON public.payment_gateways;
CREATE POLICY "Admins can manage gateways"
    ON public.payment_gateways FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Coupons: Anyone can view active, Admin can manage
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Invoices: Users see own, Admin sees all
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
    ON public.invoices FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices"
    ON public.invoices FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- =============================================
-- FUNCTIONS
-- =============================================

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM public.orders;
    new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
    RETURN new_number;
END;
$$;

-- Generate payment number
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM public.payments;
    new_number := 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
    RETURN new_number;
END;
$$;

-- Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM public.invoices;
    new_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::text, 5, '0');
    RETURN new_number;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_number();

-- Auto-generate payment number
CREATE OR REPLACE FUNCTION public.set_payment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := public.generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_payment_number ON public.payments;
CREATE TRIGGER trigger_set_payment_number
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_payment_number();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := public.generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_invoice_number ON public.invoices;
CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_invoice_number();

-- =============================================
-- SEED DATA - Payment Gateways
-- =============================================
INSERT INTO public.payment_gateways (name, display_name, description, supported_methods, supported_currencies, is_test_mode)
VALUES
    ('razorpay', 'Razorpay', 'Popular payment gateway in India', ARRAY['card', 'upi', 'netbanking', 'wallet'], ARRAY['INR'], true),
    ('stripe', 'Stripe', 'International payment processing', ARRAY['card'], ARRAY['USD', 'EUR', 'GBP', 'INR'], true),
    ('paypal', 'PayPal', 'Global payment platform', ARRAY['paypal', 'card'], ARRAY['USD', 'EUR', 'GBP'], true),
    ('manual', 'Manual/Bank Transfer', 'Direct bank transfer or cash', ARRAY['bank_transfer', 'cash', 'cheque'], ARRAY['INR', 'USD'], true)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED DATA - Sample Service Packages
-- =============================================
INSERT INTO public.service_packages (name, slug, description, short_description, category, pricing_type, currency, monthly_price, yearly_price, one_time_price, support_duration_days, features, is_featured, is_active, sort_order)
VALUES
    -- Social Media Management
    ('Social Media Starter', 'social-media-starter', 
     'Perfect for small businesses starting their social media journey. Includes content creation and basic engagement.',
     'Basic social media management for beginners',
     'social_media', 'subscription', 'INR', 
     499900, 4999000, NULL,
     30,
     '["5 posts per week", "2 platforms", "Basic analytics report", "Content calendar", "Email support"]',
     false, true, 1),
    
    ('Social Media Pro', 'social-media-pro', 
     'Comprehensive social media management with advanced strategies, paid ad management, and dedicated support.',
     'Complete social media solution for growing businesses',
     'social_media', 'subscription', 'INR', 
     999900, 9999000, NULL,
     30,
     '["Daily posts", "5 platforms", "Advanced analytics", "Paid ad management", "Competitor analysis", "24/7 support", "Monthly strategy calls"]',
     true, true, 2),
     
    -- Website Management
    ('Website Basic', 'website-basic', 
     'Essential website maintenance including security updates, backups, and basic support.',
     'Keep your website running smoothly',
     'website', 'subscription', 'INR', 
     299900, 2999000, NULL,
     30,
     '["Weekly backups", "Security updates", "Uptime monitoring", "Bug fixes", "Email support"]',
     false, true, 3),
    
    ('Website Premium', 'website-premium', 
     'Complete website care including unlimited changes, performance optimization, and priority support.',
     'Premium website management and development',
     'website', 'subscription', 'INR', 
     799900, 7999000, NULL,
     30,
     '["Daily backups", "Unlimited content updates", "Performance optimization", "SEO maintenance", "Priority support", "Monthly reports"]',
     true, true, 4),
     
    -- App Management
    ('App Maintenance', 'app-maintenance', 
     'Ongoing app maintenance including bug fixes, updates, and basic feature additions.',
     'Keep your app updated and running',
     'app', 'subscription', 'INR', 
     1499900, 14999000, NULL,
     30,
     '["Bug fixes", "OS updates compatibility", "Performance monitoring", "Basic feature updates", "App store management"]',
     false, true, 5),
    
    -- One-time Services
    ('Website Starter Pack', 'website-starter-pack', 
     'Get a professional 5-page website with modern design, mobile responsive, and SEO-ready.',
     'Launch your online presence',
     'website', 'one_time', 'INR', 
     NULL, NULL, 2499900,
     60,
     '["5 pages", "Mobile responsive", "Contact form", "Basic SEO", "Social media integration", "60 days support"]',
     false, true, 10),
    
    ('Brand Identity Package', 'brand-identity-package', 
     'Complete brand identity including logo, color palette, typography, and brand guidelines.',
     'Establish your brand identity',
     'design', 'one_time', 'INR', 
     NULL, NULL, 1499900,
     30,
     '["Logo design (3 concepts)", "Color palette", "Typography selection", "Brand guidelines PDF", "Business card design", "Social media kit"]',
     false, true, 11)
ON CONFLICT (slug) DO NOTHING;