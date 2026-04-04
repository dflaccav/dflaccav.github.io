# Phira: From Generated Code to Published Site

## What is Phira?

Phira is an animated "Hi Mom" greeting app built with React. It lives at
**https://dflaccav.github.io** and was generated entirely through a
conversational AI session using Claude Code.

---

## The Pipeline: Code to Browser

Here's exactly how the code went from generated to published, step by step.

### 1. Scaffolding (AI-generated)

Claude Code ran `npm create vite@latest . -- --template react-ts` inside the
existing `dflaccav.github.io` repo. This created the standard Vite + React +
TypeScript project structure:

```
dflaccav.github.io/
  src/
    main.tsx          # Entry point - mounts React to the DOM
    App.tsx           # The "Hi Mom" component with animations
    App.css           # Visual styles (gradients, breathing pulse)
    index.css         # Global styles (colors, resets, dark background)
  index.html          # The single HTML page Vite builds from
  vite.config.ts      # Build configuration
  package.json        # Dependencies and scripts
```

### 2. Writing the App (AI-generated)

Claude Code wrote `App.tsx` — a React component that:
- Renders "Hi Mom" as a large heading with a CSS gradient text effect
- Uses **Framer Motion** for a spring-based entrance animation (fade + scale)
- Applies a continuous "breathing" CSS animation (subtle scale pulse)
- Cycles through themed subtitle messages on click
- Displays an ambient glow orb (CSS radial gradient with blur + drift animation)

**Key concept**: JSX (the HTML-like syntax in `.tsx` files) cannot run directly
in a browser. It must be compiled to plain JavaScript first. That's what Vite
does.

### 3. Local Development

Running `npm run dev` starts Vite's dev server:

```
$ npm run dev
  VITE v8.0.3  ready in 300ms
  -> Local:   http://localhost:5173/
```

Vite compiles JSX to JavaScript on the fly and serves it to your browser. When
you edit a file, the browser updates instantly (Hot Module Replacement). This is
the fastest feedback loop — write code, see it immediately.

### 4. Production Build

Running `npm run build` does two things:

1. **TypeScript check** (`tsc -b`) — verifies type safety
2. **Vite build** — compiles, bundles, and minifies everything into static files:

```
dist/
  index.html              # The page browsers load
  assets/
    index-CvvBSzse.css    # All styles, minified (~2 KB)
    index-Mm4lh9ba.js     # All JavaScript, minified (~317 KB, 101 KB gzipped)
```

The `dist/` folder is a completely self-contained static website. No server-side
code, no database, no runtime — just files a browser can open.

### 5. Git Push

The code was committed and pushed to a feature branch
(`claude/plan-react-project-J2F3A`) on GitHub, then merged to `master` via a
pull request.

### 6. Automatic Deployment (GitHub Actions)

When code lands on `master`, the GitHub Actions workflow
(`.github/workflows/deploy.yml`) fires automatically:

```yaml
steps:
  - checkout the code
  - install Node.js 22
  - npm ci              # install dependencies
  - npm run build       # produce the dist/ folder
  - upload dist/ to GitHub Pages
  - deploy
```

GitHub Pages then serves those static files at **https://dflaccav.github.io**.

### 7. Browser Loads the Site

When someone visits the URL:
1. Browser downloads `index.html` (0.45 KB)
2. `index.html` references the JS bundle, browser downloads it
3. JavaScript executes, React mounts `<App />` into the `<div id="root">`
4. Framer Motion triggers the entrance animation
5. CSS animations start (gradient shift, breathing pulse, orb drift)
6. User sees "Hi Mom" with full visual effects

---

## The Full Journey in One Sentence

**JSX source code** -> **Vite compiles to static HTML/JS/CSS** -> **pushed to
GitHub** -> **GitHub Actions builds and deploys** -> **GitHub Pages serves it**
-> **browser renders React app** -> **Mom sees "Hi Mom"**

---

## Tech Stack

| Layer         | Tool              | Why                                    |
|---------------|-------------------|----------------------------------------|
| Framework     | React 19          | Component-based UI                     |
| Language      | TypeScript        | Type safety for the animation code     |
| Bundler       | Vite 8            | Fast builds, instant dev server        |
| Animation     | Framer Motion     | Spring physics, enter/exit transitions |
| Styling       | CSS               | Gradients, keyframe animations         |
| Hosting       | GitHub Pages      | Free, automatic from the repo          |
| CI/CD         | GitHub Actions    | Builds and deploys on every push       |

---

## Files That Matter

| File | What it does |
|------|-------------|
| `src/App.tsx` | The entire visual experience — "Hi Mom" text, animations, click handler |
| `src/App.css` | Gradient text effect, breathing animation, glow orb, layout |
| `src/index.css` | Color palette (gold, coral, lavender, sky), dark background, resets |
| `src/main.tsx` | Mounts the React app to the DOM (3 lines of boilerplate) |
| `.github/workflows/deploy.yml` | Automation — build and deploy on push to master |
| `vite.config.ts` | Tells Vite to use the React plugin (2 lines of config) |

---

## How to Iterate

```bash
# Start local dev server with hot reload
npm run dev

# Edit src/App.tsx, save, see changes instantly in browser

# When happy, commit and push to master
git add -A && git commit -m "update" && git push

# GitHub Actions deploys automatically in ~60 seconds
```
