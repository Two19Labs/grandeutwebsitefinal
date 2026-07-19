/* ==========================================================================
   Grandeur SSCBS - Supabase Integration Configuration
   ========================================================================== */

window.SUPABASE_URL = 'https://mtycgxndnaxdusqsvqqs.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWNneG5kbmF4ZHVzcXN2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU1MDgsImV4cCI6MjEwMDAyMTUwOH0._9CsDcumHsowYMTmzTh-SMcSM9ZexoB7dFhgBsCrNxs';

// Initialize Supabase Client globally on window object
function initSupabaseGlobal() {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log("✅ Supabase Client initialized globally:", window.SUPABASE_URL);
    } else {
        console.warn("⚠️ Supabase CDN SDK not loaded yet.");
    }
}

initSupabaseGlobal();
