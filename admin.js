/* ==========================================================================
   Grandeur SSCBS - Admin Console JavaScript (Supabase Integrated)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let cachedTeam = [];
    let cachedPrimers = [];
    let cachedAlumni = [];

    function getSupabase() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
            return window.supabaseClient;
        }
        return null;
    }

    // Default Fallback
    const DEFAULT_STORE = {
        recruitment: {
            active: false,
            title: "Grandeur Recruitment Drive 2026",
            description: "Join the premier Consulting & Knowledge Cell of SSCBS.",
            formUrl: "https://forms.google.com/",
            deadline: "August 20, 2026 - 11:59 PM IST"
        },
        banner: {
            active: true,
            text: "🚀 Grandeur Recruitments 2026 are officially open!",
            btnText: "Apply Now",
            btnUrl: "contact-us.html"
        },
        team: [],
        inbox: []
    };

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

    // AUTHENTICATION
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
        const isAuth = sessionStorage.getItem('grandeur_admin_authenticated') === 'true' || localStorage.getItem('grandeur_admin_authenticated') === 'true';
        if (isAuth) {
            if (loginView) loginView.style.display = 'none';
            if (dashboardView) dashboardView.style.display = 'block';
            if (adminUserActions) adminUserActions.style.display = 'flex';
            restoreActiveTab();
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

    function doAdminLogin(e) {
        if (e) e.preventDefault();
        const val = passcodeInput ? passcodeInput.value.trim() : "";
        if (val.length > 0) {
            sessionStorage.setItem('grandeur_admin_authenticated', 'true');
            localStorage.setItem('grandeur_admin_authenticated', 'true');
            if (authErrorAlert) authErrorAlert.style.display = 'none';
            showToast("✅ Successfully authenticated!");
            checkAuthSession();
        } else {
            if (authErrorAlert) authErrorAlert.style.display = 'block';
            showToast("❌ Please enter a passcode.");
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', doAdminLogin);
    }
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', doAdminLogin);
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('grandeur_admin_authenticated');
            localStorage.removeItem('grandeur_admin_authenticated');
            showToast("👋 Signed out of admin console.");
            checkAuthSession();
        });
    }

    // TAB NAVIGATION WITH PERSISTENCE
    const tabButtons = document.querySelectorAll('.admin-nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function activateTab(tabId) {
        if (!tabId) return;
        const targetBtn = document.querySelector(`.admin-nav-item[data-tab="${tabId}"]`);
        const targetPanel = document.getElementById(tabId);
        if (!targetPanel) return;

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        if (targetBtn) targetBtn.classList.add('active');
        targetPanel.classList.add('active');
        localStorage.setItem('grandeur_admin_active_tab', tabId);
        if (history.replaceState) {
            history.replaceState(null, null, '#' + tabId);
        } else {
            location.hash = tabId;
        }
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            activateTab(targetTab);
        });
    });

    function restoreActiveTab() {
        const hashTab = location.hash.replace('#', '');
        let savedTab = hashTab || localStorage.getItem('grandeur_admin_active_tab') || 'tab-team';
        if (['tab-overview', 'tab-recruitment', 'tab-achievements'].includes(savedTab)) {
            savedTab = 'tab-team';
        }
        activateTab(savedTab);
    }

    cachedTeam = [];
    cachedPrimers = [];

    // DASHBOARD RENDER
    async function renderDashboard() {
        let recruitmentData = null;
        let bannerData = null;
        let teamData = null;
        let inboxData = [];

        if (window.GrandeurDB) {
            try {
                recruitmentData = await window.GrandeurDB.getRecruitment();
                bannerData = await window.GrandeurDB.getBanner();
                teamData = await window.GrandeurDB.getTeamMembers();
                inboxData = await window.GrandeurDB.getContactInquiries();
                cachedPrimers = await window.GrandeurDB.getKnowledgePrimers();
                cachedAlumni = await window.GrandeurDB.getAlumniMembers();
            } catch (err) {
                console.warn("GrandeurDB fetch warning:", err);
            }
        }

        const localStore = getStore();

        const recruitment = recruitmentData || localStore.recruitment;
        const banner = bannerData || localStore.banner;
        cachedTeam = teamData !== null ? teamData : localStore.team;
        const inbox = Array.isArray(inboxData) ? inboxData : [];

        // Stats
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

        const statInboxCount = document.getElementById('stat-inbox-count');
        if (statInboxCount) statInboxCount.textContent = inbox.length;

        const inboxBadge = document.getElementById('inbox-count-badge');
        if (inboxBadge) inboxBadge.textContent = inbox.length;

        // Controls
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

        const switchBanner = document.getElementById('switch-banner-active');
        if (switchBanner) switchBanner.checked = banner.active;

        const inputBannerText = document.getElementById('banner-text');
        if (inputBannerText) inputBannerText.value = banner.text || "";

        const inputBannerBtnText = document.getElementById('banner-btn-text');
        if (inputBannerBtnText) inputBannerBtnText.value = banner.btnText || "";

        const inputBannerBtnUrl = document.getElementById('banner-btn-url');
        if (inputBannerBtnUrl) inputBannerBtnUrl.value = banner.btnUrl || "";

        renderTeamTable(cachedTeam);
        renderKnowledgeTable(cachedPrimers);
        renderInboxList(inbox);
        renderAlumniTable(cachedAlumni);
    }

    // FORMS SUBMISSION
    const switchRecruitment = document.getElementById('switch-recruitment-active');
    if (switchRecruitment) {
        switchRecruitment.addEventListener('change', async () => {
            const active = switchRecruitment.checked;
            if (window.GrandeurDB) {
                await window.GrandeurDB.updateRecruitment({ active });
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

            if (window.GrandeurDB) {
                await window.GrandeurDB.updateRecruitment({ active, title, description, form_url: formUrl, deadline });
            }

            const store = getStore();
            store.recruitment = { active, title, description, formUrl, deadline };
            saveStore(store);
            renderDashboard();
            showToast("✅ Recruitment settings updated!");
        });
    }

    const switchBanner = document.getElementById('switch-banner-active');
    if (switchBanner) {
        switchBanner.addEventListener('change', async () => {
            const active = switchBanner.checked;
            if (window.GrandeurDB) {
                await window.GrandeurDB.updateBanner({ active });
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

            if (window.GrandeurDB) {
                await window.GrandeurDB.updateBanner({ active, text, btn_text: btnText, btn_url: btnUrl });
            }

            const store = getStore();
            store.banner = { active, text, btnText, btnUrl };
            saveStore(store);
            renderDashboard();
            showToast("✅ Announcement banner saved!");
        });
    }

    // TEAM CRUD
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
            teamTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">No team members found. Click "Add New Member" to add one.</td></tr>`;
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

    const modalMember = document.getElementById('modal-member');
    const btnOpenAddMember = document.getElementById('btn-open-add-member-modal');
    const quickAddMember = document.getElementById('quick-add-member');
    const btnCloseMemberModal = document.getElementById('btn-close-member-modal');
    const btnCancelMemberModal = document.getElementById('btn-cancel-member-modal');
    const formMemberModal = document.getElementById('form-member-modal');

    // Image File Upload Reader
    const photoFileInput = document.getElementById('member-photo-file');
    const photoHiddenInput = document.getElementById('member-photo');
    const photoPreviewImg = document.getElementById('photo-preview-img');
    const photoPreviewIcon = document.getElementById('photo-preview-icon');

    if (photoFileInput) {
        photoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const dataUrl = evt.target.result;
                    if (photoHiddenInput) photoHiddenInput.value = dataUrl;
                    updatePhotoPreview(dataUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function updatePhotoPreview(url) {
        if (url && photoPreviewImg && photoPreviewIcon) {
            photoPreviewImg.src = url;
            photoPreviewImg.style.display = 'block';
            photoPreviewIcon.style.display = 'none';
        } else if (photoPreviewImg && photoPreviewIcon) {
            photoPreviewImg.src = '';
            photoPreviewImg.style.display = 'none';
            photoPreviewIcon.style.display = 'block';
        }
    }

    function openMemberModal(member = null) {
        if (!modalMember) return;
        const modalTitle = document.getElementById('modal-member-title');
        const inputId = document.getElementById('member-edit-id');
        const inputName = document.getElementById('member-name');
        const inputRole = document.getElementById('member-role');
        const inputTier = document.getElementById('member-tier');
        const inputPhoto = document.getElementById('member-photo');
        const inputLinkedin = document.getElementById('member-linkedin');

        if (photoFileInput) photoFileInput.value = '';

        if (member) {
            modalTitle.textContent = "Edit Team Member";
            inputId.value = member.id;
            inputName.value = member.name;
            inputRole.value = member.role;
            inputTier.value = member.tier;
            inputPhoto.value = member.photo || "";
            inputLinkedin.value = member.linkedin || "";
            updatePhotoPreview(member.photo);
        } else {
            modalTitle.textContent = "Add Team Member";
            inputId.value = "";
            inputName.value = "";
            inputRole.value = "";
            inputTier.value = "coordinators";
            inputPhoto.value = "";
            inputLinkedin.value = "";
            updatePhotoPreview("");
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

            if (window.GrandeurDB) {
                try {
                    if (editId) {
                        await window.GrandeurDB.updateTeamMember(editId, { name, role, tier, photo, linkedin });
                    } else {
                        await window.GrandeurDB.insertTeamMember({ name, role, tier, photo, linkedin });
                    }
                } catch(err) {
                    console.error("GrandeurDB save error:", err);
                    showToast(`⚠️ Error saving: ${err.message}`);
                    return;
                }
            }

            showToast(`✅ Saved team member: ${name}`);
            closeMemberModal();
            await renderDashboard();
            window.dispatchEvent(new Event('grandeur_store_updated'));
        });
    }

    window.editTeamMember = function(id) {
        const member = cachedTeam.find(m => m.id === id);
        if (member) openMemberModal(member);
    };

    window.deleteTeamMember = async function(id) {
        const member = cachedTeam.find(m => m.id === id);
        if (member && confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
            if (window.GrandeurDB) {
                try {
                    await window.GrandeurDB.deleteTeamMember(id);
                } catch(err) {
                    console.error("GrandeurDB delete error:", err);
                    showToast(`⚠️ Delete failed: ${err.message}`);
                    return;
                }
            }
            showToast(`Removed team member: ${member.name}`);
            await renderDashboard();
            window.dispatchEvent(new Event('grandeur_store_updated'));
        }
    };

    // KNOWLEDGE PRIMERS CRUD
    const knowledgeTableBody = document.getElementById('knowledge-table-body');
    const modalPrimer = document.getElementById('modal-primer');
    const btnOpenAddPrimer = document.getElementById('btn-open-add-primer-modal');
    const btnClosePrimerModal = document.getElementById('btn-close-primer-modal');
    const btnCancelPrimerModal = document.getElementById('btn-cancel-primer-modal');
    const formPrimerModal = document.getElementById('form-primer-modal');

    function renderKnowledgeTable(primersList = cachedPrimers) {
        if (!knowledgeTableBody) return;
        if (!primersList || primersList.length === 0) {
            knowledgeTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">No research publications found. Click "Add New Primer" to publish one.</td></tr>`;
            return;
        }

        knowledgeTableBody.innerHTML = primersList.map(item => `
            <tr>
                <td><strong>${escapeHtml(item.title)}</strong></td>
                <td><span class="tier-badge tier-core">${escapeHtml(item.category)}</span></td>
                <td>${escapeHtml(item.date_label || item.year || '2026')}</td>
                <td>${item.read_time ? escapeHtml(item.read_time) : '—'}</td>
                <td style="text-align: right;">
                    <div class="action-btns-group" style="justify-content: flex-end;">
                        ${item.pdf_url ? `<a href="${escapeHtml(item.pdf_url)}" target="_blank" class="btn-icon" title="Open Report" style="text-decoration:none;">🔗</a>` : ''}
                        <button class="btn-icon" onclick="editKnowledgePrimer('${item.id}')" title="Edit">✏️</button>
                        <button class="btn-icon delete" onclick="deleteKnowledgePrimer('${item.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openPrimerModal(primer = null) {
        if (!modalPrimer) return;
        const modalTitle = document.getElementById('modal-primer-title');
        const inputId = document.getElementById('primer-edit-id');
        const inputTitle = document.getElementById('primer-title');
        const inputCategory = document.getElementById('primer-category');
        const inputDate = document.getElementById('primer-date');
        const inputReadTime = document.getElementById('primer-read-time');
        const inputPdfUrl = document.getElementById('primer-pdf-url');

        if (primer) {
            modalTitle.textContent = "Edit Publication";
            inputId.value = primer.id;
            inputTitle.value = primer.title || "";
            inputCategory.value = primer.category || "Industry Report";
            inputDate.value = primer.date_label || primer.year || "2026";
            inputReadTime.value = primer.read_time || "";
            inputPdfUrl.value = primer.pdf_url || "";
        } else {
            modalTitle.textContent = "Add Publication";
            inputId.value = "";
            inputTitle.value = "";
            inputCategory.value = "Industry Report";
            inputDate.value = "2026";
            inputReadTime.value = "";
            inputPdfUrl.value = "";
        }
        modalPrimer.style.display = 'flex';
    }

    function closePrimerModal() {
        if (modalPrimer) modalPrimer.style.display = 'none';
    }

    if (btnOpenAddPrimer) btnOpenAddPrimer.addEventListener('click', () => openPrimerModal());
    if (btnClosePrimerModal) btnClosePrimerModal.addEventListener('click', closePrimerModal);
    if (btnCancelPrimerModal) btnCancelPrimerModal.addEventListener('click', closePrimerModal);

    if (formPrimerModal) {
        formPrimerModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('primer-edit-id').value;
            const title = document.getElementById('primer-title').value.trim();
            const category = document.getElementById('primer-category').value;
            const date_label = document.getElementById('primer-date').value.trim();
            const read_time = document.getElementById('primer-read-time').value.trim();
            const pdf_url = document.getElementById('primer-pdf-url').value.trim();

            if (!pdf_url) {
                showToast('⚠️ Please paste a report link.');
                return;
            }

            const saveBtn = document.getElementById('btn-save-primer');
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Saving...'; }

            if (window.GrandeurDB) {
                try {
                    if (editId) {
                        await window.GrandeurDB.updateKnowledgePrimer(editId, { title, category, date_label, read_time, pdf_url });
                    } else {
                        await window.GrandeurDB.insertKnowledgePrimer({ title, category, date_label, read_time, pdf_url });
                    }
                } catch(err) {
                    console.error("Primer save error:", err);
                    showToast(`⚠️ Error saving: ${err.message}`);
                    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Publication'; }
                    return;
                }
            }

            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Publication'; }
            showToast(`✅ Published: ${title}`);
            closePrimerModal();
            await renderDashboard();
        });
    }

    window.editKnowledgePrimer = function(id) {
        const primer = cachedPrimers.find(p => p.id === id);
        if (primer) openPrimerModal(primer);
    };

    window.deleteKnowledgePrimer = async function(id) {
        const primer = cachedPrimers.find(p => p.id === id);
        if (primer && confirm(`Are you sure you want to delete "${primer.title}"?`)) {
            if (window.GrandeurDB) {
                try {
                    await window.GrandeurDB.deleteKnowledgePrimer(id);
                } catch(err) {
                    console.error("Primer delete error:", err);
                    showToast(`⚠️ Delete failed: ${err.message}`);
                    return;
                }
            }
            showToast(`Removed publication: ${primer.title}`);
            await renderDashboard();
        }
    };

    // INBOX RENDER
    function renderInboxList(inboxList = []) {
        const container = document.getElementById('inbox-list-container');
        if (!container) return;
        if (inboxList.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--admin-text-muted); padding:3rem;">📬 No contact inquiries yet. Messages submitted via the "Contact Us" page will appear here instantly.</p>`;
            return;
        }
        container.innerHTML = inboxList.map(item => `
            <div style="background:#0f172a; border:1px solid var(--admin-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <strong style="color:var(--admin-gold); font-size:1.05rem;">${escapeHtml(item.name)}</strong>
                        <a href="mailto:${escapeHtml(item.email)}" style="color:var(--admin-accent-blue); font-size:0.9rem; margin-left:0.5rem; text-decoration:underline;">&lt;${escapeHtml(item.email)}&gt;</a>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <small style="color:var(--admin-text-muted);">${escapeHtml(item.date || new Date(item.created_at || Date.now()).toLocaleString())}</small>
                        <button class="btn-icon delete" onclick="deleteContactInquiry('${item.id}')" title="Delete Inquiry" style="padding:4px 8px;">🗑️</button>
                    </div>
                </div>
                <h4 style="margin-bottom:0.5rem; color:#f8fafc; font-size:0.98rem;">📌 Subject: ${escapeHtml(item.subject)}</h4>
                <p style="color:var(--admin-text-muted); font-size:0.93rem; line-height:1.6; white-space:pre-wrap; background:rgba(0,0,0,0.25); padding:0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.05); margin:0;">${escapeHtml(item.message)}</p>
            </div>
        `).join('');
    }

    window.deleteContactInquiry = async function(id) {
        if (confirm("Are you sure you want to delete this inquiry from the inbox?")) {
            if (window.GrandeurDB) {
                try {
                    await window.GrandeurDB.deleteContactInquiry(id);
                } catch(err) {
                    console.error("Inquiry delete error:", err);
                    showToast(`⚠️ Delete failed: ${err.message}`);
                    return;
                }
            }
            showToast("🗑️ Removed inquiry from inbox");
            await renderDashboard();
        }
    };

    // ALUMNI NETWORK CRUD
    const alumniTableBody = document.getElementById('alumni-table-body');
    const modalAlumni = document.getElementById('modal-alumni');
    const btnOpenAddAlumni = document.getElementById('btn-open-add-alumni-modal');
    const btnCloseAlumniModal = document.getElementById('btn-close-alumni-modal');
    const btnCancelAlumniModal = document.getElementById('btn-cancel-alumni-modal');
    const formAlumniModal = document.getElementById('form-alumni-modal');
    const alumniPhotoFile = document.getElementById('alumni-photo-file');
    const alumniPhotoInput = document.getElementById('alumni-photo');
    const alumniPhotoPreviewImg = document.getElementById('alumni-photo-preview-img');
    const alumniPhotoPreviewIcon = document.getElementById('alumni-photo-preview-icon');

    if (alumniPhotoFile) {
        alumniPhotoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                showToast(`⏳ Optimizing image: ${file.name}...`);
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const maxDim = 300;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                            if (width > maxDim) { height *= maxDim / width; width = maxDim; }
                        } else {
                            if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                        if (alumniPhotoInput) alumniPhotoInput.value = compressedBase64;
                        if (alumniPhotoPreviewImg) {
                            alumniPhotoPreviewImg.src = compressedBase64;
                            alumniPhotoPreviewImg.style.display = 'block';
                        }
                        if (alumniPhotoPreviewIcon) alumniPhotoPreviewIcon.style.display = 'none';
                        showToast(`✅ Photo optimized (${(compressedBase64.length / 1024).toFixed(0)}KB)`);
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function getBatchYear(item) {
        const match = (item.role || '').match(/20\d\d/);
        return match ? parseInt(match[0], 10) : 0;
    }

    function renderAlumniTable(alumniList = cachedAlumni) {
        if (!alumniTableBody) return;
        if (!alumniList || alumniList.length === 0) {
            alumniTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">No alumni records found. Click "Add Alumni Member" to create one.</td></tr>`;
            return;
        }

        // Sort descending by batch year (2025 -> 2024 -> 2023...)
        const sorted = [...alumniList].sort((a, b) => getBatchYear(b) - getBatchYear(a));

        alumniTableBody.innerHTML = sorted.map(item => {
            const parts = (item.role || '').split('|');
            let batch = 'Alumni';
            let roleAndPlacement = item.role || '';
            if (parts.length > 1) {
                batch = parts[0].trim();
                roleAndPlacement = parts.slice(1).join('|').trim();
            }
            const roleSubParts = roleAndPlacement.split('•');
            const formerRole = roleSubParts[0] ? roleSubParts[0].trim() : 'Alumnus';
            const placement = roleSubParts[1] ? roleSubParts[1].trim() : '—';

            return `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            ${item.photo ? `<img src="${item.photo}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--admin-gold);">` : `<div style="width:36px; height:36px; border-radius:50%; background:#0f172a; border:1px dashed var(--admin-gold); display:flex; align-items:center; justify-content:center; font-size:0.9rem;">🎓</div>`}
                            <strong>${escapeHtml(item.name)}</strong>
                        </div>
                    </td>
                    <td><span class="tier-badge tier-core">${escapeHtml(batch)}</span></td>
                    <td>${escapeHtml(formerRole)}</td>
                    <td>${escapeHtml(placement)}</td>
                    <td style="text-align: right;">
                        <div class="action-btns-group" style="justify-content: flex-end;">
                            ${item.linkedin ? `<a href="${escapeHtml(item.linkedin)}" target="_blank" class="btn-icon" title="LinkedIn" style="text-decoration:none;">🔗</a>` : ''}
                            <button class="btn-icon" onclick="editAlumniMember('${item.id}')" title="Edit">✏️</button>
                            <button class="btn-icon delete" onclick="deleteAlumniMember('${item.id}')" title="Delete">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function openAlumniModal(alumnus = null) {
        if (!modalAlumni) return;
        const modalTitle = document.getElementById('modal-alumni-title');
        const inputId = document.getElementById('alumni-edit-id');
        const inputName = document.getElementById('alumni-name');
        const inputBatch = document.getElementById('alumni-batch');
        const inputFormerRole = document.getElementById('alumni-former-role');
        const inputPlacement = document.getElementById('alumni-placement');
        const inputLinkedin = document.getElementById('alumni-linkedin');

        if (alumniPhotoFile) alumniPhotoFile.value = '';
        if (alumniPhotoInput) alumniPhotoInput.value = '';
        if (alumniPhotoPreviewImg) { alumniPhotoPreviewImg.src = ''; alumniPhotoPreviewImg.style.display = 'none'; }
        if (alumniPhotoPreviewIcon) alumniPhotoPreviewIcon.style.display = 'block';

        if (alumnus) {
            modalTitle.textContent = "Edit Alumni Member";
            inputId.value = alumnus.id;
            inputName.value = alumnus.name || "";
            
            const parts = (alumnus.role || '').split('|');
            if (parts.length > 1) {
                inputBatch.value = parts[0].replace(/^Batch of\s*/i, '').trim();
                const roleSub = parts.slice(1).join('|').trim().split('•');
                inputFormerRole.value = roleSub[0] ? roleSub[0].trim() : '';
                inputPlacement.value = roleSub[1] ? roleSub[1].trim() : '';
            } else {
                inputBatch.value = "2025";
                inputFormerRole.value = alumnus.role || "";
                inputPlacement.value = "";
            }
            inputLinkedin.value = alumnus.linkedin || "";

            if (alumnus.photo) {
                if (alumniPhotoInput) alumniPhotoInput.value = alumnus.photo;
                if (alumniPhotoPreviewImg) { alumniPhotoPreviewImg.src = alumnus.photo; alumniPhotoPreviewImg.style.display = 'block'; }
                if (alumniPhotoPreviewIcon) alumniPhotoPreviewIcon.style.display = 'none';
            }
        } else {
            modalTitle.textContent = "Add Alumni Member";
            inputId.value = "";
            inputName.value = "";
            inputBatch.value = "2025";
            inputFormerRole.value = "";
            inputPlacement.value = "";
            inputLinkedin.value = "";
        }
        modalAlumni.style.display = 'flex';
    }

    function closeAlumniModal() {
        if (modalAlumni) modalAlumni.style.display = 'none';
    }

    if (btnOpenAddAlumni) btnOpenAddAlumni.addEventListener('click', () => openAlumniModal());
    if (btnCloseAlumniModal) btnCloseAlumniModal.addEventListener('click', closeAlumniModal);
    if (btnCancelAlumniModal) btnCancelAlumniModal.addEventListener('click', closeAlumniModal);

    if (formAlumniModal) {
        formAlumniModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('alumni-edit-id').value;
            const name = document.getElementById('alumni-name').value.trim();
            const batch = document.getElementById('alumni-batch').value.trim();
            const formerRole = document.getElementById('alumni-former-role').value.trim();
            const placement = document.getElementById('alumni-placement').value.trim();
            const linkedin = document.getElementById('alumni-linkedin').value.trim();
            const photo = alumniPhotoInput ? alumniPhotoInput.value : "";

            const formattedRole = `Batch of ${batch.replace(/^Batch of\s*/i, '')} | ${formerRole} • ${placement}`;

            const saveBtn = document.getElementById('btn-save-alumni');
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Saving...'; }

            if (window.GrandeurDB) {
                try {
                    if (editId) {
                        await window.GrandeurDB.updateAlumniMember(editId, { name, role: formattedRole, linkedin, photo });
                    } else {
                        await window.GrandeurDB.insertAlumniMember({ name, role: formattedRole, linkedin, photo });
                    }
                } catch(err) {
                    console.error("Alumni save error:", err);
                    showToast(`⚠️ Error saving alumni: ${err.message}`);
                    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Alumni Member'; }
                    return;
                }
            }

            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Alumni Member'; }
            showToast(`✅ Saved alumni: ${name}`);
            closeAlumniModal();
            await renderDashboard();
        });
    }

    window.editAlumniMember = function(id) {
        const alumnus = cachedAlumni.find(a => a.id === id);
        if (alumnus) openAlumniModal(alumnus);
    };

    window.deleteAlumniMember = async function(id) {
        const alumnus = cachedAlumni.find(a => a.id === id);
        if (alumnus && confirm(`Are you sure you want to remove "${alumnus.name}" from Alumni?`)) {
            if (window.GrandeurDB) {
                try {
                    await window.GrandeurDB.deleteAlumniMember(id);
                } catch(err) {
                    console.error("Alumni delete error:", err);
                    showToast(`⚠️ Delete failed: ${err.message}`);
                    return;
                }
            }
            showToast(`Removed alumni: ${alumnus.name}`);
            await renderDashboard();
        }
    };

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
