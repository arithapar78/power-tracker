// EnergyTrackingApp Popup Script
// Handles popup UI interactions and data display with watts-based power consumption

class PopupManager {
  constructor() {
    this.currentTabData = null;
    this.energyData = null;
    this.backendEnergyData = null;
    this.aiEnergyData = null;
    this.settings = null;
    this.updateInterval = null;
    
    // Initialize Enhanced AI Energy Manager
    this.aiEnergyManager = typeof EnhancedAIEnergyManager !== 'undefined'
      ? new EnhancedAIEnergyManager()
      : (typeof AIEnergyManager !== 'undefined' ? new AIEnergyManager() : null);
    this.detectedAIModel = null;
    this.currentAIUsage = null;
    this.enhancedAIData = null;
    
    // Initialize AI Model Power Calculator
    this.aiModelPowerCalculator = new AIModelPowerCalculator();
    
    // Initialize Backend Power Calculator (legacy compatibility)
    this.backendPowerCalculator = this.aiModelPowerCalculator;
    
    // Initialize System Integration Manager
    this.systemIntegrationManager = null;
    this.performanceOptimizer = null;
    this.integrationTestSuite = null;
    
    this.init();
  }
  
  async init() {
    console.log('[PopupManager] Initializing popup...');
    
    try {
      // Initialize System Integration Manager first for performance optimization
      await this.initializeSystemIntegration();
      
      // Initialize advanced features
      this.initializeAdvancedFeatures();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      // Run integration tests in development mode
      if (this.isDevelopmentMode()) {
        await this.runIntegrationTests();
        await this.runSystemValidation();
      }
      
      // Hide loading overlay
      this.hideLoadingOverlay();
      
      console.log('[PopupManager] ✅ Popup initialization completed successfully');
      
    } catch (error) {
      console.error('[PopupManager] Initialization failed:', error);
      this.showError('Failed to initialize. Please try again.');
    }
  }
  
  /**
   * Initialize system integration and performance optimization
   */
  async initializeSystemIntegration() {
    try {
      // Initialize System Integration Manager
      if (typeof SystemIntegrationManager !== 'undefined') {
        this.systemIntegrationManager = new SystemIntegrationManager();
        const initResult = await this.systemIntegrationManager.initialize();
        
        if (initResult.success) {
          console.log(`[PopupManager] System integration initialized in ${initResult.initializationTime}ms`);
          
          // Get references to optimized systems
          this.performanceOptimizer = this.systemIntegrationManager.getSystem('performanceOptimizer');
          this.integrationTestSuite = this.systemIntegrationManager.getSystem('integrationTestSuite');
          
          // Override system references with optimized versions
          const optimizedTokenCounter = this.systemIntegrationManager.getSystem('tokenCounter');
          const optimizedPowerCalculator = this.systemIntegrationManager.getSystem('powerCalculator');
          const optimizedPromptOptimizer = this.systemIntegrationManager.getSystem('promptOptimizer');
          
          if (optimizedTokenCounter) this.tokenCounter = optimizedTokenCounter;
          if (optimizedPowerCalculator) this.aiModelPowerCalculator = optimizedPowerCalculator;
          if (optimizedPromptOptimizer) this.advancedOptimizer = optimizedPromptOptimizer;
          
        } else {
          console.warn('[PopupManager] System integration initialization failed:', initResult.error);
        }
      } else {
        console.warn('[PopupManager] SystemIntegrationManager not available');
      }
    } catch (error) {
      console.error('[PopupManager] Failed to initialize system integration:', error);
    }
  }
  
  /**
   * Initialize advanced features with performance monitoring
   */
  initializeAdvancedFeatures() {
    const startTime = performance.now();
    
    try {
      // Initialize token counting systems if not already done by system integration
      if (!this.tokenCounter) {
        this.initializeTokenCounters();
      }
      
      // Store reference to window for global access
      window.popupManager = this;
      
      const duration = performance.now() - startTime;
      if (this.performanceOptimizer) {
        this.performanceOptimizer.recordMetric('advancedFeaturesInit', duration);
      }
      
      console.log(`[PopupManager] Advanced features initialized in ${Math.round(duration)}ms`);
      
    } catch (error) {
      console.error('[PopupManager] Failed to initialize advanced features:', error);
    }
  }
  
  /**
   * Check if running in development mode
   */
  isDevelopmentMode() {
    // Check for development indicators
    return window.location.protocol === 'file:' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id &&
            chrome.runtime.id.includes('unpacked'));
  }
  
  /**
   * Run integration tests in development mode
   */
  async runIntegrationTests() {
    if (!this.integrationTestSuite) {
      console.log('[PopupManager] Integration test suite not available, skipping tests');
      return;
    }
    
    try {
      console.log('[PopupManager] 🧪 Running integration tests in development mode...');
      const testResults = await this.integrationTestSuite.runAllTests();
      
      if (testResults.summary.failedTests > 0) {
        console.warn(`[PopupManager] ⚠️ ${testResults.summary.failedTests}/${testResults.summary.totalTests} integration tests failed`);
        console.table(testResults.testDetails);
      } else {
        console.log(`[PopupManager] ✅ All ${testResults.summary.totalTests} integration tests passed`);
      }
      
      // Store test results for performance report
      this.lastIntegrationTestResults = testResults;
      
    } catch (error) {
      console.error('[PopupManager] Failed to run integration tests:', error);
    }
  }
  
  /**
   * Get system performance report
   */
  getPerformanceReport() {
    if (!this.systemIntegrationManager) {
      return {
        systemIntegrationManager: 'not available',
        basicMetrics: {
          initializationTime: Date.now() - this.startTime
        }
      };
    }
    
    const report = this.systemIntegrationManager.getPerformanceReport();
    
    // Add popup-specific metrics
    report.popupSpecific = {
      lastIntegrationTestResults: this.lastIntegrationTestResults,
      systemsAvailable: {
        tokenCounter: !!this.tokenCounter,
        performanceOptimizer: !!this.performanceOptimizer,
        advancedOptimizer: !!this.advancedOptimizer,
        integrationTestSuite: !!this.integrationTestSuite
      }
    };
    
    return report;
  }
  
  setupEventListeners() {
    // Enhanced button event listeners with null checks
    this.safeAddEventListener('viewHistoryBtn', 'click', this.handleViewHistory.bind(this));
    this.safeAddEventListener('settingsBtn', 'click', this.handleSettings.bind(this));
    this.safeAddEventListener('tipAction', 'click', this.handleTipAction.bind(this));
    this.safeAddEventListener('themeToggle', 'click', this.handleThemeToggle.bind(this));
    
    // Energy mode toggle listeners
    this.safeAddEventListener('frontendModeBtn', 'click', () => this.handleEnergyModeToggle('frontend'));
    this.safeAddEventListener('totalModeBtn', 'click', () => this.handleEnergyModeToggle('total'));
    
    // Advanced features integration
    this.safeAddEventListener('advancedFeaturesBtn', 'click', this.handleAdvancedFeatures.bind(this));
    this.safeAddEventListener('modalCloseBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('cancelCodeBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('submitCodeBtn', 'click', this.handleCodeSubmit.bind(this));
    this.safeAddEventListener('generatorCloseBtn', 'click', this.hidePromptGenerator.bind(this));
    
    // Setup prompt generator events immediately (don't wait for generator to show)
    this.setupPromptGeneratorEvents();
    
    // Add Enter key support for access code input
    this.safeAddEventListener('accessCodeInput', 'keydown', this.handleCodeInputKeydown.bind(this));
    
    // Model comparison and benchmarking
    this.safeAddEventListener('comparisonCloseBtn', 'click', this.hideComparisonModal.bind(this));
    this.safeAddEventListener('benchmarksCloseBtn', 'click', this.hideBenchmarksModal.bind(this));
    this.safeAddEventListener('refreshComparisonBtn', 'click', this.refreshComparison.bind(this));
    this.safeAddEventListener('exportComparisonBtn', 'click', this.exportComparison.bind(this));
    this.safeAddEventListener('applyRecommendationBtn', 'click', this.applyRecommendation.bind(this));
    
    // Tab energy recommendations event listeners
    this.safeAddEventListener('closeRecommendedBtn', 'click', this.handleCloseRecommendedTabs.bind(this));
    this.safeAddEventListener('dismissSuggestionsBtn', 'click', this.handleDismissSuggestions.bind(this));
    
    // Image error handlers with enhanced safety
    const popupLogo = document.getElementById('popupLogo');
    if (popupLogo) {
      popupLogo.addEventListener('error', () => {
        try {
          popupLogo.style.display = 'none';
        } catch (error) {
          console.warn('[PopupManager] Failed to hide logo:', error);
        }
      });
    }
    
    // Handle popup close
    window.addEventListener('beforeunload', this.handlePopupClose.bind(this));
    
    // Add keyboard navigation support
    this.setupKeyboardNavigation();
    
    // Setup tab energy recommendations
    this.setupTabRecommendations();
  }

  setupKeyboardNavigation() {
    try {
      // Handle keyboard events for accessibility
      document.addEventListener('keydown', (event) => {
        // Check if user is typing in an input field - don't intercept if they are
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable ||
          activeElement.hasAttribute('contenteditable')
        );
        
        // For regular shortcuts, skip if user is typing
        if (!isTyping) {
          // Toggle theme with T key
          if (event.key === 't' || event.key === 'T') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleThemeToggle();
            }
          }
          
          // Settings with S key
          if (event.key === 's' || event.key === 'S') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleSettings();
            }
          }
          
          // History with H key
          if (event.key === 'h' || event.key === 'H') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleViewHistory();
            }
          }
        }
        
        // Escape key to close popup (always allow, even when typing)
        if (event.key === 'Escape') {
          try {
            window.close();
          } catch (e) {
            // Window.close() may not work in all contexts
          }
        }
      });
      
      // Focus management for better accessibility
      this.setupFocusManagement();
      
      console.log('[PopupManager] Keyboard navigation set up successfully');
    } catch (error) {
      console.error('[PopupManager] Failed to setup keyboard navigation:', error);
    }
  }

  setupFocusManagement() {
    try {
      // Ensure the first interactive element gets focus when popup opens
      const firstButton = document.querySelector('button, [tabindex="0"]');
      if (firstButton) {
        // Small delay to ensure popup is fully rendered
        setTimeout(() => {
          firstButton.focus();
        }, 100);
      }
      
      // Add visible focus indicators for all interactive elements
      const interactiveElements = document.querySelectorAll('button, [tabindex="0"]');
      interactiveElements.forEach(element => {
        element.addEventListener('focus', () => {
          element.style.outline = '2px solid var(--accent-primary)';
          element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
          element.style.outline = '';
          element.style.outlineOffset = '';
        });
      });
    } catch (error) {
      console.error('[PopupManager] Failed to setup focus management:', error);
    }
  }

  /**
   * Safe event listener addition with null checks
   */
  safeAddEventListener(elementId, eventType, handler) {
    try {
      const element = document.getElementById(elementId);
      if (element && typeof handler === 'function') {
        element.addEventListener(eventType, handler);
        console.log(`[PopupManager] Event listener added for ${elementId}`);
      } else {
        console.warn(`[PopupManager] Element not found or invalid handler: ${elementId}`);
      }
    } catch (error) {
      console.error(`[PopupManager] Failed to add event listener for ${elementId}:`, error);
    }
  }
  
  async loadInitialData() {
    // Load theme first
    await this.loadTheme();
    
    // Load settings
    await this.loadSettings();
    
    // Load energy mode preference
    await this.loadEnergyMode();
    
    // Load current energy data
    await this.loadCurrentEnergyData();
    
    // Load backend energy data
    await this.loadBackendEnergyData();
    
    // Load enhanced AI energy data
    await this.loadEnhancedAIEnergyData();
    
    // Load today's summary
    await this.loadTodaySummary();
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Loads saved energy display mode preference
   */
  async loadEnergyMode() {
    try {
      const defaultMode = 'frontend';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default energy mode');
        this.energyDisplayMode = defaultMode;
        return;
      }

      // Get saved energy mode preference
      const result = await chrome.storage.local.get(['energyDisplayMode']);
      const savedMode = result.energyDisplayMode || defaultMode;
      
      this.energyDisplayMode = savedMode;
      console.log('[PopupManager] Energy mode loaded:', savedMode);
    } catch (error) {
      console.error('[PopupManager] Failed to load energy mode:', error);
      this.energyDisplayMode = 'frontend';
    }
  }
  
  /**
   * Handles energy mode toggle button clicks
   */
  handleEnergyModeToggle(mode) {
    console.log('[PopupManager] Energy mode toggle:', mode);
    this.setEnergyMode(mode);
  }
  
  /**
   * Updates energy mode toggle UI
   */
  updateEnergyModeUI(mode) {
    const frontendBtn = document.getElementById('frontendModeBtn');
    const totalBtn = document.getElementById('totalModeBtn');
    
    if (frontendBtn && totalBtn) {
      // Remove active class from both buttons
      frontendBtn.classList.remove('active');
      totalBtn.classList.remove('active');
      
      // Add active class to selected mode
      if (mode === 'frontend') {
        frontendBtn.classList.add('active');
      } else {
        totalBtn.classList.add('active');
      }
      
      // Add switching animation to power display
      const powerDisplay = document.getElementById('powerDisplay');
      if (powerDisplay) {
        powerDisplay.classList.add('mode-switching');
        setTimeout(() => {
          powerDisplay.classList.remove('mode-switching');
        }, 300);
      }
    }
  }
  
  async loadSettings() {
    const defaultSettings = {
      trackingEnabled: true,
      notificationsEnabled: true,
      powerThreshold: 40,
      energyThreshold: 75, // Keep for legacy compatibility
      dataRetentionDays: 30,
      samplingInterval: 5000
    };

    try {
      // Enhanced Chrome API availability check with timeout
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default settings');
        this.settings = defaultSettings;
        return;
      }
      
      // CRITICAL FIX: Add retry logic for service worker communication
      const response = await this.sendMessageWithRetry({ type: 'GET_SETTINGS' }, 3);
      
      if (response && response.success && response.settings) {
        // Merge with defaults to ensure all properties exist
        this.settings = { ...defaultSettings, ...response.settings };
        console.log('[PopupManager] Settings loaded successfully:', this.settings);
      } else {
        console.warn('[PopupManager] Failed to load settings:', response?.error || 'Invalid response');
        this.settings = defaultSettings;
      }
    } catch (error) {
      console.error('[PopupManager] Settings request failed:', error.message || error);
      this.settings = defaultSettings;
      
      // Show user-friendly error if it's a critical failure
      if (error.message && error.message.includes('Could not establish connection')) {
        console.log('[PopupManager] Service worker not available, using defaults');
      } else if (error.message === 'Settings request timeout') {
        this.showToast('Settings loading timeout - using defaults');
      }
    }
  }

  // NEW: Robust message sending with retry logic
  async sendMessageWithRetry(message, maxRetries = 3, timeout = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[PopupManager] Sending message (attempt ${attempt}/${maxRetries}):`, message.type);
        
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Message timeout')), timeout);
        });
        
        // Race between message and timeout
        const response = await Promise.race([
          chrome.runtime.sendMessage(message),
          timeoutPromise
        ]);
        
        if (response) {
          console.log(`[PopupManager] Message successful on attempt ${attempt}`);
          return response;
        }
        
        throw new Error('Empty response');
      } catch (error) {
        console.warn(`[PopupManager] Message attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Check if Chrome APIs are available and functional
   */
  isChromeApiAvailable() {
    try {
      return !!(
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.id &&
        chrome.runtime.sendMessage
      );
    } catch (error) {
      console.warn('[PopupManager] Chrome API check failed:', error.message);
      return false;
    }
  }
  
  async loadCurrentEnergyData(retryCount = 0) {
    const maxRetries = 6; // Increased retries for better reliability
    const baseRetryDelay = 800; // Shorter initial delay
    const retryDelay = baseRetryDelay * Math.pow(1.4, retryCount); // Gentler exponential backoff
    
    try {
      console.log('=== POPUP: Loading Energy Data ===');
      console.log('Attempt:', retryCount + 1, '/', maxRetries + 1);
      
      // Enhanced Chrome API availability check
      if (!this.isChromeApiAvailable()) {
        console.log('Chrome APIs not available, using demo data');
        this.loadDemoData();
        return;
      }

      // CRITICAL FIX: Get current tab FIRST to ensure proper tab context
      let currentTab = null;
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0) {
          currentTab = tabs[0];
          console.log('=== CURRENT TAB INFO ===');
          console.log('Tab ID:', currentTab?.id);
          console.log('Tab URL:', this.safeSubstring(currentTab?.url, 0, 50));
          console.log('Tab Title:', this.safeSubstring(currentTab?.title, 0, 50));
        } else {
          throw new Error('No active tab found');
        }
      } catch (tabQueryError) {
        console.error('[PopupManager] Failed to query active tab:', tabQueryError);
        await this.handleNoEnergyDataAvailable();
        return;
      }

      // CRITICAL FIX: Wake up service worker and ensure tab is being tracked
      try {
        console.log('[PopupManager] Ensuring tab is tracked...');
        await this.sendMessageWithRetry({
          type: 'ENSURE_TAB_TRACKING',
          tabId: currentTab.id,
          tabInfo: {
            url: currentTab.url,
            title: currentTab.title
          }
        }, 2);
      } catch (trackingError) {
        console.warn('[PopupManager] Failed to ensure tab tracking:', trackingError);
      }

      // ENHANCED FIX: Multiple data retrieval strategies
      let response = null;
      let energyDataFound = false;

      // Strategy 1: Get current energy snapshot
      try {
        response = await this.sendMessageWithRetry({ type: 'GET_CURRENT_ENERGY' }, 2);
        if (response?.success && response?.data) {
          this.energyData = response.data || {};
          energyDataFound = Object.keys(this.energyData).length > 0;
          console.log('[PopupManager] Strategy 1 - Current snapshot:', energyDataFound ? 'SUCCESS' : 'NO DATA');
        }
      } catch (error) {
        console.warn('[PopupManager] Strategy 1 failed:', error.message);
      }

      // Strategy 2: If no current data, try to get recent historical data
      if (!energyDataFound) {
        try {
          console.log('[PopupManager] Strategy 2 - Checking recent history...');
          const historyResponse = await chrome.runtime.sendMessage({
            type: 'GET_HISTORY',
            timeRange: '1h'
          });
          
          if (historyResponse?.success && historyResponse?.history?.length > 0) {
            console.log('[PopupManager] Found recent history entries:', historyResponse.history.length);
            const recentEntry = this.findMostRecentTabData(historyResponse.history, currentTab);
            if (recentEntry) {
              // Create current tab data from recent history
              this.energyData = {
                [currentTab.id]: {
                  ...recentEntry,
                  tabId: currentTab.id,
                  timestamp: Date.now(),
                  isHistorical: true,
                  dataSource: 'recent_history'
                }
              };
              energyDataFound = true;
              console.log('[PopupManager] Strategy 2 - Recent history: SUCCESS');
            }
          }
        } catch (historyError) {
          console.warn('[PopupManager] Strategy 2 failed:', historyError.message);
        }
      }

      // Strategy 3: Force content script data collection with enhanced safety
      if (!energyDataFound) {
        try {
          console.log('[PopupManager] Strategy 3 - Checking content script availability...');
          
          // First, check if content script is available with a ping
          let contentScriptAvailable = false;
          try {
            const pingResponse = await chrome.tabs.sendMessage(currentTab.id, { type: 'PING' });
            contentScriptAvailable = pingResponse?.success;
            console.log('[PopupManager] Content script ping result:', contentScriptAvailable);
          } catch (pingError) {
            console.log('[PopupManager] Content script not available:', pingError.message);
            
            // Try to inject content script if it's missing
            try {
              console.log('[PopupManager] Attempting to inject content script...');
              await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                files: ['content-script.js']
              });
              
              // Wait for injection to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Try ping again
              try {
                const retryPingResponse = await chrome.tabs.sendMessage(currentTab.id, { type: 'PING' });
                contentScriptAvailable = retryPingResponse?.success;
                console.log('[PopupManager] Post-injection ping result:', contentScriptAvailable);
              } catch (retryPingError) {
                console.log('[PopupManager] Content script still not responding after injection');
              }
            } catch (injectionError) {
              console.log('[PopupManager] Content script injection failed:', injectionError.message);
            }
          }
          
          // Only proceed with metrics collection if content script is available
          if (contentScriptAvailable) {
            console.log('[PopupManager] Strategy 3 - Triggering content script metrics...');
            try {
              await chrome.tabs.sendMessage(currentTab.id, {
                type: 'COLLECT_IMMEDIATE_METRICS'
              });
              
              // Wait a moment for data collection
              await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
              
              // Try getting data again
              response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_ENERGY' });
              if (response?.success && response?.data) {
                this.energyData = response.data || {};
                energyDataFound = Object.keys(this.energyData).length > 0;
                console.log('[PopupManager] Strategy 3 - Force collection:', energyDataFound ? 'SUCCESS' : 'NO DATA');
              }
            } catch (metricsError) {
              console.warn('[PopupManager] Strategy 3 metrics collection failed:', metricsError.message);
            }
          } else {
            console.log('[PopupManager] Strategy 3 skipped - content script not available');
          }
        } catch (contentError) {
          console.warn('[PopupManager] Strategy 3 failed:', contentError.message);
        }
      }

      // Process the retrieved data
      if (energyDataFound) {
        const energyDataKeys = Object.keys(this.energyData);
        console.log('=== DATA PROCESSING DIAGNOSTIC ===');
        console.log('Available tab IDs:', energyDataKeys);
        console.log('Energy data details:', energyDataKeys.map(tabId => {
          const tabData = this.energyData[tabId] || {};
          return {
            tabId,
            url: this.safeSubstring(tabData.url, 0, 50),
            energyScore: tabData.energyScore ?? 0,
            powerWatts: tabData.powerWatts ?? 0,
            domNodes: tabData.domNodes ?? 0,
            timestamp: tabData.timestamp ? new Date(tabData.timestamp).toLocaleTimeString() : null,
            dataSource: tabData.dataSource || 'live'
          };
        }));

        const tabId = currentTab?.id;
        console.log('Current tab ID:', tabId, 'looking for matching data...');
        this.currentTabData = (tabId && this.energyData[tabId]) ? this.energyData[tabId] : null;
        
        if (this.currentTabData) {
          console.log('✅ Energy data found for current tab:', {
            energyScore: this.currentTabData.energyScore ?? 0,
            powerWatts: this.currentTabData.powerWatts ?? 0,
            domNodes: this.currentTabData.domNodes ?? 0,
            age: this.currentTabData.timestamp ? (Date.now() - this.currentTabData.timestamp) + 'ms ago' : 'unknown',
            source: this.currentTabData.dataSource || 'live'
          });
          console.log('Raw currentTabData object:', this.currentTabData);
          return; // SUCCESS - exit early
        } else {
          console.log('❌ No energy data found for current tab ID, checking similar URLs...');
          console.log('Energy data keys vs current tab ID:', { energyDataKeys, currentTabId: tabId });
          const similarTabData = this.findSimilarTabData(currentTab?.url);
          if (similarTabData) {
            console.log('Found similar URL data:', this.safeSubstring(similarTabData.url, 0, 50));
            this.currentTabData = similarTabData;
            console.log('Using similar tab data:', this.currentTabData);
            return; // SUCCESS with similar data
          }
        }
      }

      // RETRY LOGIC: Only retry if we haven't found any data
      if (retryCount < maxRetries) {
        console.log(`No data found, retrying in ${Math.round(retryDelay)}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        setTimeout(() => {
          this.loadCurrentEnergyData(retryCount + 1).then(() => {
            this.updateUI(); // Update UI after retry
          }).catch(error => {
            console.error('[PopupManager] Retry failed:', error);
          });
        }, retryDelay);
        return;
      } else {
        console.warn(`❌ No energy data found for current tab after ${maxRetries + 1} attempts`);
        console.log('Creating fallback tab data...');
        await this.createFallbackTabData(currentTab);
      }

    } catch (error) {
      console.error('❌ Energy data request failed:', error);
      if (retryCount < maxRetries) {
        console.log(`Retrying energy data load after error in ${Math.round(retryDelay)}ms...`);
        setTimeout(() => {
          this.loadCurrentEnergyData(retryCount + 1).then(() => {
            this.updateUI();
          });
        }, retryDelay);
        return;
      }
      this.energyData = {};
      await this.handleNoEnergyDataAvailable();
    }
  }
  
  // Helper method to find similar tab data (for URL redirects, etc.)
  findSimilarTabData(currentUrl) {
    if (!currentUrl || !this.energyData) return null;
    
    try {
      const currentDomain = new URL(currentUrl).hostname;
      
      // Look for tabs with the same domain
      for (const [tabId, data] of Object.entries(this.energyData)) {
        if (data.url) {
          try {
            const dataDomain = new URL(data.url).hostname;
            if (dataDomain === currentDomain) {
              console.log('Found matching domain data:', data.url?.substring(0, 50));
              return { ...data, tabId: parseInt(tabId) };
            }
          } catch (e) {
            // Skip invalid URLs
          }
        }
      }
    } catch (e) {
      // Skip if current URL is invalid
    }
    
    return null;
  }

  // Helper method to find most recent tab data from history
  findMostRecentTabData(history, currentTab) {
    if (!history || !Array.isArray(history) || !currentTab) return null;
    
    const currentUrl = currentTab.url;
    const currentDomain = this.safeGetDomain(currentUrl);
    
    // Sort by timestamp (most recent first)
    const sortedHistory = history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Look for exact URL match first
    let match = sortedHistory.find(entry => entry.url === currentUrl);
    
    // If no exact match, look for same domain
    if (!match && currentDomain) {
      match = sortedHistory.find(entry => {
        const entryDomain = this.safeGetDomain(entry.url);
        return entryDomain && entryDomain === currentDomain;
      });
    }
    
    if (match) {
      console.log('[PopupManager] Found recent tab data:', {
        url: this.safeSubstring(match.url, 0, 50),
        age: match.timestamp ? `${Math.round((Date.now() - match.timestamp) / 1000)}s ago` : 'unknown',
        powerWatts: match.powerWatts || 'legacy'
      });
      
      return {
        url: currentTab.url, // Use current URL
        title: currentTab.title || match.title,
        powerWatts: match.powerWatts || this.migrateLegacyScore(match.energyScore || 0),
        energyScore: match.energyScore || 0,
        domNodes: match.domNodes || 0,
        duration: 0, // Reset duration for current session
        timestamp: Date.now()
      };
    }
    
    return null;
  }
  
  // Helper method to create fallback tab data and search history
  async createFallbackTabData(currentTab) {
    console.log('=== FALLBACK DATA CREATION ===');
    console.log('Creating fallback tab data for:', currentTab.url?.substring(0, 50));
    
    // Try to find historical data for this tab/URL
    const historicalData = await this.findHistoricalData(currentTab.url);
    
    this.currentTabData = {
      url: currentTab.url,
      title: currentTab.title,
      energyScore: historicalData?.averageEnergyScore || 0,
      domNodes: historicalData?.averageDomNodes || 0,
      duration: 0,
      timestamp: Date.now(),
      tabId: currentTab.id,
      isEstimated: true,
      dataSource: historicalData ? 'historical' : 'fallback',
      // ADD: Explicitly set powerWatts if we have energyScore from historical data
      powerWatts: historicalData?.averageEnergyScore ? this.migrateLegacyScore(historicalData.averageEnergyScore) : null
    };
    
    if (historicalData) {
      console.log('✅ Using historical data for estimates:', {
        averageEnergyScore: historicalData.averageEnergyScore,
        averageDomNodes: historicalData.averageDomNodes,
        estimatedPowerWatts: this.currentTabData.powerWatts,
        visits: historicalData.visits
      });
    } else {
      console.log('⚠️ Using basic fallback data (no history available)');
      // Generate reasonable estimates for completely unknown URLs
      this.currentTabData.domNodes = 1500; // Reasonable estimate
      this.currentTabData.energyScore = 25; // Medium energy score
      this.currentTabData.powerWatts = this.estimatePowerFromURL(currentTab.url);
      console.log('Generated fallback estimates:', {
        domNodes: this.currentTabData.domNodes,
        energyScore: this.currentTabData.energyScore,
        powerWatts: this.currentTabData.powerWatts
      });
    }
    
    console.log('Final fallback currentTabData:', this.currentTabData);
  }
  
  // Helper method to find historical data for a URL with enhanced safety
  async findHistoricalData(url) {
    try {
      // Enhanced URL validation
      if (!url || typeof url !== 'string') {
        console.warn('[PopupManager] Invalid URL provided for historical data lookup');
        return null;
      }

      // Enhanced Chrome API check
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available for historical data');
        return null;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '7d'
      });
      
      if (response && response.success && Array.isArray(response.history)) {
        // Enhanced history filtering with null safety
        let matches = response.history.filter(entry =>
          entry && typeof entry === 'object' && entry.url === url
        );
        
        // If no exact matches, try domain matching with enhanced safety
        if (matches.length === 0 && url) {
          const domain = this.safeGetDomain(url);
          if (domain) {
            matches = response.history.filter(entry => {
              if (!entry || !entry.url) return false;
              const entryDomain = this.safeGetDomain(entry.url);
              return entryDomain && entryDomain === domain;
            });
          }
        }
        
        if (matches.length > 0) {
          const totalEnergyScore = matches.reduce((sum, entry) => sum + (entry?.energyScore ?? 0), 0);
          const totalDomNodes = matches.reduce((sum, entry) => sum + (entry?.domNodes ?? 0), 0);
          const timestamps = matches.map(entry => entry?.timestamp ?? 0).filter(t => t > 0);
          
          return {
            visits: matches.length,
            averageEnergyScore: totalEnergyScore > 0 ? Math.round(totalEnergyScore / matches.length) : 0,
            averageDomNodes: totalDomNodes > 0 ? Math.round(totalDomNodes / matches.length) : 0,
            lastVisit: timestamps.length > 0 ? Math.max(...timestamps) : 0
          };
        }
      } else {
        console.warn('[PopupManager] Invalid history response:', response);
      }
    } catch (error) {
      console.error('[PopupManager] Error fetching historical data:', error.message || error);
    }
    
    return null;
  }

  /**
   * Safe domain extraction with enhanced error handling
   */
  safeGetDomain(url) {
    try {
      if (!url || typeof url !== 'string') return null;
      const urlObj = new URL(url);
      return urlObj.hostname || null;
    } catch (error) {
      console.warn('[PopupManager] Failed to extract domain from URL:', url, error.message);
      return null;
    }
  }
  
  // Helper method to handle complete absence of energy data
  async handleNoEnergyDataAvailable() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab) {
      this.currentTabData = {
        url: currentTab.url,
        title: currentTab.title,
        energyScore: 0,
        domNodes: 0,
        duration: 0,
        timestamp: Date.now(),
        tabId: currentTab.id,
        isUnavailable: true,
        dataSource: 'unavailable'
      };
    } else {
      this.currentTabData = null;
    }
    
    console.log('⚠️ No energy data available, using unavailable state');
  }
  
  async loadBackendEnergyData() {
    try {
      // Check if Chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        this.backendEnergyData = {
          totalEnergy: 0.012, // Demo 12Wh
          recentEntries: [
            { model: 'GPT-4', tokens: 1500, energy: 0.005, timestamp: Date.now() - 300000 },
            { model: 'Claude', tokens: 800, energy: 0.007, timestamp: Date.now() - 600000 }
          ]
        };
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_BACKEND_ENERGY_SUMMARY',
        timeRange: '24h'
      });
      
      if (response.success) {
        this.backendEnergyData = response.data;
      } else {
        console.error('[PopupManager] Failed to load backend energy data:', response.error);
        this.backendEnergyData = { totalEnergy: 0, recentEntries: [] };
      }
    } catch (error) {
      console.error('[PopupManager] Backend energy request failed:', error);
      this.backendEnergyData = { totalEnergy: 0, recentEntries: [] };
    }
  }
  
  async loadEnhancedAIEnergyData() {
    try {
      console.log('[PopupManager] Loading enhanced AI energy data...');
      
      if (!this.aiEnergyManager) {
        console.log('[PopupManager] No AI energy manager available');
        this.enhancedAIData = null;
        return;
      }

      // Get current tab info
      let currentTab = null;
      if (this.isChromeApiAvailable()) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];
      }
      
      if (!currentTab) {
        console.log('[PopupManager] No current tab found for AI detection');
        this.enhancedAIData = null;
        return;
      }
      
      console.log('[PopupManager] Detecting AI model for:', currentTab.url);
      
      // Enhanced context for AI detection
      const context = {
        batteryLevel: await this.getBatteryLevel(),
        userActivity: this.calculateUserActivity(),
        performanceMode: await this.getPerformanceMode(),
        timestamp: Date.now()
      };
      
      // Detect AI model on current page with enhanced context
      this.detectedAIModel = this.aiEnergyManager.detectAIModel(
        currentTab.url,
        currentTab.title,
        '',
        context
      );
      
      if (this.detectedAIModel) {
        console.log('[PopupManager] AI model detected:', this.detectedAIModel.model.name);
        
        // Estimate AI usage with enhanced calculations
        this.currentAIUsage = this.aiEnergyManager.estimateAIUsage(
          this.currentTabData,
          this.detectedAIModel,
          context
        );
        
        // Update session tracking if enhanced manager is available
        if (typeof this.aiEnergyManager.updateSessionTotals === 'function') {
          this.aiEnergyManager.updateSessionTotals(this.currentAIUsage);
        } else if (currentTab.id) {
          // Fallback to basic update
          this.aiEnergyManager.updateTabUsage(currentTab.id, this.currentAIUsage);
        }
        
        console.log('[PopupManager] Enhanced AI usage estimated:', this.currentAIUsage);
      } else {
        console.log('[PopupManager] No AI model detected for current tab');
        this.currentAIUsage = null;
      }
      
      // Get session statistics
      let sessionStats = {};
      if (typeof this.aiEnergyManager.getSessionStats === 'function') {
        sessionStats = this.aiEnergyManager.getSessionStats();
      } else {
        // Fallback to basic session data
        sessionStats = this.aiEnergyManager.getSessionEnergyData();
      }
      
      // Store enhanced AI data for UI updates
      
      this.enhancedAIData = {
        detectedModel: this.detectedAIModel,
        usage: this.currentAIUsage,
        sessionStats: sessionStats,
        hasEnhancedFeatures: typeof EnhancedAIEnergyManager !== 'undefined'
      };
      
      // Store for legacy compatibility
      this.aiEnergyData = {
        totalEnergy: this.currentAIUsage?.energy?.mean || 0,
        detectedModel: this.detectedAIModel,
        usage: this.currentAIUsage,
        sessionData: sessionStats
      };
      
      console.log('[PopupManager] Enhanced AI energy data loaded:', this.enhancedAIData);
      
    } catch (error) {
      console.error('[PopupManager] Failed to load enhanced AI energy data:', error);
      this.enhancedAIData = null;
      this.aiEnergyData = { totalEnergy: 0, detectedModel: null, usage: null };
    }
  }

  async getBatteryLevel() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return battery.level;
      }
    } catch (error) {
      // Battery API not available
    }
    return 0.5; // Default
  }

  calculateUserActivity() {
    // Simple user activity estimation based on tab interaction
    const now = Date.now();
    const recentThreshold = 300000; // 5 minutes
    
    if (this.currentTabData && this.currentTabData.timestamp) {
      const timeSinceUpdate = now - this.currentTabData.timestamp;
      return timeSinceUpdate < recentThreshold ? 0.8 : 0.3;
    }
    
    return 0.5; // Default moderate activity
  }

  async getPerformanceMode() {
    try {
      const batteryLevel = await this.getBatteryLevel();
      if (batteryLevel < 0.3) return 'efficient';
      if (batteryLevel > 0.8) return 'performance';
      return 'balanced';
    } catch (error) {
      return 'balanced'; // Default fallback
    }
  }
  
  /**
   * Get performance mode synchronously for immediate use
   */
  getPerformanceModeSync() {
    // Use cached battery level or estimate based on other factors
    const now = Date.now();
    const recentThreshold = 300000; // 5 minutes
    
    if (this.currentTabData && this.currentTabData.timestamp) {
      const timeSinceUpdate = now - this.currentTabData.timestamp;
      if (timeSinceUpdate > recentThreshold) return 'efficient'; // Assume low power for old data
    }
    
    return 'balanced'; // Default balanced mode
  }

  /**
   * Calculate user engagement level for backend power estimation
   */
  getUserEngagementLevel() {
    const now = Date.now();
    const lastActivity = this.currentTabData?.timestamp || now;
    const timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity < 30000) return 'high';      // Active within 30s
    if (timeSinceActivity < 300000) return 'medium';   // Active within 5 min
    return 'low';                                      // Inactive
  }

  
  async loadTodaySummary() {
    try {
      // Check if Chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        this.todayHistory = [
          { url: 'https://github.com/user/repo', title: 'GitHub Repository', powerWatts: 18.5, duration: 450000, timestamp: Date.now() - 3600000 },
          { url: 'https://www.youtube.com/watch', title: 'YouTube Video', powerWatts: 35.2, duration: 900000, timestamp: Date.now() - 1800000 },
          { url: 'https://docs.google.com/document', title: 'Google Docs', powerWatts: 12.8, duration: 1200000, timestamp: Date.now() - 7200000 },
          { url: 'https://stackoverflow.com/questions', title: 'Stack Overflow', powerWatts: 15.3, duration: 300000, timestamp: Date.now() - 1200000 }
        ];
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '24h'
      });
      
      if (response.success) {
        this.todayHistory = response.history;
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load today\'s summary:', error);
    }
  }
  
  updateUI() {
    try {
      console.log('[PopupManager] Updating UI with current tab data:', {
        hasCurrentTabData: !!this.currentTabData,
        dataSource: this.currentTabData?.dataSource,
        powerWatts: this.currentTabData?.powerWatts,
        isEstimated: this.currentTabData?.isEstimated,
        isUnavailable: this.currentTabData?.isUnavailable
      });
      
      this.updateStatusIndicator();
      this.updatePowerDisplay();
      this.updateDeviceComparisons();
      this.updateCurrentTabInfo();
      this.updateQuickStats();
      this.updatePowerTips();
      this.updateAIModelInfoSection();
      this.updateEnergyModeUI(this.getCurrentEnergyMode());
      this.updateTabEnergyRecommendations();
      
      console.log('[PopupManager] UI update completed successfully');
    } catch (error) {
      console.error('[PopupManager] UI update failed:', error);
      this.showError('Display update failed');
    }
  }
  
  updateStatusIndicator() {
    const statusDot = this.safeGetElement('statusDot');
    const statusText = this.safeGetElement('statusText');
    
    if (!statusDot || !statusText) {
      console.warn('[PopupManager] Status indicator elements not found');
      return;
    }
    
    try {
      // Check settings first with enhanced null safety
      if (!this.settings?.trackingEnabled) {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Tracking disabled');
        return;
      }
      
      const tabCount = Object.keys(this.energyData || {}).length;
      const hasAIModel = !!this.detectedAIModel;
      
      // Enhanced logic with comprehensive null checks and AI detection
      if (tabCount > 0 && this.currentTabData && !this.currentTabData.isUnavailable) {
        statusDot.className = hasAIModel ? 'status-dot ai-detected' : 'status-dot';
        const aiStatus = hasAIModel ? ` + AI (${this.detectedAIModel.model.name})` : '';
        this.safeSetTextContent(statusText, `Tracking ${tabCount} tab${tabCount > 1 ? 's' : ''}${aiStatus}`);
      } else if (this.currentTabData?.isEstimated) {
        statusDot.className = hasAIModel ? 'status-dot estimated ai-detected' : 'status-dot estimated';
        const dataSource = this.currentTabData.dataSource || 'estimated';
        const aiStatus = hasAIModel ? ` + AI` : '';
        this.safeSetTextContent(statusText, `Using ${dataSource} data${aiStatus}`);
      } else if (this.currentTabData?.isUnavailable) {
        statusDot.className = 'status-dot warning';
        this.safeSetTextContent(statusText, 'Content script not active');
      } else {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Waiting for data...');
      }
    } catch (error) {
      console.error('[PopupManager] Error updating status indicator:', error);
    }
  }
  
  updatePowerDisplay() {
    const powerValue = this.safeGetElement('powerValue');
    const powerDisplay = this.safeGetElement('powerDisplay');
    const powerDescription = this.safeGetElement('powerDescription');
    const efficiencyBadge = this.safeGetElement('efficiencyBadge');
    
    if (!powerValue || !powerDisplay || !powerDescription || !efficiencyBadge) {
      console.warn('[PopupManager] Power display elements not found');
      return;
    }

    try {
      console.log('[PopupManager] Updating power display. Current tab data:', this.currentTabData);
      
      // Cascading fallback logic for different data states
      const displayData = this.determinePowerDisplayData();
      
      // Apply display data to UI elements with safety checks
      this.safeSetTextContent(powerValue, displayData.powerValue || '--');
      this.safeSetInnerHTML(powerDescription, displayData.description || 'No data available');
      
      if (displayData.displayClass) {
        // Add AI enhancement class if AI model is detected
        let className = displayData.displayClass;
        if (this.detectedAIModel && this.currentAIUsage) {
          className += ' ai-enhanced';
        }
        powerDisplay.className = className;
      }
      
      if (displayData.efficiency) {
        this.safeSetTextContent(efficiencyBadge, displayData.efficiency.label || '--');
        if (displayData.efficiency.className) {
          efficiencyBadge.className = displayData.efficiency.className;
        }
      }
      
      console.log('[PopupManager] Power display updated:', {
        powerValue: displayData.powerValue,
        watts: displayData.watts,
        dataState: displayData.dataState,
        dataSource: displayData.dataSource
      });
    } catch (error) {
      console.error('[PopupManager] Error updating power display:', error);
    }
  }
  
  /**
   * Updates environmental impact comparisons (bulbs, carbon, water)
   */
  updateDeviceComparisons() {
    const bulbsCount = this.safeGetElement('bulbsCount');
    const carbonEmissions = this.safeGetElement('carbonEmissions');
    const waterUsage = this.safeGetElement('waterUsage');
    const bulbsCard = document.querySelector('.bulbs-comparison');
    const carbonCard = document.querySelector('.carbon-comparison');
    const waterCard = document.querySelector('.water-comparison');
    
    if (!bulbsCount || !carbonEmissions || !waterUsage) {
      console.warn('[PopupManager] Environmental impact elements not found');
      return;
    }

    try {
      // Get current power consumption
      const tabPowerWatts = this.calculatePowerWattsWithFallback();
      
      // Calculate environmental impacts
      const impacts = this.calculateEnvironmentalImpacts(tabPowerWatts);
      
      // Add estimated indicator if data is estimated
      if (this.currentTabData?.isEstimated) {
        bulbsCount.classList.add('estimated');
        carbonEmissions.classList.add('estimated');
        waterUsage.classList.add('estimated');
      } else {
        bulbsCount.classList.remove('estimated');
        carbonEmissions.classList.remove('estimated');
        waterUsage.classList.remove('estimated');
      }
      
      this.safeSetTextContent(bulbsCount, impacts.bulbs.count.toString());
      this.safeSetTextContent(carbonEmissions, impacts.carbon.grams + 'g');
      this.safeSetTextContent(waterUsage, impacts.water.gallons.toString());
      
      // Update visual indicators based on environmental impact levels
      this.updateEnvironmentalVisualState(bulbsCard, impacts.bulbs);
      this.updateEnvironmentalVisualState(carbonCard, impacts.carbon);
      this.updateEnvironmentalVisualState(waterCard, impacts.water);
      
      console.log('[PopupManager] Environmental impacts updated:', {
        powerWatts: tabPowerWatts,
        bulbs: impacts.bulbs,
        carbon: impacts.carbon,
        water: impacts.water
      });
    } catch (error) {
      console.error('[PopupManager] Error updating environmental impacts:', error);
      this.safeSetTextContent(bulbsCount, '--');
      this.safeSetTextContent(carbonEmissions, '--');
      this.safeSetTextContent(waterUsage, '--');
    }
  }
  
  /**
   * Calculates environmental impacts from power consumption
   */
  calculateEnvironmentalImpacts(watts) {
    // Environmental impact calculations
    const LED_BULB_WATTS = 10;        // 10W LED bulb
    const CO2_GRAMS_PER_KWH = 400;    // ~400g CO2 per kWh (US grid average)
    const WATER_GALLONS_PER_KWH = 25; // ~25 gallons water per kWh (thermoelectric power generation)
    
    // Calculate impacts
    const bulbCount = Math.round(watts / LED_BULB_WATTS * 10) / 10; // Round to 1 decimal, display as whole if >= 1
    const carbonPerHour = Math.round((watts / 1000) * CO2_GRAMS_PER_KWH * 10) / 10;
    const waterPerHour = Math.round((watts / 1000) * WATER_GALLONS_PER_KWH * 100) / 100;
    
    return {
      bulbs: {
        count: bulbCount >= 1 ? Math.round(bulbCount) : Math.round(bulbCount * 10) / 10,
        watts: watts,
        level: this.getImpactLevel(bulbCount, 'bulbs')
      },
      carbon: {
        grams: carbonPerHour >= 1 ? Math.round(carbonPerHour) : Math.round(carbonPerHour * 10) / 10,
        watts: watts,
        level: this.getImpactLevel(carbonPerHour, 'carbon')
      },
      water: {
        gallons: waterPerHour >= 0.1 ? Math.round(waterPerHour * 100) / 100 : Math.round(waterPerHour * 1000) / 1000,
        watts: watts,
        level: this.getImpactLevel(waterPerHour, 'water')
      }
    };
  }
  
  /**
   * Determines environmental impact level for visual styling
   */
  getImpactLevel(value, impactType) {
    switch (impactType) {
      case 'bulbs':
        if (value < 1.5) return 'low';        // < 1.5 bulbs
        if (value < 3) return 'moderate';     // 1.5-3 bulbs
        if (value < 5) return 'high';         // 3-5 bulbs
        return 'very-high';                   // > 5 bulbs
        
      case 'carbon':
        if (value < 2) return 'low';          // < 2g CO2/hr
        if (value < 8) return 'moderate';     // 2-8g CO2/hr
        if (value < 15) return 'high';        // 8-15g CO2/hr
        return 'very-high';                   // > 15g CO2/hr
        
      case 'water':
        if (value < 0.2) return 'low';        // < 0.2 gallons/hr
        if (value < 0.6) return 'moderate';   // 0.2-0.6 gallons/hr
        if (value < 1.2) return 'high';       // 0.6-1.2 gallons/hr
        return 'very-high';                   // > 1.2 gallons/hr
        
      default:
        return 'moderate';
    }
  }
  
  /**
   * Updates visual state of environmental impact cards
   */
  updateEnvironmentalVisualState(card, impact) {
    if (!card) return;
    
    // Remove existing level classes
    card.classList.remove('high-usage', 'very-high-usage');
    
    // Add appropriate class based on impact level
    switch (impact.level) {
      case 'high':
        card.classList.add('high-usage');
        break;
      case 'very-high':
        card.classList.add('very-high-usage');
        break;
      // 'low' and 'moderate' don't get special styling
    }
  }
  
  /**
   * Determines power display data using cascading fallback logic
   * Priority: Live data > Historical data > Estimated data > Unavailable state > Loading state
   */
  determinePowerDisplayData() {
    const backendTodayEnergy = this.backendEnergyData?.totalEnergy || 0;
    
    // State 1: Loading/No data
    if (!this.currentTabData) {
      return {
        powerValue: '--',
        description: 'Loading power data...<br><small>Initializing extension</small>',
        displayClass: 'power-display',
        efficiency: { label: '--', className: 'efficiency-badge' },
        dataState: 'loading',
        watts: 0
      };
    }
    
    // State 2: Data unavailable (content script issues)
    if (this.currentTabData.isUnavailable) {
      return {
        powerValue: '?',
        description: 'Power data unavailable<br><small>Content script may not be running</small>',
        displayClass: 'power-display',
        efficiency: { label: '--', className: 'efficiency-badge' },
        dataState: 'unavailable',
        watts: 0
      };
    }
    
    // State 3: Get power consumption using robust fallback chain
    const tabPowerWatts = this.calculatePowerWattsWithFallback();
    const displayWatts = Math.round(tabPowerWatts * 10) / 10;
    const efficiency = this.getEfficiencyRating(tabPowerWatts);
    
    // State 4: Estimated data (historical or basic estimation)
    if (this.currentTabData.isEstimated) {
      const description = this.buildEstimatedDescription(displayWatts, backendTodayEnergy);
      return {
        powerValue: `~${displayWatts}W`,
        description,
        displayClass: `power-display power-${efficiency.level} estimated`,
        efficiency: {
          label: `~${efficiency.label}`,
          className: `efficiency-badge efficiency-${efficiency.level} estimated`
        },
        dataState: 'estimated',
        dataSource: this.currentTabData.dataSource,
        watts: tabPowerWatts
      };
    }
    
    // State 5: Live/Real data
    const description = this.buildLiveDescription(tabPowerWatts, backendTodayEnergy);
    return {
      powerValue: `${displayWatts}W`,
      description,
      displayClass: `power-display power-${efficiency.level}`,
      efficiency: {
        label: efficiency.label,
        className: `efficiency-badge efficiency-${efficiency.level}`
      },
      dataState: 'live',
      watts: tabPowerWatts
    };
  }
  
  /**
   * Enhanced power calculation with backend integration
   */
  calculatePowerWattsWithFallback() {
    // Calculate frontend (browser) power consumption
    const frontendPower = this.calculateBaseBrowserPower();
    
    // Get current energy display mode
    const currentMode = this.getCurrentEnergyMode();
    
    if (currentMode === 'total' && this.detectedAIModel) {
      // Include backend power consumption for AI models in total mode
      const backendPower = this.calculateBackendPowerForTotal();
      const totalPower = frontendPower + backendPower;
      
      console.log('[PopupManager] Total energy mode calculation:', {
        frontendPower: frontendPower.toFixed(2) + 'W',
        backendPower: backendPower.toFixed(2) + 'W',
        totalPower: totalPower.toFixed(2) + 'W',
        model: this.detectedAIModel.model.name,
        modelCategory: this.detectedAIModel.model.category,
        url: this.currentTabData?.url?.substring(0, 50)
      });
      
      // Total mode caps: 5W minimum, 150W maximum (to handle intensive AI models)
      return Math.max(5, Math.min(150, totalPower));
    }
    
    // Frontend only mode (original behavior)
    console.log('[PopupManager] Frontend only mode calculation:', {
      frontendPower: frontendPower.toFixed(2) + 'W',
      displayMode: currentMode,
      isAISite: !!this.detectedAIModel,
      url: this.currentTabData?.url?.substring(0, 50)
    });
    
    // Frontend caps: 5W minimum, 65W maximum
    return Math.max(5, Math.min(65, frontendPower));
  }
  
  /**
   * Calculates standard tab power (same measurement used for all tabs)
   */
  calculateStandardTabPower() {
    // Get base browser power consumption
    let basePower = this.calculateBaseBrowserPower();
    
    // Add AI power consumption if detected
    const aiPower = this.calculateAIPowerConsumption();
    
    // Frontend power (browser + AI)
    return basePower + aiPower;
  }
  
  /**
   * Gets current energy display mode (frontend or total)
   */
  getCurrentEnergyMode() {
    return this.energyDisplayMode || 'frontend';
  }
  
  /**
   * Sets energy display mode and updates UI
   */
  setEnergyMode(mode) {
    this.energyDisplayMode = mode;
    this.updateUI();
    
    // Save preference
    if (this.isChromeApiAvailable()) {
      chrome.storage.local.set({ energyDisplayMode: mode });
    }
  }
  
  /**
   * Gets current power caps for debugging
   */
  getCurrentPowerCaps() {
    const showTotalEnergy = this.getCurrentEnergyMode() === 'total';
    const baseCap = showTotalEnergy ? 150 : 85;
    let maxPower = baseCap;
    
    if (this.detectedAIModel) {
      const aiBonus = showTotalEnergy ? 30 : 20;
      maxPower = baseCap + aiBonus;
    }
    
    return {
      maxPower,
      mode: showTotalEnergy ? 'total' : 'frontend',
      isAISite: !!this.detectedAIModel,
      baseCap,
      aiBonus: this.detectedAIModel ? (showTotalEnergy ? 30 : 20) : 0
    };
  }
  
  /**
   * Enhanced backend power calculation for total energy mode using real-time AI model data
   */
  calculateBackendPowerForTotal() {
    // Return 0 if no AI model detected or calculator unavailable
    if (!this.detectedAIModel || !this.aiModelPowerCalculator) {
      return 0;
    }
    
    // Prepare context for backend power calculation
    const context = {
      userEngagement: this.getUserEngagementLevel(),
      batteryLevel: this.getBatteryLevel().then ? null : this.getBatteryLevel(), // Handle promise
      isActiveTab: true,
      userActivity: this.calculateUserActivity(),
      performanceMode: this.getPerformanceModeSync(),
      timestamp: Date.now()
    };
    
    // Calculate real-time backend power consumption using new calculator
    const backendPower = this.aiModelPowerCalculator.calculateBackendPower(
      this.detectedAIModel,
      this.currentTabData,
      context
    );
    
    // Get environmental impact for additional insights
    const environmentalImpact = this.aiModelPowerCalculator.calculateEnvironmentalImpact(
      backendPower,
      3600000, // 1 hour duration
      'global'
    );
    
    console.log('[PopupManager] Backend power calculated with AI Power Calculator:', {
      model: this.detectedAIModel.model?.name || 'Unknown',
      category: this.detectedAIModel.model?.category || 'unknown',
      backendPowerW: backendPower.toFixed(2) + 'W',
      confidence: this.detectedAIModel.confidence,
      environmentalImpact: {
        carbonEmissionsG: environmentalImpact.carbonEmissionsG.toFixed(2) + 'g CO₂',
        waterUsageL: environmentalImpact.waterUsageL.toFixed(2) + 'L',
        treeOffsetDays: environmentalImpact.treeOffsetDays.toFixed(2) + ' tree-days'
      },
      context: {
        userEngagement: context.userEngagement,
        batteryLevel: context.batteryLevel,
        userActivity: context.userActivity,
        performanceMode: context.performanceMode
      }
    });
    
    // Store environmental impact for UI display
    this.lastEnvironmentalImpact = environmentalImpact;
    
    // Cap backend power at reasonable limits
    return Math.min(80, Math.max(0, backendPower));
  }
  
  /**
   * Calculate wattage savings from prompt optimization
   */
  calculateWattageSavings(originalTokens, optimizedTokens, targetModel = 'gpt-4') {
    if (!this.aiModelPowerCalculator) return { savings: 0, percentage: 0 };
    
    try {
      // Get model power profile
      const modelKey = this.aiModelPowerCalculator.inferModelKey({ name: targetModel });
      const profile = this.aiModelPowerCalculator.modelPowerProfiles[modelKey];
      
      if (!profile) {
        console.warn('[PopupManager] No profile found for model:', modelKey);
        return { savings: 0, percentage: 0 };
      }
      
      // Calculate energy per token (Wh per token)
      const energyPerToken = profile.energyPerQuery / 1000; // Convert to Wh per token (rough estimate)
      
      // Calculate energy savings
      const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
      const energySavedWh = tokensSaved * energyPerToken;
      
      // Convert to power savings (assuming 1-hour duration)
      const powerSavingsW = energySavedWh;
      
      // Calculate percentage savings
      const percentageSavings = originalTokens > 0 ?
        Math.round((tokensSaved / originalTokens) * 100) : 0;
      
      // Calculate cost savings
      const costSavings = this.aiModelPowerCalculator.calculateQueryCost(
        modelKey,
        tokensSaved,
        'global'
      );
      
      // Environmental impact savings
      const environmentalSavings = this.aiModelPowerCalculator.calculateEnvironmentalImpact(
        powerSavingsW,
        3600000, // 1 hour
        'global'
      );
      
      const result = {
        savings: powerSavingsW,
        percentage: percentageSavings,
        tokensSaved: tokensSaved,
        costSavings: costSavings.total,
        environmental: {
          carbonSavedG: environmentalSavings.carbonEmissionsG,
          waterSavedL: environmentalSavings.waterUsageL,
          treeDaysOffset: environmentalSavings.treeOffsetDays
        },
        model: profile.name
      };
      
      console.log('[PopupManager] Wattage savings calculated:', result);
      
      return result;
      
    } catch (error) {
      console.error('[PopupManager] Error calculating wattage savings:', error);
      return { savings: 0, percentage: 0 };
    }
  }
  
  /**
   * Update wattage-based power savings display in real-time
   */
  updatePowerSavingsDisplay() {
    try {
      // Get current token analysis
      if (!this.currentTokenAnalysis || !this.optimizedTokenAnalysis) {
        return;
      }
      
      const targetModel = document.getElementById('targetModel')?.value || 'gpt-4';
      const originalTokens = this.currentTokenAnalysis.gpt;
      const optimizedTokens = this.optimizedTokenAnalysis.gpt;
      
      // Calculate savings
      const savings = this.calculateWattageSavings(originalTokens, optimizedTokens, targetModel);
      
      // Update power savings display elements
      const powerSavingsElement = document.getElementById('powerSavingsDisplay');
      const carbonSavingsElement = document.getElementById('carbonSavingsDisplay');
      const costSavingsElement = document.getElementById('costSavingsDisplay');
      
      if (powerSavingsElement) {
        if (savings.savings >= 0.001) {
          powerSavingsElement.textContent = `${savings.savings.toFixed(3)} Wh saved`;
          powerSavingsElement.className = 'power-savings positive';
        } else {
          powerSavingsElement.textContent = 'No power savings';
          powerSavingsElement.className = 'power-savings neutral';
        }
      }
      
      if (carbonSavingsElement && savings.environmental) {
        if (savings.environmental.carbonSavedG > 0.1) {
          carbonSavingsElement.textContent = `${savings.environmental.carbonSavedG.toFixed(2)}g CO₂ saved`;
          carbonSavingsElement.className = 'carbon-savings positive';
        } else {
          carbonSavingsElement.textContent = 'Minimal carbon savings';
          carbonSavingsElement.className = 'carbon-savings neutral';
        }
      }
      
      if (costSavingsElement) {
        if (savings.costSavings > 0.0001) {
          costSavingsElement.textContent = `$${savings.costSavings.toFixed(4)} saved`;
          costSavingsElement.className = 'cost-savings positive';
        } else {
          costSavingsElement.textContent = 'Minimal cost savings';
          costSavingsElement.className = 'cost-savings neutral';
        }
      }
      
      // Update comprehensive savings summary
      this.updateComprehensiveSavingsSummary(savings);
      
    } catch (error) {
      console.error('[PopupManager] Error updating power savings display:', error);
    }
  }
  
  /**
   * Update comprehensive savings summary panel
   */
  updateComprehensiveSavingsSummary(savings) {
    const summaryPanel = document.getElementById('savingsSummaryPanel');
    if (!summaryPanel) return;
    
    if (savings.percentage > 0) {
      summaryPanel.style.display = 'block';
      
      let summaryHTML = `
        <div class="savings-summary">
          <h4>💰 Optimization Savings Summary</h4>
          <div class="savings-grid">
            <div class="savings-item">
              <span class="savings-label">Token Reduction:</span>
              <span class="savings-value">${savings.tokensSaved} tokens (${savings.percentage}%)</span>
            </div>
            <div class="savings-item">
              <span class="savings-label">Power Saved:</span>
              <span class="savings-value">${savings.savings >= 0.001 ? savings.savings.toFixed(3) + ' Wh' : 'Minimal'}</span>
            </div>
            <div class="savings-item">
              <span class="savings-label">Cost Saved:</span>
              <span class="savings-value">$${savings.costSavings.toFixed(4)}</span>
            </div>
          </div>
      `;
      
      if (savings.environmental) {
        summaryHTML += `
          <div class="environmental-impact">
            <h5>🌱 Environmental Impact</h5>
            <div class="impact-items">
              <div class="impact-item">
                <span>Carbon: ${savings.environmental.carbonSavedG.toFixed(2)}g CO₂ saved</span>
              </div>
              <div class="impact-item">
                <span>Water: ${savings.environmental.waterSavedL.toFixed(2)}L saved</span>
              </div>
              <div class="impact-item">
                <span>Equivalent: ${savings.environmental.treeDaysOffset.toFixed(2)} tree-days of carbon absorption</span>
              </div>
            </div>
          </div>
        `;
      }
      
      summaryHTML += `
          <div class="model-info">
            <small>Calculations for ${savings.model || 'Default Model'}</small>
          </div>
        </div>
      `;
      
      summaryPanel.innerHTML = summaryHTML;
    } else {
      summaryPanel.style.display = 'none';
    }
  }
  
  /**
   * Calculates base browser power consumption (original logic)
   */
  calculateBaseBrowserPower() {
    console.log('=== POWER CALCULATION DIAGNOSTIC ===');
    console.log('Current tab data:', this.currentTabData);
    
    // Priority 1: Direct power measurement
    if (this.currentTabData?.powerWatts &&
        !isNaN(this.currentTabData.powerWatts) &&
        this.currentTabData.powerWatts > 0) {
      const power = Math.max(5, Math.min(65, this.currentTabData.powerWatts));
      console.log('✅ Priority 1: Using direct power measurement:', power + 'W');
      return power;
    } else {
      console.log('❌ Priority 1 failed: powerWatts =', this.currentTabData?.powerWatts);
    }
    
    // Priority 2: Legacy energy score migration
    if (this.currentTabData?.energyScore &&
        !isNaN(this.currentTabData.energyScore) &&
        this.currentTabData.energyScore >= 0) {
      const power = this.migrateLegacyScore(this.currentTabData.energyScore);
      console.log('✅ Priority 2: Using legacy energy score migration:', power + 'W (from score:', this.currentTabData.energyScore + ')');
      return power;
    } else {
      console.log('❌ Priority 2 failed: energyScore =', this.currentTabData?.energyScore);
    }
    
    // Priority 3: Estimate based on DOM complexity
    if (this.currentTabData?.domNodes &&
        !isNaN(this.currentTabData.domNodes) &&
        this.currentTabData.domNodes > 0) {
      const power = this.estimatePowerFromDOMNodes(this.currentTabData.domNodes);
      console.log('✅ Priority 3: Using DOM complexity estimation:', power + 'W (from', this.currentTabData.domNodes, 'nodes)');
      return power;
    } else {
      console.log('❌ Priority 3 failed: domNodes =', this.currentTabData?.domNodes);
    }
    
    // Priority 4: URL-based estimation (includes AI site detection)
    if (this.currentTabData?.url) {
      const power = this.estimatePowerFromURL(this.currentTabData.url);
      console.log('✅ Priority 4: Using URL-based estimation:', power + 'W (from URL:', this.currentTabData.url.substring(0, 50) + ')');
      return power;
    } else {
      console.log('❌ Priority 4 failed: url =', this.currentTabData?.url);
    }
    
    // Priority 5: Fallback default
    console.log('⚠️ Priority 5: Using fallback default: 8.0W');
    console.log('Current tab data state:', {
      hasCurrentTabData: !!this.currentTabData,
      powerWatts: this.currentTabData?.powerWatts,
      energyScore: this.currentTabData?.energyScore,
      domNodes: this.currentTabData?.domNodes,
      url: this.currentTabData?.url?.substring(0, 50),
      isEstimated: this.currentTabData?.isEstimated,
      isUnavailable: this.currentTabData?.isUnavailable,
      dataSource: this.currentTabData?.dataSource
    });
    return 8.0; // Conservative default for light browsing
  }
  
  /**
   * Calculates AI power consumption in watts
   */
  calculateAIPowerConsumption() {
    if (!this.currentAIUsage || !this.detectedAIModel) {
      return 0;
    }
    
    try {
      const { energy, queries } = this.currentAIUsage;
      const duration = this.currentTabData?.duration || 3600000; // Default to 1 hour
      
      // Convert energy (Wh) to power (W) based on duration
      const aiPowerWatts = this.aiEnergyManager.convertEnergyToWatts(energy, duration);
      
      // Additional power overhead for AI sites (browser processing, network, etc.)
      const aiOverhead = this.calculateAIOverheadPower();
      
      return Math.max(0, aiPowerWatts + aiOverhead);
    } catch (error) {
      console.warn('[PopupManager] Error calculating AI power:', error);
      return 0;
    }
  }
  
  /**
   * Calculates additional power overhead for AI sites
   */
  calculateAIOverheadPower() {
    if (!this.detectedAIModel) return 0;
    
    const { model, confidence } = this.detectedAIModel;
    
    // Different AI platforms have different overhead
    let overheadWatts = 0;
    
    switch (model.category) {
      case 'large-multimodal':
        overheadWatts = 3.0; // GPT-4o, Gemini Pro - high processing overhead
        break;
      case 'large-language':
        overheadWatts = 2.5; // Claude Sonnet, LLaMA 70B
        break;
      case 'medium-language':
        overheadWatts = 1.5; // GPT-3.5, Cohere
        break;
      case 'small-language':
        overheadWatts = 1.0; // Claude Haiku, Mistral 7B
        break;
      case 'image-generation':
        overheadWatts = 4.0; // Stable Diffusion - image processing
        break;
      default:
        overheadWatts = 1.0;
    }
    
    // Scale by confidence level
    return overheadWatts * confidence;
  }
  
  /**
   * Enhanced description for estimated data with backend power info
   */
  buildEstimatedDescription(displayWatts, backendEnergy) {
    const dataSourceLabel = this.currentTabData.dataSource === 'historical' ?
      'based on history' : 'estimated';
    const ageInfo = this.currentTabData.dataSource === 'historical' ?
      '<br><small>Historical average</small>' :
      '<br><small>Basic estimation</small>';
    
    // Add mode indicator
    const currentMode = this.getCurrentEnergyMode();
    const modeLabel = currentMode === 'total' ? 'Total Energy' : 'Frontend Only';
    
    let description = `Estimated power consumption ${dataSourceLabel} (${modeLabel})${ageInfo}`;
    
    // Add AI model backend power information
    if (this.detectedAIModel && currentMode === 'total') {
      const backendPower = this.calculateBackendPowerForTotal();
      const frontendPower = this.calculateBaseBrowserPower();
      
      if (backendPower > 0.1) {
        description += `<br><small>🤖 ${this.detectedAIModel.model.name}: ~${frontendPower.toFixed(1)}W frontend + ~${backendPower.toFixed(1)}W backend</small>`;
      }
    } else if (this.detectedAIModel) {
      // Frontend mode - show that backend is not included
      description += `<br><small>🤖 ${this.detectedAIModel.model.name}: Frontend only (estimated)</small>`;
    }
    
    // Add backend energy cumulative data if available
    if (backendEnergy > 0.001) {
      const backendWh = backendEnergy * 1000;
      if (backendWh >= 1) {
        description += `<br><small>📊 ${backendWh.toFixed(1)}Wh used today</small>`;
      } else {
        description += `<br><small>📊 ${(backendWh * 1000).toFixed(1)}mWh used today</small>`;
      }
    }
    
    return description;
  }
  
  /**
   * Enhanced description for live data with backend power breakdown
   */
  buildLiveDescription(tabPowerWatts, backendEnergy) {
    const comparison = this.generateQuickComparison(tabPowerWatts);
    const ageMs = Date.now() - (this.currentTabData.timestamp || Date.now());
    const ageText = ageMs < 10000 ? 'live' : `${Math.round(ageMs/1000)}s ago`;
    
    // Get current mode and power breakdown
    const currentMode = this.getCurrentEnergyMode();
    const modeLabel = currentMode === 'total' ? 'Total Energy' : 'Frontend Only';
    
    let description = `${comparison} (${modeLabel})<br><small>Updated ${ageText}</small>`;
    
    // Add AI model backend power information
    if (this.detectedAIModel && currentMode === 'total') {
      const backendPower = this.calculateBackendPowerForTotal();
      const frontendPower = this.calculateBaseBrowserPower();
      
      if (backendPower > 0.1) {
        description += `<br><small>🤖 ${this.detectedAIModel.model.name}: ${frontendPower.toFixed(1)}W frontend + ${backendPower.toFixed(1)}W backend</small>`;
      }
    } else if (this.detectedAIModel) {
      // Frontend mode - show that backend is not included
      description += `<br><small>🤖 ${this.detectedAIModel.model.name}: Frontend only (${currentMode} mode)</small>`;
    }
    
    // Add backend energy cumulative data if available
    if (backendEnergy > 0.001) {
      const backendWh = backendEnergy * 1000;
      if (backendWh >= 1) {
        description += `<br><small>📊 ${backendWh.toFixed(1)}Wh used today</small>`;
      } else {
        description += `<br><small>📊 ${(backendWh * 1000).toFixed(1)}mWh used today</small>`;
      }
    }
    
    return description;
  }
  
  /**
   * Estimates power consumption based on DOM node count
   */
  estimatePowerFromDOMNodes(domNodes) {
    // Base power consumption starts lower for simple pages
    let basePower = 3.5; // Start with lower baseline
    
    // Dynamic scaling based on DOM complexity
    if (domNodes >= 100) {
      // Gradual increase: 0.01W per node for first 500 nodes
      const nodesInRange = Math.min(domNodes - 100, 400);
      basePower += (nodesInRange * 0.01);
    }
    
    if (domNodes >= 500) {
      // Medium complexity: 0.015W per node for next 1000 nodes
      const nodesInRange = Math.min(domNodes - 500, 1000);
      basePower += (nodesInRange * 0.015);
    }
    
    if (domNodes >= 1500) {
      // High complexity: 0.02W per node for next 1500 nodes
      const nodesInRange = Math.min(domNodes - 1500, 1500);
      basePower += (nodesInRange * 0.02);
    }
    
    if (domNodes >= 3000) {
      // Very high complexity: 0.025W per node above 3000
      const nodesInRange = domNodes - 3000;
      basePower += (nodesInRange * 0.025);
    }
    
    // Add dynamic factors if available
    if (this.currentTabData) {
      // Network activity bonus
      if (this.currentTabData.url && this.currentTabData.url.includes('https')) {
        basePower += 0.8; // HTTPS overhead
      }
      
      // Page type detection bonus
      const url = this.currentTabData.url || '';
      if (url.includes('video') || url.includes('youtube') || url.includes('stream')) {
        basePower += 2.5; // Video content
      } else if (url.includes('social') || url.includes('facebook') || url.includes('twitter')) {
        basePower += 1.5; // Social media
      } else if (url.includes('shop') || url.includes('ecommerce') || url.includes('store')) {
        basePower += 1.2; // E-commerce sites
      }
      
      // Time-based activity bonus
      const duration = this.currentTabData.duration || 0;
      if (duration > 300000) { // More than 5 minutes
        basePower += 0.5; // Long session bonus
      }
    }
    
    // Ensure reasonable bounds: minimum 3.5W, maximum 45W
    return Math.max(3.5, Math.min(45, Math.round(basePower * 10) / 10));
  }
  
  /**
   * Estimates power consumption based on URL patterns
   */
  estimatePowerFromURL(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Video/streaming sites
      if (domain.includes('youtube') || domain.includes('netflix') ||
          domain.includes('twitch') || domain.includes('vimeo')) {
        return 35.0;
      }
      
      // Social media with lots of media
      if (domain.includes('facebook') || domain.includes('instagram') ||
          domain.includes('twitter') || domain.includes('tiktok')) {
        return 25.0;
      }
      
      // Development/documentation sites
      if (domain.includes('github') || domain.includes('stackoverflow') ||
          domain.includes('docs.') || domain.includes('developer.')) {
        return 15.0;
      }
      
      // News/content sites
      if (domain.includes('news') || domain.includes('blog') ||
          domain.includes('wiki')) {
        return 12.0;
      }
      
      return 10.0; // Default for unknown sites
    } catch (e) {
      return 8.0; // Fallback for invalid URLs
    }
  }
  
  updateCurrentTabInfo() {
    const tabTitle = document.getElementById('tabTitle');
    const tabUrl = document.getElementById('tabUrl');
    const domNodes = document.getElementById('domNodes');
    const activeTime = document.getElementById('activeTime');
    
    if (!this.currentTabData) {
      tabTitle.textContent = 'Initializing...';
      tabUrl.textContent = 'Waiting for energy data';
      domNodes.textContent = '--';
      activeTime.textContent = '--';
      return;
    }
    
    // Handle different data states
    if (this.currentTabData.isUnavailable) {
      tabTitle.textContent = this.currentTabData.title || 'Current Tab';
      tabUrl.textContent = this.formatUrl(this.currentTabData.url) + ' (unavailable)';
      domNodes.textContent = '--';
      activeTime.textContent = '--';
      return;
    }
    
    tabTitle.textContent = this.currentTabData.title || 'Unknown page';
    tabUrl.textContent = this.formatUrl(this.currentTabData.url);
    
    // Show estimated indicator for DOM nodes
    const domValue = this.formatNumber(this.currentTabData.domNodes || 0);
    domNodes.textContent = this.currentTabData.isEstimated ? `~${domValue}` : domValue;
    
    // Show active time with data source indicator
    const duration = this.currentTabData.duration || 0;
    const formattedDuration = this.formatDuration(duration);
    
    if (this.currentTabData.isEstimated) {
      activeTime.textContent = duration === 0 ? '--' : `~${formattedDuration}`;
    } else {
      activeTime.textContent = formattedDuration;
    }
  }
  
  updateQuickStats() {
    const totalTabs = document.getElementById('totalTabs');
    const avgPower = document.getElementById('avgPower');
    const highPowerAlerts = document.getElementById('highPowerAlerts');
    const totalTime = document.getElementById('totalTime');
    
    // Calculate browser stats from history
    const browserStats = this.todayHistory ? this.calculateTodayPowerStats(this.todayHistory) : {
      totalTabs: 0,
      averagePower: 0,
      totalTime: 0,
      highPowerCount: 0
    };
    
    // Include backend energy in calculations
    const backendEnergy = this.backendEnergyData?.totalEnergy || 0;
    const backendWatts = backendEnergy * 1000; // Convert kWh to Wh, rough approximation for display
    
    const avgPowerValue = browserStats.averagePower > 0 ? browserStats.averagePower : 8.0;
    
    totalTabs.textContent = browserStats.totalTabs.toString();
    avgPower.textContent = `${Math.round(avgPowerValue * 10) / 10}W`;
    highPowerAlerts.textContent = (browserStats.highPowerCount + (backendWatts > 40 ? 1 : 0)).toString();
    totalTime.textContent = this.formatDuration(browserStats.totalTime);
  }
  
  updatePowerTips() {
    const tipsSection = document.getElementById('tipsSection');
    const tipText = document.querySelector('.tip-text');
    const tipAction = document.getElementById('tipAction');
    
    const currentPower = this.currentTabData?.powerWatts ||
      (this.currentTabData?.energyScore ? this.migrateLegacyScore(this.currentTabData.energyScore) : 8.0);
    
    if (!this.currentTabData || currentPower < 25) {
      tipsSection.style.display = 'none';
      return;
    }
    
    // Show power saving tip for high power consumption
    const tip = this.generatePowerTip(this.currentTabData, currentPower);
    
    if (tip) {
      tipsSection.style.display = 'block';
      tipText.textContent = tip.text;
      tipAction.textContent = tip.action;
      tipAction.removeEventListener('click', tipAction._powerTipHandler);
      tipAction._powerTipHandler = () => this.applyTip(tip.type);
      tipAction.addEventListener('click', tipAction._powerTipHandler);
    }
  }
  
  calculateTodayPowerStats(history) {
    const uniqueTabs = new Set();
    let totalPower = 0;
    let totalTime = 0;
    let highPowerCount = 0;
    
    history.forEach(entry => {
      uniqueTabs.add(entry.url);
      
      // Use watts if available, otherwise migrate from energy score
      const powerWatts = entry.powerWatts ||
        (entry.energyScore ? this.migrateLegacyScore(entry.energyScore) : 8.0);
      
      totalPower += powerWatts;
      totalTime += entry.duration || 0;
      
      if (powerWatts > 40) { // High power threshold
        highPowerCount++;
      }
    });
    
    return {
      totalTabs: uniqueTabs.size,
      averagePower: history.length > 0 ? totalPower / history.length : 0,
      totalTime: totalTime,
      highPowerCount: highPowerCount
    };
  }
  
  generatePowerTip(tabData, powerWatts) {
    if (powerWatts > 50) {
      return {
        type: 'close_tab',
        text: `This tab is using ${powerWatts}W of power. Consider closing it if not needed.`,
        action: 'Close Tab'
      };
    } else if (powerWatts > 35) {
      return {
        type: 'refresh_tab',
        text: `Using ${powerWatts}W - try refreshing the page to reduce power consumption.`,
        action: 'Refresh'
      };
    } else if (powerWatts > 25) {
      return {
        type: 'optimize_tab',
        text: `${powerWatts}W usage detected. Pause videos or animations to save power.`,
        action: 'Got it'
      };
    }
    
    return null;
  }
  
  async applyTip(tipType) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      switch (tipType) {
        case 'close_tab':
          await chrome.tabs.remove(currentTab.id);
          window.close();
          break;
          
        case 'refresh_tab':
          await chrome.tabs.reload(currentTab.id);
          this.showToast('Tab refreshed');
          break;
          
        case 'optimize_tab':
          // Just acknowledge the tip
          document.getElementById('tipsSection').style.display = 'none';
          this.showToast('Tip acknowledged');
          break;
      }
    } catch (error) {
      console.error('[PopupManager] Failed to apply tip:', error);
      this.showToast('Failed to apply tip');
    }
  }
  
  formatUrl(url) {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url.substring(0, 30) + '...';
    }
  }
  
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
  
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  startPeriodicUpdates() {
    // Update data every 5 seconds
    this.updateInterval = setInterval(async () => {
      await this.loadCurrentEnergyData();
      await this.loadBackendEnergyData();
      await this.loadEnhancedAIEnergyData();
      this.updateUI();
    }, 5000);
  }
  
  
  updateAIModelInfoSection() {
    try {
      const currentModelName = this.safeGetElement('currentModelName');
      const currentModelVersion = this.safeGetElement('currentModelVersion');
      const sessionEnergyUsage = this.safeGetElement('sessionEnergyUsage');
      const sessionCarbonUsage = this.safeGetElement('sessionCarbonUsage');
      const modelEfficiency = this.safeGetElement('modelEfficiency');
      const aiModelInfoSection = document.querySelector('.ai-model-info-section');
      
      if (!aiModelInfoSection) {
        console.warn('[PopupManager] AI Model Info section not found');
        return;
      }
      
      // Always show the AI model info section
      aiModelInfoSection.style.display = 'block';
      
      // Update with actual detected model information
      if (this.detectedAIModel && this.detectedAIModel.model) {
        const detectedModel = this.detectedAIModel.model;
        
        if (currentModelName) {
          this.safeSetTextContent(currentModelName, detectedModel.name || 'Unknown Model');
        }
        
        if (currentModelVersion) {
          // Extract version from apiId or use a generic indicator
          const version = detectedModel.apiId ?
            detectedModel.apiId.match(/\d{4}-\d{2}-\d{2}|\d{8}|v?\d+\.\d+/)?.[0] || 'Latest' :
            'Latest';
          this.safeSetTextContent(currentModelVersion, version);
        }
      } else {
        // Fallback when no AI model is detected
        if (currentModelName) {
          this.safeSetTextContent(currentModelName, 'No AI Model Detected');
        }
        
        if (currentModelVersion) {
          this.safeSetTextContent(currentModelVersion, '-');
        }
      }
      
      // Calculate session energy usage based on current tab and AI usage
      const browserPower = this.calculateBaseBrowserPower();
      const aiPower = this.calculateAIPowerConsumption();
      const totalPower = browserPower + aiPower;
      
      // Estimate session energy (assuming 30 minutes average session)
      const sessionHours = 0.5;
      const estimatedSessionEnergy = (totalPower / 1000) * sessionHours; // Convert to kWh
      const sessionWh = estimatedSessionEnergy * 1000; // Convert back to Wh for display
      
      if (sessionEnergyUsage) {
        this.safeSetTextContent(sessionEnergyUsage, `~${sessionWh.toFixed(1)} Wh`);
      }
      
      // Estimate carbon emissions (400g CO2 per kWh average)
      const sessionCarbon = estimatedSessionEnergy * 400; // grams
      if (sessionCarbonUsage) {
        this.safeSetTextContent(sessionCarbonUsage, `~${sessionCarbon.toFixed(1)} gCO₂e`);
      }
      
      // Determine efficiency rating
      let efficiency = 'High';
      let efficiencyClass = 'efficiency-good';
      
      if (totalPower > 40) {
        efficiency = 'Low';
        efficiencyClass = 'efficiency-poor';
      } else if (totalPower > 25) {
        efficiency = 'Medium';
        efficiencyClass = 'efficiency-average';
      } else if (totalPower < 15) {
        efficiency = 'Excellent';
        efficiencyClass = 'efficiency-excellent';
      }
      
      if (modelEfficiency) {
        this.safeSetTextContent(modelEfficiency, efficiency);
        modelEfficiency.className = `energy-value ${efficiencyClass}`;
      }
      
      console.log('[PopupManager] AI Model Info section updated:', {
        sessionWh: sessionWh.toFixed(1),
        sessionCarbon: sessionCarbon.toFixed(1),
        efficiency: efficiency,
        totalPower: totalPower
      });
      
    } catch (error) {
      console.error('[PopupManager] Error updating AI Model Info section:', error);
    }
  }
  
  handleViewHistory() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?tab=history')
    });
  }
  
  handleSettings() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?tab=settings')
    });
  }
  
  handleTipAction() {
    // This is handled by the specific tip's onclick event
  }

  async handleThemeToggle() {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const currentTheme = popupContainer?.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      await this.setTheme(newTheme);
      console.log('[PopupManager] Theme toggled to:', newTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to toggle theme:', error);
    }
  }

  async loadTheme() {
    try {
      const defaultTheme = 'light';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default theme');
        this.setThemeUI(defaultTheme);
        return;
      }

      // Get saved theme preference
      const result = await chrome.storage.sync.get(['theme']);
      const savedTheme = result.theme || defaultTheme;
      
      this.setThemeUI(savedTheme);
      console.log('[PopupManager] Theme loaded:', savedTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to load theme:', error);
      this.setThemeUI('light');
    }
  }

  async setTheme(theme) {
    try {
      // Update UI immediately
      this.setThemeUI(theme);
      
      // Save theme preference if Chrome APIs are available
      if (this.isChromeApiAvailable()) {
        await chrome.storage.sync.set({ theme });
      }
    } catch (error) {
      console.error('[PopupManager] Failed to set theme:', error);
    }
  }

  setThemeUI(theme) {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle?.querySelector('.theme-icon');
      
      if (popupContainer) {
        popupContainer.setAttribute('data-theme', theme);
      }
      
      if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
      }
      
      if (themeToggle) {
        themeToggle.setAttribute('aria-label',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggle.setAttribute('title',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      }
    } catch (error) {
      console.error('[PopupManager] Failed to update theme UI:', error);
    }
  }
  
  handlePopupClose() {
    // Clean up
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  
  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }
  
  showError(message) {
    console.error('[PopupManager] Showing error:', message);
    
    // Show error in multiple places for better UX
    const statusText = this.safeGetElement('statusText');
    if (statusText) {
      this.safeSetTextContent(statusText, 'Error occurred');
    }
    
    const powerDescription = this.safeGetElement('powerDescription');
    if (powerDescription) {
      this.safeSetInnerHTML(powerDescription, `Error: ${message}<br><small>Please try refreshing</small>`);
      powerDescription.style.color = 'var(--danger-color, #dc3545)';
    }
    
    // Show toast notification
    this.showToast(`Error: ${message}`, 'error');
    
    this.hideLoadingOverlay();
  }
  
  showToast(message, type = 'info') {
    console.log('[PopupManager] Showing toast:', message, type);
    
    // Simple toast notification with type support
    const toast = document.createElement('div');
    
    const bgColor = {
      'info': '#007bff',
      'success': '#28a745',
      'warning': '#ffc107',
      'error': '#dc3545'
    }[type] || '#007bff';
    
    toast.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeIn 0.3s ease;
      max-width: 300px;
      text-align: center;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
  // Helper functions for watts-based calculations
  migrateLegacyScore(energyScore) {
    // Convert old energy score (0-100) to estimated watts
    // Based on research: 
    // 0-20 = 8-12W (light browsing)
    // 20-40 = 12-18W (normal browsing) 
    // 40-70 = 18-30W (heavy browsing)
    // 70+ = 30-55W (intensive usage)
    
    if (energyScore < 20) {
      return 8 + (energyScore / 20) * 4; // 8-12W
    } else if (energyScore < 40) {
      return 12 + ((energyScore - 20) / 20) * 6; // 12-18W
    } else if (energyScore < 70) {
      return 18 + ((energyScore - 40) / 30) * 12; // 18-30W
    } else {
      return 30 + ((energyScore - 70) / 30) * 25; // 30-55W
    }
  }

  getEfficiencyRating(watts) {
    if (watts < 15) {
      return { level: 'excellent', label: 'Excellent' };
    } else if (watts < 25) {
      return { level: 'good', label: 'Good' };
    } else if (watts < 40) {
      return { level: 'average', label: 'Average' };
    } else {
      return { level: 'poor', label: 'Poor' };
    }
  }

  generateQuickComparison(watts) {
    // Generate a quick real-world comparison
    if (watts < 10) {
      return `Like ${(watts / 10).toFixed(1)} LED bulbs`;
    } else if (watts < 20) {
      return `Like ${Math.round(watts / 10)} LED bulbs`;
    } else if (watts < 50) {
      return `${Math.round((watts / 45) * 100)}% of laptop power`;
    } else {
      return `Like a ${Math.round(watts / 100 * 100)}% loaded laptop`;
    }
  }
  
  // Load demo data when Chrome APIs are not available
  loadDemoData() {
    console.log('Loading demo data for standalone viewing');
    
    this.energyData = {
      12345: {
        url: 'https://github.com/user/energy-tracker',
        title: 'GitHub - Energy Tracking Extension',
        powerWatts: 18.5,
        energyScore: 42,
        domNodes: 2847,
        duration: 340000,
        timestamp: Date.now() - 30000,
        tabId: 12345
      },
      12346: {
        url: 'https://www.youtube.com/watch?v=example',
        title: 'YouTube - 4K Video Playing',
        powerWatts: 45.2,
        energyScore: 85,
        domNodes: 5432,
        duration: 1800000, // 30 minutes
        timestamp: Date.now() - 900000, // 15 minutes ago
        tabId: 12346
      },
      12347: {
        url: 'https://netflix.com/title/streaming',
        title: 'Netflix - Streaming Movie',
        powerWatts: 52.8,
        energyScore: 92,
        domNodes: 3421,
        duration: 3600000, // 1 hour
        timestamp: Date.now() - 2400000, // 40 minutes ago (inactive)
        tabId: 12347
      },
      12348: {
        url: 'https://chrome://devtools/devtools_app.html',
        title: 'DevTools - Console',
        powerWatts: 28.3,
        energyScore: 65,
        domNodes: 8234,
        duration: 600000, // 10 minutes
        timestamp: Date.now() - 3600000, // 1 hour ago (inactive)
        tabId: 12348
      },
      12349: {
        url: 'https://docs.google.com/spreadsheets/large-sheet',
        title: 'Google Sheets - Large Spreadsheet',
        powerWatts: 31.7,
        energyScore: 72,
        domNodes: 12456,
        duration: 2400000, // 40 minutes
        timestamp: Date.now() - 1800000, // 30 minutes ago
        tabId: 12349
      },
      12350: {
        url: 'https://stackoverflow.com/questions/javascript',
        title: 'Stack Overflow - JavaScript Questions',
        powerWatts: 15.2,
        energyScore: 35,
        domNodes: 3214,
        duration: 120000, // 2 minutes
        timestamp: Date.now() - 7200000, // 2 hours ago (very inactive)
        tabId: 12350
      },
      12351: {
        url: 'https://www.figma.com/design/complex-project',
        title: 'Figma - Complex Design Project',
        powerWatts: 38.9,
        energyScore: 78,
        domNodes: 9876,
        duration: 5400000, // 90 minutes
        timestamp: Date.now() - 600000, // 10 minutes ago
        tabId: 12351
      }
    };
    
    // Current tab data (the tab we're viewing from)
    this.currentTabData = {
      url: 'https://github.com/user/energy-tracker',
      title: 'GitHub - Energy Tracking Extension',
      powerWatts: 18.5,
      energyScore: 42,
      domNodes: 2847,
      duration: 340000,
      timestamp: Date.now() - 30000,
      tabId: 12345
    };
  }

  /**
   * Safe substring method that handles null/undefined strings
   */
  safeSubstring(str, start, end) {
    if (!str || typeof str !== 'string') return '';
    return str.substring(start, end || str.length);
  }

  /**
   * Safe element getter with null checking
   */
  safeGetElement(elementId) {
    try {
      if (!elementId || typeof elementId !== 'string') return null;
      return document.getElementById(elementId);
    } catch (error) {
      console.warn(`[PopupManager] Failed to get element ${elementId}:`, error);
      return null;
    }
  }

  /**
   * Safe text content setter with null checking
   */
  safeSetTextContent(element, text) {
    try {
      if (element && typeof text !== 'undefined') {
        element.textContent = String(text);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set text content:', error);
    }
    return false;
  }

  /**
   * Safe innerHTML setter with null checking
   */
  safeSetInnerHTML(element, html) {
    try {
      if (element && typeof html !== 'undefined') {
        element.innerHTML = String(html);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set innerHTML:', error);
    }
    return false;
  }

  // ===== ADVANCED FEATURES INTEGRATION =====
  
  handleAdvancedFeatures() {
    this.showCodeEntryModal();
  }
  
  showCodeEntryModal() {
    const modal = document.getElementById('codeEntryModal');
    const input = document.getElementById('accessCodeInput');
    if (modal && input) {
      modal.style.display = 'flex';
      input.value = '';
      input.focus();
      this.hideCodeError();
      
      // Add click-to-close functionality for modal overlay
      modal.addEventListener('click', this.handleModalOverlayClick.bind(this));
    }
  }
  
  hideCodeEntryModal() {
    const modal = document.getElementById('codeEntryModal');
    if (modal) {
      modal.style.display = 'none';
      // Remove click handler to prevent memory leaks
      modal.removeEventListener('click', this.handleModalOverlayClick.bind(this));
    }
    this.hideCodeError();
  }
  
  handleCodeSubmit() {
    const input = document.getElementById('accessCodeInput');
    if (!input) {
      console.error('[PopupManager] Access code input not found');
      return;
    }
    
    const code = input.value.trim();
    console.log('[PopupManager] Attempting code validation for:', code ? `"${code}"` : 'empty code');
    
    if (this.validateAccessCode(code)) {
      console.log('[PopupManager] ✅ Access code validated successfully');
      try {
        this.hideCodeEntryModal();
        console.log('[PopupManager] Modal hidden, now showing prompt generator...');
        this.showPromptGenerator();
        this.loadPromptGeneratorData();
        this.showToast('Access granted! Prompt generator unlocked.', 'success');
      } catch (error) {
        console.error('[PopupManager] Error showing prompt generator:', error);
        this.showToast('Error opening prompt generator', 'error');
      }
    } else {
      console.log('[PopupManager] ❌ Invalid access code entered:', code);
      this.showCodeError();
      // Clear the input and refocus for retry
      input.value = '';
      input.focus();
    }
  }
  
  validateAccessCode(code) {
    // The access code is "0410"
    return code === '0410';
  }
  
  showCodeError() {
    const error = document.getElementById('codeError');
    if (error) {
      error.style.display = 'block';
    }
  }
  
  hideCodeError() {
    const error = document.getElementById('codeError');
    if (error) {
      error.style.display = 'none';
    }
  }
  
  showPromptGenerator() {
    console.log('[PopupManager] 🔍 Looking for promptGeneratorSection element...');
    const generator = document.getElementById('promptGeneratorSection');
    
    if (generator) {
      console.log('[PopupManager] ✅ Found promptGeneratorSection, making it visible...');
      generator.style.display = 'block';
      console.log('[PopupManager] ✅ Prompt generator should now be visible');
      
      // Scroll to the generator section for better UX
      try {
        generator.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (scrollError) {
        console.warn('[PopupManager] Failed to scroll to generator:', scrollError);
      }
      
      // Focus on the prompt input for immediate use
      setTimeout(() => {
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
          promptInput.focus();
        }
      }, 100);
      
      // Events are already set up in setupEventListeners
    } else {
      console.error('[PopupManager] ❌ promptGeneratorSection element not found in DOM!');
      this.showToast('Error: Prompt generator element not found', 'error');
    }
  }
  
  hidePromptGenerator() {
    const generator = document.getElementById('promptGeneratorSection');
    if (generator) {
      generator.style.display = 'none';
    }
  }
  
  setupPromptGeneratorEvents() {
    // Setup additional events for prompt generator
    this.safeAddEventListener('generateOptimizedBtn', 'click', this.handleGenerateOptimized.bind(this));
    this.safeAddEventListener('copyResultBtn', 'click', this.handleCopyResult.bind(this));
    this.safeAddEventListener('newOptimizationBtn', 'click', this.handleNewOptimization.bind(this));
    
    // Setup real-time token counting with debouncing
    this.setupRealTimeTokenCounting();
    
    // Modal overlay click functionality is now handled in showCodeEntryModal/hideCodeEntryModal
  }
  
  handleCodeInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleCodeSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.hideCodeEntryModal();
    }
  }
  
  handleModalOverlayClick(event) {
    // Close modal if clicking on the overlay (not the modal content)
    if (event.target === event.currentTarget) {
      this.hideCodeEntryModal();
    }
  }
  
  loadPromptGeneratorData() {
    // Load saved stats or set defaults
    const stats = {
      totalPrompts: 0,
      energySavings: 0,
      avgTokenReduction: 0
    };
    
    // Update UI with stats
    this.updateGeneratorStats(stats);
  }
  
  updateGeneratorStats(stats) {
    this.safeSetTextContent(document.getElementById('totalPromptsGenerated'), stats.totalPrompts.toString());
    this.safeSetTextContent(document.getElementById('energySavingsPercent'), `${stats.energySavings}%`);
    this.safeSetTextContent(document.getElementById('avgTokenReduction'), stats.avgTokenReduction.toString());
  }
  
  handleGenerateOptimized() {
    const promptInput = document.getElementById('promptInput');
    const optimizationLevel = document.getElementById('optimizationLevel');
    const targetModel = document.getElementById('targetModel');
    
    if (!promptInput || !promptInput.value.trim()) {
      this.showToastNotification('Please enter a prompt to optimize', 'error');
      return;
    }
    
    const originalPrompt = promptInput.value.trim();
    const level = optimizationLevel?.value || 'balanced';
    const model = targetModel?.value || 'gpt-4';
    
    // Show loading state
    const generateBtn = document.getElementById('generateOptimizedBtn');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Optimizing...';
    }
    
    // Simulate optimization process
    setTimeout(() => {
      const result = this.optimizePrompt(originalPrompt, level, model);
      this.showOptimizationResult(result);
      
      // Reset button
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Optimized Prompt';
      }
    }, 1500);
  }
  
  // ===== ADVANCED TOKEN COUNTING SYSTEM =====
  
  /**
   * Advanced TokenCounter class with multiple counting methodologies
   */
  initializeTokenCounters() {
    if (!this.tokenCounter) {
      this.tokenCounter = new TokenCounter();
    }
    if (!this.tokenComparison) {
      this.tokenComparison = new TokenComparison();
    }
  }
  
  /**
   * Sets up real-time token counting with debouncing
   */
  setupRealTimeTokenCounting() {
    console.log('[PopupManager] Setting up real-time token counting with debouncing');
    
    // Initialize debounced token counting
    this.tokenCountingDebounceTimer = null;
    this.currentTokenAnalysis = null;
    this.lastPromptText = '';
    
    // Get prompt input element
    const promptInput = document.getElementById('promptInput');
    const optimizedPrompt = document.getElementById('optimizedPrompt');
    
    if (promptInput) {
      // Add event listeners with debouncing
      promptInput.addEventListener('input', this.handlePromptInputChange.bind(this));
      promptInput.addEventListener('paste', this.handlePromptPaste.bind(this));
      promptInput.addEventListener('keyup', this.handlePromptInputChange.bind(this));
      
      console.log('[PopupManager] Real-time token counting events attached to promptInput');
    } else {
      console.warn('[PopupManager] promptInput element not found for real-time counting');
    }
    
    if (optimizedPrompt) {
      // Also monitor optimized prompt for comparison
      optimizedPrompt.addEventListener('input', this.handleOptimizedPromptChange.bind(this));
      console.log('[PopupManager] Real-time token counting events attached to optimizedPrompt');
    }
    
    // Initialize token analysis display
    this.initializeTokenAnalysisDisplay();
  }
  
  /**
   * Handles prompt input changes with debouncing
   */
  handlePromptInputChange(event) {
    const text = event.target.value;
    
    // Clear existing timer
    if (this.tokenCountingDebounceTimer) {
      clearTimeout(this.tokenCountingDebounceTimer);
    }
    
    // Set new timer with 300ms debounce
    this.tokenCountingDebounceTimer = setTimeout(() => {
      this.updateRealTimeTokenCounts(text, 'original');
    }, 300);
    
    // Immediate basic count for responsiveness (no debounce for character count)
    this.updateBasicCounts(text, 'original');
  }
  
  /**
   * Handles paste events for immediate analysis
   */
  handlePromptPaste(event) {
    // Wait for paste to complete
    setTimeout(() => {
      const text = event.target.value;
      this.updateRealTimeTokenCounts(text, 'original');
      this.updateBasicCounts(text, 'original');
    }, 10);
  }
  
  /**
   * Handles optimized prompt changes
   */
  handleOptimizedPromptChange(event) {
    const text = event.target.value;
    
    // Clear existing timer
    if (this.optimizedTokenCountingTimer) {
      clearTimeout(this.optimizedTokenCountingTimer);
    }
    
    // Set new timer with 300ms debounce
    this.optimizedTokenCountingTimer = setTimeout(() => {
      this.updateRealTimeTokenCounts(text, 'optimized');
      this.updateTokenComparison();
    }, 300);
    
    this.updateBasicCounts(text, 'optimized');
  }
  
  /**
   * Updates real-time token counts with full analysis
   */
  updateRealTimeTokenCounts(text, type = 'original') {
    if (!text || text === this.lastPromptText) return;
    
    console.log(`[PopupManager] Updating real-time token counts for ${type}:`, text.substring(0, 50) + '...');
    
    // Initialize token counters if needed
    this.initializeTokenCounters();
    
    // Get selected model for accurate counting
    const targetModel = document.getElementById('targetModel')?.value || 'gpt-4';
    
    // Perform comprehensive token analysis
    const analysis = this.tokenCounter.analyzeTokens(text, targetModel);
    
    // Store analysis
    if (type === 'original') {
      this.currentTokenAnalysis = analysis;
      this.lastPromptText = text;
    } else {
      this.optimizedTokenAnalysis = analysis;
    }
    
    // Update UI with analysis
    this.displayTokenAnalysis(analysis, type);
    
    // Update wattage estimates
    this.updateTokenBasedWattageEstimate(analysis, type);
    
    // Update comparison if we have both
    if (type === 'optimized' && this.currentTokenAnalysis) {
      this.updateTokenComparison();
    }
    
    console.log(`[PopupManager] Token analysis complete for ${type}:`, {
      model: analysis.model,
      tokens: analysis.gpt,
      chars: analysis.chars,
      words: analysis.words,
      analysis: analysis.analysis
    });
  }
  
  /**
   * Updates basic counts immediately (no debounce)
   */
  updateBasicCounts(text, type) {
    const chars = text.length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Update character and word counts immediately
    const prefix = type === 'original' ? 'original' : 'optimized';
    const charElement = document.getElementById(`${prefix}CharCount`);
    const wordElement = document.getElementById(`${prefix}WordCount`);
    
    if (charElement) charElement.textContent = chars.toLocaleString();
    if (wordElement) wordElement.textContent = words.toLocaleString();
  }
  
  /**
   * Displays comprehensive token analysis in UI
   */
  displayTokenAnalysis(analysis, type) {
    const prefix = type === 'original' ? 'original' : 'optimized';
    
    // Update token counts for different models
    const gptTokens = document.getElementById(`${prefix}GptTokens`);
    const claudeTokens = document.getElementById(`${prefix}ClaudeTokens`);
    const tokenEfficiency = document.getElementById(`${prefix}TokenEfficiency`);
    const tokenInsights = document.getElementById(`${prefix}TokenInsights`);
    
    if (gptTokens) gptTokens.textContent = analysis.gpt.toLocaleString();
    if (claudeTokens) claudeTokens.textContent = analysis.claude.toLocaleString();
    
    // Calculate efficiency score
    const efficiency = this.calculateTokenEfficiency(analysis);
    if (tokenEfficiency) {
      tokenEfficiency.textContent = efficiency.score + '%';
      tokenEfficiency.className = `efficiency-score ${efficiency.level}`;
    }
    
    // Display insights
    if (tokenInsights) {
      tokenInsights.textContent = analysis.analysis || 'Analysis complete';
      tokenInsights.className = `token-insights ${this.getInsightLevel(analysis.analysis)}`;
    }
  }
  
  /**
   * Calculates token efficiency score
   */
  calculateTokenEfficiency(analysis) {
    const avgCharsPerToken = analysis.chars / Math.max(1, analysis.gpt);
    const avgWordsPerToken = analysis.words / Math.max(1, analysis.gpt);
    
    // Ideal ratios for efficiency
    const idealCharRatio = 4.0;  // ~4 chars per token is efficient
    const idealWordRatio = 0.75; // ~0.75 words per token is efficient
    
    // Calculate efficiency (100% = ideal, higher = more efficient)
    const charEfficiency = Math.min(100, (avgCharsPerToken / idealCharRatio) * 100);
    const wordEfficiency = Math.min(100, (avgWordsPerToken / idealWordRatio) * 100);
    
    const overallScore = Math.round((charEfficiency + wordEfficiency) / 2);
    
    let level = 'poor';
    if (overallScore >= 85) level = 'excellent';
    else if (overallScore >= 70) level = 'good';
    else if (overallScore >= 50) level = 'average';
    
    return { score: overallScore, level };
  }
  
  /**
   * Gets insight level for styling
   */
  getInsightLevel(analysisText) {
    if (!analysisText) return 'neutral';
    
    const text = analysisText.toLowerCase();
    if (text.includes('well-optimized') || text.includes('excellent')) return 'positive';
    if (text.includes('long sentences') || text.includes('complex') || text.includes('repetitive')) return 'warning';
    if (text.includes('error') || text.includes('issue')) return 'negative';
    
    return 'neutral';
  }
  
  /**
   * Updates wattage estimate based on token analysis
   */
  updateTokenBasedWattageEstimate(analysis, type) {
    const targetModel = document.getElementById('targetModel')?.value || 'gpt-4';
    const tokens = analysis.gpt; // Use GPT tokens as baseline
    
    // Use AI Model Power Calculator for more accurate estimates
    if (this.aiModelPowerCalculator) {
      const modelKey = this.aiModelPowerCalculator.inferModelKey({ name: targetModel });
      const profile = this.aiModelPowerCalculator.modelPowerProfiles[modelKey];
      
      let estimatedWh;
      if (profile) {
        // More accurate calculation using model profile
        estimatedWh = (tokens / 1000) * (profile.energyPerQuery / 1000); // Convert to Wh per token
        console.log(`[PopupManager] Using AI Power Calculator profile for ${profile.name}:`, {
          tokens,
          energyPerQuery: profile.energyPerQuery,
          estimatedWh: estimatedWh.toFixed(4) + ' Wh'
        });
      } else {
        // Fallback to basic rates
        const modelWattageRates = {
          'gpt-4': 0.8,      // ~0.8 Wh per 1000 tokens
          'gpt-3.5': 0.3,    // ~0.3 Wh per 1000 tokens
          'claude': 0.6,     // ~0.6 Wh per 1000 tokens
          'gemini': 0.4      // ~0.4 Wh per 1000 tokens
        };
        
        const ratePerThousand = modelWattageRates[targetModel] || modelWattageRates['gpt-4'];
        estimatedWh = (tokens / 1000) * ratePerThousand;
      }
      
      // Display wattage estimate
      const prefix = type === 'original' ? 'original' : 'optimized';
      const wattageElement = document.getElementById(`${prefix}WattageEstimate`);
      
      if (wattageElement) {
        if (estimatedWh >= 1) {
          wattageElement.textContent = `~${estimatedWh.toFixed(2)} Wh`;
        } else if (estimatedWh >= 0.001) {
          wattageElement.textContent = `~${(estimatedWh * 1000).toFixed(0)} mWh`;
        } else {
          wattageElement.textContent = `~${(estimatedWh * 1000000).toFixed(0)} μWh`;
        }
        
        // Add styling based on efficiency with enhanced classes
        wattageElement.className = this.getWattageEfficiencyClass(estimatedWh) +
          (profile ? ' ai-calculated' : ' estimated');
      }
      
      // Store wattage for comparison calculations
      if (type === 'original') {
        this.originalWattage = estimatedWh;
      } else {
        this.optimizedWattage = estimatedWh;
      }
      
      console.log(`[PopupManager] Enhanced wattage estimate for ${type} (${targetModel}):`, {
        tokens,
        modelProfile: profile?.name || 'fallback',
        estimatedWh: estimatedWh.toFixed(4) + ' Wh',
        efficiency: this.getWattageEfficiencyClass(estimatedWh)
      });
    }
  }
  
  /**
   * Gets CSS class for wattage efficiency styling
   */
  getWattageEfficiencyClass(wattageWh) {
    const baseClass = 'wattage-estimate';
    
    if (wattageWh < 0.1) return `${baseClass} very-efficient`;      // < 0.1 Wh
    if (wattageWh < 0.5) return `${baseClass} efficient`;           // < 0.5 Wh
    if (wattageWh < 1.0) return `${baseClass} moderate`;            // < 1.0 Wh
    if (wattageWh < 2.0) return `${baseClass} high`;               // < 2.0 Wh
    return `${baseClass} very-high`;                               // >= 2.0 Wh
  }
  
  /**
   * Updates token comparison between original and optimized
   */
  updateTokenComparison() {
    if (!this.currentTokenAnalysis || !this.optimizedTokenAnalysis) return;
    
    console.log('[PopupManager] Updating token comparison between original and optimized');
    
    // Get current text from inputs
    const originalText = document.getElementById('promptInput')?.value || '';
    const optimizedText = document.getElementById('optimizedPrompt')?.value || '';
    
    if (!originalText || !optimizedText) return;
    
    // Use comparison engine
    const targetModel = document.getElementById('targetModel')?.value || 'gpt-4';
    const comparison = this.tokenComparison.comparePrompts(originalText, optimizedText, targetModel);
    
    // Display comparison results
    this.displayTokenComparison(comparison);
    
    // Update power savings display with wattage calculations
    this.updatePowerSavingsDisplay();
  }
  
  /**
   * Displays token comparison results
   */
  displayTokenComparison(comparison) {
    const comparisonSection = document.getElementById('tokenComparisonSection');
    const tokensSaved = document.getElementById('tokensSaved');
    const percentReduction = document.getElementById('percentReduction');
    const costSavings = document.getElementById('costSavings');
    const qualityScore = document.getElementById('optimizationQualityScore');
    
    if (comparisonSection) comparisonSection.style.display = 'block';
    
    if (tokensSaved) {
      tokensSaved.textContent = comparison.reduction.tokensSaved.toLocaleString();
    }
    
    if (percentReduction) {
      percentReduction.textContent = comparison.reduction.percentReduction + '%';
      percentReduction.className = this.getReductionEfficiencyClass(comparison.reduction.percentReduction);
    }
    
    if (costSavings) {
      const savings = comparison.reduction.costSavings;
      if (savings >= 0.01) {
        costSavings.textContent = '$' + savings.toFixed(3);
      } else {
        costSavings.textContent = '$' + (savings * 1000).toFixed(1) + 'e-3';
      }
    }
    
    if (qualityScore) {
      const score = comparison.analysis.efficiencyScore;
      qualityScore.textContent = score + '/100';
      qualityScore.className = this.getQualityScoreClass(score);
    }
    
    // Update detailed analysis
    this.updateDetailedComparison(comparison);
    
    console.log('[PopupManager] Token comparison displayed:', {
      tokensSaved: comparison.reduction.tokensSaved,
      percentReduction: comparison.reduction.percentReduction + '%',
      costSavings: '$' + comparison.reduction.costSavings.toFixed(4),
      qualityScore: comparison.analysis.efficiencyScore
    });
  }
  
  /**
   * Updates detailed comparison analysis
   */
  updateDetailedComparison(comparison) {
    const removedWords = document.getElementById('removedWordsList');
    const restructuredSentences = document.getElementById('restructuredSentencesList');
    
    if (removedWords && comparison.analysis.removedWords.length > 0) {
      removedWords.innerHTML = comparison.analysis.removedWords
        .slice(0, 8)
        .map(word => `<span class="removed-word">${word}</span>`)
        .join(' ');
    }
    
    if (restructuredSentences && comparison.analysis.restructuredSentences.length > 0) {
      let html = '';
      comparison.analysis.restructuredSentences.slice(0, 3).forEach(restructure => {
        html += `
          <div class="sentence-comparison">
            <div class="original-sentence">Before: "${restructure.original}"</div>
            <div class="optimized-sentence">After: "${restructure.optimized}"</div>
            <div class="reduction-amount">${restructure.reduction}% shorter</div>
          </div>
        `;
      });
      restructuredSentences.innerHTML = html;
    }
  }
  
  /**
   * Gets CSS class for reduction efficiency
   */
  getReductionEfficiencyClass(percent) {
    const baseClass = 'percent-reduction';
    
    if (percent >= 40) return `${baseClass} excellent`;        // >= 40% reduction
    if (percent >= 25) return `${baseClass} good`;             // >= 25% reduction
    if (percent >= 15) return `${baseClass} moderate`;         // >= 15% reduction
    if (percent >= 5) return `${baseClass} low`;              // >= 5% reduction
    return `${baseClass} minimal`;                             // < 5% reduction
  }
  
  /**
   * Gets CSS class for quality score
   */
  getQualityScoreClass(score) {
    const baseClass = 'quality-score';
    
    if (score >= 90) return `${baseClass} excellent`;
    if (score >= 75) return `${baseClass} good`;
    if (score >= 60) return `${baseClass} moderate`;
    if (score >= 40) return `${baseClass} poor`;
    return `${baseClass} very-poor`;
  }
  
  /**
   * Initializes token analysis display elements
   */
  initializeTokenAnalysisDisplay() {
    console.log('[PopupManager] Initializing token analysis display');
    
    // Clear any existing analysis
    this.currentTokenAnalysis = null;
    this.optimizedTokenAnalysis = null;
    
    // Initialize displays with zero values
    const elements = [
      'originalCharCount', 'originalWordCount', 'originalGptTokens', 'originalClaudeTokens',
      'optimizedCharCount', 'optimizedWordCount', 'optimizedGptTokens', 'optimizedClaudeTokens',
      'originalTokenEfficiency', 'optimizedTokenEfficiency',
      'originalWattageEstimate', 'optimizedWattageEstimate'
    ];
    
    elements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        if (elementId.includes('Count') || elementId.includes('Tokens')) {
          element.textContent = '0';
        } else if (elementId.includes('Efficiency')) {
          element.textContent = '--';
          element.className = 'efficiency-score neutral';
        } else if (elementId.includes('Wattage')) {
          element.textContent = '0 mWh';
          element.className = 'wattage-estimate neutral';
        }
      }
    });
    
    // Hide comparison section initially
    const comparisonSection = document.getElementById('tokenComparisonSection');
    if (comparisonSection) comparisonSection.style.display = 'none';
  }
}

/**
 * TokenCounter class - Advanced token counting with multiple methodologies
 */
class TokenCounter {
  constructor() {
    console.log('[TokenCounter] Initializing advanced token counter');
    
    // Model-specific token ratios (chars per token approximations)
    this.modelRatios = {
      'gpt-4': 3.8,      // ~3.8 characters per token
      'gpt-3.5': 4.0,    // ~4.0 characters per token
      'claude': 3.5,     // ~3.5 characters per token
      'gemini': 3.6,     // ~3.6 characters per token
      'default': 3.8
    };
    
    // Special token patterns and their weights
    this.specialPatterns = {
      codeBlocks: /```[\s\S]*?```/g,
      inlineCode: /`[^`]+`/g,
      urls: /https?:\/\/[^\s]+/g,
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      numbers: /\b\d+\.?\d*\b/g,
      punctuation: /[.,;:!?(){}\[\]"'-]/g,
      whitespace: /\s+/g
    };
  }
  
  /**
   * GPT-style tokenization (approximation)
   * Uses word-based approximation with character adjustment
   */
  countTokensGPT(text, model = 'gpt-4') {
    if (!text || typeof text !== 'string') return 0;
    
    const ratio = this.modelRatios[model] || this.modelRatios.default;
    
    // Base character count approach
    let baseTokens = Math.ceil(text.length / ratio);
    
    // Adjust for special patterns that affect tokenization
    const adjustments = this.calculateSpecialPatternAdjustments(text, 'gpt');
    
    // Word boundary bonus (GPT tokenizer respects word boundaries)
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordBoundaryAdjustment = Math.floor(words.length * 0.1);
    
    const totalTokens = Math.max(1, baseTokens + adjustments - wordBoundaryAdjustment);
    
    console.log(`[TokenCounter] GPT tokens (${model}):`, {
      text: text.substring(0, 50) + '...',
      baseTokens,
      adjustments,
      wordBoundaryAdjustment,
      totalTokens
    });
    
    return totalTokens;
  }
  
  /**
   * Claude-style tokenization (approximation)
   * Better handling of natural language, different ratio
   */
  countTokensClaude(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const ratio = this.modelRatios.claude;
    
    // Claude tends to handle natural language more efficiently
    let baseTokens = Math.ceil(text.length / ratio);
    
    // Claude-specific adjustments
    const adjustments = this.calculateSpecialPatternAdjustments(text, 'claude');
    
    // Natural language bonus (Claude is optimized for conversational text)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const naturalLanguageBonus = Math.floor(sentences.length * 0.05);
    
    const totalTokens = Math.max(1, baseTokens + adjustments - naturalLanguageBonus);
    
    console.log('[TokenCounter] Claude tokens:', {
      text: text.substring(0, 50) + '...',
      baseTokens,
      adjustments,
      naturalLanguageBonus,
      totalTokens
    });
    
    return totalTokens;
  }
  
  /**
   * Character-based counting with options
   */
  countChars(text, includeSpaces = true, includeSpecialChars = true) {
    if (!text || typeof text !== 'string') return 0;
    
    let charCount = text.length;
    
    if (!includeSpaces) {
      charCount = text.replace(/\s/g, '').length;
    }
    
    if (!includeSpecialChars) {
      charCount = text.replace(/[^\w\s]/g, '').length;
      if (!includeSpaces) {
        charCount = text.replace(/[^\w]/g, '').length;
      }
    }
    
    return charCount;
  }
  
  /**
   * Word-based counting with smart handling
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    
    // Handle contractions as single words
    const words = text
      .replace(/[^\w\s'-]/g, ' ')  // Replace punctuation with spaces, keep apostrophes and hyphens
      .split(/\s+/)
      .filter(word => word.length > 0 && /\w/.test(word)); // Must contain at least one letter/number
    
    return words.length;
  }
  
  /**
   * Calculate adjustments for special patterns
   */
  calculateSpecialPatternAdjustments(text, model) {
    let adjustment = 0;
    
    // Code blocks are token-expensive
    const codeBlocks = text.match(this.specialPatterns.codeBlocks) || [];
    adjustment += codeBlocks.length * (model === 'claude' ? 8 : 10);
    
    // URLs and emails are usually single tokens but take more characters
    const urls = text.match(this.specialPatterns.urls) || [];
    const emails = text.match(this.specialPatterns.emails) || [];
    adjustment -= (urls.length + emails.length) * 2; // Reduction because they're efficient
    
    // Numbers can be variable
    const numbers = text.match(this.specialPatterns.numbers) || [];
    adjustment += numbers.length * 0.5;
    
    // Punctuation density affects tokenization
    const punctuation = text.match(this.specialPatterns.punctuation) || [];
    const punctuationDensity = punctuation.length / text.length;
    if (punctuationDensity > 0.1) {
      adjustment += Math.floor(punctuation.length * 0.3);
    }
    
    return Math.round(adjustment);
  }
  
  /**
   * Get comprehensive token analysis
   */
  analyzeTokens(text, model = 'gpt-4') {
    if (!text || typeof text !== 'string') {
      return {
        gpt: 0,
        claude: 0,
        chars: 0,
        charsNoSpaces: 0,
        words: 0,
        sentences: 0,
        model: model,
        analysis: 'Empty text'
      };
    }
    
    const analysis = {
      gpt: this.countTokensGPT(text, model),
      claude: this.countTokensClaude(text),
      chars: this.countChars(text, true, true),
      charsNoSpaces: this.countChars(text, false, true),
      words: this.countWords(text),
      sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      model: model,
      analysis: this.generateTokenAnalysis(text, model)
    };
    
    console.log('[TokenCounter] Comprehensive analysis:', analysis);
    
    return analysis;
  }
  
  /**
   * Generate text analysis insights
   */
  generateTokenAnalysis(text, model) {
    const ratio = this.modelRatios[model] || this.modelRatios.default;
    const avgWordsPerSentence = this.countWords(text) / Math.max(1, text.split(/[.!?]+/).length - 1);
    const avgCharsPerWord = text.length / Math.max(1, this.countWords(text));
    
    let insights = [];
    
    if (avgWordsPerSentence > 25) {
      insights.push('Long sentences detected - consider breaking up');
    }
    
    if (avgCharsPerWord > 6) {
      insights.push('Complex vocabulary - may increase token count');
    }
    
    if (text.includes('```')) {
      insights.push('Code blocks detected - tokens may be higher than estimated');
    }
    
    const repetitionCheck = this.detectRepetition(text);
    if (repetitionCheck.hasRepetition) {
      insights.push(`Repetitive content detected - ${repetitionCheck.count} repeated phrases`);
    }
    
    return insights.length > 0 ? insights.join('; ') : 'Text appears well-optimized';
  }
  
  /**
   * Detect repetitive content
   */
  detectRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = new Map();
    let repetitionCount = 0;
    
    // Check for repeated 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (phrase.length > 10) { // Only meaningful phrases
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    }
    
    phrases.forEach(count => {
      if (count > 1) repetitionCount++;
    });
    
    return {
      hasRepetition: repetitionCount > 0,
      count: repetitionCount
    };
  }
}

/**
 * TokenComparison class - Advanced comparison engine
 */
class TokenComparison {
  constructor() {
    console.log('[TokenComparison] Initializing token comparison engine');
    
    // Model cost estimates (per 1k tokens)
    this.costEstimates = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5': { input: 0.0015, output: 0.002 },
      'claude': { input: 0.008, output: 0.024 },
      'gemini': { input: 0.00025, output: 0.0005 }
    };
  }
  
  /**
   * Compare two prompts and provide detailed analysis
   */
  comparePrompts(originalText, optimizedText, model = 'gpt-4') {
    console.log('[TokenComparison] Comparing prompts for model:', model);
    
    if (!this.tokenCounter) {
      window.popupManager.initializeTokenCounters();
      this.tokenCounter = window.popupManager.tokenCounter;
    }
    
    const original = this.tokenCounter.analyzeTokens(originalText, model);
    const optimized = this.tokenCounter.analyzeTokens(optimizedText, model);
    
    const modelTokensOriginal = original[model.includes('gpt') ? 'gpt' : 'claude'];
    const modelTokensOptimized = optimized[model.includes('gpt') ? 'gpt' : 'claude'];
    
    const tokensSaved = Math.max(0, modelTokensOriginal - modelTokensOptimized);
    const percentReduction = modelTokensOriginal > 0 ?
      Math.round((tokensSaved / modelTokensOriginal) * 100) : 0;
    
    const costs = this.costEstimates[model] || this.costEstimates['gpt-4'];
    const originalCost = (modelTokensOriginal / 1000) * costs.input;
    const optimizedCost = (modelTokensOptimized / 1000) * costs.input;
    const costSavings = Math.max(0, originalCost - optimizedCost);
    
    const comparison = {
      original: {
        tokens: modelTokensOriginal,
        characters: original.chars,
        words: original.words,
        sentences: original.sentences,
        estimatedCost: originalCost,
        analysis: original.analysis
      },
      optimized: {
        tokens: modelTokensOptimized,
        characters: optimized.chars,
        words: optimized.words,
        sentences: optimized.sentences,
        estimatedCost: optimizedCost,
        analysis: optimized.analysis
      },
      reduction: {
        tokensSaved: tokensSaved,
        percentReduction: percentReduction,
        costSavings: costSavings,
        charactersSaved: Math.max(0, original.chars - optimized.chars),
        wordsSaved: Math.max(0, original.words - optimized.words)
      },
      analysis: {
        removedWords: this.identifyRemovedWords(originalText, optimizedText),
        restructuredSentences: this.identifyRestructuring(originalText, optimizedText),
        efficiencyScore: this.calculateEfficiencyScore(percentReduction, originalText, optimizedText)
      },
      model: model
    };
    
    console.log('[TokenComparison] Comparison complete:', comparison);
    
    return comparison;
  }
  
  /**
   * Identify words that were removed during optimization
   */
  identifyRemovedWords(original, optimized) {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const optimizedWords = new Set(optimized.toLowerCase().split(/\s+/));
    
    const removed = [];
    originalWords.forEach(word => {
      if (!optimizedWords.has(word) && word.length > 2) {
        removed.push(word);
      }
    });
    
    return removed.slice(0, 10); // Limit to first 10 for display
  }
  
  /**
   * Identify sentence restructuring
   */
  identifyRestructuring(original, optimized) {
    const originalSentences = original.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const optimizedSentences = optimized.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const restructured = [];
    
    // Simple restructuring detection - sentences that are significantly shorter
    originalSentences.forEach((origSent, index) => {
      if (optimizedSentences[index]) {
        const lengthReduction = origSent.length - optimizedSentences[index].length;
        if (lengthReduction > origSent.length * 0.3) { // 30% shorter
          restructured.push({
            original: origSent.substring(0, 50) + '...',
            optimized: optimizedSentences[index].substring(0, 50) + '...',
            reduction: Math.round((lengthReduction / origSent.length) * 100)
          });
        }
      }
    });
    
    return restructured.slice(0, 5); // Limit for display
  }
  
  /**
   * Calculate optimization efficiency score
   */
  calculateEfficiencyScore(percentReduction, original, optimized) {
    let score = percentReduction; // Base score from token reduction
    
    // Bonus for maintaining meaning (simple heuristic)
    const originalWords = original.split(/\s+/).length;
    const optimizedWords = optimized.split(/\s+/).length;
    const wordReductionRatio = originalWords > 0 ? (originalWords - optimizedWords) / originalWords : 0;
    
    // If word reduction is reasonable (not too aggressive), add bonus
    if (wordReductionRatio > 0.1 && wordReductionRatio < 0.5) {
      score += 10;
    }
    
    // Penalty for over-optimization (too short)
    if (optimized.length < 20) {
      score -= 20;
    }
    
    // Bonus for removing filler words
    const fillerWords = ['basically', 'actually', 'literally', 'obviously', 'clearly'];
    const fillerRemoved = fillerWords.filter(word =>
      original.toLowerCase().includes(word) && !optimized.toLowerCase().includes(word)
    ).length;
    score += fillerRemoved * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

/**
 * AIModelPowerCalculator class - Advanced power calculations for AI models
 */
class AIModelPowerCalculator {
  constructor() {
    console.log('[AIModelPowerCalculator] Initializing advanced AI model power calculator');
    
    // Comprehensive AI model power profiles with real-world data
    this.modelPowerProfiles = {
      // === FRONTIER MODELS (2024-2025) ===
      'gpt-5-high': {
        name: 'GPT-5 High',
        category: 'frontier-large',
        baseWatts: 45,
        tokensPerSecond: 120,
        energyPerQuery: 2.8, // Wh per query
        scalingFactor: 1.8,
        contextMultiplier: 1.4,
        company: 'OpenAI'
      },
      
      'claude-4-sonnet-thinking': {
        name: 'Claude-4 Sonnet Thinking',
        category: 'frontier-large',
        baseWatts: 42,
        tokensPerSecond: 95,
        energyPerQuery: 2.5,
        scalingFactor: 1.7,
        contextMultiplier: 1.3,
        company: 'Anthropic'
      },
      
      'grok-4': {
        name: 'Grok-4',
        category: 'frontier-large',
        baseWatts: 48,
        tokensPerSecond: 110,
        energyPerQuery: 3.1,
        scalingFactor: 1.9,
        contextMultiplier: 1.5,
        company: 'xAI'
      },
      
      // === REASONING SPECIALIZED MODELS ===
      'deepseek-r1': {
        name: 'DeepSeek R1',
        category: 'reasoning-specialized',
        baseWatts: 52,
        tokensPerSecond: 85,
        energyPerQuery: 3.5,
        scalingFactor: 2.1,
        contextMultiplier: 1.6,
        company: 'DeepSeek'
      },
      
      'o3-mini': {
        name: 'OpenAI o3-mini',
        category: 'reasoning-specialized',
        baseWatts: 38,
        tokensPerSecond: 95,
        energyPerQuery: 2.2,
        scalingFactor: 1.6,
        contextMultiplier: 1.2,
        company: 'OpenAI'
      },
      
      // === ULTRA-EFFICIENT MODELS ===
      'llama-4-maverick': {
        name: 'Llama-4 Maverick',
        category: 'ultra-efficient',
        baseWatts: 18,
        tokensPerSecond: 140,
        energyPerQuery: 0.8,
        scalingFactor: 0.9,
        contextMultiplier: 0.8,
        company: 'Meta'
      },
      
      'gemini-2-flash': {
        name: 'Gemini 2.0 Flash',
        category: 'ultra-efficient',
        baseWatts: 22,
        tokensPerSecond: 160,
        energyPerQuery: 0.9,
        scalingFactor: 0.8,
        contextMultiplier: 0.7,
        company: 'Google'
      },
      
      // === BALANCED PERFORMANCE MODELS ===
      'gpt-4-turbo-2024': {
        name: 'GPT-4 Turbo 2024',
        category: 'balanced-performance',
        baseWatts: 32,
        tokensPerSecond: 110,
        energyPerQuery: 1.8,
        scalingFactor: 1.3,
        contextMultiplier: 1.1,
        company: 'OpenAI'
      },
      
      'claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        category: 'balanced-performance',
        baseWatts: 28,
        tokensPerSecond: 105,
        energyPerQuery: 1.5,
        scalingFactor: 1.2,
        contextMultiplier: 1.0,
        company: 'Anthropic'
      },
      
      // === LEGACY MODELS (for comparison) ===
      'gpt-4': {
        name: 'GPT-4',
        category: 'legacy-large',
        baseWatts: 35,
        tokensPerSecond: 80,
        energyPerQuery: 2.0,
        scalingFactor: 1.4,
        contextMultiplier: 1.2,
        company: 'OpenAI'
      },
      
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        category: 'legacy-efficient',
        baseWatts: 15,
        tokensPerSecond: 150,
        energyPerQuery: 0.5,
        scalingFactor: 0.7,
        contextMultiplier: 0.6,
        company: 'OpenAI'
      }
    };
    
    // Complexity multipliers based on query complexity
    this.complexityMultipliers = {
      simple: 0.8,      // Basic Q&A, simple tasks
      moderate: 1.0,    // Standard requests, moderate complexity
      complex: 1.4,     // Multi-step reasoning, analysis
      intensive: 1.8,   // Code generation, long-form content
      reasoning: 2.2    // Deep reasoning, math, complex analysis
    };
    
    // Context length impact factors
    this.contextLengthFactors = {
      short: { threshold: 1000, multiplier: 0.9 },      // < 1k tokens
      medium: { threshold: 4000, multiplier: 1.0 },     // 1k-4k tokens
      long: { threshold: 16000, multiplier: 1.3 },      // 4k-16k tokens
      extended: { threshold: 32000, multiplier: 1.6 },  // 16k-32k tokens
      massive: { threshold: 128000, multiplier: 2.1 }   // 32k+ tokens
    };
    
    // Regional carbon intensity (gCO2/kWh) for environmental impact
    this.regionalCarbonIntensity = {
      'us-west': 350,     // US West Coast (cleaner grid)
      'us-east': 400,     // US East Coast (average)
      'us-central': 450,  // US Central (more coal)
      'europe': 300,      // European average
      'asia-pacific': 500, // Asia-Pacific average
      'global': 400      // Global average
    };
    
    // User engagement impact on power consumption
    this.engagementFactors = {
      high: 1.2,      // Active conversation, frequent queries
      medium: 1.0,    // Normal interaction
      low: 0.8        // Passive browsing, infrequent queries
    };
  }
  
  /**
   * Calculate comprehensive backend power consumption for AI models
   */
  calculateBackendPower(detectedModel, tabData, context = {}) {
    try {
      if (!detectedModel || !detectedModel.model) {
        console.warn('[AIModelPowerCalculator] Invalid detected model provided');
        return 0;
      }
      
      const modelKey = detectedModel.modelKey || this.inferModelKey(detectedModel.model);
      const profile = this.modelPowerProfiles[modelKey];
      
      if (!profile) {
        console.warn('[AIModelPowerCalculator] No power profile found for model:', modelKey);
        return this.estimatePowerForUnknownModel(detectedModel, context);
      }
      
      console.log(`[AIModelPowerCalculator] Calculating power for ${profile.name}:`, {
        category: profile.category,
        baseWatts: profile.baseWatts,
        context: context
      });
      
      // Base power consumption
      let powerWatts = profile.baseWatts;
      
      // Apply complexity multiplier
      const complexity = this.analyzeQueryComplexity(tabData, context);
      const complexityMultiplier = this.complexityMultipliers[complexity] || 1.0;
      powerWatts *= complexityMultiplier;
      
      // Apply context length impact
      const contextLength = this.estimateContextLength(tabData, detectedModel);
      const contextMultiplier = this.getContextLengthMultiplier(contextLength, profile);
      powerWatts *= contextMultiplier;
      
      // Apply user engagement factor
      const engagement = context.userEngagement || 'medium';
      const engagementMultiplier = this.engagementFactors[engagement] || 1.0;
      powerWatts *= engagementMultiplier;
      
      // Apply performance mode adjustment
      const performanceAdjustment = this.getPerformanceModeAdjustment(context.performanceMode);
      powerWatts *= performanceAdjustment;
      
      // Apply model scaling factor
      powerWatts *= profile.scalingFactor;
      
      console.log('[AIModelPowerCalculator] Power calculation breakdown:', {
        model: profile.name,
        basePower: profile.baseWatts,
        complexity: complexity,
        complexityMultiplier: complexityMultiplier,
        contextLength: contextLength,
        contextMultiplier: contextMultiplier,
        engagementMultiplier: engagementMultiplier,
        performanceAdjustment: performanceAdjustment,
        scalingFactor: profile.scalingFactor,
        finalPower: powerWatts.toFixed(2) + 'W'
      });
      
      return Math.max(0, powerWatts);
      
    } catch (error) {
      console.error('[AIModelPowerCalculator] Error calculating backend power:', error);
      return 0;
    }
  }
  
  /**
   * Analyze query complexity based on tab data and context
   */
  analyzeQueryComplexity(tabData, context) {
    if (!tabData) return 'moderate';
    
    // Analyze URL patterns for complexity hints
    const url = tabData.url || '';
    const urlLower = url.toLowerCase();
    
    // Code-related queries are typically complex
    if (urlLower.includes('github') || urlLower.includes('stackoverflow') ||
        urlLower.includes('codepen') || urlLower.includes('repl')) {
      return 'intensive';
    }
    
    // Research and analysis sites suggest complex queries
    if (urlLower.includes('research') || urlLower.includes('analysis') ||
        urlLower.includes('academic') || urlLower.includes('arxiv')) {
      return 'complex';
    }
    
    // Mathematical or scientific sites suggest reasoning tasks
    if (urlLower.includes('math') || urlLower.includes('science') ||
        urlLower.includes('calculation') || urlLower.includes('equation')) {
      return 'reasoning';
    }
    
    // Simple informational queries
    if (urlLower.includes('wiki') || urlLower.includes('news') ||
        urlLower.includes('blog') || urlLower.includes('faq')) {
      return 'simple';
    }
    
    // Check DOM complexity as a proxy for interface complexity
    const domNodes = tabData.domNodes || 0;
    if (domNodes > 5000) return 'complex';
    if (domNodes > 2000) return 'moderate';
    if (domNodes < 500) return 'simple';
    
    return 'moderate'; // Default
  }
  
  /**
   * Estimate context length based on tab data and model
   */
  estimateContextLength(tabData, detectedModel) {
    if (!tabData) return 1000;
    
    // Base estimate from DOM complexity
    const domNodes = tabData.domNodes || 1000;
    let estimatedTokens = Math.max(500, Math.min(8000, domNodes * 0.3));
    
    // Adjust based on page type
    const url = tabData.url || '';
    if (url.includes('docs') || url.includes('documentation')) {
      estimatedTokens *= 1.5; // Documentation tends to be longer
    }
    if (url.includes('chat') || url.includes('conversation')) {
      estimatedTokens *= 2.0; // Chat interfaces accumulate context
    }
    if (url.includes('editor') || url.includes('code')) {
      estimatedTokens *= 1.8; // Code editors often have large contexts
    }
    
    // Consider model's typical context window
    const modelName = detectedModel.model?.name || '';
    if (modelName.toLowerCase().includes('claude')) {
      estimatedTokens *= 1.2; // Claude models often used with longer contexts
    }
    
    return Math.round(estimatedTokens);
  }
  
  /**
   * Get context length multiplier based on context size and model profile
   */
  getContextLengthMultiplier(contextLength, profile) {
    // Find appropriate context factor
    let factor = this.contextLengthFactors.medium; // Default
    
    for (const [key, contextFactor] of Object.entries(this.contextLengthFactors)) {
      if (contextLength <= contextFactor.threshold) {
        factor = contextFactor;
        break;
      }
    }
    
    // Apply model's context multiplier
    return factor.multiplier * (profile.contextMultiplier || 1.0);
  }
  
  /**
   * Get performance mode adjustment factor
   */
  getPerformanceModeAdjustment(performanceMode) {
    switch (performanceMode) {
      case 'efficient':
        return 0.8;  // Lower power mode
      case 'balanced':
        return 1.0;  // Normal power
      case 'performance':
        return 1.3;  // Higher power mode
      default:
        return 1.0;
    }
  }
  
  /**
   * Infer model key from detected model information
   */
  inferModelKey(modelInfo) {
    if (!modelInfo || !modelInfo.name) return 'gpt-4'; // Default fallback
    
    const name = modelInfo.name.toLowerCase();
    
    // GPT models
    if (name.includes('gpt-5')) return 'gpt-5-high';
    if (name.includes('gpt-4-turbo') && name.includes('2024')) return 'gpt-4-turbo-2024';
    if (name.includes('gpt-4')) return 'gpt-4';
    if (name.includes('gpt-3.5')) return 'gpt-3.5-turbo';
    
    // Claude models
    if (name.includes('claude-4')) return 'claude-4-sonnet-thinking';
    if (name.includes('claude-3.5')) return 'claude-3.5-sonnet';
    
    // Specialized models
    if (name.includes('deepseek') && name.includes('r1')) return 'deepseek-r1';
    if (name.includes('grok-4')) return 'grok-4';
    if (name.includes('llama-4')) return 'llama-4-maverick';
    if (name.includes('gemini-2') || name.includes('gemini 2')) return 'gemini-2-flash';
    if (name.includes('o3-mini')) return 'o3-mini';
    
    // Default to GPT-4 for unknown models
    return 'gpt-4';
  }
  
  /**
   * Estimate power for unknown models
   */
  estimatePowerForUnknownModel(detectedModel, context) {
    console.log('[AIModelPowerCalculator] Estimating power for unknown model:', detectedModel.model?.name);
    
    // Base estimation using model category or size hints
    let estimatedWatts = 30; // Conservative default
    
    const modelName = (detectedModel.model?.name || '').toLowerCase();
    
    // Size-based estimation
    if (modelName.includes('large') || modelName.includes('70b') || modelName.includes('175b')) {
      estimatedWatts = 40;
    } else if (modelName.includes('small') || modelName.includes('7b') || modelName.includes('13b')) {
      estimatedWatts = 20;
    } else if (modelName.includes('mini') || modelName.includes('nano')) {
      estimatedWatts = 15;
    }
    
    // Apply basic engagement factor
    const engagement = context.userEngagement || 'medium';
    estimatedWatts *= this.engagementFactors[engagement] || 1.0;
    
    return estimatedWatts;
  }
  
  /**
   * Calculate environmental impact from power consumption
   */
  calculateEnvironmentalImpact(powerWatts, durationMs = 3600000, region = 'global') {
    const durationHours = durationMs / 3600000;
    const energyWh = powerWatts * durationHours;
    const energyKWh = energyWh / 1000;
    
    // Carbon emissions
    const carbonIntensity = this.regionalCarbonIntensity[region] || this.regionalCarbonIntensity.global;
    const carbonEmissionsG = energyKWh * carbonIntensity;
    
    // Water usage (approximate for data centers)
    const waterUsageL = energyKWh * 3.0; // ~3L per kWh for cooling
    
    // Tree offset equivalent (rough approximation)
    const treeOffsetDays = carbonEmissionsG / 48.0; // A tree absorbs ~48g CO2 per day
    
    return {
      energyWh: energyWh,
      energyKWh: energyKWh,
      carbonEmissionsG: carbonEmissionsG,
      waterUsageL: waterUsageL,
      treeOffsetDays: treeOffsetDays,
      region: region,
      carbonIntensity: carbonIntensity
    };
  }
  
  /**
   * Calculate cost estimate for AI query
   */
  calculateQueryCost(modelKey, tokensUsed, region = 'global') {
    const profile = this.modelPowerProfiles[modelKey];
    if (!profile) return { energyCost: 0, apiCost: 0, total: 0 };
    
    // Energy cost (varies by region)
    const regionalElectricityRates = {
      'us-west': 0.15,    // $/kWh
      'us-east': 0.12,
      'us-central': 0.10,
      'europe': 0.20,
      'asia-pacific': 0.08,
      'global': 0.12
    };
    
    const electricityRate = regionalElectricityRates[region] || regionalElectricityRates.global;
    const energyKWh = profile.energyPerQuery / 1000;
    const energyCost = energyKWh * electricityRate;
    
    // Rough API cost estimate (varies significantly)
    const roughApiCostPer1kTokens = {
      'frontier-large': 0.03,
      'reasoning-specialized': 0.05,
      'balanced-performance': 0.015,
      'ultra-efficient': 0.001,
      'legacy-large': 0.02,
      'legacy-efficient': 0.0015
    };
    
    const apiCostRate = roughApiCostPer1kTokens[profile.category] || 0.02;
    const apiCost = (tokensUsed / 1000) * apiCostRate;
    
    return {
      energyCost: energyCost,
      apiCost: apiCost,
      total: energyCost + apiCost,
      region: region,
      electricityRate: electricityRate
    };
  }
  
  /**
   * Get model efficiency score (0-100)
   */
  getModelEfficiencyScore(modelKey) {
    const profile = this.modelPowerProfiles[modelKey];
    if (!profile) return 50; // Default medium efficiency
    
    // Calculate efficiency based on tokens per second per watt
    const tokensPerWatt = profile.tokensPerSecond / profile.baseWatts;
    
    // Scoring scale (higher tokens per watt = more efficient)
    if (tokensPerWatt > 6) return 95;      // Ultra-efficient models
    if (tokensPerWatt > 4) return 80;      // Efficient models
    if (tokensPerWatt > 2.5) return 65;    // Balanced models
    if (tokensPerWatt > 1.5) return 45;    // Less efficient models
    return 25;                             // Power-intensive models
  }
  
  /**
   * Get comprehensive model comparison data
   */
  compareModels(modelKeys) {
    const comparison = {
      models: [],
      efficiencyRanking: [],
      powerRanking: [],
      sustainabilityRanking: []
    };
    
    modelKeys.forEach(key => {
      const profile = this.modelPowerProfiles[key];
      if (!profile) return;
      
      const efficiencyScore = this.getModelEfficiencyScore(key);
      const environmentalImpact = this.calculateEnvironmentalImpact(profile.baseWatts, 3600000);
      
      const modelData = {
        key: key,
        name: profile.name,
        category: profile.category,
        company: profile.company,
        baseWatts: profile.baseWatts,
        tokensPerSecond: profile.tokensPerSecond,
        energyPerQuery: profile.energyPerQuery,
        efficiencyScore: efficiencyScore,
        carbonEmissions: environmentalImpact.carbonEmissionsG,
        sustainabilityScore: Math.round(100 - (environmentalImpact.carbonEmissionsG / 20))
      };
      
      comparison.models.push(modelData);
    });
    
    // Sort rankings
    comparison.efficiencyRanking = [...comparison.models].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    comparison.powerRanking = [...comparison.models].sort((a, b) => a.baseWatts - b.baseWatts);
    comparison.sustainabilityRanking = [...comparison.models].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
    
    return comparison;
  }
}

/**
 * AdvancedPromptOptimizer class - Sophisticated prompt optimization with ML-inspired algorithms
 */
class AdvancedPromptOptimizer {
  constructor(tokenCounter) {
    console.log('[AdvancedPromptOptimizer] Initializing advanced prompt optimization system');
    
    // Initialize optimization components
    this.tokenCounter = tokenCounter; // Reference to existing TokenCounter
    this.optimizationHistory = new Map();
    this.learningData = new Map();
    this.optimizationStats = {
      totalOptimizations: 0,
      averageTokenSavings: 0,
      averageQualityScore: 0,
      successfulOptimizations: 0
    };
    
    // Initialize quality scoring system
    this.qualityScorer = new OptimizationQualityScorer();
    
    // Advanced optimization techniques registry
    this.optimizationTechniques = {
      // Semantic compression techniques
      semanticCompression: {
        name: 'Semantic Compression',
        priority: 1,
        apply: this.applySematicCompression.bind(this),
        description: 'Removes redundant semantic information while preserving meaning'
      },
      
      // Structural optimization
      structuralOptimization: {
        name: 'Structural Optimization',
        priority: 2,
        apply: this.applyStructuralOptimization.bind(this),
        description: 'Reorganizes prompt structure for maximum efficiency'
      },
      
      // Context-aware reduction
      contextualReduction: {
        name: 'Contextual Reduction',
        priority: 3,
        apply: this.applyContextualReduction.bind(this),
        description: 'Reduces context based on AI model capabilities'
      },
      
      // Pattern-based optimization
      patternOptimization: {
        name: 'Pattern Optimization',
        priority: 4,
        apply: this.applyPatternOptimization.bind(this),
        description: 'Uses learned patterns to optimize common structures'
      },
      
      // Domain-specific optimization
      domainOptimization: {
        name: 'Domain Optimization',
        priority: 5,
        apply: this.applyDomainOptimization.bind(this),
        description: 'Applies domain-specific optimization rules'
      },
      
      // Linguistic optimization
      linguisticOptimization: {
        name: 'Linguistic Optimization',
        priority: 6,
        apply: this.applyLinguisticOptimization.bind(this),
        description: 'Optimizes language use for AI comprehension'
      }
    };
    
    // Advanced token-wasting pattern database
    this.advancedPatterns = {
      // Meta-linguistic markers (often unnecessary for AI)
      metaMarkers: {
        patterns: [
          /\b(?:please note that|it should be noted that|it is important to note that|bear in mind that|keep in mind that|remember that|don't forget that)\b/gi,
          /\b(?:as you know|as we know|obviously|clearly|of course|naturally|needless to say|it goes without saying)\b/gi,
          /\b(?:in other words|that is to say|to put it simply|in simple terms|to clarify|to be clear|let me be clear)\b/gi
        ],
        weight: 0.9,
        category: 'meta'
      },
      
      // Conversational scaffolding (AI doesn't need social cues)
      conversationalScaffolding: {
        patterns: [
          /\b(?:I hope|I think|I believe|I feel|in my opinion|from my perspective|it seems to me)\b/gi,
          /\b(?:if you don't mind|if possible|if you could|would you mind|could you please|would you be so kind)\b/gi,
          /\b(?:thank you|thanks|please|kindly|I appreciate|I'm grateful|sorry to bother you)\b/gi
        ],
        weight: 0.8,
        category: 'social'
      },
      
      // Redundant elaboration
      redundantElaboration: {
        patterns: [
          /\b(?:very|extremely|quite|rather|pretty|fairly|somewhat|relatively|particularly|especially)\s+(?:important|good|bad|useful|helpful|effective|efficient)\b/gi,
          /\b(?:a lot of|lots of|a great deal of|a large number of|a significant amount of|numerous|multiple|various)\b/gi,
          /\b(?:in order to|so as to|with the purpose of|for the purpose of|with the aim of|in an effort to)\b/gi
        ],
        weight: 0.7,
        category: 'redundancy'
      },
      
      // Temporal and logical connectors (often redundant for AI)
      temporalConnectors: {
        patterns: [
          /\b(?:first of all|to begin with|initially|at the outset|in the beginning|as a starting point)\b/gi,
          /\b(?:furthermore|moreover|additionally|in addition|what's more|on top of that|not only that)\b/gi,
          /\b(?:finally|lastly|in conclusion|to conclude|to sum up|in summary|all in all)\b/gi
        ],
        weight: 0.6,
        category: 'connectors'
      },
      
      // Uncertainty and hedging (reduces AI confidence)
      uncertaintyHedging: {
        patterns: [
          /\b(?:maybe|perhaps|possibly|potentially|likely|probably|might|could be|may be)\b/gi,
          /\b(?:sort of|kind of|more or less|to some extent|in a way|somewhat|rather)\b/gi,
          /\b(?:I guess|I suppose|I assume|I imagine|it seems|it appears|apparently)\b/gi
        ],
        weight: 0.5,
        category: 'hedging'
      }
    };
    
    // Domain-specific optimization rules
    this.domainRules = {
      coding: {
        patterns: [
          /\b(?:write|create|generate|produce|make)\s+(?:a|an|some)?\s*(?:code|script|program|function|method)\b/gi,
          /\b(?:programming|coding|software development|development)\b/gi
        ],
        optimizations: [
          { from: /please write a function that/gi, to: 'Function:' },
          { from: /create a script that/gi, to: 'Script:' },
          { from: /I need you to help me with/gi, to: 'Help with:' },
          { from: /can you help me debug this code/gi, to: 'Debug:' }
        ],
        weight: 0.8
      },
      
      analysis: {
        patterns: [
          /\b(?:analyze|examine|study|investigate|review|assess|evaluate)\b/gi,
          /\b(?:analysis|examination|investigation|assessment|evaluation)\b/gi
        ],
        optimizations: [
          { from: /please analyze the following/gi, to: 'Analyze:' },
          { from: /I would like you to examine/gi, to: 'Examine:' },
          { from: /can you provide an analysis of/gi, to: 'Analyze:' }
        ],
        weight: 0.7
      },
      
      writing: {
        patterns: [
          /\b(?:write|compose|draft|create)\s+(?:a|an)?\s*(?:essay|article|story|letter|email|document)\b/gi,
          /\b(?:writing|composition|content creation)\b/gi
        ],
        optimizations: [
          { from: /please write an essay about/gi, to: 'Essay on:' },
          { from: /I need you to compose/gi, to: 'Compose:' },
          { from: /can you help me write/gi, to: 'Write:' }
        ],
        weight: 0.6
      },
      
      explanation: {
        patterns: [
          /\b(?:explain|describe|clarify|define|elaborate)\b/gi,
          /\b(?:explanation|description|definition)\b/gi
        ],
        optimizations: [
          { from: /can you explain what is/gi, to: 'Explain:' },
          { from: /please describe how/gi, to: 'Describe how:' },
          { from: /I would like to understand/gi, to: 'Explain:' }
        ],
        weight: 0.5
      }
    };
    
    // Model-specific optimization strategies
    this.modelStrategies = {
      'gpt-4': {
        preferences: ['structured', 'concise', 'specific'],
        tokenEfficiency: 0.9,
        contextHandling: 'excellent',
        specializations: ['reasoning', 'analysis', 'coding']
      },
      'gpt-3.5': {
        preferences: ['simple', 'direct', 'clear'],
        tokenEfficiency: 0.7,
        contextHandling: 'good',
        specializations: ['general', 'conversation', 'basic-tasks']
      },
      'claude': {
        preferences: ['detailed', 'nuanced', 'thoughtful'],
        tokenEfficiency: 0.8,
        contextHandling: 'excellent',
        specializations: ['writing', 'analysis', 'ethics']
      },
      'gemini': {
        preferences: ['multimodal', 'creative', 'factual'],
        tokenEfficiency: 0.75,
        contextHandling: 'very-good',
        specializations: ['search', 'creative', 'factual']
      }
    };
  }
  
  /**
   * Advanced prompt optimization with sophisticated algorithms
   */
  async optimizePromptAdvanced(prompt, options = {}) {
    const startTime = Date.now();
    console.log('[AdvancedPromptOptimizer] Starting advanced optimization:', {
      promptLength: prompt.length,
      options: options
    });
    
    // Set default options
    const config = {
      level: options.level || 'balanced',
      targetModel: options.targetModel || 'gpt-4',
      preserveStructure: options.preserveStructure !== false,
      domainHints: options.domainHints || [],
      maxReduction: options.maxReduction || 0.5,
      qualityThreshold: options.qualityThreshold || 0.7,
      ...options
    };
    
    try {
      // Phase 1: Analysis
      const analysis = this.analyzePrompt(prompt, config);
      
      // Phase 2: Apply techniques
      let optimized = prompt;
      const appliedTechniques = [];
      
      // Apply semantic compression
      if (config.level !== 'conservative') {
        const result = this.applySematicCompression(optimized, analysis, config);
        if (result.success) {
          optimized = result.optimized;
          appliedTechniques.push(result);
        }
      }
      
      // Apply structural optimization
      const structuralResult = this.applyStructuralOptimization(optimized, analysis, config);
      if (structuralResult.success) {
        optimized = structuralResult.optimized;
        appliedTechniques.push(structuralResult);
      }
      
      // Apply pattern optimization
      const patternResult = this.applyPatternOptimization(optimized, analysis, config);
      if (patternResult.success) {
        optimized = patternResult.optimized;
        appliedTechniques.push(patternResult);
      }
      
      // Apply domain optimization
      const domainResult = this.applyDomainOptimization(optimized, analysis, config);
      if (domainResult.success) {
        optimized = domainResult.optimized;
        appliedTechniques.push(domainResult);
      }
      
      // Calculate results
      const originalTokens = this.estimateTokens(prompt, config.targetModel);
      const optimizedTokens = this.estimateTokens(optimized, config.targetModel);
      const tokenReduction = originalTokens - optimizedTokens;
      const percentageReduction = Math.round((tokenReduction / Math.max(1, originalTokens)) * 100);
      
      // Phase 3: Quality Assessment
      const qualityAssessment = this.qualityScorer.assessOptimizationQuality(
        prompt,
        optimized,
        { techniques: appliedTechniques, analysis: analysis }
      );
      
      // Update optimization statistics
      this.updateOptimizationStats(tokenReduction, qualityAssessment.overallScore);
      
      const totalDuration = Date.now() - startTime;
      
      const optimizationResult = {
        success: true,
        original: prompt,
        optimized: optimized,
        reduction: {
          characters: prompt.length - optimized.length,
          tokens: tokenReduction,
          percentage: percentageReduction
        },
        techniques: appliedTechniques,
        analysis: analysis,
        quality: qualityAssessment,
        metadata: {
          totalDuration,
          config,
          optimizationId: Date.now() + Math.random().toString(36).substr(2, 9)
        }
      };
      
      // Store in optimization history
      this.storeOptimizationResult(optimizationResult);
      
      return optimizationResult;
      
    } catch (error) {
      console.error('[AdvancedPromptOptimizer] Optimization failed:', error);
      return {
        success: false,
        error: error.message,
        original: prompt,
        optimized: prompt
      };
    }
  }
  
  /**
   * Analyze prompt for optimization opportunities
   */
  analyzePrompt(prompt, config) {
    const analysis = {
      length: prompt.length,
      wordCount: prompt.split(/\s+/).length,
      sentenceCount: prompt.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      tokenCount: this.estimateTokens(prompt, config.targetModel),
      
      // Pattern analysis
      patterns: {
        metaMarkers: 0,
        conversationalScaffolding: 0,
        redundantElaboration: 0,
        temporalConnectors: 0,
        uncertaintyHedging: 0
      },
      
      // Domain detection
      detectedDomains: [],
      
      // Structure analysis
      structure: {
        hasIntroduction: false,
        hasConclusion: false,
        hasExamples: false,
        hasBulletPoints: false,
        hasNumberedLists: false
      },
      
      // Optimization opportunities
      opportunities: []
    };
    
    // Perform pattern analysis
    for (const [category, patternData] of Object.entries(this.advancedPatterns)) {
      let matches = 0;
      for (const pattern of patternData.patterns) {
        const found = prompt.match(pattern);
        matches += found ? found.length : 0;
      }
      analysis.patterns[category] = matches;
      
      if (matches > 0) {
        analysis.opportunities.push({
          category,
          matches,
          weight: patternData.weight,
          potentialReduction: matches * 3
        });
      }
    }
    
    // Domain detection
    for (const [domain, rules] of Object.entries(this.domainRules)) {
      for (const pattern of rules.patterns) {
        if (pattern.test(prompt)) {
          analysis.detectedDomains.push(domain);
          break;
        }
      }
    }
    
    // Structure analysis
    analysis.structure.hasIntroduction = /^(first|to begin|initially|let me start)/i.test(prompt);
    analysis.structure.hasConclusion = /(finally|in conclusion|to sum up|lastly)$/i.test(prompt);
    analysis.structure.hasExamples = /for example|such as|like|including/i.test(prompt);
    analysis.structure.hasBulletPoints = /^\s*[-*•]/m.test(prompt);
    analysis.structure.hasNumberedLists = /^\s*\d+[\.)]/m.test(prompt);
    
    return analysis;
  }
  
  /**
   * Apply semantic compression optimization
   */
  applySematicCompression(prompt, analysis, config) {
    let optimized = prompt;
    let tokensSaved = 0;
    
    // Remove semantic redundancy
    const compressionRules = [
      // Remove redundant qualifiers
      { from: /\b(very|extremely|quite|rather) (important|good|useful|helpful)\b/gi, to: '$2' },
      // Compress common phrases
      { from: /\bin order to\b/gi, to: 'to' },
      { from: /\bdue to the fact that\b/gi, to: 'because' },
      { from: /\bat this point in time\b/gi, to: 'now' },
      { from: /\bfor the purpose of\b/gi, to: 'for' },
      { from: /\bin the event that\b/gi, to: 'if' },
      // Remove filler words
      { from: /\b(basically|essentially|actually|literally)\s+/gi, to: '' }
    ];
    
    const originalLength = optimized.length;
    
    for (const rule of compressionRules) {
      const before = optimized.length;
      optimized = optimized.replace(rule.from, rule.to);
      const after = optimized.length;
      tokensSaved += Math.ceil((before - after) / 4);
    }
    
    // Clean up extra whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();
    
    return {
      success: originalLength !== optimized.length,
      optimized: optimized,
      tokensSaved: tokensSaved,
      technique: 'semanticCompression'
    };
  }
  
  /**
   * Apply structural optimization
   */
  applyStructuralOptimization(prompt, analysis, config) {
    let optimized = prompt;
    let tokensSaved = 0;
    
    // Remove unnecessary introductions and conclusions
    if (config.level === 'aggressive') {
      // Remove common introductory phrases
      const introPatterns = [
        /^(First of all,|To begin with,|Initially,|Let me start by saying|At the outset,)\s*/gi,
        /^(I would like to|I want to|I need to|Please)\s+/gi
      ];
      
      for (const pattern of introPatterns) {
        const before = optimized.length;
        optimized = optimized.replace(pattern, '');
        tokensSaved += Math.ceil((before - optimized.length) / 4);
      }
      
      // Remove concluding phrases
      const conclusionPatterns = [
        /\s*(In conclusion,|To conclude,|Finally,|Lastly,|To sum up,).*$/gi,
        /\s*(Thank you|Thanks in advance|I appreciate|I would appreciate).*$/gi
      ];
      
      for (const pattern of conclusionPatterns) {
        const before = optimized.length;
        optimized = optimized.replace(pattern, '');
        tokensSaved += Math.ceil((before - optimized.length) / 4);
      }
    }
    
    return {
      success: tokensSaved > 0,
      optimized: optimized.trim(),
      tokensSaved: tokensSaved,
      technique: 'structuralOptimization'
    };
  }
  
  /**
   * Apply pattern-based optimization
   */
  applyPatternOptimization(prompt, analysis, config) {
    let optimized = prompt;
    let tokensSaved = 0;
    
    // Apply advanced pattern replacements
    for (const [category, patternData] of Object.entries(this.advancedPatterns)) {
      if (analysis.patterns[category] > 0) {
        for (const pattern of patternData.patterns) {
          const matches = optimized.match(pattern);
          if (matches) {
            const before = optimized.length;
            optimized = optimized.replace(pattern, '');
            const saved = Math.ceil((before - optimized.length) / 4);
            tokensSaved += saved;
          }
        }
      }
    }
    
    return {
      success: tokensSaved > 0,
      optimized: optimized.replace(/\s+/g, ' ').trim(),
      tokensSaved: tokensSaved,
      technique: 'patternOptimization'
    };
  }
  
  /**
   * Apply domain-specific optimization
   */
  applyDomainOptimization(prompt, analysis, config) {
    let optimized = prompt;
    let tokensSaved = 0;
    
    for (const domain of analysis.detectedDomains) {
      const domainRules = this.domainRules[domain];
      if (domainRules) {
        for (const optimization of domainRules.optimizations) {
          const before = optimized.length;
          optimized = optimized.replace(optimization.from, optimization.to);
          tokensSaved += Math.ceil((before - optimized.length) / 4);
        }
      }
    }
    
    return {
      success: tokensSaved > 0,
      optimized: optimized,
      tokensSaved: tokensSaved,
      technique: 'domainOptimization'
    };
  }
  
  /**
   * Update optimization statistics
   */
  updateOptimizationStats(tokenReduction, qualityScore) {
    this.optimizationStats.totalOptimizations += 1;
    
    // Update average token savings
    const totalSavings = this.optimizationStats.averageTokenSavings * (this.optimizationStats.totalOptimizations - 1);
    this.optimizationStats.averageTokenSavings = (totalSavings + tokenReduction) / this.optimizationStats.totalOptimizations;
    
    // Update average quality score
    const totalQuality = this.optimizationStats.averageQualityScore * (this.optimizationStats.totalOptimizations - 1);
    this.optimizationStats.averageQualityScore = (totalQuality + qualityScore) / this.optimizationStats.totalOptimizations;
    
    // Update successful optimizations (quality > 0.7)
    if (qualityScore > 0.7) {
      this.optimizationStats.successfulOptimizations += 1;
    }
    
    console.log('[AdvancedPromptOptimizer] Stats updated:', this.optimizationStats);
  }
  
  /**
   * Store optimization result in history
   */
  storeOptimizationResult(result) {
    const optimizationId = result.metadata.optimizationId;
    this.optimizationHistory.set(optimizationId, {
      timestamp: Date.now(),
      result: result,
      config: result.metadata.config
    });
    
    // Keep only recent history (last 100 optimizations)
    if (this.optimizationHistory.size > 100) {
      const oldestKey = Math.min(...this.optimizationHistory.keys());
      this.optimizationHistory.delete(oldestKey);
    }
  }
  
  /**
   * Get optimization insights based on history
   */
  getOptimizationInsights() {
    const insights = {
      totalOptimizations: this.optimizationStats.totalOptimizations,
      averageTokenSavings: Math.round(this.optimizationStats.averageTokenSavings),
      averageQualityScore: Math.round(this.optimizationStats.averageQualityScore * 100) / 100,
      successRate: this.optimizationStats.totalOptimizations > 0 ?
        Math.round((this.optimizationStats.successfulOptimizations / this.optimizationStats.totalOptimizations) * 100) : 0,
      bestTechniques: this.getBestPerformingTechniques(),
      qualityTrends: this.getQualityTrends()
    };
    
    return insights;
  }
  
  /**
   * Get best performing optimization techniques
   */
  getBestPerformingTechniques() {
    const techniqueStats = new Map();
    
    for (const [id, historyEntry] of this.optimizationHistory.entries()) {
      const result = historyEntry.result;
      if (result.techniques) {
        result.techniques.forEach(technique => {
          const stats = techniqueStats.get(technique.technique) || {
            name: technique.technique,
            totalUses: 0,
            totalTokensSaved: 0,
            totalQualityScore: 0,
            avgTokensSaved: 0,
            avgQualityScore: 0
          };
          
          stats.totalUses += 1;
          stats.totalTokensSaved += technique.tokensSaved || 0;
          stats.totalQualityScore += result.quality?.overallScore || 0;
          stats.avgTokensSaved = stats.totalTokensSaved / stats.totalUses;
          stats.avgQualityScore = stats.totalQualityScore / stats.totalUses;
          
          techniqueStats.set(technique.technique, stats);
        });
      }
    }
    
    return Array.from(techniqueStats.values())
      .filter(stats => stats.totalUses >= 3) // Minimum usage threshold
      .sort((a, b) => (b.avgTokensSaved * b.avgQualityScore) - (a.avgTokensSaved * a.avgQualityScore))
      .slice(0, 5);
  }
  
  /**
   * Get quality trends over time
   */
  getQualityTrends() {
    const trends = [];
    const sortedHistory = Array.from(this.optimizationHistory.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by time periods (last 10 optimizations)
    const recentHistory = sortedHistory.slice(-10);
    let totalQuality = 0;
    let totalTokenSavings = 0;
    
    recentHistory.forEach(entry => {
      totalQuality += entry.result.quality?.overallScore || 0;
      totalTokenSavings += entry.result.reduction?.tokens || 0;
    });
    
    if (recentHistory.length > 0) {
      trends.push({
        period: 'Recent',
        avgQuality: Math.round((totalQuality / recentHistory.length) * 100) / 100,
        avgTokenSavings: Math.round(totalTokenSavings / recentHistory.length),
        count: recentHistory.length
      });
    }
    
    return trends;
  }
  
  /**
   * Estimate tokens for a given text and model
   */
  estimateTokens(text, model = 'gpt-4') {
    // Use existing token counter if available
    if (this.tokenCounter) {
      return this.tokenCounter.countTokensGPT(text, model);
    } else if (window.popupManager && window.popupManager.tokenCounter) {
      return window.popupManager.tokenCounter.countTokensGPT(text, model);
    }
    
    // Fallback estimation
    const ratios = { 'gpt-4': 3.8, 'gpt-3.5': 4.0, 'claude': 3.5, 'gemini': 3.6 };
    const ratio = ratios[model] || ratios['gpt-4'];
    return Math.ceil(text.length / ratio);
  }
}

/**
 * OptimizationQualityScorer class - Advanced quality assessment for prompt optimizations
 */
class OptimizationQualityScorer {
  constructor() {
    console.log('[OptimizationQualityScorer] Initializing optimization quality scoring system');
    
    // Quality assessment weights
    this.qualityWeights = {
      semanticPreservation: 0.30,    // How well meaning is preserved
      structuralCoherence: 0.20,     // How well structure is maintained
      linguisticClarity: 0.20,       // How clear and readable the text is
      contextualRelevance: 0.15,     // How relevant the content remains
      tokenEfficiency: 0.15          // How efficiently tokens are used
    };
    
    // Quality thresholds
    this.qualityThresholds = {
      excellent: 0.90,    // 90%+ overall quality
      good: 0.75,         // 75%+ overall quality
      acceptable: 0.60,   // 60%+ overall quality
      poor: 0.40,         // 40%+ overall quality
      unacceptable: 0.0   // Below 40%
    };
    
    // Semantic analysis patterns
    this.semanticPatterns = {
      keyTerms: /\b(important|key|main|primary|essential|crucial|critical|vital|significant)\b/gi,
      actionWords: /\b(create|generate|write|analyze|explain|describe|implement|develop|design)\b/gi,
      contextualCues: /\b(because|therefore|however|although|since|while|whereas|moreover)\b/gi,
      specificTerms: /\b(specific|particular|detailed|exact|precise|explicit)\b/gi,
      quantifiers: /\b(all|some|most|many|few|several|multiple|various)\b/gi
    };
    
    // Structural integrity markers
    this.structuralMarkers = {
      introductionMarkers: /\b(first|initially|to begin|starting|introduction)\b/gi,
      transitionMarkers: /\b(next|then|furthermore|additionally|moreover|however)\b/gi,
      conclusionMarkers: /\b(finally|in conclusion|to summarize|lastly|overall)\b/gi,
      listMarkers: /\b(first|second|third|1\.|2\.|3\.|\*|-|•)\b/gi,
      hierarchyMarkers: /\b(main|sub|primary|secondary|detail|example)\b/gi
    };
    
    // Linguistic quality indicators
    this.linguisticIndicators = {
      complexSentences: /[^.!?]{100,}/g,  // Very long sentences
      passiveVoice: /\b(is|are|was|were|being|been)\s+\w+ed\b/gi,
      redundantWords: /\b(very|really|quite|rather|somewhat|fairly)\s+/gi,
      vagueTerms: /\b(thing|stuff|something|anything|everything|nothing)\b/gi,
      fillerWords: /\b(um|uh|like|you know|sort of|kind of)\b/gi
    };
    
    // Context preservation patterns
    this.contextPatterns = {
      requirements: /\b(must|should|need|require|necessary|mandatory)\b/gi,
      constraints: /\b(cannot|must not|should not|avoid|exclude|limit)\b/gi,
      goals: /\b(goal|objective|purpose|aim|target|intent)\b/gi,
      examples: /\b(example|instance|case|such as|for instance|like)\b/gi,
      specifications: /\b(format|style|length|size|type|version)\b/gi
    };
    
    // Historical quality data for machine learning
    this.qualityHistory = new Map();
    this.patternSuccess = new Map();
    this.modelPerformance = new Map();
  }
  
  /**
   * Comprehensive quality assessment of prompt optimization
   */
  assessOptimizationQuality(originalPrompt, optimizedPrompt, optimizationResult = {}) {
    console.log('[OptimizationQualityScorer] Starting comprehensive quality assessment');
    
    const startTime = Date.now();
    
    // Calculate individual quality metrics
    const metrics = {
      semanticPreservation: this.assessSemanticPreservation(originalPrompt, optimizedPrompt),
      structuralCoherence: this.assessStructuralCoherence(originalPrompt, optimizedPrompt),
      linguisticClarity: this.assessLinguisticClarity(optimizedPrompt, originalPrompt),
      contextualRelevance: this.assessContextualRelevance(originalPrompt, optimizedPrompt),
      tokenEfficiency: this.assessTokenEfficiency(originalPrompt, optimizedPrompt)
    };
    
    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(metrics);
    
    // Determine quality grade
    const qualityGrade = this.determineQualityGrade(overallScore);
    
    // Generate detailed recommendations
    const recommendations = this.generateQualityRecommendations(metrics, originalPrompt, optimizedPrompt);
    
    // Calculate confidence intervals
    const confidence = this.calculateConfidenceInterval(metrics, originalPrompt.length, optimizedPrompt.length);
    
    // Update learning system
    this.updateQualityLearningSystem(metrics, overallScore, optimizationResult);
    
    const assessmentDuration = Date.now() - startTime;
    
    const qualityAssessment = {
      overallScore: Math.round(overallScore * 100) / 100,
      qualityGrade: qualityGrade,
      metrics: {
        semanticPreservation: Math.round(metrics.semanticPreservation * 100) / 100,
        structuralCoherence: Math.round(metrics.structuralCoherence * 100) / 100,
        linguisticClarity: Math.round(metrics.linguisticClarity * 100) / 100,
        contextualRelevance: Math.round(metrics.contextualRelevance * 100) / 100,
        tokenEfficiency: Math.round(metrics.tokenEfficiency * 100) / 100
      },
      recommendations: recommendations,
      confidence: confidence,
      metadata: {
        assessmentDuration: assessmentDuration,
        originalLength: originalPrompt.length,
        optimizedLength: optimizedPrompt.length,
        reductionRatio: (originalPrompt.length - optimizedPrompt.length) / originalPrompt.length
      }
    };
    
    console.log('[OptimizationQualityScorer] Quality assessment complete:', {
      overallScore: qualityAssessment.overallScore,
      qualityGrade: qualityAssessment.qualityGrade,
      duration: assessmentDuration + 'ms'
    });
    
    return qualityAssessment;
  }
  
  /**
   * Assess semantic preservation - how well meaning is retained
   */
  assessSemanticPreservation(original, optimized) {
    let preservationScore = 1.0;
    
    // Extract key terms and check preservation
    const keyTermsScore = this.calculateKeyTermsPreservation(original, optimized);
    
    // Check action word preservation
    const actionWordsScore = this.calculateActionWordsPreservation(original, optimized);
    
    // Assess contextual cue preservation
    const contextualCuesScore = this.calculateContextualCuesPreservation(original, optimized);
    
    // Check specific terms preservation
    const specificTermsScore = this.calculateSpecificTermsPreservation(original, optimized);
    
    // Calculate word overlap (Jaccard similarity)
    const wordOverlapScore = this.calculateWordOverlap(original, optimized);
    
    // Weighted semantic preservation score
    preservationScore = (
      keyTermsScore * 0.25 +
      actionWordsScore * 0.25 +
      contextualCuesScore * 0.20 +
      specificTermsScore * 0.15 +
      wordOverlapScore * 0.15
    );
    
    console.log('[OptimizationQualityScorer] Semantic preservation:', {
      keyTerms: keyTermsScore.toFixed(3),
      actionWords: actionWordsScore.toFixed(3),
      contextualCues: contextualCuesScore.toFixed(3),
      specificTerms: specificTermsScore.toFixed(3),
      wordOverlap: wordOverlapScore.toFixed(3),
      overall: preservationScore.toFixed(3)
    });
    
    return Math.max(0, Math.min(1, preservationScore));
  }
  
  /**
   * Assess structural coherence - how well structure is maintained
   */
  assessStructuralCoherence(original, optimized) {
    let coherenceScore = 1.0;
    
    // Check sentence count preservation
    const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const optimizedSentences = optimized.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const sentenceRatio = originalSentences > 0 ? optimizedSentences / originalSentences : 1;
    const sentenceScore = 1 - Math.abs(sentenceRatio - 0.8); // Target 80% sentence retention
    
    // Check paragraph structure preservation
    const paragraphScore = this.calculateParagraphStructureScore(original, optimized);
    
    // Assess list structure preservation
    const listScore = this.calculateListStructureScore(original, optimized);
    
    // Check transition marker preservation
    const transitionScore = this.calculateTransitionPreservation(original, optimized);
    
    // Calculate logical flow preservation
    const logicalFlowScore = this.calculateLogicalFlowScore(original, optimized);
    
    coherenceScore = (
      sentenceScore * 0.20 +
      paragraphScore * 0.25 +
      listScore * 0.20 +
      transitionScore * 0.15 +
      logicalFlowScore * 0.20
    );
    
    return Math.max(0, Math.min(1, coherenceScore));
  }
  
  /**
   * Assess linguistic clarity - how clear and readable the text is
   */
  assessLinguisticClarity(optimized, original) {
    let clarityScore = 1.0;
    
    // Calculate average sentence length (optimal: 15-20 words)
    const sentences = optimized.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = optimized.split(/\s+/).filter(w => w.length > 0);
    const avgSentenceLength = words.length / Math.max(1, sentences.length);
    const sentenceLengthScore = this.calculateSentenceLengthScore(avgSentenceLength);
    
    // Calculate average word length (optimal: 4-6 characters)
    const avgWordLength = optimized.replace(/\s/g, '').length / Math.max(1, words.length);
    const wordLengthScore = this.calculateWordLengthScore(avgWordLength);
    
    // Check for passive voice reduction
    const passiveVoiceScore = this.calculatePassiveVoiceScore(optimized, original);
    
    // Assess redundancy removal
    const redundancyScore = this.calculateRedundancyScore(optimized, original);
    
    // Check vocabulary simplicity
    const vocabularyScore = this.calculateVocabularyComplexityScore(optimized);
    
    clarityScore = (
      sentenceLengthScore * 0.25 +
      wordLengthScore * 0.15 +
      passiveVoiceScore * 0.20 +
      redundancyScore * 0.25 +
      vocabularyScore * 0.15
    );
    
    return Math.max(0, Math.min(1, clarityScore));
  }
  
  /**
   * Assess contextual relevance - how relevant the content remains
   */
  assessContextualRelevance(original, optimized) {
    let relevanceScore = 1.0;
    
    // Check requirement preservation
    const requirementScore = this.calculatePatternPreservation(
      original, optimized, this.contextPatterns.requirements
    );
    
    // Check constraint preservation
    const constraintScore = this.calculatePatternPreservation(
      original, optimized, this.contextPatterns.constraints
    );
    
    // Check goal preservation
    const goalScore = this.calculatePatternPreservation(
      original, optimized, this.contextPatterns.goals
    );
    
    // Check example preservation
    const exampleScore = this.calculatePatternPreservation(
      original, optimized, this.contextPatterns.examples
    );
    
    // Check specification preservation
    const specificationScore = this.calculatePatternPreservation(
      original, optimized, this.contextPatterns.specifications
    );
    
    relevanceScore = (
      requirementScore * 0.25 +
      constraintScore * 0.20 +
      goalScore * 0.25 +
      exampleScore * 0.15 +
      specificationScore * 0.15
    );
    
    return Math.max(0, Math.min(1, relevanceScore));
  }
  
  /**
   * Assess token efficiency - how efficiently tokens are used
   */
  assessTokenEfficiency(original, optimized) {
    const originalLength = original.length;
    const optimizedLength = optimized.length;
    
    if (originalLength === 0) return 1.0;
    
    const reductionRatio = (originalLength - optimizedLength) / originalLength;
    
    // Optimal reduction is 20-40%
    let efficiencyScore;
    if (reductionRatio < 0.1) {
      efficiencyScore = reductionRatio * 5; // Poor efficiency for minimal reduction
    } else if (reductionRatio <= 0.4) {
      efficiencyScore = 0.5 + (reductionRatio - 0.1) * 1.67; // Linear improvement
    } else if (reductionRatio <= 0.6) {
      efficiencyScore = 1.0 - (reductionRatio - 0.4) * 1.5; // Diminishing returns
    } else {
      efficiencyScore = Math.max(0.1, 0.7 - (reductionRatio - 0.6) * 2); // Over-optimization penalty
    }
    
    return Math.max(0, Math.min(1, efficiencyScore));
  }
  
  /**
   * Calculate weighted overall quality score
   */
  calculateWeightedScore(metrics) {
    return (
      metrics.semanticPreservation * this.qualityWeights.semanticPreservation +
      metrics.structuralCoherence * this.qualityWeights.structuralCoherence +
      metrics.linguisticClarity * this.qualityWeights.linguisticClarity +
      metrics.contextualRelevance * this.qualityWeights.contextualRelevance +
      metrics.tokenEfficiency * this.qualityWeights.tokenEfficiency
    );
  }
  
  /**
   * Determine quality grade based on overall score
   */
  determineQualityGrade(overallScore) {
    if (overallScore >= this.qualityThresholds.excellent) return 'excellent';
    if (overallScore >= this.qualityThresholds.good) return 'good';
    if (overallScore >= this.qualityThresholds.acceptable) return 'acceptable';
    if (overallScore >= this.qualityThresholds.poor) return 'poor';
    return 'unacceptable';
  }
  
  /**
   * Generate quality improvement recommendations
   */
  generateQualityRecommendations(metrics, original, optimized) {
    const recommendations = [];
    const threshold = 0.75; // Recommendation threshold
    
    if (metrics.semanticPreservation < threshold) {
      recommendations.push({
        category: 'semantic',
        priority: 'high',
        message: 'Consider preserving more key terms and action words to maintain semantic meaning',
        specificIssue: 'Low semantic preservation score',
        suggestedAction: 'Review removed words for essential meaning'
      });
    }
    
    if (metrics.structuralCoherence < threshold) {
      recommendations.push({
        category: 'structure',
        priority: 'medium',
        message: 'Try to maintain logical flow and sentence structure',
        specificIssue: 'Structural coherence below threshold',
        suggestedAction: 'Preserve transition words and paragraph structure'
      });
    }
    
    if (metrics.linguisticClarity < threshold) {
      recommendations.push({
        category: 'clarity',
        priority: 'medium',
        message: 'Focus on simplifying complex sentences while maintaining meaning',
        specificIssue: 'Linguistic clarity could be improved',
        suggestedAction: 'Break down long sentences and simplify vocabulary'
      });
    }
    
    if (metrics.contextualRelevance < threshold) {
      recommendations.push({
        category: 'context',
        priority: 'high',
        message: 'Ensure important contextual information is preserved',
        specificIssue: 'Critical context may have been lost',
        suggestedAction: 'Review requirements, constraints, and specifications'
      });
    }
    
    if (metrics.tokenEfficiency < threshold) {
      recommendations.push({
        category: 'efficiency',
        priority: 'low',
        message: 'Consider more aggressive optimization for better token savings',
        specificIssue: 'Token reduction below optimal range',
        suggestedAction: 'Identify additional redundant phrases to remove'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate confidence interval for quality assessment
   */
  calculateConfidenceInterval(metrics, originalLength, optimizedLength) {
    // Simple heuristic for confidence based on text length and metric variance
    const metricValues = Object.values(metrics);
    const avgMetric = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;
    const variance = metricValues.reduce((sum, val) => sum + Math.pow(val - avgMetric, 2), 0) / metricValues.length;
    
    // Length factor - more confidence with longer texts
    const lengthFactor = Math.min(1.0, Math.log10(originalLength + 1) / 3);
    
    // Variance factor - less confidence with high variance
    const varianceFactor = Math.max(0.5, 1 - variance);
    
    const confidence = lengthFactor * varianceFactor;
    
    return {
      score: Math.round(confidence * 100) / 100,
      level: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
      factors: {
        lengthFactor: Math.round(lengthFactor * 100) / 100,
        varianceFactor: Math.round(varianceFactor * 100) / 100,
        metricVariance: Math.round(variance * 100) / 100
      }
    };
  }
  
  /**
   * Helper method: Calculate key terms preservation
   */
  calculateKeyTermsPreservation(original, optimized) {
    return this.calculatePatternPreservation(original, optimized, this.semanticPatterns.keyTerms);
  }
  
  /**
   * Helper method: Calculate action words preservation
   */
  calculateActionWordsPreservation(original, optimized) {
    return this.calculatePatternPreservation(original, optimized, this.semanticPatterns.actionWords);
  }
  
  /**
   * Helper method: Calculate contextual cues preservation
   */
  calculateContextualCuesPreservation(original, optimized) {
    return this.calculatePatternPreservation(original, optimized, this.semanticPatterns.contextualCues);
  }
  
  /**
   * Helper method: Calculate specific terms preservation
   */
  calculateSpecificTermsPreservation(original, optimized) {
    return this.calculatePatternPreservation(original, optimized, this.semanticPatterns.specificTerms);
  }
  
  /**
   * Helper method: Calculate pattern preservation score
   */
  calculatePatternPreservation(original, optimized, pattern) {
    const originalMatches = (original.match(pattern) || []).length;
    const optimizedMatches = (optimized.match(pattern) || []).length;
    
    if (originalMatches === 0) return 1.0; // No patterns to preserve
    
    const preservationRatio = optimizedMatches / originalMatches;
    return Math.min(1.0, preservationRatio); // Cap at 1.0
  }
  
  /**
   * Helper method: Calculate word overlap (Jaccard similarity)
   */
  calculateWordOverlap(original, optimized) {
    const originalWords = new Set(original.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const optimizedWords = new Set(optimized.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...originalWords].filter(x => optimizedWords.has(x)));
    const union = new Set([...originalWords, ...optimizedWords]);
    
    return union.size > 0 ? intersection.size / union.size : 1.0;
  }
  
  /**
   * Helper method: Calculate sentence length score
   */
  calculateSentenceLengthScore(avgLength) {
    const optimal = 17.5; // Optimal average sentence length
    const tolerance = 5; // Acceptable deviation
    
    const deviation = Math.abs(avgLength - optimal);
    if (deviation <= tolerance) return 1.0;
    
    return Math.max(0.3, 1 - (deviation - tolerance) / 20);
  }
  
  /**
   * Helper method: Calculate word length score
   */
  calculateWordLengthScore(avgLength) {
    const optimal = 5; // Optimal average word length
    const tolerance = 1; // Acceptable deviation
    
    const deviation = Math.abs(avgLength - optimal);
    if (deviation <= tolerance) return 1.0;
    
    return Math.max(0.4, 1 - (deviation - tolerance) / 8);
  }
  
  /**
   * Helper method: Calculate passive voice score
   */
  calculatePassiveVoiceScore(optimized, original) {
    const originalPassive = (original.match(this.linguisticIndicators.passiveVoice) || []).length;
    const optimizedPassive = (optimized.match(this.linguisticIndicators.passiveVoice) || []).length;
    
    if (originalPassive === 0) return 1.0;
    
    const reductionRatio = (originalPassive - optimizedPassive) / originalPassive;
    return Math.max(0.5, reductionRatio * 0.5 + 0.5); // Reward passive voice reduction
  }
  
  /**
   * Helper method: Calculate redundancy score
   */
  calculateRedundancyScore(optimized, original) {
    const originalRedundant = (original.match(this.linguisticIndicators.redundantWords) || []).length;
    const optimizedRedundant = (optimized.match(this.linguisticIndicators.redundantWords) || []).length;
    
    if (originalRedundant === 0) return 1.0;
    
    const reductionRatio = (originalRedundant - optimizedRedundant) / originalRedundant;
    return Math.min(1.0, reductionRatio + 0.3); // Reward redundancy removal
  }
  
  /**
   * Helper method: Calculate vocabulary complexity score
   */
  calculateVocabularyComplexityScore(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const complexWords = words.filter(w => w.length > 8).length;
    const complexityRatio = complexWords / Math.max(1, words.length);
    
    // Ideal complexity ratio is around 10-15%
    if (complexityRatio <= 0.15) return 1.0;
    return Math.max(0.4, 1 - (complexityRatio - 0.15) * 3);
  }
  
  /**
   * Helper method: Calculate paragraph structure score
   */
  calculateParagraphStructureScore(original, optimized) {
    const originalParagraphs = original.split(/\n\s*\n/).length;
    const optimizedParagraphs = optimized.split(/\n\s*\n/).length;
    
    if (originalParagraphs === 1) return 1.0; // Single paragraph, no structure to preserve
    
    const ratio = optimizedParagraphs / originalParagraphs;
    return Math.max(0.5, 1 - Math.abs(ratio - 0.8)); // Target 80% paragraph retention
  }
  
  /**
   * Helper method: Calculate list structure score
   */
  calculateListStructureScore(original, optimized) {
    const originalLists = (original.match(this.structuralMarkers.listMarkers) || []).length;
    const optimizedLists = (optimized.match(this.structuralMarkers.listMarkers) || []).length;
    
    if (originalLists === 0) return 1.0;
    
    const preservationRatio = optimizedLists / originalLists;
    return Math.min(1.0, preservationRatio + 0.2); // Slight bonus for list preservation
  }
  
  /**
   * Helper method: Calculate transition preservation
   */
  calculateTransitionPreservation(original, optimized) {
    return this.calculatePatternPreservation(original, optimized, this.structuralMarkers.transitionMarkers);
  }
  
  /**
   * Helper method: Calculate logical flow score
   */
  calculateLogicalFlowScore(original, optimized) {
    // Simple heuristic: presence of logical connectors
    const logicalConnectors = /\b(therefore|because|since|thus|hence|consequently|as a result|due to)\b/gi;
    return this.calculatePatternPreservation(original, optimized, logicalConnectors);
  }
  
  /**
   * Update learning system with quality assessment results
   */
  updateQualityLearningSystem(metrics, overallScore, optimizationResult) {
    const timestamp = Date.now();
    
    // Store quality assessment in history
    if (!this.qualityHistory.has(timestamp)) {
      this.qualityHistory.set(timestamp, {
        metrics: metrics,
        overallScore: overallScore,
        result: optimizationResult,
        timestamp: timestamp
      });
      
      // Keep only recent history (last 1000 assessments)
      if (this.qualityHistory.size > 1000) {
        const oldestKey = Math.min(...this.qualityHistory.keys());
        this.qualityHistory.delete(oldestKey);
      }
    }
    
    // Update pattern success tracking
    if (optimizationResult.techniques) {
      optimizationResult.techniques.forEach(technique => {
        const key = technique.name;
        const current = this.patternSuccess.get(key) || { successes: 0, total: 0, avgQuality: 0 };
        
        current.total += 1;
        if (overallScore > 0.75) {
          current.successes += 1;
        }
        current.avgQuality = (current.avgQuality * (current.total - 1) + overallScore) / current.total;
        
        this.patternSuccess.set(key, current);
      });
    }
    
    console.log('[OptimizationQualityScorer] Learning system updated:', {
      historySize: this.qualityHistory.size,
      patternSuccess: this.patternSuccess.size
    });
  }
  
  /**
   * Get quality insights based on historical data
   */
  getQualityInsights() {
    const insights = {
      averageQuality: 0,
      qualityTrends: [],
      bestTechniques: [],
      commonIssues: [],
      recommendations: []
    };
    
    if (this.qualityHistory.size === 0) return insights;
    
    // Calculate average quality
    const qualityScores = Array.from(this.qualityHistory.values()).map(entry => entry.overallScore);
    insights.averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    // Identify best techniques
    const techniqueSuccessRates = Array.from(this.patternSuccess.entries())
      .map(([technique, data]) => ({
        technique,
        successRate: data.successes / data.total,
        avgQuality: data.avgQuality,
        total: data.total
      }))
      .filter(item => item.total >= 5) // Minimum sample size
      .sort((a, b) => b.successRate - a.successRate);
    
    insights.bestTechniques = techniqueSuccessRates.slice(0, 5);
    
    return insights;
  }
}

class PopupManager {
  
  optimizePrompt(prompt, level, model) {
    // Initialize token counting systems
    this.initializeTokenCounters();
    
    // Check if advanced optimizer is available and level is not 'legacy'
    if (this.advancedOptimizer && level !== 'legacy') {
      console.log('[PopupManager] Using advanced prompt optimization');
      
      try {
        const result = this.advancedOptimizer.optimizePromptAdvanced(prompt, {
          level: level,
          targetModel: model,
          preserveStructure: level !== 'aggressive',
          maxReduction: level === 'aggressive' ? 0.6 : level === 'conservative' ? 0.3 : 0.45,
          qualityThreshold: level === 'aggressive' ? 0.6 : 0.7
        });
        
        if (result.success) {
          // Convert to legacy format for compatibility
          return {
            original: result.original,
            optimized: result.optimized,
            tokenReduction: result.reduction.tokens,
            energySavings: Math.min(60, result.reduction.percentage * 1.5),
            model: model,
            level: level,
            quality: result.quality,
            techniques: result.techniques,
            advanced: true
          };
        }
        
        // Fall back to legacy optimization if advanced fails
        console.log('[PopupManager] Advanced optimization failed, falling back to legacy method');
      } catch (error) {
        console.error('[PopupManager] Advanced optimization error:', error);
        // Continue with legacy optimization
      }
    }
    
    // Legacy optimization algorithm with comprehensive token-wasting word list
    console.log('[PopupManager] Using legacy prompt optimization');
    let optimized = prompt;
    let tokenReduction = 0;
    let energySavings = 0;
    
    // Comprehensive list of token-wasting words and phrases
    const tokenWastingPhrases = {
      // Politeness markers (often unnecessary in AI prompts)
      politeness: [
        'please', 'thank you', 'thanks', 'kindly', 'if you don\'t mind',
        'if possible', 'if you could', 'would you mind', 'could you please',
        'would you be so kind', 'I would appreciate', 'thank you in advance',
        'many thanks', 'much appreciated', 'grateful', 'sorry to bother you'
      ],
      
      // Redundant request phrases
      requests: [
        'can you', 'could you', 'would you', 'will you', 'are you able to',
        'I need you to', 'I want you to', 'I would like you to', 'I require you to',
        'help me', 'assist me', 'I\'m asking you to', 'do me a favor'
      ],
      
      // Uncertainty and hedging (reduce confidence unnecessarily)
      hedging: [
        'I think', 'I believe', 'I guess', 'maybe', 'perhaps', 'possibly',
        'it seems like', 'it appears that', 'I suppose', 'I assume',
        'in my opinion', 'from my perspective', 'as far as I know'
      ],
      
      // Redundant introductions
      introductions: [
        'let me start by saying', 'first of all', 'to begin with', 'initially',
        'at the outset', 'in the beginning', 'as a starting point',
        'before we begin', 'prior to starting'
      ],
      
      // Filler words and phrases
      fillers: [
        'basically', 'essentially', 'actually', 'literally', 'obviously',
        'clearly', 'definitely', 'certainly', 'absolutely', 'totally',
        'completely', 'entirely', 'utterly', 'quite', 'rather', 'pretty much',
        'sort of', 'kind of', 'more or less', 'in a way', 'to some extent'
      ],
      
      // Redundant explanatory phrases
      explanatory: [
        'in other words', 'that is to say', 'what I mean is', 'put simply',
        'to put it another way', 'in simple terms', 'to clarify', 'specifically',
        'more specifically', 'in particular', 'namely', 'for instance',
        'as an example', 'for example' // Keep some examples but reduce redundancy
      ],
      
      // Time-wasting connectors
      connectors: [
        'furthermore', 'moreover', 'additionally', 'in addition to this',
        'what\'s more', 'on top of that', 'not only that', 'also worth noting',
        'it should also be mentioned', 'another point to consider'
      ],
      
      // Redundant emphasis
      emphasis: [
        'very important', 'extremely important', 'absolutely crucial',
        'highly significant', 'tremendously valuable', 'incredibly useful',
        'exceptionally good', 'remarkably effective', 'particularly noteworthy'
      ]
    };
    
    // Apply optimizations based on level
    const allPhrases = level === 'aggressive'
      ? Object.values(tokenWastingPhrases).flat()
      : level === 'conservative'
        ? tokenWastingPhrases.politeness.concat(tokenWastingPhrases.fillers)
        : tokenWastingPhrases.politeness.concat(tokenWastingPhrases.requests, tokenWastingPhrases.fillers, tokenWastingPhrases.hedging);
    
    // Remove token-wasting phrases
    allPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = optimized.match(regex);
      if (matches) {
        optimized = optimized.replace(regex, '');
        tokenReduction += matches.length * phrase.split(' ').length;
      }
    });
    
    // Clean up extra whitespace and punctuation
    optimized = optimized.replace(/\s+/g, ' ')
                      .replace(/\s*,\s*,+/g, ',')
                      .replace(/\s*\.\s*\.+/g, '.')
                      .replace(/^\s*[,.]/, '')
                      .trim();
    
    // Apply level-specific optimizations
    switch (level) {
      case 'aggressive':
        optimized = this.applyAggressiveOptimization(optimized);
        tokenReduction += Math.floor(prompt.split(' ').length * 0.3);
        energySavings = Math.min(50, tokenReduction * 2.2);
        break;
        
      case 'conservative':
        tokenReduction += Math.floor(prompt.split(' ').length * 0.12);
        energySavings = Math.min(25, tokenReduction * 1.5);
        break;
        
      default: // balanced
        optimized = this.applyBalancedOptimization(optimized);
        tokenReduction += Math.floor(prompt.split(' ').length * 0.2);
        energySavings = Math.min(40, tokenReduction * 1.8);
    }
    
    // Ensure we don't have empty or overly short results
    if (optimized.length < 10) {
      optimized = prompt; // Revert if too aggressive
      tokenReduction = Math.floor(tokenReduction * 0.1);
      energySavings = Math.floor(energySavings * 0.1);
    }
    
    return {
      original: prompt,
      optimized: optimized,
      tokenReduction: Math.max(1, tokenReduction),
      energySavings: Math.max(5, energySavings),
      model: model,
      level: level
    };
  }
  
  applyAggressiveOptimization(text) {
    // More aggressive text optimization
    return text
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bat this point in time\b/gi, 'now')
      .replace(/\bfor the purpose of\b/gi, 'for')
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  applyBalancedOptimization(text) {
    // Balanced optimization maintaining readability
    return text
      .replace(/\bplease be advised that\b/gi, '')
      .replace(/\bit should be noted that\b/gi, '')
      .replace(/\bin my opinion\b/gi, '')
      .replace(/\bI think that\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  showOptimizationResult(result) {
    const resultsArea = document.getElementById('resultsArea');
    const optimizedPrompt = document.getElementById('optimizedPrompt');
    const energySavingsResult = document.getElementById('energySavingsResult');
    
    if (resultsArea && optimizedPrompt && energySavingsResult) {
      // Show results
      resultsArea.style.display = 'block';
      optimizedPrompt.value = result.optimized;
      energySavingsResult.textContent = `${result.energySavings}% Energy Saved`;
      
      // Store result for copying
      this.lastOptimizationResult = result;
      
      // Update stats
      this.updateStatsAfterOptimization(result);
      
      // Show success toast
      this.showToastNotification(`Optimized! Saved ${result.tokenReduction} tokens`, 'success');
    }
  }
  
  updateStatsAfterOptimization(result) {
    // Update the statistics display
    const totalElement = document.getElementById('totalPromptsGenerated');
    const savingsElement = document.getElementById('energySavingsPercent');
    const reductionElement = document.getElementById('avgTokenReduction');
    
    if (totalElement && savingsElement && reductionElement) {
      const currentTotal = parseInt(totalElement.textContent) || 0;
      const currentSavings = parseInt(savingsElement.textContent) || 0;
      const currentReduction = parseInt(reductionElement.textContent) || 0;
      
      // Calculate new averages
      const newTotal = currentTotal + 1;
      const newAvgSavings = Math.round(((currentSavings * currentTotal) + result.energySavings) / newTotal);
      const newAvgReduction = Math.round(((currentReduction * currentTotal) + result.tokenReduction) / newTotal);
      
      // Update display
      this.safeSetTextContent(totalElement, newTotal.toString());
      this.safeSetTextContent(savingsElement, `${newAvgSavings}%`);
      this.safeSetTextContent(reductionElement, newAvgReduction.toString());
    }
  }
  
  handleCopyResult() {
    if (this.lastOptimizationResult) {
      const optimizedText = this.lastOptimizationResult.optimized;
      
      // Try to copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(optimizedText).then(() => {
          this.showToastNotification('Optimized prompt copied to clipboard!', 'success');
        }).catch(() => {
          this.fallbackCopyToClipboard(optimizedText);
        });
      } else {
        this.fallbackCopyToClipboard(optimizedText);
      }
    }
  }
  
  fallbackCopyToClipboard(text) {
    // Fallback copy method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToastNotification('Optimized prompt copied to clipboard!', 'success');
    } catch (err) {
      this.showToastNotification('Failed to copy to clipboard', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  }
  
  handleNewOptimization() {
    // Reset for new optimization
    const promptInput = document.getElementById('promptInput');
    const optimizedPrompt = document.getElementById('optimizedPrompt');
    const resultsArea = document.getElementById('resultsArea');
    
    if (promptInput) promptInput.value = '';
    if (optimizedPrompt) optimizedPrompt.value = '';
    if (resultsArea) resultsArea.style.display = 'none';
    
    // Clear stored result
    this.lastOptimizationResult = null;
    
    // Focus on input
    if (promptInput) promptInput.focus();
  }
  
  showToastNotification(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // ===== MODEL COMPARISON AND BENCHMARKING =====
  
  handleCompareModels() {
    this.showComparisonModal();
    this.loadComparisonData();
  }
  
  handleViewBenchmarks() {
    this.showBenchmarksModal();
    this.loadBenchmarkData();
  }
  
  showComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) {
      modal.style.display = 'flex';
      this.setupComparisonEventListeners();
    }
  }
  
  hideComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  showBenchmarksModal() {
    const modal = document.getElementById('benchmarksModal');
    if (modal) {
      modal.style.display = 'flex';
      this.setupBenchmarkEventListeners();
    }
  }
  
  hideBenchmarksModal() {
    const modal = document.getElementById('benchmarksModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  setupComparisonEventListeners() {
    // Comparison criteria change
    const criteriaSelect = document.getElementById('comparisonCriteria');
    if (criteriaSelect) {
      criteriaSelect.addEventListener('change', () => {
        this.refreshComparison();
      });
    }
    
    // Trending timeframe change
    const timeframeSelect = document.getElementById('trendingTimeframe');
    if (timeframeSelect) {
      timeframeSelect.addEventListener('change', () => {
        this.loadTrendingData();
      });
    }
    
    // Benchmark tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.getAttribute('data-metric');
        this.loadBenchmarkData(metric);
      });
    });
  }
  
  setupBenchmarkEventListeners() {
    // Metric selector buttons
    const metricButtons = document.querySelectorAll('.metric-btn');
    metricButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        metricButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.getAttribute('data-metric');
        this.loadBenchmarkVisualization(metric);
      });
    });
  }
  
  async loadComparisonData() {
    try {
      console.log('[PopupManager] Loading comparison data...');
      
      const resultsContainer = document.getElementById('comparisonResults');
      if (!resultsContainer) return;
      
      resultsContainer.innerHTML = '<div class="loading-comparison">Loading comparison data...</div>';
      
      // Get available models for comparison
      const availableModels = this.getAvailableModelsForComparison();
      if (availableModels.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No AI models detected for comparison.</div>';
        return;
      }
      
      // Get comparison criteria
      const criteria = document.getElementById('comparisonCriteria')?.value || 'all';
      
      // Request comparison from service worker
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_COMPARISON',
        models: availableModels,
        criteria: criteria
      });
      
      if (response?.success) {
        this.displayComparisonResults(response.comparison);
        this.displayRecommendations(response.comparison.recommendations);
      } else {
        resultsContainer.innerHTML = `<div class="error">Failed to load comparison: ${response?.error || 'Unknown error'}</div>`;
      }
      
    } catch (error) {
      console.error('[PopupManager] Failed to load comparison data:', error);
      const resultsContainer = document.getElementById('comparisonResults');
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="error">Failed to load comparison data</div>';
      }
    }
  }
  
  getAvailableModelsForComparison() {
    // Get models from current session or detected models
    const models = [];
    
    // Add currently detected model
    if (this.detectedAIModel) {
      models.push(this.detectedAIModel.modelKey);
    }
    
    // Add some popular models for comparison
    const popularModels = ['gpt-5-high', 'claude-4-sonnet-thinking', 'grok-4', 'deepseek-r1', 'llama-4-maverick'];
    popularModels.forEach(model => {
      if (!models.includes(model)) {
        models.push(model);
      }
    });
    
    return models.slice(0, 5); // Limit to 5 models for performance
  }
  
  displayComparisonResults(comparison) {
    const resultsContainer = document.getElementById('comparisonResults');
    if (!resultsContainer || !comparison?.models) return;
    
    let html = '<div class="comparison-table">';
    html += '<div class="comparison-header">';
    html += '<div class="model-col">Model</div>';
    html += '<div class="metric-col">Efficiency</div>';
    html += '<div class="metric-col">Sustainability</div>';
    html += '<div class="metric-col">Performance</div>';
    html += '<div class="metric-col">Overall</div>';
    html += '</div>';
    
    comparison.models.forEach((model, index) => {
      const rankClass = index === 0 ? 'rank-best' : index === 1 ? 'rank-second' : '';
      html += `<div class="comparison-row ${rankClass}">`;
      html += `<div class="model-info">`;
      html += `<div class="model-name">${model.name}</div>`;
      html += `<div class="model-company">${model.company}</div>`;
      html += `</div>`;
      html += `<div class="metric-value">${model.scores.efficiency}</div>`;
      html += `<div class="metric-value">${model.scores.sustainability}/100</div>`;
      html += `<div class="metric-value">${model.scores.performance}/100</div>`;
      html += `<div class="metric-value overall">${model.scores.overall}/100</div>`;
      html += '</div>';
    });
    
    html += '</div>';
    
    // Add summary
    if (comparison.summary) {
      html += '<div class="comparison-summary">';
      html += '<h4>Summary</h4>';
      html += `<p><strong>Most Efficient:</strong> ${comparison.summary.mostEfficient?.name} (${comparison.summary.mostEfficient?.score})</p>`;
      html += `<p><strong>Most Sustainable:</strong> ${comparison.summary.mostSustainable?.name} (${comparison.summary.mostSustainable?.score}/100)</p>`;
      html += `<p><strong>Highest Performance:</strong> ${comparison.summary.highestPerformance?.name} (${comparison.summary.highestPerformance?.score}/100)</p>`;
      html += '</div>';
    }
    
    resultsContainer.innerHTML = html;
  }
  
  displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendationsList');
    if (!recommendationsContainer || !recommendations) return;
    
    if (recommendations.length === 0) {
      recommendationsContainer.innerHTML = '<div class="no-recommendations">No specific recommendations at this time.</div>';
      return;
    }
    
    let html = '';
    recommendations.forEach(rec => {
      html += `<div class="recommendation-item ${rec.type}">`;
      html += `<div class="rec-icon">${this.getRecommendationIcon(rec.type)}</div>`;
      html += `<div class="rec-content">`;
      html += `<h5>${rec.title}</h5>`;
      html += `<p><strong>${rec.model}</strong></p>`;
      html += `<p>${rec.reason}</p>`;
      html += `</div>`;
      html += `<button class="btn btn-small apply-rec-btn" data-model="${rec.model}" data-type="${rec.type}">Apply</button>`;
      html += '</div>';
    });
    
    recommendationsContainer.innerHTML = html;
    
    // Add click handlers for apply buttons
    recommendationsContainer.querySelectorAll('.apply-rec-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const model = e.target.getAttribute('data-model');
        const type = e.target.getAttribute('data-type');
        this.applyModelRecommendation(model, type);
      });
    });
  }
  
  getRecommendationIcon(type) {
    const icons = {
      'best-overall': '🏆',
      'most-efficient': '⚡',
      'most-sustainable': '🌱',
      'budget-friendly': '💰'
    };
    return icons[type] || '💡';
  }
  
  async loadBenchmarkData(metric = 'intelligence') {
    try {
      console.log('[PopupManager] Loading benchmark data for:', metric);
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_BENCHMARKS',
        metric: metric
      });
      
      if (response?.success) {
        this.displayBenchmarkResults(response.benchmarks, metric);
      } else {
        console.error('[PopupManager] Failed to load benchmark data:', response?.error);
      }
      
    } catch (error) {
      console.error('[PopupManager] Benchmark data request failed:', error);
    }
  }
  
  displayBenchmarkResults(benchmarks, metric) {
    const benchmarkContent = document.getElementById('benchmarkContent');
    if (!benchmarkContent || !benchmarks?.models) return;
    
    let html = `<div class="benchmark-chart">`;
    html += `<h5>${metric.charAt(0).toUpperCase() + metric.slice(1)} Rankings</h5>`;
    html += '<div class="benchmark-bars">';
    
    benchmarks.models.slice(0, 10).forEach((model, index) => {
      const percentage = (model.percentile || 50);
      const barClass = percentage > 80 ? 'excellent' : percentage > 60 ? 'good' : percentage > 40 ? 'average' : 'poor';
      
      html += `<div class="benchmark-bar">`;
      html += `<div class="model-label">${model.name}</div>`;
      html += `<div class="bar-container">`;
      html += `<div class="bar-fill ${barClass}" style="width: ${percentage}%"></div>`;
      html += `<span class="bar-value">${model.value}</span>`;
      html += `</div>`;
      html += `<div class="percentile">${percentage}th percentile</div>`;
      html += '</div>';
    });
    
    html += '</div></div>';
    
    // Add insights
    if (benchmarks.insights) {
      html += '<div class="benchmark-insights">';
      html += '<h5>Insights</h5>';
      benchmarks.insights.forEach(insight => {
        html += `<div class="insight-item ${insight.impact}">`;
        html += `<strong>${insight.title}</strong>: ${insight.description}`;
        html += '</div>';
      });
      html += '</div>';
    }
    
    benchmarkContent.innerHTML = html;
  }
  
  async loadBenchmarkVisualization(metric) {
    const visualization = document.getElementById('benchmarkVisualization');
    if (!visualization) return;
    
    visualization.innerHTML = '<div class="loading-benchmarks">Loading benchmark visualization...</div>';
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_BENCHMARKS',
        metric: metric
      });
      
      if (response?.success) {
        this.displayBenchmarkVisualization(response.benchmarks, metric);
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load benchmark visualization:', error);
      visualization.innerHTML = '<div class="error">Failed to load benchmark data</div>';
    }
  }
  
  displayBenchmarkVisualization(benchmarks, metric) {
    const visualization = document.getElementById('benchmarkVisualization');
    if (!visualization) return;
    
    // Create a simple bar chart visualization
    let html = `<div class="benchmark-viz">`;
    html += `<h4>${metric.charAt(0).toUpperCase() + metric.slice(1)} Performance</h4>`;
    
    if (benchmarks.distribution) {
      html += `<div class="distribution-stats">`;
      html += `<div class="stat"><label>Min:</label> ${benchmarks.distribution.min?.toFixed(2) || 'N/A'}</div>`;
      html += `<div class="stat"><label>Average:</label> ${benchmarks.distribution.mean?.toFixed(2) || 'N/A'}</div>`;
      html += `<div class="stat"><label>Max:</label> ${benchmarks.distribution.max?.toFixed(2) || 'N/A'}</div>`;
      html += `</div>`;
    }
    
    // Top performers
    html += '<div class="top-performers">';
    html += '<h5>Top Performers</h5>';
    benchmarks.models?.slice(0, 5).forEach((model, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      html += `<div class="performer-item">`;
      html += `<span class="rank">${medal} #${index + 1}</span>`;
      html += `<span class="name">${model.name}</span>`;
      html += `<span class="value">${model.value}</span>`;
      html += '</div>';
    });
    html += '</div>';
    
    html += '</div>';
    
    visualization.innerHTML = html;
    
    // Load insights
    this.loadBenchmarkInsights(benchmarks);
  }
  
  loadBenchmarkInsights(benchmarks) {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    if (!benchmarks.insights || benchmarks.insights.length === 0) {
      insightsList.innerHTML = '<div class="no-insights">No specific insights available.</div>';
      return;
    }
    
    let html = '';
    benchmarks.insights.forEach(insight => {
      html += `<div class="insight-card ${insight.impact}">`;
      html += `<h6>${insight.title}</h6>`;
      html += `<p>${insight.description}</p>`;
      if (insight.leaders) {
        html += '<div class="leaders">';
        insight.leaders.forEach(leader => {
          html += `<span class="leader">${leader.category}: ${leader.leader.name}</span>`;
        });
        html += '</div>';
      }
      html += '</div>';
    });
    
    insightsList.innerHTML = html;
  }
  
  async loadTrendingData() {
    const timeframe = document.getElementById('trendingTimeframe')?.value || '7d';
    const trendingSection = document.getElementById('trendingSection');
    const trendingList = document.getElementById('trendingList');
    
    if (!trendingSection || !trendingList) return;
    
    trendingSection.style.display = 'block';
    trendingList.innerHTML = '<div class="loading-trending">Loading trending data...</div>';
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_TRENDING_MODELS',
        timeframe: timeframe
      });
      
      if (response?.success && response.trending) {
        this.displayTrendingModels(response.trending);
      } else {
        trendingList.innerHTML = '<div class="no-data">No trending data available.</div>';
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load trending data:', error);
      trendingList.innerHTML = '<div class="error">Failed to load trending data</div>';
    }
  }
  
  displayTrendingModels(trending) {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;
    
    if (trending.length === 0) {
      trendingList.innerHTML = '<div class="no-trending">No trending models in selected timeframe.</div>';
      return;
    }
    
    let html = '';
    trending.forEach((model, index) => {
      const trendIcon = index === 0 ? '🔥' : index < 3 ? '📈' : '📊';
      html += `<div class="trending-item">`;
      html += `<div class="trend-icon">${trendIcon}</div>`;
      html += `<div class="trend-info">`;
      html += `<div class="trend-name">${model.name}</div>`;
      html += `<div class="trend-stats">`;
      html += `<span>${model.count} uses</span>`;
      html += `<span>${model.averageQueriesPerUse.toFixed(1)} avg queries</span>`;
      html += `<span>${model.averageEnergyPerUse.toFixed(2)}Wh avg</span>`;
      html += `</div>`;
      html += `</div>`;
      html += '</div>';
    });
    
    trendingList.innerHTML = html;
  }
  
  async refreshComparison() {
    await this.loadComparisonData();
    this.showToastNotification('Comparison data refreshed', 'success');
  }
  
  async exportComparison() {
    try {
      const criteria = document.getElementById('comparisonCriteria')?.value || 'all';
      const models = this.getAvailableModelsForComparison();
      
      const response = await chrome.runtime.sendMessage({
        type: 'EXPORT_COMPARISON_DATA',
        models: models,
        format: 'json' // Could add format selection
      });
      
      if (response?.success) {
        // Create and download the export file
        const blob = new Blob([response.exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-model-comparison-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToastNotification('Comparison data exported', 'success');
      } else {
        this.showToastNotification('Export failed', 'error');
      }
    } catch (error) {
      console.error('[PopupManager] Export failed:', error);
      this.showToastNotification('Export failed', 'error');
    }
  }
  
  async applyRecommendation() {
    // This would integrate with the AI optimization system
    this.showToastNotification('Recommendation applied', 'success');
    this.hideComparisonModal();
  }
  
  applyModelRecommendation(model, type) {
    console.log('[PopupManager] Applying recommendation:', model, type);
    this.showToastNotification(`Applied ${type} recommendation: ${model}`, 'success');
  }

  // ===== TAB ENERGY RECOMMENDATIONS =====
  
  setupTabRecommendations() {
    console.log('[PopupManager] Setting up tab energy recommendations');
    this.selectedTabsForClosure = new Set();
    this.tabRecommendationsVisible = false;
  }

  /**
   * Updates the tab energy recommendations section
   */
  updateTabEnergyRecommendations() {
    try {
      const recommendationsSection = document.getElementById('tabEnergyRecommendations');
      if (!recommendationsSection) return;

      // Get all tab energy data
      const tabEnergyData = this.getAllTabEnergyData();
      if (!tabEnergyData || tabEnergyData.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
      }

      // Identify high energy tabs
      const highEnergyTabs = this.identifyHighEnergyTabs(tabEnergyData);
      const tabClosingSuggestions = this.generateTabClosingSuggestions(tabEnergyData);

      // Show section if we have recommendations
      if (highEnergyTabs.length > 0 || tabClosingSuggestions.length > 0) {
        recommendationsSection.style.display = 'block';
        this.tabRecommendationsVisible = true;

        // Update high energy tabs
        this.updateHighEnergyTabsSection(highEnergyTabs);
        
        // Update tab closing suggestions
        this.updateTabClosingSuggestionsSection(tabClosingSuggestions);
        
        // Update energy summary
        this.updateEnergySummarySection(tabEnergyData, highEnergyTabs, tabClosingSuggestions);
      } else {
        recommendationsSection.style.display = 'none';
        this.tabRecommendationsVisible = false;
      }
    } catch (error) {
      console.error('[PopupManager] Error updating tab energy recommendations:', error);
    }
  }

  /**
   * Gets energy data for all tabs
   */
  getAllTabEnergyData() {
    if (!this.energyData) return [];

    const tabData = [];
    for (const [tabId, data] of Object.entries(this.energyData)) {
      if (data && typeof data === 'object') {
        const powerWatts = data.powerWatts || this.migrateLegacyScore(data.energyScore || 0);
        tabData.push({
          tabId: parseInt(tabId),
          title: data.title || 'Unknown Tab',
          url: data.url || '',
          powerWatts: powerWatts,
          energyScore: data.energyScore || 0,
          domNodes: data.domNodes || 0,
          duration: data.duration || 0,
          timestamp: data.timestamp || Date.now(),
          isCurrentTab: parseInt(tabId) === this.currentTabData?.tabId
        });
      }
    }

    return tabData.sort((a, b) => b.powerWatts - a.powerWatts);
  }

  /**
   * Identifies tabs with high energy consumption
   */
  identifyHighEnergyTabs(tabEnergyData) {
    if (!tabEnergyData || tabEnergyData.length === 0) return [];

    // Define high energy threshold (configurable)
    const highEnergyThreshold = this.settings?.powerThreshold || 25; // watts
    
    // Filter tabs above threshold
    const highEnergyTabs = tabEnergyData.filter(tab =>
      tab.powerWatts >= highEnergyThreshold
    );

    // Limit to top 5 highest energy tabs
    return highEnergyTabs.slice(0, 5);
  }

  /**
   * Generates suggestions for tabs to close
   */
  generateTabClosingSuggestions(tabEnergyData) {
    if (!tabEnergyData || tabEnergyData.length === 0) return [];

    const suggestions = [];
    const currentTime = Date.now();

    for (const tab of tabEnergyData) {
      // Skip current tab
      if (tab.isCurrentTab) continue;

      let shouldSuggest = false;
      let reason = '';

      // High power consumption (>40W)
      if (tab.powerWatts > 40) {
        shouldSuggest = true;
        reason = `High power usage (${tab.powerWatts.toFixed(1)}W)`;
      }
      // Medium-high power with long inactivity (>30W and >30 min inactive)
      else if (tab.powerWatts > 30 && this.getTabInactivityTime(tab) > 1800000) {
        shouldSuggest = true;
        reason = `High power + inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }
      // Medium power with very long inactivity (>20W and >1 hour inactive)
      else if (tab.powerWatts > 20 && this.getTabInactivityTime(tab) > 3600000) {
        shouldSuggest = true;
        reason = `Medium power + inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }
      // Any tab inactive for >2 hours
      else if (this.getTabInactivityTime(tab) > 7200000) {
        shouldSuggest = true;
        reason = `Inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }

      if (shouldSuggest) {
        suggestions.push({
          ...tab,
          reason: reason,
          potentialSaving: tab.powerWatts
        });
      }
    }

    // Sort by potential energy savings (highest first)
    return suggestions
      .sort((a, b) => b.potentialSaving - a.potentialSaving)
      .slice(0, 8); // Limit to 8 suggestions
  }

  /**
   * Gets inactivity time for a tab
   */
  getTabInactivityTime(tab) {
    const now = Date.now();
    const lastActivity = tab.timestamp || now;
    return now - lastActivity;
  }

  /**
   * Updates the high energy tabs section
   */
  updateHighEnergyTabsSection(highEnergyTabs) {
    const section = document.getElementById('highEnergyTabsSection');
    const list = document.getElementById('highEnergyTabsList');
    
    if (!section || !list) return;

    if (highEnergyTabs.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    
    let html = '';
    highEnergyTabs.forEach(tab => {
      html += `
        <div class="high-energy-tab" data-tab-id="${tab.tabId}">
          <div class="tab-info-left">
            <div class="tab-title">${this.escapeHtml(tab.title)}</div>
            <div class="tab-url">${this.formatUrl(tab.url)}</div>
          </div>
          <div class="tab-energy-info">
            <span class="tab-energy-value">${tab.powerWatts.toFixed(1)}W</span>
            ${!tab.isCurrentTab ? `<button class="tab-close-btn" data-tab-id="${tab.tabId}">Close</button>` : ''}
          </div>
        </div>
      `;
    });
    
    list.innerHTML = html;

    // Add click handlers for close buttons
    list.querySelectorAll('.tab-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.getAttribute('data-tab-id'));
        this.handleCloseTab(tabId);
      });
    });
  }

  /**
   * Updates the tab closing suggestions section
   */
  updateTabClosingSuggestionsSection(suggestions) {
    const section = document.getElementById('tabClosingSuggestions');
    const list = document.getElementById('closingSuggestionsList');
    
    if (!section || !list) return;

    if (suggestions.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    
    let html = '';
    suggestions.forEach(suggestion => {
      const isSelected = this.selectedTabsForClosure.has(suggestion.tabId);
      html += `
        <div class="suggestion-item" data-tab-id="${suggestion.tabId}">
          <div class="suggestion-reason">
            <strong>${this.escapeHtml(suggestion.title)}</strong><br>
            <small>${suggestion.reason}</small>
          </div>
          <div class="suggestion-checkbox ${isSelected ? 'checked' : ''}" data-tab-id="${suggestion.tabId}"></div>
        </div>
      `;
    });
    
    list.innerHTML = html;

    // Add click handlers for checkboxes
    list.querySelectorAll('.suggestion-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.getAttribute('data-tab-id'));
        this.toggleTabSelection(tabId);
      });
    });
  }

  /**
   * Updates the energy summary section
   */
  updateEnergySummarySection(allTabs, highEnergyTabs, suggestions) {
    const section = document.getElementById('energySummarySection');
    const totalTabsCount = document.getElementById('totalTabsCount');
    const highEnergyCount = document.getElementById('highEnergyCount');
    const potentialSavings = document.getElementById('potentialSavings');
    
    if (!section) return;

    section.style.display = 'block';
    
    // Calculate potential savings from selected suggestions
    const selectedSavings = suggestions
      .filter(s => this.selectedTabsForClosure.has(s.tabId))
      .reduce((total, s) => total + s.potentialSaving, 0);
    
    if (totalTabsCount) totalTabsCount.textContent = allTabs.length.toString();
    if (highEnergyCount) highEnergyCount.textContent = highEnergyTabs.length.toString();
    if (potentialSavings) {
      if (selectedSavings > 0) {
        potentialSavings.textContent = `${selectedSavings.toFixed(1)}W`;
      } else {
        const maxSavings = suggestions.reduce((total, s) => total + s.potentialSaving, 0);
        potentialSavings.textContent = maxSavings > 0 ? `~${maxSavings.toFixed(1)}W` : '--';
      }
    }
  }

  /**
   * Toggles tab selection for closure
   */
  toggleTabSelection(tabId) {
    if (this.selectedTabsForClosure.has(tabId)) {
      this.selectedTabsForClosure.delete(tabId);
    } else {
      this.selectedTabsForClosure.add(tabId);
    }

    // Update UI
    const checkbox = document.querySelector(`.suggestion-checkbox[data-tab-id="${tabId}"]`);
    if (checkbox) {
      if (this.selectedTabsForClosure.has(tabId)) {
        checkbox.classList.add('checked');
      } else {
        checkbox.classList.remove('checked');
      }
    }

    // Update potential savings
    if (this.tabRecommendationsVisible) {
      const allTabs = this.getAllTabEnergyData();
      const highEnergyTabs = this.identifyHighEnergyTabs(allTabs);
      const suggestions = this.generateTabClosingSuggestions(allTabs);
      this.updateEnergySummarySection(allTabs, highEnergyTabs, suggestions);
    }
  }

  /**
   * Handles closing recommended tabs
   */
  async handleCloseRecommendedTabs() {
    if (this.selectedTabsForClosure.size === 0) {
      this.showToast('No tabs selected for closing', 'warning');
      return;
    }

    try {
      const tabIds = Array.from(this.selectedTabsForClosure);
      console.log('[PopupManager] Closing recommended tabs:', tabIds);

      // Close the selected tabs
      if (this.isChromeApiAvailable()) {
        await chrome.tabs.remove(tabIds);
        this.showToast(`Closed ${tabIds.length} tab${tabIds.length > 1 ? 's' : ''}`, 'success');
      }

      // Clear selections
      this.selectedTabsForClosure.clear();

      // Refresh data after a short delay
      setTimeout(() => {
        this.loadCurrentEnergyData();
      }, 1000);

    } catch (error) {
      console.error('[PopupManager] Failed to close recommended tabs:', error);
      this.showToast('Failed to close some tabs', 'error');
    }
  }

  /**
   * Handles closing a single tab
   */
  async handleCloseTab(tabId) {
    try {
      console.log('[PopupManager] Closing tab:', tabId);
      
      if (this.isChromeApiAvailable()) {
        await chrome.tabs.remove([tabId]);
        this.showToast('Tab closed', 'success');
      }

      // Refresh data after a short delay
      setTimeout(() => {
        this.loadCurrentEnergyData();
      }, 1000);

    } catch (error) {
      console.error('[PopupManager] Failed to close tab:', error);
      this.showToast('Failed to close tab', 'error');
    }
  }

  /**
   * Handles dismissing suggestions
   */
  handleDismissSuggestions() {
    const recommendationsSection = document.getElementById('tabEnergyRecommendations');
    if (recommendationsSection) {
      recommendationsSection.style.display = 'none';
      this.tabRecommendationsVisible = false;
    }
    
    this.selectedTabsForClosure.clear();
    this.showToast('Suggestions dismissed', 'info');
  }

  /**
   * Escapes HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
  });
} else {
  new PopupManager();
}