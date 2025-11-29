-- Enable RLS on all tables
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Allow authenticated users to view professional_services" ON public.professional_services;
DROP POLICY IF EXISTS "Allow authenticated users to view services" ON public.services;
DROP POLICY IF EXISTS "Professionals can manage their own data" ON public.professionals;
DROP POLICY IF EXISTS "Professionals can manage their services" ON public.professional_services;

-- Create simple SELECT policies for authenticated users
CREATE POLICY "Anyone can view professionals"
ON public.professionals FOR SELECT
USING (true);

CREATE POLICY "Anyone can view professional_services"
ON public.professional_services FOR SELECT
USING (true);

CREATE POLICY "Anyone can view services"
ON public.services FOR SELECT
USING (true);

-- Allow professionals to manage their own data
CREATE POLICY "Professionals can update their own profile"
ON public.professionals FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Professionals can manage their own services"
ON public.professional_services FOR ALL
TO authenticated
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);
