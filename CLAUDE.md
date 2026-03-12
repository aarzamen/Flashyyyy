# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flash UI (aka "Diffusion Chat") is a React app that uses Google's Gemini API to generate UI components from natural language prompts. Users describe a UI component, and the app generates 3 distinct design variations as live HTML/CSS artifacts rendered in sandboxed iframes. Users can then focus on a single artifact, view its source code, or generate further variations.

## Build & Development Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build
- `npm run preview` — preview production build

There are no tests or linting configured in this project.

## Environment Setup

The app requires a `GEMINI_API_KEY` in `.env.local`. Vite exposes it as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` (configured in `vite.config.ts`).

## Architecture

**Single-page React app** — all source files live at the repo root (no `src/` directory). The `@` path alias resolves to the repo root.

- **`index.tsx`** — The entire application logic: `App` component with all state management, Gemini API calls, streaming JSON parsing, and the full render tree. This is the main file (~600 lines).
- **`types.ts`** — Core types: `Artifact` (generated UI with status tracking), `Session` (prompt + artifacts), `ComponentVariation`, `LayoutOption`.
- **`constants.ts`** — Placeholder prompt suggestions.
- **`utils.ts`** — Single `generateId()` utility.
- **`components/`** — Small presentational components:
  - `ArtifactCard.tsx` — Renders a single artifact in an iframe with streaming/complete states
  - `DottedGlowBackground.tsx` — Canvas-based animated dot background
  - `SideDrawer.tsx` — Slide-in drawer for code view and variations
  - `Icons.tsx` — SVG icon components
- **`index.css`** — All styles in a single CSS file (no CSS modules or preprocessors).

**Key data flow:** User prompt → Gemini generates 3 style names → 3 parallel streaming Gemini calls produce HTML artifacts → rendered in sandboxed iframes. The `parseJsonStream` generator in `index.tsx` handles incremental JSON parsing from Gemini's streaming responses.

**State model:** Sessions are stored in a flat array. Navigation uses `currentSessionIndex` (which session) and `focusedArtifactIndex` (which artifact within a session, or `null` for grid view).

**AI model used:** `gemini-3.1-flash-lite-preview` via `@google/genai` SDK.

## Custom Slash Commands & Skills

### `/design <prompt or file path>`

Multi-trajectory UI design generator inspired by this app's own Flash UI pattern. Takes the core concept — fan a prompt into multiple visual trajectories, present them concurrently, let the user collapse to one, then deepen — and makes it a reusable Claude Code workflow.

- **Output**: `.designs/` directory (gitignored) with `direction-a.html`, `direction-b.html`, `direction-c.html`, and an `index.html` gallery
- **Preview**: Served on `http://localhost:3333` via `npx serve`
- **Gallery**: Keyboard shortcuts (`1`/`2`/`3` to focus, `F` fullscreen, `Esc` back), responsive (3-up desktop, tabs mobile)
- **Input modes**: Natural language prompt (design from scratch) or file path (redesign existing component)
- **Deepening paths after selection**: Variations (explore within direction), Extract Component (to project framework), Integrate (wire into app), Remix (new prompt, same aesthetic DNA)

### `multi-design` Skill (installable)

The `/design` command is backed by `skills/multi-design/SKILL.md` — a standalone, installable skill following [Anthropic's official skill format](https://github.com/anthropics/skills). It can be used in Claude Code CLI, Claude Desktop, or any Claude environment that supports skills. The skill includes:
- `SKILL.md` — full instructions with YAML frontmatter for auto-triggering
- `assets/gallery-template.html` — the comparison gallery page

## License

Apache-2.0 (SPDX headers in source files).
