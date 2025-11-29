import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://illyqwmzzmsjvcdbsigc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbHlxd216em1zanZjZGJzaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTgwNTksImV4cCI6MjA3OTk5NDA1OX0.iuj-Crl12WF7VSDUtUfJL39kk7c5SNDqwZTIl6DxAe4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
