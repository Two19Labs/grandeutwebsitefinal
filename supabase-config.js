/* ==========================================================================
   Grandeur SSCBS - Supabase Integration Configuration
   ==========================================================================
   Instructions:
   1. Go to your Supabase Dashboard: https://database.new
   2. Navigate to Project Settings -> API
   3. Copy your 'Project URL' and 'anon/public' Key below:
   ========================================================================== */

const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase Client
const supabaseClient = (window.supabase && SUPABASE_URL.includes('supabase.co')) ? 
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
