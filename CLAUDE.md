# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Power Tracker is a Chrome Manifest V3 extension that monitors browser energy consumption and provides AI-powered optimization. It tracks real-time power usage (6-65W range), detects AI platform usage (ChatGPT, Claude, Gemini, etc.), and offers intelligent prompt optimization to reduce energy consumption by 15-45%.

**Key Features:**
- Real-time watts-based power monitoring with multi-factor analysis
- AI backend energy tracking and prompt optimization
- OODA loop intelligent agent system for behavioral learning
- Advanced analytics with historical trends
- Access-code protected premium features (code: `0410`)

## Development Commands

### Loading the Extension
```bash
# No build step required - extension runs directly from source
# 1. Open Chrome and navigate to chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked" and select the public/ directory
# 4. Pin the extension icon to your toolbar
```

### Testing
```bash
# Manual testing required - no automated test suite
# Check syntax errors in individual files:
node -c public/popup.js
node -c public/options.js
node -c public/service-worker.js

# Verify manifest validity:
# Reload extension at chrome://extensions/ after changes
```

### Removing Console Logs (Production)
```bash
# Remove all console.log statements before deployment:
python3 remove_console_logs.py

# This strips console logs from all JS files in public/
# Always run before creating production builds
```

### Creating Production Build
```bash
# Manual packaging:
# 1. Run remove_console_logs.py to clean console statements
# 2. Create ZIP excluding test files:
unzip -l /path/to/power-tracker-v6.0.0.zip  # Verify contents
# 3. Ensure manifest version is updated (currently 6.0.0)
```

## Architecture

### Core Extension Structure

The extension follows Chrome Manifest V3 architecture with these layers:

**1. Service Worker Layer** ([service-worker.js](public/service-worker.js))
- Central coordination via `EnergyTracker` class
- Manages message routing between components
- Handles storage operations and data persistence
- Coordinates agent system and AI energy tracking

**2. Content Script Layer** ([content-script.js](public/content-script.js), [content-script-notifications.js](public/content-script-notifications.js))
- Page-level monitoring with `PageEnergyMonitor`
- DOM activity tracking, network requests, resource consumption
- In-page energy tip notifications
- AI platform detection and interaction monitoring

**3. Popup Interface** ([popup.js](public/popup.js), [popup.html](public/popup.html))
- Real-time data display via `PopupManager` class
- Access-code protected advanced features
- AI model detection and backend energy display
- Tab comparison and recommendations

**4. Options/Settings Page** ([options.js](public/options.js), [options.html](public/options.html))
- Configuration management
- Historical analytics with charts
- Data export and import functionality
- Agent dashboard and learning system controls

### Critical Component Relationships

```
service-worker.js (EnergyTracker)
├── power-calculator.js (PowerCalculator) - Frontend power calculations
├── backend-power-calculator.js (BackendPowerCalculator) - AI energy estimation
├── energy-tracker-with-agent.js (EnhancedEnergyTrackerWithAgent) - Agent integration
├── enhanced-ai-energy-database.js (EnhancedAIEnergyManager) - AI model profiles
└── pattern-recognition-system.js (PatternRecognitionSystem) - Behavioral analysis

popup.js (PopupManager)
├── enhanced-ai-energy-database.js (EnhancedAIEnergyManager)
├── backend-power-calculator.js (BackendPowerCalculator)
└── Message passing to service-worker.js

content-script.js (PageEnergyMonitor)
├── Sends ENERGY_DATA messages to service worker
├── Receives SHOW_ENERGY_TIP notifications
└── Detects AI platforms and interactions
```

### Message Passing System

**CRITICAL:** All inter-component communication uses Chrome message passing API. Never override these message types:

**Core Messages:**
- `PING` - Health check for service worker
- `ENERGY_DATA` - Content script sends page metrics to service worker
- `GET_CURRENT_ENERGY` - Request current tab energy data
- `GET_SETTINGS` / `UPDATE_SETTINGS` - Settings management
- `GET_HISTORY` - Historical energy data queries
- `SHOW_ENERGY_TIP` - Display notification to user

**AI-Specific Messages:**
- `GET_BACKEND_ENERGY_HISTORY` - AI energy consumption history
- `LOG_BACKEND_ENERGY` - Record AI interaction energy
- `DELETE_BACKEND_ENERGY_ENTRY` - Remove AI energy record

**Agent System Messages:**
- `GET_AGENT_STATUS` - Agent system health
- `EXECUTE_AGENT_ACTION` - Trigger intelligent action
- `GET_LEARNING_DATA` - Pattern recognition insights

See [INTEGRATION_MEMORY_BANK.md](public/INTEGRATION_MEMORY_BANK.md) for complete message API reference.

### Storage Schema

**Chrome Storage Keys (DO NOT OVERRIDE):**
- `energyHistory` - Array of frontend energy records
- `backendEnergyHistory` - Array of AI energy records
- `settings` - User configuration object
- `notificationSettings` - Notification preferences (includes duration, interval, enabled state)
- `agentState` - Agent system learning data
- `patternRecognitionData` - Behavioral patterns

### Notification System

**In-Page Notifications** ([content-script-notifications.js](public/content-script-notifications.js)):

The extension displays energy-saving tips and AI prompt reminders as overlay notifications on web pages. Key features:

- **Default Display Duration**: 5.5 seconds (configurable in Settings: 3-10 seconds)
- **Auto-Dismiss**: Notifications automatically hide after the configured duration
- **User-Configurable Settings**:
  - `duration` - How long notifications stay visible (default: 5500ms)
  - `notificationInterval` - Time between notifications (default: 5 minutes)
  - `enabled` - Enable/disable all notifications
  - `position` - Screen position for notifications (default: top-right)

**Disabled Sites**: Notifications are automatically disabled on the following sites to prevent display issues:
- AI platforms: claude.ai, chat.openai.com, chatgpt.com, gemini.google.com, perplexity.ai, bard.google.com, bing.com/chat, poe.com
- Video streaming: netflix.com, youtube.com, youtu.be
- Google services: mail.google.com, docs.google.com, drive.google.com, gmail.com

**CSP Compliance**: Notifications use secure DOM creation methods that work with strict Content Security Policies on sites like Gmail and Google Docs.

**Configuring Notification Duration**:
1. Open extension Options/Settings page
2. Navigate to Settings tab
3. Find "Notification Display Duration" dropdown
4. Select desired duration (3-10 seconds)
5. Changes apply immediately to all tabs

### Access Code System

Premium features are protected by access code `0410`:
- AI Prompt Generator (full optimization interface)
- Advanced Analytics (comprehensive trend analysis)
- Model Comparison (energy efficiency comparison)
- Export capabilities

**Implementation:** Check `localStorage.getItem('powerTrackerAccessGranted')` before showing protected features.

## Power Calculation Methodology

### Frontend Power (Browser)

Uses multi-factor analysis in [power-calculator.js](public/power-calculator.js):
- **DOM Complexity**: Node count, depth, active elements
- **Network Activity**: Request count, data transfer, connection overhead
- **Media Consumption**: Video/audio elements, canvas rendering
- **CPU Usage**: Script execution intensity
- **GPU Rendering**: Complex visual effects

**Output:** 6-65W range with confidence scores (±10% typical)

### Backend Power (AI)

Uses model-specific profiles in [enhanced-ai-energy-database.js](public/enhanced-ai-energy-database.js):
- **GPT-4o**: 0.0042 kWh per query (4.2 Wh)
- **Claude Sonnet 4**: 0.0035 kWh per query (3.5 Wh)
- **Gemini**: 0.0028 kWh per query (2.8 Wh)
- **Perplexity**: 0.0030 kWh per query (3.0 Wh)

Calculations include token estimation, context size, and model architecture efficiency.

## AI Detection System

**Fallback Detection Strategy** ([popup.js](public/popup.js) lines 2632-2749):

When formal detection fails, the system checks tab URL and title for:
- `chat.openai.com` or `chatgpt.com` → ChatGPT (GPT-4o)
- `claude.ai` → Claude (Sonnet 4)
- `gemini.google.com` → Gemini
- `perplexity.ai` → Perplexity

Creates complete model objects with real energy data and integrates with `aiEnergyManager.estimateAIUsage()` for backend calculations.

## Critical CSS Architecture

Uses LearnTAV design system with CSS variables:
- `--text-primary`, `--text-secondary`, `--text-muted` - Text hierarchy
- `--surface`, `--surface-elevated` - Background levels
- `--primary`, `--success`, `--warning`, `--danger` - Status colors
- `--space-{1-8}` - Spacing scale
- `--radius`, `--radius-lg` - Border radius
- `--shadow`, `--shadow-md`, `--shadow-lg` - Elevation

**UI Component Classes:**
- `.tab-info-card` - Main content cards
- `.tab-section` - Subsections within cards (AI Model, Backend Energy)
- `.section-title` - Section headers with emoji icons
- `.backend-metrics-grid` - Grid layout for backend metrics
- `.efficiency-good/medium/poor` - Efficiency status indicators

## Integration Safety

### Namespace Isolation

All global variables use prefixes:
- `__energy*` - Internal energy tracking
- `window.PageEnergyMonitor` - Content script monitor class

### Extension Compatibility

Tested with popular extensions. Safe coexistence patterns:
- No global scope pollution
- Unique message type prefixes
- Isolated CSS classes
- Namespaced storage keys

See [INTEGRATION_MEMORY_BANK.md](public/INTEGRATION_MEMORY_BANK.md) for complete integration guide.

## Key Files to Understand

### Must Read for Any Task
1. [manifest.json](public/manifest.json) - Extension configuration and permissions
2. [service-worker.js](public/service-worker.js) - Central orchestration logic
3. [popup.js](public/popup.js) - Main UI interaction layer
4. [power-calculator.js](public/power-calculator.js) - Frontend energy algorithms

### AI Features
5. [enhanced-ai-energy-database.js](public/enhanced-ai-energy-database.js) - AI model energy profiles
6. [backend-power-calculator.js](public/backend-power-calculator.js) - AI energy estimation
7. [content-script.js](public/content-script.js) - Page monitoring and AI detection

### Agent System
8. [energy-agent-core.js](public/energy-agent-core.js) - OODA loop intelligence
9. [pattern-recognition-system.js](public/pattern-recognition-system.js) - Behavioral learning
10. [intelligent-actions.js](public/intelligent-actions.js) - Automated optimizations

### Documentation
11. [INTEGRATION_MEMORY_BANK.md](public/INTEGRATION_MEMORY_BANK.md) - Complete API reference
12. [copilot-instructions-softwaredev-membank.md](copilot-instructions-softwaredev-membank.md) - Memory bank system

## Common Patterns

### Adding New UI Sections

1. Update HTML structure in [popup.html](public/popup.html)
2. Add CSS styling in [popup.css](public/popup.css) using design system variables
3. Add event listeners in [popup.js](public/popup.js) `setupEventListeners()`
4. Create update methods (e.g., `updateAIModelInfoSection()`)
5. Call update methods in `loadInitialData()` and `startPeriodicUpdates()`

### Adding New Message Types

1. Define message handler in [service-worker.js](public/service-worker.js) `handleMessage()`
2. Send messages from components using `chrome.runtime.sendMessage()`
3. Document in [INTEGRATION_MEMORY_BANK.md](public/INTEGRATION_MEMORY_BANK.md)
4. Update message type list in this file

### Working with Storage

```javascript
// Read from storage
chrome.storage.local.get(['energyHistory'], (result) => {
  const history = result.energyHistory || [];
});

// Write to storage
chrome.storage.local.set({ energyHistory: updatedHistory });
```

Always handle migration for storage schema changes using [data-migration.js](public/data-migration.js).

### AI Detection and Integration

When adding new AI platforms:
1. Add model profile to [enhanced-ai-energy-database.js](public/enhanced-ai-energy-database.js)
2. Add URL/title pattern to fallback detection in [popup.js](public/popup.js) `updateAIModelInfoSection()`
3. Include energy per query estimate (kWh)
4. Test with real platform to verify detection

## Privacy and Security

**Critical Rules:**
- NO external API calls (all processing is local)
- NO data transmission to external servers
- NO credential storage
- User data stays in Chrome storage only
- Clear data export/deletion options

## Current Known Issues

Check git commit history and recent changes for:
1. Help tab visibility (RESOLVED - CSS contrast fix)
2. AI model detection reliability (RESOLVED - fallback detection)
3. Prompt Generator data integration (DOCUMENTED - requires implementation)

## Version and Release Notes

Current version: **6.0.0**

Recent major changes:
- Phase 8: Deployment preparation (console log cleanup, documentation, production build)
- AI detection fallback system (URL/title-based detection)
- Backend energy data integration with database values
- UI reorganization (consolidated Current Tab sections)
- Firebase integration for cloud sync capabilities
- Enhanced security with Firestore permissions

See [CHANGELOG.md](public/CHANGELOG.md) for complete version history.
