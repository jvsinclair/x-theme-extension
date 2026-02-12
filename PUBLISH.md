# GitHub Publishing Instructions

## Quick Setup

Since git needs your identity configured, run these commands first:

```powershell
git config user.email "your-email@example.com"
git config user.name "jvsinclair"
```

Then commit your changes:

```powershell
git add .
git commit -m "Initial commit: X Theme Customizer extension"
```

## Publishing to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `x-theme-extension`
3. **Description**: "Chrome extension for advanced X.com background color customization"
4. **Keep it Public** (or Private if preferred)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. **Click "Create repository"**

7. **Push your code** (GitHub will show these commands):
```powershell
git remote add origin https://github.com/jvsinclair/x-theme-extension.git
git branch -M main
git push -u origin main
```

### Option 2: Use GitHub CLI (if installed)

```powershell
gh repo create x-theme-extension --public --source=. --remote=origin --push
```

## What's Ready for GitHub

✅ **Source Files:**
- manifest.json
- content.js (with header class `.r-5zmot` support)
- popup.html/popup.js (with live updates, debouncing)
- styles.css

✅ **Documentation:**
- README.md (installation, usage, features)
- LICENSE (MIT)

✅ **Git Files:**
- .gitignore (excludes OS files, editors, builds)
- Git repository initialized

✅ **Icons:**
- SVG versions ready
- Instructions for PNG conversion included

## Next Steps After Publishing

1. **Create a Release** on GitHub with the version 1.0.0
2. **Add Topics** to your repo: `chrome-extension`, `twitter`, `x-com`, `theme-customizer`
3. **Consider Chrome Web Store** (optional):
   - Package as .zip
   - Submit to https://chrome.google.com/webstore/devconsole
   - Costs $5 one-time developer fee

## Files Included

```
x-theme-extension/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── styles.css
├── icons/
│   ├── icon16.svg
│   ├── icon48.svg
│   ├── icon128.svg
│   └── ICON_INSTRUCTIONS.md
├── README.md
├── LICENSE
└── .gitignore
```

## Current Extension Features

✅ Background color customization with slider (0-100% lightness)
✅ RGB color picker with live preview
✅ Real-time updates without page reload (debounced to prevent rate limiting)
✅ Popup panel with inline controls
✅ Persistent settings across sessions
✅ Targets all key X.com background classes:
   - `.r-kemksi` (timeline/feed)
   - `.r-5zmot` (header)
   - Other container classes

## Known Limitations

⚠️ Icons are SVG - need PNG conversion for Chrome (instructions in icons/ folder)
⚠️ Manual testing only (automated testing requires X.com authentication)
⚠️ May break if X.com significantly changes their CSS class names
