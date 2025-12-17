-- Fix invoices table: Allow NULL user_id for guest checkouts
-- The invoices table currently requires user_id but guest checkouts don't have a user

-- Make user_id nullable
ALTER TABLE public.invoices 
ALTER COLUMN user_id DROP NOT NULL;

-- Add an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);

-- Update RLS policy to handle NULL user_id for guest invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;

-- Recreate with handling for guest invoices (simplified without is_admin function)
CREATE POLICY "Users can view own invoices"
    ON public.invoices FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Admin', 'Super Admin')
        )
    );

-- Insert policy for invoice creation
DROP POLICY IF EXISTS "Users can create own invoices" ON public.invoices;
CREATE POLICY "Users can create own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('Admin', 'Super Admin')
        )
    );
