-- COMPREHENSIVE DATABASE SETUP FOR PROCONNECT
-- Run this in Supabase SQL Editor to set up all required tables and columns

-- ============================================
-- 1. FIX PROFESSIONALS TABLE
-- ============================================
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

-- ============================================
-- 2. FIX JOBS TABLE
-- ============================================
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

-- ============================================
-- 3. CREATE PROFESSIONAL_SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.professional_services (
  id SERIAL PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_title TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT false,
  rate NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint separately (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'professional_services_professional_id_service_id_key'
  ) THEN
    ALTER TABLE public.professional_services 
    ADD CONSTRAINT professional_services_professional_id_service_id_key 
    UNIQUE(professional_id, service_id);
  END IF;
END $$;

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================
-- Professionals policies
DROP POLICY IF EXISTS "Users can view own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can insert own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can update own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Users can delete own professional profile" ON public.professionals;

-- Jobs policies
DROP POLICY IF EXISTS "Professionals can view their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients can view their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Professionals can update their jobs" ON public.jobs;

-- Professional services policies
DROP POLICY IF EXISTS "Professionals can view their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can insert their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can update their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can delete their services" ON public.professional_services;
DROP POLICY IF EXISTS "Public can view active professional services" ON public.professional_services;

-- ============================================
-- 6. CREATE POLICIES FOR PROFESSIONALS TABLE
-- ============================================
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

-- ============================================
-- 7. CREATE POLICIES FOR JOBS TABLE
-- ============================================
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

-- ============================================
-- 8. CREATE POLICIES FOR PROFESSIONAL_SERVICES TABLE
-- ============================================
CREATE POLICY "Professionals can view their services"
  ON public.professional_services FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their services"
  ON public.professional_services FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their services"
  ON public.professional_services FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their services"
  ON public.professional_services FOR DELETE
  USING (auth.uid() = professional_id);

CREATE POLICY "Public can view active professional services"
  ON public.professional_services FOR SELECT
  USING (is_active = true);

-- ============================================
-- 9. CREATE UPDATE TRIGGERS
-- ============================================
-- Make sure the trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
DROP TRIGGER IF EXISTS update_professional_services_updated_at ON public.professional_services;

-- Create triggers for updated_at columns
CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_services_updated_at
  BEFORE UPDATE ON public.professional_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
