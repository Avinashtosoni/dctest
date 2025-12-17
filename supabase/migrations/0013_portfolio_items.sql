-- =============================================
-- Portfolio Items Management System
-- =============================================

-- Portfolio Items table for managing case studies and portfolio
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    title text NOT NULL,
    client text NOT NULL,
    category text NOT NULL,
    image text,
    description text,
    
    -- Project Details
    role text,
    duration text,
    date date,
    website text,
    
    -- Case Study Content
    challenge text,
    solution text,
    results text[], -- Array of result strings
    tags text[], -- Array of tags
    technologies text[], -- Array of technologies used
    gallery text[], -- Array of image URLs
    
    -- Process (stored as JSONB)
    process jsonb,
    
    -- Testimonial (stored as JSONB)
    testimonial jsonb,
    
    -- Display Settings
    visible boolean DEFAULT true,
    display_order integer DEFAULT 0,
    featured boolean DEFAULT false,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_visible ON public.portfolio_items(visible);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_display_order ON public.portfolio_items(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_date ON public.portfolio_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_featured ON public.portfolio_items(featured) WHERE featured = true;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public can view visible portfolio items
DROP POLICY IF EXISTS "Anyone can view visible portfolio items" ON public.portfolio_items;
CREATE POLICY "Anyone can view visible portfolio items"
    ON public.portfolio_items FOR SELECT
    USING (visible = true);

-- Admins can manage all portfolio items
DROP POLICY IF EXISTS "Admins can manage portfolio items" ON public.portfolio_items;
CREATE POLICY "Admins can manage portfolio items"
    ON public.portfolio_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin', 'Social Media Manager')
        )
    );

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_portfolio_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER trigger_portfolio_items_updated_at
    BEFORE UPDATE ON public.portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_portfolio_item_updated_at();

-- =============================================
-- SEED DATA
-- =============================================
-- Insert initial portfolio items from mock data

INSERT INTO public.portfolio_items (id, title, client, category, image, description, role, duration, date, website, challenge, solution, results, tags, technologies, gallery, process, testimonial, visible, display_order, featured)
VALUES
    (
        'a1b2c3d4-5678-90ab-cdef-000000000001',
        'TechFlow SaaS Growth',
        'TechFlow Inc.',
        'SEO & PPC',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        'Increased organic traffic by 300% and reduced CPA by 40% for a B2B SaaS platform through a data-driven SEO and PPC strategy.',
        'Growth Partner',
        '6 Months',
        '2023-11-15',
        'https://techflow.example.com',
        'TechFlow was struggling with high customer acquisition costs (CPA) and low organic visibility in a highly competitive SaaS market.',
        'We implemented a comprehensive SEO strategy focusing on long-tail, high-intent keywords better suited for B2B decision makers.',
        ARRAY['300% Traffic Increase', '40% Lower CPA', '2.5x ROI', '150% Lead Quality Improvement'],
        ARRAY['SaaS', 'B2B', 'SEO', 'PPC', 'Growth'],
        ARRAY['Google Analytics 4', 'Semrush', 'Google Ads', 'HubSpot'],
        ARRAY[
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80'
        ],
        '[
            {"title": "Audit & Analysis", "description": "Conducted a deep-dive audit of existing campaigns."},
            {"title": "Strategy Formulation", "description": "Developed a dual-channel strategy."},
            {"title": "Execution", "description": "Rolled out on-page optimizations."}
        ]'::jsonb,
        '{"quote": "Digital Comrade transformed our acquisition engine.", "author": "Alex Rivera", "role": "CMO, TechFlow Inc."}'::jsonb,
        true,
        1,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-000000000002',
        'Luxe Living E-commerce',
        'Luxe Living',
        'Web Dev & Social',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=1200&q=80',
        'Complete Shopify redesign and Instagram campaign launch for a high-end luxury furniture brand.',
        'Full-Service Agency',
        '4 Months',
        '2023-10-01',
        null,
        'The brand''s website did not reflect its premium positioning, resulting in high bounce rates.',
        'We rebuilt the Shopify store with a "mobile-first" luxury aesthetic, focusing on visual storytelling.',
        ARRAY['$2M+ Revenue Generated', '150% Conv. Rate Lift', '50k New Followers', '28% AOV Increase'],
        ARRAY['E-commerce', 'Shopify', 'Instagram', 'Branding', 'UX/UI'],
        ARRAY['Shopify Plus', 'Klaviyo', 'Figma', 'React'],
        ARRAY[
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1616486029423-aaa478965c96?auto=format&fit=crop&w=800&q=80'
        ],
        '[
            {"title": "Brand Immersion", "description": "Studied the luxury furniture market."},
            {"title": "UX/UI Design", "description": "Designed a minimalist interface."},
            {"title": "Social Launch", "description": "Coordinated with 15 influencers."}
        ]'::jsonb,
        null,
        true,
        2,
        true
    ),
    (
        'a1b2c3d4-5678-90ab-cdef-000000000003',
        'FitLife App Launch',
        'FitLife',
        'App Marketing',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
        'Go-to-market strategy for a health & fitness mobile application, achieving top charts ranking.',
        'Marketing Lead',
        '3 Months',
        '2023-09-20',
        null,
        'Launching a new fitness app in a saturated market with high-quality users.',
        'Executed a "Challenge-Based" marketing campaign with ASO and viral social media.',
        ARRAY['10k Downloads in Month 1', '#1 App Store Ranking', '35% Retention Rate', '4.8 Star Average Rating'],
        ARRAY['Mobile App', 'ASO', 'Social Media', 'Wellness', 'Viral Marketing'],
        ARRAY['Adjust', 'TikTok Ads', 'Apple Search Ads', 'Figma'],
        ARRAY[
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
        ],
        '[
            {"title": "Market Positioning", "description": "Identified gap for busy professionals."},
            {"title": "ASO Overhaul", "description": "Optimized keywords and screenshots."},
            {"title": "Influencer Blitz", "description": "Partnered with 50 micro-influencers."}
        ]'::jsonb,
        '{"quote": "We went from zero to top charts in 30 days.", "author": "Mike Chen", "role": "Founder, FitLife"}'::jsonb,
        true,
        3,
        false
    )
ON CONFLICT (id) DO NOTHING;
