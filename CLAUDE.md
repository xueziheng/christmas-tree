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
| `Foliage` | 92-124 | 15,000 particle-based needles with custom GLSL shader |
| `PhotoOrnaments` | 127-234 | 300 double-sided Polaroid-style photos loaded from `/public/photos/` |
| `ChristmasElements` | 237-289 | Gifts, ornaments, candy canes (200 items) |
| `FairyLights` | 292-331 | 400 twinkling colored lights |
| `TopStar` | 334-380 | Pure gold 3D star with extruded geometry |
| `GestureController` | 426-504 | MediaPipe integration for hand gesture recognition |
| `Experience` | 383-423 | Main scene composition with post-processing (Bloom + Vignette) |

### Configuration System
All visual parameters are centralized in the `CONFIG` object (lines 28-55):
- `colors`: Color palettes for tree, lights, borders, gifts
- `counts`: Particle/object counts (foliage: 15000, ornaments: 300, lights: 400)
- `tree`: Tree dimensions (height: 22, radius: 9)
- `photos.body`: Array of photo paths

### Photo System
Photos are loaded from `public/photos/`:
- `top.jpg` - Tree top star (not currently displayed on star, star is pure gold)
- `1.jpg`, `2.jpg`, etc. - Tree ornaments

**To add/change photos**: Update `TOTAL_NUMBERED_PHOTOS` constant (line 20) and place files in `public/photos/`.

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

## Tech Stack

- **React 18.3.1** + **Vite 5.4.11**
- **Three.js 0.169.0** via React Three Fiber
- **@react-three/drei** - Helpers (Float, Sparkles, shaderMaterial, useTexture)
- **@react-three/postprocessing** - Bloom, Vignette
- **maath** - Random point generation in sphere
- **@mediapipe/tasks-vision** - AI gesture recognition

## Important Notes

1. **Performance**: The app is GPU-intensive (15,000 particles, 300 textures). Keep individual photos under 500KB.

2. **No Git Repository**: The project is not initialized as a git repo (only has `.gitignore`).

3. **No Tests**: No unit tests are present.

4. **Language**: Primary documentation (README.md) is in Chinese. The UI also includes Chinese labels.

5. **Shader Inline**: GLSL shaders are embedded directly in component definitions as template strings.
