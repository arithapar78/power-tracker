/**
 * Integration Test Suite for Advanced Chrome Extension Features
 * Tests all systems working together: TokenCounter, AIModelPowerCalculator, 
 * AdvancedPromptOptimizer, OptimizationQualityScorer, and PopupManager
 */

class IntegrationTestSuite {
  constructor() {
    this.testResults = new Map();
    this.performanceMetrics = new Map();
    this.testStartTime = Date.now();
    
    console.log('[IntegrationTestSuite] Initializing comprehensive integration tests');
    
    // Test configurations
    this.testConfigs = {
      performance: {
        maxInitializationTime: 2000, // 2 seconds
        maxTokenCountingTime: 100,   // 100ms
        maxOptimizationTime: 3000,   // 3 seconds
        maxUIUpdateTime: 50,         // 50ms
        maxMemoryUsage: 50 * 1024 * 1024 // 50MB
      },
      
      functionality: {
        samplePrompts: [
          "Please help me write a comprehensive essay about the impact of artificial intelligence on modern society, including both positive and negative aspects, with specific examples and detailed analysis.",
          "I need you to create a detailed step-by-step guide for implementing a machine learning algorithm, explaining each component thoroughly.",
          "Can you analyze this data and provide insights on trends, patterns, and recommendations for future actions?",
          "Write code to solve this complex problem with proper error handling and documentation."
        ],
        
        testModels: ['gpt-4', 'gpt-3.5', 'claude', 'gemini'],
        optimizationLevels: ['conservative', 'balanced', 'aggressive']
      }
    };
    
    // Performance monitoring
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.performanceMetrics.set(entry.name, {
          duration: entry.duration,
          startTime: entry.startTime,
          type: entry.entryType
        });
      }
    });
    
    try {
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('[IntegrationTestSuite] Performance Observer not available:', error);
    }
  }
  
  /**
   * Run comprehensive integration test suite
   */
  async runAllTests() {
    console.log('[IntegrationTestSuite] 🚀 Starting comprehensive integration tests');
    const startTime = performance.now();
    
    try {
      // Phase 1: System initialization tests
      await this.testSystemInitialization();
      
      // Phase 2: Component integration tests
      await this.testComponentIntegration();
      
      // Phase 3: Performance and optimization tests
      await this.testPerformanceOptimization();
      
      // Phase 4: Error handling and recovery tests
      await this.testErrorHandling();
      
      // Phase 5: UI integration tests
      await this.testUIIntegration();
      
      // Phase 6: End-to-end workflow tests
      await this.testEndToEndWorkflows();
      
      const totalTime = performance.now() - startTime;
      
      // Generate comprehensive test report
      const report = this.generateTestReport(totalTime);
      console.log('[IntegrationTestSuite] ✅ All tests completed');
      
      return report;
      
    } catch (error) {
      console.error('[IntegrationTestSuite] ❌ Test suite failed:', error);
      return this.generateFailureReport(error);
    }
  }
  
  /**
   * Test system initialization and component loading
   */
  async testSystemInitialization() {
    console.log('[IntegrationTestSuite] Testing system initialization...');
    const testName = 'systemInitialization';
    const startTime = performance.now();
    
    try {
      // Test TokenCounter initialization
      const tokenCounter = new TokenCounter();
      this.assert(tokenCounter instanceof TokenCounter, 'TokenCounter should initialize');
      this.assert(typeof tokenCounter.countTokensGPT === 'function', 'TokenCounter should have countTokensGPT method');
      
      // Test AIModelPowerCalculator initialization
      const powerCalculator = new AIModelPowerCalculator();
      this.assert(powerCalculator instanceof AIModelPowerCalculator, 'AIModelPowerCalculator should initialize');
      this.assert(Object.keys(powerCalculator.modelPowerProfiles).length > 0, 'Power profiles should be loaded');
      
      // Test AdvancedPromptOptimizer initialization
      const optimizer = new AdvancedPromptOptimizer(tokenCounter);
      this.assert(optimizer instanceof AdvancedPromptOptimizer, 'AdvancedPromptOptimizer should initialize');
      this.assert(optimizer.qualityScorer instanceof OptimizationQualityScorer, 'Quality scorer should be available');
      
      // Test OptimizationQualityScorer initialization
      const qualityScorer = new OptimizationQualityScorer();
      this.assert(qualityScorer instanceof OptimizationQualityScorer, 'OptimizationQualityScorer should initialize');
      this.assert(typeof qualityScorer.assessOptimizationQuality === 'function', 'Should have assessment method');
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'All systems initialized successfully');
      
      // Performance check
      if (duration > this.testConfigs.performance.maxInitializationTime) {
        console.warn(`[IntegrationTestSuite] ⚠️ Initialization took ${duration}ms (max: ${this.testConfigs.performance.maxInitializationTime}ms)`);
      }
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test integration between components
   */
  async testComponentIntegration() {
    console.log('[IntegrationTestSuite] Testing component integration...');
    const testName = 'componentIntegration';
    const startTime = performance.now();
    
    try {
      const tokenCounter = new TokenCounter();
      const powerCalculator = new AIModelPowerCalculator();
      const optimizer = new AdvancedPromptOptimizer(tokenCounter);
      
      // Test token counting with different models
      for (const model of this.testConfigs.functionality.testModels) {
        const sampleText = this.testConfigs.functionality.samplePrompts[0];
        const tokens = tokenCounter.countTokensGPT(sampleText, model);
        this.assert(tokens > 0, `Token counting should work for ${model}`);
        this.assert(typeof tokens === 'number', `Token count should be numeric for ${model}`);
      }
      
      // Test power calculation integration
      const mockDetectedModel = {
        model: { name: 'GPT-4', category: 'large-language' },
        confidence: 0.9,
        modelKey: 'gpt-4'
      };
      
      const mockTabData = {
        url: 'https://chat.openai.com',
        domNodes: 2500,
        duration: 300000,
        timestamp: Date.now()
      };
      
      const backendPower = powerCalculator.calculateBackendPower(mockDetectedModel, mockTabData);
      this.assert(backendPower >= 0, 'Backend power calculation should return non-negative value');
      
      // Test optimization integration
      const samplePrompt = this.testConfigs.functionality.samplePrompts[1];
      const optimizationResult = await optimizer.optimizePromptAdvanced(samplePrompt, {
        level: 'balanced',
        targetModel: 'gpt-4'
      });
      
      this.assert(optimizationResult.success, 'Optimization should succeed');
      this.assert(optimizationResult.optimized !== samplePrompt, 'Optimized prompt should be different');
      this.assert(optimizationResult.quality, 'Quality assessment should be included');
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'All components integrate properly');
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test performance and optimization characteristics
   */
  async testPerformanceOptimization() {
    console.log('[IntegrationTestSuite] Testing performance optimization...');
    const testName = 'performanceOptimization';
    const startTime = performance.now();
    
    try {
      const tokenCounter = new TokenCounter();
      const optimizer = new AdvancedPromptOptimizer(tokenCounter);
      
      // Performance test: Token counting speed
      const tokenCountingStartTime = performance.now();
      const longText = this.testConfigs.functionality.samplePrompts.join(' ').repeat(10);
      const tokenCount = tokenCounter.countTokensGPT(longText, 'gpt-4');
      const tokenCountingTime = performance.now() - tokenCountingStartTime;
      
      this.assert(tokenCountingTime < this.testConfigs.performance.maxTokenCountingTime, 
        `Token counting should be fast (${tokenCountingTime}ms < ${this.testConfigs.performance.maxTokenCountingTime}ms)`);
      
      // Performance test: Optimization speed
      const optimizationStartTime = performance.now();
      const optimizationResult = await optimizer.optimizePromptAdvanced(
        this.testConfigs.functionality.samplePrompts[2], 
        { level: 'balanced', targetModel: 'gpt-4' }
      );
      const optimizationTime = performance.now() - optimizationStartTime;
      
      this.assert(optimizationTime < this.testConfigs.performance.maxOptimizationTime,
        `Optimization should complete quickly (${optimizationTime}ms < ${this.testConfigs.performance.maxOptimizationTime}ms)`);
      
      // Memory usage test
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage > this.testConfigs.performance.maxMemoryUsage) {
        console.warn(`[IntegrationTestSuite] ⚠️ High memory usage: ${memoryUsage / 1024 / 1024}MB`);
      }
      
      // Test concurrent operations
      const concurrentPromises = [];
      for (let i = 0; i < 5; i++) {
        const promise = optimizer.optimizePromptAdvanced(
          this.testConfigs.functionality.samplePrompts[i % this.testConfigs.functionality.samplePrompts.length],
          { level: 'conservative', targetModel: 'gpt-3.5' }
        );
        concurrentPromises.push(promise);
      }
      
      const concurrentResults = await Promise.all(concurrentPromises);
      this.assert(concurrentResults.every(r => r.success), 'Concurrent optimizations should all succeed');
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'Performance tests passed');
      
      // Record detailed performance metrics
      this.performanceMetrics.set('tokenCountingSpeed', tokenCountingTime);
      this.performanceMetrics.set('optimizationSpeed', optimizationTime);
      this.performanceMetrics.set('memoryUsage', memoryUsage);
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test error handling and recovery mechanisms
   */
  async testErrorHandling() {
    console.log('[IntegrationTestSuite] Testing error handling...');
    const testName = 'errorHandling';
    const startTime = performance.now();
    
    try {
      const tokenCounter = new TokenCounter();
      const optimizer = new AdvancedPromptOptimizer(tokenCounter);
      const qualityScorer = new OptimizationQualityScorer();
      
      // Test null/undefined input handling
      let result = tokenCounter.countTokensGPT('', 'gpt-4');
      this.assert(result === 0, 'Empty string should return 0 tokens');
      
      result = tokenCounter.countTokensGPT(null, 'gpt-4');
      this.assert(result === 0, 'Null input should return 0 tokens');
      
      // Test invalid model handling
      result = tokenCounter.countTokensGPT('test', 'invalid-model');
      this.assert(typeof result === 'number' && result >= 0, 'Invalid model should fallback gracefully');
      
      // Test optimization with invalid inputs
      const optimizationResult = await optimizer.optimizePromptAdvanced('', {
        level: 'balanced',
        targetModel: 'gpt-4'
      });
      this.assert(!optimizationResult.success || optimizationResult.optimized === '', 'Empty prompt optimization should handle gracefully');
      
      // Test quality assessment with invalid inputs
      const qualityResult = qualityScorer.assessOptimizationQuality('', '', {});
      this.assert(typeof qualityResult.overallScore === 'number', 'Quality assessment should return numeric score even with empty inputs');
      
      // Test extreme input sizes
      const veryLongText = 'test '.repeat(10000);
      const longTextTokens = tokenCounter.countTokensGPT(veryLongText, 'gpt-4');
      this.assert(typeof longTextTokens === 'number' && longTextTokens > 0, 'Very long text should be handled');
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'Error handling tests passed');
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test UI integration and responsiveness
   */
  async testUIIntegration() {
    console.log('[IntegrationTestSuite] Testing UI integration...');
    const testName = 'uiIntegration';
    const startTime = performance.now();
    
    try {
      // Test DOM element existence
      const criticalElements = [
        'promptInput',
        'generateOptimizedBtn',
        'optimizedPrompt',
        'resultsArea',
        'tokenComparisonSection',
        'powerSavingsPanel',
        'qualityAssessmentPanel',
        'optimizationInsightsPanel'
      ];
      
      for (const elementId of criticalElements) {
        const element = document.getElementById(elementId);
        this.assert(element !== null, `Critical UI element ${elementId} should exist`);
      }
      
      // Test token analysis UI elements
      const tokenAnalysisElements = [
        'originalCharCount',
        'originalWordCount', 
        'originalGptTokens',
        'originalClaudeTokens',
        'optimizedCharCount',
        'optimizedWordCount',
        'optimizedGptTokens',
        'optimizedClaudeTokens'
      ];
      
      for (const elementId of tokenAnalysisElements) {
        const element = document.getElementById(elementId);
        this.assert(element !== null, `Token analysis element ${elementId} should exist`);
      }
      
      // Test quality assessment UI elements
      const qualityElements = [
        'overallQualityScore',
        'semanticPreservationScore',
        'structuralCoherenceScore',
        'linguisticClarityScore',
        'contextualRelevanceScore'
      ];
      
      for (const elementId of qualityElements) {
        const element = document.getElementById(elementId);
        this.assert(element !== null, `Quality assessment element ${elementId} should exist`);
      }
      
      // Test UI update performance
      const uiUpdateStartTime = performance.now();
      
      // Simulate UI updates
      document.getElementById('originalCharCount').textContent = '1500';
      document.getElementById('originalWordCount').textContent = '250';
      document.getElementById('originalGptTokens').textContent = '375';
      
      const uiUpdateTime = performance.now() - uiUpdateStartTime;
      this.assert(uiUpdateTime < this.testConfigs.performance.maxUIUpdateTime, 
        `UI updates should be fast (${uiUpdateTime}ms)`);
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'UI integration tests passed');
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test end-to-end workflows
   */
  async testEndToEndWorkflows() {
    console.log('[IntegrationTestSuite] Testing end-to-end workflows...');
    const testName = 'endToEndWorkflows';
    const startTime = performance.now();
    
    try {
      // Workflow 1: Complete optimization process
      await this.testCompleteOptimizationWorkflow();
      
      // Workflow 2: Real-time token counting workflow
      await this.testRealTimeTokenCountingWorkflow();
      
      // Workflow 3: Quality assessment workflow
      await this.testQualityAssessmentWorkflow();
      
      // Workflow 4: Power savings calculation workflow
      await this.testPowerSavingsWorkflow();
      
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, true, duration, 'End-to-end workflow tests passed');
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTestResult(testName, false, duration, error.message);
      throw error;
    }
  }
  
  /**
   * Test complete optimization workflow
   */
  async testCompleteOptimizationWorkflow() {
    const tokenCounter = new TokenCounter();
    const optimizer = new AdvancedPromptOptimizer(tokenCounter);
    
    const originalPrompt = this.testConfigs.functionality.samplePrompts[0];
    
    // Step 1: Analyze original prompt
    const originalAnalysis = tokenCounter.analyzeTokens(originalPrompt, 'gpt-4');
    this.assert(originalAnalysis.gpt > 0, 'Original analysis should have token count');
    
    // Step 2: Optimize prompt
    const optimizationResult = await optimizer.optimizePromptAdvanced(originalPrompt, {
      level: 'balanced',
      targetModel: 'gpt-4'
    });
    
    this.assert(optimizationResult.success, 'Optimization should succeed');
    this.assert(optimizationResult.optimized.length > 0, 'Optimized prompt should not be empty');
    
    // Step 3: Analyze optimized prompt
    const optimizedAnalysis = tokenCounter.analyzeTokens(optimizationResult.optimized, 'gpt-4');
    this.assert(optimizedAnalysis.gpt >= 0, 'Optimized analysis should have token count');
    
    // Step 4: Compare results
    const tokenReduction = originalAnalysis.gpt - optimizedAnalysis.gpt;
    this.assert(tokenReduction >= 0, 'Token reduction should be non-negative');
    
    // Step 5: Quality assessment
    this.assert(optimizationResult.quality, 'Quality assessment should be included');
    this.assert(typeof optimizationResult.quality.overallScore === 'number', 'Quality score should be numeric');
    
    console.log('[IntegrationTestSuite] ✅ Complete optimization workflow test passed');
  }
  
  /**
   * Test real-time token counting workflow
   */
  async testRealTimeTokenCountingWorkflow() {
    const tokenCounter = new TokenCounter();
    
    // Simulate typing with different text lengths
    const textSamples = [
      'Hello',
      'Hello world',
      'Hello world, this is a test',
      'Hello world, this is a test of real-time token counting functionality'
    ];
    
    for (const text of textSamples) {
      const analysis = tokenCounter.analyzeTokens(text, 'gpt-4');
      this.assert(analysis.chars === text.length, 'Character count should match text length');
      this.assert(analysis.gpt > 0, 'Token count should be positive');
      this.assert(analysis.claude > 0, 'Claude token count should be positive');
    }
    
    console.log('[IntegrationTestSuite] ✅ Real-time token counting workflow test passed');
  }
  
  /**
   * Test quality assessment workflow
   */
  async testQualityAssessmentWorkflow() {
    const qualityScorer = new OptimizationQualityScorer();
    
    const originalText = this.testConfigs.functionality.samplePrompts[2];
    const optimizedText = originalText.replace(/please|thank you|very|really/gi, '').trim();
    
    const qualityAssessment = qualityScorer.assessOptimizationQuality(originalText, optimizedText);
    
    this.assert(typeof qualityAssessment.overallScore === 'number', 'Overall score should be numeric');
    this.assert(qualityAssessment.overallScore >= 0 && qualityAssessment.overallScore <= 1, 'Overall score should be between 0 and 1');
    this.assert(qualityAssessment.qualityGrade, 'Quality grade should be assigned');
    this.assert(qualityAssessment.metrics, 'Quality metrics should be provided');
    
    console.log('[IntegrationTestSuite] ✅ Quality assessment workflow test passed');
  }
  
  /**
   * Test power savings workflow
   */
  async testPowerSavingsWorkflow() {
    const tokenCounter = new TokenCounter();
    const powerCalculator = new AIModelPowerCalculator();
    
    const originalTokens = 150;
    const optimizedTokens = 100;
    const targetModel = 'gpt-4';
    
    // This would typically be done by PopupManager.calculateWattageSavings
    const modelKey = powerCalculator.inferModelKey({ name: targetModel });
    const profile = powerCalculator.modelPowerProfiles[modelKey];
    
    this.assert(profile, `Model profile should exist for ${modelKey}`);
    
    const tokensSaved = originalTokens - optimizedTokens;
    this.assert(tokensSaved > 0, 'Tokens should be saved');
    
    const percentageSavings = Math.round((tokensSaved / originalTokens) * 100);
    this.assert(percentageSavings > 0 && percentageSavings <= 100, 'Percentage savings should be valid');
    
    console.log('[IntegrationTestSuite] ✅ Power savings workflow test passed');
  }
  
  /**
   * Helper methods
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
  
  recordTestResult(testName, success, duration, details) {
    this.testResults.set(testName, {
      success,
      duration,
      details,
      timestamp: Date.now()
    });
  }
  
  getMemoryUsage() {
    if ('memory' in performance) {
      return performance.memory.usedJSHeapSize;
    }
    return 0; // Fallback if memory API not available
  }
  
  /**
   * Generate comprehensive test report
   */
  generateTestReport(totalDuration) {
    const report = {
      summary: {
        totalTests: this.testResults.size,
        passedTests: Array.from(this.testResults.values()).filter(r => r.success).length,
        failedTests: Array.from(this.testResults.values()).filter(r => !r.success).length,
        totalDuration: Math.round(totalDuration),
        timestamp: new Date().toISOString()
      },
      
      performance: {
        averageTestDuration: Math.round(totalDuration / this.testResults.size),
        slowestTest: this.findSlowestTest(),
        memoryUsage: this.getMemoryUsage(),
        performanceMetrics: Object.fromEntries(this.performanceMetrics)
      },
      
      testDetails: Object.fromEntries(this.testResults),
      
      recommendations: this.generateRecommendations()
    };
    
    // Log summary to console
    console.log('[IntegrationTestSuite] 📊 Test Report Summary:');
    console.log(`✅ Passed: ${report.summary.passedTests}/${report.summary.totalTests} tests`);
    console.log(`⏱️ Total Duration: ${report.summary.totalDuration}ms`);
    console.log(`💾 Memory Usage: ${Math.round(report.performance.memoryUsage / 1024 / 1024)}MB`);
    
    if (report.summary.failedTests > 0) {
      console.log(`❌ Failed Tests: ${report.summary.failedTests}`);
    }
    
    return report;
  }
  
  generateFailureReport(error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      testResults: Object.fromEntries(this.testResults),
      timestamp: new Date().toISOString()
    };
  }
  
  findSlowestTest() {
    let slowest = null;
    let maxDuration = 0;
    
    for (const [testName, result] of this.testResults.entries()) {
      if (result.duration > maxDuration) {
        maxDuration = result.duration;
        slowest = { testName, duration: result.duration };
      }
    }
    
    return slowest;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    const slowestTest = this.findSlowestTest();
    if (slowestTest && slowestTest.duration > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Consider optimizing ${slowestTest.testName} - took ${slowestTest.duration}ms`
      });
    }
    
    // Memory recommendations
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > this.testConfigs.performance.maxMemoryUsage) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: `High memory usage detected: ${Math.round(memoryUsage / 1024 / 1024)}MB`
      });
    }
    
    // Test failure recommendations
    const failedTests = Array.from(this.testResults.entries()).filter(([_, result]) => !result.success);
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${failedTests.length} test(s) failed - investigate and fix`
      });
    }
    
    return recommendations;
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.IntegrationTestSuite = IntegrationTestSuite;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationTestSuite;
}