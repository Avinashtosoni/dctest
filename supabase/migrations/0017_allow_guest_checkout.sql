-- =============================================
-- Fix user_id Column to Allow Guest Checkout
-- Makes user_id NULLABLE in orders and payments tables
-- =============================================

-- Make user_id nullable in orders table
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in payments table
ALTER TABLE public.payments 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining guest checkout support
COMMENT ON COLUMN public.orders.user_id IS 'User ID - NULL for guest checkout, UUID for registered users';
COMMENT ON COLUMN public.payments.user_id IS 'User ID - NULL for guest payments, UUID for registered users';
