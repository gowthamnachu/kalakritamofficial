# Component Organization Structure

## Overview
All components in this project follow a consistent folder structure where each component has its own directory containing the JSX file, CSS file, and an index.js for clean imports.

## Structure Template
```
src/
└── components/
    ├── ComponentName/
    │   ├── ComponentName.jsx    # Main component file
    │   ├── ComponentName.css    # Component-specific styles
    │   └── index.js            # Export file for clean imports
    └── AnotherComponent/
        ├── AnotherComponent.jsx
        ├── AnotherComponent.css
        └── index.js
```

## Existing Components

### IntroVideo
- **Path**: `src/components/IntroVideo/`
- **Purpose**: Displays intro video with auto-redirect to home page
- **Files**:
  - `IntroVideo.jsx` - Main component logic
  - `IntroVideo.css` - Styles with #002f2f color scheme
  - `index.js` - Export file

### Home
- **Path**: `src/components/Home/`
- **Purpose**: Main landing page after intro video
- **Files**:
  - `Home.jsx` - Main component logic
  - `Home.css` - Styles with #002f2f color scheme
  - `index.js` - Export file

## Creating New Components

### Step 1: Create Component Folder
```bash
mkdir src/components/YourComponentName
```

### Step 2: Create Component Files

#### YourComponentName.jsx
```jsx
import React from 'react';
import './YourComponentName.css';

const YourComponentName = () => {
  return (
    <div className="your-component-container">
      {/* Your component content */}
    </div>
  );
};

export default YourComponentName;
```

#### YourComponentName.css
```css
/* Use #002f2f color scheme throughout */
.your-component-container {
  background-color: #002f2f;
  color: white;
  /* Add your component styles */
}
```

#### index.js
```javascript
export { default } from './YourComponentName';
```

### Step 3: Import and Use
```jsx
import YourComponentName from './components/YourComponentName';
```

## Styling Guidelines

### Color Palette
- Primary: `#002f2f` (dark teal)
- Secondary: `#004545` 
- Accent: `#006666`
- Light accent: `#66cccc`
- Text: `#ffffff` (white)
- Secondary text: `#cccccc`

### CSS Structure
1. Container styles first
2. Layout styles (flexbox, grid)
3. Typography styles
4. Interactive elements (buttons, links)
5. Animations and transitions
6. Media queries for responsiveness

### Naming Conventions
- Use kebab-case for CSS classes
- Prefix classes with component name: `.home-container`, `.intro-video-container`
- Use semantic naming: `.hero-section`, `.feature-card`, `.cta-button`

## Import Benefits
- Clean import statements: `import Home from './components/Home'`
- Easy to refactor and move components
- Consistent project structure
- Better code organization and maintainability

## Future Components Ideas
- Header/Navigation
- Footer
- Gallery
- Workshop
- Community
- About
- Contact
- User Profile
- Authentication

Each new component should follow this structure for consistency and maintainability.
