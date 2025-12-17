-- STEP 1: Find and fix existing duplicate order numbers in database
-- Run these queries in Supabase SQL Editor

-- 1. Check if there are duplicate order numbers
SELECT order_number, COUNT(*) as count
FROM orders
GROUP BY order_number
HAVING COUNT(*) > 1;

-- 2. View all orders with their numbers (to see the pattern)
SELECT id, order_number, created_at, user_id
FROM orders
ORDER BY created_at DESC
LIMIT 20;

-- 3. If duplicates exist, update them with unique numbers
-- This adds a suffix to make them unique
UPDATE orders
SET order_number = order_number || '-' || id::text
WHERE order_number IN (
    SELECT order_number
    FROM orders
    GROUP BY order_number
    HAVING COUNT(*) > 1
);

-- 4. Verify the function is properly installed
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_order_number';

-- 5. Test the function manually
SELECT generate_order_number();
SELECT generate_order_number();
SELECT generate_order_number();
-- All three should return different numbers

-- 6. If function isn't updated, force recreate it
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    exists_check boolean;
    max_attempts integer := 100;
    attempt integer := 0;
BEGIN
    LOOP
        attempt := attempt + 1;
        
        -- Prevent infinite loop
        IF attempt > max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique order number after % attempts', max_attempts;
        END IF;
        
        -- Count today's orders
        SELECT COALESCE(COUNT(*), 0) + attempt INTO counter 
        FROM public.orders 
        WHERE order_number LIKE 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '%';
        
        -- Generate number
        new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
        
        -- Check if exists
        SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_number) INTO exists_check;
        
        -- Exit if unique
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN new_number;
END;
$$;
