# Tech Context - Power Tracker Chrome Extension

## Technology Stack

### Core Platform
- **Chrome Extensions API**: Manifest V3 (minimum Chrome 88+)
- **JavaScript**: ES6+ with modern async/await patterns
- **Storage**: Chrome Storage API (local and sync)
- **Permissions**: storage, tabs, scripting, activeTab, notifications, alarms, background
- **Host Permissions**: `<all_urls>` for comprehensive monitoring

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern features including CSS Grid, Flexbox, Custom Properties
- **Design System**: Glassmorphism with backdrop-filter effects
- **Responsive Design**: Mobile-first approach with breakpoint system
- **Dark Mode**: CSS custom properties with `prefers-color-scheme`

### JavaScript Architecture
- **Module Pattern**: ES6 classes and modules for organization
- **Async Programming**: Promise-based with async/await throughout
- **Event-Driven**: Observer pattern for real-time monitoring
- **Error Handling**: Comprehensive try-catch with retry logic
- **Performance APIs**: PerformanceObserver, MutationObserver, Navigation API

## Development Environment

### Required Setup
```bash
# Development prerequisites
- Chrome 88+ (for Manifest V3 support)
- Node.js 16+ (for development tooling)
- Git (for version control)
- Code editor with JavaScript support (VS Code recommended)

# Chrome Developer Mode
1. Navigate to chrome://extensions/
2. Enable "Developer mode"
3. Load unpacked extension from project directory
```

### Project Structure
```
power-tracker/
├── manifest.json              # Chrome extension manifest
├── public/                    # Extension files
│   ├── service-worker.js      # Background service worker
│   ├── content-script.js      # Content script injection
│   ├── popup.html/js/css      # Extension popup
│   ├── options.html/js/css    # Settings page
│   ├── power-calculator.js    # Core power calculations
│   ├── data-migration.js      # Data migration utilities
│   └── icons/                 # Extension icons (16, 48, 128px)
├── memory-bank/               # Project documentation
└── README.md                  # Project overview
```

### Development Workflow
1. **Local Development**: Load unpacked extension in Chrome
2. **Hot Reload**: Manual reload required for Manifest V3 extensions
3. **Debugging**: Chrome DevTools for popup, service worker console for background
4. **Testing**: Manual testing across different websites and usage patterns
5. **Performance**: Chrome DevTools Performance tab for impact measurement

## Technical Dependencies

### Chrome APIs
```javascript
// Core Chrome Extension APIs
chrome.runtime.*          // Message passing, extension lifecycle
chrome.tabs.*            // Tab management and querying
chrome.storage.*         // Local and sync storage
chrome.scripting.*       // Content script injection
chrome.notifications.*   // System notifications
chrome.alarms.*         // Background processing timers
```

### Browser APIs
```javascript
// Performance Monitoring APIs
PerformanceObserver      // Resource timing, navigation timing
MutationObserver        // DOM change detection
performance.memory      // Memory usage (Chromium-specific)
performance.now()       // High-resolution timing

// Optional APIs
navigator.getBattery()   // Battery status (when available)
IntersectionObserver    // Element visibility detection
```

### No External Dependencies
- **Zero NPM packages**: All functionality implemented natively
- **No build process**: Direct JavaScript without transpilation
- **No external APIs**: Local processing only for privacy and reliability
- **No frameworks**: Vanilla JavaScript for maximum compatibility and performance

## Technical Constraints

### Chrome Manifest V3 Limitations
```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "service-worker.js"  // No persistent background pages
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
  }
}
```

**Key Constraints**:
- **Service Worker Lifecycle**: Background script can be terminated and restarted
- **No eval()**: Strict CSP prevents dynamic code execution
- **Limited Storage**: Chrome storage quotas (5MB local, 100KB sync)
- **Permission Model**: Must request specific permissions upfront
- **Cross-Origin**: Limited cross-origin requests without host permissions

### Performance Requirements
```javascript
// Performance targets
- Memory footprint: < 10MB total
- CPU overhead: < 1% average
- Popup load time: < 200ms
- Energy measurement accuracy: ±10%
- Service worker restart: < 1 second recovery
```

### Browser Compatibility
- **Primary Target**: Chrome 88+ (Manifest V3)
- **Secondary**: Edge 88+ (Chromium-based)
- **Not Supported**: Firefox (different WebExtensions implementation)
- **Not Supported**: Safari (limited WebExtensions support)

## Security Architecture

### Content Security Policy
```javascript
// Extension pages CSP
"script-src 'self'": No external scripts or eval()
"object-src 'self'": No external objects
"style-src 'self' 'unsafe-inline'": Allow inline CSS for dynamic theming
```

### Data Privacy
- **Local Processing**: All calculations performed locally
- **No Network Requests**: Extension never sends data externally
- **Storage Encryption**: Chrome handles encryption for sync storage
- **Permission Principle**: Minimal required permissions only

### Access Control
```javascript
// Advanced features protection
const ACCESS_CODE = '0410';
function validateAccessCode(code) {
  return code === ACCESS_CODE;
}
```

**Security Features**:
- **Session-based Access**: No persistent credential storage
- **Feature Isolation**: Advanced features cleanly separated
- **Input Validation**: All user inputs validated and sanitized
- **Error Boundaries**: Comprehensive error handling prevents crashes

## Data Storage Strategy

### Chrome Storage Usage
```javascript
// Local Storage (5MB quota)
chrome.storage.local.set({
  energyHistory: [],        // Power consumption history
  backendEnergyHistory: [], // AI model energy tracking
  settings: {},            // User preferences
  notificationSettings: {},// Notification preferences
  behaviorPatterns: [],    // Agent learning data
  migrationBackups: {}     // Data migration safety
});

// Sync Storage (100KB quota)
chrome.storage.sync.set({
  theme: 'light'           // UI theme preference
});
```

### Data Schema Evolution
```javascript
// Migration system for schema changes
const SCHEMA_VERSION = '2.0.0';
const migrations = {
  '1.0.0': migrateFromLegacyEnergyScores,
  '1.5.0': addBackendEnergyTracking,
  '2.0.0': addAgentSystemData
};
```

## Development Tools and Patterns

### Debugging Setup
```javascript
// Console logging patterns
console.log('[EnergyTracker] Message');    // Component identification
console.warn('[PopupManager] Warning');    // Non-critical issues
console.error('[AgentSystem] Error');      // Critical errors

// Debug flags
localStorage.setItem('energy-agent-debug', 'true');
```

### Error Handling Patterns
```javascript
// Consistent error handling
try {
  const result = await riskOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('[Component] Operation failed:', error);
  return { success: false, error: error.message };
}
```

### Testing Strategies
```javascript
// Manual testing scenarios
1. Install extension and verify basic functionality
2. Test across different websites (text, video, interactive)
3. Verify service worker restart recovery
4. Test with multiple tabs and high memory usage
5. Validate power calculations against known benchmarks
6. Test advanced features with access code
```

## Performance Optimization

### Memory Management
```javascript
// Bounded data structures
const MAX_HISTORY_ENTRIES = 10000;
const MAX_PATTERN_CONTEXTS = 100;
const DATA_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup routines
setInterval(cleanupOldData, 5 * 60 * 1000); // Every 5 minutes
```

### CPU Optimization
```javascript
// Adaptive sampling rates
const ACTIVE_TAB_INTERVAL = 5000;    // 5 seconds
const HIDDEN_TAB_INTERVAL = 30000;   // 30 seconds
const CLEANUP_INTERVAL = 60000;      // 1 minute

// Throttled operations
const throttledUpdate = throttle(updateUI, 100);
```

### Network Efficiency
- **No External Requests**: All processing local
- **Minimal Message Passing**: Batched updates when possible
- **Cached Calculations**: Results cached between UI updates
- **Lazy Loading**: Advanced features loaded on demand

## Integration Patterns

### Extension Compatibility
```javascript
// Safe global variable usage
if (typeof window.MyExtensionClass === 'undefined') {
  window.MyExtensionClass = MyClass;
}

// Message type namespacing
const MESSAGE_PREFIX = 'POWER_TRACKER_';
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type.startsWith(MESSAGE_PREFIX)) {
    return handleMessage(message);
  }
  return false; // Let other extensions handle their messages
});
```

### Content Script Injection
```javascript
// Safe injection patterns
try {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content-script.js']
  });
} catch (error) {
  // Handle injection failures (system pages, permissions)
  console.log('Content script injection failed:', error.message);
}
```

## Deployment and Distribution

### Chrome Web Store Preparation
```javascript
// Manifest validation
- All permissions justified and documented
- Privacy policy URL required for user data access
- Icons in required sizes (16, 48, 128 pixels)
- Version number follows semantic versioning
```

### Release Process
1. **Testing**: Manual testing across target scenarios
2. **Version Bump**: Update manifest.json version
3. **Package**: Create ZIP with all required files
4. **Store Upload**: Submit to Chrome Web Store
5. **Review Wait**: Typically 1-3 days for approval
6. **Monitoring**: Watch for user feedback and error reports

### Rollback Strategy
```javascript
// Data migration safety
await this.createSafetyBackup(backupKey);
try {
  await this.performMigration();
} catch (error) {
  await this.restoreFromBackup(backupKey);
  throw error;
}
```

## Future Technology Considerations

### Potential Upgrades
- **Web Assembly**: For more intensive calculations
- **Shared Array Buffer**: For worker thread optimization
- **CSS Container Queries**: For more responsive popup design
- **Chrome Extensions API v4**: When available

### Experimental Features
- **Battery API**: Enhanced mobile power optimization
- **Performance Observer v2**: More detailed performance metrics
- **Origin Private File System API**: Local data caching
- **Web Workers**: Background calculation optimization

This technical foundation provides a robust, scalable platform for energy monitoring and optimization while maintaining compatibility and performance across the Chrome ecosystem.