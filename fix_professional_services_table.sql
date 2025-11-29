-- Fix professional_services table to use auto-incrementing ID

-- Drop the existing table if needed and recreate it properly
DROP TABLE IF EXISTS public.professional_services CASCADE;

-- Create professional_services table with SERIAL (auto-increment) primary key
CREATE TABLE public.professional_services (
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professional_services_updated_at
  BEFORE UPDATE ON public.professional_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
