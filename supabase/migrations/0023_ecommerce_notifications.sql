-- =============================================
-- E-commerce Activity Notifications
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add missing columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 2. RLS policy for user-specific notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- 3. Helper: Get admin user IDs
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS TABLE(user_id uuid)
LANGUAGE sql STABLE AS $$
    SELECT id FROM profiles WHERE role IN ('Admin', 'Super Admin');
$$;

-- 4. New order notification
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
    pkg_name text;
BEGIN
    SELECT name INTO pkg_name FROM service_packages WHERE id = NEW.package_id;
    
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link, read)
        VALUES (NEW.user_id, '🛒 Order Placed!', 
                'Order #' || NEW.order_number || ' for ' || COALESCE(pkg_name, 'product'),
                'success', '/dashboard/account', false);
    END IF;
    
    INSERT INTO notifications (user_id, title, message, type, link, read)
    SELECT admin_id, '📦 New Order', 
           'Order #' || NEW.order_number || ' - ₹' || (NEW.total_amount / 100)::text,
           'info', '/dashboard/orders', false
    FROM get_admin_user_ids() AS admin_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- 5. Order status change notification
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;
    
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link, read)
        VALUES (NEW.user_id, 
                CASE NEW.status 
                    WHEN 'completed' THEN '✅ Order Completed'
                    WHEN 'cancelled' THEN '❌ Order Cancelled'
                    ELSE '📋 Order Updated'
                END,
                'Order #' || NEW.order_number || ' is now ' || UPPER(NEW.status),
                CASE WHEN NEW.status = 'completed' THEN 'success'
                     WHEN NEW.status = 'cancelled' THEN 'error'
                     ELSE 'info' END,
                '/dashboard/account', false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS order_status_notification ON orders;
CREATE TRIGGER order_status_notification
AFTER UPDATE OF status ON orders FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();

-- 6. Payment notification
CREATE OR REPLACE FUNCTION notify_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, link, read)
            VALUES (NEW.user_id, '💳 Payment Successful!', 
                    'Payment of ₹' || (NEW.amount / 100)::text || ' received',
                    'success', '/dashboard/account', false);
        END IF;
        
        INSERT INTO notifications (user_id, title, message, type, link, read)
        SELECT admin_id, '💰 Payment Received', 
               'Payment #' || NEW.payment_number || ' - ₹' || (NEW.amount / 100)::text,
               'success', '/dashboard/payment', false
        FROM get_admin_user_ids() AS admin_id;
    END IF;
    
    IF NEW.status = 'failed' AND (TG_OP = 'INSERT' OR OLD.status != 'failed') THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, link, read)
            VALUES (NEW.user_id, '❌ Payment Failed', 
                    'Payment could not be processed', 'error', '/dashboard/account', false);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_payment ON payments;
CREATE TRIGGER trigger_notify_payment
AFTER INSERT OR UPDATE OF status ON payments FOR EACH ROW EXECUTE FUNCTION notify_payment_status();

-- 7. Subscription notification
CREATE OR REPLACE FUNCTION notify_subscription_change()
RETURNS TRIGGER AS $$
DECLARE pkg_name text;
BEGIN
    SELECT name INTO pkg_name FROM service_packages WHERE id = NEW.package_id;
    
    IF TG_OP = 'INSERT' OR (NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active')) THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, link, read)
            VALUES (NEW.user_id, '🎉 Subscription Active!', 
                    COALESCE(pkg_name, 'Subscription') || ' activated',
                    'success', '/dashboard/account', false);
        END IF;
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, link, read)
            VALUES (NEW.user_id, '⚠️ Subscription Cancelled', 
                    COALESCE(pkg_name, 'Subscription') || ' cancelled',
                    'warning', '/dashboard/account', false);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_subscription ON subscriptions;
CREATE TRIGGER trigger_notify_subscription
AFTER INSERT OR UPDATE OF status ON subscriptions FOR EACH ROW EXECUTE FUNCTION notify_subscription_change();

-- 8. Invoice notification  
CREATE OR REPLACE FUNCTION notify_invoice_created()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, link, read)
        VALUES (NEW.user_id, '📄 Invoice Ready', 
                'Invoice #' || NEW.invoice_number || ' - ₹' || (NEW.total_amount / 100)::text,
                'info', '/dashboard/account', false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_invoice ON invoices;
CREATE TRIGGER trigger_notify_invoice
AFTER INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION notify_invoice_created();

SELECT 'E-commerce notifications enabled!' as status;
