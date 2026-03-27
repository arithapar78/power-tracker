# Power Tracker — Chrome Extension

**Monitor your browser's real-time energy consumption and reduce your digital carbon footprint**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Version](https://img.shields.io/badge/version-8.2.1-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![LearnTAV Product](https://img.shields.io/badge/LearnTAV-Flagship%20Product-brightgreen.svg)](https://learntav.com/ai-tools/power-tracker/)

Power Tracker is a Chrome extension developed by LearnTAV that shows you real-time power consumption tab by tab, estimates the backend energy cost of AI platforms, and helps you reduce your digital carbon footprint through prompt optimization.

---

## Features

### Real-Time Energy Monitoring
- **Live watts reading** (1–65W) per tab, updated every 1–30 seconds (configurable)
- **Multi-factor tracking**: DOM activity, JavaScript execution, network requests, media playback, canvas/WebGL rendering, and memory usage
- **Environmental impact**: CO2 emissions (kg/hr), water usage (gal/hr), and LED bulb equivalent — displayed live in the popup

### AI Platform Energy Tracking
- **Automatic detection** of AI sites: ChatGPT, Claude, Gemini, Perplexity, Grok, DeepSeek
- **Backend energy estimate**: adds the server-side cost of running the AI model on top of browser watts, giving a true total power number
- **Per-session energy log**: view AI energy history by model, session time, and URL in the settings page

### AI Prompt Optimizer
- **Eco Boost button** in the popup opens a full-page optimizer tab
- **One-click optimization**: strips filler words, preambles, redundant phrases, and unnecessary politeness
- **Token counter**: live character/token count as you type, before and after optimization
- **Energy savings display**: tokens saved and estimated mWh saved per optimization
- **"What was removed" breakdown**: collapsible list of removed text grouped by category

### History & Settings
- **Energy history chart**: power consumption over time
- **Tokens saved chart**: prompt optimizer savings over time
- **Data export**: JSON export of your energy history
- **Configurable**: sampling interval, data retention (1–90 days), power alert threshold

---

## Installation

### Load from Source (Developer Mode)
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `public/` directory
5. Pin the Power Tracker icon to your toolbar

No build step required. No Node.js. No npm. Just load the `public/` folder directly.

---

## Usage

1. **Click the extension icon** to see your current tab's power consumption
2. **Browse normally** — Power Tracker monitors all tabs automatically
3. **On AI sites** (ChatGPT, Claude, Gemini, etc.), the popup shows browser watts + estimated backend AI watts as a combined total
4. **Click "Eco Boost"** to open the Prompt Optimizer — paste a prompt, click Optimize, copy the result
5. **Click "View History"** to see charts, AI session logs, and your settings

---

## Project Structure

```
public/
├── manifest.json                     # Extension config (MV3, v8.2.1)
├── popup.html / popup.js / popup.css # Main popup UI
├── options.html / options.js / options.css  # Settings and history page
├── service-worker.js                 # Background service worker
├── content-script.js                 # Runs on all pages, collects energy signals
├── content-script-notifications.js  # In-page energy tip notifications
├── power-calculator.js               # Frontend watts estimation
├── backend-power-calculator.js       # AI backend energy estimation
├── ai-energy-database.js             # AI model energy profiles
├── prompt-helper-core.js             # Prompt optimizer logic (injected on AI sites)
├── prompt-widget-content.js/css      # In-page optimizer widget
├── data-migration.js                 # Storage migration utility
├── icon-16.png / icon-48.png / icon-128.png
```

---

## Supported AI Platforms

| Site | Detected Model |
|------|---------------|
| chat.openai.com / chatgpt.com | GPT-4o |
| claude.ai | Claude Sonnet 4 |
| gemini.google.com | Gemini Pro |
| perplexity.ai | Perplexity |
| grok.com / x.com/i/grok | Grok-2 |
| deepseek.com / chat.deepseek.com | DeepSeek R1 |

---

## Power Calculation

### Browser Watts (all sites)
Estimated from signals collected by the content script:

| Component | Range |
|-----------|-------|
| Base idle | 10W |
| CPU (JS execution) | 2–25W |
| GPU (canvas/WebGL) | 1–20W |
| Network (requests) | 1–7W |
| Memory (JS heap) | 0.5–4W |
| DOM complexity | 0.5–1.5W |
| Video HD/4K | 0–25W |
| Audio | 0–2W |

**Total output range:** 1–65W

### AI Backend Watts (AI sites only)
Added on top of browser watts using session-based estimation:
- Detects new AI responses via `MutationObserver`
- Multiplies estimated queries/hour by Wh-per-query for the detected model
- Displayed as a running session total in the popup

---

## Environmental Impact Calculations

```
CO2 (kg/hr)    = watts / 1000 × 0.4    (US grid average)
Water (gal/hr) = watts / 1000 × 0.48   (data center cooling)
LED bulbs      = energy_kWh × 100       (10W LED reference)
```

---

## Privacy

All energy data and settings are stored locally on your device via the Chrome Storage API. No personal data is sent to external servers.

---

## Backend / Database

The final product uses **Google Firebase (Firestore)** as its backend database for cloud sync and persistent storage across devices.

> **Status: In progress.** The Firebase integration is not yet working. All data currently falls back to Chrome's local storage (`chrome.storage.local`). Completing the Firebase integration is a planned milestone before the production release.

Relevant files: `public/firebase-config.js`, `public/firebase-manager.js`, `public/firebase-helpers.js`

---

## Technical Details

- **Platform**: Google Chrome (desktop), Manifest V3
- **Language**: Vanilla JavaScript — no frameworks, no build step
- **Local storage**: Chrome Storage API (local + sync)
- **Backend database**: Google Firebase / Firestore (integrated but currently non-functional)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Power Tracker by LearnTAV** — Making digital energy consumption visible and actionable.

[learntav.com](https://learntav.com) · *"Learning Takes a Village"*
