# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React + Three.js interactive 3D Christmas tree** application with AI gesture control. The entire application is contained in a single 554-line monolithic component (`src/App.tsx`) that uses React Three Fiber (R3F) for 3D rendering and Google MediaPipe for hand gesture recognition.

## Development Commands

```bash
# Development
npm run dev          # Start Vite dev server with hot reload

# Build
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint
```

## Architecture

### Single-File Component Structure
All code resides in `src/App.tsx`. The key pattern is **morphing between two states**:

- **CHAOS**: Elements scattered randomly in 3D space
- **FORMED**: Elements assembled into a tree shape

All 3D components (foliage, ornaments, lights, star) support these states with smooth interpolation using `MathUtils.damp()`.

### Key Components (in App.tsx)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `Foliage` | 100-132 | 15,000 particle-based needles with custom GLSL shader |
| `PhotoOrnaments` | 135-242 | 300 double-sided Polaroid-style photos loaded from `/public/photos/` |
| `ChristmasElements` | 245-297 | Gifts, ornaments, candy canes (200 items) |
| `FairyLights` | 300-339 | 400 twinkling colored lights |
| `TopStar` | 342-388 | Pure gold 3D star with extruded geometry |
| `ChristmasGreeting` | 391-472 | "圣诞节快乐" text with sparkles, appears when tree forms |
| `GestureController` | 522-600+ | MediaPipe integration for hand gesture recognition |
| `Experience` | 475-518 | Main scene composition with post-processing (Bloom + Vignette) |

### Configuration System
All visual parameters are centralized in the `CONFIG` object (lines 28-55):
- `colors`: Color palettes for tree, lights, borders, gifts
- `counts`: Particle/object counts (foliage: 15000, ornaments: 300, lights: 400)
- `tree`: Tree dimensions (height: 22, radius: 9)
- `photos.body`: Array of photo paths

### Photo System
Photos are loaded from `public/photos/`:
- `top.webp` - Tree top star (not currently displayed on star, star is pure gold)
- `1.webp`, `2.webp`, etc. - Tree ornaments (WebP format for smaller file size)

**To add/change photos**: Update `TOTAL_PHOTOS` constant (line 12) and place files in `public/photos/`.

### Shader Extension Pattern
Custom materials use `shaderMaterial` from `@react-three/drei` with `extend()` to make them available as JSX elements:

```typescript
const FoliageMaterial = shaderMaterial(uniforms, vertexShader, fragmentShader);
extend({ FoliageMaterial }); // Enables <foliageMaterial /> in JSX
```

### Post-Processing Pipeline
Bloom and vignette effects are applied via `@react-three/postprocessing`:
```typescript
<EffectComposer>
  <Bloom luminanceThreshold={0.8} intensity={1.5} />
  <Vignette eskil={false} offset={0.1} darkness={1.2} />
</EffectComposer>
```

## Gesture Controls (AI)

Uses Google MediaPipe Tasks Vision for hand tracking:

| Gesture | Action |
|---------|--------|
| Open Palm | Disperse (CHAOS) |
| Closed Fist | Assemble (FORMED) |
| Hand movement left/right | Rotate camera |

Debug mode available via UI button to see camera view and hand tracking visualization.

## Photo Management Scripts

The project includes utility scripts in `scripts/` for managing photos:

```bash
# Download photos from Pexels API (requires PEXELS_API_KEY in .env)
node scripts/fetch-pexels.mjs

# Compress and convert photos to WebP format
node scripts/compress-photos.mjs

# Resize photos to 600px width
node scripts/resize-compress-photos.mjs

# Rename photos to numbered sequence (1.webp, 2.webp, etc.)
node scripts/rename-photos.mjs
```

## Tech Stack

- **React 18.3.1** + **Vite 5.4.11**
- **Three.js 0.169.0** via React Three Fiber
- **@react-three/drei** - Helpers (Float, Sparkles, shaderMaterial, useTexture)
- **@react-three/postprocessing** - Bloom, Vignette
- **maath** - Random point generation in sphere
- **@mediapipe/tasks-vision** - AI gesture recognition

## Mobile Optimization

The app automatically detects mobile devices and applies optimizations:
- Reduces particle count (4000 vs 15000)
- Reduces photo count (50 vs 300)
- Reduces decorations (50 vs 200)
- Reduces lights (100 vs 400)
- Disables AI gesture control
- Disables post-processing effects (Bloom, Vignette)
- Disables Stars background

Detection: `isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768`

## Important Notes

1. **Performance**: The app is GPU-intensive (15,000 particles, 300 textures). Keep individual photos under 500KB.

2. **No Git Repository**: The project is not initialized as a git repo (only has `.gitignore`).

3. **No Tests**: No unit tests are present.

4. **Language**: Primary documentation (README.md) is in Chinese. The UI also includes Chinese labels.

5. **Shader Inline**: GLSL shaders are embedded directly in component definitions as template strings.

6. **Build Configuration**: Vite config includes manual chunk splitting for three.js, mediapipe, and R3F libraries to optimize bundle size (see `vite.config.ts`).
