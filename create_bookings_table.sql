-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_amount DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can update their booking status" ON public.bookings;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Professionals can view bookings for them
CREATE POLICY "Professionals can view their bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals WHERE id = auth.uid()
  )
);

-- Professionals can update status of their bookings
CREATE POLICY "Professionals can update their booking status"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals WHERE id = auth.uid()
  )
);

-- Create RLS policies for other tables if they don't exist
-- Allow all authenticated users to view professionals
DROP POLICY IF EXISTS "Allow authenticated users to view professionals" ON public.professionals;
CREATE POLICY "Allow authenticated users to view professionals"
ON public.professionals FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to view professional_services
DROP POLICY IF EXISTS "Allow authenticated users to view professional_services" ON public.professional_services;
CREATE POLICY "Allow authenticated users to view professional_services"
ON public.professional_services FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to view services
DROP POLICY IF EXISTS "Allow authenticated users to view services" ON public.services;
CREATE POLICY "Allow authenticated users to view services"
ON public.services FOR SELECT
TO authenticated
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
