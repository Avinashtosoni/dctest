-- =============================================
-- Notification System Database Schema
-- =============================================

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Target type for notifications
DO $$ BEGIN
    CREATE TYPE notification_target_type AS ENUM ('everyone', 'role', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Main Notifications Table (admin-created)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    type notification_type DEFAULT 'info',
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type notification_target_type DEFAULT 'everyone',
    target_value text, -- role name or user_id, null for 'everyone'
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- User Notifications (junction table for read status)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    is_read boolean DEFAULT false,
    read_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, notification_id)
);

-- =============================================
-- Notification Templates (for system-generated)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    title_template text NOT NULL,
    message_template text NOT NULL,
    type notification_type DEFAULT 'info',
    trigger_event text NOT NULL, -- e.g., 'profile_update', 'purchase', 'billing'
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Notifications: Everyone can read, only Admin can create
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
CREATE POLICY "Anyone can view notifications"
    ON public.notifications FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- User Notifications: Users can only see/update their own
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications"
    ON public.user_notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
    ON public.user_notifications FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert user notifications" ON public.user_notifications;
CREATE POLICY "System can insert user notifications"
    ON public.user_notifications FOR INSERT
    WITH CHECK (true); -- Inserts happen via triggers or admin actions

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.user_notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.user_notifications FOR DELETE
    USING (user_id = auth.uid());

-- Templates: Everyone can view, only Admin can modify
DROP POLICY IF EXISTS "Anyone can view templates" ON public.notification_templates;
CREATE POLICY "Anyone can view templates"
    ON public.notification_templates FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.notification_templates;
CREATE POLICY "Admins can manage templates"
    ON public.notification_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- =============================================
-- Function: Create user_notifications for a new notification
-- =============================================
CREATE OR REPLACE FUNCTION public.distribute_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.target_type = 'everyone' THEN
        -- Insert for all users
        INSERT INTO public.user_notifications (user_id, notification_id)
        SELECT id, NEW.id FROM public.profiles;
    ELSIF NEW.target_type = 'role' THEN
        -- Insert for users with specific role
        INSERT INTO public.user_notifications (user_id, notification_id)
        SELECT id, NEW.id FROM public.profiles WHERE role::text = NEW.target_value;
    ELSIF NEW.target_type = 'user' THEN
        -- Insert for specific user
        INSERT INTO public.user_notifications (user_id, notification_id)
        VALUES (NEW.target_value::uuid, NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to distribute notification on insert
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.distribute_notification();

-- =============================================
-- Function: System notification on profile update
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    template_record RECORD;
    notif_id uuid;
BEGIN
    -- Find active template for profile_update
    SELECT * INTO template_record
    FROM public.notification_templates
    WHERE trigger_event = 'profile_update' AND is_active = true
    LIMIT 1;

    IF FOUND THEN
        -- Create notification directly for this user
        INSERT INTO public.notifications (title, message, type, target_type, target_value, created_by)
        VALUES (
            REPLACE(template_record.title_template, '{{user_name}}', COALESCE(NEW.full_name, NEW.email, 'User')),
            REPLACE(template_record.message_template, '{{user_name}}', COALESCE(NEW.full_name, NEW.email, 'User')),
            template_record.type,
            'user',
            NEW.id::text,
            NEW.id
        )
        RETURNING id INTO notif_id;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated_notify ON public.profiles;
CREATE TRIGGER on_profile_updated_notify
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.notify_profile_update();

-- =============================================
-- Seed default templates
-- =============================================
INSERT INTO public.notification_templates (name, title_template, message_template, type, trigger_event, is_active)
VALUES
    ('Profile Update', 'Profile Updated', 'Your profile was successfully updated.', 'success', 'profile_update', true),
    ('Welcome', 'Welcome to Digital Comrade!', 'Hello {{user_name}}, thank you for signing up!', 'info', 'signup', true),
    ('Purchase Complete', 'Purchase Confirmed', 'Your purchase of {{item_name}} has been confirmed.', 'success', 'purchase', false),
    ('Billing Reminder', 'Payment Due', 'Your payment of {{amount}} is due on {{due_date}}.', 'warning', 'billing', false)
ON CONFLICT (name) DO NOTHING;
