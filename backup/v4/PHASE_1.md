# PHASE 1: Button Audit

## Task: Find all interactive elements and test functionality

### Step 1: Discovery
Search these file types for buttons:
- All .html files
- All .js files

Find:
- `<button>` elements
- Elements with `onclick` attributes  
- `addEventListener('click')` calls
- `<a>` tags acting as buttons
- Clickable divs/icons with event handlers

### Step 2: Document Findings
Create file: `BUTTON_AUDIT.md`

Format:
File: [filename]
Button: [label/id]

Line: [number]
Function: [function name]
Exists: [YES/NO]
Works: [YES/NO/EMPTY]
Action: [KEEP/FIX/REMOVE]


### Step 3: Identify Buttons to Remove
Mark these for removal:
1. "Gmail dark mode" button - does nothing, remove it
2. Any button that triggers "power ai learntav demo popup"
3. Any button with missing function
4. Any button with empty function body

### Step 4: Create Audit Report
In BUTTON_AUDIT.md, add summary at top:
- Total buttons found: X
- Working buttons: X
- Broken/empty buttons: X  
- Buttons marked for removal: X

### Step 5: Stop and Show Results
DO NOT remove anything yet.
Show me BUTTON_AUDIT.md for review.

Wait for approval before making changes.