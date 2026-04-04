# Phira: From Generated Code to Published Site

## What is Phira?

Phira is an animated "Hi Mom" greeting app built with React. It lives at
**https://dflaccav.github.io** and was generated entirely through a
conversational AI session using Claude Code.

---

## The Pipeline: Code to Browser

### 1. Scaffolding (AI-generated)

Claude Code ran `npm create vite@latest . -- --template react-ts` inside the
`dflaccav.github.io` repo. This created the Vite + React + TypeScript structure:

```
dflaccav.github.io/
  src/
    main.tsx          # Entry point - mounts React to the DOM
    App.tsx           # Landing page + "Hi Mom" component with animations
    App.css           # Visual styles (gradients, breathing pulse, button)
    index.css         # Global styles (colors, resets, dark background)
  index.html          # The single HTML page Vite builds from
  vite.config.ts      # Build configuration
  package.json        # Dependencies and scripts
```

### 2. Writing the App (AI-generated)

Claude Code wrote `App.tsx` — a React component with two states:

**Landing state**: Shows "Phira" title, subtitle, and a gradient "Open" button.

**Greeting state**: Reveals "Hi Mom" as a large heading with:
- CSS gradient text effect (gold -> coral -> lavender -> sky)
- Framer Motion spring entrance animation (fade + scale)
- Continuous "breathing" CSS animation (subtle scale pulse)
- Click to cycle through themed subtitle messages
- Ambient glow orb (CSS radial gradient with blur + drift)

**Key concept**: JSX (the HTML-like syntax in `.tsx` files) cannot run directly
in a browser. It must be compiled to plain JavaScript first. That's what Vite does.

### 3. Local Development

Running `npm run dev` starts Vite's dev server:

```
$ npm run dev
  VITE v8.0.3  ready in 300ms
  -> Local:   http://localhost:5173/
```

Vite compiles JSX to JavaScript on the fly. When you edit a file, the browser
updates instantly (Hot Module Replacement).

### 4. Production Build

Running `npm run build` does two things:

1. **TypeScript check** (`tsc -b`) — verifies type safety
2. **Vite build** — compiles, bundles, and minifies into static files:

```
dist/
  index.html              # The page browsers load
  assets/
    index-*.css           # All styles, minified (~3 KB)
    index-*.js            # All JavaScript, minified (~317 KB, ~101 KB gzipped)
```

The `dist/` folder is a completely self-contained static website. No server needed.

### 5. Git Push

Code was committed and pushed to GitHub.

### 6. Automatic Deployment (GitHub Actions)

When code lands on `master`, the workflow (`.github/workflows/deploy.yml`) fires:

```
checkout code -> install Node 22 -> npm ci -> npm run build -> deploy dist/ to GitHub Pages
```

GitHub Pages then serves those static files at **https://dflaccav.github.io**.

### 7. Browser Loads the Site

1. Browser downloads `index.html`
2. Downloads the JS bundle
3. JavaScript executes, React mounts `<App />` into `<div id="root">`
4. Landing page renders with the "Open" button
5. User clicks "Open" -> Framer Motion animates the transition
6. "Hi Mom" appears with full visual effects

---

## The Full Journey in One Sentence

**JSX source** -> **Vite compiles to HTML/JS/CSS** -> **pushed to GitHub** ->
**GitHub Actions builds & deploys** -> **GitHub Pages serves it** ->
**browser renders React** -> **Mom clicks Open** -> **"Hi Mom"**

---

## Tech Stack

| Layer         | Tool              | Why                                    |
|---------------|-------------------|----------------------------------------|
| Framework     | React 19          | Component-based UI                     |
| Language      | TypeScript        | Type safety                            |
| Bundler       | Vite 8            | Fast builds, instant dev server        |
| Animation     | Framer Motion     | Spring physics, enter/exit transitions |
| Styling       | CSS               | Gradients, keyframe animations         |
| Hosting       | GitHub Pages      | Free, automatic from the repo          |
| CI/CD         | GitHub Actions    | Builds and deploys on every push       |

---

## How to Iterate

```bash
npm run dev          # Start local dev server with hot reload
# Edit src/App.tsx, save, see changes instantly in browser
git add -A && git commit -m "update" && git push   # Deploy in ~60 seconds
```
