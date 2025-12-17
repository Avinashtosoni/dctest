-- Create roles table for role management in admin dashboard
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text,
    permissions text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Everyone can view roles
DROP POLICY IF EXISTS "Roles are viewable by everyone" ON public.roles;
CREATE POLICY "Roles are viewable by everyone"
    ON public.roles FOR SELECT
    USING (true);

-- Only Admins and Super Admins can insert roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
CREATE POLICY "Admins can insert roles"
    ON public.roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Only Admins and Super Admins can update roles
DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
CREATE POLICY "Admins can update roles"
    ON public.roles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Only Admins and Super Admins can delete roles
DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;
CREATE POLICY "Admins can delete roles"
    ON public.roles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Insert default roles based on existing user_role enum
INSERT INTO public.roles (name, description, permissions) VALUES
    ('Super Admin', 'Full access to all resources and system settings.', ARRAY['view_dashboard', 'manage_users', 'manage_content', 'manage_settings', 'view_reports', 'manage_system']),
    ('Admin', 'Full access to all resources and settings.', ARRAY['view_dashboard', 'manage_users', 'manage_content', 'manage_settings', 'view_reports']),
    ('Developer', 'Access to development tools and code management.', ARRAY['view_dashboard', 'manage_content', 'view_reports']),
    ('Social Media Manager', 'Manage social media content and campaigns.', ARRAY['view_dashboard', 'manage_content', 'view_reports']),
    ('Client', 'VIP access to project deliverables and priority support.', ARRAY['view_dashboard', 'view_reports', 'manage_content']),
    ('Customer', 'Access to project status and relevant reports.', ARRAY['view_dashboard', 'view_reports']),
    ('Visitor', 'Read-only access to dashboard.', ARRAY['view_dashboard'])
ON CONFLICT (name) DO NOTHING;

-- Add policy for admins to delete profiles (for user management)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- Add policy for admins to insert profiles (for inviting users)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );
