-- Custom Forms Builder System
-- Safe minimal version

-- Create field_type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'field_type') THEN
        CREATE TYPE field_type AS ENUM ('text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number', 'url', 'date');
    END IF;
END $$;

-- Create custom_forms table
CREATE TABLE IF NOT EXISTS public.custom_forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    shortcode text UNIQUE NOT NULL,
    fields jsonb NOT NULL DEFAULT '[]',
    submit_button_text text DEFAULT 'Submit',
    success_message text DEFAULT 'Thank you! Your submission has been received.',
    is_active boolean DEFAULT true,
    requires_email boolean DEFAULT true,
    enable_captcha boolean DEFAULT false,
    recipients jsonb DEFAULT '[]',
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    submission_count integer DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_forms_shortcode ON public.custom_forms(shortcode);
CREATE INDEX IF NOT EXISTS idx_custom_forms_is_active ON public.custom_forms(is_active);

-- Enable RLS
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active forms" ON public.custom_forms;
CREATE POLICY "Anyone can view active forms"
    ON public.custom_forms FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage forms" ON public.custom_forms;
CREATE POLICY "Admins can manage forms"
    ON public.custom_forms FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Admin', 'Super Admin')
        )
    );

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_custom_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_custom_forms_updated_at ON public.custom_forms;
CREATE TRIGGER trigger_custom_forms_updated_at
    BEFORE UPDATE ON public.custom_forms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_custom_form_updated_at();

-- Insert checkout form
INSERT INTO public.custom_forms (name, description, shortcode, fields, submit_button_text, recipients, requires_email)
VALUES (
    'Checkout Form',
    'Customer billing information for checkout',
    'form_checkout',
    '[{"name":"full_name","label":"Full Name","type":"text","required":true,"placeholder":"John Doe"},{"name":"email","label":"Email","type":"email","required":true,"placeholder":"john@example.com"},{"name":"phone","label":"Phone","type":"tel","required":true,"placeholder":"+91 9876543210"},{"name":"address_line1","label":"Address","type":"text","required":true,"placeholder":"Street address"},{"name":"city","label":"City","type":"text","required":true,"placeholder":"Mumbai"},{"name":"state","label":"State","type":"text","required":true,"placeholder":"Maharashtra"},{"name":"postal_code","label":"PIN Code","type":"text","required":true,"placeholder":"400001"},{"name":"country","label":"Country","type":"select","required":true,"options":["India","United States","United Kingdom","Canada","Australia"]},{"name":"notes","label":"Notes","type":"textarea","required":false,"placeholder":"Special instructions","rows":3}]'::jsonb,
    'Continue to Payment',
    '["Admin","Super Admin"]'::jsonb,
    true
)
ON CONFLICT (shortcode) DO UPDATE SET
    fields = EXCLUDED.fields;
