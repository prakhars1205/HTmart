// Supabase project connection.
// The anon key is a public, restricted key — safe to expose in client code.
// Actual permissions are enforced by Row Level Security policies in Supabase.
const SUPABASE_URL = 'https://zrejjgavbpvizgmfwfca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZWpqZ2F2YnB2aXpnbWZ3ZmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzQ4OTYsImV4cCI6MjA5Njc1MDg5Nn0.Wun2-rJ9gldxXqTPXwGTTvdMR0XWd7oKTsQmCeU7rFw';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
