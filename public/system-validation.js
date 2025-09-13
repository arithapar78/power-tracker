/**
 * System Validation Test - Final validation for Phase 5
 * Validates all systems working together in production-ready state
 */

class SystemValidationTest {
  constructor() {
    this.validationResults = new Map();
    this.startTime = Date.now();
    
    console.log('[SystemValidationTest] Initializing comprehensive system validation');
  }
  
  /**
   * Run comprehensive system validation
   */
  async runValidation() {
    console.log('[SystemValidationTest] 🔍 Starting comprehensive system validation');
    
    const validationSuite = [
      { name: 'systemIntegration', test: this.validateSystemIntegration.bind(this) },
      { name: 'performanceOptimization', test: this.validatePerformanceOptimization.bind(this) },
      { name: 'advancedFeatures', test: this.validateAdvancedFeatures.bind(this) },
      { name: 'uiIntegration', test: this.validateUIIntegration.bind(this) },
      { name: 'errorHandling', test: this.validateErrorHandling.bind(this) },
      { name: 'memoryManagement', test: this.validateMemoryManagement.bind(this) },
      { name: 'crossSystemCommunication', test: this.validateCrossSystemCommunication.bind(this) }
    ];
    
    const results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: new Map(),
      totalTime: 0,
      systemHealth: 'unknown'
    };
    
    for (const validation of validationSuite) {
      const startTime = performance.now();
      
      try {
        const result = await validation.test();
        const duration = performance.now() - startTime;
        
        results.details.set(validation.name, {
          success: result.success,
          duration: Math.round(duration),
          details: result.details,
          warnings: result.warnings || []
        });
        
        if (result.success) {
          results.passed++;
        } else {
          results.failed++;
        }
        
        if (result.warnings && result.warnings.length > 0) {
          results.warnings += result.warnings.length;
        }
        
      } catch (error) {
        const duration = performance.now() - startTime;
        results.failed++;
        results.details.set(validation.name, {
          success: false,
          duration: Math.round(duration),
          error: error.message,
          details: `Validation failed: ${error.message}`
        });
        
        console.error(`[SystemValidationTest] Validation ${validation.name} failed:`, error);
      }
    }
    
    results.totalTime = Date.now() - this.startTime;
    results.systemHealth = this.determineSystemHealth(results);
    
    // Generate final report
    this.generateValidationReport(results);
    
    return results;
  }
  
  /**
   * Validate system integration
   */
  async validateSystemIntegration() {
    const issues = [];
    const warnings = [];
    
    // Check if SystemIntegrationManager is available and initialized
    if (typeof window.SystemIntegrationManager === 'undefined') {
      issues.push('SystemIntegrationManager class not available');
    }
    
    // Check if popup manager has system integration
    if (window.popupManager) {
      if (!window.popupManager.systemIntegrationManager) {
        issues.push('PopupManager does not have SystemIntegrationManager instance');
      } else {
        const manager = window.popupManager.systemIntegrationManager;
        
        if (!manager.isInitialized) {
          issues.push('SystemIntegrationManager not properly initialized');
        }
        
        // Check registered systems
        const systems = manager.getAllSystems();
        const expectedSystems = ['performanceOptimizer', 'tokenCounter', 'powerCalculator', 'qualityScorer'];
        
        for (const expectedSystem of expectedSystems) {
          if (!systems.has(expectedSystem)) {
            warnings.push(`Expected system '${expectedSystem}' not registered`);
          }
        }
        
        // Check system health
        try {
          const healthCheck = await manager.performHealthCheck();
          if (healthCheck.overall !== 'healthy') {
            warnings.push(`System health check status: ${healthCheck.overall}`);
          }
        } catch (error) {
          issues.push(`Health check failed: ${error.message}`);
        }
      }
    } else {
      issues.push('PopupManager not available globally');
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'System integration validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate performance optimization
   */
  async validatePerformanceOptimization() {
    const issues = [];
    const warnings = [];
    
    // Check if PerformanceOptimizer is available
    if (typeof window.PerformanceOptimizer === 'undefined') {
      issues.push('PerformanceOptimizer class not available');
    }
    
    // Check if performance optimizer is initialized
    if (window.popupManager && window.popupManager.performanceOptimizer) {
      const optimizer = window.popupManager.performanceOptimizer;
      
      // Check if it's recording metrics
      if (optimizer.metrics.size === 0) {
        warnings.push('PerformanceOptimizer has no recorded metrics yet');
      }
      
      // Check memory monitoring
      const memoryUsage = optimizer.getCurrentMemoryUsage();
      if (memoryUsage > 100) { // 100MB threshold
        warnings.push(`High memory usage detected: ${memoryUsage}MB`);
      }
      
      // Check cache system
      if (!optimizer.cacheManager) {
        issues.push('Cache manager not initialized');
      } else {
        const hitRate = optimizer.cacheManager.getHitRate();
        if (hitRate < 10) { // Less than 10% hit rate might indicate issues
          warnings.push(`Low cache hit rate: ${hitRate}%`);
        }
      }
      
    } else {
      issues.push('PerformanceOptimizer not available in PopupManager');
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'Performance optimization validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate advanced features
   */
  async validateAdvancedFeatures() {
    const issues = [];
    const warnings = [];
    
    // Validate TokenCounter
    if (typeof window.TokenCounter === 'undefined') {
      issues.push('TokenCounter class not available');
    } else {
      try {
        const tokenCounter = new TokenCounter();
        const testText = 'This is a test prompt for token counting validation.';
        const tokens = tokenCounter.countTokensGPT(testText, 'gpt-4');
        
        if (typeof tokens !== 'number' || tokens <= 0) {
          issues.push('TokenCounter not producing valid token counts');
        }
        
        // Test token analysis
        const analysis = tokenCounter.analyzeTokens(testText, 'gpt-4');
        if (!analysis || !analysis.gpt || !analysis.claude) {
          issues.push('Token analysis not working properly');
        }
      } catch (error) {
        issues.push(`TokenCounter validation failed: ${error.message}`);
      }
    }
    
    // Validate AIModelPowerCalculator
    if (typeof window.AIModelPowerCalculator === 'undefined') {
      issues.push('AIModelPowerCalculator class not available');
    } else {
      try {
        const calculator = new AIModelPowerCalculator();
        if (!calculator.modelPowerProfiles || Object.keys(calculator.modelPowerProfiles).length === 0) {
          issues.push('AIModelPowerCalculator has no power profiles');
        }
        
        // Test power calculation
        const mockModel = { model: { name: 'GPT-4', category: 'large-language' }, modelKey: 'gpt-4' };
        const mockTab = { url: 'https://test.com', domNodes: 1000 };
        const power = calculator.calculateBackendPower(mockModel, mockTab, {});
        
        if (typeof power !== 'number' || power < 0) {
          issues.push('AIModelPowerCalculator not producing valid power calculations');
        }
      } catch (error) {
        issues.push(`AIModelPowerCalculator validation failed: ${error.message}`);
      }
    }
    
    // Validate AdvancedPromptOptimizer
    if (typeof window.AdvancedPromptOptimizer === 'undefined') {
      issues.push('AdvancedPromptOptimizer class not available');
    } else {
      try {
        const tokenCounter = new TokenCounter();
        const optimizer = new AdvancedPromptOptimizer(tokenCounter);
        
        if (!optimizer.qualityScorer) {
          issues.push('AdvancedPromptOptimizer missing quality scorer');
        }
        
        // Test optimization (quick test)
        const testPrompt = 'Please help me with this task, thank you very much for your assistance.';
        const result = await optimizer.optimizePromptAdvanced(testPrompt, {
          level: 'conservative',
          targetModel: 'gpt-4'
        });
        
        if (!result.success || !result.optimized) {
          issues.push('AdvancedPromptOptimizer not producing valid optimizations');
        }
      } catch (error) {
        issues.push(`AdvancedPromptOptimizer validation failed: ${error.message}`);
      }
    }
    
    // Validate OptimizationQualityScorer
    if (typeof window.OptimizationQualityScorer === 'undefined') {
      issues.push('OptimizationQualityScorer class not available');
    } else {
      try {
        const scorer = new OptimizationQualityScorer();
        const original = 'This is a test prompt for quality assessment.';
        const optimized = 'Test prompt for quality assessment.';
        
        const assessment = scorer.assessOptimizationQuality(original, optimized);
        
        if (!assessment || typeof assessment.overallScore !== 'number') {
          issues.push('OptimizationQualityScorer not producing valid assessments');
        }
      } catch (error) {
        issues.push(`OptimizationQualityScorer validation failed: ${error.message}`);
      }
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'Advanced features validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate UI integration
   */
  async validateUIIntegration() {
    const issues = [];
    const warnings = [];
    
    // Check critical UI elements
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
      if (!element) {
        issues.push(`Critical UI element missing: ${elementId}`);
      }
    }
    
    // Check advanced analytics elements
    const analyticsElements = [
      'originalCharCount',
      'originalWordCount',
      'originalGptTokens',
      'optimizedCharCount',
      'optimizedWordCount',
      'optimizedGptTokens'
    ];
    
    let missingAnalyticsElements = 0;
    for (const elementId of analyticsElements) {
      const element = document.getElementById(elementId);
      if (!element) {
        missingAnalyticsElements++;
      }
    }
    
    if (missingAnalyticsElements > 0) {
      warnings.push(`${missingAnalyticsElements} analytics elements missing or not accessible`);
    }
    
    // Check event listeners setup
    if (window.popupManager) {
      const generateBtn = document.getElementById('generateOptimizedBtn');
      if (generateBtn) {
        // Check if event listener is attached (basic check)
        const events = getEventListeners ? getEventListeners(generateBtn) : null;
        if (events && events.click && events.click.length === 0) {
          warnings.push('Generate button may not have event listeners attached');
        }
      }
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'UI integration validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate error handling
   */
  async validateErrorHandling() {
    const issues = [];
    const warnings = [];
    
    try {
      // Test error handling in TokenCounter
      if (window.popupManager && window.popupManager.tokenCounter) {
        const tokenCounter = window.popupManager.tokenCounter;
        
        // Test with null input
        const nullResult = tokenCounter.countTokensGPT(null, 'gpt-4');
        if (typeof nullResult !== 'number') {
          issues.push('TokenCounter does not handle null input gracefully');
        }
        
        // Test with empty string
        const emptyResult = tokenCounter.countTokensGPT('', 'gpt-4');
        if (typeof emptyResult !== 'number') {
          issues.push('TokenCounter does not handle empty string gracefully');
        }
        
        // Test with invalid model
        const invalidModelResult = tokenCounter.countTokensGPT('test', 'invalid-model');
        if (typeof invalidModelResult !== 'number') {
          issues.push('TokenCounter does not handle invalid model gracefully');
        }
      }
      
      // Test error handling in optimization
      if (window.popupManager && window.popupManager.advancedOptimizer) {
        const optimizer = window.popupManager.advancedOptimizer;
        
        try {
          const emptyOptimization = await optimizer.optimizePromptAdvanced('', {
            level: 'balanced',
            targetModel: 'gpt-4'
          });
          
          if (!emptyOptimization || typeof emptyOptimization.success !== 'boolean') {
            issues.push('AdvancedPromptOptimizer does not handle empty input gracefully');
          }
        } catch (error) {
          // This is expected behavior, but we should handle it gracefully
          warnings.push('AdvancedPromptOptimizer throws unhandled exceptions with empty input');
        }
      }
      
    } catch (error) {
      issues.push(`Error handling validation failed: ${error.message}`);
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'Error handling validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate memory management
   */
  async validateMemoryManagement() {
    const issues = [];
    const warnings = [];
    
    // Check initial memory usage
    const initialMemory = this.getMemoryUsage();
    
    // Perform memory-intensive operations
    try {
      if (window.popupManager && window.popupManager.tokenCounter) {
        const tokenCounter = window.popupManager.tokenCounter;
        
        // Create large text for testing
        const largeText = 'This is a memory test. '.repeat(1000);
        
        // Perform multiple token counting operations
        for (let i = 0; i < 100; i++) {
          tokenCounter.countTokensGPT(largeText, 'gpt-4');
        }
        
        // Check memory usage after operations
        const afterOperationsMemory = this.getMemoryUsage();
        const memoryIncrease = afterOperationsMemory - initialMemory;
        
        if (memoryIncrease > 50) { // 50MB increase threshold
          warnings.push(`Significant memory increase detected: ${memoryIncrease}MB`);
        }
        
        // Check if performance optimizer is managing memory
        if (window.popupManager.performanceOptimizer) {
          const optimizer = window.popupManager.performanceOptimizer;
          
          // Trigger memory optimization
          optimizer.optimizeMemoryUsage();
          
          // Wait a moment for cleanup
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const finalMemory = this.getMemoryUsage();
          if (finalMemory > afterOperationsMemory) {
            warnings.push('Memory optimization did not reduce memory usage');
          }
        } else {
          warnings.push('PerformanceOptimizer not available for memory management');
        }
      }
    } catch (error) {
      issues.push(`Memory management validation failed: ${error.message}`);
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'Memory management validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Validate cross-system communication
   */
  async validateCrossSystemCommunication() {
    const issues = [];
    const warnings = [];
    
    try {
      // Test integration between TokenCounter and AdvancedPromptOptimizer
      if (window.popupManager) {
        const tokenCounter = window.popupManager.tokenCounter;
        const optimizer = window.popupManager.advancedOptimizer;
        
        if (tokenCounter && optimizer) {
          const testPrompt = 'This is a test prompt for cross-system communication validation.';
          
          // Get original token count
          const originalTokens = tokenCounter.countTokensGPT(testPrompt, 'gpt-4');
          
          // Optimize prompt
          const optimizationResult = await optimizer.optimizePromptAdvanced(testPrompt, {
            level: 'balanced',
            targetModel: 'gpt-4'
          });
          
          if (optimizationResult.success) {
            // Get optimized token count
            const optimizedTokens = tokenCounter.countTokensGPT(optimizationResult.optimized, 'gpt-4');
            
            // Verify the systems are communicating properly
            if (originalTokens <= optimizedTokens) {
              warnings.push('Token optimization did not reduce token count - systems may not be communicating properly');
            }
          } else {
            issues.push('Cross-system optimization failed');
          }
        } else {
          issues.push('Required systems not available for cross-system communication test');
        }
        
        // Test SystemIntegrationManager coordination
        if (window.popupManager.systemIntegrationManager) {
          const manager = window.popupManager.systemIntegrationManager;
          const systems = manager.getAllSystems();
          
          if (systems.size < 3) {
            warnings.push(`Only ${systems.size} systems registered with integration manager`);
          }
        } else {
          warnings.push('SystemIntegrationManager not available for coordination test');
        }
      }
    } catch (error) {
      issues.push(`Cross-system communication validation failed: ${error.message}`);
    }
    
    return {
      success: issues.length === 0,
      details: issues.length === 0 ? 'Cross-system communication validation passed' : issues.join('; '),
      warnings: warnings
    };
  }
  
  /**
   * Helper methods
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }
  
  determineSystemHealth(results) {
    if (results.failed > 0) {
      return 'critical';
    } else if (results.warnings > 5) {
      return 'warning';
    } else if (results.warnings > 0) {
      return 'caution';
    } else {
      return 'excellent';
    }
  }
  
  generateValidationReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 SYSTEM VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`✅ Tests Passed: ${results.passed}`);
    console.log(`❌ Tests Failed: ${results.failed}`);
    console.log(`⚠️ Warnings: ${results.warnings}`);
    console.log(`⏱️ Total Time: ${results.totalTime}ms`);
    console.log(`🏥 System Health: ${results.systemHealth.toUpperCase()}`);
    console.log('='.repeat(80));
    
    // Detailed results
    for (const [testName, result] of results.details.entries()) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName}: ${result.details} (${result.duration}ms)`);
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`    ⚠️ Warning: ${warning}`);
        });
      }
    }
    
    console.log('='.repeat(80));
    
    // Performance recommendations
    if (results.systemHealth !== 'excellent') {
      console.log('🔧 RECOMMENDATIONS:');
      if (results.failed > 0) {
        console.log('• Critical issues detected - review failed tests immediately');
      }
      if (results.warnings > 0) {
        console.log('• Address warning conditions to improve system reliability');
      }
      console.log('='.repeat(80));
    }
    
    return results;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.SystemValidationTest = SystemValidationTest;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SystemValidationTest;
}