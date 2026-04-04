# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Ilhan Esmail. Pure static HTML/CSS/JS — no build system, no package manager, no frameworks. Deployed to Cloudflare Workers via `wrangler`.

## Deployment

```bash
npx wrangler deploy   # deploy to Cloudflare Workers (serves assets from root)
npx wrangler dev      # local dev server
```

No build step needed — edit files directly and deploy.

## Architecture

### File Structure
- `index.html` — Single-page portfolio (Hero → About → Experience → Skills → Education → Blog → Contact)
- `style.css` — All styles for index.html (964 lines, 17 numbered sections)
- `script.js` — All JS for index.html (248 lines, IIFE-wrapped, vanilla ES5)
- `blog/index.html` — Blog listing page
- `blog/blog.css` — Blog-specific styles
- `blog/post-template.html` — Template for new blog posts (contains detailed `EDIT:` comments)
- `blog/posts/*.html` — Individual blog post pages

### Design System (CSS Custom Properties in `style.css`)

**Colors:** `--bg` (#000), `--surface` (#0a0a0a), `--surface-2` (#111), `--border` (#1d1d1d), `--text-primary` (#f5f5f7), `--text-secondary` (#a1a1a6), `--accent` (#ed7b58, orange)

**Typography:** `--font-serif` (DM Serif Display), `--font-sans` (DM Sans), `--font-mono` (DM Mono). Fluid sizing via `clamp()` on all `--text-*` variables.

**Spacing:** `--space-1` through `--space-32` (0.25rem to 8rem)

**Motion:** `--t-fast` (120ms), `--t-base` (220ms), `--t-slow` (380ms) with Apple-eased cubic-bezier curves.

### CSS Conventions
- BEM naming: `.navbar__logo`, `.timeline__item--active`, etc.
- Responsive breakpoints: 1024px (tablet), 640px (mobile)
- Scroll-reveal via `.fade-in` / `.is-visible` classes (driven by IntersectionObserver in script.js)

### JavaScript Patterns (`script.js`)
All code is in a single IIFE. Key systems:
- **IntersectionObserver** for active nav links and `.fade-in` scroll animations
- **Canvas animation** in hero (hexagonal grid with oscillating opacity; pauses when hero off-screen)
- **Hamburger menu** with Escape-key and body-scroll-lock support
- **Smooth scroll** with dynamic navbar offset compensation

## Adding Content

### New Blog Post (via publish.py)

Write posts in Markdown, then run the publish script to generate the HTML and update both index pages automatically.

**Setup (one-time):**
```bash
pip install markdown python-frontmatter
```

**Workflow:**
1. Create `blog/drafts/my-post.md` — use `blog/drafts/example.md` as a reference for frontmatter fields
2. Place any images in `blog/images/`
3. Run: `python publish.py blog/drafts/my-post.md`

**Required frontmatter fields:** `title`, `date` (YYYY-MM-DD), `excerpt`, `slug`
**Optional:** `image` (filename relative to `blog/images/`), `image_alt`

The script inserts new cards at the top of the post list in `blog/index.html` and `index.html`'s `#blog` section. It will prompt before overwriting an existing post file.

### New Experience Entry
See the HTML comment template inside the `#experience` section of `index.html` for the required markup structure.
