-- Fix professionals table
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

-- Fix jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS budget NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on both tables
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for professionals
DROP POLICY IF EXISTS "Users can view own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can insert own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can update own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can delete own professional profile" ON public.professionals;

-- Create policies for professionals
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

-- Drop existing policies for jobs
DROP POLICY IF EXISTS "Professionals can view their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients can view their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Professionals can update their jobs" ON public.jobs;

-- Create policies for jobs
CREATE POLICY "Professionals can view their jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view their jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Users can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Professionals can update their jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = professional_id OR auth.uid() = client_id);
