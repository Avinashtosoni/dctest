-- =============================================
-- Form Submissions & Contact Messages System
-- =============================================

-- =============================================
-- FORM TYPES ENUM
-- =============================================
DO $$ BEGIN
    CREATE TYPE form_type AS ENUM ('contact', 'quote', 'seo_audit', 'newsletter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- SUBMISSION STATUS ENUM
-- =============================================
DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('new', 'read', 'replied', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- FORM SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Form Information
    form_type form_type NOT NULL,
    status submission_status DEFAULT 'new',
    
    -- Common Fields
    name text,
    email text NOT NULL,
    phone text,
    
    -- Contact Form Specific
    first_name text,
    last_name text,
    subject text,
    message text,
    
    -- Quote Form Specific
    service text,
    guaranteed_results boolean DEFAULT false,
    premium_support boolean DEFAULT false,
    
    -- SEO Audit Form Specific
    website_url text,
    industry text,
    
    -- Additional Data (JSON for flexibility)
    metadata jsonb DEFAULT '{}',
    
    -- Admin Notes
    admin_notes text,
    replied_at timestamptz,
    replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Tracking
    user_agent text,
    ip_address inet,
    referrer text,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON public.form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON public.form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public forms can submit)
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit forms"
    ON public.form_submissions FOR INSERT
    WITH CHECK (true);

-- Only Admins can view all submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;
CREATE POLICY "Admins can view all submissions"
    ON public.form_submissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Only Admins can update submissions
DROP POLICY IF EXISTS "Admins can update submissions" ON public.form_submissions;
CREATE POLICY "Admins can update submissions"
    ON public.form_submissions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Only Admins can delete submissions
DROP POLICY IF EXISTS "Admins can delete submissions" ON public.form_submissions;
CREATE POLICY "Admins can delete submissions"
    ON public.form_submissions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_form_submission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_form_submissions_updated_at ON public.form_submissions;
CREATE TRIGGER trigger_form_submissions_updated_at
    BEFORE UPDATE ON public.form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_form_submission_updated_at();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get submission counts by status
CREATE OR REPLACE FUNCTION public.get_submission_stats()
RETURNS TABLE (
    total_submissions bigint,
    new_submissions bigint,
    read_submissions bigint,
    replied_submissions bigint,
    archived_submissions bigint,
    contact_forms bigint,
    quote_forms bigint,
    seo_audit_forms bigint,
    newsletter_forms bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::bigint as total_submissions,
        COUNT(*) FILTER (WHERE status = 'new')::bigint as new_submissions,
        COUNT(*) FILTER (WHERE status = 'read')::bigint as read_submissions,
        COUNT(*) FILTER (WHERE status = 'replied')::bigint as replied_submissions,
        COUNT(*) FILTER (WHERE status = 'archived')::bigint as archived_submissions,
        COUNT(*) FILTER (WHERE form_type = 'contact')::bigint as contact_forms,
        COUNT(*) FILTER (WHERE form_type = 'quote')::bigint as quote_forms,
        COUNT(*) FILTER (WHERE form_type = 'seo_audit')::bigint as seo_audit_forms,
        COUNT(*) FILTER (WHERE form_type = 'newsletter')::bigint as newsletter_forms
    FROM public.form_submissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admins
GRANT EXECUTE ON FUNCTION public.get_submission_stats() TO authenticated;
