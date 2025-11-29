-- Add sample services to the services table organized by domain/category

-- Technology & Development Services
INSERT INTO public.services (name, category, description, base_price) VALUES
('Web Development', 'Technology & Development', 'Custom website and web application development', 75.00),
('Mobile App Development', 'Technology & Development', 'iOS and Android mobile application development', 85.00),
('UI/UX Design', 'Technology & Development', 'User interface and user experience design', 65.00),
('Full Stack Development', 'Technology & Development', 'End-to-end application development', 90.00),
('Frontend Development', 'Technology & Development', 'Client-side web development (React, Vue, Angular)', 70.00),
('Backend Development', 'Technology & Development', 'Server-side development and APIs', 80.00),
('DevOps & Cloud Services', 'Technology & Development', 'AWS, Azure, GCP deployment and management', 95.00),
('Database Design', 'Technology & Development', 'Database architecture and optimization', 75.00),
('API Development', 'Technology & Development', 'RESTful and GraphQL API creation', 70.00),
('WordPress Development', 'Technology & Development', 'Custom WordPress themes and plugins', 60.00),

-- Design & Creative Services
('Graphic Design', 'Design & Creative', 'Branding, logos, and visual design', 55.00),
('Video Editing', 'Design & Creative', 'Professional video editing and post-production', 60.00),
('Animation', 'Design & Creative', 'Motion graphics and 2D/3D animation', 70.00),
('Illustration', 'Design & Creative', 'Custom illustrations and artwork', 65.00),
('Brand Identity Design', 'Design & Creative', 'Complete brand identity packages', 80.00),
('Social Media Graphics', 'Design & Creative', 'Social media content creation', 45.00),
('Photo Editing', 'Design & Creative', 'Photo retouching and enhancement', 50.00),
('Packaging Design', 'Design & Creative', 'Product packaging design', 70.00),

-- Marketing & Business Services
('Digital Marketing', 'Marketing & Business', 'SEO, SEM, and digital advertising', 65.00),
('Content Writing', 'Marketing & Business', 'Blog posts, articles, and web content', 50.00),
('Social Media Management', 'Marketing & Business', 'Social media strategy and management', 55.00),
('SEO Optimization', 'Marketing & Business', 'Search engine optimization services', 60.00),
('Email Marketing', 'Marketing & Business', 'Email campaign creation and management', 50.00),
('Copywriting', 'Marketing & Business', 'Sales copy and marketing content', 60.00),
('Market Research', 'Marketing & Business', 'Industry and competitor analysis', 70.00),
('Business Consulting', 'Marketing & Business', 'Strategy and business development', 100.00),
('PPC Advertising', 'Marketing & Business', 'Google Ads and paid advertising management', 75.00),

-- Data & Analytics
('Data Analysis', 'Data & Analytics', 'Data processing and statistical analysis', 80.00),
('Data Visualization', 'Data & Analytics', 'Charts, dashboards, and data reporting', 70.00),
('Machine Learning', 'Data & Analytics', 'ML model development and training', 100.00),
('Business Intelligence', 'Data & Analytics', 'BI solutions and reporting', 85.00),
('SQL Database Management', 'Data & Analytics', 'Database queries and optimization', 75.00),

-- Writing & Translation
('Technical Writing', 'Writing & Translation', 'Documentation and technical content', 60.00),
('Translation Services', 'Writing & Translation', 'Professional translation services', 55.00),
('Proofreading & Editing', 'Writing & Translation', 'Content review and editing', 45.00),
('Transcription', 'Writing & Translation', 'Audio and video transcription', 40.00),
('Resume Writing', 'Writing & Translation', 'Professional resume and CV writing', 50.00),

-- Audio & Music
('Audio Editing', 'Audio & Music', 'Audio production and editing', 60.00),
('Music Production', 'Audio & Music', 'Original music composition and production', 80.00),
('Voice Over', 'Audio & Music', 'Professional voice over recording', 70.00),
('Podcast Editing', 'Audio & Music', 'Podcast production and editing', 55.00),
('Sound Design', 'Audio & Music', 'Sound effects and audio branding', 65.00),

-- Education & Training
('Online Tutoring', 'Education & Training', 'One-on-one online tutoring', 50.00),
('Course Creation', 'Education & Training', 'Online course development', 75.00),
('Corporate Training', 'Education & Training', 'Professional development training', 90.00),
('Career Coaching', 'Education & Training', 'Career guidance and coaching', 70.00),

-- Legal & Accounting
('Bookkeeping', 'Legal & Accounting', 'Financial record keeping', 60.00),
('Tax Preparation', 'Legal & Accounting', 'Tax filing and preparation', 75.00),
('Legal Consulting', 'Legal & Accounting', 'Legal advice and consultation', 150.00),
('Contract Review', 'Legal & Accounting', 'Contract analysis and review', 100.00),

-- Virtual Assistant Services
('Administrative Support', 'Virtual Assistant', 'General administrative tasks', 35.00),
('Customer Service', 'Virtual Assistant', 'Customer support and service', 40.00),
('Project Management', 'Virtual Assistant', 'Project coordination and management', 65.00),
('Calendar Management', 'Virtual Assistant', 'Schedule and appointment management', 30.00),
('Email Management', 'Virtual Assistant', 'Email organization and responses', 35.00)

ON CONFLICT (name) DO NOTHING;
