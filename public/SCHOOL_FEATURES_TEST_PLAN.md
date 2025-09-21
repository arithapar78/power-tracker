# 🏫 Power Tracker School Features - End-to-End Test Plan

## Overview
This document outlines comprehensive testing procedures for all implemented school features in the Power Tracker Chrome extension.

## 🧪 Test Environment Setup
1. Load the Power Tracker extension in Chrome
2. Open the extension popup
3. Enable debug mode with `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
4. Have the teacher dashboard ready: `teacher-dashboard.html`

## 📋 Test Scenarios

### Phase 1: Student Registration & School Mode

#### Test 1.1: School Mode Toggle
**Steps:**
1. Open extension popup
2. Look for school mode toggle in header controls
3. Click school mode toggle
4. Verify interface transforms to show school-specific elements
5. Verify student registration interface becomes available

**Expected Results:**
- [ ] School mode toggle is visible and functional
- [ ] Interface shows school-related UI elements when enabled
- [ ] Student registration form appears when school mode is active
- [ ] Toggle state persists across extension reopening

#### Test 1.2: Student Registration Flow
**Steps:**
1. Enable school mode
2. Fill out student registration form:
   - Name: "Test Student"
   - Class Code: "TestClass123" 
   - Grade Level: "3-5"
3. Click "Join Class" button
4. Verify data is saved to Chrome storage
5. Verify UI updates to show student is registered

**Expected Results:**
- [ ] Form accepts all required information
- [ ] Form validation works (empty fields, invalid class codes)
- [ ] Student data persists in Chrome storage
- [ ] UI confirms successful registration
- [ ] Grade-appropriate content is prepared

### Phase 2: Teacher Dashboard

#### Test 2.1: Teacher Dashboard Access
**Steps:**
1. Open `teacher-dashboard.html` in browser tab
2. Verify dashboard loads completely
3. Check all sections are visible and functional

**Expected Results:**
- [ ] Dashboard loads without errors
- [ ] All sections render properly
- [ ] No JavaScript console errors
- [ ] Responsive design works on different screen sizes

#### Test 2.2: Class Creation
**Steps:**
1. In teacher dashboard, enter class information:
   - Class Name: "Test Math Class"
   - Grade Level: "6-8"
2. Click "Generate Class Code"
3. Verify unique class code is generated
4. Verify class appears in "Your Classes" section
5. Test creating multiple classes with different names

**Expected Results:**
- [ ] Class code generation works reliably
- [ ] Generated codes are unique and memorable
- [ ] Classes appear in dashboard list immediately
- [ ] Class data persists across page reloads
- [ ] Multiple classes can be managed simultaneously

#### Test 2.3: Student-Teacher Data Integration
**Steps:**
1. Create a class in teacher dashboard (get class code)
2. In extension popup, register as student with that class code
3. Use the extension to generate some energy data
4. Return to teacher dashboard and check if student appears
5. Verify student statistics are reflected

**Expected Results:**
- [ ] Student registration with valid class code works
- [ ] Student data appears in teacher dashboard
- [ ] Energy statistics are calculated correctly
- [ ] Real-time updates work (or update on refresh)

### Phase 3: Lesson System

#### Test 3.1: Lesson Mode Activation
**Steps:**
1. In school mode, toggle lesson mode on
2. Verify interface transforms to kid-friendly version
3. Check that educational content is accessible
4. Toggle lesson mode off and verify return to normal

**Expected Results:**
- [ ] Lesson mode toggle is accessible in school mode
- [ ] Interface becomes more child-friendly (bigger text, emojis)
- [ ] Educational content sections appear
- [ ] Toggle state affects interface presentation
- [ ] Normal mode restoration works completely

#### Test 3.2: Grade-Appropriate Content
**Steps:**
1. Register students with different grade levels:
   - K-2, 3-5, 6-8, 9-12
2. Enable lesson mode for each
3. Verify content complexity matches grade level
4. Check interactive elements work properly

**Expected Results:**
- [ ] K-2: Very simple language, lots of emojis, basic concepts
- [ ] 3-5: Simple explanations, interactive elements, encouraging tone
- [ ] 6-8: More detailed content, some technical terms, challenges
- [ ] 9-12: Advanced content, technical accuracy, complex interactions

#### Test 3.3: Interactive Lesson Elements
**Steps:**
1. Navigate through different lesson topics
2. Test interactive demonstrations
3. Try quiz questions and feedback
4. Verify real-time energy data integration

**Expected Results:**
- [ ] All interactive elements respond properly
- [ ] Quiz questions provide appropriate feedback
- [ ] Real energy data integrates with lessons
- [ ] Navigation between lessons works smoothly

### Phase 4: Goal & Achievement System

#### Test 4.1: Goal Setting and Tracking
**Steps:**
1. Access goal setting interface
2. Create different types of goals:
   - Daily energy reduction
   - Weekly lessons completed
   - CO2 prevention target
3. Simulate progress toward goals
4. Verify progress tracking and updates

**Expected Results:**
- [ ] Goal creation interface is intuitive
- [ ] Different goal types are available
- [ ] Progress tracking works accurately
- [ ] Visual indicators show progress clearly
- [ ] Goal completion triggers appropriate feedback

#### Test 4.2: Achievement System
**Steps:**
1. Perform actions that should trigger achievements:
   - First day of use
   - Complete lessons
   - Reach energy saving goals
   - Maintain streaks
2. Verify achievements unlock appropriately
3. Check achievement notifications and celebrations

**Expected Results:**
- [ ] Achievements unlock at correct trigger points
- [ ] Achievement notifications are celebratory and engaging
- [ ] Achievement progress is tracked accurately
- [ ] Different achievement categories work properly

#### Test 4.3: Points and Rewards
**Steps:**
1. Accumulate points through various activities
2. Verify point calculations are correct
3. Check point display and history
4. Test streak bonuses and multipliers

**Expected Results:**
- [ ] Points are awarded consistently for activities
- [ ] Point calculations match expected formulas
- [ ] Point totals persist across sessions
- [ ] Streak multipliers work correctly

### Phase 5: Export & Reporting System

#### Test 5.1: Basic CSV Export
**Steps:**
1. In teacher dashboard, select a class with student data
2. Use "Quick Export CSV" function
3. Verify file downloads correctly
4. Open CSV and verify data accuracy and format

**Expected Results:**
- [ ] CSV file downloads without errors
- [ ] Data format is properly structured
- [ ] All expected data fields are present
- [ ] Data accuracy matches dashboard displays

#### Test 5.2: Advanced Export Options
**Steps:**
1. Use "Advanced Export" button
2. Test each export format:
   - Student Summary Report
   - Daily Progress Report
   - Detailed Analytics Report
3. Verify each report contains appropriate data
4. Test report preview functionality

**Expected Results:**
- [ ] Advanced export dialog opens properly
- [ ] All export options function correctly
- [ ] Each report format contains relevant data
- [ ] Report previews display accurate information

#### Test 5.3: Report Preview System
**Steps:**
1. Select class with substantial data
2. Use "Preview Report" functionality
3. Verify preview displays comprehensive information
4. Test navigation between preview sections
5. Verify export buttons work from preview

**Expected Results:**
- [ ] Report preview loads comprehensive data
- [ ] All preview sections display properly
- [ ] Data visualization elements work correctly
- [ ] Export options remain functional from preview

### Phase 6: Debug System

#### Test 6.1: Debug Mode Activation
**Steps:**
1. Use keyboard shortcut `Ctrl+Shift+D` to activate debug mode
2. Verify debug console appears
3. Test debug panel tabs and navigation
4. Verify debug mode persists across extension reloads

**Expected Results:**
- [ ] Debug mode activates with keyboard shortcut
- [ ] Debug console renders properly
- [ ] All debug tabs are functional
- [ ] Debug state persists appropriately

#### Test 6.2: Automated Test Suite
**Steps:**
1. In debug mode, click "Run All Tests"
2. Monitor test execution progress
3. Review test results in each category
4. Verify failed tests provide useful error information
5. Test individual test suite execution

**Expected Results:**
- [ ] All test suites execute without crashing
- [ ] Test results provide clear pass/fail status
- [ ] Failed tests include helpful error messages
- [ ] Test execution completes in reasonable time
- [ ] Individual test suites can be run separately

#### Test 6.3: Data Inspector
**Steps:**
1. Navigate to Data Inspector tab in debug mode
2. Verify all extension data is visible
3. Test data formatting and readability
4. Verify data updates reflect current state

**Expected Results:**
- [ ] All stored data is visible in inspector
- [ ] Data formatting is readable and organized
- [ ] Data reflects current extension state
- [ ] Inspector updates when data changes

## 🚀 Integration Testing Scenarios

### Scenario A: Complete Student Journey
1. Student enables school mode
2. Student registers for teacher's class
3. Student completes lessons and achieves goals
4. Student accumulates points and unlocks achievements
5. Teacher views student progress and exports reports

### Scenario B: Classroom Management
1. Teacher creates multiple classes
2. Multiple students register for different classes
3. Students use extension and generate data
4. Teacher monitors progress across all classes
5. Teacher generates comparative reports

### Scenario C: Debug and Troubleshooting
1. Issues arise during normal use
2. Debug mode is activated to investigate
3. Automated tests identify potential problems
4. Data inspector reveals state information
5. Issues are resolved using debug information

## ✅ Success Criteria

### Critical Features (Must Work)
- [ ] School mode toggle and student registration
- [ ] Teacher dashboard and class creation
- [ ] Basic lesson mode functionality
- [ ] Goal setting and progress tracking
- [ ] CSV export functionality
- [ ] Debug mode activation and basic testing

### Important Features (Should Work)
- [ ] Advanced lesson interactions
- [ ] Achievement system with notifications
- [ ] Multiple export formats
- [ ] Comprehensive debug testing
- [ ] Grade-level content differentiation

### Nice-to-Have Features (Good if Working)
- [ ] Advanced report previews
- [ ] Performance monitoring in debug mode
- [ ] Complex data visualization
- [ ] Advanced keyboard shortcuts

## 📊 Test Results Template

### Test Execution Summary
- **Date:** [Date of testing]
- **Tester:** [Name]
- **Browser:** [Chrome version]
- **Extension Version:** [Version]

### Results Overview
- **Total Tests:** [Number]
- **Passed:** [Number] 
- **Failed:** [Number]
- **Skipped:** [Number]

### Critical Issues Found
1. [Description of any critical issues]
2. [Steps to reproduce]
3. [Expected vs actual behavior]

### Recommendations
- [Any recommendations for fixes or improvements]
- [Priority levels for addressing issues]

---

## 🔧 Debug Commands Reference

When debug mode is active, these commands are available in the browser console:

- `schoolDebug.runAllTests()` - Run complete test suite
- `schoolDebug.runTestSuite('Suite Name')` - Run specific test suite
- `schoolDebug.clearDebugLog()` - Clear debug log
- `schoolDebug.exportDebugData()` - Export debug data as JSON

**Keyboard Shortcuts:**
- `Ctrl+Shift+D` (or `Cmd+Shift+D`) - Toggle debug mode
- `Ctrl+Shift+T` (or `Cmd+Shift+T`) - Run all tests (when debug active)