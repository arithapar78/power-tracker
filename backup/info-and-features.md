# Power Tracker — MVP Bug Fix & Feature Completion Specification  
**Version:** v3 (Fully Consolidated)  
**Last Updated:** November 2025

---

## 🔧 Purpose

This document is the **single source of truth** for all required fixes, features, and UX behaviors needed to turn the current version of **Power Tracker** into a stable, polished **Minimum Viable Product (MVP)**.

It consolidates:
- User-reported bugs  
- UI issues from screenshots  
- Feature requests from prior discussions  
- Known technical + UX gaps

Developers should treat every item marked **MVP Requirement** as *in-scope* for the MVP release.

---

## 🐞 Bugs & Known Issues (Must Fix for MVP)

### 1. Popup Hover Behavior

- **Problem:** Popups vanish immediately when the cursor moves off.
- **Expected Behavior:**  
  - Popup remains visible for **1 second after hover ends**.
  - While hovered, the popup should **not** start disappearing.
- **Why:** Prevents accidental dismissal and makes tips readable.

---

### 2. Popup Duration Timing

- **Problem:** All popups use a single static timeout.
- **Expected Behavior:**  
  Popup duration is automatically calculated from text length:
  ```text
  duration = (word_count * 0.5s) + 1.5s
  ```
- **Goal:** Longer messages stay longer; short ones dismiss quickly.
- **Where:** Popup/notification manager (likely in `popup.js` or shared notification module).
- **MVP Requirement:** All informational popups follow this timing rule.

---

### 3. “Do Not Show Again” Behavior (Global)

- **Problem:** “Do Not Show Again” only affects one specific popup type and behaves inconsistently.
- **Expected Behavior:**
  - When user checks **“Do Not Show Again”**:
    - **All** Power Tracker popups of that type group are suppressed.
  - A **global setting** in Options (e.g., “Enable popups”) can re-enable them.
- **Scope:**
  - Prompt generator popup
  - Energy tips
  - General usage hints
- **Persistence:**
  - Stored in `chrome.storage.local`.
  - Survives browser restart.
- **MVP Requirement:** Global suppression and re-enable works reliably.

---

### 4. Tooltip / Popup Overlap & Stacking

- **Problem:** Multiple popups/tooltips appear and overlap when multiple events trigger in quick succession.
- **Expected Behavior:**
  - At most **one** popup notification visible at a time.
  - New popups either:
    - Queue and show after previous one, **or**
    - Replace the current popup gracefully.
- **MVP Requirement:** No overlapping, cluttered popups.

---

### 5. Popup Position Shifts with Zoom / Resizing

- **Problem:** Popup location jumps around with zoom level or window size changes.
- **Expected Behavior:**
  - Fixed anchoring, e.g., **bottom-right** of the popup with consistent padding.
  - Position should remain stable during layout changes.
- **MVP Requirement:** Visual stability of popup position.

---

### 6. Service Worker Restart Causes UI State Loss

- **Problem:** After Chrome suspends or restarts the service worker, previously shown data disappears from the popup.
- **Expected Behavior:**
  - Last known state (current wattage, basic stats) is cached in storage.
  - On popup open, UI restores from cache and then refreshes data.
- **Implementation Hint:**
  - Use `chrome.storage.session` or `chrome.storage.local` for last-known snapshot.
- **MVP Requirement:** No empty/blank state after service worker restart.

---

### 7. “View History” Button Does Nothing

- **Source:** Screenshot (“Energy use case” panel with **View History** tile).
- **Problem:** Clicking **View History** has no visible effect.
- **Expected Behavior:**
  - On click, one of:
    - Open analytics/history tab (extension options page), or
    - Switch the popup to a **History / Analytics** view.
- **Technical Suggestion:**
  - `chrome.runtime.openOptionsPage()` or `chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })`.
- **MVP Requirement:** Button must perform a clear, useful action with no console errors.

---

### 8. “Share Tips” Button Does Nothing

- **Source:** Same screenshot panel.
- **Problem:** **Share tips** button is a dead UI element.
- **Expected Behavior (Minimum for MVP):**
  - On click, do one of:
    - Open a small modal with pre-written share/copy text (e.g., “Tell a friend about Power Tracker”), or
    - Open a webpage (LearnTAV share page) in a new tab with share copy.
- **MVP Requirement:** Button must trigger a visible action and not be inert.

---

### 9. “Manage Extensions” Button Does Nothing

- **Source:** Same screenshot panel.
- **Problem:** **Manage Extensions** button does not navigate anywhere.
- **Expected Behavior:**
  - On click, open either:
    - Chrome’s extensions page: `chrome://extensions/`, or
    - A dedicated Power Tracker settings/options page.
- **Technical Suggestion:**
  - `chrome.tabs.create({ url: 'chrome://extensions/' })`
- **MVP Requirement:** Functional navigation with no console errors.

---

### 10. “Top Energy Consumers” Tab/Card Blinks/Flickers

- **Problem:** The **Top Energy Consumers** view in the popup appears to blink or flicker, likely due to frequent re-renders.
- **Likely Causes:**
  - Data polling or message listener causes repeated full re-renders.
  - State changes trigger the entire card to unmount/remount.
- **Expected Behavior:**
  - Data updates smoothly *inside* the card.
  - No visual jump, flicker, or repeated animations.
- **MVP Requirement:** Visually stable updates, no “blinking”.

---

### 11. AI Model Detection Stuck on “Detecting…”

- **Problem:** AI model status is stuck on **“Detecting…”** and never resolves to GPT-4, Claude, Gemini, etc.
- **Expected Behavior:**
  - Detection completes within **1–3 seconds** on supported AI sites.
  - Shows actual detected model name and/or fallback message (“Model not detected”).
- **Potential Issues:**
  - Content script not sending detection message.
  - Service worker not processing or updating UI with result.
  - `enhanced-ai-energy-database.js` not loaded or failing.
- **MVP Requirement:** AI model detection reliably resolves or fails gracefully.

---

### 12. AI Tab & Metrics Not Showing Separately

- **Problem:** On AI-heavy usage:
  - Either the AI section/tab never appears, or
  - It appears but shows no metrics (empty UI).
- **Expected Behavior:**
  - When on AI platforms (ChatGPT, Claude, Gemini, etc.), popup shows a **dedicated AI section**, including:
    - Detected model name (e.g., GPT-4, Claude Sonnet 4).
    - Estimated backend energy in watts/kWh.
    - Token usage stats (approx).
    - Confidence score.
    - “Optimize Prompt” or similar action.
- **Possible Root Causes:**
  - Host permissions not granted for certain AI sites.
  - AI detection message not wired through runtime messaging.
  - UI not subscribed to the relevant state updates.
- **MVP Requirement:** Separate AI metrics section appears consistently when AI usage is detected.

---

## 📷 Screenshot-Based Issues (UI From Uploaded PDF)

These items are derived from the uploaded **PowerTracker (1).pdf** (“Energy use case” view).

When you add image assets later, you can embed them here, e.g.:

```
![Energy use case panel](docs/images/energy-use-case.png)
```

### Energy Use Case Panel (View History / Share Tips / Manage Extensions)

- **Elements Displayed:**
  - `View History`
  - `Share tips`
  - `Manage Extensions`

- **Issues:**
  1. **View History** – no navigation, no UI change, no visible effect.  
  2. **Share tips** – no visible action, dead button.  
  3. **Manage Extensions** – no navigation, dead button.

- **MVP Requirements:**
  - Each of these controls must:
    - Trigger a clearly visible action.
    - Show no errors in popup/background console.
    - Work consistently across reloads.

---

## ✨ Feature Requests & Enhancements (MVP Scope)

### 1. Popup Hover Freeze

- While user hovers over a popup:
  - Dismiss timer pauses.
- When user moves cursor out:
  - Timer resumes and dismisses **after ~1 second**.
- Applies to:
  - Energy tips
  - AI prompt tips
  - General usage popups

---

### 2. Global Popup Intensity Setting

Add a setting in Options:

- **Light** — Only critical alerts (e.g., extreme energy usage).  
- **Medium** — Default: occasional tips + alerts.  
- **Full** — All available popups, tips, education.

Stored as:

```
popupIntensity: "light" | "medium" | "full"
```

---

### 3. Master “Enable All Popups” Control

- A single master control in Settings → Notifications:
  - Re-enables all previously suppressed popups.
  - Clears all “Do Not Show Again” flags.
- Useful for testers and power users.

---

### 4. AI Prompt Generator Mode Persistence

- AI optimizer modes:  
  **Conservative**, **Balanced**, **Aggressive**
- Required behavior:
  - Remember last-selected mode.
  - Restore it on next open.

---

### 5. Enhanced Analytics Export (JSON + CSV)

Export:

- Frontend energy history  
- AI backend energy history  
- Token/optimization stats  

Required fields:

- Timestamp  
- URL/domain  
- Watts/kWh  
- Confidence score  
- AI model (if applicable)

Formats:

- **JSON**  
- **CSV**

---

## ⚙️ UX & Settings Improvements Summary

| Area                    | Improvement                                        | MVP Target |
|-------------------------|----------------------------------------------------|-----------|
| Popup Hover Persistence | Delay dismissal after hover ends                   | ✅         |
| Dynamic Duration        | Duration based on word count                       | ✅         |
| Global Popup Toggle     | Master on/off for all popups                       | ✅         |
| Popup Intensity Levels  | Light / Medium / Full                              | ✅         |
| AI Mode Memory          | Persist AI optimization mode                       | ✅         |
| Data Export             | JSON + CSV for history + AI metrics                | ✅         |
| Themes                  | Light/Dark/Glass                                   | ❌ Post-MVP |
| Do Not Disturb          | Temporary mute for all notifications               | ❌ Post-MVP |
| Tooltips                | Hover text explaining Watts / CO₂ / Tokens         | ❌ Post-MVP |

---

## 🧠 Agent & Intelligence (Post-MVP Ideas)

1. **Adaptive Popup Timing** — Learn user reading speed and adjust durations.
2. **Context-Aware Popups** — Delay popups while user is typing or watching video.
3. **Behavior Learning** — Reduce suggestions the user repeatedly ignores.

---

## 🔩 Developer Notes

### Key Files

- `public/popup.js`  
- `public/popup.css`  
- `public/content-script.js`  
- `public/service-worker.js`  
- `public/energy-agent-core.js`

### Testing Requirements

- Hover persistence works.  
- Duration timing accurate within ±100ms.  
- Popups never overlap.  
- No blinking or flicker in Top Energy Consumers.  
- View History, Share Tips, Manage Extensions all work.  
- AI detection resolves (no eternal “Detecting…”).  
- AI section appears with metrics on AI sites.  
- Settings survive reloads.  
- No blank popup on service worker restart.  

### Performance Targets

- CPU < **1%**  
- Memory < **10MB**  
- Popup load < **200ms**  

### Accessibility

- ARIA roles applied  
- Contrast ≥ 4.5:1  
- ESC closes popups  
- Tab navigation supported  

---

## ✅ MVP Acceptance Checklist

### Popups & Notifications

- [ ] Hover persistence works  
- [ ] Text-length-based duration works  
- [ ] No overlap or stacking  
- [ ] Global popup suppression works  
- [ ] “Enable All Popups” resets all  

### Screenshot Buttons

- [ ] View History works  
- [ ] Share Tips works  
- [ ] Manage Extensions works  

### AI Functionality

- [ ] No permanent “Detecting…”  
- [ ] AI tab appears  
- [ ] AI metrics load correctly  
- [ ] Fallback behavior works  

### Data & State

- [ ] JSON export correct  
- [ ] CSV export correct  
- [ ] No data loss after SW restart  

### Stability

- [ ] No blinking/flickering tabs  
- [ ] No console errors  
- [ ] Meets performance targets  

---

## 🚀 Post-MVP Roadmap

- Daily energy summary  
- Chrome toolbar watt badge  
- User achievement system  
- Battery integration  
- Firefox/Safari ports  
- Community energy leaderboard  

---

**End of Document**  
**Power Tracker MVP Specification — v3**
