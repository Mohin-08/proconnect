-- First, make sure the services table has the right columns
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2);

-- Add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'services_name_key'
  ) THEN
    ALTER TABLE public.services 
    ADD CONSTRAINT services_name_key UNIQUE(name);
  END IF;
END $$;

-- Insert the services (now the ON CONFLICT will work)
INSERT INTO public.services (name, category, description, base_price) VALUES
-- Technology & Development
('Web Development', 'Technology & Development', 'Custom website and web application development', 75.00),
('Mobile App Development', 'Technology & Development', 'iOS and Android mobile application development', 85.00),
('UI/UX Design', 'Technology & Development', 'User interface and user experience design', 65.00),
('Full Stack Development', 'Technology & Development', 'End-to-end application development', 90.00),
('Frontend Development', 'Technology & Development', 'Client-side web development', 70.00),
('Backend Development', 'Technology & Development', 'Server-side development and APIs', 80.00),
('DevOps & Cloud Services', 'Technology & Development', 'AWS, Azure, GCP deployment', 95.00),
('Database Design', 'Technology & Development', 'Database architecture and optimization', 75.00),
('API Development', 'Technology & Development', 'RESTful and GraphQL API creation', 70.00),
('WordPress Development', 'Technology & Development', 'Custom WordPress themes and plugins', 60.00),

-- Design & Creative
('Graphic Design', 'Design & Creative', 'Branding, logos, and visual design', 55.00),
('Video Editing', 'Design & Creative', 'Professional video editing', 60.00),
('Animation', 'Design & Creative', 'Motion graphics and animation', 70.00),
('Illustration', 'Design & Creative', 'Custom illustrations and artwork', 65.00),
('Brand Identity Design', 'Design & Creative', 'Complete brand identity packages', 80.00),
('Social Media Graphics', 'Design & Creative', 'Social media content creation', 45.00),
('Photo Editing', 'Design & Creative', 'Photo retouching and enhancement', 50.00),

-- Marketing & Business
('Digital Marketing', 'Marketing & Business', 'SEO, SEM, and digital advertising', 65.00),
('Content Writing', 'Marketing & Business', 'Blog posts and articles', 50.00),
('Social Media Management', 'Marketing & Business', 'Social media strategy', 55.00),
('SEO Optimization', 'Marketing & Business', 'Search engine optimization', 60.00),
('Email Marketing', 'Marketing & Business', 'Email campaign creation', 50.00),
('Copywriting', 'Marketing & Business', 'Sales copy and marketing content', 60.00),
('Business Consulting', 'Marketing & Business', 'Strategy and business development', 100.00),

-- Data & Analytics
('Data Analysis', 'Data & Analytics', 'Data processing and analysis', 80.00),
('Data Visualization', 'Data & Analytics', 'Charts and dashboards', 70.00),
('Machine Learning', 'Data & Analytics', 'ML model development', 100.00),
('Business Intelligence', 'Data & Analytics', 'BI solutions and reporting', 85.00),

-- Writing & Translation
('Technical Writing', 'Writing & Translation', 'Documentation and technical content', 60.00),
('Translation Services', 'Writing & Translation', 'Professional translation', 55.00),
('Proofreading & Editing', 'Writing & Translation', 'Content review and editing', 45.00),
('Resume Writing', 'Writing & Translation', 'Professional resume writing', 50.00),

-- Audio & Music
('Audio Editing', 'Audio & Music', 'Audio production and editing', 60.00),
('Music Production', 'Audio & Music', 'Original music composition', 80.00),
('Voice Over', 'Audio & Music', 'Professional voice over recording', 70.00),
('Podcast Editing', 'Audio & Music', 'Podcast production', 55.00),

-- Education & Training
('Online Tutoring', 'Education & Training', 'One-on-one online tutoring', 50.00),
('Course Creation', 'Education & Training', 'Online course development', 75.00),
('Corporate Training', 'Education & Training', 'Professional development', 90.00),

-- Legal & Accounting
('Bookkeeping', 'Legal & Accounting', 'Financial record keeping', 60.00),
('Tax Preparation', 'Legal & Accounting', 'Tax filing and preparation', 75.00),
('Legal Consulting', 'Legal & Accounting', 'Legal advice and consultation', 150.00),

-- Virtual Assistant
('Administrative Support', 'Virtual Assistant', 'General administrative tasks', 35.00),
('Customer Service', 'Virtual Assistant', 'Customer support', 40.00),
('Project Management', 'Virtual Assistant', 'Project coordination', 65.00),
('Email Management', 'Virtual Assistant', 'Email organization', 35.00)

ON CONFLICT (name) DO NOTHING;
