# basic_bot_react

A React component library for robot control interfaces, published to NPM with automated documentation.

## Project Overview

This is an NPM-publishable React component library that provides UI components for controlling and monitoring robots. It includes:

- **4 Main Components**: ObjectsOverlay, PanTilt, VideoFeed, WebRTCVideoClient
- **5 Utility Modules**: hubState, hubMessages, angleUtils, uiUtils, webrtcClient
- **Storybook Documentation**: Auto-deployed to GitHub Pages
- **TypeDoc Integration**: Auto-generates MDX docs from JSDoc comments

## Tech Stack

- **Build Tool**: Vite (ES modules + UMD)
- **Framework**: React 18+ with TypeScript
- **Documentation**: Storybook 8 with Autodocs
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Prettier (4-space tabs) + ESLint (flat config)
- **CI/CD**: GitHub Actions for testing, linting, building, and deployment

## Architecture

### Components

All components are in `src/components/`:

- **ObjectsOverlay**: Displays recognized objects with bounding boxes over video feed
- **PanTilt**: Touch-based interface for controlling pan/tilt servos
- **VideoFeed**: MJPEG video stream display
- **WebRTCVideoClient**: WebRTC-based video/audio streaming

Each component has:

- `.tsx` - Component implementation
- `.test.tsx` - Vitest tests
- `.stories.tsx` - Storybook stories with `tags: ['autodocs']`
- `.module.css` - CSS modules (where applicable)

### Utilities

All utilities are in `src/utils/`:

- **hubState.ts**: WebSocket communication with robot hub
- **hubMessages.ts**: Convenience wrapper for state updates with retry
- **angleUtils.ts**: Angle calculations and coordinate transformations
- **uiUtils.ts**: UI helper functions (touch vs mouse events)
- **webrtcClient.ts**: WebRTC client for video/audio streaming

## Documentation System

### JSDoc → MDX Pipeline

1. Write comprehensive JSDoc comments in TypeScript files
2. TypeDoc generates MDX files to `src/docs/` (gitignored)
3. MDX files are auto-generated before Storybook builds
4. Storybook picks up MDX files and displays them

Configuration:

- `typedoc.json` - TypeDoc configuration
- `tsconfig.typedoc.json` - Separate tsconfig to exclude test files
- `.gitignore` includes `src/docs/` (generated files)

### NPM Scripts

```json
{
    "dev": "vite",
    "build": "tsc --project tsconfig.build.json && vite build",
    "test": "vitest",
    "lint": "prettier --write . && eslint --fix .",
    "docs:generate": "typedoc",
    "prestorybook": "npm run docs:generate",
    "storybook": "storybook dev -p 6006",
    "prebuild-storybook": "npm run docs:generate",
    "build-storybook": "storybook build"
}
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy-storybook.yml`):

1. **Lint**: `npm run lint` - Prettier + ESLint
2. **Test**: `npm run test` - All Vitest tests must pass
3. **Build**: `npm run build` - TypeScript compilation + Vite build
4. **Build Storybook**: Auto-generates docs, builds Storybook
5. **Deploy**: Deploys to GitHub Pages

**Stops on any error** - ensuring only quality code is deployed.

## Code Quality

### ESLint Configuration

- Flat config (`eslint.config.js`)
- React hooks + React refresh plugins
- TypeScript ESLint
- Ignores: `dist`, `storybook-static`, `coverage`
- Special rules for test files: allows `_` prefix for unused parameters

### Prettier Configuration

- 4-space tabs (`.prettierrc`)
- Ignores build artifacts (`.prettierignore`)

## Testing Guidelines

- Use Vitest + React Testing Library
- Mock utility modules when testing components
- Prefix unused mock parameters with `_` to satisfy ESLint
- Use `getAllByText()` for duplicate text elements
- Use `{ hidden: true }` for hidden elements with `getByRole()`
- Use async imports for mocked modules in tests

Example:

```typescript
vi.mock("../../utils/angleUtils", () => ({
    mapXYToPanTilt: vi.fn((_x, _y) => [90, 45]),
}));
```

## Important Conventions

### Documentation

- **Always add JSDoc comments** to exported functions, classes, and interfaces
- Include `@param`, `@returns`, and `@example` tags
- Module-level JSDoc with `@module` tag
- TypeDoc auto-generates MDX from JSDoc - keep them in sync

### Components

- **Always include Storybook story** with `tags: ['autodocs']`
- **Always include tests** with good coverage
- Use CSS modules for styling
- Export component and its props interface
- Always include a "className" prop that gets appended to outer container
- All css module class names for the outer most container element should be named like `bbr{ComponentName}Container` so PanTilt component's outer element class is `.bbrPanTiltContainer`

### Code Style

- Run `npm run lint` before committing
- 4-space indentation (enforced by Prettier)
- TypeScript strict mode enabled

## Publishing Workflow

1. Update version in `package.json`
2. Run `npm run test` - ensure all tests pass
3. Run `npm run build` - verify library builds
4. Run `npm publish` - publishes to NPM (calls `prepublishOnly`)
5. Push to GitHub - triggers CI/CD and documentation deployment

## Key Files

- `package.json` - Dependencies, scripts, package config
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - Main TypeScript config
- `tsconfig.build.json` - Build-specific TypeScript config
- `tsconfig.typedoc.json` - TypeDoc-specific config (excludes tests)
- `typedoc.json` - TypeDoc configuration for MDX generation
- `.storybook/main.ts` - Storybook configuration
- `.github/workflows/deploy-storybook.yml` - CI/CD pipeline

## Using the Library

### Importing Components

To use components from this library in your application:

```typescript
import { PanTilt, VideoFeed, ObjectsOverlay } from "basic_bot_react";
import "basic_bot_react/style.css"; // Required: Import component styles
```

**IMPORTANT**: You must import `basic_bot_react/style.css` in your application to get component styling. Without this import, components will render without their CSS.

For npm-linked development (e.g., `npm link ../basic_bot_react`), you may need to use a relative path:

```typescript
import "../basic_bot_react/dist/style.css";
```

## Common Tasks

### Adding a New Component

1. Create component folder in `src/components/`
2. Create `.tsx`, `.test.tsx`, `.stories.tsx`, `.module.css`
3. Export from `src/components/index.ts`
4. Add JSDoc comments
5. Ensure tests pass: `npm run test`
6. View in Storybook: `npm run storybook`

### Adding a New Utility

1. Create `.ts` file in `src/utils/`
2. Add comprehensive JSDoc comments with examples
3. Add tests in `.test.ts`
4. Export from `src/index.ts` if needed for library consumers
5. Run `npm run docs:generate` to verify MDX generation

### Updating Documentation

- Update JSDoc comments in source files
- Documentation auto-regenerates on next Storybook build
- No need to manually edit MDX files (they're gitignored)

## Robot Communication

### WebSocket (hubState)

- Connects to robot's central hub via WebSocket
- Manages state synchronization
- Use `connectToHub()` and `addHubStateUpdatedListener()`

### WebRTC (webrtcClient)

- Establishes real-time video/audio connection
- Use `WebRTCClient.start()` with video and audio elements
- Auto-negotiates SDP offer/answer

### State Updates (hubMessages)

- Convenience wrapper with retry logic
- Use `sendHubStateUpdate()` for reliable updates

## Troubleshooting

### Tests Failing

- Check if mock parameters need `_` prefix
- Verify async imports for mocked modules
- Use `getAllByText()` for duplicate elements

### TypeDoc Errors

- Ensure `tsconfig.typedoc.json` excludes test files
- Check JSDoc syntax is valid

### Lint Errors

- Run `npm run lint` to auto-fix
- Check `.prettierignore` and eslint config ignores

## Repository

- **GitHub**: https://github.com/littlebee/basic_bot_react
- **NPM**: basic_bot_react
- **Docs**: https://littlebee.github.io/basic_bot_react
