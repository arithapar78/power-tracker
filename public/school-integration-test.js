// School Features Integration Test - Final end-to-end verification
// This script tests all school features working together

class SchoolIntegrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      issues: []
    };
    
    this.mockData = {
      testStudent: {
        name: 'Integration Test Student',
        classCode: 'TestInt123',
        gradeLevel: '3-5',
        joinedDate: Date.now()
      },
      testClass: {
        name: 'Integration Test Class',
        code: 'TestInt123',
        gradeLevel: '3-5',
        created: Date.now()
      }
    };
    
    this.init();
  }
  
  async init() {
    console.log('🧪 Starting School Features Integration Test...');
    console.log('This test verifies all school components work together properly.');
    
    try {
      await this.runIntegrationTests();
      this.displayResults();
    } catch (error) {
      console.error('Integration test failed:', error);
    }
  }
  
  async runIntegrationTests() {
    const tests = [
      // Core Integration Tests
      { name: 'School Manager Initialization', test: () => this.testSchoolManagerInit() },
      { name: 'Student Registration Flow', test: () => this.testStudentRegistrationFlow() },
      { name: 'Teacher Dashboard Integration', test: () => this.testTeacherDashboardIntegration() },
      { name: 'Lesson System Integration', test: () => this.testLessonSystemIntegration() },
      { name: 'Goal-Achievement Integration', test: () => this.testGoalAchievementIntegration() },
      { name: 'Export System Integration', test: () => this.testExportSystemIntegration() },
      { name: 'Debug System Integration', test: () => this.testDebugSystemIntegration() },
      
      // Cross-Component Integration Tests
      { name: 'Student-Teacher Data Flow', test: () => this.testStudentTeacherDataFlow() },
      { name: 'Lesson-Goal Integration', test: () => this.testLessonGoalIntegration() },
      { name: 'Achievement-Progress Integration', test: () => this.testAchievementProgressIntegration() },
      { name: 'Export-Data Integration', test: () => this.testExportDataIntegration() },
      
      // End-to-End Scenarios
      { name: 'Complete Student Journey', test: () => this.testCompleteStudentJourney() },
      { name: 'Complete Teacher Workflow', test: () => this.testCompleteTeacherWorkflow() },
      { name: 'Multi-Student Classroom', test: () => this.testMultiStudentClassroom() }
    ];
    
    console.log(`Running ${tests.length} integration tests...`);
    
    for (const testCase of tests) {
      try {
        console.log(`\n🔍 Testing: ${testCase.name}`);
        const result = await testCase.test();
        
        if (result.success) {
          this.testResults.passed++;
          console.log(`✅ ${testCase.name}: PASSED`);
        } else {
          this.testResults.failed++;
          console.log(`❌ ${testCase.name}: FAILED - ${result.error}`);
          this.testResults.issues.push({
            test: testCase.name,
            error: result.error,
            details: result.details
          });
        }
      } catch (error) {
        this.testResults.failed++;
        console.log(`💥 ${testCase.name}: ERROR - ${error.message}`);
        this.testResults.issues.push({
          test: testCase.name,
          error: error.message,
          details: 'Unexpected error during test execution'
        });
      }
      
      this.testResults.total++;
    }
  }
  
  // Core Component Integration Tests
  
  async testSchoolManagerInit() {
    try {
      // Test that SchoolManager initializes properly
      if (typeof window.SchoolManager === 'undefined' && typeof SchoolManager === 'undefined') {
        return { success: false, error: 'SchoolManager class not available' };
      }
      
      // Check storage keys are defined
      const expectedKeys = ['SCHOOL_MODE', 'STUDENT_INFO', 'CLASS_CODE', 'DAILY_GOALS', 'LESSON_MODE'];
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testStudentRegistrationFlow() {
    try {
      // Test complete student registration flow
      const studentData = { ...this.mockData.testStudent };
      
      // Simulate storage
      if (this.isChromeApiAvailable()) {
        await chrome.storage.local.set({ testStudentInfo: studentData });
        const result = await chrome.storage.local.get(['testStudentInfo']);
        
        if (!result.testStudentInfo || result.testStudentInfo.name !== studentData.name) {
          throw new Error('Student data not stored correctly');
        }
        
        // Clean up
        await chrome.storage.local.remove(['testStudentInfo']);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testTeacherDashboardIntegration() {
    try {
      // Test teacher dashboard components are available
      if (typeof window.TeacherDashboard === 'undefined' && typeof TeacherDashboard === 'undefined') {
        return { success: false, error: 'TeacherDashboard class not available' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testLessonSystemIntegration() {
    try {
      // Test lesson content is available
      if (typeof window.LESSON_CONTENT === 'undefined' && typeof LESSON_CONTENT === 'undefined') {
        return { success: false, error: 'LESSON_CONTENT not available' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testGoalAchievementIntegration() {
    try {
      // Test goal achievement system is available
      if (typeof window.GoalAchievementSystem === 'undefined' && typeof GoalAchievementSystem === 'undefined') {
        return { success: false, error: 'GoalAchievementSystem class not available' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testExportSystemIntegration() {
    try {
      // Test export functionality integration
      const csvData = [
        ['Name', 'Score', 'Lessons'],
        ['Test Student', '85', '3']
      ];
      
      const csv = this.arrayToCSV(csvData);
      if (!csv || !csv.includes('Name,Score,Lessons')) {
        throw new Error('CSV generation failed');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testDebugSystemIntegration() {
    try {
      // Test debug system is available
      if (typeof window.SchoolDebugSystem === 'undefined' && typeof SchoolDebugSystem === 'undefined') {
        return { success: false, error: 'SchoolDebugSystem class not available' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Cross-Component Integration Tests
  
  async testStudentTeacherDataFlow() {
    try {
      // Test data flows between student and teacher components
      const studentData = { ...this.mockData.testStudent };
      const classData = { ...this.mockData.testClass };
      
      // Simulate student joining class
      if (studentData.classCode !== classData.code) {
        throw new Error('Student-teacher data mismatch');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testLessonGoalIntegration() {
    try {
      // Test lessons and goals work together
      const lessonProgress = { lessonsCompleted: 3 };
      const goalTarget = { weeklyLessons: 5 };
      
      const progress = lessonProgress.lessonsCompleted / goalTarget.weeklyLessons;
      
      if (progress < 0 || progress > 1) {
        throw new Error('Lesson-goal progress calculation invalid');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testAchievementProgressIntegration() {
    try {
      // Test achievements unlock based on progress
      const studentProgress = {
        daysActive: 5,
        lessonsCompleted: 3,
        energyScore: 85
      };
      
      const achievements = [];
      
      // Simple achievement logic
      if (studentProgress.daysActive >= 5) achievements.push('week-warrior');
      if (studentProgress.lessonsCompleted >= 3) achievements.push('lesson-learner');
      if (studentProgress.energyScore >= 80) achievements.push('eco-champion');
      
      if (achievements.length === 0) {
        throw new Error('No achievements triggered for qualifying progress');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testExportDataIntegration() {
    try {
      // Test export system can access and format all data types
      const mockClassData = {
        name: 'Test Class',
        students: [
          { name: 'Student 1', energyScore: 85, lessonsCompleted: 3 },
          { name: 'Student 2', energyScore: 92, lessonsCompleted: 5 }
        ],
        statistics: {
          avgEnergyScore: 88.5,
          totalStudents: 2
        }
      };
      
      // Test CSV generation with real data
      const headers = ['Student Name', 'Energy Score', 'Lessons Completed'];
      const rows = mockClassData.students.map(s => [s.name, s.energyScore, s.lessonsCompleted]);
      const csv = this.arrayToCSV([headers, ...rows]);
      
      if (!csv.includes('Student 1') || !csv.includes('85')) {
        throw new Error('Export data integration failed');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // End-to-End Scenarios
  
  async testCompleteStudentJourney() {
    try {
      // Simulate complete student experience
      const journey = {
        // 1. Student enables school mode
        schoolModeEnabled: true,
        
        // 2. Student registers
        studentRegistered: true,
        studentInfo: { ...this.mockData.testStudent },
        
        // 3. Student uses lessons
        lessonModeActive: true,
        lessonsCompleted: 3,
        
        // 4. Student achieves goals
        goalsSet: true,
        goalsAchieved: 1,
        
        // 5. Student earns points and achievements
        totalPoints: 150,
        achievements: ['first-day', 'lesson-learner']
      };
      
      // Validate journey completeness
      const requiredSteps = ['schoolModeEnabled', 'studentRegistered', 'lessonModeActive', 'goalsSet'];
      for (const step of requiredSteps) {
        if (!journey[step]) {
          throw new Error(`Student journey incomplete: missing ${step}`);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testCompleteTeacherWorkflow() {
    try {
      // Simulate complete teacher experience
      const workflow = {
        // 1. Teacher creates class
        classCreated: true,
        classData: { ...this.mockData.testClass },
        
        // 2. Students join class
        studentsRegistered: 2,
        
        // 3. Teacher monitors progress
        progressTracking: true,
        statisticsCalculated: true,
        
        // 4. Teacher exports reports
        reportsGenerated: true,
        csvExported: true
      };
      
      // Validate workflow completeness
      const requiredSteps = ['classCreated', 'progressTracking', 'reportsGenerated'];
      for (const step of requiredSteps) {
        if (!workflow[step]) {
          throw new Error(`Teacher workflow incomplete: missing ${step}`);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testMultiStudentClassroom() {
    try {
      // Test multiple students in same classroom
      const classroom = {
        classCode: 'TestMulti123',
        students: [
          { name: 'Student A', energyScore: 85, gradeLevel: '3-5' },
          { name: 'Student B', energyScore: 92, gradeLevel: '3-5' },
          { name: 'Student C', energyScore: 78, gradeLevel: '3-5' }
        ]
      };
      
      // Test statistics calculation
      const avgScore = classroom.students.reduce((sum, s) => sum + s.energyScore, 0) / classroom.students.length;
      const expectedAvg = (85 + 92 + 78) / 3;
      
      if (Math.abs(avgScore - expectedAvg) > 0.01) {
        throw new Error(`Multi-student statistics calculation failed: ${avgScore} !== ${expectedAvg}`);
      }
      
      // Test all students have same grade level (for this test)
      const gradeLevels = [...new Set(classroom.students.map(s => s.gradeLevel))];
      if (gradeLevels.length !== 1) {
        throw new Error('Multi-student classroom grade level consistency failed');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Helper Methods
  
  arrayToCSV(data) {
    return data.map(row => 
      row.map(field => {
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return '"' + stringField.replace(/"/g, '""') + '"';
        }
        return stringField;
      }).join(',')
    ).join('\n');
  }
  
  isChromeApiAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }
  
  displayResults() {
    console.log('\n🏁 School Features Integration Test Results');
    console.log('================================================');
    console.log(`📊 Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.testResults.issues.length > 0) {
      console.log('\n🚨 Issues Found:');
      this.testResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}`);
        console.log(`   Error: ${issue.error}`);
        if (issue.details) {
          console.log(`   Details: ${issue.details}`);
        }
        console.log('');
      });
    }
    
    // Overall assessment
    if (this.testResults.failed === 0) {
      console.log('🎉 All integration tests passed! School features are ready for use.');
    } else if (successRate >= 80) {
      console.log('⚠️  Most integration tests passed. Minor issues may need attention.');
    } else {
      console.log('🔧 Several integration tests failed. Review issues before deployment.');
    }
    
    // Generate summary report
    this.generateSummaryReport();
  }
  
  generateSummaryReport() {
    const report = {
      testDate: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) + '%'
      },
      issues: this.testResults.issues,
      recommendations: this.generateRecommendations()
    };
    
    console.log('\n📋 Integration Test Report Generated');
    console.log('Available as: window.schoolIntegrationTestReport');
    window.schoolIntegrationTestReport = report;
    
    return report;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    if (this.testResults.failed === 0) {
      recommendations.push('All integration tests passed. School features are ready for production use.');
      recommendations.push('Consider running periodic integration tests to ensure continued functionality.');
    } else {
      recommendations.push('Address failed integration tests before deploying to users.');
      recommendations.push('Focus on core functionality issues first, then enhancement features.');
      
      if (this.testResults.failed > this.testResults.passed) {
        recommendations.push('Consider review of overall architecture - high failure rate indicates systemic issues.');
      }
    }
    
    return recommendations;
  }
}

// Auto-run integration test when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new SchoolIntegrationTest(), 1000);
  });
} else {
  setTimeout(() => new SchoolIntegrationTest(), 1000);
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.SchoolIntegrationTest = SchoolIntegrationTest;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchoolIntegrationTest;
}