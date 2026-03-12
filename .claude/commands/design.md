# /design — Multi-Trajectory UI Design Generator

You are a world-class UI/UX designer and frontend architect. The user has invoked `/design` to generate multiple distinct design directions for a UI component or page.

This command implements the `multi-design` skill. See `skills/multi-design/SKILL.md` for the full design philosophy and anti-patterns. The gallery template is at `skills/multi-design/assets/gallery-template.html`.

## Input

The argument is: `$ARGUMENTS`

Interpret it as one of:
- **A natural language prompt** (e.g., "a crypto portfolio dashboard") — design from scratch
- **A file path** (e.g., `src/components/Login.tsx`) — read the file, understand its purpose, and redesign it with 3 fresh directions

If a file path is given, read it first. Understand what it does, its data shape, and its role in the app before designing.

## Phase 1: Fan Out — Generate 3 Design Trajectories

Create **3 radically different** standalone HTML files, each a complete, polished, interactive UI. These are not wireframes — they are high-fidelity, production-quality designs with:

- Embedded CSS (modern features: container queries, `color-mix()`, `@layer`, fluid typography with `clamp()`, custom properties, view transitions where appropriate)
- Embedded JS for interactivity (state, animations, micro-interactions)
- Real typography via Google Fonts
- Realistic placeholder data (not "Lorem ipsum" — use domain-appropriate fake data)
- Responsive design that works at multiple breakpoints
- Smooth animations and transitions
- Dark color schemes unless the prompt implies otherwise

**Each direction must have a distinct design philosophy.** Think in terms of material metaphors:

- Direction A might be: **Architectural** — stark geometry, monospaced type, mathematical grids, exposed structure
- Direction B might be: **Organic** — fluid shapes, natural gradients, breathing animations, soft edges
- Direction C might be: **Editorial** — bold typography hierarchy, magazine-like layout, dramatic whitespace, serif + sans-serif pairing

But don't just use these three — invent metaphors that fit the specific prompt. A music player wants different metaphors than a financial dashboard.

**Give each direction a short, evocative name** (e.g., "Liquid Glass", "Brutalist Grid", "Soft Terrain").

### Writing the files

1. Create a `.designs/` directory in the project root (add it to `.gitignore` if not already there)
2. Write three files:
   - `.designs/direction-a.html`
   - `.designs/direction-b.html`
   - `.designs/direction-c.html`
3. Write `.designs/index.html` — a gallery page that embeds all three in iframes side-by-side with labels, and includes a simple tab/carousel for smaller screens

### Serving the preview

After writing all files, start a local HTTP server:

```
npx -y serve .designs -p 3333 --no-clipboard -l false
```

Run this in the background. Tell the user to open `http://localhost:3333` to see all three directions side-by-side.

## Phase 2: Present Choices

Use `AskUserQuestion` to present the 3 directions. Use the `preview` field on each option to show an ASCII art approximation of the layout structure (not the full HTML — just a structural sketch showing the grid, key elements, and visual weight).

Include a 4th implicit "Other" option (handled automatically by AskUserQuestion) for the user to give custom feedback.

Example option structure:
- **Label**: The direction name (e.g., "Liquid Glass")
- **Description**: 1-sentence summary of the design philosophy and what makes it distinct
- **Preview**: ASCII layout sketch showing structural composition

## Phase 3: Deepen — Based on Selection

Once the user selects a direction, present a second `AskUserQuestion` with these paths:

1. **"Variations"** — Generate 3 variations *within* the selected direction (same philosophy, different executions: layout tweaks, color shifts, density changes). Write them to `.designs/variations/` and update the server.
2. **"Extract to Component"** — Convert the selected HTML into a proper React/Vue/Svelte component (detect the project's framework). Create real component files with props, TypeScript types, and CSS modules or Tailwind classes. Place them in the project's component directory.
3. **"Integrate"** — Go further than extraction: wire the component into the existing app with proper imports, routing, state management hooks, and data fetching. Make it actually work in the project.
4. **"Remix"** — Take the selected direction but apply it to a different prompt or use case the user specifies.

For each subsequent path, continue the pattern: do the work, present the result, offer the next set of choices. The investigation never dead-ends — there's always a next step.

## Guidelines

- Never use placeholder comments like `/* add styles here */` — every file must be complete and working
- Use semantic HTML5 elements
- Ensure accessibility: proper contrast ratios, focus states, aria labels, keyboard navigation
- Prefer CSS over JS for visual effects where possible
- Each HTML file should be fully self-contained (no external dependencies except Google Fonts CDN)
- Keep total file size per direction under 50KB
- Use `<meta name="color-scheme" content="dark light">` appropriately
- Include a subtle "Direction A/B/C" label in each file's corner for identification
