/**
 * Main Portfolio Client Script
 * Dynamically binds data from PortfolioStore into DOM and manages user interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderPortfolio();

    // Listen for real-time updates from store or other tabs
    window.addEventListener('portfolioDataUpdated', () => {
        renderPortfolio();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'portfolio_cms_data_v1') {
            renderPortfolio();
        }
    });

    initNavigation();
    initContactForm();
});

// Main render orchestrator
function renderPortfolio() {
    if (!window.PortfolioStore) return;
    const data = window.PortfolioStore.getData();

    renderProfile(data.profile);
    renderSkills(data.skills);
    renderProjects(data.projects);
    renderServices(data.services);
}

// 1. Render Profile Details
function renderProfile(profile) {
    if (!profile) return;

    // Document Title
    if (profile.name) {
        document.title = `${profile.name} - Portfolio`;
    }

    // Logo
    const logoBadge = document.querySelector('.logo-badge');
    if (logoBadge) {
        logoBadge.innerHTML = `${profile.initials || 'NP'}<span class="logo-status-dot"></span>`;
    }
    const logoName = document.querySelector('.logo-name');
    if (logoName) {
        logoName.innerHTML = `${profile.firstName || 'Nitya'} <span class="logo-surname">${profile.lastName || 'Patil'}</span>`;
    }

    // Hero Section
    const heroTitle = document.getElementById('hero-name');
    if (heroTitle) {
        heroTitle.innerHTML = `Hi, I'm<br><span>${profile.name}</span>`;
    }

    const heroRole = document.getElementById('hero-role');
    if (heroRole) {
        heroRole.textContent = profile.title || 'Full Stack Developer';
    }

    const heroDesc = document.getElementById('hero-desc');
    if (heroDesc) {
        heroDesc.textContent = profile.bioShort || '';
    }

    const heroImg = document.getElementById('hero-avatar-img');
    if (heroImg && profile.avatar) {
        heroImg.src = profile.avatar;
        heroImg.alt = profile.name;
    }

    const heroBadge = document.getElementById('hero-availability');
    if (heroBadge) {
        heroBadge.innerHTML = `<span></span> ${profile.availability || 'Available for Freelance'}`;
    }

    // Social Links
    const socialContainer = document.getElementById('hero-socials');
    if (socialContainer) {
        socialContainer.innerHTML = `
            ${profile.linkedin ? `<a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
            ${profile.github ? `<a href="${profile.github}" target="_blank" rel="noopener noreferrer" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
            ${profile.email ? `<a href="mailto:${profile.email}" title="Email"><i class="fas fa-envelope"></i></a>` : ''}
            ${profile.whatsapp ? `<a href="${profile.whatsapp}" target="_blank" rel="noopener noreferrer" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ''}
        `;
    }

    // About Section
    const aboutImg = document.getElementById('about-avatar-img');
    if (aboutImg && profile.avatar) {
        aboutImg.src = profile.avatar;
        aboutImg.alt = profile.name;
    }

    const expTag = document.getElementById('about-exp-tag');
    if (expTag) {
        expTag.innerHTML = `${profile.experienceYears || '2+'}<span>${profile.experienceSubtitle || 'Years Experience'}</span>`;
    }

    const aboutBio = document.getElementById('about-bio');
    if (aboutBio) {
        aboutBio.textContent = profile.bioFull || profile.bioShort || '';
    }

    const infoGrid = document.getElementById('about-info-grid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-item">
                <i class="fas fa-user"></i>
                <div><span>Name</span>${profile.name}</div>
            </div>
            <div class="info-item">
                <i class="fas fa-graduation-cap"></i>
                <div><span>Education</span>${profile.education || 'Computer Science'}</div>
            </div>
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div><span>Location</span>${profile.location || 'India'}</div>
            </div>
            <div class="info-item">
                <i class="fas fa-globe"></i>
                <div><span>Open to</span>${profile.openTo || 'Opportunities'}</div>
            </div>
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div><span>Email</span>${profile.email}</div>
            </div>
            <div class="info-item">
                <i class="fas fa-briefcase"></i>
                <div><span>Experience</span>${profile.experienceYears} (${profile.experienceSubtitle})</div>
            </div>
        `;
    }

    // Contact Details in Contact Section
    const contactList = document.getElementById('contact-details-list');
    if (contactList) {
        contactList.innerHTML = `
            ${profile.email ? `
                <a href="mailto:${profile.email}" class="contact-detail-item">
                    <i class="fas fa-envelope"></i> ${profile.email}
                </a>` : ''}
            ${profile.phone ? `
                <a href="tel:${profile.phone.replace(/[^0-9+]/g, '')}" class="contact-detail-item">
                    <i class="fas fa-phone"></i> ${profile.phone}
                </a>` : ''}
            ${profile.location ? `
                <div class="contact-detail-item">
                    <i class="fas fa-map-marker-alt"></i> ${profile.location}
                </div>` : ''}
            ${profile.linkedin ? `
                <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-detail-item">
                    <i class="fab fa-linkedin-in"></i> linkedin.com/in/nitya-patil
                </a>` : ''}
            ${profile.github ? `
                <a href="${profile.github}" target="_blank" rel="noopener noreferrer" class="contact-detail-item">
                    <i class="fab fa-github"></i> github.com/Nityapatil03
                </a>` : ''}
        `;
    }

    // Footer Copyright
    const footerCopy = document.getElementById('footer-copy');
    if (footerCopy) {
        footerCopy.textContent = `© ${new Date().getFullYear()} ${profile.name}. All Rights Reserved.`;
    }
}

// 2. Render Skills with Category Filtering
let currentSkillCategory = 'All';

function renderSkills(skills = []) {
    const filterContainer = document.getElementById('skills-filter');
    const gridContainer = document.getElementById('skills-grid');
    if (!gridContainer) return;

    // Collect unique categories
    const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))];

    // Render filter buttons if not yet initialized
    if (filterContainer && !filterContainer.hasChildNodes()) {
        filterContainer.innerHTML = categories.map(cat => `
            <button class="skill-filter-btn ${cat === currentSkillCategory ? 'active' : ''}" data-cat="${cat}">
                ${cat}
            </button>
        `).join('');

        filterContainer.querySelectorAll('.skill-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.skill-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSkillCategory = btn.getAttribute('data-cat');
                filterAndRenderSkillCards(skills);
            });
        });
    }

    filterAndRenderSkillCards(skills);
}

function filterAndRenderSkillCards(skills) {
    const gridContainer = document.getElementById('skills-grid');
    if (!gridContainer) return;

    const filtered = currentSkillCategory === 'All' 
        ? skills 
        : skills.filter(s => s.category === currentSkillCategory);

    if (filtered.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">No skills added in this category yet.</p>`;
        return;
    }

    gridContainer.innerHTML = filtered.map(skill => `
        <div class="skill-card">
            <i class="${skill.icon || 'fas fa-code'}"></i>
            <h3>${skill.name}</h3>
            ${skill.category ? `<span class="skill-category-badge">${skill.category}</span>` : ''}
        </div>
    `).join('');
}

// 3. Render Projects with Search & Filters
let currentProjectCategory = 'All';
let currentProjectSearch = '';

function renderProjects(projects = []) {
    const filterContainer = document.getElementById('projects-filter');
    const searchInput = document.getElementById('project-search');

    if (filterContainer && !filterContainer.hasChildNodes()) {
        const categories = ['All', 'Web', 'Android', 'Full-Stack'];
        filterContainer.innerHTML = categories.map(cat => `
            <button class="proj-filter-btn ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">
                ${cat}
            </button>
        `).join('');

        filterContainer.querySelectorAll('.proj-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.proj-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentProjectCategory = btn.getAttribute('data-cat');
                filterAndRenderProjectsCards(projects);
            });
        });
    }

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener('input', (e) => {
            currentProjectSearch = e.target.value.toLowerCase().trim();
            filterAndRenderProjectsCards(projects);
        });
    }

    filterAndRenderProjectsCards(projects);
}

function filterAndRenderProjectsCards(projects) {
    const gridContainer = document.getElementById('projects-grid');
    if (!gridContainer) return;

    let filtered = projects;

    if (currentProjectCategory !== 'All') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === currentProjectCategory.toLowerCase());
    }

    if (currentProjectSearch) {
        filtered = filtered.filter(p => 
            (p.title || '').toLowerCase().includes(currentProjectSearch) ||
            (p.description || '').toLowerCase().includes(currentProjectSearch) ||
            (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(currentProjectSearch)))
        );
    }

    if (filtered.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted); background: var(--card-bg); border-radius: 16px; border: 1px dashed var(--card-border);">
                <i class="fas fa-folder-open" style="font-size: 38px; color: var(--purple-primary); margin-bottom: 12px; display: block;"></i>
                <p style="font-size: 16px; font-weight: 500;">No projects found</p>
                <p style="font-size: 13px; margin-top: 4px;">Try selecting another category or clearing your search term.</p>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = filtered.map(proj => {
        const tags = Array.isArray(proj.tags) ? proj.tags : (proj.tags ? proj.tags.split(',') : []);
        return `
            <div class="project-card">
                <div class="project-img-wrapper">
                    <img src="${proj.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'}" alt="${proj.title}" class="project-img" loading="lazy">
                    ${proj.featured ? `<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>` : ''}
                </div>
                <div class="project-content">
                    <span class="project-category-tag">${proj.category || 'Project'}</span>
                    <h3>${proj.title}</h3>
                    <p>${proj.description || ''}</p>
                    <div class="project-tags">
                        ${tags.map(t => `<span>${t.trim()}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${(proj.demoUrl && proj.demoUrl.trim() && proj.demoUrl.trim() !== '') ? proj.demoUrl.trim() : '#'}" 
                           target="_blank" rel="noopener noreferrer" class="btn-demo" 
                           ${(!proj.demoUrl || proj.demoUrl.trim() === '#') ? 'onclick="if(this.getAttribute(\'href\')===\'#\'){event.preventDefault(); alert(\'Live Demo link coming soon!\');}"' : ''}>
                            Live Demo <i class="fas fa-external-link-alt"></i>
                        </a>
                        <a href="${(proj.githubUrl && proj.githubUrl.trim() && proj.githubUrl.trim() !== '') ? proj.githubUrl.trim() : '#'}" 
                           target="_blank" rel="noopener noreferrer" class="btn-code"
                           ${(!proj.githubUrl || proj.githubUrl.trim() === '#') ? 'onclick="if(this.getAttribute(\'href\')===\'#\'){event.preventDefault(); alert(\'GitHub repository link coming soon!\');}"' : ''}>
                            GitHub <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Render Services
function renderServices(services = []) {
    const gridContainer = document.getElementById('services-grid');
    if (!gridContainer) return;

    if (services.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No services listed.</p>`;
        return;
    }

    gridContainer.innerHTML = services.map(s => `
        <div class="service-card">
            <i class="${s.icon || 'fas fa-laptop-code'}"></i>
            <h3>${s.title}</h3>
            <p>${s.description || ''}</p>
        </div>
    `).join('');
}

// 5. Contact Form Submissions -> Saved to Admin Store Inbox
function initContactForm() {
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('contact-toast');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const typeInput = document.getElementById('contact-type');
        const messageInput = document.getElementById('contact-message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const projectType = typeInput ? typeInput.value : 'General Inquiry';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) {
            showToast('Please fill out all required fields.', 'error');
            return;
        }

        if (window.PortfolioStore) {
            window.PortfolioStore.addMessage({
                name,
                email,
                projectType,
                message
            });
        }

        form.reset();
        showToast('Thank you! Your message has been sent successfully. I will get back to you shortly.', 'success');
    });

    function showToast(msg, type) {
        if (!toast) return;
        toast.className = `toast-msg ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 6000);
    }
}

// 6. Navigation, Mobile Menu & ScrollSpy
function initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            if (toggleIcon) {
                toggleIcon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (toggleIcon) toggleIcon.className = 'fas fa-bars';
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav')) {
                navLinks.classList.remove('active');
                if (toggleIcon) toggleIcon.className = 'fas fa-bars';
            }
        });
    }

    // ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a:not(.hire-btn)');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.pageYOffset + 180;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            navAnchors.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${current}`) {
                    a.classList.add('active');
                }
            });
        }
    });

    // Hidden Admin Portal Shortcut: Ctrl+Shift+A (or triple click logo)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            window.location.href = 'admin.html';
        }
    });

    let logoClicks = 0;
    let logoTimer = null;
    const logoBadge = document.querySelector('.logo-badge');
    if (logoBadge) {
        logoBadge.style.cursor = 'pointer';
        logoBadge.addEventListener('click', (e) => {
            logoClicks++;
            clearTimeout(logoTimer);
            if (logoClicks >= 3) {
                e.preventDefault();
                window.location.href = 'admin.html';
                logoClicks = 0;
            } else {
                logoTimer = setTimeout(() => {
                    logoClicks = 0;
                }, 1200);
            }
        });
    }
}

