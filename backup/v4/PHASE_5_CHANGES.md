# PHASE 5 IMPLEMENTATION: Prompt Generator Real Data Integration

## Overview
This document tracks the implementation of Phase 5: replacing dummy/random data in the Prompt Generator with real user energy consumption data.

## Completed Changes

### Step 1: ✅ Rename "Advanced Features" to "Prompt Generator"
Successfully renamed all references across the codebase:

#### Modified Files:
- **public/popup.html** (lines 252-255)
  - Changed button ID: `advancedFeaturesBtn` → `promptGeneratorBtn`
  - Changed button text: "Advanced Features" → "Prompt Generator"

- **public/popup.js** (lines 67, 2832-2842)
  - Updated event listener: `handleAdvancedFeatures()` → `handlePromptGenerator()`
  - Renamed method signature

- **public/test-popup.html** (line 185)
  - Updated test file button references

- **public/README.md** (multiple lines)
  - Updated all documentation references
  - Updated usage examples and guides

- **public/EXTENSION_REVIEW_AND_TEST_PLAN.md** (line 60)
  - Updated test plan section headers

## Current Issues Identified

### Step 2: 🔍 Dummy Data Usage Analysis

#### Critical Dummy Data Locations:

**1. Prompt Generator Statistics (popup.js)**
- **Location**: Lines 2995-2999
- **Issue**: Hardcoded statistics with zero values
```javascript
const stats = {
  totalPrompts: 0,        // Should show actual prompt count
  energySavings: 0,       // Should show real energy savings %
  avgTokenReduction: 0    // Should show real token reduction average
};
```
- **Fix Needed**: Connect to real user prompt optimization history

**2. Agent Dashboard Metrics (agent-dashboard.js)**
- **Location**: Lines 877-895
- **Issue**: Extensive Math.random() usage for all dashboard metrics
```javascript
currentUsage: 15.4 + Math.random() * 5,
totalSaved: 127.8 + Math.random() * 20,
todaySavings: 23.4 + Math.random() * 10,
efficiency: 0.78 + Math.random() * 0.15,
```
- **Fix Needed**: Connect to background worker energy data

**3. Options Analytics (options.js)**
- **Location**: Lines 2963-3033
- **Issue**: Fallback demo data with Math.random() variance
```javascript
tokensReduced: Math.floor((stats.totalTokensSaved || 1000) / days * (0.8 + Math.random() * 0.4)),
averageReduction: baseReduction + (Math.random() - 0.5) * 10
```
- **Fix Needed**: Use actual optimization statistics from storage

**4. Energy Tracker Activity (energy-tracker-with-agent.js)**
- **Location**: Lines 372-434
- **Issue**: Mock user activity data
```javascript
clicks: Math.floor(Math.random() * 20),
keystrokes: Math.floor(Math.random() * 100),
tabSwitches: Math.floor(Math.random() * 10),
```
- **Fix Needed**: Connect to real user interaction tracking

**5. AI Model Stats (Multiple Files)**
- **Issue**: Generic/random AI model usage statistics
- **Files Affected**: options.js (lines 2992-3010), various others
- **Fix Needed**: Real AI model detection from tab analysis

### Data Sources Available for Real Implementation:

**Background Worker Data:**
- Energy consumption logs from service worker
- Tab activity monitoring
- AI model detection from URLs/content
- Historical energy usage timestamps

**Chrome Storage Data:**
- User optimization history
- Prompt analysis results  
- Token reduction statistics
- Energy savings calculations

**Real-time Sources:**
- Active tab energy monitoring
- User interaction tracking
- Model usage detection
- Query pattern analysis

## Pending Implementation Steps

### Step 3: 📊 Connect Graph to Real Data
- [ ] Replace random chart data in agent-dashboard.js
- [ ] Use actual energy consumption over time
- [ ] Implement historical data aggregation
- [ ] Add real timestamp-based records

### Step 4: 📈 Connect Statistics to Real Data  
- [ ] Replace dummy totalPrompts counter
- [ ] Use real energySavings calculations
- [ ] Implement actual avgTokenReduction from history
- [ ] Connect to real tab energy data

### Step 5: 🤖 AI Model Usage Stats
- [ ] Replace generic model names with detected ones
- [ ] Implement real model usage frequency tracking
- [ ] Add energy consumption per model type
- [ ] Create Claude/ChatGPT/Gemini breakdowns from real usage

### Step 6: 🔍 Query Pattern Analysis
- [ ] Replace fake query data in analysis functions
- [ ] Implement real timing pattern detection
- [ ] Add actual query length averaging
- [ ] Track common query topics if possible

### Step 7: 🔄 Update Data Flow
- [ ] Create functions to fetch real user data
- [ ] Implement historical data aggregation
- [ ] Add data formatting for graphs and displays
- [ ] Establish real-time data updates

### Step 8: 📝 Document Changes
- [x] Create this PHASE_5_CHANGES.md file
- [ ] Update as implementation progresses

## Implementation Priority

1. **High Priority**: Prompt Generator statistics (popup.js) - user-facing stats
2. **High Priority**: Agent Dashboard metrics - main energy display  
3. **Medium Priority**: Options analytics - historical data analysis
4. **Medium Priority**: AI model detection - accuracy improvements
5. **Low Priority**: Activity simulation replacement - background accuracy

## Technical Approach

### Data Collection Strategy:
1. Leverage existing service worker energy monitoring
2. Enhance Chrome storage data persistence  
3. Implement real-time data aggregation
4. Create background-to-popup data communication

### Implementation Pattern:
1. Identify dummy data location
2. Trace to available real data source
3. Create data transformation function
4. Replace dummy calls with real data calls
5. Test and verify accuracy

## Testing Requirements

After implementation, verify:
- [ ] All statistics show real user data
- [ ] Graphs display actual energy usage patterns  
- [ ] AI model detection works with real tabs
- [ ] No Math.random() calls remain in core features
- [ ] Data persists between browser sessions
- [ ] Performance remains acceptable with real data

## Notes

- Some Math.random() usage is legitimate (jitter, exploration rates)
- Focus on user-facing statistics and core functionality first
- Maintain backward compatibility with existing data storage
- Preserve fallback behavior when no data exists yet