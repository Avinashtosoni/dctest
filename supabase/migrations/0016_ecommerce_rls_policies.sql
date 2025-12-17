-- =============================================
-- Fix RLS Policies for E-commerce Tables
-- Allows guest checkout (user_id can be NULL)
-- =============================================

-- =============================================
-- ORDERS TABLE RLS
-- =============================================

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Allow users to view their own orders
-- Also allow viewing orders where user_id is NULL (guest orders) if they match the session
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT
USING (
    auth.uid() = user_id 
    OR auth.role() IN ('Admin', 'Super Admin')
    OR user_id IS NULL  -- Allow viewing guest orders
);

-- Allow anyone (including guests) to create orders
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT
WITH CHECK (true);  -- No restrictions on insert

-- Allow users to update their own orders (or guest orders)
CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR auth.role() IN ('Admin', 'Super Admin')
    OR user_id IS NULL
);

-- Allow only admins to delete orders
CREATE POLICY "Admins can delete orders" ON public.orders
FOR DELETE
USING (auth.role() IN ('Admin', 'Super Admin'));

-- =============================================
-- PAYMENTS TABLE RLS
-- =============================================

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

-- Allow users to view their own payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT
USING (
    auth.uid() = user_id 
    OR auth.role() IN ('Admin', 'Super Admin')
    OR user_id IS NULL  -- Allow viewing guest payments
);

-- Allow anyone (including guests) to create payments
CREATE POLICY "Anyone can create payments" ON public.payments
FOR INSERT
WITH CHECK (true);  -- No restrictions on insert

-- Allow users to update their own payments
CREATE POLICY "Users can update own payments" ON public.payments
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR auth.role() IN ('Admin', 'Super Admin')
    OR user_id IS NULL
);

-- Allow only admins to delete payments
CREATE POLICY "Admins can delete payments" ON public.payments
FOR DELETE
USING (auth.role() IN ('Admin', 'Super Admin'));

-- =============================================
-- SERVICE PACKAGES RLS (Read-Only for Public)
-- =============================================

-- Enable RLS on service_packages
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.service_packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.service_packages;

-- Allow anyone to view active packages
CREATE POLICY "Anyone can view active packages" ON public.service_packages
FOR SELECT
USING (is_active = true OR auth.role() IN ('Admin', 'Super Admin'));

-- Only admins can modify packages
CREATE POLICY "Admins can manage packages" ON public.service_packages
FOR ALL
USING (auth.role() IN ('Admin', 'Super Admin'));
