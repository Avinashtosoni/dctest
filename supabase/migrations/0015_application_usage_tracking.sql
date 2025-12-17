-- =============================================
-- Application Usage Tracking System
-- =============================================
-- This migration adds usage tracking for applications

-- Application usage events table
CREATE TABLE IF NOT EXISTS public.application_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_duration integer, -- Duration in seconds
    completed boolean DEFAULT false, -- Whether the task was completed successfully
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_application_usage_app_id ON public.application_usage(application_id);
CREATE INDEX IF NOT EXISTS idx_application_usage_user_id ON public.application_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_application_usage_created_at ON public.application_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_usage_completed ON public.application_usage(completed);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.application_usage ENABLE ROW LEVEL SECURITY;

-- Anyone can insert usage events (for tracking)
DROP POLICY IF EXISTS "Anyone can insert usage events" ON public.application_usage;
CREATE POLICY "Anyone can insert usage events"
    ON public.application_usage FOR INSERT
    WITH CHECK (true);

-- Users can view their own usage
DROP POLICY IF EXISTS "Users can view their own usage" ON public.application_usage;
CREATE POLICY "Users can view their own usage"
    ON public.application_usage FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all usage
DROP POLICY IF EXISTS "Admins can view all usage" ON public.application_usage;
CREATE POLICY "Admins can view all usage"
    ON public.application_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- Create a view for application analytics
CREATE OR REPLACE VIEW public.application_analytics AS
SELECT 
    a.id,
    a.name,
    a.status,
    -- Total usage count (all time)
    COUNT(DISTINCT u.id) as total_uses,
    -- Monthly active users (last 30 days)
    COUNT(DISTINCT CASE 
        WHEN u.created_at >= NOW() - INTERVAL '30 days' 
        THEN u.user_id 
    END) as monthly_active_users,
    -- Average session duration
    ROUND(AVG(CASE 
        WHEN u.session_duration IS NOT NULL 
        THEN u.session_duration 
    END)) as avg_session_duration,
    -- Success rate
    CASE 
        WHEN COUNT(u.id) > 0 THEN
            ROUND((COUNT(CASE WHEN u.completed = true THEN 1 END)::numeric / COUNT(u.id)::numeric) * 100, 1)
        ELSE 0
    END as success_rate,
    -- Growth trend (compare this month vs last month)
    CASE 
        WHEN COUNT(DISTINCT CASE 
            WHEN u.created_at >= NOW() - INTERVAL '60 days' 
            AND u.created_at < NOW() - INTERVAL '30 days'
            THEN u.user_id 
        END) > 0 THEN
            CONCAT('+', ROUND(
                ((COUNT(DISTINCT CASE 
                    WHEN u.created_at >= NOW() - INTERVAL '30 days' 
                    THEN u.user_id 
                END)::numeric - 
                COUNT(DISTINCT CASE 
                    WHEN u.created_at >= NOW() - INTERVAL '60 days' 
                    AND u.created_at < NOW() - INTERVAL '30 days'
                    THEN u.user_id 
                END)::numeric) / 
                COUNT(DISTINCT CASE 
                    WHEN u.created_at >= NOW() - INTERVAL '60 days' 
                    AND u.created_at < NOW() - INTERVAL '30 days'
                    THEN u.user_id 
                END)::numeric) * 100
            ), '%')
        ELSE '+0%'
    END as trend
FROM public.applications a
LEFT JOIN public.application_usage u ON a.id = u.application_id
GROUP BY a.id, a.name, a.status;

-- Grant access to the view
GRANT SELECT ON public.application_analytics TO authenticated;

-- Create a view for overall dashboard stats
CREATE OR REPLACE VIEW public.application_dashboard_stats AS
SELECT
    -- Total usage this month
    (SELECT COUNT(*) FROM public.application_usage 
     WHERE created_at >= DATE_TRUNC('month', NOW())) as total_monthly_usage,
    
    -- Unique users today
    (SELECT COUNT(DISTINCT user_id) FROM public.application_usage 
     WHERE created_at >= DATE_TRUNC('day', NOW())) as active_users_today,
    
    -- Average session duration (overall)
    (SELECT ROUND(AVG(session_duration)) FROM public.application_usage 
     WHERE session_duration IS NOT NULL 
     AND created_at >= NOW() - INTERVAL '30 days') as avg_session_seconds,
    
    -- Overall success rate
    (SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(CASE WHEN completed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1)
            ELSE 0
        END
     FROM public.application_usage 
     WHERE created_at >= NOW() - INTERVAL '30 days') as success_rate;

-- Grant access to the view
GRANT SELECT ON public.application_dashboard_stats TO authenticated;
