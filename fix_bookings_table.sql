-- Drop existing bookings table and recreate with correct schema
DROP TABLE IF EXISTS public.bookings CASCADE;

-- Create bookings table with correct columns matching the code
CREATE TABLE public.bookings (
  id SERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  budget NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can update their booking status" ON public.bookings;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Professionals can view bookings for them
CREATE POLICY "Professionals can view their bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

-- Professionals can update status of their bookings
CREATE POLICY "Professionals can update their booking status"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id);

-- Create indexes
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Ensure RLS policies exist for related tables
DROP POLICY IF EXISTS "Allow authenticated users to view professionals" ON public.professionals;
CREATE POLICY "Allow authenticated users to view professionals"
ON public.professionals FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to view professional_services" ON public.professional_services;
CREATE POLICY "Allow authenticated users to view professional_services"
ON public.professional_services FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to view services" ON public.services;
CREATE POLICY "Allow authenticated users to view services"
ON public.services FOR SELECT
TO authenticated
USING (true);
