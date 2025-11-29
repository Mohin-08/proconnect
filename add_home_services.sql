-- Insert home services into services table
INSERT INTO services (name, description, category) VALUES
('Carpentry', 'Professional carpentry services for furniture, repairs, and custom woodwork', 'Home Services'),
('Electrical Work', 'Licensed electrical services for installation, repair, and maintenance', 'Home Services'),
('House Cleaning', 'Professional house cleaning and maintenance services', 'Cleaning'),
('Painting', 'Interior and exterior painting services for homes and businesses', 'Home Services'),
('Plumbing', 'Expert plumbing services for installation, repair, and emergency fixes', 'Home Services')
ON CONFLICT (name) DO NOTHING;
