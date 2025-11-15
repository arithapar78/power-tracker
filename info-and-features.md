# Power Tracker MVP — Consolidated Bug & Feature Implementation Specification
_Last updated: November 2025_

---

## 🔧 PURPOSE
This document lists every **bug**, **feature request**, and **enhancement** discussed for Power Tracker, compiled into a unified specification for developers.  
It defines the target scope for the **MVP release**, ensuring feature completeness, usability, and reliability.

---

## 🐞 BUGS & KNOWN ISSUES

### 1. Popup Hover Behavior
- **Problem:** Popups vanish immediately when the cursor moves off.  
- **Expected:** Popups remain visible for **1 second after hover ends**.  
- **Why:** Prevents accidental dismissal when users read or move the cursor slightly.

### 2. Popup Duration Timing
- **Problem:** Static duration for all popups.  
- **Expected Formula:**  
  `duration = (word_count * 0.5s) + 1.5s`  
- **Goal:** Popups scale automatically with text length for readability.

### 3. "Do Not Show Again" Logic
- **Problem:** Works inconsistently and affects only one popup type.  
- **Expected Behavior:**  
  - Suppresses **all popups globally** when toggled off.  
  - Resumes all popups when “Enable Popups” is reactivated.  
- **Persistence:** Stored in `chrome.storage.local` and survives browser restarts.

### 4. Tooltip Overlap / Stacking
- **Problem:** Multiple popups can overlap when triggered quickly.  
- **Expected:** Only one popup visible at a time (queue or stack limit = 1).

### 5. Popup Position Shift
- **Problem:** Popup position changes with zoom/resolution.  
- **Expected:** Fixed placement, e.g., bottom-right corner with padding.

### 6. Chrome Service Worker Reset
- **Problem:** Temporary UI data loss after Chrome service worker restarts.  
- **Expected:** Persist current state in `chrome.storage.session` and restore on reload.

---

## ✨ FEATURE REQUESTS

### 1. Popup Hover Freeze
- When hovered, the countdown timer pauses.  
- Dismissal timer resumes only after hover ends + 1s.

### 2. Global Popup Intensity Levels
- Setting in Options:
  - Light — critical messages only  
  - Medium — default balance  
  - Full — all messages, tips, and insights  

### 3. Custom Popup Themes
- Add theme selector in Settings: System / Light / Dark / Glass.

### 4. “Do Not Disturb” Mode
- Temporary global mute for all notifications (duration: 30 min, 1 hr, custom).

### 5. AI Prompt Generator Persistence
- Last optimization mode (Conservative, Balanced, Aggressive) saved and auto-restored.

### 6. Popup Timing Preview (Dev Mode)
- Developer preview of popup display time based on text length (for QA).

### 7. Enhanced Analytics Export
- Export energy and AI data (JSON/CSV).  
- Include timestamps, confidence scores, and model identifiers.

### 8. Data Tooltips on Hover
- Hovering over numbers (Watts, CO₂, Tokens) shows definitions or contextual explanations.

### 9. Global Enable/Disable All Popups
- One master switch in Settings to restore or mute every popup type.

### 10. AI Integration Dashboard (Placeholder for MVP)
- Display per-model breakdowns (GPT-4, Claude, Gemini).  
- Compare efficiency metrics and energy impact visually.

### 11. Floating Mini Widget
- Optional compact wattage indicator, always visible in browser toolbar.

### 12. Unified Hover Persistence Across Tooltips
- Hover = pause fade-out timer for every tooltip systemwide.

---

## ⚙️ UX & SETTINGS IMPROVEMENTS

| Area | Improvement | Target |
|------|--------------|--------|
| Popup Hover Persistence | Delayed dismissal after hover ends | MVP |
| Dynamic Duration | Scale visibility based on word count | MVP |
| Global Popup Control | Enable/disable all | MVP |
| Theme Selector | Choose appearance style | Post-MVP |
| Do Not Disturb | Temporary mute feature | Post-MVP |
| Data Export | JSON and CSV support | MVP |
| AI Mode Memory | Save optimization level | MVP |
| Tooltips for Stats | Explain energy terms | Post-MVP |

---

## 🧠 AGENT & INTELLIGENCE (Post-MVP)

1. **Adaptive Timing:** Learn user reading speed for auto duration tuning.  
2. **Context-Aware Popups:** Detect activity (typing, video, etc.) and delay popups.  
3. **Behavior Learning:** Record which actions users accept/reject to refine frequency.

---

## 🔩 DEVELOPMENT NOTES

**Primary Affected Files:**
- `public/popup.js`
- `public/service-worker.js`
- `public/content-script.js`
- `public/popup.css`
- `public/energy-agent-core.js`

**Testing Requirements:**
- Verify hover persistence and delay.  
- Confirm duration formula correctness (±100ms tolerance).  
- Validate state persistence through service-worker restart.  
- Confirm no overlapping popups.

**Performance Limits:**
- CPU overhead <1%  
- Memory footprint <10MB  
- Popup load <200ms

**Accessibility:**
- Maintain ARIA roles.  
- 4.5:1 contrast minimum.  
- ESC key dismisses all popups.

---

## ✅ MVP ACCEPTANCE CRITERIA

- Hover persistence across all popups.  
- Duration dynamically tied to text length.  
- “Do Not Show Again” applies globally.  
- “Enable Popups” restores everything.  
- Popups don’t overlap or flicker.  
- All settings persist through reloads.  
- JSON/CSV export works correctly.  
- No data loss after Chrome restarts.

---

## 🚀 FUTURE IDEAS (Post-MVP)

- Daily summary: “Your browsing used 0.25 kWh — down 22% from yesterday.”  
- Chrome toolbar watt badge.  
- Gamified achievements (“Energy Saver Streaks”).  
- Battery integration for laptops.  
- Firefox/Safari expansion.  
- Community leaderboard or impact feed.

---

**End of Document**
