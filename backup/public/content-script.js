// ===========================
// Energy Tracking Content Script - Protected against redeclaration
// ===========================
(() => {
  // Better protection against multiple execution
  if (window.__energyTrackerContentLoaded) {
    // Clean up existing instances
    if (window.__energyTrackerInstance) {
      window.__energyTrackerInstance.cleanup();
    }
    if (window.__energyTipInstance) {
      window.__energyTipInstance.cleanup();
    }
  }

  /**
   * BackoffManager handles exponential backoff with jitter to prevent thundering herd problems
   * and race conditions from concurrent requests.
   */
  if (typeof window.BackoffManager === 'undefined') {
    window.BackoffManager = class BackoffManager {
      constructor(options = {}) {
        this.initialDelayMs = options.initialDelayMs || 500;
        this.maxDelayMs = options.maxDelayMs || 8000;
        this.maxRetries = options.maxRetries || 3;
        this.jitterFactor = options.jitterFactor || 0.1; // 10% jitter
        this.multiplier = options.multiplier || 2;
        
        this.reset();
      }

      reset() {
        this.currentDelayMs = this.initialDelayMs;
        this.retryCount = 0;
      }

      /**
       * Get the next backoff delay with jitter to prevent synchronized retries
       */
      getNextDelay() {
        if (this.retryCount >= this.maxRetries) {
          return null; // No more retries
        }

        const baseDelay = this.currentDelayMs;
        
        // Add jitter: random variation between -jitterFactor and +jitterFactor
        const jitterRange = baseDelay * this.jitterFactor;
        const jitter = (Math.random() * 2 - 1) * jitterRange; // -jitterRange to +jitterRange
        const delayWithJitter = Math.max(0, baseDelay + jitter);


        // Update state for next retry
        this.retryCount++;
        this.currentDelayMs = Math.min(this.currentDelayMs * this.multiplier, this.maxDelayMs);

        return delayWithJitter;
      }

      canRetry() {
        return this.retryCount < this.maxRetries;
      }

      getRetryInfo() {
        return {
          retryCount: this.retryCount,
          maxRetries: this.maxRetries,
          currentDelay: this.currentDelayMs,
          canRetry: this.canRetry()
        };
      }
    };
  }

  // Create singleton instance to maintain backoff state across the content script
  if (typeof window.__energyBackoffManager === 'undefined') {
    window.__energyBackoffManager = new window.BackoffManager();
  }

  if (typeof window.resetBackoff === 'undefined') {
    window.resetBackoff = function resetBackoff() {
      window.__energyBackoffManager.reset();
    };
  }

  if (typeof window.sleep === 'undefined') {
    window.sleep = function sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    };
  }

  /**
   * Error classification for different retry strategies
   */
  if (typeof window.ErrorClassification === 'undefined') {
    window.ErrorClassification = {
      EXTENSION_INVALIDATED: 'extension_invalidated',
      TRANSIENT_CONNECTION: 'transient_connection',
      PERMANENT_ERROR: 'permanent_error'
    };
  }

  if (typeof window.classifyError === 'undefined') {
    window.classifyError = function classifyError(error) {
      const text = String(error?.message || error);
      
      // Extension context issues - should retry with backoff
      const invalidated =
        text.includes('Extension context invalidated') ||
        text.includes('Receiving end does not exist') ||
        text.includes('The message port closed before a response was received') ||
        text.includes('Could not establish connection') ||
        text.includes('No receiving end');
        
      if (invalidated) {
        return window.ErrorClassification.EXTENSION_INVALIDATED;
      }
      
      // Transient network/connection issues - should retry with shorter backoff
      const transient =
        text.includes('Network error') ||
        text.includes('timeout') ||
        text.includes('Service worker') ||
        text.includes('temporarily unavailable');
        
      if (transient) {
        return window.ErrorClassification.TRANSIENT_CONNECTION;
      }
      
      // Permanent errors - should not retry
      return window.ErrorClassification.PERMANENT_ERROR;
    };
  }

  if (typeof window.safeSendMessage === 'undefined') {
    window.safeSendMessage = async function safeSendMessage(msg) {
      // Enhanced extension context validation
      if (!window.isExtensionContextValid()) {
        return null;
      }

      // Try a quick liveness ping with enhanced error handling
      try {
        const pingResult = await chrome.runtime.sendMessage({ type: 'PING' });
        if (!pingResult?.success) {
        }
      } catch (pingError) {
        // Check if this indicates context invalidation
        if (window.classifyError(pingError) === window.ErrorClassification.EXTENSION_INVALIDATED) {
          return null;
        }
      }

      // Initial attempt with enhanced error handling
      try {
        const result = await chrome.runtime.sendMessage(msg);
        window.__energyBackoffManager.reset(); // Reset backoff on success
        return result;
      } catch (initialError) {
        const errorType = window.classifyError(initialError);
        
        // Return null for invalidated context instead of retrying
        if (errorType === window.ErrorClassification.EXTENSION_INVALIDATED) {
          return null;
        }
        
        // Don't retry permanent errors
        if (errorType === window.ErrorClassification.PERMANENT_ERROR) {
          return null; // Return null instead of throwing
        }

        // Retry with backoff for transient errors only
        while (window.__energyBackoffManager.canRetry()) {
          const delay = window.__energyBackoffManager.getNextDelay();
          if (delay === null) {
            break;
          }

          await window.sleep(delay);

          // Check context validity before retry
          if (!window.isExtensionContextValid()) {
            return null;
          }

          try {
            const result = await chrome.runtime.sendMessage(msg);
            window.__energyBackoffManager.reset(); // Reset backoff on success
            return result;
          } catch (retryError) {
            const retryErrorType = window.classifyError(retryError);
            
            // Return null for any context invalidation
            if (retryErrorType === window.ErrorClassification.EXTENSION_INVALIDATED) {
              return null;
            }
            
            // If error type changed to permanent, stop retrying
            if (retryErrorType === window.ErrorClassification.PERMANENT_ERROR) {
              return null; // Return null instead of throwing
            }
          }
        }

        // All retries exhausted
        return null; // Return null instead of throwing
      }
    };
  }

  // Enhanced extension context validation
  if (typeof window.isExtensionContextValid === 'undefined') {
    window.isExtensionContextValid = function isExtensionContextValid() {
      try {
        // Check multiple indicators of valid extension context
        return !!(
          typeof chrome !== 'undefined' &&
          chrome.runtime &&
          chrome.runtime.id &&
          !chrome.runtime.lastError
        );
      } catch (error) {
        return false;
      }
    };
  }

  // ---- Settings fetch (optional, but lets us honor user choices) ----
  if (typeof window.getSettingsOrDefault === 'undefined') {
    window.getSettingsOrDefault = async function getSettingsOrDefault() {
      const defaults = {
        trackingEnabled: true,
        notificationsEnabled: true,
        energyThreshold: 75,
        dataRetentionDays: 30,
        samplingInterval: 5000
      };
      try {
        const res = await window.safeSendMessage({ type: 'GET_SETTINGS' });
        return res?.success ? { ...defaults, ...res.settings } : defaults;
      } catch { return defaults; }
    };
  }

  // ===========================
  // Main Monitor
  // ===========================
  if (typeof window.PageEnergyMonitor === 'undefined') {
    window.PageEnergyMonitor = class PageEnergyMonitor {
  constructor() {
    this.isInitialized = false;

    // Observers
    this.mutationObserver = null;
    this.performanceObserver = null;

    // Timers
    this.intervalId = null;
    this.samplingInterval = 5000; // default; can be overridden by settings
    this.hiddenInterval = 30000;  // slow down when tab hidden

    // Metric cache between sends
    this.lastMetrics = {};

    // Bindings
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageUnload = this.handlePageUnload.bind(this);

    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    // Wait for DOM
    if (document.readyState === 'loading') {
      await new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }


    // Load settings from background (if available)
    const settings = await window.getSettingsOrDefault();
    this.samplingInterval = Number(settings.samplingInterval) || 5000;

    // If tracking is disabled, still initialize but with reduced functionality
    if (!settings.trackingEnabled) {
      // Still start monitoring but with longer intervals and basic metrics only
      this.samplingInterval = Math.max(this.samplingInterval, 15000); // At least 15 seconds
    }

    try {
      this.setupPerformanceObserver();
      this.setupMutationObserver();
      this.startPeriodicMonitoring();

      // Page lifecycle hooks
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('beforeunload', this.handlePageUnload);

      this.isInitialized = true;
    } catch (error) {
    }
  }

  // ---- Observers ----
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe these types when available
      ['navigation', 'resource', 'paint', 'measure'].forEach((type) => {
        try {
          this.performanceObserver.observe({ entryTypes: [type] });
        } catch {
          // some entry types may not be supported in all contexts
        }
      });
    } catch (error) {
    }
  }

  setupMutationObserver() {
    if (!('MutationObserver' in window) || !document.body) {
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      this.processDOMMutations(mutations);
    });

    // Observe global DOM activity
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false
    });
  }

  // ---- Periodic monitoring ----
  startPeriodicMonitoring() {
    this.stopPeriodicMonitoring(); // clean old timer if any
    this.collectAndSendMetrics();  // immediate sample

    const interval = document.hidden ? this.hiddenInterval : this.samplingInterval;
    this.intervalId = setInterval(() => {
      this.collectAndSendMetrics();
    }, interval);
  }

  stopPeriodicMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ---- Entry processing ----
  processPerformanceEntries(entries) {
    // Clear old entries periodically
    if (!this.lastCleanup || Date.now() - this.lastCleanup > 60000) {
      this.cleanupOldMetrics();
      this.lastCleanup = Date.now();
    }
    
    entries.forEach((entry) => {
      // Process entries with size limits
      this.processEntryWithLimits(entry);
    });
  }

  processEntryWithLimits(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.lastMetrics.navigation = {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          domInteractive: entry.domInteractive - entry.navigationStart,
          totalLoadTime: entry.loadEventEnd - entry.navigationStart
        };
        break;

      case 'resource':
        if (!this.lastMetrics.resources) {
          this.lastMetrics.resources = {
            totalRequests: 0,
            totalSize: 0,
            totalDuration: 0,
            types: {},
            entries: []
          };
        }

        const type = this.getResourceType(entry.name, entry.initiatorType);
        this.lastMetrics.resources.totalRequests++;
        this.lastMetrics.resources.totalSize += entry.transferSize || 0;
        this.lastMetrics.resources.totalDuration += entry.duration;

        // Store entry with timestamp for cleanup, but limit size
        if (this.lastMetrics.resources.entries.length < 1000) {
          this.lastMetrics.resources.entries.push({
            ...entry,
            timestamp: Date.now()
          });
        }

        if (!this.lastMetrics.resources.types[type]) {
          this.lastMetrics.resources.types[type] = { count: 0, size: 0, duration: 0 };
        }
        this.lastMetrics.resources.types[type].count++;
        this.lastMetrics.resources.types[type].size += entry.transferSize || 0;
        this.lastMetrics.resources.types[type].duration += entry.duration;
        break;

      case 'paint':
        if (!this.lastMetrics.rendering) this.lastMetrics.rendering = {};
        this.lastMetrics.rendering[entry.name] = entry.startTime;
        break;

      case 'measure':
        if (!this.lastMetrics.customMeasures) this.lastMetrics.customMeasures = {};
        this.lastMetrics.customMeasures[entry.name] = entry.duration;
        break;
    }
  }

  processDOMMutations(mutations) {
    if (!this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = {
        mutations: 0,
        addedNodes: 0,
        removedNodes: 0,
        modifiedAttributes: 0
      };
    }

    for (const m of mutations) {
      this.lastMetrics.domActivity.mutations++;
      if (m.type === 'childList') {
        this.lastMetrics.domActivity.addedNodes += m.addedNodes.length;
        this.lastMetrics.domActivity.removedNodes += m.removedNodes.length;
      } else if (m.type === 'attributes') {
        this.lastMetrics.domActivity.modifiedAttributes++;
      }
    }
  }

  // ---- Collect + Send ----
  collectAndSendMetrics(isImmediate = false) {
    try {
      const metrics = this.gatherAllMetrics();
      if (isImmediate) {
        metrics.isImmediate = true;
      }
      
      const success = this.sendMetricsToBackground(metrics);
      if (success || isImmediate) {
        this.resetTransientMetrics();
      }
      return success;
    } catch (error) {
      return false;
    }
  }

  gatherAllMetrics() {
    const metrics = {
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,

      // Page characteristics
      domNodes: document.querySelectorAll('*').length,
      domDepth: this.calculateDOMDepth(),
      viewport: { width: window.innerWidth, height: window.innerHeight },

      // Memory usage (if available)
      memory: this.getMemoryUsage(),

      // CPU-intensive indicators
      cpuIntensiveElements: this.detectCPUIntensiveElements(),

      // Network activity estimation
      activeConnections: this.estimateActiveConnections(),

      // Everything cached by observers
      ...this.lastMetrics
    };

    return metrics;
  }

  async sendMetricsToBackground(metrics) {
    // Enhanced context validation before sending
    if (!window.isExtensionContextValid()) {
      return false;
    }

    // Optional: Don't send as frequently when hidden (but always send immediate collections)
    if (document.hidden && !metrics.isImmediate) {
      const hiddenSendChance = Math.random();
      if (hiddenSendChance > 0.2) { // Only send 20% of the time when hidden
        return false;
      }
    }

    try {
      const backoffInfo = window.__energyBackoffManager.getRetryInfo();
      
      const res = await window.safeSendMessage({ type: 'ENERGY_DATA', data: metrics });
      if (res !== null && res !== undefined) {
        // Reset backoff only on successful communication
        if (res.success) {
          window.resetBackoff();
          return true;
        }
      } else {
        // Don't reset backoff here - context might be invalidated
      }
      return false;
    } catch (error) {
      // Enhanced error handling - don't throw, just log
      // Don't reset backoff on error
      return false;
    }
  }

  // ---- Visibility / Unload ----
  handleVisibilityChange() {
    if (document.hidden) {
    } else {
    }
    this.startPeriodicMonitoring(); // restarts timer with correct interval
  }

  handlePageUnload() {
    try {
      this.collectAndSendMetrics();
    } catch (_) {}

    // Cleanup observers
    try { this.mutationObserver && this.mutationObserver.disconnect(); } catch (_) {}
    try { this.performanceObserver && this.performanceObserver.disconnect(); } catch (_) {}

    this.stopPeriodicMonitoring();
  }

  // ---- Utilities ----
  calculateDOMDepth() {
    let maxDepth = 0;
    const walk = (el, depth) => {
      if (!el || !el.children) return;
      maxDepth = Math.max(maxDepth, depth);
      for (const child of el.children) walk(child, depth + 1);
    };
    if (document.body) walk(document.body, 1);
    return maxDepth;
  }

  getMemoryUsage() {
    const m = performance && performance.memory;
    return m
      ? { used: m.usedJSHeapSize, total: m.totalJSHeapSize, limit: m.jsHeapSizeLimit }
      : null;
    // Note: only available in Chromium-based browsers with proper flags/contexts
  }

  detectCPUIntensiveElements() {
    const selectors = [
      'video[autoplay]', 'canvas', 'iframe',
      '[style*="animation"]', '[style*="transform"]',
      '.animated', '[data-parallax]'
    ];
    let intensiveCount = 0;
    for (const sel of selectors) {
      try { intensiveCount += document.querySelectorAll(sel).length; } catch { /* ignore */ }
    }
    return {
      count: intensiveCount,
      videos: document.querySelectorAll('video').length,
      canvases: document.querySelectorAll('canvas').length,
      iframes: document.querySelectorAll('iframe').length
    };
  }

  estimateActiveConnections() {
    const resources = performance.getEntriesByType('resource');
    const now = performance.now(); // same time basis as entry.startTime
    const recent = resources.filter(r => (now - r.startTime) < 10000); // last 10s
    return {
      recentRequests: recent.length,
      totalRequests: resources.length
    };
  }

  getResourceType(url = '', initiatorType = '') {
    const ext = (url.split('.').pop() || '').toLowerCase();

    const image = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const video = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    const audio = ['mp3', 'wav', 'ogg', 'aac'];
    const style = ['css'];
    const script = ['js'];

    if (image.includes(ext) || initiatorType === 'img') return 'image';
    if (video.includes(ext) || initiatorType === 'video') return 'video';
    if (audio.includes(ext) || initiatorType === 'audio') return 'audio';
    if (style.includes(ext) || initiatorType === 'link') return 'stylesheet';
    if (script.includes(ext) || initiatorType === 'script') return 'script';
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') return 'xhr';
    return 'other';
  }

  resetTransientMetrics() {
    if (this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = { mutations: 0, addedNodes: 0, removedNodes: 0, modifiedAttributes: 0 };
    }
  }

  cleanupOldMetrics() {
    // Keep only recent data
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (this.lastMetrics.resources && this.lastMetrics.resources.entries) {
      this.lastMetrics.resources.entries = this.lastMetrics.resources.entries.filter(
        entry => now - entry.timestamp < maxAge
      );
    }
    
    // Clear other accumulated data
    if (this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = {
        mutations: 0,
        addedNodes: 0,
        removedNodes: 0,
        modifiedAttributes: 0
      };
    }
  }

  cleanup() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handlePageUnload);
    this.isInitialized = false;
  }
    };
  }

  // ===========================
  // In-Tab Energy Tip Notifications
  // ===========================
  if (typeof window.EnergyTipNotifications === 'undefined') {
    window.EnergyTipNotifications = class EnergyTipNotifications {
      constructor() {
        this.isInitialized = false;
        this.currentTip = null;
        this.tipHistory = new Map(); // Track shown tips to avoid spam
        this.lastTipTime = 0;
        this.minimumTipInterval = 5 * 60 * 1000; // 5 minutes between tips
        this.init();
      }

      init() {
        if (this.isInitialized) return;
        
        // Listen for tip messages from service worker
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'SHOW_ENERGY_TIP') {
            this.showTip(message.tipData);
            sendResponse({ success: true });
          } else if (message.type === 'HIDE_ENERGY_TIP') {
            this.hideTip();
            sendResponse({ success: true });
          } else if (message.type === 'PING') {
            // Respond to ping messages from service worker
            sendResponse({ success: true, message: 'Content script alive' });
          } else if (message.type === 'COLLECT_IMMEDIATE_METRICS') {
            // Force immediate metrics collection
            if (window.__energyTrackerInstance) {
              window.__energyTrackerInstance.collectAndSendMetrics();
              sendResponse({ success: true, message: 'Immediate collection triggered' });
            } else {
              sendResponse({ success: false, error: 'Energy tracker not available' });
            }
          }
          return true; // Keep message channel open for async response
        });

        this.injectTipStyles();
        this.isInitialized = true;
      }

      showTip(tipData) {
        // Check if we should show this tip
        if (!this.shouldShowTip(tipData)) {
          return;
        }

        // Hide any existing tip
        this.hideTip();

        // Create tip notification
        this.currentTip = this.createTipElement(tipData);
        
        // Add to page
        document.body.appendChild(this.currentTip);

        // Animate in
        setTimeout(() => {
          this.currentTip.classList.add('energy-tip-show');
        }, 10);

        // Auto-hide after duration
        if (tipData.duration) {
          setTimeout(() => {
            this.hideTip();
          }, tipData.duration);
        }

        // Track this tip
        this.recordTipShown(tipData);

      }

      hideTip() {
        if (!this.currentTip) return;

        this.currentTip.classList.remove('energy-tip-show');
        this.currentTip.classList.add('energy-tip-hide');

        setTimeout(() => {
          if (this.currentTip && this.currentTip.parentNode) {
            this.currentTip.parentNode.removeChild(this.currentTip);
          }
          this.currentTip = null;
        }, 300);
      }

      shouldShowTip(tipData) {
        const now = Date.now();
        
        // Check minimum time between tips
        if (now - this.lastTipTime < this.minimumTipInterval) {
          return false;
        }

        // Check if this specific tip type was shown recently
        const tipKey = `${tipData.type}_${this.getDomain()}`;
        const lastShown = this.tipHistory.get(tipKey) || 0;
        const tipCooldown = tipData.cooldown || (30 * 60 * 1000); // 30 minutes default cooldown

        if (now - lastShown < tipCooldown) {
          return false;
        }

        // Check if user has dismissed this tip permanently
        const dismissKey = `tip_dismissed_${tipData.type}`;
        if (localStorage.getItem(dismissKey) === 'true') {
          return false;
        }

        return true;
      }

      recordTipShown(tipData) {
        const now = Date.now();
        this.lastTipTime = now;
        
        const tipKey = `${tipData.type}_${this.getDomain()}`;
        this.tipHistory.set(tipKey, now);
        
        // Clean up old history entries
        for (const [key, time] of this.tipHistory.entries()) {
          if (now - time > 24 * 60 * 60 * 1000) { // Remove entries older than 24 hours
            this.tipHistory.delete(key);
          }
        }
      }

      createTipElement(tipData) {
        const tip = document.createElement('div');
        tip.className = 'energy-tip-notification';
        tip.setAttribute('data-tip-type', tipData.type);

        // Determine urgency class
        const urgencyClass = this.getUrgencyClass(tipData.powerWatts || 0);
        tip.classList.add(`energy-tip-${urgencyClass}`);

        // Create structure using safe DOM methods (CSP-compliant)
        const content = document.createElement('div');
        content.className = 'energy-tip-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'energy-tip-header';

        const icon = document.createElement('div');
        icon.className = 'energy-tip-icon';
        icon.textContent = '⚡';

        const title = document.createElement('div');
        title.className = 'energy-tip-title';
        title.textContent = tipData.title || 'Energy Tip';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'energy-tip-close';
        closeBtn.setAttribute('aria-label', 'Close tip');
        closeBtn.textContent = '×';

        header.appendChild(icon);
        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create message
        const message = document.createElement('div');
        message.className = 'energy-tip-message';
        message.textContent = tipData.message;

        // Create power info
        const power = document.createElement('div');
        power.className = 'energy-tip-power';
        power.textContent = `Power usage: ${tipData.powerWatts}W`;

        // Create actions container
        const actions = document.createElement('div');
        actions.className = 'energy-tip-actions';

        // Create action button if needed
        let actionBtn = null;
        if (tipData.actionText) {
          actionBtn = document.createElement('button');
          actionBtn.className = 'energy-tip-action';
          actionBtn.textContent = tipData.actionText;
          actions.appendChild(actionBtn);
        }

        // Create dismiss button
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'energy-tip-dismiss';
        dismissBtn.textContent = "Don't show again";
        actions.appendChild(dismissBtn);

        // Assemble the tip
        content.appendChild(header);
        content.appendChild(message);
        content.appendChild(power);
        content.appendChild(actions);
        tip.appendChild(content);

        // Add event listeners

        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.hideTip();
        });

        dismissBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.dismissTipPermanently(tipData.type);
          this.hideTip();
        });

        if (actionBtn && tipData.action) {
          actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.executeTipAction(tipData.action, tipData);
          });
        }

        // Close on escape key
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            this.hideTip();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);

        return tip;
      }

      getUrgencyClass(powerWatts) {
        if (powerWatts >= 50) return 'urgent'; // Red
        if (powerWatts >= 35) return 'warning'; // Orange/Yellow
        return 'info'; // Green
      }

      dismissTipPermanently(tipType) {
        const dismissKey = `tip_dismissed_${tipType}`;
        localStorage.setItem(dismissKey, 'true');
      }

      async executeTipAction(action, tipData) {
        try {
          switch (action) {
            case 'refresh_page':
              window.location.reload();
              break;
              
            case 'pause_media':
              this.pauseMediaElements();
              this.hideTip();
              break;
              
            case 'reduce_animations':
              this.reduceAnimations();
              this.hideTip();
              break;
              
            case 'close_tab':
              // Send message to service worker to close tab
              await window.safeSendMessage({ type: 'CLOSE_CURRENT_TAB' });
              break;
              
            case 'open_settings':
              await window.safeSendMessage({ type: 'OPEN_SETTINGS' });
              this.hideTip();
              break;

            case 'optimize_tab':
              this.optimizeTab();
              this.hideTip();
              break;

            case 'toggle_dark_mode':
              this.toggleDarkMode();
              this.hideTip();
              break;

            case 'reset_zoom':
              document.body.style.zoom = '100%';
              this.showActionFeedback('Zoom reset to 100%');
              this.hideTip();
              break;

            case 'bookmark_current':
              // Modern browsers don't allow direct bookmarking, show instruction
              this.showActionFeedback('Press Ctrl+D (Cmd+D on Mac) to bookmark this page');
              this.hideTip();
              break;

            case 'exit_fullscreen':
              if (document.fullscreenElement) {
                document.exitFullscreen();
                this.showActionFeedback('Exited fullscreen mode');
              }
              this.hideTip();
              break;

            case 'show_history':
              await window.safeSendMessage({ type: 'OPEN_SETTINGS', params: { tab: 'history' } });
              this.hideTip();
              break;

            case 'share_tips':
              this.showShareTipsDialog();
              break;

            case 'enable_battery_saver':
              this.enableBatterySaver();
              this.hideTip();
              break;

            case 'organize_tabs':
              this.showActionFeedback('Tip: Use Ctrl+Shift+A to search all tabs, or bookmark tabs for later reading');
              this.hideTip();
              break;
              
            default:
              this.hideTip();
          }
        } catch (error) {
          this.hideTip();
        }
      }

      pauseMediaElements() {
        const mediaElements = document.querySelectorAll('video, audio');
        let pausedCount = 0;
        
        mediaElements.forEach(element => {
          if (!element.paused) {
            element.pause();
            pausedCount++;
          }
        });
        
        if (pausedCount > 0) {
          this.showActionFeedback(`Paused ${pausedCount} media element${pausedCount > 1 ? 's' : ''}`);
        }
      }

      reduceAnimations() {
        // Add a style to reduce animations
        let animationStyle = document.getElementById('energy-tip-animation-reducer');
        if (!animationStyle) {
          animationStyle = document.createElement('style');
          animationStyle.id = 'energy-tip-animation-reducer';
          animationStyle.textContent = `
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          `;
          document.head.appendChild(animationStyle);
          this.showActionFeedback('Animations reduced to save energy');
        }
      }

      showActionFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'energy-tip-feedback';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
          feedback.classList.add('energy-tip-feedback-show');
        }, 10);
        
        setTimeout(() => {
          feedback.classList.remove('energy-tip-feedback-show');
          setTimeout(() => {
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 300);
        }, 3000);
      }

      /**
       * Optimize tab by applying multiple energy-saving measures
       */
      optimizeTab() {
        let optimizationCount = 0;
        
        // Pause media elements
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(element => {
          if (!element.paused) {
            element.pause();
            optimizationCount++;
          }
        });
        
        // Reduce animations
        this.reduceAnimations();
        if (document.getElementById('energy-tip-animation-reducer')) {
          optimizationCount++;
        }
        
        // Hide images that are not in viewport (lazy optimization)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          const rect = img.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            if (!img.dataset.originalSrc) {
              img.dataset.originalSrc = img.src;
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
              optimizationCount++;
            }
          }
        });
        
        this.showActionFeedback(`Tab optimized! ${optimizationCount} energy-saving measures applied.`);
      }

      /**
       * Toggle dark mode (best effort)
       */
      toggleDarkMode() {
        // Try common dark mode toggles
        const darkModeSelectors = [
          '[data-theme="dark"]',
          '.dark-mode-toggle',
          '.theme-toggle',
          '[aria-label*="dark"]',
          '[aria-label*="theme"]'
        ];
        
        let toggled = false;
        for (const selector of darkModeSelectors) {
          const toggle = document.querySelector(selector);
          if (toggle) {
            toggle.click();
            toggled = true;
            break;
          }
        }
        
        if (!toggled) {
          // Apply a basic dark mode filter
          let darkFilter = document.getElementById('energy-tip-dark-filter');
          if (!darkFilter) {
            darkFilter = document.createElement('style');
            darkFilter.id = 'energy-tip-dark-filter';
            darkFilter.textContent = `
              html { filter: invert(1) hue-rotate(180deg) !important; }
              img, video, iframe, svg { filter: invert(1) hue-rotate(180deg) !important; }
            `;
            document.head.appendChild(darkFilter);
            this.showActionFeedback('Dark mode filter applied');
          } else {
            darkFilter.remove();
            this.showActionFeedback('Dark mode filter removed');
          }
        } else {
          this.showActionFeedback('Dark mode toggled');
        }
      }

      /**
       * Show share tips dialog
       */
      showShareTipsDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'energy-share-dialog';
        dialog.innerHTML = `
          <div class="energy-share-content">
            <h3>Share Energy-Saving Tips! 🌱</h3>
            <p>Help others save energy too:</p>
            <div class="energy-share-actions">
              <button class="share-btn" data-action="copy">Copy Tips Link</button>
              <button class="share-btn" data-action="twitter">Share on Twitter</button>
              <button class="share-btn" data-action="close">Close</button>
            </div>
          </div>
        `;
        
        // Style the dialog
        dialog.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 2147483647;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        document.body.appendChild(dialog);
        
        // Handle dialog actions
        dialog.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          if (action === 'copy') {
            navigator.clipboard.writeText('Check out this energy-saving browser extension: PowerAI Energy Tracker!');
            this.showActionFeedback('Tips link copied to clipboard!');
          } else if (action === 'twitter') {
            window.open('https://twitter.com/intent/tweet?text=Save%20energy%20while%20browsing%20with%20PowerAI%20Energy%20Tracker!%20%23EnergyEfficiency%20%23GreenTech', '_blank');
          }
          
          dialog.remove();
          this.hideTip();
        });
        
        // Close on escape
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            dialog.remove();
            document.removeEventListener('keydown', escapeHandler);
            this.hideTip();
          }
        };
        document.addEventListener('keydown', escapeHandler);
      }

      /**
       * Enable battery saver measures
       */
      enableBatterySaver() {
        let savingsCount = 0;
        
        // Reduce screen brightness (filter approach)
        let brightnessFilter = document.getElementById('energy-tip-brightness');
        if (!brightnessFilter) {
          brightnessFilter = document.createElement('style');
          brightnessFilter.id = 'energy-tip-brightness';
          brightnessFilter.textContent = 'html { filter: brightness(0.8) !important; }';
          document.head.appendChild(brightnessFilter);
          savingsCount++;
        }
        
        // Pause all media
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(element => {
          if (!element.paused) {
            element.pause();
            savingsCount++;
          }
        });
        
        // Reduce animations
        this.reduceAnimations();
        if (document.getElementById('energy-tip-animation-reducer')) {
          savingsCount++;
        }
        
        this.showActionFeedback(`Battery saver enabled! ${savingsCount} optimizations applied.`);
      }

      getDomain() {
        try {
          return new URL(window.location.href).hostname;
        } catch (e) {
          return 'unknown';
        }
      }

      cleanup() {
        this.hideTip();
        this.isInitialized = false;
        
        // Remove styles if they exist
        const styles = document.getElementById('energy-tip-styles');
        if (styles && styles.parentNode) {
          styles.parentNode.removeChild(styles);
        }

        // Clean up animation reducer
        const animationStyle = document.getElementById('energy-tip-animation-reducer');
        if (animationStyle && animationStyle.parentNode) {
          animationStyle.parentNode.removeChild(animationStyle);
        }
      }

      injectTipStyles() {
        // Check if styles already injected
        if (document.getElementById('energy-tip-styles')) {
          return;
        }

        const styles = document.createElement('style');
        styles.id = 'energy-tip-styles';
        styles.textContent = `
          .energy-tip-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            max-width: calc(100vw - 40px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid #e1e5e9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 2147483647;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
          }

          .energy-tip-notification.energy-tip-show {
            opacity: 1;
            transform: translateY(0);
          }

          .energy-tip-notification.energy-tip-hide {
            opacity: 0;
            transform: translateY(20px);
          }

          .energy-tip-notification.energy-tip-urgent {
            border-left: 4px solid #dc3545;
          }

          .energy-tip-notification.energy-tip-warning {
            border-left: 4px solid #ffc107;
          }

          .energy-tip-notification.energy-tip-info {
            border-left: 4px solid #28a745;
          }

          .energy-tip-content {
            padding: 16px;
          }

          .energy-tip-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }

          .energy-tip-icon {
            font-size: 18px;
            margin-right: 8px;
          }

          .energy-tip-title {
            font-weight: 600;
            color: #1a1a1a;
            flex: 1;
          }

          .energy-tip-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #666;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            border-radius: 4px;
            transition: background-color 0.2s;
          }

          .energy-tip-close:hover {
            background-color: #f5f5f5;
            color: #333;
          }

          .energy-tip-message {
            color: #4a4a4a;
            line-height: 1.4;
            margin-bottom: 6px;
          }

          .energy-tip-power {
            color: #666;
            font-size: 12px;
            margin-bottom: 12px;
          }

          .energy-tip-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .energy-tip-action {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: background-color 0.2s;
            font-weight: 500;
          }

          .energy-tip-action:hover {
            background: #0056b3;
          }

          .energy-tip-dismiss {
            background: none;
            color: #666;
            border: 1px solid #ddd;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .energy-tip-dismiss:hover {
            background: #f5f5f5;
            border-color: #bbb;
            color: #333;
          }

          .energy-tip-feedback {
            position: fixed;
            top: 80px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 2147483646;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
          }

          .energy-tip-feedback.energy-tip-feedback-show {
            opacity: 1;
            transform: translateY(0);
          }

          @media (max-width: 480px) {
            .energy-tip-notification {
              top: 10px;
              right: 10px;
              left: 10px;
              width: auto;
              max-width: none;
            }

            .energy-tip-actions {
              flex-direction: column;
            }

            .energy-tip-action,
            .energy-tip-dismiss {
              width: 100%;
              justify-content: center;
            }
          }

          @media (prefers-color-scheme: dark) {
            .energy-tip-notification {
              background: #2d3748;
              border-color: #4a5568;
              color: #e2e8f0;
            }

            .energy-tip-title {
              color: #f7fafc;
            }

            .energy-tip-message {
              color: #cbd5e0;
            }

            .energy-tip-power {
              color: #a0aec0;
            }

            .energy-tip-close:hover {
              background-color: #4a5568;
              color: #e2e8f0;
            }

            .energy-tip-dismiss {
              border-color: #4a5568;
              color: #a0aec0;
            }

            .energy-tip-dismiss:hover {
              background: #4a5568;
              border-color: #718096;
              color: #e2e8f0;
            }
          }
        `;

        document.head.appendChild(styles);
      }
    };
  }

  // Add global message listener for service worker communication
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.type === 'PING') {
      sendResponse({ success: true, message: 'Content script alive' });
      return true;
    } else if (message.type === 'COLLECT_IMMEDIATE_METRICS') {
      if (window.__energyTrackerInstance && typeof window.__energyTrackerInstance.collectAndSendMetrics === 'function') {
        try {
          window.__energyTrackerInstance.collectAndSendMetrics();
          sendResponse({ success: true, message: 'Immediate collection triggered' });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      } else {
        sendResponse({ success: false, error: 'Energy tracker not available' });
      }
      return true;
    }
    
    // Let other listeners handle other message types
    return false;
  });

  // Store instances for cleanup
  window.__energyTrackerInstance = new window.PageEnergyMonitor();
  window.__energyTipInstance = new window.EnergyTipNotifications();

  // Enhanced notification system is already loaded via manifest.json content_scripts
  // Just wait a bit for it to initialize, then check if we should use it
  setTimeout(() => {
    if (window.__powerAINotificationManager) {
      window.__energyTipInstance.cleanup();
      window.__energyTipInstance = window.__powerAINotificationManager;
    }
  }, 100);

  // Mark as loaded to prevent redeclaration
  window.__energyTrackerContentLoaded = true;


})();
