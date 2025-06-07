
# FOH Order Management System

A touch-friendly front-of-house order management system for restaurants with real-time timers, priority management, and audio cues.

## Features

- Touch-based interface optimized for tablets
- Real-time order timers with color-coded alerts
- Priority order management
- Audio notifications for different actions
- Column-based organization (Menu Items, Entrees, Sides)
- Swipe gestures for order management
- Multi-language support (English/Spanish)

## File Structure

```
├── assets/
│   ├── images/          # All image assets
│   └── sounds/          # All audio files
├── index.html           # Landing page
├── main-app.html        # Main application
├── script.js            # JavaScript functionality
├── style.css            # Styling and animations
└── README.md            # This file
```

## Usage

1. Open `index.html` for the landing page
2. Click "Enter" to access the main application
3. Use touch gestures to manage orders:
   - Single tap: Add new order
   - Double tap: Remove order
   - Swipe left: Remove order
   - Swipe right: Reset timer
   - Tap active order: Toggle priority

## Development

This is a static web application that can be served with any web server.
