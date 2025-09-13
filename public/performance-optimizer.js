/**
 * Performance Optimization System
 * Monitors and optimizes performance across all advanced systems
 */

class PerformanceOptimizer {
  constructor() {
    console.log('[PerformanceOptimizer] Initializing performance optimization system');
    
    this.metrics = new Map();
    this.optimizations = new Map();
    this.thresholds = {
      tokenCounting: { max: 100, target: 50 },         // ms
      promptOptimization: { max: 3000, target: 1500 }, // ms
      uiUpdate: { max: 50, target: 16 },              // ms (60fps)
      memoryUsage: { max: 100, target: 50 },          // MB
      qualityAssessment: { max: 500, target: 200 }    // ms
    };
    
    // Performance monitoring intervals
    this.monitoringInterval = null;
    this.optimizationInterval = null;
    
    // Cache management
    this.cacheManager = new CacheManager();
    
    // Debouncing utilities
    this.debouncers = new Map();
    
    // Performance observers
    this.initializePerformanceObservers();
    
    // Memory management
    this.initializeMemoryManagement();
    
    // Startup performance optimization
    this.startupTime = Date.now();
    this.optimizeStartupPerformance();
  }
  
  /**
   * Initialize performance observers for automatic monitoring
   */
  initializePerformanceObservers() {
    try {
      // Performance Observer for measuring function execution times
      if ('PerformanceObserver' in window) {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric(entry.name, entry.duration, 'timing');
            
            // Auto-optimize if performance is poor
            if (entry.duration > this.getThreshold(entry.name).max) {
              this.scheduleOptimization(entry.name, entry.duration);
            }
          }
        });
        
        this.performanceObserver.observe({ entryTypes: ['measure', 'mark'] });
        console.log('[PerformanceOptimizer] Performance observers initialized');
      }
    } catch (error) {
      console.warn('[PerformanceOptimizer] Performance Observer not available:', error);
    }
  }
  
  /**
   * Initialize memory management system
   */
  initializeMemoryManagement() {
    // Monitor memory usage every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.monitorMemoryUsage();
      this.optimizeMemoryUsage();
    }, 30000);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }
  
  /**
   * Optimize startup performance
   */
  optimizeStartupPerformance() {
    // Defer non-critical initializations
    requestIdleCallback(() => {
      this.initializeLazyLoading();
      this.preloadCriticalResources();
    });
    
    // Optimize initial render
    requestAnimationFrame(() => {
      this.optimizeInitialRender();
    });
  }
  
  /**
   * Record performance metrics
   */
  recordMetric(name, value, type = 'timing') {
    const metric = {
      value,
      type,
      timestamp: Date.now(),
      category: this.categorizeMetric(name)
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push(metric);
    
    // Keep only recent metrics (last 100 entries)
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Trigger optimization if needed
    this.checkOptimizationTriggers(name, value);
  }
  
  /**
   * Optimize token counting performance
   */
  optimizeTokenCounting() {
    console.log('[PerformanceOptimizer] Optimizing token counting performance');
    
    return {
      // Cache token results for identical text
      cacheTokenResults: (originalFunction) => {
        return (text, model) => {
          const cacheKey = `token_${model}_${this.hashString(text)}`;
          const cached = this.cacheManager.get(cacheKey);
          
          if (cached) {
            return cached;
          }
          
          const result = originalFunction(text, model);
          this.cacheManager.set(cacheKey, result, 300000); // Cache for 5 minutes
          return result;
        };
      },
      
      // Batch token counting operations
      batchTokenCounting: (requests) => {
        return new Promise((resolve) => {
          const results = new Map();
          const processed = [];
          
          // Process in batches of 10
          const batchSize = 10;
          const batches = [];
          
          for (let i = 0; i < requests.length; i += batchSize) {
            batches.push(requests.slice(i, i + batchSize));
          }
          
          const processBatch = async (batch) => {
            const promises = batch.map(async (request) => {
              const start = performance.now();
              const result = request.tokenCounter.countTokensGPT(request.text, request.model);
              const duration = performance.now() - start;
              
              this.recordMetric('batchTokenCounting', duration);
              return { request, result };
            });
            
            return Promise.all(promises);
          };
          
          // Process batches sequentially to avoid overwhelming
          const processBatches = async () => {
            for (const batch of batches) {
              const batchResults = await processBatch(batch);
              processed.push(...batchResults);
              
              // Small delay between batches
              await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            resolve(processed);
          };
          
          processBatches();
        });
      },
      
      // Optimize text preprocessing
      optimizeTextPreprocessing: (text) => {
        // Remove excessive whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        // Cache preprocessed text
        const cacheKey = `preprocessed_${this.hashString(text)}`;
        const cached = this.cacheManager.get(cacheKey);
        
        if (cached) {
          return cached;
        }
        
        // Apply optimizations
        const optimized = text
          .replace(/\s+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        this.cacheManager.set(cacheKey, optimized, 600000); // Cache for 10 minutes
        return optimized;
      }
    };
  }
  
  /**
   * Optimize prompt optimization performance
   */
  optimizePromptOptimization() {
    console.log('[PerformanceOptimizer] Optimizing prompt optimization performance');
    
    return {
      // Use worker threads for heavy optimization
      useWorkerThread: (optimizationFunction) => {
        if ('Worker' in window) {
          return (prompt, options) => {
            return new Promise((resolve, reject) => {
              const worker = new Worker(URL.createObjectURL(new Blob([`
                // Worker code for optimization
                self.onmessage = function(e) {
                  const { prompt, options } = e.data;
                  
                  try {
                    // Simplified optimization for worker
                    const optimized = prompt
                      .replace(/please|thank you|very|really/gi, '')
                      .replace(/\\s+/g, ' ')
                      .trim();
                    
                    const reduction = prompt.length - optimized.length;
                    
                    self.postMessage({
                      success: true,
                      optimized,
                      reduction: { characters: reduction }
                    });
                  } catch (error) {
                    self.postMessage({
                      success: false,
                      error: error.message
                    });
                  }
                };
              `], { type: 'application/javascript' })));
              
              worker.postMessage({ prompt, options });
              worker.onmessage = (e) => {
                worker.terminate();
                resolve(e.data);
              };
              
              worker.onerror = (error) => {
                worker.terminate();
                reject(error);
              };
            });
          };
        }
        
        return optimizationFunction; // Fallback to main thread
      },
      
      // Incremental optimization
      incrementalOptimization: (prompt, options) => {
        const chunks = this.chunkText(prompt, 500); // 500 char chunks
        const results = [];
        
        return new Promise(async (resolve) => {
          for (const chunk of chunks) {
            const start = performance.now();
            const optimized = await this.optimizeChunk(chunk, options);
            const duration = performance.now() - start;
            
            this.recordMetric('incrementalOptimization', duration);
            results.push(optimized);
            
            // Yield control between chunks
            await new Promise(resolve => setTimeout(resolve, 0));
          }
          
          resolve({
            success: true,
            optimized: results.join(' '),
            incremental: true
          });
        });
      }
    };
  }
  
  /**
   * Optimize UI update performance
   */
  optimizeUIUpdates() {
    console.log('[PerformanceOptimizer] Optimizing UI update performance');
    
    return {
      // Batch DOM updates
      batchDOMUpdates: (updates) => {
        const batch = [];
        
        // Collect all updates
        for (const update of updates) {
          batch.push(update);
        }
        
        // Apply all updates in single frame
        requestAnimationFrame(() => {
          const start = performance.now();
          
          batch.forEach(update => {
            update();
          });
          
          const duration = performance.now() - start;
          this.recordMetric('batchDOMUpdates', duration);
        });
      },
      
      // Debounced UI updates
      debouncedUpdate: (elementId, updateFunction, delay = 300) => {
        const key = `ui_update_${elementId}`;
        
        if (this.debouncers.has(key)) {
          clearTimeout(this.debouncers.get(key));
        }
        
        const timeoutId = setTimeout(() => {
          const start = performance.now();
          updateFunction();
          const duration = performance.now() - start;
          
          this.recordMetric('debouncedUIUpdate', duration);
          this.debouncers.delete(key);
        }, delay);
        
        this.debouncers.set(key, timeoutId);
      },
      
      // Virtual scrolling for large lists
      virtualScrolling: (containerId, items, itemHeight = 50) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        let scrollTop = container.scrollTop;
        let startIndex = Math.floor(scrollTop / itemHeight);
        let endIndex = Math.min(startIndex + visibleCount, items.length);
        
        const visibleItems = items.slice(startIndex, endIndex);
        
        // Update container content
        const start = performance.now();
        container.innerHTML = '';
        
        visibleItems.forEach((item, index) => {
          const element = document.createElement('div');
          element.style.height = `${itemHeight}px`;
          element.style.position = 'absolute';
          element.style.top = `${(startIndex + index) * itemHeight}px`;
          element.innerHTML = item.content;
          container.appendChild(element);
        });
        
        const duration = performance.now() - start;
        this.recordMetric('virtualScrolling', duration);
      }
    };
  }
  
  /**
   * Monitor memory usage and optimize
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      const memoryUsageMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      
      this.recordMetric('memoryUsage', memoryUsageMB, 'memory');
      
      if (memoryUsageMB > this.thresholds.memoryUsage.max) {
        console.warn('[PerformanceOptimizer] High memory usage detected:', memoryUsageMB + 'MB');
        this.optimizeMemoryUsage();
      }
    }
  }
  
  /**
   * Optimize memory usage
   */
  optimizeMemoryUsage() {
    console.log('[PerformanceOptimizer] Optimizing memory usage');
    
    // Clear old cache entries
    this.cacheManager.cleanup();
    
    // Clear old metrics
    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.length > 50) {
        this.metrics.set(key, metrics.slice(-25)); // Keep only recent 25 entries
      }
    }
    
    // Clear completed optimizations
    const now = Date.now();
    for (const [key, optimization] of this.optimizations.entries()) {
      if (now - optimization.timestamp > 300000) { // 5 minutes
        this.optimizations.delete(key);
      }
    }
    
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }
  
  /**
   * Initialize lazy loading for non-critical components
   */
  initializeLazyLoading() {
    // Lazy load advanced panels
    const lazyPanels = [
      'qualityAssessmentPanel',
      'optimizationInsightsPanel',
      'powerSavingsPanel'
    ];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadPanel(entry.target.id);
          observer.unobserve(entry.target);
        }
      });
    });
    
    lazyPanels.forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) {
        observer.observe(panel);
      }
    });
  }
  
  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {
      metrics: {},
      summary: {
        totalMetrics: 0,
        averageResponseTime: 0,
        memoryUsage: this.getCurrentMemoryUsage(),
        cacheHitRate: this.cacheManager.getHitRate(),
        optimizationsApplied: this.optimizations.size
      },
      recommendations: []
    };
    
    // Calculate averages for each metric
    for (const [name, metrics] of this.metrics.entries()) {
      const values = metrics.map(m => m.value);
      stats.metrics[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        recent: values.slice(-10) // Last 10 values
      };
      
      stats.summary.totalMetrics += values.length;
    }
    
    // Calculate overall average response time
    const allTimings = Array.from(this.metrics.values())
      .flat()
      .filter(m => m.type === 'timing')
      .map(m => m.value);
    
    if (allTimings.length > 0) {
      stats.summary.averageResponseTime = allTimings.reduce((a, b) => a + b, 0) / allTimings.length;
    }
    
    // Generate recommendations
    stats.recommendations = this.generatePerformanceRecommendations();
    
    return stats;
  }
  
  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations() {
    const recommendations = [];
    
    for (const [name, metrics] of this.metrics.entries()) {
      const average = metrics.reduce((a, b) => a + b.value, 0) / metrics.length;
      const threshold = this.getThreshold(name);
      
      if (average > threshold.max) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          metric: name,
          current: Math.round(average),
          target: threshold.target,
          suggestion: `${name} is taking ${Math.round(average)}ms on average. Consider optimization.`
        });
      } else if (average > threshold.target) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          metric: name,
          current: Math.round(average),
          target: threshold.target,
          suggestion: `${name} could be optimized further.`
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Helper methods
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  chunkText(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  getThreshold(metricName) {
    for (const [key, threshold] of Object.entries(this.thresholds)) {
      if (metricName.toLowerCase().includes(key.toLowerCase())) {
        return threshold;
      }
    }
    return { max: 1000, target: 500 }; // Default
  }
  
  categorizeMetric(name) {
    if (name.includes('token')) return 'tokenProcessing';
    if (name.includes('optimization')) return 'optimization';
    if (name.includes('ui') || name.includes('dom')) return 'userInterface';
    if (name.includes('memory')) return 'memory';
    return 'general';
  }
  
  scheduleOptimization(metricName, value) {
    const key = `optimization_${metricName}`;
    
    if (!this.optimizations.has(key)) {
      this.optimizations.set(key, {
        metricName,
        value,
        timestamp: Date.now(),
        attempts: 0
      });
      
      // Schedule optimization for next idle period
      requestIdleCallback(() => {
        this.applyOptimization(key);
      });
    }
  }
  
  applyOptimization(key) {
    const optimization = this.optimizations.get(key);
    if (!optimization) return;
    
    console.log(`[PerformanceOptimizer] Applying optimization for ${optimization.metricName}`);
    
    // Apply specific optimizations based on metric type
    switch (optimization.metricName) {
      case 'tokenCounting':
        // Enable token caching
        this.cacheManager.increaseCacheSize('tokens');
        break;
        
      case 'promptOptimization':
        // Enable incremental optimization
        this.enableIncrementalOptimization();
        break;
        
      case 'uiUpdate':
        // Enable UI batching
        this.enableUIBatching();
        break;
    }
    
    optimization.attempts++;
    
    if (optimization.attempts >= 3) {
      this.optimizations.delete(key);
    }
  }
  
  getCurrentMemoryUsage() {
    if ('memory' in performance) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }
  
  cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Clear all debounce timers
    for (const timeoutId of this.debouncers.values()) {
      clearTimeout(timeoutId);
    }
    this.debouncers.clear();
    
    console.log('[PerformanceOptimizer] Cleanup completed');
  }
}

/**
 * Cache Manager for performance optimization
 */
class CacheManager {
  constructor() {
    this.caches = new Map();
    this.stats = { hits: 0, misses: 0 };
    this.defaultTTL = 300000; // 5 minutes
    
    // Cleanup interval
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }
  
  get(key) {
    const cached = this.caches.get(key);
    
    if (!cached) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > cached.expires) {
      this.caches.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    cached.lastAccessed = Date.now();
    return cached.value;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    this.caches.set(key, {
      value,
      expires: Date.now() + ttl,
      created: Date.now(),
      lastAccessed: Date.now(),
      size: this.calculateSize(value)
    });
  }
  
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, cached] of this.caches.entries()) {
      // Remove expired entries
      if (now > cached.expires) {
        this.caches.delete(key);
        cleaned++;
      }
      // Remove least recently used if cache is too large
      else if (this.caches.size > 1000 && (now - cached.lastAccessed) > 600000) {
        this.caches.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[CacheManager] Cleaned ${cleaned} cache entries`);
    }
  }
  
  getHitRate() {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;
  }
  
  calculateSize(value) {
    return JSON.stringify(value).length;
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
  window.CacheManager = CacheManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceOptimizer, CacheManager };
}