
# PandaKDS - Kitchen Display System

A responsive kitchen display system designed for restaurant food preparation management.

## Features

- **Touch-friendly Interface**: Optimized for tablet and touchscreen devices
- **Real-time Timers**: Visual countdown timers for each menu item
- **Priority System**: Mark items as priority with visual indicators
- **Sound Notifications**: Audio cues for different actions (can be muted)
- **Multi-language Support**: English/Spanish toggle
- **Color-coded Status**: Green (fresh), Orange (waiting), Red (urgent)
- **Responsive Layout**: Works on various screen sizes

## File Structure

```
├── assets/
│   ├── images/          # Image files (logos, backgrounds)
│   └── sounds/          # Audio files for notifications
├── index.html           # Landing page
├── main-app.html        # Main application
├── script.js            # Application logic
├── style.css            # Styling
└── README.md            # This file
```

## Usage

1. Open `index.html` in a web browser
2. Click "ENTER" to access the main kitchen display
3. Tap menu buttons to add items to the display
4. Single tap to add/prioritize items
5. Double tap to remove items
6. Access help guide via the "HELP" button

## Touch Controls

- **Single Tap**: Add item or mark as priority
- **Double Tap**: Remove active item
- **Swipe Right**: Reset item timer
- **Swipe Left**: Remove item

## Settings

Use the help panel to access:
- Mute/unmute sound notifications
- Language toggle (English/Spanish)
- System guide and instructions

## Browser Compatibility

- Modern browsers with HTML5 support
- Touch-enabled devices recommended
- Audio requires user interaction to unlock

## Deployment

This is a static web application that can be deployed to any web server or hosting platform.
