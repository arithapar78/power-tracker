# PHASE 6: UI Fixes and Cleanup

## Prerequisites
Phase 5 should be complete.

## Task 1: Fix AI Model Display

### Problem
AI model field always shows "claude sonnet 4" regardless of actual model being used.

### Solution
Find where AI model name is displayed:
- Search for: "claude sonnet 4", "AI model", "model name"
- Locate hardcoded model string

Implement dynamic detection:
- Detect AI model from active tab URL
- Parse model name from page content/API calls
- Support multiple AI platforms:
  - Claude (all versions)
  - ChatGPT (GPT-3.5, GPT-4, etc.)
  - Gemini
  - Other AI services

Fallback handling:
- If model cannot be detected: Show "Unknown" or "Not detected"
- Don't show hardcoded "claude sonnet 4"

Update frequency:
- Check model when tab changes
- Update display in real-time

## Task 2: Fix Scrollbar Issue

### Problem
Two scrollbars appear in main popup (nested scrollable containers).

### Solution
Identify nested scroll containers:
- Search popup HTML for: overflow-y, overflow-x, overflow: scroll
- Find parent and child containers both set to scroll
- Check CSS for conflicting scroll properties

Fix approach:
- Keep ONE vertical scrollbar for entire popup
- Remove scroll from nested containers
- Set only outer container to: overflow-y: auto
- Inner containers: overflow: visible

Test scrolling:
- Popup should scroll smoothly top to bottom
- Only one scrollbar visible on right side
- No horizontal scrollbar unless absolutely necessary

## Task 3: Remove Test Energy Tips

### Problem
"Test energy tips" element/section exists and needs removal.

### Solution
Search for:
- "test energy tips"
- "test-energy-tips"
- "testEnergyTips"
- Any variations in HTML/CSS/JS

Remove completely:
- HTML elements
- CSS styling
- JavaScript functions
- Event listeners
- Any related code

Verify removal:
- Check all references are gone
- Ensure no broken links to removed code
- Confirm no console errors after removal

## Task 4: Settings Page Button Cleanup

### Problem
Many buttons in settings page don't work or have unclear purpose.

### Solution
Audit settings page buttons specifically:
- List every button in settings.html or settings page
- Test each button's functionality

For each button, determine:
- Does it work? (function exists and executes)
- Does it do what the label suggests?
- Is the functionality complete or just a stub?

Categories:
**Working buttons** - Keep as-is, document what they do

**Broken but useful** - Fix and implement:
- Connect to appropriate function
- Implement expected behavior
- Common examples:
  - "Reset Settings" → implement actual reset
  - "Export Data" → implement data export
  - "Clear History" → implement history clearing
  - "Save Changes" → implement settings save

**Unclear/Useless** - Remove:
- Buttons with no clear purpose
- Duplicate buttons
- Placeholder buttons never implemented

## Task 5: Document All Changes
Create file: `PHASE_6_FIXES.md`

Format:
```
# Phase 6: UI Fixes and Cleanup

## AI Model Display Fixed
- Old behavior: Always showed "claude sonnet 4"
- New behavior: Dynamically detects actual model
- Detection method: [describe]
- Supported models: [list]
- Fallback: Shows "Unknown" when can't detect
- Files modified: [list with line numbers]

## Scrollbar Fixed
- Problem: Two scrollbars (nested containers)
- Solution: [describe what was changed]
- Containers modified: [list]
- CSS changes: [describe]
- Result: Single vertical scrollbar on popup

## Test Energy Tips Removed
- Found in files: [list]
- Lines removed: [list line numbers]
- Related code cleaned: [list functions/CSS removed]

## Settings Page Buttons - Audit Results

### Working Buttons (Kept)
- Button: [name] - Function: [what it does]
- Button: [name] - Function: [what it does]

### Buttons Fixed
- Button: [name] 
  - Was: [broken behavior]
  - Now: [fixed behavior]
  - Implementation: [brief description]

### Buttons Removed
- Button: [name] - Reason: [why removed]
- Button: [name] - Reason: [why removed]

## Files Modified
- [filename]: AI model detection added
- [filename]: Scrollbar fix applied
- [filename]: Test energy tips removed
- [filename]: Settings buttons fixed/removed
```

## Task 6: Test All Fixes
After implementation:

**AI Model Test:**
- Open ChatGPT tab → verify shows "ChatGPT" or correct model
- Open Claude tab → verify shows correct Claude version
- Open unknown AI → verify shows "Unknown" not "claude sonnet 4"

**Scrollbar Test:**
- Open popup
- Scroll through content
- Verify only ONE scrollbar visible
- Test with short and long content

**Test Energy Tips:**
- Search entire extension for any reference
- Confirm completely removed
- No console errors

**Settings Buttons:**
- Click every button in settings
- Verify each does something or is removed
- No broken/non-functional buttons remain
- Test "Save", "Reset", and other critical buttons

## Task 7: Stop and Report
Show me PHASE_6_FIXES.md
Confirm all issues resolved
Demonstrate AI model now shows correctly
Report any edge cases or limitations
```

---

## Tell Roo:
```
@PHASE_6.md execute