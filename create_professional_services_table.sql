-- Create professional_services table for managing services offered by professionals
CREATE TABLE IF NOT EXISTS public.professional_services (
  id SERIAL PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_title TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT false,
  rate NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, service_id)
);

-- Enable RLS
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Professionals can view their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can insert their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can update their services" ON public.professional_services;
DROP POLICY IF EXISTS "Professionals can delete their services" ON public.professional_services;
DROP POLICY IF EXISTS "Public can view active professional services" ON public.professional_services;

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_professional_services_updated_at
  BEFORE UPDATE ON public.professional_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
