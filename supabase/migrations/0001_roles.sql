-- Create a type for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'Visitor',
        'Customer',
        'Client',
        'Social Media Manager',
        'Developer',
        'Admin',
        'Super Admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table for public profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  role user_role default 'Visitor'::user_role,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first to ensure idempotency)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Check if any profiles exist
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

  IF is_first_user THEN
    -- First user gets Super Admin role
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'Super Admin');
  ELSE
    -- Subsequent users get Visitor role
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'Visitor');
  END IF;

  RETURN new;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
