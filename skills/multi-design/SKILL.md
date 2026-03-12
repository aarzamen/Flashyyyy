---
name: multi-design
description: Generate multiple radically divergent UI design directions simultaneously, present them for live side-by-side comparison, and iteratively deepen a selected direction. Use when the user wants to explore design options, compare UI approaches, generate design variations, fan out creative directions for a component or page, or says things like "show me some options", "what could this look like", "redesign this", "design directions", or "explore designs for". Also triggers when the user provides a UI prompt and wants more than one take on it.
---

# Multi-Design: Divergent UI Exploration

This skill generates 3 radically different design directions for any UI prompt, serves them as live previews for side-by-side comparison, and then lets the user drill deeper into their preferred direction through successive rounds of refinement.

The philosophy: creative exploration benefits from seeing multiple futures simultaneously before committing. One bold direction is good (that's what the `frontend-design` skill does). Three divergent directions that you can *see and compare* before choosing — that's how real design studios work.

## How It Works

The user provides either:
- **A natural language prompt** — "a crypto portfolio dashboard", "settings page for a music app"
- **A file path to existing code** — read it, understand its purpose and data shape, then reimagine it 3 ways

If given a file path, read the file first. Understand what it renders, its props/state shape, and its role in the broader app. The redesigns should handle the same data contracts.

## Phase 1: Diverge — Generate 3 Design Directions

Each direction must embody a **fundamentally different design philosophy**. Not three color variations — three different *worldviews* about how interfaces should feel.

Think in terms of material metaphors and physical analogies:

- **Architectural**: exposed grid systems, structural joints visible, monospaced type, mathematical precision, the UI as a building's blueprint
- **Organic**: fluid SVG shapes, breathing animations, natural color palettes, the UI as a living surface
- **Editorial**: dramatic typography hierarchy, magazine-like asymmetric layouts, the UI as a printed broadsheet
- **Industrial**: raw textures, visible data density, utilitarian controls, the UI as a factory floor instrument panel
- **Kinetic**: motion as the primary design element, everything in gentle flux, the UI as a mobile sculpture
- **Cartographic**: layered information density, contour-line aesthetics, the UI as a terrain map

These are starting points — invent metaphors that fit the specific prompt. A music player deserves different metaphors than a financial dashboard. Give each direction a short, evocative 2-3 word name (e.g., "Liquid Glass", "Pressed Linen", "Neon Cartography").

### Design Execution Rules

For EACH direction, generate a complete, standalone HTML file with:

**Typography that has character.** Never use Inter, Roboto, Arial, or system defaults. Load distinctive Google Fonts — pair a bold display face with a refined body face. Each direction should use a *different* typographic palette. Monospace for data-heavy contexts. Serifs for editorial warmth. Geometric sans for architectural precision.

**Color with conviction.** Each direction needs a cohesive, *different* color strategy. One might be monochromatic with a single hot accent. Another might use warm earth tones. A third might be high-contrast black and white with chromatic photography. Use CSS custom properties for consistency. Dominant colors with sharp accents beat timid, evenly-distributed palettes.

**Motion with purpose.** Include CSS/JS animations — but tied to the metaphor. Architectural = precise mechanical transitions. Organic = easing curves that breathe. Editorial = dramatic reveal sequences. Use `animation-delay` for staggered entry. Hover states that surprise. Focus on 2-3 high-impact moments rather than animating everything.

**Layout that breaks expectations.** Asymmetry. Overlap. Diagonal flow. Grid-breaking hero elements. Generous negative space OR controlled density — not the safe middle. Each direction should have a fundamentally different spatial composition.

**Atmosphere and texture.** Gradient meshes, noise/grain overlays (`feTurbulence`), layered transparencies, dramatic shadows, geometric patterns, custom borders. Create depth — not flat cards on a flat background.

**Realistic data.** Use domain-appropriate placeholder content, not "Lorem ipsum". A dashboard shows plausible numbers. A music player shows real song titles. A settings page has real toggle labels.

**Self-contained.** Each HTML file includes all CSS and JS inline. The only external dependency allowed is Google Fonts CDN. Target under 50KB per file.

**Accessible.** Proper contrast ratios, focus states, ARIA labels, semantic HTML5, keyboard navigation. Accessibility is not optional — it's part of the craft.

### Output Structure

1. Create a `.designs/` directory in the project root
2. Ensure `.designs/` is in `.gitignore`
3. Write:
   - `.designs/direction-a.html`
   - `.designs/direction-b.html`
   - `.designs/direction-c.html`
   - `.designs/index.html` — a gallery page that embeds all three in iframes with labels, keyboard navigation (`1`/`2`/`3` to focus, `F` fullscreen, `Esc` back), and responsive layout (3-up desktop, tabs on mobile). Use the gallery template from `assets/gallery-template.html` if available, otherwise create one with a dark theme, JetBrains Mono for labels, and Inter for body text.
4. Start a local preview server in the background:
   ```
   npx -y serve .designs -p 3333 --no-clipboard -l false
   ```
5. Tell the user: "Open http://localhost:3333 to see all three directions side-by-side."

## Phase 2: Present and Choose

Use `AskUserQuestion` to present the 3 directions with:

- **Label**: The direction name (e.g., "Pressed Linen")
- **Description**: One sentence capturing the design philosophy and what makes it memorable
- **Preview**: ASCII structural sketch showing the layout grid, key elements, and visual weight distribution — not the HTML, just the bones:

```
┌──────────────────────────────┐
│  ▓▓▓▓▓▓ HERO ▓▓▓▓▓▓        │
│                              │
│  ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ KPI │ │ KPI │ │ KPI │   │
│  └─────┘ └─────┘ └─────┘   │
│                              │
│  ┌──────────────┐ ┌──────┐  │
│  │              │ │      │  │
│  │   CHART      │ │ LIST │  │
│  │              │ │      │  │
│  └──────────────┘ └──────┘  │
└──────────────────────────────┘
```

The user picks a direction (or gives custom feedback via the built-in "Other" option).

## Phase 3: Deepen — Iterative Investigation

After the user selects a direction, present a second choice with these paths:

### "Variations" (explore width)
Generate 3 variations *within* the chosen direction — same philosophy, different executions. Vary layout density, color temperature, animation intensity, or information hierarchy. Write to `.designs/variations/` and update the preview server. This lets the user fine-tune within a direction without losing the core identity.

### "Extract Component" (make it real)
Convert the selected HTML into a proper framework component:
- Detect the project's framework (React, Vue, Svelte, vanilla) from `package.json` and existing code
- Create typed component files with props interfaces
- Extract CSS into the project's styling convention (CSS modules, Tailwind, styled-components — match what exists)
- Place files in the project's component directory
- Include a usage example

### "Integrate" (ship it)
Go beyond extraction — wire the component into the actual running app:
- Add imports and routing
- Connect to existing state management
- Wire up data fetching / API calls
- Handle loading and error states
- Make it work end-to-end in the project

### "Remix" (new prompt, same direction)
Take the chosen design philosophy and apply it to a *different* prompt or use case the user specifies. The aesthetic DNA carries over but the content transforms entirely.

After each deepening step, present results and offer the next set of choices. The investigation never dead-ends.

## Anti-Patterns

- Never generate three variations of the same aesthetic with different colors. The directions must be *philosophically* different.
- Never use generic placeholder comments (`/* styles here */`). Every file must be complete.
- Never converge on the same fonts across directions. Each gets its own typographic identity.
- Never default to purple-gradient-on-white. That's the AI slop signature.
- Never make all three directions dark-themed. Vary: one dark, one light, one bold/colored.
