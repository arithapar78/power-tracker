# Testing Checklist

## ✅ Pre-Testing Verification

- [x] All files moved to correct directories
- [x] Manifest.json paths updated
- [x] HTML script paths updated
- [x] Service worker importScripts paths updated
- [x] Icon paths updated
- [x] Content script paths updated

## Manual Testing Steps

### 1. Load Extension
- [ ] Open Chrome and go to `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select the `public` folder
- [ ] Verify extension loads without errors

### 2. Test Service Worker
- [ ] Check background page console for errors
- [ ] Verify service worker is running (should see "Service worker alive" message)
- [ ] Check that all importScripts load successfully

### 3. Test Popup
- [ ] Click extension icon in toolbar
- [ ] Verify popup opens
- [ ] Check browser console for script loading errors
- [ ] Verify all UI elements render correctly
- [ ] Test power display shows data
- [ ] Test theme toggle
- [ ] Test navigation buttons

### 4. Test Content Script
- [ ] Open any website (e.g., google.com)
- [ ] Check browser console for content script errors
- [ ] Verify content script injects properly
- [ ] Check that energy tracking works

### 5. Test Options Page
- [ ] Click "Settings" button in popup or go to extension options
- [ ] Verify options page loads
- [ ] Test all tabs (Settings, Backend Energy, Prompt Generator, History, Insights, About)
- [ ] Verify settings save correctly
- [ ] Test data export/import

### 6. Test Dashboard
- [ ] Navigate to `html/dashboard.html` in extension
- [ ] Verify dashboard loads
- [ ] Check Firebase connection (if configured)

## Common Issues to Check

1. **404 Errors**: Check browser console for missing file errors
2. **Script Loading**: Verify all scripts load in correct order
3. **Path Issues**: Ensure all relative paths use `../` correctly
4. **Icon Display**: Verify icons show in popup and options
5. **Service Worker**: Check background page for importScripts errors

## Files to Verify Exist

- ✅ `js/core/service-worker.js`
- ✅ `js/core/power-calculator.js`
- ✅ `js/content/content-script.js`
- ✅ `js/content/content-script-notifications.js`
- ✅ `js/popup/popup.js`
- ✅ `js/options/options.js`
- ✅ `js/config/firebase-config.js`
- ✅ `html/popup.html`
- ✅ `html/options.html`
- ✅ `html/dashboard.html`
- ✅ `icons/icon-16.png`
- ✅ `icons/icon-48.png`
- ✅ `icons/icon-128.png`

