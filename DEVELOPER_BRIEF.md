# Power Tracker — Developer Brief

**Purpose:** This document describes what needs to be built so a developer can recreate Power Tracker from scratch.

---

## Platform & Framework

| Item | Details |
|------|---------|
| **Platform** | Google Chrome Extension (desktop) |
| **Manifest Version** | Manifest V3 (MV3) |
| **Language** | Vanilla JavaScript — no React, Vue, Angular, or any JS framework |
| **HTML/CSS** | Vanilla HTML5 + CSS3 — no Tailwind, Bootstrap, or CSS frameworks |
| **Package Manager** | None — no npm, no Node.js, no build step required |
| **Storage** | Chrome Storage API (local + sync) |

The extension runs entirely in the browser. There is no server, no backend, and no build process. Load the `/public` directory directly into Chrome via Developer Mode.

---

## What the App Does

Power Tracker is a Chrome extension that:

1. **Monitors real-time browser power consumption** (estimated 1–65 watts) tab by tab, using DOM activity, CPU, GPU, network, media, and other browser signals
2. **On AI sites**, adds estimated AI backend energy (the server-side cost of running the AI model) on top of the frontend watts, giving a true total power number. Add this number from the ai-energy-database.js
3. **Displays environmental impact** (CO2, water usage, LED bulb equivalent) based on energy consumed
4. **Shows a history** of energy usage over time as a graph
5. **Shows a history** of tokens saved over time as a graph from the prompt optimizer

---

## Required Files

```
/public/
├── manifest.json                  ← Extension config
├── popup.html / popup.js / popup.css     ← Main popup UI
├── options.html / options.js / options.css  ← Settings/history page
├── service-worker.js              ← Background worker
├── content-script.js              ← Runs on every page, collects energy data
├── power-calculator.js            ← Frontend watts estimation
├── backend-power-calculator.js    ← AI backend energy estimation
├── ai-energy-database.js          ← AI model energy profiles (one file, not multiple)
├── prompt-optimizer.html / prompt-optimizer.js / prompt-optimizer.css  ← Standalone optimizer page
├── filler-words-database.js       ← Complete list of all words, phrases, and patterns the optimizer removes (see Prompt Optimizer section for full contents). Exported as a JS object with named categories: PREAMBLES, FILLER_WORDS, VERBOSE_PHRASES (with replacements that use LESS tokens than the original word), POLITENESS, META_SETTERS, and PROTECTED_PATTERNS (words that must never be removed). prompt-optimizer.js imports and uses this file exclusively — no removal logic is hardcoded in the optimizer itself.
├── data-migration.js              ← Storage migration utility
├── icon-16.png / icon-48.png / icon-128.png
```

---

## Screens & Pages

### 1. Popup (Main Interface)

The view when clicking the extension icon.

- Header: logo, app name, tracking status indicator (green dot = active) THEME: Light Theme, Non-Transparent background
- **Power Display Card**: Current watts reading
  - On regular sites: shows browser-only watts
  - On AI sites: shows browser watts + backend AI watts = total watts
  - Label should make clear what is included (e.g., "Total (Browser + AI Backend)" vs "Browser Only")
- **Environmental Impact Grid**: 3 metrics displayed side by side:
  - Equivalent LED bulbs powered
  - Water usage (gal/hr)
  - CO2 emissions (per hour)
- **Current Tab Info card**: Tab title, URL, DOM node count, active time
  - On AI sites: also show detected AI model name and backend energy estimate (Wh)
- **Energy Recommendations**: List of high-energy open tabs with a suggestion to close them; bulk-close button
- **Today's Summary**: Tabs tracked today, average power, high-power alert count, total active time
- **Action Buttons**: "View History" (opens options page), "Settings"
- **"Eco Boost" Button**: Prominent button in the popup that opens the Prompt Optimizer as a full-page tab (not a popup — it needs space)

---

### 2. Prompt Optimizer Page (`prompt-optimizer.html`)

A standalone full-page tab opened when the user clicks "Optimize My Prompt" from the popup.

**Layout:**

- Page title: "AI Prompt Optimizer"
- Subtitle: "Reduce tokens, reduce energy"
- **Input area**: Large textarea labeled "Paste your prompt here" with a character/token counter below it (live, updates as user types)
- **"Optimize" button**: Single large button — no mode selector, no level selector. One click, maximum reduction.
- **Results area** (shown after optimization):
  - Optimized prompt in a read-only textarea
  - "Copy" button
  - Stats row: Original tokens | Optimized tokens | Tokens saved | Energy saved (mWh)
  - "What was removed" collapsible section: a list of removed words/phrases grouped by category (filler words, redundant phrases, preambles, etc.)
- **Session stats** (bottom of page): Total prompts optimized this session, total tokens saved, total energy saved (mWh)

---

### 3. Options / Settings Page

Accessed from the popup. Tabs:

**Tab 1 – Settings**
- Tracking on/off toggle (When off, the main popup should be set to a default "Tracking is Disabled, To Re-enable, visit Settings" )
- Sampling interval selector (1, 5, 10, or 30 seconds)
- Data retention slider (1–90 days)
- Power alert threshold (10–80W)

**Tab 2 – Backend Energy**
- List of logged AI sessions: model name, energy used (Wh), timestamp, URL
- Per-session energy breakdown
- Ability to delete individual records

**Tab 3 – History**
- Power consumption chart over time
- Tabs opened / closed / switched metrics
- Peak power events
- Data export (JSON)

**Tab 4 – About**
- Version number
- Brief feature summary

---

## Power Calculation: Non-AI Sites

On every page, a content script (`content-script.js`) collects signals and passes them to `power-calculator.js` to estimate watts.

### Signals Collected

| Signal | How to Measure |
|--------|---------------|
| DOM node count | `document.querySelectorAll('*').length` |
| DOM tree depth | Walk the tree, find max depth |
| Active video elements | `document.querySelectorAll('video')` — check if playing, check resolution |
| Active audio elements | `document.querySelectorAll('audio')` — check if playing |
| Canvas / WebGL elements | `document.querySelectorAll('canvas')` — check for active context |
| Network requests | Count `XMLHttpRequest` and `fetch` calls per interval via `PerformanceObserver` |
| JavaScript execution time | Measure time for a synthetic microbenchmark each interval |
| Memory footprint | `performance.memory.usedJSHeapSize` (where available) |

### Watts Formula

```
Total Watts = BaseIdle + CPU + GPU + Network + Memory + DOM + Media
```

| Component | Range | Notes |
|-----------|-------|-------|
| Base idle | 10W | Fixed — minimum browser cost |
| CPU | 2–25W | Based on JS execution timing |
| GPU | 1–20W | Based on canvas / WebGL activity |
| Network | 1–7W | Based on request rate and data volume |
| Memory | 0.5–4W | Based on JS heap size |
| DOM complexity | 0.5–1.5W | `(nodeCount / 1000) + (treeDepth / 10)` |
| Video (HD) | 0–20W | Detected via video element + resolution |
| Video (4K) | up to 25W | |
| Audio | 0–2W | |
| Canvas animation | 1–12W | Static canvas = low; active WebGL = high |

**Output range:** 1–65 watts. Updated on each sampling interval (1–30 seconds, user configurable).

---

## Power Calculation: AI Sites

On AI sites, the total displayed watts = **frontend watts** (same calculation as above) **+ backend watts** (AI server-side energy).

### Detecting AI Sites

Detect by matching the active tab's URL:

| URL Pattern | AI Model |
|-------------|----------|
| `chat.openai.com` or `chatgpt.com` | GPT-4o |
| `claude.ai` | Claude Sonnet 4 |
| `gemini.google.com` | Gemini Pro |
| `perplexity.ai` | Perplexity |
| `grok.com` or `x.com/i/grok` | Grok-2 |
| `deepseek.com` or `chat.deepseek.com` | DeepSeek R1 |

Detection is URL-only — no external API calls, no DOM scraping for model names needed for the base version.

### Backend Energy Coefficients

Stored in `ai-energy-database.js`:

| Model | Wh per query |
|-------|-------------|
| GPT-4o | 4.2 Wh |
| Claude Sonnet 4 | 3.5 Wh |
| Gemini Pro | 3.3 Wh |
| GPT-3.5 Turbo | 2.1 Wh |
| Grok-2 | 4.5 Wh |
| DeepSeek R1 | 3.5 Wh |
| Perplexity | 3.0 Wh |

### How to Estimate Backend Watts in Real Time

Since the extension cannot directly intercept AI responses, use a session-based estimate:

1. When an AI site tab becomes active, start a session timer
2. Estimate queries per minute from the page (e.g., detect new assistant message blocks appearing in the DOM via `MutationObserver`, or use a fixed estimate of ~2 queries per 5 minutes as a default)
3. `backendWatts = (queriesPerHour × WhPerQuery)`
4. Display the running session total in Wh on the popup

The popup shows:
- Frontend watts (live, updating every interval)
- Backend watts estimate (updating per session)
- Total = frontend + backend

---

## Environmental Impact Calculations

```
CO2 (kg/hr)       = watts / 1000 × 0.4       (US grid average: 0.4 kg CO2/kWh)
Water (gal/hr)    = watts / 1000 × 0.48      (data center cooling)
LED bulb hours    = energy_kWh × 100         (10W LED reference)
```

These are shown live in the popup's Environmental Impact Grid.

---

## Prompt Optimizer: How It Works

The optimizer runs entirely in the browser — no API calls. The goal is maximum token reduction while keeping the core meaning of the prompt intact. There is **one mode only**: reduce as aggressively as possible.

### Token Counting

Use this approximation throughout:

```
tokens = characterCount / 4
```

(1 token ≈ 4 characters)

Display token counts live as the user types in the input textarea. Show them again in the results after optimization.

---

### Optimization Steps (applied in order)

Run all steps sequentially on the input text. Each step feeds its output into the next.

#### Step 1 — Strip Preambles and Openers

Remove common prompt openers that add no information:

```
"I want you to..."
"Please can you..."
"Could you please..."
"I need you to..."
"Your task is to..."
"I would like you to..."
"Can you help me..."
"I am looking for..."
"I need help with..."
"Help me to..."
"For this task..."
"In this exercise..."
```

Replace with nothing. The instruction that follows is what matters.

#### Step 2 — Remove Filler and Hedge Words

Strip words and short phrases that add length but not meaning. Remove all of the following (case-insensitive, whole-word match):

**Intensifiers / qualifiers:**
very, really, quite, rather, somewhat, fairly, pretty, basically, essentially, generally, typically, usually, often, sometimes, kind of, sort of, a bit, a little, just, simply, merely, only, actually, literally, honestly, truly, certainly, definitely, absolutely, totally, completely, entirely, fully, highly, greatly, extremely, incredibly, remarkably, particularly, especially, specifically, certainly

**Filler transitions:**
additionally, furthermore, moreover, in addition, also, as well, on top of that, besides, likewise, similarly, in the same way, at the same time, meanwhile, in fact, indeed, of course, naturally, obviously, clearly, needless to say, as you know, it goes without saying, it is worth noting, it should be noted, please note that, note that

**Hedges and softeners:**
I think, I believe, I feel, I suppose, I assume, I guess, in my opinion, from my perspective, it seems to me, it appears that, it looks like, arguably, possibly, perhaps, maybe, probably, likely, might be, could be, may be, tends to, appears to

**Redundant endings:**
"if that makes sense", "does that make sense", "if you understand what I mean", "you know what I mean", "that sort of thing", "and so on", "etc.", "and so forth", "or something like that", "or whatever"

#### Step 3 — Collapse Redundant Phrases to Shorter Equivalents

Replace verbose phrases with their concise equivalents:

| Remove | Replace with |
|--------|-------------|
| in order to | to |
| for the purpose of | to |
| with the aim of | to |
| so as to | to |
| due to the fact that | because |
| owing to the fact that | because |
| in the event that | if |
| in the case that | if |
| on the condition that | if |
| at this point in time | now |
| at the present time | now |
| currently at this time | now |
| in the near future | soon |
| in the not too distant future | soon |
| a large number of | many |
| a significant number of | many |
| a great deal of | much |
| a majority of | most |
| the majority of | most |
| in close proximity to | near |
| in the vicinity of | near |
| make a decision | decide |
| make an attempt | try |
| provide assistance to | help |
| take into consideration | consider |
| give consideration to | consider |
| come to the conclusion | conclude |
| reach a conclusion | conclude |
| it is important to note | note: |
| it is important to | [remove entirely] |
| please be aware that | [remove entirely] |
| I wanted to let you know | [remove entirely] |

#### Step 4 — Remove Explicit Politeness

Remove courtesy phrases that are unnecessary in prompts:

```
"please", "thank you", "thanks", "thank you in advance",
"I appreciate your help", "I appreciate it", "much appreciated",
"if possible", "when you get a chance", "at your convenience",
"I hope that's okay", "if you don't mind"
```

Note: Only remove standalone politeness — do not remove "please" if it is structural to the sentence meaning.

#### Step 5 — Strip Unnecessary Context-Setting

Remove sentences that only set up what the user is about to say, rather than saying it:

Patterns to detect and remove:
- Sentences that start with "I am going to ask you about..." (then the next sentence IS the actual question — keep only the next sentence)
- "The following is a question about X:" → remove the meta-sentence, keep the question
- "Below is my prompt:" → remove
- "Here is what I need:" → remove
- "My question is as follows:" → remove

#### Step 6 — Whitespace and Punctuation Cleanup

- Collapse multiple spaces to one
- Collapse 3+ newlines to 2 newlines
- Remove trailing spaces on each line
- Remove spaces before punctuation (e.g., `word .` → `word.`)

---

### What Gets Preserved

The optimizer must NOT remove:

- Specific nouns, names, technical terms, or domain vocabulary
- Numbers, dates, quantities, measurements
- Quoted text (anything inside `"..."` or `'...'`)
- Code blocks (anything inside backticks)
- The actual instruction or question — the core request must survive intact
- Negations (`not`, `never`, `no`, `don't`) — removing these would invert meaning

---

### Energy Savings Calculation

After optimization, calculate energy saved:

```
tokensSaved = originalTokens - optimizedTokens
energySavedWh = tokensSaved × 0.000003    // 3 µWh per token, conservative estimate
energySavedMwh = energySavedWh × 1000
```

Display as: `X tokens saved · Y mWh saved`

---

### Storage for Prompt Optimizer Stats

Add to `chrome.storage.local`:

```javascript
promptOptimizerHistory: [
  {
    timestamp: 1234567890000,
    originalTokens: 120,
    optimizedTokens: 74,
    tokensSaved: 46,
    energySavedMwh: 138
  }
]
```

The History tab in the options page shows a chart of tokens saved over time from this array.

---

## Data Storage

### Chrome Storage — Local (`chrome.storage.local`)

| Key | Type | Contents |
|-----|------|----------|
| `energyHistory` | Array | Per-tab readings: `{ timestamp, watts, url, domNodes, activeTime }` |
| `backendEnergyHistory` | Array | AI sessions: `{ timestamp, model, whPerQuery, sessionWh, url }` |
| `promptOptimizerHistory` | Array | Optimization records: `{ timestamp, originalTokens, optimizedTokens, tokensSaved, energySavedMwh }` |
| `settings` | Object | User preferences (see below) |

### Settings Object

```javascript
{
  trackingEnabled: true,
  samplingInterval: 5000,      // ms (1000 / 5000 / 10000 / 30000)
  dataRetentionDays: 30,
  powerThreshold: 40           // watts — triggers "high energy" alert
}
```

### Chrome Storage — Sync (`chrome.storage.sync`)

| Key | Type | Description |
|-----|------|-------------|
| `theme` | String | `"light"`, `"dark"`, or `"system"` — synced across devices |

---

## Chrome Extension Configuration

### Permissions Needed

```
activeTab      — Access current tab URL and title
tabs           — List and monitor all open tabs
storage        — Read/write Chrome local and sync storage
alarms         — Periodic sampling via chrome.alarms
scripting      — Inject content script at runtime if needed
```

### Content Scripts

**Runs on all pages:**
- `content-script.js` — collects DOM, network, media signals and sends to service worker

**No injected scripts needed on AI sites** — detection is URL-based, handled in the service worker and popup.

---

## CSS Design System

Custom CSS variables only (no external library):

```css
/* Text */
--text-primary, --text-secondary, --text-muted

/* Surfaces */
--surface, --surface-elevated

/* Status colors */
--primary, --success, --warning, --danger

/* Spacing scale */
--space-1 through --space-8

/* Borders */
--radius, --radius-lg

/* Shadows */
--shadow, --shadow-md, --shadow-lg
```

Light and dark themes via `[data-theme="dark"]` overrides on the root element.

---

## Message Passing

All communication between scripts uses `chrome.runtime.sendMessage`. The service worker routes all messages.

| Message | Direction | Purpose |
|---------|-----------|---------|
| `ENERGY_DATA` | Content Script → SW | Send page energy signals each interval |
| `GET_CURRENT_ENERGY` | Popup → SW | Get current tab's watts |
| `GET_SETTINGS` | Any → SW | Fetch settings object |
| `UPDATE_SETTINGS` | Any → SW | Save updated settings |
| `GET_HISTORY` | Options → SW | Fetch energy history array |
| `GET_BACKEND_ENERGY_HISTORY` | Options → SW | Fetch AI session history |
| `LOG_BACKEND_ENERGY` | SW internal | Record a new AI session entry |
| `DELETE_BACKEND_ENERGY_ENTRY` | Options → SW | Remove a specific AI record |

---