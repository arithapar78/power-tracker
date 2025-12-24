# Development Setup Guide - Power Tracker

## Quick Start

This is a **Chrome Extension** project that runs without any build process or npm install. Simply load it directly into Chrome.

## Prerequisites

- **Chrome Browser** 88+ (for Manifest V3 support)
- **Git** (you already have this if you cloned the repo)
- Optional: Code editor (VS Code recommended)

**Note**: Node.js is NOT required for basic development. The extension uses vanilla JavaScript with no build process.

## Installation Steps

### 1. Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
   - Or go to Menu (⋮) → More Tools → Extensions

### 2. Enable Developer Mode

1. Find the toggle switch labeled **"Developer mode"** in the top-right corner
2. Turn it **ON** (it should turn blue/active)

### 3. Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to your project directory: `/Users/darwin/dev/arithapar78/power-tracker/`
3. Select the **`public/`** folder (NOT the root folder)
4. Click **"Select"** or **"Open"**

### 4. Verify Installation

You should see:
- ✅ Power Tracker extension card appears in the extensions list
- ✅ Extension icon (⚡) appears in your Chrome toolbar
- ✅ No error messages in the extension details

### 5. Pin the Extension (Optional but Recommended)

1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "Power Tracker" in the list
3. Click the pin icon (📌) to pin it to your toolbar for easy access

## Testing in Dev Mode

### Basic Functionality Test

1. **Open the Extension Popup**
   - Click the ⚡ icon in your Chrome toolbar
   - You should see the Power Tracker popup with current power consumption

2. **Check Real-Time Monitoring**
   - Browse to any website
   - Click the extension icon again
   - You should see power consumption values updating

3. **Test Settings Page**
   - Click the gear icon (⚙️) in the popup
   - Or right-click the extension icon → Options
   - Settings page should open in a new tab

### Debugging Tools

#### Service Worker Console (Background Scripts)

1. Go to `chrome://extensions/`
2. Find Power Tracker in the list
3. Click **"service worker"** link (or "Inspect views: service worker")
4. This opens DevTools for background scripts
5. Check the Console tab for logs and errors

#### Popup DevTools

1. Right-click the ⚡ extension icon
2. Select **"Inspect popup"** from the context menu
3. DevTools opens showing popup.html console

#### Content Script Debugging

1. Open any website
2. Press `F12` to open DevTools
3. Go to Console tab
4. Content script logs will appear here (prefixed with extension name)

### Common Test Scenarios

#### Test 1: Basic Power Tracking
```bash
1. Open a new tab
2. Navigate to any website (e.g., google.com)
3. Open extension popup
4. Verify: Power consumption shows values (typically 6-65W)
```

#### Test 2: Advanced Features Access
```bash
1. Open extension popup
2. Look for "Advanced Features" section
3. Click the ⚡ lightning bolt button
4. Enter access code: 0410
5. Verify: Advanced features unlock
```

#### Test 3: Firebase Connection (if applicable)
```bash
1. Open service worker console (see Debugging Tools above)
2. Look for: "Firebase initialized successfully"
3. Check for any Firebase connection errors
```

#### Test 4: Data Persistence
```bash
1. Use browser for a few minutes
2. Open extension popup → View history/charts
3. Close and reopen Chrome
4. Verify: Data persists (energy usage history remains)
```

### Hot Reload (Making Changes)

**Important**: Chrome extensions don't auto-reload. After making code changes:

1. Go to `chrome://extensions/`
2. Find Power Tracker extension
3. Click the **refresh/reload icon** (🔄) on the extension card
4. Changes take effect immediately

**Pro Tip**: Keep `chrome://extensions/` open in a tab for quick reloads during development.

## Project Structure

```
power-tracker/
├── public/                    # ← Load THIS folder in Chrome
│   ├── manifest.json         # Extension manifest
│   ├── service-worker.js     # Background script
│   ├── popup.html/js/css     # Extension popup UI
│   ├── content-script.js     # Injected into web pages
│   └── ...                   # Other extension files
├── memory-bank/              # Project documentation
└── README.md                 # Project overview
```

## Troubleshooting

### Extension Not Loading
- ✅ Ensure you selected the `public/` folder (not root folder)
- ✅ Check for errors in `chrome://extensions/` error messages
- ✅ Verify Chrome version is 88+

### Extension Not Working
- ✅ Check service worker console for errors
- ✅ Reload the extension after code changes
- ✅ Verify permissions are granted (check manifest.json)

### No Power Readings
- ✅ Make sure you've browsed to at least one website
- ✅ Check service worker console for initialization errors
- ✅ Verify content scripts are injecting (check page console)

### Firebase Errors
- ✅ Check service worker console for Firebase initialization
- ✅ Verify internet connection (Firebase requires network)
- ✅ Check firebase-config.js has valid credentials

## Development Workflow

1. **Make code changes** in your editor
2. **Save files**
3. **Go to** `chrome://extensions/`
4. **Click reload** (🔄) on Power Tracker extension
5. **Test changes** in browser
6. **Check console** for errors if something breaks

## Next Steps

- Read `README.md` for feature documentation
- Check `memory-bank/` folder for architecture details
- Review `public/INTEGRATION_MEMORY_BANK.md` for API reference

---

**Happy Coding!** 🚀

For questions or issues, check the troubleshooting section above or review the project documentation.


