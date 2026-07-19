/* ==========================================================================
   Grandeur SSCBS - Admin Console JavaScript (Supabase Integrated)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DEFAULT DATA STORE INITIALIZATION (FALLBACK)
    // ----------------------------------------------------------------------
    const DEFAULT_STORE = {
        recruitment: {
            active: false,
            title: "Grandeur Recruitment Drive 2026",
            description: "Join the premier Consulting & Knowledge Cell of SSCBS. We are hiring proactive thinkers, analysts, and strategists.",
            formUrl: "https://forms.google.com/",
            deadline: "August 20, 2026 - 11:59 PM IST"
        },
        banner: {
            active: true,
            text: "🚀 Grandeur Recruitments 2026 are officially open!",
            btnText: "Apply Now",
            btnUrl: "contact-us.html"
        },
        team: [
            { id: "tm_1", name: "Mr. Tushar Marwaha", role: "Faculty In-Charge", tier: "faculty", photo: "", linkedin: "#" },
            { id: "tm_2", name: "Dr. Sushmita", role: "Faculty In-Charge", tier: "faculty", photo: "", linkedin: "#" },
            { id: "tm_3", name: "Sambhav Jain", role: "President", tier: "board", photo: "hero-team.jpg", linkedin: "https://linkedin.com" },
            { id: "tm_4", name: "Shrivats Tiwari", role: "Vice President", tier: "board", photo: "", linkedin: "https://linkedin.com" },
            { id: "tm_5", name: "Ananya Roy", role: "Senior Director - Advisory", tier: "senior", photo: "", linkedin: "https://linkedin.com" },
            { id: "tm_6", name: "Rohan Verma", role: "Senior Associate", tier: "senior", photo: "", linkedin: "https://linkedin.com" },
            { id: "tm_7", name: "Devansh Gupta", role: "Junior Analyst", tier: "junior", photo: "", linkedin: "https://linkedin.com" },
            { id: "tm_8", name: "Kavya Sharma", role: "Junior Consultant", tier: "junior", photo: "", linkedin: "https://linkedin.com" }
        ],
        knowledge: [
            { id: "kn_1", title: "EV Ecosystem in India: 2026 Primer", category: "Automotive & CleanTech", date: "July 2026", readTime: "8 min read" },
            { id: "kn_2", title: "Q2 2026 D2C Brand Growth Benchmark", category: "Retail & Consumer", date: "June 2026", readTime: "12 min read" }
        ],
        achievements: [
            { id: "ac_1", event: "National Strategy Challenge - IIT Bombay", position: "🏆 1st Rank", team: "Team Apex", year: "2026" },
            { id: "ac_2", event: "Global Business Case Fest - Univ of Melbourne", position: "🥇 Winner", team: "Grandeur Alpha", year: "2025" }
        ],
        inbox: [
            { id: "in_1", name: "Corporate Partner", email: "partnerships@krafton.com", subject: "Live Project Collaboration Q3", date: "July 18, 2026", message: "Hi Grandeur team, we would like to explore a consulting engagement with your cell for Q3 market strategy." }
        ]
    };

    let cachedTeam = [];

    function getStore() {
        const data = localStorage.getItem('grandeur_admin_store');
        if (!data) {
            localStorage.setItem('grandeur_admin_store', JSON.stringify(DEFAULT_STORE));
            return DEFAULT_STORE;
        }
        try { return JSON.parse(data); } catch(e) { return DEFAULT_STORE; }
    }

    function saveStore(store) {
        localStorage.setItem('grandeur_admin_store', JSON.stringify(store));
        window.dispatchEvent(new Event('grandeur_store_updated'));
    }

    // ----------------------------------------------------------------------
    // 2. AUTHENTICATION (PASSCODE: 123456)
    // ----------------------------------------------------------------------
    const DEMO_PASSCODE = "123456";
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const adminUserActions = document.getElementById('admin-user-actions');
    const loginForm = document.getElementById('admin-login-form');
    const passcodeBtnToggle = document.getElementById('toggle-pass-visibility');
    const passcodeInput = document.getElementById('admin-passcode');
    const authErrorAlert = document.getElementById('auth-error');
    const btnLogout = document.getElementById('btn-logout');

    function checkAuthSession() {
        const isAuth = sessionStorage.getItem('grandeur_admin_authenticated') === 'true';
        if (isAuth) {
            if (loginView) loginView.style.display = 'none';
            if (dashboardView) dashboardView.style.display = 'block';
            if (adminUserActions) adminUserActions.style.display = 'flex';
            renderDashboard();
        } else {
            if (loginView) loginView.style.display = 'flex';
            if (dashboardView) dashboardView.style.display = 'none';
            if (adminUserActions) adminUserActions.style.display = 'none';
        }
    }

    if (passcodeBtnToggle && passcodeInput) {
        passcodeBtnToggle.addEventListener('click', () => {
            const type = passcodeInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passcodeInput.setAttribute('type', type);
            passcodeBtnToggle.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = passcodeInput.value.trim();
            if (val === DEMO_PASSCODE) {
                sessionStorage.setItem('grandeur_admin_authenticated', 'true');
                if (authErrorAlert) authErrorAlert.style.display = 'none';
                showToast("✅ Successfully authenticated! Welcome to Grandeur Admin.");
                checkAuthSession();
            } else {
                if (authErrorAlert) authErrorAlert.style.display = 'block';
                showToast("❌ Incorrect passcode. Try 123456");
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('grandeur_admin_authenticated');
            showToast("👋 Signed out of admin console.");
            checkAuthSession();
        });
    }

    // ----------------------------------------------------------------------
    // 3. DASHBOARD TAB NAVIGATION
    // ----------------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.admin-nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // ----------------------------------------------------------------------
    // 4. DASHBOARD RENDER & DATA BINDING (SUPABASE + LOCAL FALLBACK)
    // ----------------------------------------------------------------------
    async function renderDashboard() {
        let recruitmentData = null;
        let bannerData = null;
        let teamData = [];
        let inboxData = [];
        let knowledgeData = [];
        let achievementsData = [];

        if (window.supabaseClient) {
            try {
                const { data: rec } = await window.supabaseClient.from('recruitment_settings').select('*').single();
                if (rec) recruitmentData = { active: rec.active, title: rec.title, description: rec.description, formUrl: rec.form_url, deadline: rec.deadline };

                const { data: ban } = await window.supabaseClient.from('announcements').select('*').single();
                if (ban) bannerData = { active: ban.active, text: ban.text, btnText: ban.btn_text, btnUrl: ban.btn_url };

                const { data: tm } = await window.supabaseClient.from('team_members').select('*').order('created_at', { ascending: true });
                if (tm) teamData = tm;

                const { data: inb } = await window.supabaseClient.from('contact_inquiries').select('*').order('created_at', { ascending: false });
                if (inb) inboxData = inb;

                const { data: kn } = await window.supabaseClient.from('knowledge_primers').select('*');
                if (kn) knowledgeData = kn;

                const { data: ac } = await window.supabaseClient.from('achievements').select('*');
                if (ac) achievementsData = ac;
            } catch (err) {
                console.warn("Supabase fetch error in admin dashboard:", err);
            }
        }

        const localStore = getStore();

        // Merge state
        const recruitment = recruitmentData || localStore.recruitment;
        const banner = bannerData || localStore.banner;
        cachedTeam = teamData.length > 0 ? teamData : localStore.team;
        const inbox = inboxData.length > 0 ? inboxData : localStore.inbox;
        const knowledge = knowledgeData.length > 0 ? knowledgeData : localStore.knowledge;
        const achievements = achievementsData.length > 0 ? achievementsData : localStore.achievements;

        // 4.1 Overview Stats
        const statRecruitment = document.getElementById('stat-recruitment-status');
        const statRecruitmentSub = document.getElementById('stat-recruitment-sub');
        if (statRecruitment) {
            if (recruitment.active) {
                statRecruitment.textContent = "ACTIVE";
                statRecruitment.style.color = "var(--admin-accent-green)";
                if (statRecruitmentSub) statRecruitmentSub.textContent = recruitment.title || "Accepting Applications";
            } else {
                statRecruitment.textContent = "CLOSED";
                statRecruitment.style.color = "var(--admin-text-muted)";
                if (statRecruitmentSub) statRecruitmentSub.textContent = "No active recruitment drive";
            }
        }

        const statTeamCount = document.getElementById('stat-team-count');
        if (statTeamCount) statTeamCount.textContent = cachedTeam.length;

        const statPrimersCount = document.getElementById('stat-primers-count');
        if (statPrimersCount) statPrimersCount.textContent = knowledge.length;

        const statInboxCount = document.getElementById('stat-inbox-count');
        if (statInboxCount) statInboxCount.textContent = inbox.length;

        const inboxBadge = document.getElementById('inbox-count-badge');
        if (inboxBadge) inboxBadge.textContent = inbox.length;

        // 4.2 Populate Recruitment Settings
        const switchRecruitment = document.getElementById('switch-recruitment-active');
        if (switchRecruitment) switchRecruitment.checked = recruitment.active;

        const inputRecTitle = document.getElementById('recruitment-title');
        if (inputRecTitle) inputRecTitle.value = recruitment.title || "";

        const inputRecDesc = document.getElementById('recruitment-description');
        if (inputRecDesc) inputRecDesc.value = recruitment.description || "";

        const inputRecUrl = document.getElementById('recruitment-form-url');
        if (inputRecUrl) inputRecUrl.value = recruitment.formUrl || "";

        const inputRecDeadline = document.getElementById('recruitment-deadline');
        if (inputRecDeadline) inputRecDeadline.value = recruitment.deadline || "";

        // 4.3 Populate Banner Settings
        const switchBanner = document.getElementById('switch-banner-active');
        if (switchBanner) switchBanner.checked = banner.active;

        const inputBannerText = document.getElementById('banner-text');
        if (inputBannerText) inputBannerText.value = banner.text || "";

        const inputBannerBtnText = document.getElementById('banner-btn-text');
        if (inputBannerBtnText) inputBannerBtnText.value = banner.btnText || "";

        const inputBannerBtnUrl = document.getElementById('banner-btn-url');
        if (inputBannerBtnUrl) inputBannerBtnUrl.value = banner.btnUrl || "";

        // Render Tables
        renderTeamTable(cachedTeam);
        renderKnowledgeTable(knowledge);
        renderAchievementsTable(achievements);
        renderInboxList(inbox);
    }

    // ----------------------------------------------------------------------
    // 5. RECRUITMENT & BANNER FORMS (SUPABASE WRITES)
    // ----------------------------------------------------------------------
    const switchRecruitment = document.getElementById('switch-recruitment-active');
    if (switchRecruitment) {
        switchRecruitment.addEventListener('change', async () => {
            const active = switchRecruitment.checked;
            if (window.supabaseClient) {
                await window.supabaseClient.from('recruitment_settings').upsert({ id: 1, active: active });
            }
            const store = getStore();
            store.recruitment.active = active;
            saveStore(store);
            renderDashboard();
            showToast(`Recruitment Portal is now ${active ? 'ACTIVE' : 'CLOSED'}`);
        });
    }

    const formRecruitment = document.getElementById('form-recruitment-settings');
    if (formRecruitment) {
        formRecruitment.addEventListener('submit', async (e) => {
            e.preventDefault();
            const active = document.getElementById('switch-recruitment-active').checked;
            const title = document.getElementById('recruitment-title').value;
            const description = document.getElementById('recruitment-description').value;
            const formUrl = document.getElementById('recruitment-form-url').value;
            const deadline = document.getElementById('recruitment-deadline').value;

            if (window.supabaseClient) {
                await window.supabaseClient.from('recruitment_settings').upsert({
                    id: 1, active, title, description, form_url: formUrl, deadline
                });
            }

            const store = getStore();
            store.recruitment = { active, title, description, formUrl, deadline };
            saveStore(store);
            renderDashboard();
            showToast("✅ Recruitment settings updated in Supabase!");
        });
    }

    const switchBanner = document.getElementById('switch-banner-active');
    if (switchBanner) {
        switchBanner.addEventListener('change', async () => {
            const active = switchBanner.checked;
            if (window.supabaseClient) {
                await window.supabaseClient.from('announcements').upsert({ id: 1, active: active });
            }
            const store = getStore();
            store.banner.active = active;
            saveStore(store);
            renderDashboard();
            showToast(`Header Banner is now ${active ? 'ENABLED' : 'DISABLED'}`);
        });
    }

    const formBanner = document.getElementById('form-banner-settings');
    if (formBanner) {
        formBanner.addEventListener('submit', async (e) => {
            e.preventDefault();
            const active = document.getElementById('switch-banner-active').checked;
            const text = document.getElementById('banner-text').value;
            const btnText = document.getElementById('banner-btn-text').value;
            const btnUrl = document.getElementById('banner-btn-url').value;

            if (window.supabaseClient) {
                await window.supabaseClient.from('announcements').upsert({
                    id: 1, active, text, btn_text: btnText, btn_url: btnUrl
                });
            }

            const store = getStore();
            store.banner = { active, text, btnText, btnUrl };
            saveStore(store);
            renderDashboard();
            showToast("✅ Announcement banner updated in Supabase!");
        });
    }

    const quickToggleRec = document.getElementById('quick-toggle-recruitment');
    if (quickToggleRec) {
        quickToggleRec.addEventListener('click', async () => {
            const currentActive = document.getElementById('switch-recruitment-active').checked;
            const newActive = !currentActive;
            if (window.supabaseClient) {
                await window.supabaseClient.from('recruitment_settings').upsert({ id: 1, active: newActive });
            }
            const store = getStore();
            store.recruitment.active = newActive;
            saveStore(store);
            renderDashboard();
            showToast(`Recruitment status toggled to: ${newActive ? 'ACTIVE' : 'CLOSED'}`);
        });
    }

    // ----------------------------------------------------------------------
    // 6. TEAM MEMBERS MANAGER (SUPABASE CRUD)
    // ----------------------------------------------------------------------
    const teamTableBody = document.getElementById('team-table-body');
    const filterTierSelect = document.getElementById('filter-team-tier');
    const searchTeamInput = document.getElementById('search-team-input');

    function renderTeamTable(membersList = cachedTeam) {
        if (!teamTableBody) return;
        const tierFilter = filterTierSelect ? filterTierSelect.value : 'all';
        const searchQuery = searchTeamInput ? searchTeamInput.value.toLowerCase().trim() : '';

        const filtered = membersList.filter(m => {
            const matchTier = (tierFilter === 'all') || (m.tier === tierFilter);
            const matchSearch = (m.name.toLowerCase().includes(searchQuery) || m.role.toLowerCase().includes(searchQuery));
            return matchTier && matchSearch;
        });

        if (filtered.length === 0) {
            teamTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">No team members match the filter.</td></tr>`;
            return;
        }

        teamTableBody.innerHTML = filtered.map(m => {
            const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarHtml = m.photo ? 
                `<img src="${escapeHtml(m.photo)}" class="member-avatar-mini" alt="${escapeHtml(m.name)}">` : 
                `<div class="member-avatar-mini">${initials}</div>`;

            return `
                <tr>
                    <td>
                        <div class="member-cell">
                            ${avatarHtml}
                            <span class="member-name-text">${escapeHtml(m.name)}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(m.role)}</td>
                    <td><span class="tier-badge tier-${m.tier}">${m.tier}</span></td>
                    <td>${m.linkedin ? `<a href="${escapeHtml(m.linkedin)}" target="_blank" style="color:var(--admin-gold);">Profile ↗</a>` : '—'}</td>
                    <td>
                        <div class="action-btns-group">
                            <button class="btn-icon" onclick="editTeamMember('${m.id}')" title="Edit Member">✏️</button>
                            <button class="btn-icon delete" onclick="deleteTeamMember('${m.id}')" title="Delete Member">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (filterTierSelect) filterTierSelect.addEventListener('change', () => renderTeamTable());
    if (searchTeamInput) searchTeamInput.addEventListener('input', () => renderTeamTable());

    // Modal Handling
    const modalMember = document.getElementById('modal-member');
    const btnOpenAddMember = document.getElementById('btn-open-add-member-modal');
    const quickAddMember = document.getElementById('quick-add-member');
    const btnCloseMemberModal = document.getElementById('btn-close-member-modal');
    const btnCancelMemberModal = document.getElementById('btn-cancel-member-modal');
    const formMemberModal = document.getElementById('form-member-modal');

    function openMemberModal(member = null) {
        if (!modalMember) return;
        const modalTitle = document.getElementById('modal-member-title');
        const inputId = document.getElementById('member-edit-id');
        const inputName = document.getElementById('member-name');
        const inputRole = document.getElementById('member-role');
        const inputTier = document.getElementById('member-tier');
        const inputPhoto = document.getElementById('member-photo');
        const inputLinkedin = document.getElementById('member-linkedin');

        if (member) {
            modalTitle.textContent = "Edit Team Member";
            inputId.value = member.id;
            inputName.value = member.name;
            inputRole.value = member.role;
            inputTier.value = member.tier;
            inputPhoto.value = member.photo || "";
            inputLinkedin.value = member.linkedin || "";
        } else {
            modalTitle.textContent = "Add Team Member";
            inputId.value = "";
            inputName.value = "";
            inputRole.value = "";
            inputTier.value = "junior";
            inputPhoto.value = "";
            inputLinkedin.value = "";
        }
        modalMember.style.display = 'flex';
    }

    function closeMemberModal() {
        if (modalMember) modalMember.style.display = 'none';
    }

    if (btnOpenAddMember) btnOpenAddMember.addEventListener('click', () => openMemberModal());
    if (quickAddMember) quickAddMember.addEventListener('click', () => {
        const teamTabBtn = document.querySelector('[data-tab="tab-team"]');
        if (teamTabBtn) teamTabBtn.click();
        openMemberModal();
    });
    if (btnCloseMemberModal) btnCloseMemberModal.addEventListener('click', closeMemberModal);
    if (btnCancelMemberModal) btnCancelMemberModal.addEventListener('click', closeMemberModal);

    if (formMemberModal) {
        formMemberModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('member-edit-id').value;
            const name = document.getElementById('member-name').value.trim();
            const role = document.getElementById('member-role').value.trim();
            const tier = document.getElementById('member-tier').value;
            const photo = document.getElementById('member-photo').value.trim();
            const linkedin = document.getElementById('member-linkedin').value.trim();

            if (window.supabaseClient) {
                try {
                    let sbError = null;
                    if (editId && !editId.startsWith('tm_')) {
                        const { error } = await window.supabaseClient.from('team_members').update({
                            name, role, tier, photo, linkedin
                        }).eq('id', editId);
                        sbError = error;
                    } else {
                        const { error } = await window.supabaseClient.from('team_members').insert([
                            { name, role, tier, photo, linkedin }
                        ]);
                        sbError = error;
                    }

                    if (sbError) {
                        console.error("Supabase Error:", sbError);
                        showToast(`⚠️ Supabase Error: ${sbError.message || sbError.details || 'Row Level Security policy blocked insert.'}`);
                    }
                } catch(err) {
                    console.error("Supabase team member save error:", err);
                }
            }

            // Also update local store
            const store = getStore();
            if (editId) {
                const idx = store.team.findIndex(m => m.id === editId);
                if (idx !== -1) store.team[idx] = { id: editId, name, role, tier, photo, linkedin };
            } else {
                store.team.push({ id: "tm_" + Date.now(), name, role, tier, photo, linkedin });
            }
            saveStore(store);

            showToast(`✅ Saved member: ${name}`);
            closeMemberModal();
            renderDashboard();
        });
    }

    window.editTeamMember = function(id) {
        const member = cachedTeam.find(m => m.id === id);
        if (member) openMemberModal(member);
    };

    window.deleteTeamMember = async function(id) {
        const member = cachedTeam.find(m => m.id === id);
        if (member && confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
            if (window.supabaseClient && !id.startsWith('tm_')) {
                try {
                    await window.supabaseClient.from('team_members').delete().eq('id', id);
                } catch(err) {
                    console.error("Supabase team member delete error:", err);
                }
            }
            const store = getStore();
            store.team = store.team.filter(m => m.id !== id);
            saveStore(store);
            renderDashboard();
            showToast(`Removed team member: ${member.name}`);
        }
    };

    // ----------------------------------------------------------------------
    // 7. KNOWLEDGE HUB & ACHIEVEMENTS TABLE RENDERING
    // ----------------------------------------------------------------------
    function renderKnowledgeTable(knowledgeList = []) {
        const tbody = document.getElementById('knowledge-table-body');
        if (!tbody) return;
        if (knowledgeList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--admin-text-muted);">No primers added.</td></tr>`;
            return;
        }
        tbody.innerHTML = knowledgeList.map(k => `
            <tr>
                <td><strong>${escapeHtml(k.title)}</strong></td>
                <td><span class="tier-badge tier-senior">${escapeHtml(k.category)}</span></td>
                <td>${escapeHtml(k.date_label || k.date || '')}</td>
                <td>${escapeHtml(k.read_time || k.readTime || '')}</td>
                <td>
                    <div class="action-btns-group">
                        <button class="btn-icon delete" onclick="deleteKnowledge('${k.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.deleteKnowledge = async function(id) {
        if (window.supabaseClient && !id.startsWith('kn_')) {
            await window.supabaseClient.from('knowledge_primers').delete().eq('id', id);
        }
        const store = getStore();
        store.knowledge = store.knowledge.filter(k => k.id !== id);
        saveStore(store);
        renderDashboard();
        showToast("Removed primer item.");
    };

    function renderAchievementsTable(achievementsList = []) {
        const tbody = document.getElementById('achievements-table-body');
        if (!tbody) return;
        if (achievementsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--admin-text-muted);">No achievements listed.</td></tr>`;
            return;
        }
        tbody.innerHTML = achievementsList.map(a => `
            <tr>
                <td><strong>${escapeHtml(a.event_name || a.event || '')}</strong></td>
                <td><span class="tier-badge tier-board">${escapeHtml(a.position)}</span></td>
                <td>${escapeHtml(a.team_name || a.team || '')}</td>
                <td>${escapeHtml(a.year)}</td>
                <td>
                    <div class="action-btns-group">
                        <button class="btn-icon delete" onclick="deleteAchievement('${a.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.deleteAchievement = async function(id) {
        if (window.supabaseClient && !id.startsWith('ac_')) {
            await window.supabaseClient.from('achievements').delete().eq('id', id);
        }
        const store = getStore();
        store.achievements = store.achievements.filter(a => a.id !== id);
        saveStore(store);
        renderDashboard();
        showToast("Removed achievement record.");
    };

    // ----------------------------------------------------------------------
    // 8. CONTACT INBOX RENDER
    // ----------------------------------------------------------------------
    function renderInboxList(inboxList = []) {
        const container = document.getElementById('inbox-list-container');
        if (!container) return;
        if (inboxList.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--admin-text-muted); padding:2rem;">No messages in inbox.</p>`;
            return;
        }
        container.innerHTML = inboxList.map(item => `
            <div style="background:#0f172a; border:1px solid var(--admin-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <strong style="color:var(--admin-gold);">${escapeHtml(item.name)} &lt;${escapeHtml(item.email)}&gt;</strong>
                    <small style="color:var(--admin-text-muted);">${escapeHtml(item.date || new Date(item.created_at || Date.now()).toLocaleDateString())}</small>
                </div>
                <h4 style="margin-bottom:0.5rem;">Subject: ${escapeHtml(item.subject)}</h4>
                <p style="color:var(--admin-text-muted); font-size:0.9rem; line-height:1.5;">${escapeHtml(item.message)}</p>
            </div>
        `).join('');
    }

    // ----------------------------------------------------------------------
    // 9. UTILS & TOAST SYSTEM
    // ----------------------------------------------------------------------
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    checkAuthSession();
});
