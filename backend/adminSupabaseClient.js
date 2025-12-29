
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nzxlnuxdfqvfgispjxuz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGxudXhkZnF2Zmdpc3BqeHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODkwNTcsImV4cCI6MjA4MTM2NTA1N30.SLN2BeyuR-DxVJ6fgtmGTuQRavvZmIo3-j5MaoXWdNo";

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = { adminSupabase };
