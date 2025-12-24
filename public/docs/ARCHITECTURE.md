# Power Tracker Extension - Architecture Documentation

## Directory Structure

```
public/
├── manifest.json              # Extension manifest
│
├── html/                      # HTML pages
│   ├── popup.html            # Main popup interface
│   ├── options.html          # Settings/options page
│   └── dashboard.html        # Dashboard page
│
├── css/                      # Stylesheets
│   ├── popup.css
│   ├── options.css
│   └── dashboard.css
│
├── icons/                    # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
│
├── js/
│   ├── core/                 # Core functionality
│   │   ├── service-worker.js # Main background service worker
│   │   └── power-calculator.js # Power calculation engine
│   │
│   ├── background/           # Background scripts (future expansion)
│   │
│   ├── content/              # Content scripts
│   │   ├── content-script.js # Main content script
│   │   └── content-script-notifications.js # In-page notifications
│   │
│   ├── popup/                # Popup interface
│   │   └── popup.js          # Main popup controller
│   │
│   ├── options/              # Options page
│   │   └── options.js        # Options page controller
│   │
│   ├── features/             # Feature modules
│   │   ├── enhanced-ai-energy-database.js
│   │   ├── enhanced-query-estimation.js
│   │   ├── ai-model-comparison.js
│   │   ├── ai-energy-database.js
│   │   ├── backend-power-calculator.js
│   │   └── energy-saving-tips.js
│   │
│   ├── utils/                # Utility modules
│   │   ├── firebase-helpers.js
│   │   ├── firebase-manager.js
│   │   ├── firebase-app-compat.js
│   │   └── data-migration.js
│   │
│   └── config/               # Configuration
│       └── firebase-config.js
│
└── docs/                     # Documentation
    ├── ARCHITECTURE.md       # This file
    ├── README.md
    └── ...
```

## Script Loading Order

### Popup Page (`html/popup.html`)

Scripts are loaded in this order (bottom to top = execution order):

1. **Config Layer**: Firebase configuration
2. **Core Layer**: Power calculator
3. **Features Layer**: AI energy, backend power, query estimation
4. **Utils Layer**: Firebase helpers
5. **Popup Layer**: Main popup controller

### Options Page (`html/options.html`)

1. **Config Layer**: Firebase configuration
2. **Core Layer**: Power calculator
3. **Options Layer**: Options controller

### Dashboard Page (`html/dashboard.html`)

1. **Config Layer**: Firebase configuration

## Module Dependencies

### Core Modules
- `service-worker.js`: Main background worker, coordinates all background tasks
- `power-calculator.js`: Core power calculation engine

### Feature Modules
- `enhanced-ai-energy-database.js`: AI model energy database
- `backend-power-calculator.js`: Backend AI power calculations
- `enhanced-query-estimation.js`: Query token estimation
- `ai-model-comparison.js`: Model comparison utilities

### Utility Modules
- `firebase-helpers.js`: Firebase helper functions
- `firebase-manager.js`: Firebase manager class
- `data-migration.js`: Data migration utilities

## File Paths Reference

### In Code References

When referencing files in code, use these paths:

- **Content Scripts**: `js/content/content-script.js`
- **HTML Pages**: `html/popup.html`, `html/options.html`
- **Icons**: `icons/icon-48.png`
- **Config**: `js/config/firebase-config.js`

### Manifest References

- **Service Worker**: `js/core/service-worker.js`
- **Content Scripts**: `js/content/content-script.js`, `js/content/content-script-notifications.js`
- **Popup**: `html/popup.html`
- **Icons**: `icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`

## Extension Entry Points

1. **Service Worker** (`js/core/service-worker.js`): Runs in background, handles tab tracking, energy calculations
2. **Content Script** (`js/content/content-script.js`): Injected into web pages, collects metrics
3. **Popup** (`html/popup.html`): User-facing popup interface
4. **Options** (`html/options.html`): Settings and configuration page

## Data Flow

1. **Content Script** → Collects page metrics (DOM nodes, CPU usage, etc.)
2. **Content Script** → Sends metrics to **Service Worker** via `chrome.runtime.sendMessage`
3. **Service Worker** → Processes metrics using **Power Calculator**
4. **Service Worker** → Stores data in Chrome storage
5. **Popup/Options** → Requests data from **Service Worker**
6. **Popup/Options** → Displays data to user

## Future Refactoring Opportunities

1. **Split Large Files**:
   - `popup.js` → Split into `popup-data.js`, `popup-ui.js`, `prompt-generator.js`
   - `options.js` → Split into `options-settings.js`, `options-history.js`, `options-insights.js`
   - `service-worker.js` → Split into `energy-tracker.js`, `tab-manager.js`, `notification-manager.js`

2. **Module System**: Consider using ES6 modules with import/export

3. **Type Safety**: Consider adding TypeScript for better type safety

4. **Build System**: Add a build step to bundle and minify code

