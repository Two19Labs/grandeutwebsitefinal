/* ==========================================================================
   Grandeur SSCBS - Supabase Integration Configuration
   ========================================================================== */

const SUPABASE_URL = 'https://mtycgxndnaxdusqsvqqs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWNneG5kbmF4ZHVzcXN2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU1MDgsImV4cCI6MjEwMDAyMTUwOH0._9CsDcumHsowYMTmzTh-SMcSM9ZexoB7dFhgBsCrNxs';

// Initialize Supabase Client
const supabaseClient = (window.supabase && SUPABASE_URL.includes('supabase.co')) ? 
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
