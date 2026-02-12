# X Theme Customizer

A Chrome extension that adds advanced background color customization controls to X.com (formerly Twitter).

## Features

- **Custom Background Slider**: Precisely adjust background lightness from 0-100%
- **Color Picker**: Choose any custom background color using RGB/HSL selection
- **Real-time Preview**: See changes instantly as you adjust colors
- **Persistent Settings**: Your custom theme is saved and applied across all X.com pages
- **Native Integration**: Controls seamlessly integrate into X's display settings page
- **Match X's Design**: UI styled to match X's existing interface

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `x-theme-extension` folder
6. The extension icon should appear in your toolbar

## Usage

### Method 1: Via Display Settings Page

1. Navigate to [X.com Display Settings](https://x.com/settings/display)
2. Scroll down to find the "Custom Background Color" section
3. Toggle "Enable Custom Color" to activate
4. Use the slider to adjust lightness (0-100)
5. Use the color picker for precise color selection
6. Click "Reset to Default" to restore X's original theme

### Method 2: Via Extension Popup

1. Click the extension icon in your Chrome toolbar
2. Toggle "Custom Theme" on/off
3. Click "Open Display Settings" to configure colors
4. View current status and applied theme

## How It Works

The extension:
1. Injects custom UI controls into X.com's display settings page
2. Overrides CSS variables (`--color-background`, `--background`) using dynamic styles
3. Stores your preferences using Chrome's Storage API
4. Applies saved settings across all X.com pages automatically

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `storage` (for saving preferences)
- **Host Permissions**: `x.com/*`, `twitter.com/*`
- **Content Scripts**: Injected on all X.com pages, with UI controls on `/settings/display`

## Compatibility

- **Browsers**: Chrome, Edge, Brave, and other Chromium-based browsers
- **X Themes**: Works with Light, Dim, and Dark modes
- **CSS Variables**: Targets X's HSL-based color system

##  Files Structure

```
x-theme-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script (color controls & application)
├── styles.css            # Custom UI styling
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Customization

You can modify the default settings in `content.js`:

```javascript
const CONFIG = {
  storageKey: 'xThemeCustomizer',
  cssVarName: '--color-background',
  defaultColors: {
    dark: '0 0% 0%',
    light: '0 0% 100%',
    dim: '210 34% 13%'
  }
};
```

## Troubleshooting

**Controls not appearing:**
- Refresh the settings page after installing the extension
- Make sure you're on `x.com/settings/display`
- Check that the extension is enabled in `chrome://extensions/`

**Colors not applying:**
- Enable the custom theme toggle
- Try clicking "Reset to Default" and reapplying your settings
- Check browser console for errors (F12 → Console tab)

**Settings not persisting:**
- Ensure the extension has storage permissions
- Check Chrome's extension storage in DevTools

## Privacy

This extension:
- ✅ Only runs on X.com/Twitter.com
- ✅ Stores settings locally in your browser
- ✅ Does NOT collect or transmit any data
- ✅ Does NOT require account access
- ✅ Open source and auditable

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions welcome! To contribute:
1. Fork the repository at https://github.com/jvsinclair/x-theme-extension
2. Create a feature branch
3. Make your changes
4. Test thoroughly on X.com
5. Submit a pull request

## Credits

Created by [jvsinclair](https://github.com/jvsinclair) for X.com power users who want more theme customization options.

---

**Note**: This is an unofficial extension and is not affiliated with or endorsed by X Corp.
