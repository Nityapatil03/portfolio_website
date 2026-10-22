/**
 * Portfolio Data Store & Management Layer
 * Handles client-side persistence with LocalStorage, defaults, and event dispatching.
 */

const STORAGE_KEY = 'portfolio_cms_data_v1';
const AUTH_KEY = 'portfolio_cms_auth_session';

const DEFAULT_PORTFOLIO_DATA = {
    profile: {
        name: "Nitya Sunil Patil",
        firstName: "Nitya",
        lastName: "Patil",
        initials: "NP",
        title: "MERN Stack Developer | Android App Developer",
        bioShort: "I build modern web applications and Android applications that solve real-world problems. I love turning ideas into scalable digital products.",
        bioFull: "I am Nitya Sunil Patil, a Full Stack Developer with experience in building web applications using the MERN stack and creating Android applications. I enjoy solving problems, learning new technologies, and building user-friendly applications that make a difference.",
        avatar: "profile.png",
        availability: "Available for Freelance Projects",
        experienceYears: "2+",
        experienceSubtitle: "Years of Learning & Building",
        education: "Computer Science Student",
        location: "Vadodara, Gujarat, India",
        openTo: "Freelance & Remote Opportunities",
        email: "nityaspatil06@gmail.com",
        phone: "+91-7823034424",
        github: "https://github.com/Nityapatil03",
        linkedin: "https://www.linkedin.com/in/nitya-p-5b808425b/",
        whatsapp: "https://wa.me/917823034424",
        resumeUrl: "#",
        stats: {
            projectsCompleted: "12+",
            happyClients: "5+",
            codeCommits: "500+"
        }
    },
    skills: [
        { id: "sk-1", name: "HTML5", category: "Frontend", icon: "fab fa-html5", level: 95 },
        { id: "sk-2", name: "CSS3", category: "Frontend", icon: "fab fa-css3-alt", level: 90 },
        { id: "sk-3", name: "JavaScript", category: "Frontend", icon: "fab fa-js", level: 88 },
        { id: "sk-4", name: "React.js", category: "Frontend", icon: "fab fa-react", level: 85 },
        { id: "sk-5", name: "Node.js", category: "Backend", icon: "fab fa-node-js", level: 82 },
        { id: "sk-6", name: "Express.js", category: "Backend", icon: "fas fa-server", level: 80 },
        { id: "sk-7", name: "MongoDB", category: "Backend", icon: "fas fa-database", level: 84 },
        { id: "sk-8", name: "Java", category: "Backend", icon: "fab fa-java", level: 78 },
        { id: "sk-9", name: "Android Studio", category: "Mobile", icon: "fab fa-android", level: 85 },
        { id: "sk-10", name: "Firebase", category: "Mobile", icon: "fas fa-fire", level: 80 },
        { id: "sk-11", name: "Git & GitHub", category: "Tools", icon: "fab fa-git-alt", level: 90 },
        { id: "sk-12", name: "Postman", category: "Tools", icon: "fas fa-paper-plane", level: 85 },
        { id: "sk-13", name: "Vercel", category: "Tools", icon: "fas fa-cloud-upload-alt", level: 88 }
    ],
    projects: [
        {
            id: "proj-1",
            title: "TaskMaster To-Do List App",
            category: "Web",
            description: "A full-stack task management web application built with React 19, TypeScript, Redux Toolkit, Tailwind CSS, and a Node.js REST API with MongoDB.",
            image: "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&w=600&q=80",
            tags: ["React", "TypeScript", "Redux", "Tailwind CSS", "Node.js", "MongoDB"],
            demoUrl: "https://todo-list-frontend-two-beryl.vercel.app",
            githubUrl: "https://github.com/Nityapatil03/todo-list-frontend",
            featured: true,
            createdAt: "2026-03-15"
        },
        {
            id: "proj-2",
            title: "Smart Clinic Management System",
            category: "Android",
            description: "A native Android application for seamless appointment booking, doctor management, and secure user authentication with real-time Firebase database integration.",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
            tags: ["Android Studio", "Java", "Firebase", "Realtime DB"],
            demoUrl: "https://github.com/Nityapatil03",
            githubUrl: "https://github.com/Nityapatil03",
            featured: true,
            createdAt: "2026-02-10"
        },
        {
            id: "proj-3",
            title: "Product Management System",
            category: "Full-Stack",
            description: "A full-stack MERN application featuring CRUD operations, user role authentication, sales metrics tracking, and product inventory management dashboard.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            tags: ["React", "Node.js", "Express.js", "MongoDB", "REST API"],
            demoUrl: "https://github.com/Nityapatil03",
            githubUrl: "https://github.com/Nityapatil03",
            featured: false,
            createdAt: "2025-11-20"
        }
    ],
    services: [
        {
            id: "srv-1",
            title: "Web Development",
            description: "Responsive, ultra-fast and modern websites crafted using the MERN stack and clean UI patterns.",
            icon: "fas fa-laptop-code"
        },
        {
            id: "srv-2",
            title: "Android App Development",
            description: "Native Android applications with clean architectures, smooth user flows, and real-time backend.",
            icon: "fab fa-android"
        },
        {
            id: "srv-3",
            title: "REST API Development",
            description: "Secure, performant, and scalable APIs and microservices for modern web & mobile clients.",
            icon: "fas fa-network-wired"
        },
        {
            id: "srv-4",
            title: "Bug Fixing & Maintenance",
            description: "Resolving performance bottlenecks, fixing critical bugs, and enhancing existing codebases.",
            icon: "fas fa-tools"
        }
    ],
    messages: [
        {
            id: "msg-welcome",
            name: "Portfolio System",
            email: "admin@portfolio.local",
            projectType: "System Notification",
            message: "Welcome to your Admin Portal! Inquiries submitted from your portfolio contact form will appear here in real-time.",
            date: new Date().toISOString(),
            read: true
        }
    ],
    settings: {
        adminPin: "admin123",
        siteTitle: "Nitya Sunil Patil - Portfolio"
    }
};

const PortfolioStore = {
    // Read entire dataset
    getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                this.setData(DEFAULT_PORTFOLIO_DATA);
                return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to read from localStorage:", e);
            return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
        }
    },

    // Save entire dataset
    setData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: data }));
            return true;
        } catch (e) {
            console.error("Failed to write to localStorage:", e);
            return false;
        }
    },

    // Reset back to original seed data
    resetToDefaults() {
        this.setData(DEFAULT_PORTFOLIO_DATA);
        return DEFAULT_PORTFOLIO_DATA;
    },

    // PROFILE OPERATIONS
    getProfile() {
        return this.getData().profile || DEFAULT_PORTFOLIO_DATA.profile;
    },

    updateProfile(updatedFields) {
        const data = this.getData();
        data.profile = { ...data.profile, ...updatedFields };
        this.setData(data);
        return data.profile;
    },

    // PROJECTS OPERATIONS
    getProjects() {
        return this.getData().projects || [];
    },

    getProjectById(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },

    addProject(project) {
        const data = this.getData();
        const newProject = {
            id: 'proj-' + Date.now(),
            createdAt: new Date().toISOString().split('T')[0],
            featured: false,
            ...project
        };
        data.projects.unshift(newProject);
        this.setData(data);
        return newProject;
    },

    updateProject(id, updatedFields) {
        const data = this.getData();
        const index = data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            data.projects[index] = { ...data.projects[index], ...updatedFields };
            this.setData(data);
            return data.projects[index];
        }
        return null;
    },

    deleteProject(id) {
        const data = this.getData();
        data.projects = data.projects.filter(p => p.id !== id);
        this.setData(data);
        return true;
    },

    // SKILLS OPERATIONS
    getSkills() {
        return this.getData().skills || [];
    },

    addSkill(skill) {
        const data = this.getData();
        const newSkill = {
            id: 'sk-' + Date.now(),
            level: 80,
            category: 'Frontend',
            icon: 'fas fa-code',
            ...skill
        };
        data.skills.push(newSkill);
        this.setData(data);
        return newSkill;
    },

    updateSkill(id, updatedFields) {
        const data = this.getData();
        const index = data.skills.findIndex(s => s.id === id);
        if (index !== -1) {
            data.skills[index] = { ...data.skills[index], ...updatedFields };
            this.setData(data);
            return data.skills[index];
        }
        return null;
    },

    deleteSkill(id) {
        const data = this.getData();
        data.skills = data.skills.filter(s => s.id !== id);
        this.setData(data);
        return true;
    },

    // SERVICES OPERATIONS
    getServices() {
        return this.getData().services || [];
    },

    addService(service) {
        const data = this.getData();
        const newService = {
            id: 'srv-' + Date.now(),
            icon: 'fas fa-laptop-code',
            ...service
        };
        data.services.push(newService);
        this.setData(data);
        return newService;
    },

    updateService(id, updatedFields) {
        const data = this.getData();
        const index = data.services.findIndex(s => s.id === id);
        if (index !== -1) {
            data.services[index] = { ...data.services[index], ...updatedFields };
            this.setData(data);
            return data.services[index];
        }
        return null;
    },

    deleteService(id) {
        const data = this.getData();
        data.services = data.services.filter(s => s.id !== id);
        this.setData(data);
        return true;
    },

    // MESSAGES / INBOX OPERATIONS
    getMessages() {
        return this.getData().messages || [];
    },

    addMessage(msg) {
        const data = this.getData();
        const newMessage = {
            id: 'msg-' + Date.now(),
            date: new Date().toISOString(),
            read: false,
            ...msg
        };
        if (!data.messages) data.messages = [];
        data.messages.unshift(newMessage);
        this.setData(data);
        return newMessage;
    },

    markMessageRead(id, isRead = true) {
        const data = this.getData();
        const msg = data.messages.find(m => m.id === id);
        if (msg) {
            msg.read = isRead;
            this.setData(data);
            return true;
        }
        return false;
    },

    deleteMessage(id) {
        const data = this.getData();
        data.messages = data.messages.filter(m => m.id !== id);
        this.setData(data);
        return true;
    },

    clearAllMessages() {
        const data = this.getData();
        data.messages = [];
        this.setData(data);
        return true;
    },

    getUnreadMessageCount() {
        const msgs = this.getMessages();
        return msgs.filter(m => !m.read).length;
    },

    // BACKUP & RESTORE
    exportJSON() {
        const data = this.getData();
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", str);
        const fileName = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
        downloadAnchor.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return fileName;
    },

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.profile || !parsed.projects || !parsed.skills) {
                throw new Error("Invalid portfolio data structure");
            }
            this.setData(parsed);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // ADMIN AUTHENTICATION
    isAuthenticated() {
        return sessionStorage.getItem(AUTH_KEY) === 'true';
    },

    login(inputPin) {
        const data = this.getData();
        const storedPin = (data.settings && data.settings.adminPin) ? data.settings.adminPin : "admin123";
        if (inputPin === storedPin) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            return true;
        }
        return false;
    },

    logout() {
        sessionStorage.removeItem(AUTH_KEY);
    },

    changePin(oldPin, newPin) {
        const data = this.getData();
        const currentPin = (data.settings && data.settings.adminPin) ? data.settings.adminPin : "admin123";
        if (oldPin !== currentPin) {
            return { success: false, message: "Current PIN is incorrect." };
        }
        if (!newPin || newPin.length < 4) {
            return { success: false, message: "New PIN must be at least 4 characters." };
        }
        if (!data.settings) data.settings = {};
        data.settings.adminPin = newPin;
        this.setData(data);
        return { success: true, message: "PIN updated successfully!" };
    }
};

// Make accessible globally
window.PortfolioStore = PortfolioStore;
