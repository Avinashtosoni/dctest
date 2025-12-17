-- =============================================
-- Applications Management System
-- =============================================

-- Create status enum
DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM ('Active', 'Maintenance', 'Inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Applications table for managing integrated tools/apps
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name text NOT NULL,
    description text,
    icon text, -- Icon name from lucide-react
    
    -- Metrics
    users integer DEFAULT 0, -- Monthly user count
    trend text, -- Percentage growth (e.g., "+12%")
    
    -- Status & Styling
    status application_status DEFAULT 'Active',
    color text, -- CSS classes for icon styling
    url text, -- Optional link to the application
    
    -- Display Settings
    visible boolean DEFAULT true,
    display_order integer DEFAULT 0,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_visible ON public.applications(visible);
CREATE INDEX IF NOT EXISTS idx_applications_display_order ON public.applications(display_order);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Public can view visible applications
DROP POLICY IF EXISTS "Anyone can view visible applications" ON public.applications;
CREATE POLICY "Anyone can view visible applications"
    ON public.applications FOR SELECT
    USING (visible = true);

-- Admins can manage all applications
DROP POLICY IF EXISTS "Admins can manage applications" ON public.applications;
CREATE POLICY "Admins can manage applications"
    ON public.applications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
        )
    );

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON public.applications;
CREATE TRIGGER trigger_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_application_updated_at();

-- =============================================
-- SEED DATA
-- =============================================
-- Insert initial applications from mock data

INSERT INTO public.applications (id, name, description, icon, users, trend, status, color, display_order, visible)
VALUES
    (
        'a1b2c3d4-5678-90ab-cdef-111111111111',
        'Passport Photo Maker',
        'Create compliant passport and ID photos instantly.',
        'ImageIcon',
        1200,
        '+12%',
        'Active',
        'text-blue-600 bg-blue-50',
        1,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-222222222222',
        'ID Card Generator',
        'Generate professional employee and visitor ID cards.',
        'CreditCard',
        850,
        '+5%',
        'Active',
        'text-purple-600 bg-purple-50',
        2,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-333333333333',
        'SEO Analysis',
        'Deep dive into website performance and SEO metrics.',
        'SearchIcon',
        2400,
        '+24%',
        'Active',
        'text-green-600 bg-green-50',
        3,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-444444444444',
        'Social Media Check',
        'Verify and analyze social media presence.',
        'Share2',
        1800,
        '+8%',
        'Active',
        'text-pink-600 bg-pink-50',
        4,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-555555555555',
        'ROI Calculator',
        'Calculate return on investment for marketing campaigns.',
        'Calculator',
        500,
        '+2%',
        'Maintenance',
        'text-orange-600 bg-orange-50',
        5,
        true
    )
ON CONFLICT (id) DO NOTHING;
