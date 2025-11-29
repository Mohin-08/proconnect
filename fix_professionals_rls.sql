-- Drop existing policies if any
DROP POLICY IF EXISTS "Professionals can view own profile" ON professionals;
DROP POLICY IF EXISTS "Professionals can update own profile" ON professionals;
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON professionals;
DROP POLICY IF EXISTS "Users can insert their own professional profile" ON professionals;

-- Enable RLS on professionals table
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view professional profiles (for public browsing)
CREATE POLICY "Anyone can view professional profiles"
ON professionals FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Professionals can insert their own profile
CREATE POLICY "Professionals can insert own profile"
ON professionals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Professionals can update their own profile
CREATE POLICY "Professionals can update own profile"
ON professionals FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Professionals can delete their own profile
CREATE POLICY "Professionals can delete own profile"
ON professionals FOR DELETE
TO authenticated
USING (auth.uid() = id);
