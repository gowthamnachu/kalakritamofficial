# Kalakritam - Art & Creativity Website

## Overview
Kalakritam is a React-based website featuring an intro video page that automatically redirects to the home page. The entire website uses a consistent #002f2f color scheme for a professional, artistic appearance.

## Features

### 1. Intro Video Page (`/`)
- Displays an intro video (when configured)
- Automatic redirect to home page after video completion
- Fallback animation if no video is available
- Skip button for user control
- 3-second auto-redirect for fallback content

### 2. Home Page (`/home`)
- Welcome section for Kalakritam
- Feature cards showcasing art gallery, workshops, and community
- Responsive design with #002f2f color scheme
- Call-to-action buttons

### 3. Color Scheme
- Primary color: #002f2f (dark teal)
- Accent colors: #004545, #006666, #66cccc
- Consistent throughout all components

## File Structure
```
src/
├── components/
│   ├── IntroVideo/
│   │   ├── IntroVideo.jsx       # Intro video component
│   │   ├── IntroVideo.css       # Intro video styles
│   │   └── index.js            # Export file
│   ├── Home/
│   │   ├── Home.jsx            # Home page component
│   │   ├── Home.css            # Home page styles
│   │   └── index.js            # Export file
│   ├── Gallery/
│   │   ├── Gallery.jsx         # Gallery component (example)
│   │   ├── Gallery.css         # Gallery styles
│   │   └── index.js            # Export file
│   ├── Navigation/
│   │   ├── Navigation.jsx      # Navigation component (example)
│   │   ├── Navigation.css      # Navigation styles
│   │   └── index.js            # Export file
│   └── README.md               # Component organization guide
├── App.jsx                     # Main app with routing
├── App.css                     # App styles
├── index.css                   # Global styles
└── main.jsx                    # React entry point
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your Intro Video (Optional)
1. Place your video file in the `public/` folder (e.g., `public/intro-video.mp4`)
2. Update `src/components/IntroVideo.jsx` line 59:
   ```jsx
   <source src="/intro-video.mp4" type="video/mp4" />
   ```
3. Uncomment the source tag

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Technical Details

### Routing
- Uses React Router DOM for navigation
- Default route (`/`) shows intro video
- Home route (`/home`) shows main content
- Automatic fallback redirects for invalid routes

### Video Handling
- Supports MP4, WebM, OGG formats
- Auto-play with muted attribute for browser compatibility
- Error handling with graceful fallbacks
- Event listeners for video end and errors

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and mobile devices
- Flexible grid layouts
- Optimized for various screen sizes

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Fallback support for older browsers

## Performance Optimizations
- Lazy loading of video content
- Optimized CSS animations
- Minimal JavaScript bundle
- Fast page transitions

## Customization
- Colors can be easily changed in CSS files
- Components are modular and reusable
- Video duration and redirect timing configurable
- Easy to add additional pages/routes

## Component Organization
Each component follows a consistent folder structure:
- **ComponentName.jsx** - Main component logic
- **ComponentName.css** - Component-specific styles with #002f2f color scheme
- **index.js** - Export file for clean imports (`export { default } from './ComponentName';`)

### Adding New Components
1. Create folder: `src/components/YourComponent/`
2. Add three files: `YourComponent.jsx`, `YourComponent.css`, `index.js`
3. Import cleanly: `import YourComponent from './components/YourComponent'`
4. Follow the #002f2f color scheme and naming conventions

See `src/components/README.md` for detailed component creation guidelines.

## Support
For issues or questions about video setup, refer to `VIDEO_SETUP.md`
