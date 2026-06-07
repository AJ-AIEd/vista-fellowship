# VISTA Fellowship — CNG AI Innovation Fellowship 2026–2027

**Designing Human-Centered Learning in AI-Rich Classrooms**  
Andrew Cajina · High School Mathematics · Colegio Nueva Granada · Bogotá, Colombia

---

## What This Is

A static website for the CNG AI Innovation Fellowship 2026–2027. Two pages:

| Page | File | Purpose |
|------|------|---------|
| Fellowship Hub | `index.html` | Public landing page — about the fellowship, timeline, cycles, VISTA explainer, downloads |
| VISTA Protocol | `vista.html` | The assessment audit tool — Initial Audit, AI Stress-Test, Final Audit, References |

No build step. No framework. Pure HTML/CSS/JS — deploy anywhere static files are served.

---

## Project Structure

```
vista-fellowship/
├── index.html              ← Fellowship Hub (main landing page)
├── vista.html              ← VISTA Protocol tool
├── vercel.json             ← Vercel routing + headers config
├── .gitignore
├── README.md
├── css/
│   └── shared.css          ← Shared design tokens (colours, fonts, base reset)
├── js/
│   └── (empty — JS is inline in each page for portability)
└── public/
    └── docs/
        ├── CNG_Fellowship_Complete.docx         ← 2-pager + full proposal (combined)
        ├── CNG_Fellowship_Submission_Final.docx ← 2-page executive submission only
        ├── CNG_Fellowship_Proposal_v6.docx      ← Full 10+ page proposal only
        └── Journal_Article_Draft.docx           ← Practitioner article draft
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# From the project root
cd vista-fellowship
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: your account
# - Link to existing project: N
# - Project name: vista-fellowship (or whatever you want)
# - Directory: ./  (current)
# - Override settings: N
```

Your site will be live at `https://vista-fellowship.vercel.app` (or your chosen name).

### Option B — GitHub + Vercel (recommended for ongoing updates)

1. **Create a new GitHub repo** (e.g. `vista-fellowship`)

2. **Push this project:**
   ```bash
   cd vista-fellowship
   git init
   git add .
   git commit -m "Initial deploy — CNG AI Innovation Fellowship 2026-2027"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vista-fellowship.git
   git push -u origin main
   ```

3. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repo
   - Framework: **Other** (no framework)
   - Root directory: `./`
   - Build command: *(leave empty)*
   - Output directory: `./`
   - Click Deploy

4. **Custom domain (optional):**
   - In Vercel project settings → Domains
   - Add your domain (e.g. `vista.cng.edu.co` or `fellowship.cng.edu.co`)
   - Add the DNS records Vercel provides to your domain registrar

Every `git push` to `main` will automatically redeploy.

---

## Making Updates

### Edit content
- **Hub page:** edit `index.html` directly
- **VISTA tool:** edit `vista.html` directly
- **Shared styles:** edit `css/shared.css`

### Update downloadable docs
Replace files in `public/docs/` — same filenames, just drop in the new versions.

### Add a new page
1. Create `yourpage.html` in the root
2. Add a route in `vercel.json` if you want a clean URL (e.g. `/about` → `about.html`)

---

## URL Structure

| URL | Content |
|-----|---------|
| `/` | Fellowship Hub |
| `/vista` | VISTA Protocol tool |
| `/protocol` | Alias for VISTA tool |
| `/docs/CNG_Fellowship_Complete.docx` | Combined submission + proposal download |
| `/docs/CNG_Fellowship_Submission_Final.docx` | 2-page submission download |
| `/docs/CNG_Fellowship_Proposal_v6.docx` | Full proposal download |
| `/docs/Journal_Article_Draft.docx` | Practitioner article download |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| HTML | Vanilla | No build step, works everywhere |
| CSS | Custom properties | Full design system in `css/shared.css` |
| Fonts | Google Fonts (Fraunces, DM Sans, DM Mono) | Loaded from CDN |
| JS | Vanilla inline | VISTA tool is a complex single-file app — keeping it portable |
| Draft persistence | `localStorage` | Saves VISTA audit drafts in the browser; no server needed |
| Hosting | Vercel | Free tier, instant deploys, custom domains |

---

## VISTA Tool Notes

The VISTA Protocol tool (`vista.html`) saves draft audits to `localStorage` in the user's browser. This means:
- Drafts persist between sessions on the same device/browser
- No data is sent to any server
- Clearing browser data will clear saved drafts
- Teachers should use the "Save Draft" button and note that data is local only

If you ever want server-side persistence (e.g. Cajina can see submitted audits), this would require adding a backend — a future enhancement.

---

## Contact

Andrew Cajina · acajina@cng.edu.co  
High School Mathematics · Colegio Nueva Granada · Bogotá, Colombia
