/**
 * Portfolio Admin Portal Controller
 * Full CRUD operations, authentication guard, real-time metrics, and data backup.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initSidebar();
    initFormsAndModals();
    initProfileSettings();
    initBackupSettings();

    // Check auth status
    if (window.PortfolioStore && window.PortfolioStore.isAuthenticated()) {
        showAdminApp();
        loadAllAdminData();
    } else {
        showLoginScreen();
    }

    // Auto-refresh data if changed externally
    window.addEventListener('portfolioDataUpdated', () => {
        loadAllAdminData();
    });
});

/* =========================================
   AUTHENTICATION MODULE
   ========================================= */
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const pinInput = document.getElementById('admin-pin-input');
    const togglePinBtn = document.getElementById('toggle-pin-btn');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Toggle PIN visibility
    if (togglePinBtn && pinInput) {
        togglePinBtn.addEventListener('click', () => {
            const isPassword = pinInput.getAttribute('type') === 'password';
            pinInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePinBtn.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = pinInput.value.trim();

            if (window.PortfolioStore.login(pin)) {
                if (loginError) loginError.style.display = 'none';
                pinInput.value = '';
                showAdminApp();
                loadAllAdminData();
                showAdminToast('Welcome back, Admin!', 'success');
            } else {
                if (loginError) {
                    loginError.textContent = 'Invalid PIN code. Please try again.';
                    loginError.style.display = 'block';
                }
                pinInput.focus();
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.PortfolioStore.logout();
            showLoginScreen();
            showAdminToast('Logged out successfully.', 'info');
        });
    }
}

function showLoginScreen() {
    const loginOverlay = document.getElementById('login-overlay');
    const adminApp = document.getElementById('admin-app');
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminApp) adminApp.style.display = 'none';
}

function showAdminApp() {
    const loginOverlay = document.getElementById('login-overlay');
    const adminApp = document.getElementById('admin-app');
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminApp) adminApp.style.display = 'flex';
}

/* =========================================
   SIDEBAR & TAB NAVIGATION
   ========================================= */
let currentTab = 'overview';

function initSidebar() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pageTitle = document.getElementById('topbar-page-title');
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('admin-sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);

            // Close sidebar on mobile
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

function switchTab(tabId) {
    currentTab = tabId;

    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    // Update topbar title
    const titles = {
        overview: 'Dashboard Overview',
        projects: 'Projects Management',
        skills: 'Skills & Tech Stack',
        profile: 'Profile & About Customization',
        messages: 'Contact Messages & Inquiries',
        settings: 'Backup & System Settings'
    };

    const titleEl = document.getElementById('topbar-page-title');
    if (titleEl && titles[tabId]) {
        titleEl.textContent = titles[tabId];
    }
}

/* =========================================
   DATA LOADING & METRICS
   ========================================= */
function loadAllAdminData() {
    if (!window.PortfolioStore) return;
    const data = window.PortfolioStore.getData();

    updateMetrics(data);
    renderAdminProjects(data.projects);
    renderAdminSkills(data.skills);
    renderAdminMessages(data.messages);
    populateProfileForm(data.profile);
}

function updateMetrics(data) {
    const totalProjectsEl = document.getElementById('metric-total-projects');
    const totalSkillsEl = document.getElementById('metric-total-skills');
    const totalMessagesEl = document.getElementById('metric-total-messages');
    const profileScoreEl = document.getElementById('metric-profile-score');

    const sidebarProjectsBadge = document.getElementById('badge-projects-count');
    const sidebarSkillsBadge = document.getElementById('badge-skills-count');
    const sidebarMessagesBadge = document.getElementById('badge-messages-count');

    const projectsCount = (data.projects || []).length;
    const skillsCount = (data.skills || []).length;
    const messages = data.messages || [];
    const unreadMessagesCount = messages.filter(m => !m.read).length;

    if (totalProjectsEl) totalProjectsEl.textContent = projectsCount;
    if (totalSkillsEl) totalSkillsEl.textContent = skillsCount;
    if (totalMessagesEl) totalMessagesEl.textContent = messages.length;

    if (sidebarProjectsBadge) sidebarProjectsBadge.textContent = projectsCount;
    if (sidebarSkillsBadge) sidebarSkillsBadge.textContent = skillsCount;
    if (sidebarMessagesBadge) {
        sidebarMessagesBadge.textContent = unreadMessagesCount;
        sidebarMessagesBadge.className = unreadMessagesCount > 0 ? 'nav-badge alert' : 'nav-badge';
    }

    // Profile Completion Calculation
    const profile = data.profile || {};
    const checkFields = ['name', 'title', 'bioShort', 'bioFull', 'email', 'phone', 'location', 'linkedin', 'github'];
    const completed = checkFields.filter(f => profile[f] && profile[f].trim().length > 0).length;
    const percent = Math.round((completed / checkFields.length) * 100);

    if (profileScoreEl) profileScoreEl.textContent = `${percent}%`;

    // Overview table previews
    renderRecentMessagesPreview(messages.slice(0, 5));
}

function renderRecentMessagesPreview(recent = []) {
    const container = document.getElementById('overview-recent-messages');
    if (!container) return;

    if (recent.length === 0) {
        container.innerHTML = `<p style="padding: 20px; color: var(--text-muted); text-align: center;">No contact messages received yet.</p>`;
        return;
    }

    container.innerHTML = recent.map(m => `
        <div class="message-item ${m.read ? '' : 'unread'}">
            <div>
                <div class="message-header">
                    <span class="message-sender">${m.name}</span>
                    <span class="message-email">${m.email}</span>
                    <span class="message-type-badge">${m.projectType || 'Inquiry'}</span>
                    <span class="message-time">${formatDate(m.date)}</span>
                </div>
                <div class="message-body">${m.message.slice(0, 120)}${m.message.length > 120 ? '...' : ''}</div>
            </div>
            <div class="message-actions">
                <a href="mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.projectType || 'Portfolio Inquiry')}" class="action-icon-btn" title="Reply via Email"><i class="fas fa-reply"></i></a>
                <button class="action-icon-btn" onclick="toggleMessageRead('${m.id}', ${!m.read})" title="${m.read ? 'Mark as Unread' : 'Mark as Read'}">
                    <i class="fas ${m.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/* =========================================
   PROJECTS MANAGEMENT CRUD
   ========================================= */
let projectFilterCategory = 'All';
let projectSearchQuery = '';

function renderAdminProjects(projects = []) {
    const tbody = document.getElementById('projects-table-body');
    if (!tbody) return;

    let filtered = projects;

    if (projectFilterCategory !== 'All') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === projectFilterCategory.toLowerCase());
    }

    if (projectSearchQuery) {
        filtered = filtered.filter(p => 
            (p.title || '').toLowerCase().includes(projectSearchQuery) ||
            (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(projectSearchQuery)))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No projects found matching the criteria.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []);
        return `
            <tr>
                <td>
                    <img src="${p.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'}" alt="${p.title}" class="project-row-thumb">
                </td>
                <td>
                    <strong style="color: var(--text-white); font-size: 14px;">${p.title}</strong>
                    <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">${(p.description || '').slice(0, 50)}...</div>
                </td>
                <td><span style="color: var(--purple-primary); font-weight: 500;">${p.category || 'General'}</span></td>
                <td>
                    ${tags.slice(0, 3).map(t => `<span class="tag-badge">${t.trim()}</span>`).join('')}
                    ${tags.length > 3 ? `<span class="tag-badge">+${tags.length - 3}</span>` : ''}
                </td>
                <td>
                    <button class="action-icon-btn" onclick="toggleProjectFeatured('${p.id}')" title="Toggle Featured">
                        ${p.featured ? '<span class="badge-featured"><i class="fas fa-star"></i> Featured</span>' : '<span style="color: var(--text-muted);"><i class="far fa-star"></i> Standard</span>'}
                    </button>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <a href="${p.demoUrl || '#'}" target="_blank" class="action-icon-btn" title="Live Demo: ${p.demoUrl || 'Not set'}"><i class="fas fa-external-link-alt"></i></a>
                        <a href="${p.githubUrl || '#'}" target="_blank" class="action-icon-btn" title="GitHub Code: ${p.githubUrl || 'Not set'}"><i class="fab fa-github"></i></a>
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="action-icon-btn" onclick="openEditProjectModal('${p.id}')" title="Edit Project"><i class="fas fa-edit"></i></button>
                        <button class="action-icon-btn delete" onclick="confirmDeleteProject('${p.id}')" title="Delete Project"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Project Modal State & Actions
let editingProjectId = null;

function openAddProjectModal() {
    editingProjectId = null;
    document.getElementById('project-modal-title').textContent = 'Add New Project';
    document.getElementById('project-form').reset();
    document.getElementById('proj-image-preview').src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
    
    // Sensible defaults so buttons are never blank
    const profile = window.PortfolioStore.getProfile();
    document.getElementById('proj-demo-url').value = '#';
    document.getElementById('proj-github-url').value = (profile && profile.github) ? profile.github : 'https://github.com/Nityapatil03';
    
    openModal('project-modal');
}

function openEditProjectModal(id) {
    const project = window.PortfolioStore.getProjectById(id);
    if (!project) return;

    editingProjectId = id;
    document.getElementById('project-modal-title').textContent = 'Edit Project';

    document.getElementById('proj-title').value = project.title || '';
    document.getElementById('proj-category').value = project.category || 'Web';
    document.getElementById('proj-desc').value = project.description || '';
    document.getElementById('proj-image-url').value = project.image || '';
    document.getElementById('proj-image-preview').src = project.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
    document.getElementById('proj-tags').value = Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || '');
    document.getElementById('proj-demo-url').value = project.demoUrl || '#';
    document.getElementById('proj-github-url').value = project.githubUrl || '';
    document.getElementById('proj-featured').checked = !!project.featured;

    openModal('project-modal');
}

function handleProjectFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('proj-title').value.trim();
    const category = document.getElementById('proj-category').value;
    const description = document.getElementById('proj-desc').value.trim();
    const image = document.getElementById('proj-image-url').value.trim() || document.getElementById('proj-image-preview').src;
    const tagsRaw = document.getElementById('proj-tags').value.trim();
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    let demoUrl = document.getElementById('proj-demo-url').value.trim();
    let githubUrl = document.getElementById('proj-github-url').value.trim();
    const featured = document.getElementById('proj-featured').checked;

    if (!title || !description) {
        showAdminToast('Please fill in project title and description.', 'error');
        return;
    }

    // Auto-normalize URLs so protocol is present and buttons always link properly
    if (demoUrl && demoUrl !== '#' && !/^https?:\/\//i.test(demoUrl)) {
        demoUrl = 'https://' + demoUrl;
    }
    if (!demoUrl) demoUrl = '#';

    if (githubUrl && githubUrl !== '#' && !/^https?:\/\//i.test(githubUrl)) {
        githubUrl = 'https://' + githubUrl;
    }
    if (!githubUrl) {
        const profile = window.PortfolioStore.getProfile();
        githubUrl = (profile && profile.github) ? profile.github : 'https://github.com/Nityapatil03';
    }

    const payload = {
        title,
        category,
        description,
        image,
        tags,
        demoUrl,
        githubUrl,
        featured
    };

    if (editingProjectId) {
        window.PortfolioStore.updateProject(editingProjectId, payload);
        showAdminToast('Project updated successfully!', 'success');
    } else {
        window.PortfolioStore.addProject(payload);
        showAdminToast('New project added successfully!', 'success');
    }

    closeModal('project-modal');
    loadAllAdminData();
}

function toggleProjectFeatured(id) {
    const project = window.PortfolioStore.getProjectById(id);
    if (!project) return;
    window.PortfolioStore.updateProject(id, { featured: !project.featured });
    showAdminToast(`Project set to ${!project.featured ? 'Featured' : 'Standard'}.`, 'info');
    loadAllAdminData();
}

function confirmDeleteProject(id) {
    const project = window.PortfolioStore.getProjectById(id);
    if (!project) return;

    if (confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
        window.PortfolioStore.deleteProject(id);
        showAdminToast('Project deleted successfully.', 'success');
        loadAllAdminData();
    }
}

/* =========================================
   SKILLS MANAGEMENT CRUD
   ========================================= */
let skillFilterCategory = 'All';

function renderAdminSkills(skills = []) {
    const grid = document.getElementById('admin-skills-grid');
    if (!grid) return;

    let filtered = skills;
    if (skillFilterCategory !== 'All') {
        filtered = filtered.filter(s => (s.category || '').toLowerCase() === skillFilterCategory.toLowerCase());
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No skills in this category.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(s => `
        <div class="skill-admin-card">
            <div class="skill-admin-actions">
                <button class="action-icon-btn" onclick="openEditSkillModal('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-icon-btn delete" onclick="confirmDeleteSkill('${s.id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="skill-admin-top">
                <div class="skill-admin-icon"><i class="${s.icon || 'fas fa-code'}"></i></div>
                <div class="skill-admin-info">
                    <h4>${s.name}</h4>
                    <span>${s.category || 'General'} • ${s.level || 80}%</span>
                </div>
            </div>
            <div class="skill-progress-bar">
                <div class="skill-progress-fill" style="width: ${s.level || 80}%;"></div>
            </div>
        </div>
    `).join('');
}

let editingSkillId = null;

function openAddSkillModal() {
    editingSkillId = null;
    document.getElementById('skill-modal-title').textContent = 'Add New Skill';
    document.getElementById('skill-form').reset();
    document.getElementById('skill-level-val').textContent = '85%';
    document.getElementById('skill-level').value = 85;
    openModal('skill-modal');
}

function openEditSkillModal(id) {
    const skills = window.PortfolioStore.getSkills();
    const skill = skills.find(s => s.id === id);
    if (!skill) return;

    editingSkillId = id;
    document.getElementById('skill-modal-title').textContent = 'Edit Skill';
    document.getElementById('skill-name').value = skill.name || '';
    document.getElementById('skill-category').value = skill.category || 'Frontend';
    document.getElementById('skill-icon').value = skill.icon || 'fas fa-code';
    document.getElementById('skill-level').value = skill.level || 80;
    document.getElementById('skill-level-val').textContent = `${skill.level || 80}%`;

    openModal('skill-modal');
}

function handleSkillFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('skill-name').value.trim();
    const category = document.getElementById('skill-category').value;
    const icon = document.getElementById('skill-icon').value.trim() || 'fas fa-code';
    const level = parseInt(document.getElementById('skill-level').value, 10) || 80;

    if (!name) {
        showAdminToast('Please provide a skill name.', 'error');
        return;
    }

    const payload = { name, category, icon, level };

    if (editingSkillId) {
        window.PortfolioStore.updateSkill(editingSkillId, payload);
        showAdminToast('Skill updated successfully!', 'success');
    } else {
        window.PortfolioStore.addSkill(payload);
        showAdminToast('New skill added successfully!', 'success');
    }

    closeModal('skill-modal');
    loadAllAdminData();
}

function confirmDeleteSkill(id) {
    const skills = window.PortfolioStore.getSkills();
    const skill = skills.find(s => s.id === id);
    if (!skill) return;

    if (confirm(`Remove skill "${skill.name}"?`)) {
        window.PortfolioStore.deleteSkill(id);
        showAdminToast('Skill removed.', 'success');
        loadAllAdminData();
    }
}

/* =========================================
   MESSAGES INBOX
   ========================================= */
let messagesFilter = 'All';

function renderAdminMessages(messages = []) {
    const container = document.getElementById('admin-messages-list');
    if (!container) return;

    let filtered = messages;
    if (messagesFilter === 'Unread') filtered = filtered.filter(m => !m.read);
    if (messagesFilter === 'Read') filtered = filtered.filter(m => m.read);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 38px; color: var(--purple-primary); margin-bottom: 12px; display: block;"></i>
                <p>No messages found in this view.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(m => `
        <div class="message-item ${m.read ? '' : 'unread'}">
            <div style="flex: 1;">
                <div class="message-header">
                    <span class="message-sender">${m.name}</span>
                    <span class="message-email"><i class="fas fa-envelope"></i> ${m.email}</span>
                    <span class="message-type-badge">${m.projectType || 'General Inquiry'}</span>
                    <span class="message-time">${formatDate(m.date)}</span>
                </div>
                <div class="message-body">${m.message}</div>
            </div>
            <div class="message-actions">
                <a href="mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.projectType || 'Portfolio Inquiry')}" class="btn-sm-outline" title="Reply via Email">
                    <i class="fas fa-reply"></i> Reply
                </a>
                <button class="action-icon-btn" onclick="toggleMessageRead('${m.id}', ${!m.read})" title="${m.read ? 'Mark as Unread' : 'Mark as Read'}">
                    <i class="fas ${m.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                </button>
                <button class="action-icon-btn delete" onclick="confirmDeleteMessage('${m.id}')" title="Delete Message">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleMessageRead(id, status) {
    window.PortfolioStore.markMessageRead(id, status);
    loadAllAdminData();
}

function confirmDeleteMessage(id) {
    if (confirm('Delete this message?')) {
        window.PortfolioStore.deleteMessage(id);
        showAdminToast('Message deleted.', 'success');
        loadAllAdminData();
    }
}

function clearAllMessages() {
    if (confirm('Are you sure you want to clear ALL messages? This cannot be undone.')) {
        window.PortfolioStore.clearAllMessages();
        showAdminToast('All messages cleared.', 'success');
        loadAllAdminData();
    }
}

/* =========================================
   PROFILE & ABOUT FORM
   ========================================= */
function initProfileSettings() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedProfile = {
            name: document.getElementById('prof-name').value.trim(),
            firstName: document.getElementById('prof-first-name').value.trim(),
            lastName: document.getElementById('prof-last-name').value.trim(),
            initials: document.getElementById('prof-initials').value.trim(),
            title: document.getElementById('prof-title').value.trim(),
            bioShort: document.getElementById('prof-bio-short').value.trim(),
            bioFull: document.getElementById('prof-bio-full').value.trim(),
            avatar: document.getElementById('prof-avatar-url').value.trim(),
            availability: document.getElementById('prof-availability').value.trim(),
            experienceYears: document.getElementById('prof-exp-years').value.trim(),
            experienceSubtitle: document.getElementById('prof-exp-subtitle').value.trim(),
            education: document.getElementById('prof-education').value.trim(),
            location: document.getElementById('prof-location').value.trim(),
            openTo: document.getElementById('prof-opento').value.trim(),
            email: document.getElementById('prof-email').value.trim(),
            phone: document.getElementById('prof-phone').value.trim(),
            github: document.getElementById('prof-github').value.trim(),
            linkedin: document.getElementById('prof-linkedin').value.trim(),
            whatsapp: document.getElementById('prof-whatsapp').value.trim()
        };

        window.PortfolioStore.updateProfile(updatedProfile);
        showAdminToast('Profile settings saved successfully!', 'success');
        loadAllAdminData();
    });
}

function populateProfileForm(profile = {}) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('prof-name', profile.name);
    setVal('prof-first-name', profile.firstName);
    setVal('prof-last-name', profile.lastName);
    setVal('prof-initials', profile.initials);
    setVal('prof-title', profile.title);
    setVal('prof-bio-short', profile.bioShort);
    setVal('prof-bio-full', profile.bioFull);
    setVal('prof-avatar-url', profile.avatar);
    setVal('prof-availability', profile.availability);
    setVal('prof-exp-years', profile.experienceYears);
    setVal('prof-exp-subtitle', profile.experienceSubtitle);
    setVal('prof-education', profile.education);
    setVal('prof-location', profile.location);
    setVal('prof-opento', profile.openTo);
    setVal('prof-email', profile.email);
    setVal('prof-phone', profile.phone);
    setVal('prof-github', profile.github);
    setVal('prof-linkedin', profile.linkedin);
    setVal('prof-whatsapp', profile.whatsapp);

    const avatarPreview = document.getElementById('prof-avatar-preview');
    if (avatarPreview && profile.avatar) {
        avatarPreview.src = profile.avatar;
    }
}

/* =========================================
   BACKUP & SETTINGS
   ========================================= */
function initBackupSettings() {
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-input');
    const resetBtn = document.getElementById('reset-defaults-btn');
    const changePinForm = document.getElementById('change-pin-form');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const fileName = window.PortfolioStore.exportJSON();
            showAdminToast(`Downloaded backup file: ${fileName}`, 'success');
        });
    }

    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const res = window.PortfolioStore.importJSON(event.target.result);
                if (res.success) {
                    showAdminToast('Portfolio data imported successfully!', 'success');
                    loadAllAdminData();
                } else {
                    showAdminToast(`Import failed: ${res.error}`, 'error');
                }
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('WARNING: This will reset all projects, skills, and profile info back to default seed data! Continue?')) {
                window.PortfolioStore.resetToDefaults();
                showAdminToast('Portfolio reset to defaults.', 'info');
                loadAllAdminData();
            }
        });
    }

    if (changePinForm) {
        changePinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const oldPin = document.getElementById('old-pin').value.trim();
            const newPin = document.getElementById('new-pin').value.trim();
            const confirmPin = document.getElementById('confirm-new-pin').value.trim();

            if (newPin !== confirmPin) {
                showAdminToast('New PIN and Confirm PIN do not match.', 'error');
                return;
            }

            const res = window.PortfolioStore.changePin(oldPin, newPin);
            if (res.success) {
                showAdminToast(res.message, 'success');
                changePinForm.reset();
            } else {
                showAdminToast(res.message, 'error');
            }
        });
    }
}

/* =========================================
   MODAL CONTROLLERS & HELPERS
   ========================================= */
function initFormsAndModals() {
    // Project form
    const projectForm = document.getElementById('project-form');
    if (projectForm) projectForm.addEventListener('submit', handleProjectFormSubmit);

    // Skill form
    const skillForm = document.getElementById('skill-form');
    if (skillForm) skillForm.addEventListener('submit', handleSkillFormSubmit);

    // Skill level range listener
    const skillLevelRange = document.getElementById('skill-level');
    const skillLevelVal = document.getElementById('skill-level-val');
    if (skillLevelRange && skillLevelVal) {
        skillLevelRange.addEventListener('input', (e) => {
            skillLevelVal.textContent = `${e.target.value}%`;
        });
    }

    // Preset icon selector for skills
    const iconPresets = document.getElementById('skill-icon-presets');
    const iconInput = document.getElementById('skill-icon');
    if (iconPresets && iconInput) {
        iconPresets.addEventListener('change', (e) => {
            if (e.target.value) {
                iconInput.value = e.target.value;
            }
        });
    }

    // Project image file upload -> Base64
    const projImgFile = document.getElementById('proj-image-file');
    const projImgUrl = document.getElementById('proj-image-url');
    const projImgPreview = document.getElementById('proj-image-preview');

    if (projImgFile && projImgPreview) {
        projImgFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    projImgPreview.src = event.target.result;
                    if (projImgUrl) projImgUrl.value = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (projImgUrl && projImgPreview) {
        projImgUrl.addEventListener('input', (e) => {
            projImgPreview.src = e.target.value || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
        });
    }

    // Avatar image file upload -> Base64
    const avatarFile = document.getElementById('prof-avatar-file');
    const avatarUrl = document.getElementById('prof-avatar-url');
    const avatarPreview = document.getElementById('prof-avatar-preview');

    if (avatarFile && avatarPreview) {
        avatarFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarPreview.src = event.target.result;
                    if (avatarUrl) avatarUrl.value = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (avatarUrl && avatarPreview) {
        avatarUrl.addEventListener('input', (e) => {
            avatarPreview.src = e.target.value || 'profile.png';
        });
    }

    // Project filter & search bindings
    const projFilterSelect = document.getElementById('admin-proj-category-filter');
    if (projFilterSelect) {
        projFilterSelect.addEventListener('change', (e) => {
            projectFilterCategory = e.target.value;
            renderAdminProjects(window.PortfolioStore.getProjects());
        });
    }

    const projSearchInput = document.getElementById('admin-proj-search');
    if (projSearchInput) {
        projSearchInput.addEventListener('input', (e) => {
            projectSearchQuery = e.target.value.toLowerCase().trim();
            renderAdminProjects(window.PortfolioStore.getProjects());
        });
    }

    // Skill filter
    const skillFilterSelect = document.getElementById('admin-skill-category-filter');
    if (skillFilterSelect) {
        skillFilterSelect.addEventListener('change', (e) => {
            skillFilterCategory = e.target.value;
            renderAdminSkills(window.PortfolioStore.getSkills());
        });
    }

    // Message filter
    const msgFilterSelect = document.getElementById('admin-msg-filter');
    if (msgFilterSelect) {
        msgFilterSelect.addEventListener('change', (e) => {
            messagesFilter = e.target.value;
            renderAdminMessages(window.PortfolioStore.getMessages());
        });
    }

    // Modal close when clicking outside container
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function showAdminToast(msg, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${msg}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return isoStr;
    }
}

// Global functions for inline HTML event handlers
window.switchTab = switchTab;
window.openAddProjectModal = openAddProjectModal;
window.openEditProjectModal = openEditProjectModal;
window.toggleProjectFeatured = toggleProjectFeatured;
window.confirmDeleteProject = confirmDeleteProject;
window.openAddSkillModal = openAddSkillModal;
window.openEditSkillModal = openEditSkillModal;
window.confirmDeleteSkill = confirmDeleteSkill;
window.toggleMessageRead = toggleMessageRead;
window.confirmDeleteMessage = confirmDeleteMessage;
window.clearAllMessages = clearAllMessages;
window.closeModal = closeModal;
