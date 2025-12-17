-- Migration: Add product_type column and allow users to create orders
-- This migration enables products in the e-commerce system

-- Add product_type column to service_packages if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_packages' AND column_name = 'product_type'
    ) THEN
        ALTER TABLE public.service_packages 
        ADD COLUMN product_type text DEFAULT 'service' 
        CHECK (product_type IN ('service', 'product'));
    END IF;
END $$;

-- Add stock column for products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_packages' AND column_name = 'stock'
    ) THEN
        ALTER TABLE public.service_packages ADD COLUMN stock integer DEFAULT NULL;
    END IF;
END $$;

-- Add payment_method column to orders for cash payments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_method text DEFAULT 'online';
    END IF;
END $$;

-- Add payment_approved_by column for cash payment approvals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_approved_by'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_approved_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Add payment_approved_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_approved_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_approved_at timestamptz;
    END IF;
END $$;

-- Allow authenticated users to create their own orders
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to create their own payments
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
CREATE POLICY "Users can create own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Index for product_type
CREATE INDEX IF NOT EXISTS idx_service_packages_product_type ON public.service_packages(product_type);
