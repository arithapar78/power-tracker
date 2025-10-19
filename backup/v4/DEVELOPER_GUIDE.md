# Power Tracker Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Development Setup](#development-setup)
5. [Key Systems](#key-systems)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Contributing](#contributing)
10. [Deployment](#deployment)

---

## Architecture Overview

Power Tracker is a Chrome Extension (Manifest V3) that monitors browser energy consumption using a combination of DOM analysis, network tracking, and AI model detection.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Popup UI   │    │  Options UI  │    │   Content    │  │
│  │  (popup.js)  │    │ (options.js) │    │   Scripts    │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │           │
│         └───────────────────┼────────────────────┘           │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │ Service Worker  │                       │
│                    │ (Central Hub)   │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │            │
│  ┌──────▼──────┐   ┌────────▼────────┐   ┌─────▼──────┐   │
│  │   Energy    │   │   AI Energy     │   │   Storage  │   │
│  │  Tracking   │   │    Manager      │   │   Manager  │   │
│  └─────────────┘   └─────────────────┘   └────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Manifest V3 Compliance**: Uses service workers instead of background pages
2. **Message Passing**: All components communicate via Chrome's message passing API
3. **Local Storage**: All data stored locally using Chrome Storage API
4. **Performance First**: Minimal overhead, optimized update intervals
5. **Privacy Focused**: No external data transmission

---

## Project Structure

```
power-tracker-main/
├── public/                          # Extension source files
│   ├── manifest.json                # Extension manifest (Manifest V3)
│   │
│   ├── popup.html                   # Popup UI HTML
│   ├── popup.css                    # Popup UI styles
│   ├── popup.js                     # Popup UI logic
│   │
│   ├── options.html                 # Options page HTML
│   ├── options.css                  # Options page styles
│   ├── options.js                   # Options page logic
│   │
│   ├── service-worker.js            # Background service worker
│   ├── content-script.js            # Tab content script
│   ├── content-script-notifications.js  # Notification content script
│   │
│   ├── power-calculator.js          # Frontend power calculations
│   ├── backend-power-calculator.js  # Backend/AI power calculations
│   │
│   ├── ai-energy-database.js        # AI model energy data
│   ├── enhanced-ai-energy-database.js  # Extended AI energy data
│   ├── ai-model-comparison.js       # AI model comparison logic
│   │
│   ├── energy-tracker-*.js          # Energy tracking modules
│   ├── energy-agent-core.js         # Energy agent system
│   ├── agent-dashboard.js           # Agent dashboard UI
│   │
│   ├── pattern-recognition-system.js    # Usage pattern detection
│   ├── advanced-learning-system.js      # Learning algorithms
│   ├── deterministic-predictor.js       # Predictive analytics
│   ├── rule-engine.js                   # Rules processing
│   ├── intelligent-actions.js           # Smart action system
│   ├── optimization-controller.js       # Optimization logic
│   │
│   ├── energy-saving-tips.js        # Tips generation
│   ├── enhanced-query-estimation.js # Query estimation logic
│   ├── data-migration.js            # Data migration utilities
│   │
│   ├── icon-*.png                   # Extension icons
│   │
│   └── test-*.html                  # Test pages (dev only)
│
├── USER_GUIDE.md                    # End-user documentation
├── DEVELOPER_GUIDE.md               # This file
├── CHANGELOG.md                     # Version history
├── README.md                        # Project overview
│
└── phase*.txt / PHASE_*.md          # Development phase logs

```

---

## Core Components

### 1. Service Worker (`service-worker.js`)

**Role**: Central message hub, storage manager, alarm scheduler

**Key Responsibilities**:
- Message routing between components
- Energy data storage and retrieval
- Periodic energy calculations
- Settings management
- Tab tracking

**Important Functions**:
```javascript
// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Routes messages based on message.type
});

// Periodic updates
chrome.alarms.create('updateEnergy', { periodInMinutes: 1 });

// Storage operations
chrome.storage.local.set({ energyData: data });
chrome.storage.local.get(['settings'], callback);
```

**Message Types Handled**:
- `GET_CURRENT_ENERGY`: Retrieve current energy data
- `GET_SETTINGS`: Retrieve user settings
- `SAVE_SETTINGS`: Update settings
- `GET_ENERGY_HISTORY`: Retrieve historical data
- `PING`: Health check

### 2. Popup UI (`popup.js`, `popup.html`, `popup.css`)

**Role**: Main user interface for real-time energy monitoring

**Key Features**:
- Real-time power display
- Compare Tabs Strip (top 3 energy consumers)
- Environmental impact cards
- AI detection display
- Theme toggle

**Class Structure**:
```javascript
class PopupManager {
  constructor()              // Initialize popup
  init()                     // Setup event listeners
  loadInitialData()          // Load energy data
  updateDisplay()            // Refresh UI
  handleEnergyModeToggle()   // Toggle browser/total power
  loadCompareTabsData()      // Load tab comparison
  // ... more methods
}
```

**Update Cycle**:
1. Popup opens → `init()` called
2. Load data from service worker
3. Start periodic updates (every 3 seconds)
4. Update UI components
5. Stop updates when popup closes

### 3. Content Scripts

#### `content-script.js`

**Role**: Injected into each tab to collect DOM/performance metrics

**Data Collected**:
- DOM node count
- Script execution time
- Network requests
- Page complexity metrics
- AI service detection (URL pattern matching)

**Communication**:
```javascript
// Send data to service worker
chrome.runtime.sendMessage({
  type: 'TAB_METRICS',
  data: {
    domNodes: document.querySelectorAll('*').length,
    scripts: performance.getEntriesByType('script').length,
    // ... more metrics
  }
});
```

#### `content-script-notifications.js`

**Role**: Display AI energy usage notifications on pages

**Features**:
- Inject notification overlays
- Show AI query energy costs
- Dismissible notifications

### 4. Power Calculation Modules

#### `power-calculator.js`

**Frontend Power Calculation**:
```javascript
function calculatePowerConsumption(tabData) {
  const basePower = 2.0; // Watts
  const domPower = (tabData.domNodes / 10000) * 0.5;
  const scriptPower = (tabData.scriptTime / 1000) * 0.3;
  const networkPower = (tabData.networkRequests / 100) * 0.2;

  return basePower + domPower + scriptPower + networkPower;
}
```

**Factors**:
- Base browser power: ~2W
- DOM complexity: More nodes = more rendering power
- JavaScript execution: CPU-intensive
- Network activity: Data transfer costs

#### `backend-power-calculator.js`

**Backend/AI Power Estimation**:
```javascript
function estimateBackendPower(aiModel, queryCount) {
  const modelData = aiEnergyDatabase[aiModel];
  return queryCount * modelData.energyPerQuery; // Wh
}
```

**AI Model Database** (`ai-energy-database.js`):
- GPT-4: ~2.4 Wh/query
- GPT-3.5: ~0.6 Wh/query
- Claude: ~1.2 Wh/query
- Gemini: ~0.8 Wh/query

### 5. AI Detection System

**How It Works**:
1. Content script checks URL patterns
2. Detects known AI services (openai.com, claude.ai, etc.)
3. Monitors DOM for query indicators
4. Estimates queries from network activity
5. Calculates total AI energy usage

**Detection Patterns**:
```javascript
const aiPatterns = {
  'chatgpt': /chat\.openai\.com/,
  'claude': /claude\.ai/,
  'gemini': /gemini\.google\.com/,
  // ... more patterns
};
```

### 6. Storage Schema

**Chrome Storage Structure**:
```javascript
{
  // Current energy data (keyed by tab ID)
  energyData: {
    '12345': {
      power: 15.2,              // Watts
      domNodes: 3247,
      url: 'example.com',
      title: 'Example Page',
      timestamp: 1699999999999,
      aiModel: 'gpt-4',
      aiQueries: 3
    }
  },

  // User settings
  settings: {
    theme: 'light',
    updateFrequency: 'medium',
    aiTracking: true,
    notifications: true
  },

  // Historical data
  energyHistory: [
    {
      timestamp: 1699999999999,
      totalPower: 42.5,
      tabCount: 8,
      aiUsage: 12.3
    }
  ]
}
```

---

## Development Setup

### Prerequisites

- Node.js 14+ (for development tools, optional)
- Chrome/Chromium browser
- Code editor (VS Code recommended)
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd power-tracker-main
   ```

2. **Load extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `public/` directory

3. **Make changes**:
   - Edit files in `public/` directory
   - Changes to HTML/CSS are reflected immediately
   - Changes to JS require clicking "Reload" on extension card

### Development Workflow

1. Make code changes
2. Reload extension in Chrome
3. Test in browser
4. Check console for errors (F12)
5. Commit changes with descriptive messages

### Debugging Tools

**Service Worker Console**:
- Go to `chrome://extensions/`
- Click "service worker" link under Power Tracker
- Opens DevTools for background script

**Popup Console**:
- Right-click popup → "Inspect"
- Opens DevTools for popup

**Content Script Console**:
- Open page DevTools (F12)
- Content script logs appear in page console

---

## Key Systems

### Energy Tracking Flow

```
1. Alarm triggers in service worker (every minute)
2. Service worker requests data from all tabs
3. Content scripts collect metrics
4. Content scripts send metrics to service worker
5. Service worker calculates power consumption
6. Service worker stores data in Chrome storage
7. Popup requests updated data
8. Popup displays energy information
```

### Message Passing Pattern

```javascript
// Sender (popup.js)
chrome.runtime.sendMessage(
  { type: 'GET_CURRENT_ENERGY' },
  (response) => {
    if (response.success) {
      updateUI(response.data);
    }
  }
);

// Receiver (service-worker.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_ENERGY') {
    chrome.storage.local.get(['energyData'], (result) => {
      sendResponse({ success: true, data: result.energyData });
    });
    return true; // Keep channel open for async response
  }
});
```

### Settings Management

Settings are stored in Chrome storage and synced across components:

```javascript
// Save settings
async function saveSettings(newSettings) {
  await chrome.storage.local.set({ settings: newSettings });
  // Broadcast to all components
  chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED', settings: newSettings });
}

// Load settings
async function loadSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || getDefaultSettings();
}
```

---

## API Reference

### Service Worker Messages

#### `GET_CURRENT_ENERGY`
```javascript
// Request
{ type: 'GET_CURRENT_ENERGY' }

// Response
{
  success: true,
  data: {
    '12345': { power: 15.2, url: '...', ... }
  }
}
```

#### `GET_SETTINGS`
```javascript
// Request
{ type: 'GET_SETTINGS' }

// Response
{
  success: true,
  settings: { theme: 'light', ... }
}
```

#### `SAVE_SETTINGS`
```javascript
// Request
{
  type: 'SAVE_SETTINGS',
  settings: { theme: 'dark', ... }
}

// Response
{ success: true }
```

### Power Calculation Functions

```javascript
// Calculate frontend power
calculatePowerConsumption(tabData)
// Returns: number (watts)

// Calculate AI backend power
estimateBackendPower(aiModel, queryCount)
// Returns: number (watt-hours)

// Get environmental impact
calculateEnvironmentalImpact(watts)
// Returns: { co2: number, water: number, bulbs: number }
```

---

## Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup displays power data
- [ ] Compare Tabs Strip shows top consumers
- [ ] Theme toggle works
- [ ] Settings save and persist
- [ ] AI detection works on ChatGPT/Claude
- [ ] Notifications display correctly
- [ ] Data exports successfully

### Test Pages

Located in `public/`:
- `test-popup.html`: Popup UI testing
- `keyboard-test.html`: Keyboard shortcut testing
- `test-connection.html`: Service worker communication testing

### Browser Console Testing

```javascript
// Test message passing
chrome.runtime.sendMessage({ type: 'PING' }, console.log);

// Check storage
chrome.storage.local.get(null, console.log);

// Clear all data
chrome.storage.local.clear();
```

---

## Debugging

### Common Issues

**"Extension context invalidated"**
- Cause: Extension was reloaded while popup was open
- Solution: Close popup and reopen

**Data not updating**
- Check service worker console for errors
- Verify alarms are running: `chrome.alarms.getAll(console.log)`
- Confirm content scripts are injected

**High memory usage**
- Reduce update frequency in settings
- Clear old history data
- Check for memory leaks in DevTools

### Debug Mode

Enable verbose logging (add to service-worker.js):
```javascript
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) console.log('[Power Tracker]', ...args);
}
```

---

## Contributing

### Code Style

- Use consistent indentation (2 spaces)
- Meaningful variable names
- Comment complex logic
- Follow existing patterns

### Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Commit with clear messages: `git commit -m "Add: feature description"`
4. Push branch: `git push origin feature/my-feature`
5. Create pull request

### Commit Message Format

```
Type: Short description

Longer description if needed

- Bullet points for details
- Multiple changes listed
```

**Types**: `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Docs`

---

## Deployment

### Pre-Deployment Checklist

1. Remove all console.log statements ✓
2. Test in multiple browsers
3. Verify all features work
4. Update version in manifest.json
5. Update CHANGELOG.md
6. Create release notes
7. Test with fresh install

### Building for Production

```bash
# Create production build
cd public/
zip -r ../power-tracker-v2.1.0.zip . -x "*.html" -x "test-*" -x "keyboard-test*" -x "test-connection*"
```

### Chrome Web Store Deployment

1. Log in to Chrome Web Store Developer Dashboard
2. Click "Edit" on Power Tracker listing
3. Upload new package zip
4. Update store listing if needed
5. Submit for review
6. Wait for approval (typically 1-3 business days)

### Version Numbering

Follow Semantic Versioning (semver):
- **Major** (2.0.0): Breaking changes
- **Minor** (2.1.0): New features, backward compatible
- **Patch** (2.1.1): Bug fixes

---

## Performance Optimization

### Best Practices

1. **Minimize DOM queries**: Cache selectors
2. **Debounce updates**: Don't update UI too frequently
3. **Lazy load**: Only load data when needed
4. **Clean up listeners**: Remove event listeners when done
5. **Optimize storage**: Don't store unnecessary data

### Performance Monitoring

```javascript
// Measure function performance
console.time('functionName');
expensiveFunction();
console.timeEnd('functionName');

// Monitor memory
console.log(performance.memory);
```

---

## Architecture Decisions

### Why Manifest V3?

- Required for new Chrome extensions
- Better security model
- Service workers instead of background pages
- More efficient resource usage

### Why Local Storage Only?

- Privacy: No user data leaves device
- Performance: No network latency
- Reliability: Works offline
- Simplicity: No backend required

### Why Polling vs Push?

- Chrome alarms provide consistent updates
- Lower battery impact than constant monitoring
- Simpler implementation
- Sufficient for use case

---

## Future Enhancements

### Planned Features

- [ ] Cloud sync across devices
- [ ] Mobile browser support
- [ ] More AI models detected
- [ ] Machine learning predictions
- [ ] Energy leaderboards
- [ ] Browser comparison charts

### Technical Debt

- Refactor large popup.js into modules
- Add TypeScript for better type safety
- Implement automated testing
- Improve error handling
- Add internationalization (i18n)

---

## Support

### Getting Help

- Review this guide
- Check existing issues on GitHub
- Review phase documentation files
- Contact development team

### Reporting Bugs

Include:
1. Browser version
2. Extension version
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors
6. Screenshots

---

## License & Credits

Power Tracker - Browser Energy Monitoring Extension
Version: 2.1.0

Developed to promote sustainable computing practices.

For questions or contributions, see README.md.
