/* ==========================================================================
   Grandeur SSCBS - Direct Native Supabase Engine (Zero-Dependency REST API)
   Optimized with Caching & Reduced Egress Payload
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

// Smart Session Cache (10 minutes TTL)
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key) {
    try {
        const item = sessionStorage.getItem('gdb_cache_' + key);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            return parsed.data;
        }
    } catch(e) {}
    return null;
}

function setCache(key, data) {
    try {
        sessionStorage.setItem('gdb_cache_' + key, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    } catch(e) {}
}

function clearCache(key) {
    try {
        if (key) {
            sessionStorage.removeItem('gdb_cache_' + key);
        } else {
            Object.keys(sessionStorage).forEach(k => {
                if (k.startsWith('gdb_cache_')) sessionStorage.removeItem(k);
            });
        }
    } catch(e) {}
}

window.GrandeurDB = {
    clearCache,

    // 1. TEAM MEMBERS CRUD (Current Team Only)
    async getTeamMembers() {
        const cached = getCached('team_members');
        if (cached) return cached.filter(m => !m.role || !m.role.toLowerCase().includes('batch of'));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=id,name,role,tier,photo,linkedin&order=created_at.asc`, { headers: READ_HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const rows = await res.json();
        setCache('team_members', rows || []);
        return (rows || []).filter(m => !m.role || !m.role.toLowerCase().includes('batch of'));
    },

    async insertTeamMember(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('team_members');
        return true;
    },

    async updateTeamMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('team_members');
        return true;
    },

    async deleteTeamMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('team_members');
        return true;
    },

    // 2. RECRUITMENT SETTINGS
    async getRecruitment() {
        try {
            const cached = getCached('recruitment');
            if (cached) return cached;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings?select=id,active,title,description,form_url,deadline`, { headers: READ_HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            const data = rows.length > 0 ? rows[0] : null;
            if (data) setCache('recruitment', data);
            return data;
        } catch(e) { return null; }
    },

    async updateRecruitment(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings`, {
            method: 'POST',
            headers: { ...WRITE_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: 1, ...data })
        });
        if (res.ok) clearCache('recruitment');
        return res.ok;
    },

    // 3. ANNOUNCEMENTS / BANNER
    async getBanner() {
        try {
            const cached = getCached('banner');
            if (cached) return cached;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements?select=id,active,text,btn_text,btn_url`, { headers: READ_HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            const data = rows.length > 0 ? rows[0] : null;
            if (data) setCache('banner', data);
            return data;
        } catch(e) { return null; }
    },

    async updateBanner(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements`, {
            method: 'POST',
            headers: { ...WRITE_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: 1, ...data })
        });
        if (res.ok) clearCache('banner');
        return res.ok;
    },

    // 4. KNOWLEDGE PRIMERS / PUBLICATIONS
    async getKnowledgePrimers() {
        try {
            const cached = getCached('knowledge_primers');
            if (cached) return cached;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?select=id,title,category,date_label,read_time,pdf_url,created_at&order=created_at.desc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            const data = await res.json();
            setCache('knowledge_primers', data || []);
            return data;
        } catch(e) { return []; }
    },

    async insertKnowledgePrimer(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('knowledge_primers');
        return true;
    },

    async updateKnowledgePrimer(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('knowledge_primers');
        return true;
    },

    async deleteKnowledgePrimer(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (res.ok) clearCache('knowledge_primers');
        return res.ok;
    },

    // 5. ACHIEVEMENTS
    async getAchievements() {
        try {
            const cached = getCached('achievements');
            if (cached) return cached;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?select=id,title,category,description,date,created_at&order=created_at.desc`, { headers: READ_HEADERS });
            if (!res.ok) return [];
            const data = await res.json();
            setCache('achievements', data || []);
            return data;
        } catch(e) { return []; }
    },

    async insertAchievement(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements`, {
            method: 'POST',
            headers: WRITE_HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('achievements');
        return true;
    },

    async deleteAchievement(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (res.ok) clearCache('achievements');
        return res.ok;
    },

    // 6. CONTACT INQUIRIES (INBOX)
    async getContactInquiries() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries?select=id,name,email,subject,message,created_at&order=created_at.desc`, { headers: READ_HEADERS });
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
            const cached = getCached('team_members');
            let rows;
            if (cached) {
                rows = cached;
            } else {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=id,name,role,tier,photo,linkedin&order=created_at.asc`, { headers: READ_HEADERS });
                if (!res.ok) return [];
                rows = await res.json();
                setCache('team_members', rows || []);
            }
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
        clearCache('team_members');
        return true;
    },

    async updateAlumniMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: WRITE_HEADERS,
            body: JSON.stringify({ ...data, tier: 'board' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('team_members');
        return true;
    },

    async deleteAlumniMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: WRITE_HEADERS
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        clearCache('team_members');
        return true;
    }
};

console.log("⚡ GrandeurDB Engine loaded with Egress Payload & Caching Optimizations!");
