-- Fix Order Number Generation to Prevent Duplicates
-- Uses a loop to check for uniqueness instead of simple counter

-- Drop and recreate the generate_order_number function with uniqueness check
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    exists_check boolean;
BEGIN
    LOOP
        -- Get count for today's orders + 1
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.orders 
        WHERE order_number LIKE 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '%';
        
        -- Generate new number
        new_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
        
        -- Check if this number already exists
        SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_number) INTO exists_check;
        
        -- If it doesn't exist, we're good to go
        EXIT WHEN NOT exists_check;
        
        -- If it exists, increment counter and try again
        counter := counter + 1;
    END LOOP;
    
    RETURN new_number;
END;
$$;

-- Similarly fix payment number generation
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    exists_check boolean;
BEGIN
    LOOP
        -- Get count for today's payments + 1
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.payments 
        WHERE payment_number LIKE 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '%';
        
        -- Generate new number
        new_number := 'PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
        
        -- Check if this number already exists
        SELECT EXISTS(SELECT 1 FROM public.payments WHERE payment_number = new_number) INTO exists_check;
        
        -- If it doesn't exist, we're good
        EXIT WHEN NOT exists_check;
        
        -- Otherwise try next number
        counter := counter + 1;
    END LOOP;
    
    RETURN new_number;
END;
$$;

-- Fix invoice number generation
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_number text;
    counter integer;
    exists_check boolean;
BEGIN
    LOOP
        -- Get count for this year's invoices + 1
        SELECT COUNT(*) + 1 INTO counter 
        FROM public.invoices 
        WHERE invoice_number LIKE 'INV-' || TO_CHAR(now(), 'YYYY') || '%';
        
        -- Generate new number
        new_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::text, 5, '0');
        
        -- Check if this number already exists
        SELECT EXISTS(SELECT 1 FROM public.invoices WHERE invoice_number = new_number) INTO exists_check;
        
        -- If unique, we're done
        EXIT WHEN NOT exists_check;
        
        -- Otherwise increment
        counter := counter + 1;
    END LOOP;
    
    RETURN new_number;
END;
$$;
