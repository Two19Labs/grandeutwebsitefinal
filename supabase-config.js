/* ==========================================================================
   Grandeur SSCBS - Direct Native Supabase Engine (Zero-Dependency REST API)
   ========================================================================== */

const SUPABASE_URL = 'https://mtycgxndnaxdusqsvqqs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWNneG5kbmF4ZHVzcXN2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU1MDgsImV4cCI6MjEwMDAyMTUwOH0._9CsDcumHsowYMTmzTh-SMcSM9ZexoB7dFhgBsCrNxs';

const HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

window.GrandeurDB = {
    // 1. TEAM MEMBERS CRUD (Current Team)
    async getTeamMembers() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?tier=neq.board&order=created_at.asc`, { headers: HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async insertTeamMember(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async updateTeamMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async deleteTeamMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return true;
    },

    // 2. RECRUITMENT SETTINGS
    async getRecruitment() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings?select=*`, { headers: HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            return rows.length > 0 ? rows[0] : null;
        } catch(e) { return null; }
    },

    async updateRecruitment(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/recruitment_settings`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({ id: 1, ...data })
        });
        return res.ok;
    },

    // 3. ANNOUNCEMENTS / BANNER
    async getBanner() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements?select=*`, { headers: HEADERS });
            if (!res.ok) return null;
            const rows = await res.json();
            return rows.length > 0 ? rows[0] : null;
        } catch(e) { return null; }
    },

    async updateBanner(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/announcements`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({ id: 1, ...data })
        });
        return res.ok;
    },

    // 4. KNOWLEDGE PRIMERS / PUBLICATIONS
    async getKnowledgePrimers() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?select=*&order=created_at.desc`, { headers: HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertKnowledgePrimer(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async updateKnowledgePrimer(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async deleteKnowledgePrimer(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_primers?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    },

    // 5. ACHIEVEMENTS
    async getAchievements() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?select=*&order=created_at.desc`, { headers: HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertAchievement(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async deleteAchievement(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/achievements?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    },

    // 6. CONTACT INQUIRIES (INBOX)
    async getContactInquiries() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries?select=*&order=created_at.desc`, { headers: HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertContactInquiry(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async deleteContactInquiry(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_inquiries?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    },

    // 7. ALUMNI MEMBERS
    async getAlumniMembers() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?tier=eq.board&order=created_at.asc`, { headers: HEADERS });
            if (!res.ok) return [];
            return await res.json();
        } catch(e) { return []; }
    },

    async insertAlumniMember(data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ ...data, tier: 'board' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async updateAlumniMember(id, data) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ ...data, tier: 'board' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },

    async deleteAlumniMember(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        return res.ok;
    }
};

console.log("✅ GrandeurDB Native REST Engine loaded with Alumni module!");
