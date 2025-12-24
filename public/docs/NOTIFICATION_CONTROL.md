# Notification Control Guide

## Overview

This extension has **two types of popups**:
1. **Main Extension Popup** - Opens when clicking the extension icon (NOT controlled by these flags)
2. **In-Page Notifications** - Small notifications that appear on websites (controlled by flags below)

This guide covers controlling **in-page notifications only**.

---

## Individual Notification Type Flags

Each notification type has its own flag, allowing you to disable specific types independently.

### Notification Types

1. **Energy Tips** - Tips about energy consumption
   - Examples: "Close unused tabs", "High power usage", "Pause media"

2. **Carbon Tips** - Tips about carbon footprint
   - Examples: "Reduce screen brightness", "Enable dark mode", "Clean your inbox"

3. **AI Reminders** - Reminders to use the Prompt Optimizer
   - Examples: "Use Prompt Optimizer", reminders on AI sites like ChatGPT, Claude

---

## Flag Locations

You need to set flags in **both files**:

### 1. Content Script Notification Manager
**File**: `js/content/content-script-notifications.js`  
**Lines**: 11-13

```javascript
const ENABLE_ENERGY_TIPS = false;       // Energy consumption tips - DISABLED BY DEFAULT
const ENABLE_CARBON_TIPS = false;       // Carbon footprint tips - DISABLED BY DEFAULT
const ENABLE_AI_REMINDERS = false;      // AI prompt reminders - DISABLED BY DEFAULT
```

### 2. Service Worker (Notification Triggers)
**File**: `js/core/service-worker.js`  
**Lines**: 11-13

```javascript
const ENABLE_ENERGY_TIPS = false;       // Energy consumption tips - DISABLED BY DEFAULT
const ENABLE_CARBON_TIPS = false;       // Carbon footprint tips - DISABLED BY DEFAULT
const ENABLE_AI_REMINDERS = false;      // AI prompt reminders - DISABLED BY DEFAULT
```

---

## Default State

**All notifications are DISABLED by default.** The flags are set to `false` in both files.

## How to Enable Notifications

### Enable All Notifications

Set all three flags to `true` in both files:

```javascript
// In js/content/content-script-notifications.js
// In js/core/service-worker.js
const ENABLE_ENERGY_TIPS = false;
const ENABLE_CARBON_TIPS = false;
const ENABLE_AI_REMINDERS = false;
```

### Enable Specific Types

#### Enable Only Energy Tips
```javascript
const ENABLE_ENERGY_TIPS = true;   // Enable energy tips
const ENABLE_CARBON_TIPS = false;  // Keep carbon tips disabled
const ENABLE_AI_REMINDERS = false; // Keep AI reminders disabled
```

#### Enable Only Carbon Tips
```javascript
const ENABLE_ENERGY_TIPS = false;  // Keep energy tips disabled
const ENABLE_CARBON_TIPS = true;   // Enable carbon tips
const ENABLE_AI_REMINDERS = false; // Keep AI reminders disabled
```

#### Enable Only AI Reminders
```javascript
const ENABLE_ENERGY_TIPS = false;  // Keep energy tips disabled
const ENABLE_CARBON_TIPS = false;  // Keep carbon tips disabled
const ENABLE_AI_REMINDERS = true;  // Enable AI reminders
```

### Step-by-Step Instructions to Enable

1. **Open** `js/content/content-script-notifications.js`
2. **Find** lines 11-13 with the flags (currently all set to `false`)
3. **Change** the flag(s) you want to enable to `true`
4. **Open** `js/core/service-worker.js`
5. **Find** lines 11-13 with the flags (currently all set to `false`)
6. **Change** the same flag(s) to `true` (must match!)
7. **Reload** extension in Chrome (`chrome://extensions/` → Reload button)

---

## What Gets Disabled

When a flag is set to `false`:

✅ **Disabled:**
- That specific notification type (energy tips, carbon tips, or AI reminders)
- All in-page notifications of that type

❌ **NOT Disabled:**
- Main extension popup (clicking extension icon) - **Always works!**
- Options page
- Dashboard page
- Other notification types (if their flags are still `true`)

---

## Flag Check Points

### Content Script (`content-script-notifications.js`)

1. **`showTip()` method** (line ~800):
   - Checks `ENABLE_ENERGY_TIPS` for energy-related tips
   - Checks `ENABLE_CARBON_TIPS` for carbon tips
   - Checks `ENABLE_AI_REMINDERS` for AI reminders

2. **`showAIPromptReminder()` method** (line ~909):
   - Checks `ENABLE_AI_REMINDERS` flag

3. **Message handler** (line ~268):
   - Checks `ENABLE_AI_REMINDERS` before showing AI reminders

### Service Worker (`service-worker.js`)

1. **`maybeShowEnergyTip()` method** (line ~1173):
   - Checks `ENABLE_ENERGY_TIPS` flag

2. **`maybeShowCarbonTip()` method** (line ~2427):
   - Checks `ENABLE_CARBON_TIPS` flag

3. **`checkAndShowAIReminder()` method** (line ~2534):
   - Checks `ENABLE_AI_REMINDERS` flag

---

## Notification Type Detection

The `showTip()` method detects notification types by checking the `tipData.type` field:

- **Energy Tips**: Types include:
  - `'high_power_video'`
  - `'high_power_gaming'`
  - `'high_power_general'`
  - `'moderate_power'`
  - Or contains `'energy'` or `'power'`

- **Carbon Tips**: Type is:
  - `'carbon_tip'` or contains `'carbon'`

- **AI Reminders**: Type is:
  - `'ai_prompt_reminder'` or contains `'ai_reminder'` or `'prompt'`

---

## Examples

### Example 1: Enable Only Energy Tips
```javascript
// In both files:
const ENABLE_ENERGY_TIPS = true;   // Enable energy tips
const ENABLE_CARBON_TIPS = false;  // Keep carbon tips disabled (default)
const ENABLE_AI_REMINDERS = false; // Keep AI reminders disabled (default)
```

**Result**: Only energy consumption tips are enabled. Carbon tips and AI reminders remain disabled.

### Example 2: Enable Only AI Reminders
```javascript
// In both files:
const ENABLE_ENERGY_TIPS = false;  // Keep energy tips disabled (default)
const ENABLE_CARBON_TIPS = false;  // Keep carbon tips disabled (default)
const ENABLE_AI_REMINDERS = true;  // Enable AI reminders
```

**Result**: Only AI reminders are enabled. Energy and carbon tips remain disabled.

### Example 3: Enable All Notifications
```javascript
// In both files:
const ENABLE_ENERGY_TIPS = true;   // Enable energy tips
const ENABLE_CARBON_TIPS = true;   // Enable carbon tips
const ENABLE_AI_REMINDERS = true;  // Enable AI reminders
```

**Result**: All notification types are enabled.

---

## Testing

After changing flags:

1. **Reload extension** in Chrome (`chrome://extensions/` → Reload)
2. **Visit websites** that trigger each notification type
3. **Wait** for notification interval (default 15 minutes)
4. **Verify** only enabled notification types appear
5. **Verify** disabled types don't appear
6. **Verify** main extension popup still works (click icon)

---

## User Settings (Alternative Method)

Users can also disable notifications through the Options page:
- Go to **Options → Settings → Notifications**
- Uncheck **"Enable Popups"** (disables all notifications)
- Adjust **"Notification Interval"** (how often notifications appear)

**Note**: Developer flags take precedence. If a flag is `false`, that notification type is disabled regardless of user settings.

---

## Important Notes

- ⚠️ **Flags must be set in BOTH files** (content script and service worker)
- ⚠️ **Flags are checked FIRST** before any other settings
- ⚠️ **If flag is `false`**, that notification type is disabled regardless of user settings
- ✅ These are **developer flags** for quick testing/development
- ✅ Users can still control notifications via Options page settings (if flags are `true`)

---

## Quick Reference Table

| Flag | Notification Type | Default | Examples |
|------|------------------|---------|----------|
| `ENABLE_ENERGY_TIPS` | Energy consumption tips | `false` | "Close unused tabs", "High power usage" |
| `ENABLE_CARBON_TIPS` | Carbon footprint tips | `false` | "Reduce screen brightness", "Enable dark mode" |
| `ENABLE_AI_REMINDERS` | AI prompt reminders | `false` | "Use Prompt Optimizer", reminders on AI sites |

---

## Related Documentation

- **`POPUP_TYPES.md`** - Explains the difference between main popup and in-page notifications
- **`ARCHITECTURE.md`** - Overall extension architecture

