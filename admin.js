/* ==========================================================================
   Grandeur SSCBS - Admin Console JavaScript (Supabase Integrated)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let cachedTeam = [];
    let cachedPrimers = [];

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

    // TAB NAVIGATION
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
            } catch (err) {
                console.warn("GrandeurDB fetch warning:", err);
            }
        }

        const localStore = getStore();

        const recruitment = recruitmentData || localStore.recruitment;
        const banner = bannerData || localStore.banner;
        cachedTeam = teamData !== null ? teamData : localStore.team;
        const inbox = inboxData.length > 0 ? inboxData : localStore.inbox;

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
    const primerPdfFile = document.getElementById('primer-pdf-file');
    const primerPdfUrl = document.getElementById('primer-pdf-url');

    if (primerPdfFile) {
        primerPdfFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    if (primerPdfUrl) primerPdfUrl.value = evt.target.result;
                    showToast(`📄 Document loaded: ${file.name}`);
                };
                reader.readAsDataURL(file);
            }
        });
    }

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
                <td>${item.read_time ? escapeHtml(item.read_time) : 'PDF Document'}</td>
                <td style="text-align: right;">
                    <div class="action-btns-group" style="justify-content: flex-end;">
                        ${item.pdf_url ? `<a href="${escapeHtml(item.pdf_url)}" target="_blank" class="btn-icon" title="View Document" style="text-decoration:none;">📄</a>` : ''}
                        <button class="btn-icon" onclick="editKnowledgePrimer('${item.id}')" title="Edit Publication">✏️</button>
                        <button class="btn-icon delete" onclick="deleteKnowledgePrimer('${item.id}')" title="Delete Publication">🗑️</button>
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

        if (primerPdfFile) primerPdfFile.value = '';

        if (primer) {
            modalTitle.textContent = "Edit Publication";
            inputId.value = primer.id;
            inputTitle.value = primer.title || "";
            inputCategory.value = primer.category || "Industry Report";
            inputDate.value = primer.date_label || primer.year || "2026";
            inputReadTime.value = primer.read_time || "5 min read";
            inputPdfUrl.value = primer.pdf_url || "";
        } else {
            modalTitle.textContent = "Add Knowledge Primer / Publication";
            inputId.value = "";
            inputTitle.value = "";
            inputCategory.value = "Industry Report";
            inputDate.value = "2026";
            inputReadTime.value = "5 min read";
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

            if (window.GrandeurDB) {
                try {
                    if (editId) {
                        await window.GrandeurDB.updateKnowledgePrimer(editId, { title, category, date_label, read_time, pdf_url });
                    } else {
                        await window.GrandeurDB.insertKnowledgePrimer({ title, category, date_label, read_time, pdf_url });
                    }
                } catch(err) {
                    console.error("Primer save error:", err);
                    showToast(`⚠️ Error saving publication: ${err.message}`);
                    return;
                }
            }

            showToast(`✅ Saved publication: ${title}`);
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
