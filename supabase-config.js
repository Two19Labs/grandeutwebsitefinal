/* ==========================================================================
   Grandeur SSCBS - Direct Native Supabase Engine (Zero-Dependency REST API)
   Real-Time Live Sync (Bypasses Stale Browser LocalStorage/SessionStorage Caches)
   ========================================================================== */

const SUPABASE_URL = 'https://mtycgxndnaxdusqsvqqs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWNneG5kbmF4ZHVzcXN2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU1MDgsImV4cCI6MjEwMDAyMTUwOH0._9CsDcumHsowYMTmzTh-SMcSM9ZexoB7dFhgBsCrNxs';

const READ_HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
};

const WRITE_HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

// Purge all legacy/stale local caches immediately
(function purgeLegacyCaches() {
    try {
        if (typeof window !== 'undefined') {
            ['sessionStorage', 'localStorage'].forEach(storageType => {
                const store = window[storageType];
                if (store) {
                    Object.keys(store).forEach(k => {
                        if (k.startsWith('gdb_cache_')) store.removeItem(k);
                    });
                }
            });
        }
    } catch(e) {}
})();

function sortPrimersByYearDesc(primers) {
    return (primers || []).sort((a, b) => {
        const extractYear = (p) => {
            const str = String(p.date_label || p.year || '');
            const match = str.match(/\b(20\d\d|19\d\d)\b/);
            if (match) return parseInt(match[1], 10);
            return p.created_at ? new Date(p.created_at).getFullYear() : 0;
        };
        const yearA = extractYear(a);
        const yearB = extractYear(b);
        if (yearB !== yearA) return yearB - yearA;
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
    });
}

window.GrandeurDB = {
    clearCache() {
        try {
            ['sessionStorage', 'localStorage'].forEach(st => {
                const store = window[st];
                if (store) {
                    Object.keys(store).forEach(k => {
                        if (k.startsWith('gdb_cache_')) store.removeItem(k);
                    });
                }
            });
        } catch(e) {}
    },

    // 1. TEAM MEMBERS CRUD (Current Team Only)
    async getTeamMembers() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=*&order=created_at.asc`, { headers: READ_HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const rows = await res.json();
        return (rows || []).filter(m => !m.role || !m.role.toLowerCase().includes('batch of'));
    },

    async insertTeamMember(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async updateTeamMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async deleteTeamMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    // 2. RECRUITMENT SETTINGS
    async getRecruitment() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings?select=*`, { headers: READ_HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            return rows.length > 0 ? rows[0] : null;
        } catch(e) { return null; }
    },

    async updateRecruitment(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings`, {
            method: 'POST',
            headers: { ...WRITE_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: 1, ...data })
        });
        return res.ok;
    },

    // 3. ANNOUNCEMENTS / BANNER
    async getBanner() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements?select=*`, { headers: READ_HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            return rows.length > 0 ? rows[0] : null;
        } catch(e) { return null; }
    },

    async updateBanner(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements`, {
            method: 'POST',
            headers: { ...WRITE_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: 1, ...data })
        });
        return res.ok;
    },

    // 4. KNOWLEDGE PRIMERS / PUBLICATIONS (Real-Time Live Query Sorted by Descending Year)
    async getKnowledgePrimers() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?select=*&order=created_at.desc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            const rows = await res.json();
            return sortPrimersByYearDesc(rows);
        } catch(e) { return []; }
    },

    async insertKnowledgePrimer(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async updateKnowledgePrimer(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async deleteKnowledgePrimer(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        return res.ok;
    },

    // 5. ACHIEVEMENTS
    async getAchievements() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?select=*&order=created_at.desc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertAchievement(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async updateAchievement(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async deleteAchievement(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        return res.ok;
    },

    // 6. CONTACT INQUIRIES (INBOX)
    async getContactInquiries() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries?select=*&order=created_at.desc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertContactInquiry(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async deleteContactInquiry(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        return res.ok;
    },

    // 7. ALUMNI MEMBERS (Alumni Only)
    async getAlumniMembers() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=*&order=created_at.asc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            const rows = await res.json();
            return (rows || []).filter(m => m.role && m.role.toLowerCase().includes('batch of'));
        } catch(e) { return []; }
    },

    async insertAlumniMember(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify({ ...data, tier: 'board' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async updateAlumniMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify({ ...data, tier: 'board' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    async deleteAlumniMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    }
};

console.log("⚡ GrandeurDB Engine loaded - Descending Year Sorting Enabled!");
