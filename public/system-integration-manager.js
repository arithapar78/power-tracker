/**
 * System Integration Manager
 * Coordinates all advanced systems and ensures optimal performance
 */

class SystemIntegrationManager {
  constructor() {
    console.log('[SystemIntegrationManager] Initializing system integration manager');
    
    this.systems = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
    this.performanceOptimizer = null;
    this.integrationTestSuite = null;
    
    // System health monitoring
    this.healthCheckInterval = null;
    this.healthStatus = new Map();
    
    // Performance metrics
    this.performanceMetrics = {
      systemStartupTime: 0,
      componentInitializationTimes: new Map(),
      integrationTestResults: null,
      lastHealthCheck: null
    };
    
    // System configuration
    this.config = {
      enablePerformanceOptimization: true,
      enableIntegrationTesting: true,
      enableHealthMonitoring: true,
      healthCheckInterval: 60000, // 1 minute
      performanceMonitoringInterval: 30000, // 30 seconds
      autoOptimization: true
    };
    
    // Initialize immediately
    this.initialize();
  }
  
  /**
   * Initialize all systems in optimal order
   */
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }
  
  async performInitialization() {
    const startTime = performance.now();
    console.log('[SystemIntegrationManager] 🚀 Starting system initialization');
    
    try {
      // Phase 1: Initialize performance optimization first
      if (this.config.enablePerformanceOptimization) {
        await this.initializePerformanceOptimization();
      }
      
      // Phase 2: Initialize core systems
      await this.initializeCoreSystems();
      
      // Phase 3: Initialize advanced features
      await this.initializeAdvancedFeatures();
      
      // Phase 4: Initialize monitoring and testing
      if (this.config.enableHealthMonitoring) {
        await this.initializeHealthMonitoring();
      }
      
      if (this.config.enableIntegrationTesting) {
        await this.initializeIntegrationTesting();
      }
      
      // Phase 5: Start system coordination
      await this.startSystemCoordination();
      
      const totalTime = performance.now() - startTime;
      this.performanceMetrics.systemStartupTime = totalTime;
      
      this.isInitialized = true;
      console.log(`[SystemIntegrationManager] ✅ System initialization completed in ${Math.round(totalTime)}ms`);
      
      // Run initial health check
      await this.performHealthCheck();
      
      return {
        success: true,
        initializationTime: totalTime,
        systemsInitialized: this.systems.size
      };
      
    } catch (error) {
      console.error('[SystemIntegrationManager] ❌ System initialization failed:', error);
      return {
        success: false,
        error: error.message,
        initializationTime: performance.now() - startTime
      };
    }
  }
  
  /**
   * Initialize performance optimization system
   */
  async initializePerformanceOptimization() {
    const startTime = performance.now();
    
    try {
      if (typeof PerformanceOptimizer !== 'undefined') {
        this.performanceOptimizer = new PerformanceOptimizer();
        this.registerSystem('performanceOptimizer', this.performanceOptimizer);
        
        console.log('[SystemIntegrationManager] PerformanceOptimizer initialized');
      } else {
        console.warn('[SystemIntegrationManager] PerformanceOptimizer class not available');
      }
    } catch (error) {
      console.error('[SystemIntegrationManager] Failed to initialize PerformanceOptimizer:', error);
    }
    
    const duration = performance.now() - startTime;
    this.performanceMetrics.componentInitializationTimes.set('performanceOptimizer', duration);
  }
  
  /**
   * Initialize core systems
   */
  async initializeCoreSystems() {
    const systems = [
      { name: 'tokenCounter', class: 'TokenCounter', dependencies: [] },
      { name: 'powerCalculator', class: 'AIModelPowerCalculator', dependencies: [] },
      { name: 'qualityScorer', class: 'OptimizationQualityScorer', dependencies: [] }
    ];
    
    for (const system of systems) {
      await this.initializeSystem(system);
    }
  }
  
  /**
   * Initialize advanced features
   */
  async initializeAdvancedFeatures() {
    // Initialize AdvancedPromptOptimizer with dependencies
    const startTime = performance.now();
    
    try {
      if (typeof AdvancedPromptOptimizer !== 'undefined' && this.getSystem('tokenCounter')) {
        const optimizer = new AdvancedPromptOptimizer(this.getSystem('tokenCounter'));
        
        // Apply performance optimizations if available
        if (this.performanceOptimizer) {
          this.applyOptimizationsToSystem(optimizer, 'promptOptimizer');
        }
        
        this.registerSystem('promptOptimizer', optimizer);
        console.log('[SystemIntegrationManager] AdvancedPromptOptimizer initialized');
      } else {
        console.warn('[SystemIntegrationManager] AdvancedPromptOptimizer or TokenCounter not available');
      }
    } catch (error) {
      console.error('[SystemIntegrationManager] Failed to initialize AdvancedPromptOptimizer:', error);
    }
    
    const duration = performance.now() - startTime;
    this.performanceMetrics.componentInitializationTimes.set('promptOptimizer', duration);
  }
  
  /**
   * Initialize health monitoring
   */
  async initializeHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
    
    console.log('[SystemIntegrationManager] Health monitoring initialized');
  }
  
  /**
   * Initialize integration testing
   */
  async initializeIntegrationTesting() {
    const startTime = performance.now();
    
    try {
      if (typeof IntegrationTestSuite !== 'undefined') {
        this.integrationTestSuite = new IntegrationTestSuite();
        this.registerSystem('integrationTestSuite', this.integrationTestSuite);
        
        // Run initial test suite
        if (this.config.enableIntegrationTesting) {
          console.log('[SystemIntegrationManager] Running initial integration tests...');
          const testResults = await this.integrationTestSuite.runAllTests();
          this.performanceMetrics.integrationTestResults = testResults;
          
          if (testResults.summary.failedTests > 0) {
            console.warn(`[SystemIntegrationManager] ⚠️ ${testResults.summary.failedTests} integration tests failed`);
          } else {
            console.log('[SystemIntegrationManager] ✅ All integration tests passed');
          }
        }
      } else {
        console.warn('[SystemIntegrationManager] IntegrationTestSuite class not available');
      }
    } catch (error) {
      console.error('[SystemIntegrationManager] Failed to initialize integration testing:', error);
    }
    
    const duration = performance.now() - startTime;
    this.performanceMetrics.componentInitializationTimes.set('integrationTestSuite', duration);
  }
  
  /**
   * Start system coordination
   */
  async startSystemCoordination() {
    // Set up inter-system communication
    this.setupInterSystemCommunication();
    
    // Start performance monitoring
    if (this.performanceOptimizer && this.config.autoOptimization) {
      this.startAutoOptimization();
    }
    
    // Setup error handling coordination
    this.setupErrorHandlingCoordination();
    
    console.log('[SystemIntegrationManager] System coordination started');
  }
  
  /**
   * Generic system initialization
   */
  async initializeSystem(systemConfig) {
    const startTime = performance.now();
    
    try {
      const SystemClass = window[systemConfig.class];
      if (!SystemClass) {
        console.warn(`[SystemIntegrationManager] ${systemConfig.class} not available`);
        return;
      }
      
      // Check dependencies
      for (const dep of systemConfig.dependencies) {
        if (!this.getSystem(dep)) {
          throw new Error(`Dependency ${dep} not available for ${systemConfig.name}`);
        }
      }
      
      // Create system instance
      const systemInstance = new SystemClass();
      
      // Apply performance optimizations
      if (this.performanceOptimizer) {
        this.applyOptimizationsToSystem(systemInstance, systemConfig.name);
      }
      
      this.registerSystem(systemConfig.name, systemInstance);
      console.log(`[SystemIntegrationManager] ${systemConfig.name} initialized`);
      
    } catch (error) {
      console.error(`[SystemIntegrationManager] Failed to initialize ${systemConfig.name}:`, error);
    }
    
    const duration = performance.now() - startTime;
    this.performanceMetrics.componentInitializationTimes.set(systemConfig.name, duration);
  }
  
  /**
   * Apply performance optimizations to a system
   */
  applyOptimizationsToSystem(system, systemName) {
    if (!this.performanceOptimizer) return;
    
    try {
      switch (systemName) {
        case 'tokenCounter':
          this.optimizeTokenCounter(system);
          break;
        case 'promptOptimizer':
          this.optimizePromptOptimizer(system);
          break;
        default:
          this.applyGeneralOptimizations(system, systemName);
      }
    } catch (error) {
      console.error(`[SystemIntegrationManager] Failed to apply optimizations to ${systemName}:`, error);
    }
  }
  
  /**
   * Optimize TokenCounter system
   */
  optimizeTokenCounter(tokenCounter) {
    const optimizations = this.performanceOptimizer.optimizeTokenCounting();
    
    // Cache token results
    const originalCountTokensGPT = tokenCounter.countTokensGPT.bind(tokenCounter);
    tokenCounter.countTokensGPT = optimizations.cacheTokenResults(originalCountTokensGPT);
    
    // Optimize text preprocessing
    const originalAnalyzeTokens = tokenCounter.analyzeTokens.bind(tokenCounter);
    tokenCounter.analyzeTokens = (text, model) => {
      const preprocessedText = optimizations.optimizeTextPreprocessing(text);
      return originalAnalyzeTokens(preprocessedText, model);
    };
    
    console.log('[SystemIntegrationManager] TokenCounter optimizations applied');
  }
  
  /**
   * Optimize PromptOptimizer system
   */
  optimizePromptOptimizer(optimizer) {
    const optimizations = this.performanceOptimizer.optimizePromptOptimization();
    
    // Apply worker thread optimization for heavy operations
    if (optimizer.optimizePromptAdvanced) {
      const originalOptimize = optimizer.optimizePromptAdvanced.bind(optimizer);
      optimizer.optimizePromptAdvanced = optimizations.useWorkerThread(originalOptimize);
    }
    
    console.log('[SystemIntegrationManager] PromptOptimizer optimizations applied');
  }
  
  /**
   * Apply general optimizations
   */
  applyGeneralOptimizations(system, systemName) {
    // Add performance monitoring to key methods
    const keyMethods = ['calculate', 'analyze', 'assess', 'optimize', 'process'];
    
    for (const methodName of keyMethods) {
      if (typeof system[methodName] === 'function') {
        this.wrapMethodWithPerformanceMonitoring(system, methodName, systemName);
      }
    }
  }
  
  /**
   * Wrap method with performance monitoring
   */
  wrapMethodWithPerformanceMonitoring(system, methodName, systemName) {
    const originalMethod = system[methodName].bind(system);
    
    system[methodName] = (...args) => {
      const start = performance.now();
      const result = originalMethod(...args);
      const duration = performance.now() - start;
      
      this.performanceOptimizer.recordMetric(`${systemName}.${methodName}`, duration);
      
      return result;
    };
  }
  
  /**
   * Setup inter-system communication
   */
  setupInterSystemCommunication() {
    // Event system for inter-component communication
    this.eventBus = new EventTarget();
    
    // Register systems with event bus
    for (const [name, system] of this.systems.entries()) {
      if (typeof system.setEventBus === 'function') {
        system.setEventBus(this.eventBus);
      }
    }
    
    // Setup common event handlers
    this.eventBus.addEventListener('performanceWarning', (event) => {
      console.warn('[SystemIntegrationManager] Performance warning:', event.detail);
      this.handlePerformanceWarning(event.detail);
    });
    
    this.eventBus.addEventListener('systemError', (event) => {
      console.error('[SystemIntegrationManager] System error:', event.detail);
      this.handleSystemError(event.detail);
    });
  }
  
  /**
   * Start auto-optimization
   */
  startAutoOptimization() {
    setInterval(() => {
      if (this.performanceOptimizer) {
        const stats = this.performanceOptimizer.getPerformanceStats();
        
        // Apply optimizations based on performance data
        if (stats.recommendations.length > 0) {
          console.log('[SystemIntegrationManager] Applying auto-optimizations based on performance data');
          this.applyAutoOptimizations(stats.recommendations);
        }
      }
    }, this.config.performanceMonitoringInterval);
  }
  
  /**
   * Perform health check on all systems
   */
  async performHealthCheck() {
    const healthCheck = {
      timestamp: Date.now(),
      systems: new Map(),
      overall: 'healthy'
    };
    
    for (const [name, system] of this.systems.entries()) {
      try {
        const systemHealth = await this.checkSystemHealth(name, system);
        healthCheck.systems.set(name, systemHealth);
        
        if (systemHealth.status !== 'healthy') {
          healthCheck.overall = 'warning';
        }
      } catch (error) {
        healthCheck.systems.set(name, {
          status: 'error',
          error: error.message
        });
        healthCheck.overall = 'error';
      }
    }
    
    this.healthStatus = healthCheck;
    this.performanceMetrics.lastHealthCheck = healthCheck;
    
    if (healthCheck.overall !== 'healthy') {
      console.warn('[SystemIntegrationManager] System health check found issues:', healthCheck);
    }
    
    return healthCheck;
  }
  
  /**
   * Check individual system health
   */
  async checkSystemHealth(name, system) {
    const health = {
      status: 'healthy',
      checks: []
    };
    
    // Basic availability check
    if (!system) {
      health.status = 'error';
      health.checks.push({ name: 'availability', status: 'failed', message: 'System not available' });
      return health;
    }
    
    // Memory usage check
    if (this.performanceOptimizer) {
      const memoryUsage = this.performanceOptimizer.getCurrentMemoryUsage();
      if (memoryUsage > 100) { // 100MB threshold
        health.status = 'warning';
        health.checks.push({ name: 'memory', status: 'warning', message: `High memory usage: ${memoryUsage}MB` });
      } else {
        health.checks.push({ name: 'memory', status: 'passed', message: `Memory usage: ${memoryUsage}MB` });
      }
    }
    
    // Performance check
    if (this.performanceOptimizer && this.performanceOptimizer.metrics.has(name)) {
      const metrics = this.performanceOptimizer.metrics.get(name);
      const averageResponseTime = metrics.reduce((a, b) => a + b.value, 0) / metrics.length;
      
      if (averageResponseTime > 1000) { // 1 second threshold
        health.status = 'warning';
        health.checks.push({ name: 'performance', status: 'warning', message: `Slow response time: ${averageResponseTime}ms` });
      } else {
        health.checks.push({ name: 'performance', status: 'passed', message: `Response time: ${averageResponseTime}ms` });
      }
    }
    
    // System-specific health checks
    if (typeof system.healthCheck === 'function') {
      try {
        const systemSpecificHealth = await system.healthCheck();
        health.checks.push(...systemSpecificHealth.checks);
        if (systemSpecificHealth.status !== 'healthy') {
          health.status = systemSpecificHealth.status;
        }
      } catch (error) {
        health.status = 'error';
        health.checks.push({ name: 'systemSpecific', status: 'failed', message: error.message });
      }
    }
    
    return health;
  }
  
  /**
   * Handle performance warnings
   */
  handlePerformanceWarning(warning) {
    if (this.config.autoOptimization && this.performanceOptimizer) {
      // Apply automatic optimizations
      console.log('[SystemIntegrationManager] Applying automatic optimization for performance warning');
      
      switch (warning.type) {
        case 'highMemoryUsage':
          this.performanceOptimizer.optimizeMemoryUsage();
          break;
        case 'slowResponse':
          // Enable caching for the slow system
          if (warning.system && this.systems.has(warning.system)) {
            this.enableCachingForSystem(warning.system);
          }
          break;
      }
    }
  }
  
  /**
   * Get system performance report
   */
  getPerformanceReport() {
    const report = {
      systemInfo: {
        isInitialized: this.isInitialized,
        systemsRegistered: this.systems.size,
        startupTime: this.performanceMetrics.systemStartupTime
      },
      
      componentInitialization: Object.fromEntries(
        this.performanceMetrics.componentInitializationTimes
      ),
      
      healthStatus: this.healthStatus ? {
        overall: this.healthStatus.overall,
        timestamp: this.healthStatus.timestamp,
        systemCount: this.healthStatus.systems.size
      } : null,
      
      integrationTests: this.performanceMetrics.integrationTestResults ? {
        totalTests: this.performanceMetrics.integrationTestResults.summary.totalTests,
        passedTests: this.performanceMetrics.integrationTestResults.summary.passedTests,
        failedTests: this.performanceMetrics.integrationTestResults.summary.failedTests,
        totalDuration: this.performanceMetrics.integrationTestResults.summary.totalDuration
      } : null,
      
      performanceOptimizer: this.performanceOptimizer ? 
        this.performanceOptimizer.getPerformanceStats() : null
    };
    
    return report;
  }
  
  /**
   * System management methods
   */
  registerSystem(name, system) {
    this.systems.set(name, system);
    console.log(`[SystemIntegrationManager] System '${name}' registered`);
  }
  
  getSystem(name) {
    return this.systems.get(name);
  }
  
  getAllSystems() {
    return new Map(this.systems);
  }
  
  /**
   * Cleanup and shutdown
   */
  shutdown() {
    console.log('[SystemIntegrationManager] Shutting down system integration manager');
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Shutdown performance optimizer
    if (this.performanceOptimizer) {
      this.performanceOptimizer.cleanup();
    }
    
    // Cleanup systems
    for (const [name, system] of this.systems.entries()) {
      if (typeof system.cleanup === 'function') {
        try {
          system.cleanup();
        } catch (error) {
          console.error(`[SystemIntegrationManager] Error cleaning up ${name}:`, error);
        }
      }
    }
    
    this.systems.clear();
    this.isInitialized = false;
    
    console.log('[SystemIntegrationManager] Shutdown completed');
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.SystemIntegrationManager = SystemIntegrationManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SystemIntegrationManager;
}