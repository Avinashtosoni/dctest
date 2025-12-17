-- =============================================
-- Complete Fix for Admin Dashboard & E-commerce Issues
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. FIX DUPLICATE ORDER NUMBERS
-- =============================================

-- Clean up existing duplicate order numbers
UPDATE orders
SET order_number = 'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || SUBSTRING(id::text, 1, 8)
WHERE order_number IN (
    SELECT order_number
    FROM orders
    GROUP BY order_number
    HAVING COUNT(*) > 1
);

-- Update order number generation function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
BEGIN
    -- Use random number to avoid collisions
    counter := FLOOR(RANDOM() * 9000 + 1000)::integer;
    new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || counter::text;
    
    -- Ensure uniqueness
    WHILE EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) LOOP
        counter := FLOOR(RANDOM() * 9000 + 1000)::integer;
        new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || counter::text;
    END LOOP;
    
    RETURN new_number;
END;
$$;

-- =============================================
-- 2. CREATE NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info',
    read boolean DEFAULT false,
    link text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 3. NOTIFICATION TRIGGERS
-- =============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for user when order status changes
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.user_id,
            'Order Status Updated',
            'Your order ' || NEW.order_number || ' is now ' || UPPER(NEW.status),
            CASE 
                WHEN NEW.status = 'completed' THEN 'success'
                WHEN NEW.status = 'cancelled' THEN 'error'
                WHEN NEW.status = 'processing' THEN 'info'
                ELSE 'info'
            END,
            '/dashboard/orders'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS order_status_notification ON orders;
CREATE TRIGGER order_status_notification
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();

-- =============================================
-- 4. INVOICE AUTO-GENERATION
-- =============================================

-- Function to auto-generate invoice
CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER AS $$
DECLARE
    inv_number text;
    inv_counter integer;
BEGIN
    -- Only create invoice for completed orders
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Generate invoice number
        SELECT COUNT(*) + 1 INTO inv_counter 
        FROM invoices 
        WHERE invoice_number LIKE 'INV-' || TO_CHAR(now(), 'YYYY') || '%';
        
        inv_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(inv_counter::text, 5, '0');
        
        -- Create invoice
        INSERT INTO invoices (
            order_id,
            invoice_number,
            issue_date,
            due_date,
            subtotal,
            tax_amount,
            total_amount,
            currency,
            status
        ) VALUES (
            NEW.id,
            inv_number,
            NEW.created_at,
            NEW.created_at + INTERVAL '30 days',
            NEW.subtotal,
            NEW.tax_amount,
            NEW.total_amount,
            NEW.currency,
            'paid'
        )
        ON CONFLICT (order_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach invoice trigger
DROP TRIGGER IF EXISTS create_invoice_on_completion ON orders;
CREATE TRIGGER create_invoice_on_completion
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_generate_invoice();

-- =============================================
-- 5. CREATE MISSING INVOICES FOR EXISTING ORDERS
-- =============================================

INSERT INTO invoices (
    order_id,
    invoice_number,
    issue_date,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    currency,
    status
)
SELECT 
    o.id,
    'INV-' || TO_CHAR(o.created_at, 'YYYY') || '-' || LPAD((ROW_NUMBER() OVER(ORDER BY o.created_at))::text, 5, '0'),
    o.created_at,
    o.created_at + INTERVAL '30 days',
    o.subtotal,
    o.tax_amount,
    o.total_amount,
    o.currency,
    CASE 
        WHEN o.status = 'completed' THEN 'paid'
        WHEN o.status = 'cancelled' THEN 'cancelled'
        ELSE 'pending'
    END
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM invoices WHERE order_id = o.id
)
ON CONFLICT (order_id) DO NOTHING;

-- =============================================
-- 6. VERIFY ADMIN ROLE (Optional - Update Your Email)
-- =============================================

-- IMPORTANT: Replace 'your@email.com' with your actual email
-- UPDATE profiles
-- SET role = 'Admin'
-- WHERE email = 'your@email.com';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check order count
SELECT 'Total Orders:' as info, COUNT(*) as count FROM orders;

-- Check invoice count
SELECT 'Total Invoices:' as info, COUNT(*) as count FROM invoices;

-- Check notification count
SELECT 'Total Notifications:' as info, COUNT(*) as count FROM notifications;

-- Check your admin role (if you updated it above)
-- SELECT 'Your Role:' as info, role FROM profiles WHERE email = 'your@email.com';

-- Done!
SELECT '✅ All fixes applied successfully!' as status;
