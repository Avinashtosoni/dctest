-- Fix Payment Number Generation Race Condition
-- Uses random suffix to ensure uniqueness even with concurrent transactions

-- Recreate payment number generation with atomic uniqueness
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    random_suffix text;
    max_attempts integer := 100;
    attempt integer := 0;
BEGIN
    LOOP
        attempt := attempt + 1;
        
        -- Get count for today's payments
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.payments 
        WHERE payment_number LIKE 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '%';
        
        -- Generate random suffix to avoid collisions
        random_suffix := LPAD(floor(random() * 1000)::text, 3, '0');
        
        -- Generate new number with counter and random suffix
        new_number := 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0') || random_suffix;
        
        -- Check if this number already exists
        IF NOT EXISTS(SELECT 1 FROM public.payments WHERE payment_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        -- Safety exit after max attempts
        IF attempt >= max_attempts THEN
            -- Fallback to UUID-based suffix
            new_number := 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8);
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$;

-- Also fix order number generation with the same approach
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    random_suffix text;
    max_attempts integer := 100;
    attempt integer := 0;
BEGIN
    LOOP
        attempt := attempt + 1;
        
        -- Get count for today's orders
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.orders 
        WHERE order_number LIKE 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '%';
        
        -- Generate random suffix to avoid collisions
        random_suffix := LPAD(floor(random() * 1000)::text, 3, '0');
        
        -- Generate new number with counter and random suffix
        new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0') || random_suffix;
        
        -- Check if this number already exists
        IF NOT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        -- Safety exit after max attempts
        IF attempt >= max_attempts THEN
            new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8);
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$;

-- Fix invoice number generation as well
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    random_suffix text;
    max_attempts integer := 100;
    attempt integer := 0;
BEGIN
    LOOP
        attempt := attempt + 1;
        
        -- Get count for this year's invoices
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.invoices 
        WHERE invoice_number LIKE 'INV-' || TO_CHAR(now(), 'YYYY') || '%';
        
        -- Generate random suffix
        random_suffix := LPAD(floor(random() * 1000)::text, 3, '0');
        
        -- Generate new number
        new_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::text, 5, '0') || random_suffix;
        
        -- Check uniqueness
        IF NOT EXISTS(SELECT 1 FROM public.invoices WHERE invoice_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        -- Safety exit
        IF attempt >= max_attempts THEN
            new_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || substring(gen_random_uuid()::text, 1, 8);
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$;
