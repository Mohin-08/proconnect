-- Delete all profiles first (due to foreign key constraint)
DELETE FROM profiles;

-- Note: You need to delete auth.users from Supabase Dashboard
-- Go to Authentication > Users and delete all users manually
-- Or run this in SQL Editor if you have admin access:
-- DELETE FROM auth.users;

-- Verify deletion
SELECT COUNT(*) FROM profiles;
