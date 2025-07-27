# Public Assets Directory

This directory contains static assets served by the Farming Products API.

## Structure

```
public/
├── index.html          # Main welcome page
├── 404.html            # Custom 404 error page
├── assets/             # Static assets directory
│   ├── styles.css      # Additional CSS styles
│   ├── script.js       # Interactive JavaScript features
│   └── images/         # Image assets (created automatically)
└── README.md           # This file
```

## Files Description

### `index.html`
The main landing page that displays:
- Welcome message for the Farming Products API
- Technology stack overview
- Complete API endpoints documentation
- Interactive features and animations
- Responsive design for all devices

### `404.html`
Custom 404 error page with:
- Beautiful error page design with animations
- Helpful navigation options (Go Home, Go Back, API Docs)
- Search functionality for finding API endpoints
- Display of the requested path that caused the 404
- Interactive elements and keyboard shortcuts
- Responsive design for all devices

### `styles.css`
Additional CSS styles including:
- Custom scrollbar styling
- Button components
- Status indicators
- Code block styling
- Responsive utilities
- Animation classes

### `script.js`
Interactive JavaScript features:
- Smooth scrolling navigation
- Copy-to-clipboard functionality for code blocks
- API status checking
- Typing effect animations
- Parallax scrolling effects
- Search functionality for endpoints
- Back-to-top button
- Intersection observer animations

### `assets/`
Directory containing all static assets:
- **`styles.css`**: Additional CSS styles including custom scrollbar, buttons, status indicators, and responsive utilities
- **`script.js`**: Interactive JavaScript features including smooth scrolling, copy-to-clipboard, API status checking, and animations
- **`images/`**: Directory for storing uploaded images and static image assets

## Access

- **Main page**: `http://localhost:3000/` (serves index.html)
- **Static files**: `http://localhost:3000/public/`
- **Assets**: `http://localhost:3000/public/assets/`
- **Images**: `http://localhost:3000/public/assets/images/`

## Features

1. **Responsive Design**: Works on desktop, tablet, and mobile devices
2. **Modern UI**: Beautiful gradients, animations, and hover effects
3. **Interactive Elements**: Clickable code blocks, search functionality
4. **API Documentation**: Complete endpoint listing with HTTP methods
5. **Status Monitoring**: Real-time API status checking
6. **Accessibility**: Proper semantic HTML and keyboard navigation

## Customization

To customize the welcome page:
1. Edit `index.html` for content changes
2. Modify `styles.css` for styling updates
3. Update `script.js` for interactive features
4. Add new assets to the appropriate subdirectories

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

- Optimized images and assets
- Minified CSS and JavaScript (in production)
- Lazy loading for better performance
- Efficient animations using CSS transforms 