# basic_bot_react

A collection of React components for basic_bot.

## Installation

```bash
npm install basic_bot_react
```

## Usage

```tsx
import { YourComponent } from 'basic_bot_react';

function App() {
  return <YourComponent />;
}
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start Storybook dev server
npm run storybook

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build the library
npm run build
```

### Project Structure

```
basic_bot_react/
├── src/
│   ├── components/         # Component source files
│   │   ├── Button/
│   │   │   ├── Button.tsx           # Component implementation
│   │   │   ├── Button.test.tsx      # Unit tests
│   │   │   └── Button.stories.tsx   # Storybook stories
│   │   └── index.ts        # Component exports
│   └── index.ts            # Library entry point
├── .storybook/             # Storybook configuration
├── tests/                  # Test setup and utilities
└── dist/                   # Build output (gitignored)
```

### Adding a New Component

1. Create a new directory under `src/components/YourComponent/`
2. Create the component file: `YourComponent.tsx`
3. Add TypeScript types and JSDoc comments for automatic documentation
4. Create a test file: `YourComponent.test.tsx`
5. Create a story file: `YourComponent.stories.tsx` with `tags: ['autodocs']`
6. Export the component in `src/components/index.ts`

Example component with Autodocs:

```tsx
// src/components/Button/Button.tsx
export interface ButtonProps {
  /** The button variant style */
  variant?: 'primary' | 'secondary';
  /** Button click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
}

/**
 * A reusable Button component
 */
export const Button = ({ variant = 'primary', onClick, children }: ButtonProps) => {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'], // Enables automatic documentation
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

## Documentation

Component documentation is automatically generated and deployed to GitHub Pages.

[View Documentation](https://littlebee.github.io/basic_bot_react)

## Publishing to NPM

1. Update version in `package.json` following [SemVer](https://semver.org/)
2. Run tests and build: `npm run prepublishOnly`
3. Login to NPM: `npm login`
4. Publish: `npm publish --access public`

## License

MIT
