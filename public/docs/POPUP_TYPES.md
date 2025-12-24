# Popup Types in Power Tracker Extension

## Overview

There are **TWO distinct types of popups** in this extension:

1. **Main Extension Popup** - The popup that opens when you click the extension icon
2. **In-Page Notification Popups** - Small notifications that appear on websites

---

## 1. Main Extension Popup

### What It Is
The **main extension popup** is the interface that opens when you click the Power Tracker extension icon in Chrome's toolbar. This is what you see in the screenshot.

### Key Characteristics
- ✅ Opens when user clicks extension icon
- ✅ Fixed size popup window (typically 400x600px)
- ✅ Contains full UI with multiple sections
- ✅ Stays open until user closes it
- ✅ Shows comprehensive energy data

### Files Responsible

**HTML Structure:**
- **File**: `html/popup.html`
- **Location**: Main popup UI structure

**JavaScript Controller:**
- **File**: `js/popup/popup.js`
- **Class**: `PopupManager`
- **Key Functions**:
  - `init()` - Initializes popup
  - `updateUI()` - Updates all UI elements
  - `updateStatusIndicator()` - Updates "Using fallback data" status
  - `updatePowerDisplay()` - Updates "~10W" display
  - `getEfficiencyRating()` - Calculates "~EXCELLENT" rating

**CSS Styling:**
- **File**: `css/popup.css`
- Styles the main popup appearance

**Manifest Configuration:**
```json
"action": {
  "default_popup": "html/popup.html"
}
```

### How It's Triggered
- User clicks extension icon in Chrome toolbar
- Chrome automatically opens `html/popup.html`
- `PopupManager` class initializes and loads data

### Code Location
```javascript
// Main popup initialization
// File: js/popup/popup.js
class PopupManager {
  constructor() {
    this.init(); // Loads when popup opens
  }
  
  async init() {
    await this.loadInitialData();
    this.updateUI(); // Updates all UI elements
  }
}
```

---

## 2. In-Page Notification Popups

### What They Are
**In-page notification popups** are small, temporary notifications that appear **on top of websites** (not in the extension popup). They show energy tips, reminders, and alerts.

### Key Characteristics
- ✅ Appear on websites (injected into page DOM)
- ✅ Auto-dismiss after timeout
- ✅ Triggered by timeouts, events, or service worker
- ✅ Small, floating notifications
- ✅ Can be dismissed by user
- ✅ Multiple can appear at once

### Files Responsible

**Notification System:**
- **File**: `js/content/content-script-notifications.js`
- **Class**: `EnergyTipNotificationManager`
- **Purpose**: Manages in-page notifications

**Content Script:**
- **File**: `js/content/content-script.js`
- **Purpose**: Injects notification system into web pages

**Service Worker Triggers:**
- **File**: `js/core/service-worker.js`
- **Functions**:
  - `maybeShowEnergyTip()` - Triggers energy tips
  - `maybeShowCarbonTip()` - Triggers carbon tips
  - `checkAndShowAIReminder()` - Triggers AI reminders

**Manifest Configuration:**
```json
"content_scripts": [{
  "js": [
    "js/content/content-script.js",
    "js/content/content-script-notifications.js"
  ]
}]
```

### How They're Triggered

1. **By Service Worker** (timeout-based):
```javascript
// File: js/core/service-worker.js
async maybeShowEnergyTip(tabId, powerWatts, tabData) {
  // Checks cooldown period
  // Sends message to content script
  await chrome.tabs.sendMessage(tabId, {
    type: 'SHOW_ENERGY_TIP',
    tipData: tipData
  });
}
```

2. **By Content Script** (receives message):
```javascript
// File: js/content/content-script-notifications.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_ENERGY_TIP') {
    notificationManager.showTip(message.tipData);
  }
});
```

3. **Auto-dismiss** after calculated duration:
```javascript
// Duration based on text length
duration = (word_count * 0.5s) + 1.5s
```

### Code Location
```javascript
// In-page notification system
// File: js/content/content-script-notifications.js
class EnergyTipNotificationManager {
  showTip(tipData) {
    // Creates notification element
    // Injects into page DOM
    // Auto-dismisses after timeout
  }
}
```

---

## Visual Comparison

### Main Extension Popup
```
┌─────────────────────────┐
│  Power Tracker          │ ← Extension icon click
│  Using fallback data    │
│                         │
│  [AI Prompt Optimizer]  │
│                         │
│  ~10W                   │
│  Watts                  │
│                         │
│  ~EXCELLENT             │
└─────────────────────────┘
   (Fixed popup window)
```

### In-Page Notification Popup
```
┌─────────────────────────┐
│  Website Content        │
│                         │
│  ┌───────────────┐     │ ← Appears on website
│  │ 💡 Energy Tip │     │
│  │ Close unused  │     │
│  │ tabs to save  │     │
│  │ energy        │     │
│  └───────────────┘     │
│                         │
│  (Auto-dismisses)       │
└─────────────────────────┘
```

---

## Settings That Control Each Type

### Main Extension Popup
- **No settings** - Always opens when icon is clicked
- Controlled by Chrome's extension system

### In-Page Notifications
- **Settings**: `html/options.html` → Notifications section
- **Setting**: "Enable Popups" checkbox
- **Setting**: "Notification Interval" dropdown
- **Setting**: "Power Alert Threshold" slider

---

## Quick Reference

| Feature | Main Popup | In-Page Notifications |
|---------|-----------|----------------------|
| **File** | `html/popup.html` | `js/content/content-script-notifications.js` |
| **Trigger** | User clicks icon | Timeout/event from service worker |
| **Location** | Extension popup window | On website page |
| **Duration** | Until user closes | Auto-dismiss after timeout |
| **Size** | Full popup (400x600px) | Small floating (200-300px) |
| **Purpose** | Show energy data | Show tips/alerts |
| **CSS** | `css/popup.css` | Inline styles in JS |
| **Controller** | `PopupManager` class | `EnergyTipNotificationManager` class |

---

## Code Files Summary

### Main Extension Popup
- `html/popup.html` - HTML structure
- `js/popup/popup.js` - JavaScript controller
- `css/popup.css` - Styling

### In-Page Notifications
- `js/content/content-script-notifications.js` - Notification system
- `js/content/content-script.js` - Content script injector
- `js/core/service-worker.js` - Triggers notifications

---

## Testing Each Type

### Test Main Popup
1. Click extension icon in toolbar
2. Verify popup opens
3. Check all UI elements render

### Test In-Page Notifications
1. Visit any website
2. Wait for notification interval (default 15 minutes)
3. Verify notification appears on page
4. Verify it auto-dismisses

