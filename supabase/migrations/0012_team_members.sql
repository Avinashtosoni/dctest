-- =============================================
-- Team Members Management System
-- =============================================

-- Team Members table for managing company team
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image text,
    
    -- Status
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave')),
    
    -- Social Links
    linkedin text,
    twitter text,
    github text,
    email text,
    
    -- Display Order
    display_order integer DEFAULT 0,
    
    -- Visibility
    visible boolean DEFAULT true,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_visible ON public.team_members(visible);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON public.team_members(display_order);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public can view visible team members
DROP POLICY IF EXISTS "Anyone can view visible team members" ON public.team_members;
CREATE POLICY "Anyone can view visible team members"
    ON public.team_members FOR SELECT
    USING (visible = true);

-- Admins can manage all team members
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members"
    ON public.team_members FOR ALL
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
CREATE OR REPLACE FUNCTION public.update_team_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON public.team_members;
CREATE TRIGGER trigger_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_member_updated_at();

-- =============================================
-- SEED DATA
-- =============================================
-- Insert initial team members from AboutPage data

INSERT INTO public.team_members (id, name, role, bio, image, status, linkedin, twitter, email, display_order, visible)
VALUES
    (
        'a1b2c3d4-5678-90ab-cdef-111111111111',
        'Sarah Johnson',
        'CEO & Founder',
        'Sarah founded Digital Comrade with a vision to bridge the gap between creative storytelling and data-driven marketing. With over 15 years of experience in the digital landscape, she has led campaigns for Fortune 500 companies and startups alike. She believes in "Radical Transparency" and building long-term partnerships over quick wins.',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        'Active',
        '#',
        '#',
        'sarah@digitalcomrade.com',
        1,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-222222222222',
        'Michael Chen',
        'Head of Strategy',
        'Michael is the analytical brain behind our most successful campaigns. A former data scientist, he specializes in turning complex datasets into actionable marketing strategies. He ensures that every dollar spent generates a measurable return on investment.',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        'Active',
        '#',
        '#',
        'michael@digitalcomrade.com',
        2,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-333333333333',
        'Emily Rodriguez',
        'Creative Director',
        'Emily leads our creative powerhouse, ensuring that every visual and piece of content resonates with the target audience. Her designs are not just beautiful—they are functional and conversion-focused. She brings a unique blend of artistic flair and user experience principles to the table.',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'Active',
        '#',
        '#',
        'emily@digitalcomrade.com',
        3,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-444444444444',
        'David Kim',
        'Tech Lead',
        'David oversees all technical aspects of our projects, from website development to custom tool creation. A full-stack wizard, he ensures our clients'' digital infrastructure is robust, fast, and scalable. He loves automating boring tasks and optimizing page load speeds.',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        'Active',
        '#',
        '#',
        'david@digitalcomrade.com',
        4,
        true
    )
ON CONFLICT (id) DO NOTHING;
