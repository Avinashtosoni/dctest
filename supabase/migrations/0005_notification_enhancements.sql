-- =============================================
-- Notification System Database Schema Update
-- Adding: priority, category, action buttons, attachments, expiry
-- Adding: E-commerce notification templates
-- =============================================

-- Priority enum
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Category enum for e-commerce
DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM ('general', 'order', 'shipping', 'payment', 'promotion', 'account', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Add new columns to notifications table
-- =============================================
-- Add priority column
DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN priority notification_priority DEFAULT 'normal';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add category column
DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN category notification_category DEFAULT 'general';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add action button columns
DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN action_url text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN action_label text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add attachment columns
DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN attachment_url text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN attachment_name text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN attachment_type text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add expiry column
DO $$ BEGIN
    ALTER TABLE public.notifications ADD COLUMN expires_at timestamptz;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- =============================================
-- Add new columns to notification_templates table
-- =============================================
DO $$ BEGIN
    ALTER TABLE public.notification_templates ADD COLUMN priority notification_priority DEFAULT 'normal';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.notification_templates ADD COLUMN category notification_category DEFAULT 'general';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- =============================================
-- E-Commerce Notification Templates
-- =============================================
INSERT INTO public.notification_templates (name, title_template, message_template, type, priority, category, trigger_event, is_active)
VALUES
    -- Order Templates
    ('Order Placed', 'Order Confirmed! 🎉', 'Your order #{{order_id}} has been placed successfully. Total: {{order_total}}', 'success', 'high', 'order', 'order_placed', true),
    ('Order Shipped', 'Your Order is On Its Way! 🚚', 'Great news! Order #{{order_id}} has been shipped. Track your package: {{tracking_url}}', 'info', 'high', 'shipping', 'order_shipped', true),
    ('Order Delivered', 'Order Delivered! 📦', 'Your order #{{order_id}} has been delivered. We hope you enjoy your purchase!', 'success', 'normal', 'order', 'order_delivered', true),
    ('Order Cancelled', 'Order Cancelled', 'Order #{{order_id}} has been cancelled. Refund will be processed within 5-7 business days.', 'warning', 'high', 'order', 'order_cancelled', true),
    
    -- Payment Templates
    ('Payment Successful', 'Payment Received ✓', 'Payment of {{amount}} for order #{{order_id}} was successful.', 'success', 'normal', 'payment', 'payment_success', true),
    ('Payment Failed', 'Payment Failed', 'Your payment of {{amount}} could not be processed. Please try again or use a different payment method.', 'error', 'urgent', 'payment', 'payment_failed', true),
    ('Refund Processed', 'Refund Issued', 'A refund of {{amount}} has been processed for order #{{order_id}}. It may take 5-7 business days to appear in your account.', 'info', 'normal', 'payment', 'refund_issued', true),
    
    -- Shipping Templates
    ('Out for Delivery', 'Out for Delivery Today! 🏃', 'Your package is out for delivery! Order #{{order_id}} should arrive today.', 'info', 'high', 'shipping', 'out_for_delivery', true),
    ('Delivery Exception', 'Delivery Update', 'There was an issue with delivery of order #{{order_id}}. {{exception_reason}}', 'warning', 'high', 'shipping', 'delivery_exception', true),
    
    -- Promotion Templates
    ('Flash Sale', '⚡ Flash Sale Alert!', 'Limited time offer! Get {{discount_percent}}% off on {{category_name}}. Use code: {{promo_code}}', 'info', 'high', 'promotion', 'flash_sale', false),
    ('Abandoned Cart', 'You left something behind! 🛒', 'Your cart is waiting! Complete your purchase of {{item_count}} items before they sell out.', 'info', 'normal', 'promotion', 'cart_abandoned', false),
    ('Price Drop', '💰 Price Drop Alert!', 'Good news! An item on your wishlist is now on sale. {{item_name}} is now {{new_price}}!', 'success', 'normal', 'promotion', 'price_drop', false),
    ('Back in Stock', 'Back in Stock! 🎯', '{{item_name}} is back in stock! Hurry, limited quantities available.', 'success', 'high', 'promotion', 'back_in_stock', false),
    
    -- Account Templates
    ('Subscription Renewal', 'Subscription Renewing Soon', 'Your {{plan_name}} subscription will renew on {{renewal_date}} for {{amount}}.', 'info', 'normal', 'account', 'subscription_renewal', true),
    ('Password Changed', 'Password Updated', 'Your account password was successfully changed. If you did not make this change, contact support immediately.', 'warning', 'high', 'account', 'password_changed', true),
    ('New Login Detected', 'New Login Alert 🔐', 'A new login was detected on your account from {{device}} in {{location}}.', 'warning', 'high', 'account', 'new_login', true),
    
    -- Service Templates
    ('Service Activated', 'Service Activated ✅', 'Your {{service_name}} service has been activated and is ready to use.', 'success', 'normal', 'account', 'service_activated', true),
    ('Service Expiring', 'Service Expiring Soon', 'Your {{service_name}} service will expire on {{expiry_date}}. Renew now to continue uninterrupted access.', 'warning', 'high', 'account', 'service_expiring', true),
    ('Review Request', 'How was your experience? ⭐', 'We hope you''re enjoying {{item_name}}! Please take a moment to leave a review.', 'info', 'low', 'order', 'review_request', false)
ON CONFLICT (name) DO NOTHING;
