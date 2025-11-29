-- Complete database setup for User Portal with bookings/hires system

-- ============================================
-- 1. CREATE BOOKINGS TABLE (for user hires)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id SERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES public.services(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  budget NUMERIC(10, 2),
  status TEXT DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, professional_id)
);

-- ============================================
-- 3. CREATE MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES public.bookings(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CREATE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. DROP EXISTING POLICIES
-- ============================================
-- Bookings policies
DROP POLICY IF EXISTS "Users can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professionals can update their bookings" ON public.bookings;

-- Favorites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Clients can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Clients can update own reviews" ON public.reviews;

-- ============================================
-- 7. CREATE BOOKINGS POLICIES
-- ============================================
CREATE POLICY "Users can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Professionals can update their bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = professional_id);

-- ============================================
-- 8. CREATE FAVORITES POLICIES
-- ============================================
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. CREATE MESSAGES POLICIES
-- ============================================
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- 10. CREATE REVIEWS POLICIES
-- ============================================
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = client_id);

-- ============================================
-- 11. CREATE TRIGGERS
-- ============================================
-- Bookings updated_at trigger
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. CREATE USEFUL VIEWS
-- ============================================
-- View for professional ratings
CREATE OR REPLACE VIEW professional_ratings AS
SELECT 
  professional_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN bookings.status = 'completed' THEN 1 END) as completed_jobs
FROM reviews
JOIN bookings ON reviews.booking_id = bookings.id
GROUP BY professional_id;

-- View for active professionals with services
CREATE OR REPLACE VIEW active_professionals AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.title,
  p.location,
  p.hourly_rate,
  p.bio,
  p.skills,
  p.available_for_new_projects,
  COALESCE(pr.average_rating, 0) as rating,
  COALESCE(pr.completed_jobs, 0) as jobs_completed
FROM professionals p
LEFT JOIN professional_ratings pr ON p.id = pr.professional_id
WHERE p.available_for_new_projects = true;
