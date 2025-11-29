-- Add missing columns to professionals table
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_for_new_projects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make sure RLS is enabled
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can insert own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can update own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can delete own professional profile" ON public.professionals;

-- Create policies
CREATE POLICY "Users can view own professional profile"
  ON public.professionals FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own professional profile"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own professional profile"
  ON public.professionals FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own professional profile"
  ON public.professionals FOR DELETE
  USING (auth.uid() = id);
