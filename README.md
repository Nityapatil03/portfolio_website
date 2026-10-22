# Dynamic Portfolio & Admin Portal Studio

A modern, responsive personal portfolio website and full-featured Admin CMS Portal. Built with pure Vanilla HTML5, CSS3, and JavaScript with client-side LocalStorage persistence, JSON export/import backups, and real-time synchronization.

---

## 🚀 Key Features

### 🌐 Frontend Portfolio (`index.html`)
- **Modern Dark Aesthetic**: Deep obsidian theme (`#080c14`) with glowing violet and purple gradients, glassmorphism, and responsive typography.
- **Dynamic Data Binding**: Hero profile, skills, projects, services, and contact info are rendered dynamically from `PortfolioStore`.
- **Project Showcase**:
  - Filter by category (**All**, **Web**, **Android**, **Full-Stack**)
  - Real-time search filter by title, description, or technology tags
  - Direct links to **Live Demo** and **GitHub Repository**
  - Highlighting for **Featured** projects
- **Interactive Skills Section**: Categorized into Frontend, Backend, Mobile, and Tools & DevOps with interactive hover animations.
- **Contact Inquiries Form**:
  - Submissions are immediately saved into the Admin Portal Inbox
  - Animated toast notification with zero reload or external server required
- **Direct Admin Access**: Quick navigation links to Admin Portal in the top bar and footer.

### 🛡️ Admin Portal Studio (`admin.html`)
- **PIN Authentication**: Secure lock screen (Default PIN: `admin123`, changeable anytime in settings).
- **Dashboard Overview**: Real-time KPI counters (Total Projects, Total Skills, Inquiries Received, Profile Completion %).
- **Projects Management**:
  - Add, Edit, and Delete projects with instant preview
  - Upload local thumbnail images (auto-converted to Base64) or paste external URLs
  - Tag chips, category selection, and featured toggle
- **Skills Management**:
  - Add, Edit, and Delete skills with icon preset picker and proficiency slider
- **Profile & About Customization**:
  - Update display name, headline, short bio, full bio, experience years, education, location, phone, email, and social URLs
- **Contact Inquiries Inbox**:
  - Read inquiries submitted from the public contact form
  - Filter by All, Unread, Read
  - Quick **"Reply via Email"** mailto action
  - Delete individual messages or clear all
- **Backup & Portability**:
  - **Export JSON**: Download your entire portfolio data as a single backup file
  - **Import JSON**: Restore your data on any device or browser
  - **Reset to Defaults**: Safety restore back to initial seed data

---

## 🔑 Default Admin Credentials

- **Admin URL**: [`admin.html`](admin.html)
- **Default PIN**: `admin123`
*(You can change the PIN inside the Admin Portal under **Backup & PIN** settings)*

---

## 💻 Running Locally

### Option 1: Open Directly in Browser
You can directly open `index.html` or `admin.html` in any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run with Local Web Server
```bash
npx serve -l 5173 .
```
Then visit:
- Portfolio: `http://localhost:5173`
- Admin Portal: `http://localhost:5173/admin.html`

---

## 📁 Project Structure

```
portfolio/
├── index.html          # Public Portfolio frontend
├── admin.html          # Admin Portal CMS dashboard
├── css/
│   ├── style.css       # Portfolio dark futuristic styling
│   └── admin.css       # Admin dashboard styling
├── js/
│   ├── store.js        # Shared LocalStorage data layer & auth
│   ├── main.js         # Frontend dynamic renderer & contact logic
│   └── admin.js        # Admin portal controller & CRUD logic
├── profile.png         # Profile portrait image
├── favicon.svg         # Favicon badge
└── README.md           # Documentation
```
