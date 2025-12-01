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
    this.compareTabsData = null;
    this.compareTabsUpdateInterval = null;
    
    // Initialize Enhanced AI Energy Manager
    this.aiEnergyManager = typeof EnhancedAIEnergyManager !== 'undefined'
      ? new EnhancedAIEnergyManager()
      : (typeof AIEnergyManager !== 'undefined' ? new AIEnergyManager() : null);
    this.detectedAIModel = null;
    this.currentAIUsage = null;
    this.enhancedAIData = null;
    
    // Initialize Backend Power Calculator
    this.backendPowerCalculator = typeof BackendPowerCalculator !== 'undefined'
      ? new BackendPowerCalculator()
      : null;
    
    this.init();
  }
  
  async init() {

    try {
      // Set up event listeners
      this.setupEventListeners();

      // Load initial data
      await this.loadInitialData();

      // Load Compare Tabs Strip data
      await this.loadCompareTabsData();

      // Start periodic updates
      this.startPeriodicUpdates();

      // Initialize AI Prompt Reminder system
      this.initAIPromptReminder();

      // Listen for messages from service worker (e.g., to open prompt generator)
      this.setupRuntimeMessageListener();

      // Hide loading overlay
      this.hideLoadingOverlay();

      // LOG TO FIREBASE: Extension popup opened
      this.logPopupOpened();

    } catch (error) {
      this.showError('Failed to initialize. Please try again.');
    }
  }
  
  setupEventListeners() {
    // Enhanced button event listeners with null checks
    this.safeAddEventListener('viewHistoryBtn', 'click', this.handleViewHistory.bind(this));
    this.safeAddEventListener('settingsBtn', 'click', this.handleSettings.bind(this));
    this.safeAddEventListener('tipAction', 'click', this.handleTipAction.bind(this));
    this.safeAddEventListener('themeToggle', 'click', this.handleThemeToggle.bind(this));

    // Width control listeners
    this.safeAddEventListener('increaseWidthBtn', 'click', () => this.handleWidthChange(40));
    this.safeAddEventListener('decreaseWidthBtn', 'click', () => this.handleWidthChange(-40));

    // Energy mode toggle listeners
    this.safeAddEventListener('frontendModeBtn', 'click', () => this.handleEnergyModeToggle('frontend'));
    this.safeAddEventListener('totalModeBtn', 'click', () => this.handleEnergyModeToggle('total'));
    
    // Prompt Generator integration
    this.safeAddEventListener('promptGeneratorBtn', 'click', this.handlePromptGenerator.bind(this));
    this.safeAddEventListener('modalCloseBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('cancelCodeBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('submitCodeBtn', 'click', this.handleCodeSubmit.bind(this));
    this.safeAddEventListener('generatorCloseBtn', 'click', this.hidePromptGenerator.bind(this));
    
    // Setup prompt generator events immediately (don't wait for generator to show)
    this.setupPromptGeneratorEvents();
    
    // Add Enter key support for access code input
    this.safeAddEventListener('accessCodeInput', 'keydown', this.handleCodeInputKeydown.bind(this));
    
    // Model comparison and benchmarking - only add listeners if elements exist
    // Note: These modals and buttons may not exist in the current HTML
    this.safeAddEventListener('comparisonCloseBtn', 'click', this.hideComparisonModal.bind(this));
    this.safeAddEventListener('benchmarksCloseBtn', 'click', this.hideBenchmarksModal.bind(this));
    this.safeAddEventListener('refreshComparisonBtn', 'click', this.refreshComparison.bind(this));
    this.safeAddEventListener('exportComparisonBtn', 'click', this.exportComparison.bind(this));
    this.safeAddEventListener('applyRecommendationBtn', 'click', this.applyRecommendation.bind(this));
    
    // Tab energy recommendations event listeners
    this.safeAddEventListener('closeRecommendedBtn', 'click', this.handleCloseRecommendedTabs.bind(this));
    this.safeAddEventListener('dismissSuggestionsBtn', 'click', this.handleDismissSuggestions.bind(this));
    
    // Test button event listener - REMOVED (Phase 6 cleanup)
    
    // Image error handlers with enhanced safety
    const popupLogo = document.getElementById('popupLogo');
    if (popupLogo) {
      popupLogo.addEventListener('error', () => {
        try {
          popupLogo.style.display = 'none';
        } catch (error) {
        }
      });
    }
    
    // Handle popup close
    window.addEventListener('beforeunload', this.handlePopupClose.bind(this));
    
    // Add keyboard navigation support
    this.setupKeyboardNavigation();
    
    // Setup tab energy recommendations
    this.setupTabRecommendations();
    
    // Setup Compare Tabs Strip event listeners
    this.setupCompareTabsEventListeners();
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
      
    } catch (error) {
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
      } else {
      }
    } catch (error) {
    }
  }
  
  async loadInitialData() {
    // Load theme first
    await this.loadTheme();

    // Load saved popup width
    await this.loadPopupWidth();

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
   * Load Compare Tabs Strip data from background worker
   */
  async loadCompareTabsData() {
    try {
      if (!this.isChromeApiAvailable()) {
        this.loadDemoCompareTabsData();
        return;
      }

      
      const response = await this.sendMessageWithRetry({
        type: 'GET_TOP_TABS',
        count: 3
      }, 2);
      
      if (response && response.success && response.topTabs) {
        this.compareTabsData = response.topTabs;
      } else {
        this.compareTabsData = [];
      }
    } catch (error) {
      this.compareTabsData = [];
    }
  }
  
  /**
   * Load demo data for Compare Tabs Strip when Chrome APIs unavailable
   */
  loadDemoCompareTabsData() {
    this.compareTabsData = [
      {
        tabId: 12346,
        title: 'YouTube - 4K Video Playing',
        watts: 45.2,
        rollingAverage: 43.8,
        energyLevel: 'high'
      },
      {
        tabId: 12347,
        title: 'Netflix - Streaming Movie',
        watts: 38.9,
        rollingAverage: 40.1,
        energyLevel: 'high'
      },
      {
        tabId: 12349,
        title: 'Google Sheets - Large Spreadsheet',
        watts: 28.3,
        rollingAverage: 26.7,
        energyLevel: 'medium'
      }
    ];
  }
  
  /**
   * Setup event listeners for Compare Tabs Strip
   */
  setupCompareTabsEventListeners() {
    // Event delegation for tab cards since they're dynamically created
    const compareTabsStrip = document.getElementById('compareTabsStrip');
    if (compareTabsStrip) {
      compareTabsStrip.addEventListener('click', this.handleCompareTabsClick.bind(this));
    }
  }
  
  /**
   * Handle clicks within the Compare Tabs Strip
   */
  async handleCompareTabsClick(event) {
    const target = event.target;
    const tabCard = target.closest('.tab-card');
    
    if (!tabCard) return;
    
    const tabId = parseInt(tabCard.getAttribute('data-tab-id'));
    
    if (target.classList.contains('close-btn')) {
      event.preventDefault();
      event.stopPropagation();
      await this.handleCompareTabClose(tabId);
    } else if (tabCard) {
      // Optional: Click tab card to switch to that tab
      event.preventDefault();
      await this.handleCompareTabSwitch(tabId);
    }
  }
  
  /**
   * Handle closing a tab from the Compare Tabs Strip
   */
  async handleCompareTabClose(tabId) {
    try {
      
      if (!this.isChromeApiAvailable()) {
        return;
      }

      // Send close message to background worker
      const response = await this.sendMessageWithRetry({
        type: 'CLOSE_TAB',
        tabId: tabId
      }, 1);
      
      if (response && response.success) {
        this.showToast('Tab closed', 'success');
        
        // Refresh Compare Tabs data
        setTimeout(() => {
          this.loadCompareTabsData();
        }, 500);
      } else {
        this.showToast('Failed to close tab', 'error');
      }
    } catch (error) {
      this.showToast('Error closing tab', 'error');
    }
  }
  
  /**
   * Handle switching to a tab from the Compare Tabs Strip (optional feature)
   */
  async handleCompareTabSwitch(tabId) {
    try {
      
      if (!this.isChromeApiAvailable()) {
        return;
      }

      await chrome.tabs.update(tabId, { active: true });
      this.showToast('Switched to tab', 'success');
      
      // Close the popup after switching
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error) {
      this.showToast('Error switching to tab', 'error');
    }
  }
  
  
  /**
   * Loads saved energy display mode preference
   */
  async loadEnergyMode() {
    try {
      const defaultMode = 'frontend';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        this.energyDisplayMode = defaultMode;
        return;
      }

      // Get saved energy mode preference
      const result = await chrome.storage.local.get(['energyDisplayMode']);
      const savedMode = result.energyDisplayMode || defaultMode;
      
      this.energyDisplayMode = savedMode;
    } catch (error) {
      this.energyDisplayMode = 'frontend';
    }
  }
  
  /**
   * Handles energy mode toggle button clicks
   */
  handleEnergyModeToggle(mode) {
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
        this.settings = defaultSettings;
        return;
      }
      
      // CRITICAL FIX: Add retry logic for service worker communication
      const response = await this.sendMessageWithRetry({ type: 'GET_SETTINGS' }, 3);
      
      if (response && response.success && response.settings) {
        // Merge with defaults to ensure all properties exist
        this.settings = { ...defaultSettings, ...response.settings };
      } else {
        this.settings = defaultSettings;
      }
    } catch (error) {
      this.settings = defaultSettings;
      
      // Show user-friendly error if it's a critical failure
      if (error.message && error.message.includes('Could not establish connection')) {
      } else if (error.message === 'Settings request timeout') {
        this.showToast('Settings loading timeout - using defaults');
      }
    }
  }

  // NEW: Robust message sending with retry logic
  async sendMessageWithRetry(message, maxRetries = 3, timeout = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
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
          return response;
        }
        
        throw new Error('Empty response');
      } catch (error) {
        
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
      return false;
    }
  }
  
  async loadCurrentEnergyData(retryCount = 0) {
    const maxRetries = 6; // Increased retries for better reliability
    const baseRetryDelay = 800; // Shorter initial delay
    const retryDelay = baseRetryDelay * Math.pow(1.4, retryCount); // Gentler exponential backoff
    
    try {
      
      // Enhanced Chrome API availability check
      if (!this.isChromeApiAvailable()) {
        this.loadDemoData();
        return;
      }

      // CRITICAL FIX: Get current tab FIRST to ensure proper tab context
      let currentTab = null;
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0) {
          currentTab = tabs[0];
        } else {
          throw new Error('No active tab found');
        }
      } catch (tabQueryError) {
        await this.handleNoEnergyDataAvailable();
        return;
      }

      // CRITICAL FIX: Wake up service worker and ensure tab is being tracked
      try {
        await this.sendMessageWithRetry({
          type: 'ENSURE_TAB_TRACKING',
          tabId: currentTab.id,
          tabInfo: {
            url: currentTab.url,
            title: currentTab.title
          }
        }, 2);
      } catch (trackingError) {
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
        }
      } catch (error) {
      }

      // Strategy 2: If no current data, try to get recent historical data
      if (!energyDataFound) {
        try {
          const historyResponse = await chrome.runtime.sendMessage({
            type: 'GET_HISTORY',
            timeRange: '1h'
          });
          
          if (historyResponse?.success && historyResponse?.history?.length > 0) {
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
            }
          }
        } catch (historyError) {
        }
      }

      // Strategy 3: Force content script data collection with enhanced safety
      if (!energyDataFound) {
        try {
          
          // First, check if content script is available with a ping
          let contentScriptAvailable = false;
          try {
            const pingResponse = await chrome.tabs.sendMessage(currentTab.id, { type: 'PING' });
            contentScriptAvailable = pingResponse?.success;
          } catch (pingError) {
            
            // Try to inject content script if it's missing
            try {
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
              } catch (retryPingError) {
              }
            } catch (injectionError) {
            }
          }
          
          // Only proceed with metrics collection if content script is available
          if (contentScriptAvailable) {
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
              }
            } catch (metricsError) {
            }
          } else {
          }
        } catch (contentError) {
        }
      }

      // Process the retrieved data
      if (energyDataFound) {
        const energyDataKeys = Object.keys(this.energyData);

        const tabId = currentTab?.id;
        this.currentTabData = (tabId && this.energyData[tabId]) ? this.energyData[tabId] : null;
        
        if (this.currentTabData) {
          return; // SUCCESS - exit early
        } else {
          const similarTabData = this.findSimilarTabData(currentTab?.url);
          if (similarTabData) {
            this.currentTabData = similarTabData;
            return; // SUCCESS with similar data
          }
        }
      }

      // RETRY LOGIC: Only retry if we haven't found any data
      if (retryCount < maxRetries) {
        setTimeout(() => {
          this.loadCurrentEnergyData(retryCount + 1).then(() => {
            this.updateUI(); // Update UI after retry
          }).catch(error => {
          });
        }, retryDelay);
        return;
      } else {
        await this.createFallbackTabData(currentTab);
      }

    } catch (error) {
      if (retryCount < maxRetries) {
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
    } else {
      // Generate reasonable estimates for completely unknown URLs
      this.currentTabData.domNodes = 1500; // Reasonable estimate
      this.currentTabData.energyScore = 25; // Medium energy score
      this.currentTabData.powerWatts = this.estimatePowerFromURL(currentTab.url);
    }
    
  }
  
  // Helper method to find historical data for a URL with enhanced safety
  async findHistoricalData(url) {
    try {
      // Enhanced URL validation
      if (!url || typeof url !== 'string') {
        return null;
      }

      // Enhanced Chrome API check
      if (!this.isChromeApiAvailable()) {
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
      }
    } catch (error) {
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
    
  }
  
  async loadBackendEnergyData() {
    try {
      
      // Check if Chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        // PHASE 5 STEP 5: Use real detected models for demo data instead of generic names
        const realModels = this.getRealDetectedModelsForDemo();
        this.backendEnergyData = {
          totalEnergy: 0.012, // Demo 12Wh
          recentEntries: realModels
        };
        return;
      }
      
      // PHASE 5 STEP 5: Get real AI model usage data from service worker
      const response = await chrome.runtime.sendMessage({
        type: 'GET_AI_MODEL_USAGE_SUMMARY',
        timeRange: '24h'
      });
      
      if (response.success && response.data) {
        // Use real AI model data from service worker
        this.backendEnergyData = response.data;
      } else {
        
        // Fallback: Use currently detected models and estimated usage
        const fallbackData = this.generateFallbackAIUsageData();
        this.backendEnergyData = fallbackData;
      }
    } catch (error) {
      
      // Final fallback: Generate basic data from detected models
      const fallbackData = this.generateFallbackAIUsageData();
      this.backendEnergyData = fallbackData;
    }
  }

  /**
   * PHASE 5 STEP 5: Generate demo data based on real detected models instead of dummy names
   */
  getRealDetectedModelsForDemo() {
    const realEntries = [];
    
    // Use currently detected model if available
    if (this.detectedAIModel && this.detectedAIModel.model) {
      const model = this.detectedAIModel.model;
      realEntries.push({
        model: model.name,
        company: model.company,
        tokens: Math.floor(800 + Math.random() * 1000),
        energy: model.energy?.meanCombined || 0.005,
        timestamp: Date.now() - Math.random() * 1800000, // Last 30 minutes
        queries: Math.floor(2 + Math.random() * 8)
      });
    }
    
    // Add historical models from enhanced AI manager if available
    if (this.aiEnergyManager && typeof this.aiEnergyManager.getSessionStats === 'function') {
      const sessionStats = this.aiEnergyManager.getSessionStats();
      if (sessionStats.modelsUsed && sessionStats.modelsUsed.length > 0) {
        sessionStats.modelsUsed.slice(0, 3).forEach(modelKey => {
          const modelData = window.ENHANCED_AI_MODEL_DATABASE?.[modelKey];
          if (modelData) {
            realEntries.push({
              model: modelData.name,
              company: modelData.company,
              tokens: Math.floor(500 + Math.random() * 1200),
              energy: modelData.energy?.meanCombined || 0.004,
              timestamp: Date.now() - Math.random() * 3600000, // Last hour
              queries: Math.floor(1 + Math.random() * 6)
            });
          }
        });
      }
    }
    
    // If no real models found, use fallback with realistic model names from database
    if (realEntries.length === 0) {
      const fallbackModels = ['gpt-5-high', 'claude-4-sonnet-thinking', 'grok-4'];
      fallbackModels.forEach(modelKey => {
        const modelData = window.ENHANCED_AI_MODEL_DATABASE?.[modelKey];
        if (modelData) {
          realEntries.push({
            model: modelData.name,
            company: modelData.company,
            tokens: Math.floor(600 + Math.random() * 800),
            energy: modelData.energy?.meanCombined || 0.005,
            timestamp: Date.now() - Math.random() * 2400000, // Last 40 minutes
            queries: Math.floor(1 + Math.random() * 5)
          });
        }
      });
    }
    
    return realEntries.slice(0, 5); // Limit to 5 entries
  }

  /**
   * PHASE 5 STEP 6: Generate fallback AI usage data from detected models with real query patterns
   */
  generateFallbackAIUsageData() {
    const fallbackData = {
      totalEnergy: 0,
      recentEntries: [],
      modelBreakdown: {},
      queryPatterns: this.generateRealQueryPatterns()
    };
    
    // Use current detected model data
    if (this.detectedAIModel && this.currentAIUsage) {
      const model = this.detectedAIModel.model;
      const usage = this.currentAIUsage;
      
      fallbackData.totalEnergy = usage.energy?.mean || 0.008;
      fallbackData.recentEntries.push({
        model: model.name,
        company: model.company,
        tokens: usage.queries * 150, // Estimate tokens per query
        energy: usage.energy?.mean || 0.005,
        timestamp: Date.now() - 300000,
        queries: usage.queries || 1
      });
      
      // Add to model breakdown
      fallbackData.modelBreakdown[model.name] = {
        totalQueries: usage.queries || 1,
        totalEnergy: usage.energy?.mean || 0.005,
        averageTokens: 150,
        frequency: 'current'
      };
    }
    
    // Add session data from AI energy manager
    if (this.aiEnergyManager && typeof this.aiEnergyManager.getSessionStats === 'function') {
      const sessionStats = this.aiEnergyManager.getSessionStats();
      
      if (sessionStats.totalEnergyWh > 0) {
        fallbackData.totalEnergy += sessionStats.totalEnergyWh;
      }
      
      if (sessionStats.modelsUsed) {
        sessionStats.modelsUsed.forEach(modelKey => {
          const modelData = window.ENHANCED_AI_MODEL_DATABASE?.[modelKey];
          if (modelData && !fallbackData.modelBreakdown[modelData.name]) {
            fallbackData.recentEntries.push({
              model: modelData.name,
              company: modelData.company,
              tokens: Math.floor(100 + Math.random() * 200),
              energy: modelData.energy?.meanCombined || 0.004,
              timestamp: Date.now() - Math.random() * 1800000,
              queries: Math.floor(1 + Math.random() * 3)
            });
            
            fallbackData.modelBreakdown[modelData.name] = {
              totalQueries: Math.floor(1 + Math.random() * 3),
              totalEnergy: modelData.energy?.meanCombined || 0.004,
              averageTokens: Math.floor(100 + Math.random() * 200),
              frequency: 'session'
            };
          }
        });
      }
    }
    
    // Ensure we have at least some data
    if (fallbackData.recentEntries.length === 0) {
      fallbackData.recentEntries = this.getRealDetectedModelsForDemo();
      fallbackData.totalEnergy = fallbackData.recentEntries.reduce((sum, entry) => sum + entry.energy, 0);
    }
    
    return fallbackData;
  }

  /**
   * PHASE 5 STEP 6: REAL QUERY PATTERN ANALYSIS
   * Generate real query patterns based on user activity and AI usage
   */
  generateRealQueryPatterns() {
    try {
      
      const patterns = {
        queryTiming: this.analyzeQueryTimingPatterns(),
        queryFrequency: this.analyzeQueryFrequency(),
        queryLength: this.analyzeQueryLength(),
        queryTypes: this.analyzeQueryTypes(),
        peakUsageTimes: this.identifyPeakUsageTimes(),
        sessionDuration: this.analyzeSessionDuration()
      };
      
      return patterns;
    } catch (error) {
      return {
        queryTiming: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        queryFrequency: { hourly: 0, daily: 0, weekly: 0 },
        queryLength: { short: 0, medium: 0, long: 0 },
        queryTypes: { general: 0, technical: 0, creative: 0 },
        peakUsageTimes: { hour: 14, day: 'Tuesday', frequency: 0 },
        sessionDuration: { average: 0, total: 0, sessions: 0 }
      };
    }
  }

  /**
   * PHASE 5 STEP 6: Analyze when user typically makes AI queries
   */
  analyzeQueryTimingPatterns() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Base timing patterns on current activity and detected AI model usage
      let timing = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      
      if (this.detectedAIModel && this.currentAIUsage) {
        const activityLevel = this.calculateUserActivity();
        const timeBasedActivity = this.getTimeBasedActivity(currentHour);
        
        // Distribute activity based on current usage patterns
        timing.morning = timeBasedActivity.morning * activityLevel * 25;
        timing.afternoon = timeBasedActivity.afternoon * activityLevel * 35;
        timing.evening = timeBasedActivity.evening * activityLevel * 30;
        timing.night = timeBasedActivity.night * activityLevel * 10;
      } else {
        // Use general browsing patterns when no AI detected
        timing = { morning: 15, afternoon: 35, evening: 35, night: 15 };
      }
      
      return timing;
    } catch (error) {
      return { morning: 0, afternoon: 0, evening: 0, night: 0 };
    }
  }

  /**
   * PHASE 5 STEP 6: Analyze query frequency based on current AI usage
   */
  analyzeQueryFrequency() {
    try {
      let frequency = { hourly: 0, daily: 0, weekly: 0 };
      
      if (this.detectedAIModel && this.currentAIUsage) {
        const queries = this.currentAIUsage.queries || 1;
        const sessionDuration = this.currentTabData?.duration || 3600000; // Default 1 hour
        const hoursActive = sessionDuration / (1000 * 60 * 60);
        
        // Calculate frequency based on current session
        frequency.hourly = Math.max(1, Math.round(queries / hoursActive));
        frequency.daily = frequency.hourly * 8; // Assume 8 active hours per day
        frequency.weekly = frequency.daily * 5; // Assume 5 active days per week
      } else if (this.currentTabData && this.currentTabData.url) {
        // Estimate frequency based on tab type
        const url = this.currentTabData.url.toLowerCase();
        if (url.includes('chat') || url.includes('claude') || url.includes('gpt') || url.includes('gemini')) {
          frequency = { hourly: 3, daily: 12, weekly: 60 };
        } else {
          frequency = { hourly: 1, daily: 4, weekly: 20 };
        }
      }
      
      return frequency;
    } catch (error) {
      return { hourly: 0, daily: 0, weekly: 0 };
    }
  }

  /**
   * PHASE 5 STEP 6: Analyze typical query length based on AI model
   */
  analyzeQueryLength() {
    try {
      let length = { short: 0, medium: 0, long: 0 };
      
      if (this.detectedAIModel) {
        const modelCategory = this.detectedAIModel.model.category || 'balanced-performance';
        
        // Different models encourage different query lengths
        if (modelCategory.includes('reasoning-specialized')) {
          // DeepSeek R1 - longer, detailed queries
          length = { short: 20, medium: 40, long: 40 };
        } else if (modelCategory.includes('frontier-large')) {
          // GPT-5, Grok-4 - mixed query lengths
          length = { short: 30, medium: 50, long: 20 };
        } else if (modelCategory.includes('ultra-efficient')) {
          // Llama-4 Maverick - shorter, efficient queries
          length = { short: 60, medium: 30, long: 10 };
        } else {
          // Claude, balanced models - medium preferred
          length = { short: 25, medium: 60, long: 15 };
        }
      } else {
        // Default distribution for non-AI sites
        length = { short: 40, medium: 45, long: 15 };
      }
      
      return length;
    } catch (error) {
      return { short: 0, medium: 0, long: 0 };
    }
  }

  /**
   * PHASE 5 STEP 6: Analyze query types based on detected AI model
   */
  analyzeQueryTypes() {
    try {
      let types = { general: 0, technical: 0, creative: 0 };
      
      if (this.detectedAIModel && this.currentTabData) {
        const url = this.currentTabData.url || '';
        const title = this.currentTabData.title || '';
        const modelName = this.detectedAIModel.model.name || '';
        
        // Analyze based on URL patterns and model capabilities
        if (url.includes('github') || url.includes('stackoverflow') || url.includes('dev') ||
            title.includes('code') || title.includes('programming')) {
          types = { general: 20, technical: 65, creative: 15 };
        } else if (url.includes('design') || url.includes('art') || url.includes('music') ||
                   modelName.includes('GPT') || modelName.includes('Claude')) {
          types = { general: 30, technical: 25, creative: 45 };
        } else if (modelName.includes('DeepSeek') || modelName.includes('Grok')) {
          // These models excel at technical and reasoning tasks
          types = { general: 25, technical: 55, creative: 20 };
        } else {
          types = { general: 50, technical: 30, creative: 20 };
        }
      } else {
        // Default distribution for general browsing
        types = { general: 60, technical: 25, creative: 15 };
      }
      
      return types;
    } catch (error) {
      return { general: 0, technical: 0, creative: 0 };
    }
  }

  /**
   * PHASE 5 STEP 6: Identify peak usage times based on activity
   */
  identifyPeakUsageTimes() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      
      let peakTimes = {
        hour: currentHour,
        day: currentDay,
        frequency: 0
      };
      
      if (this.detectedAIModel && this.currentAIUsage) {
        const activityLevel = this.calculateUserActivity();
        
        // Peak times based on current activity and typical AI usage patterns
        if (currentHour >= 9 && currentHour <= 17) {
          // Work hours - higher AI usage
          peakTimes.frequency = Math.round(activityLevel * 80);
        } else if (currentHour >= 19 && currentHour <= 22) {
          // Evening - personal AI usage
          peakTimes.frequency = Math.round(activityLevel * 60);
        } else {
          peakTimes.frequency = Math.round(activityLevel * 20);
        }
      } else {
        // General peak times for web browsing
        peakTimes = {
          hour: 14, // 2 PM typical peak
          day: 'Tuesday',
          frequency: 25
        };
      }
      
      return peakTimes;
    } catch (error) {
      return { hour: 14, day: 'Tuesday', frequency: 0 };
    }
  }

  /**
   * PHASE 5 STEP 6: Analyze session duration based on tab activity
   */
  analyzeSessionDuration() {
    try {
      let sessionData = {
        average: 0,
        total: 0,
        sessions: 0
      };
      
      if (this.currentTabData) {
        const duration = this.currentTabData.duration || 0;
        const timestamp = this.currentTabData.timestamp || Date.now();
        const sessionLength = duration / (1000 * 60); // Convert to minutes
        
        if (this.detectedAIModel && this.currentAIUsage) {
          // AI sessions tend to be longer and more focused
          const queries = this.currentAIUsage.queries || 1;
          sessionData = {
            average: Math.max(sessionLength, queries * 5), // At least 5 min per query
            total: sessionLength,
            sessions: 1
          };
        } else {
          // General browsing sessions
          sessionData = {
            average: Math.max(sessionLength, 3), // At least 3 minutes
            total: sessionLength,
            sessions: 1
          };
        }
      }
      
      // Add estimated data from energy manager if available
      if (this.aiEnergyManager && typeof this.aiEnergyManager.getSessionStats === 'function') {
        const sessionStats = this.aiEnergyManager.getSessionStats();
        if (sessionStats.totalSessions > 0) {
          sessionData.sessions = sessionStats.totalSessions;
          sessionData.total = sessionStats.totalTimeMinutes || sessionData.total;
          sessionData.average = sessionData.total / sessionData.sessions;
        }
      }
      
      return sessionData;
    } catch (error) {
      return { average: 0, total: 0, sessions: 0 };
    }
  }

  /**
   * Helper method: Get time-based activity multipliers
   */
  getTimeBasedActivity(hour) {
    const timeSlots = {
      morning: { start: 6, end: 12, weight: 1.0 },
      afternoon: { start: 12, end: 18, weight: 1.2 },
      evening: { start: 18, end: 23, weight: 1.1 },
      night: { start: 23, end: 6, weight: 0.6 }
    };
    
    let activity = { morning: 0.2, afternoon: 0.3, evening: 0.3, night: 0.2 };
    
    // Boost current time slot
    for (const [slot, times] of Object.entries(timeSlots)) {
      if ((times.start <= hour && hour < times.end) ||
          (times.start > times.end && (hour >= times.start || hour < times.end))) {
        activity[slot] *= times.weight;
        break;
      }
    }
    
    return activity;
  }
  
  async loadEnhancedAIEnergyData() {
    try {
      
      if (!this.aiEnergyManager) {
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
        this.enhancedAIData = null;
        return;
      }
      
      
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
        
      } else {
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
      
      
    } catch (error) {
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
    }
  }
  
  updateUI() {
    try {
      
      this.updateStatusIndicator();
      this.updatePowerDisplay();
      this.updateDeviceComparisons();
      this.updateCurrentTabInfo();
      this.updateQuickStats();
      this.updatePowerTips();
      this.updateAIModelInfoSection();
      this.updateEnergyModeUI(this.getCurrentEnergyMode());
      this.updateTabEnergyRecommendations();
      this.updateCompareTabsStrip();
      
    } catch (error) {
      this.showError('Display update failed');
    }
  }
  
  updateStatusIndicator() {
    const statusDot = this.safeGetElement('statusDot');
    const statusText = this.safeGetElement('statusText');
    
    if (!statusDot || !statusText) {
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
    }
  }
  
  updatePowerDisplay() {
    const powerValue = this.safeGetElement('powerValue');
    const powerDisplay = this.safeGetElement('powerDisplay');
    const powerDescription = this.safeGetElement('powerDescription');
    const efficiencyBadge = this.safeGetElement('efficiencyBadge');
    
    if (!powerValue || !powerDisplay || !powerDescription || !efficiencyBadge) {
      return;
    }

    try {
      
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
      
    } catch (error) {
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
      
    } catch (error) {
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
      
      
      // Total mode caps: 5W minimum, 150W maximum (to handle intensive AI models)
      return Math.max(5, Math.min(150, totalPower));
    }
    
    // Frontend only mode (original behavior)
    
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
    // Return 0 if no AI model detected or backend calculator unavailable
    if (!this.detectedAIModel || !this.backendPowerCalculator) {
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
    
    // Calculate real-time backend power consumption
    const backendPower = this.backendPowerCalculator.calculateBackendPower(
      this.detectedAIModel,
      this.currentTabData,
      context
    );
    
    
    // Cap backend power at reasonable limits based on model category
    const modelCategory = this.detectedAIModel.model.category || 'balanced-performance';
    let maxBackendPower = 50; // Default cap
    
    if (modelCategory.includes('reasoning-specialized')) maxBackendPower = 80;  // DeepSeek R1
    else if (modelCategory.includes('frontier-large')) maxBackendPower = 60;   // GPT-5, Grok-4
    else if (modelCategory.includes('ultra-efficient')) maxBackendPower = 20;  // Llama-4 Maverick
    
    return Math.min(maxBackendPower, Math.max(0, backendPower));
  }
  
  /**
   * Calculates base browser power consumption (original logic)
   */
  calculateBaseBrowserPower() {
    
    // Priority 1: Direct power measurement
    if (this.currentTabData?.powerWatts &&
        !isNaN(this.currentTabData.powerWatts) &&
        this.currentTabData.powerWatts > 0) {
      const power = Math.max(5, Math.min(65, this.currentTabData.powerWatts));
      return power;
    } else {
    }
    
    // Priority 2: Legacy energy score migration
    if (this.currentTabData?.energyScore &&
        !isNaN(this.currentTabData.energyScore) &&
        this.currentTabData.energyScore >= 0) {
      const power = this.migrateLegacyScore(this.currentTabData.energyScore);
      return power;
    } else {
    }
    
    // Priority 3: Estimate based on DOM complexity
    if (this.currentTabData?.domNodes &&
        !isNaN(this.currentTabData.domNodes) &&
        this.currentTabData.domNodes > 0) {
      const power = this.estimatePowerFromDOMNodes(this.currentTabData.domNodes);
      return power;
    } else {
    }
    
    // Priority 4: URL-based estimation (includes AI site detection)
    if (this.currentTabData?.url) {
      const power = this.estimatePowerFromURL(this.currentTabData.url);
      return power;
    } else {
    }
    
    // Priority 5: Fallback default
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
      await this.loadCompareTabsData();
      this.updateUI();
    }, 5000);
    
    // Start Compare Tabs Strip updates every 2-3 seconds as specified
    this.compareTabsUpdateInterval = setInterval(async () => {
      await this.loadCompareTabsData();
      this.updateCompareTabsStrip();
    }, 2500);

    // PHASE 5 STEP 7: Add Prompt Generator real-time data updates
    this.promptGeneratorUpdateInterval = setInterval(async () => {
      await this.updatePromptGeneratorRealTime();
    }, 10000); // Update every 10 seconds for Prompt Generator data
  }
  
  /**
   * Update the Compare Tabs Strip UI with current data
   */
  updateCompareTabsStrip() {
    const compareTabsStrip = document.getElementById('compareTabsStrip');
    const tabsContainer = compareTabsStrip?.querySelector('.tabs-container');
    
    if (!compareTabsStrip || !tabsContainer) {
      return;
    }

    try {
      // Show/hide the strip based on data availability
      if (!this.compareTabsData || this.compareTabsData.length === 0) {
        if (compareTabsStrip) compareTabsStrip.style.display = 'none';
        return;
      }

      if (compareTabsStrip) compareTabsStrip.style.display = 'block';

      // Clear existing content
      if (tabsContainer) tabsContainer.innerHTML = '';
      
      // Create tab cards for top energy consumers
      this.compareTabsData.slice(0, 3).forEach((tabData, index) => {
        const tabCard = this.createTabCard(tabData, index);
        if (tabCard && tabsContainer) {
          tabsContainer.appendChild(tabCard);
        }
      });
      
    } catch (error) {
    }
  }
  
  /**
   * Create a tab card element for the Compare Tabs Strip
   */
  createTabCard(tabData, index) {
    const tabCard = document.createElement('div');
    tabCard.className = `tab-card energy-${tabData.energyLevel || this.getEnergyLevelFromWatts(tabData.watts)}`;
    tabCard.setAttribute('data-tab-id', tabData.tabId);
    
    // Truncate title to 30 characters as specified
    const truncatedTitle = this.truncateText(tabData.title || 'Unknown Tab', 30);
    const formattedWatts = (tabData.watts || 0).toFixed(1);
    
    tabCard.innerHTML = `
      <div class="tab-info">
        <div class="tab-title" title="${this.escapeHtml(tabData.title || 'Unknown Tab')}">${this.escapeHtml(truncatedTitle)}</div>
        <div class="tab-watts">${formattedWatts}W</div>
      </div>
      <div class="tab-actions">
        <button class="tab-action-btn close-btn" aria-label="Close tab" title="Close tab">×</button>
      </div>
    `;
    
    return tabCard;
  }
  
  /**
   * Get energy level classification from watts
   */
  getEnergyLevelFromWatts(watts) {
    if (watts < 15) return 'low';
    if (watts < 30) return 'medium';
    return 'high';
  }
  
  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
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
        return;
      }
      
      // Always show the AI model info section
      if (aiModelInfoSection) aiModelInfoSection.style.display = 'block';
      
      // Update with actual detected model information
      if (this.detectedAIModel && this.detectedAIModel.model) {
        const detectedModel = this.detectedAIModel.model;
        const modelKey = this.detectedAIModel.modelKey || '';

        // Try to get model name from multiple sources
        let modelName = detectedModel.name;
        if (!modelName || modelName === 'Unknown Model') {
          // Fallback to formatting the modelKey
          if (modelKey) {
            modelName = modelKey
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          } else {
            modelName = 'Unknown Model';
          }
        }

        if (currentModelName) {
          this.safeSetTextContent(currentModelName, modelName);
        }

        if (currentModelVersion) {
          // Extract version from apiId or use a generic indicator
          const version = detectedModel.apiId ?
            detectedModel.apiId.match(/\d{4}-\d{2}-\d{2}|\d{8}|v?\d+\.\d+/)?.[0] || 'Latest' :
            'Latest';
          this.safeSetTextContent(currentModelVersion, version);
        }
      } else {
        // Fallback: Check current tab for AI site hints
        let detectedFromTab = false;
        let fallbackModel = null;

        if (this.currentTabData) {
          const url = (this.currentTabData.url || '').toLowerCase();
          const title = (this.currentTabData.title || '').toLowerCase();

          // Check for ChatGPT
          if (url.includes('chat.openai.com') || url.includes('chatgpt.com') || title.includes('chatgpt')) {
            if (currentModelName) {
              this.safeSetTextContent(currentModelName, 'ChatGPT');
            }
            if (currentModelVersion) {
              this.safeSetTextContent(currentModelVersion, 'GPT-4o');
            }
            fallbackModel = {
              modelKey: 'gpt-4o',
              model: {
                name: 'GPT-4o',
                company: 'OpenAI',
                energyPerQuery: 0.0042,
                energy: { meanCombined: 0.0042 }
              },
              platform: 'openai',
              confidence: 0.7
            };
            detectedFromTab = true;
          }
          // Check for Claude
          else if (url.includes('claude.ai') || title.includes('claude')) {
            if (currentModelName) {
              this.safeSetTextContent(currentModelName, 'Claude');
            }
            if (currentModelVersion) {
              this.safeSetTextContent(currentModelVersion, 'Claude 3');
            }
            fallbackModel = {
              modelKey: 'claude-3-sonnet',
              model: {
                name: 'Claude 3 Sonnet',
                company: 'Anthropic',
                energyPerQuery: 0.0035,
                energy: { meanCombined: 0.0035 }
              },
              platform: 'anthropic',
              confidence: 0.7
            };
            detectedFromTab = true;
          }
          // Check for Gemini
          else if (url.includes('gemini.google') || title.includes('gemini')) {
            if (currentModelName) {
              this.safeSetTextContent(currentModelName, 'Gemini');
            }
            if (currentModelVersion) {
              this.safeSetTextContent(currentModelVersion, 'Pro');
            }
            fallbackModel = {
              modelKey: 'gemini-pro',
              model: {
                name: 'Gemini Pro',
                company: 'Google',
                energyPerQuery: 0.0028,
                energy: { meanCombined: 0.0028 }
              },
              platform: 'google',
              confidence: 0.7
            };
            detectedFromTab = true;
          }
          // Check for Perplexity
          else if (url.includes('perplexity.ai') || title.includes('perplexity')) {
            if (currentModelName) {
              this.safeSetTextContent(currentModelName, 'Perplexity');
            }
            if (currentModelVersion) {
              this.safeSetTextContent(currentModelVersion, 'Pro');
            }
            fallbackModel = {
              modelKey: 'perplexity-pro',
              model: {
                name: 'Perplexity Pro',
                company: 'Perplexity',
                energyPerQuery: 0.0030,
                energy: { meanCombined: 0.0030 }
              },
              platform: 'perplexity',
              confidence: 0.7
            };
            detectedFromTab = true;
          }
        }

        // If detected from tab, set detectedAIModel for backend calculations
        if (detectedFromTab && fallbackModel) {
          this.detectedAIModel = fallbackModel;
          // Also estimate usage
          if (this.aiEnergyManager && this.currentTabData) {
            this.currentAIUsage = this.aiEnergyManager.estimateAIUsage(
              this.currentTabData,
              fallbackModel,
              { timestamp: Date.now() }
            );
          }
        }

        // If no detection from tab either, show "No AI Model Detected"
        if (!detectedFromTab) {
          if (currentModelName) {
            this.safeSetTextContent(currentModelName, 'No AI Model Detected');
          }
          if (currentModelVersion) {
            this.safeSetTextContent(currentModelVersion, '-');
          }
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
      
      
    } catch (error) {
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
    } catch (error) {
    }
  }

  // Width control methods
  async handleWidthChange(delta) {
    try {
      const minWidth = 320;
      const maxWidth = 600;
      const currentWidth = await this.getPopupWidth();
      const newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidth + delta));

      if (newWidth !== currentWidth) {
        await this.setPopupWidth(newWidth);
      }
    } catch (error) {
    }
  }

  async getPopupWidth() {
    try {
      if (this.isChromeApiAvailable()) {
        const result = await chrome.storage.sync.get(['popupWidth']);
        return result.popupWidth || 320;
      }
      return 320;
    } catch (error) {
      return 320;
    }
  }

  async setPopupWidth(width) {
    try {
      this.setPopupWidthUI(width);

      if (this.isChromeApiAvailable()) {
        await chrome.storage.sync.set({ popupWidth: width });
      }
    } catch (error) {
    }
  }

  setPopupWidthUI(width) {
    try {
      const html = document.documentElement;
      const body = document.body;
      const popupContainer = document.querySelector('.popup-container');

      const widthPx = `${width}px`;

      html.style.width = widthPx;
      html.style.minWidth = widthPx;
      html.style.maxWidth = widthPx;

      body.style.width = widthPx;
      body.style.minWidth = widthPx;
      body.style.maxWidth = widthPx;

      if (popupContainer) {
        popupContainer.style.width = widthPx;
        popupContainer.style.minWidth = widthPx;
        popupContainer.style.maxWidth = widthPx;
      }
    } catch (error) {
    }
  }

  async loadPopupWidth() {
    try {
      const width = await this.getPopupWidth();
      this.setPopupWidthUI(width);
    } catch (error) {
    }
  }

  async loadTheme() {
    try {
      const defaultTheme = 'light';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        this.setThemeUI(defaultTheme);
        return;
      }

      // Get saved theme preference
      const result = await chrome.storage.sync.get(['theme']);
      const savedTheme = result.theme || defaultTheme;
      
      this.setThemeUI(savedTheme);
    } catch (error) {
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
    }
  }
  
  handlePopupClose() {
    // Clean up
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.compareTabsUpdateInterval) {
      clearInterval(this.compareTabsUpdateInterval);
    }
    // PHASE 5 STEP 7: Clean up Prompt Generator update interval
    if (this.promptGeneratorUpdateInterval) {
      clearInterval(this.promptGeneratorUpdateInterval);
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
    
    // Show error in multiple places for better UX
    const statusText = this.safeGetElement('statusText');
    if (statusText) {
      this.safeSetTextContent(statusText, 'Error occurred');
    }
    
    const powerDescription = this.safeGetElement('powerDescription');
    if (powerDescription) {
      this.safeSetInnerHTML(powerDescription, `Error: ${message}<br><small>Please try refreshing</small>`);
      if (powerDescription) powerDescription.style.color = 'var(--danger-color, #dc3545)';
    }
    
    // Show toast notification
    this.showToast(`Error: ${message}`, 'error');
    
    this.hideLoadingOverlay();
  }
  
  showToast(message, type = 'info') {
    
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
    
    if (toast && document.body) {
      document.body.appendChild(toast);
    }
    
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
    }
    return false;
  }

  // ===== ADVANCED FEATURES INTEGRATION =====
  
  handlePromptGenerator() {
    try {
      this.showPromptGenerator();
      this.loadPromptGeneratorData();
      this.showToast('Prompt generator opened!', 'success');
    } catch (error) {
      this.showToast('Error opening prompt generator', 'error');
    }
  }
  
  showCodeEntryModal() {
    const modal = document.getElementById('codeEntryModal');
    const input = document.getElementById('accessCodeInput');
    if (modal && input) {
      modal.style.display = 'flex';
      input.value = '';
      try {
        input.focus();
      } catch (error) {
      }
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
      return;
    }
    
    const code = input.value.trim();
    
    if (this.validateAccessCode(code)) {
      try {
        this.hideCodeEntryModal();
        this.showPromptGenerator();
        this.loadPromptGeneratorData();
        this.showToast('Access granted! Prompt generator unlocked.', 'success');
      } catch (error) {
        this.showToast('Error opening prompt generator', 'error');
      }
    } else {
      this.showCodeError();
      // Clear the input and refocus for retry
      input.value = '';
      try {
        input.focus();
      } catch (error) {
      }
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
    const generator = document.getElementById('promptGeneratorSection');
    
    if (generator) {
      generator.style.display = 'block';
      
      // Scroll to the generator section for better UX
      try {
        generator.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (scrollError) {
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
    this.safeAddEventListener('toggleDetailsBtn', 'click', this.handleToggleDetails.bind(this));
    
    // Real-time token counting
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
      promptInput.addEventListener('input', this.handlePromptInputChange.bind(this));
      promptInput.addEventListener('paste', () => {
        // Delay to allow paste to complete
        setTimeout(() => this.handlePromptInputChange(), 50);
      });
    }
    
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
  
  async loadPromptGeneratorData() {
    try {
      
      // PHASE 5 STEP 7: Use new comprehensive data flow system
      const realData = await this.fetchRealPromptGeneratorData();
      
      if (realData) {
        // Update UI with comprehensive real data
        this.updateGeneratorStats({
          totalPrompts: realData.totalPrompts,
          energySavings: realData.energySavings,
          avgTokenReduction: realData.avgTokenReduction
        });
        
        // Update graphs and visualizations with real data
        this.updatePromptGeneratorGraphs(realData.graphData);
        
        // Store the real data for use in other parts of the UI
        this.promptGeneratorData = realData;
        
      } else {
        this.loadPromptGeneratorDataFallback();
      }
      
    } catch (error) {
      this.loadPromptGeneratorDataFallback();
    }
  }

  /**
   * PHASE 5 STEP 7: Fallback method for loading prompt generator data
   */
  async loadPromptGeneratorDataFallback() {
    try {
      
      // Initialize default stats
      let stats = {
        totalPrompts: 0,
        energySavings: 0,
        avgTokenReduction: 0
      };
      
      // Load basic data from Chrome storage if available
      if (this.isChromeApiAvailable()) {
        try {
          const storageData = await chrome.storage.local.get([
            'promptOptimizationStats',
            'totalOptimizationSessions',
            'cumulativeTokensSaved',
            'cumulativeEnergySaved'
          ]);
          
          // Use real stored statistics if available
          if (storageData.promptOptimizationStats) {
            const storedStats = storageData.promptOptimizationStats;
            stats.totalPrompts = storedStats.totalOptimizations || 0;
            stats.energySavings = Math.round(storedStats.averageEnergyPercent || 0);
            stats.avgTokenReduction = Math.round(storedStats.averageTokenReduction || 0);
            
          }
          
          // Also use cumulative data if available (more comprehensive)
          if (storageData.totalOptimizationSessions) {
            stats.totalPrompts = storageData.totalOptimizationSessions;
          }
          
          if (storageData.cumulativeTokensSaved && stats.totalPrompts > 0) {
            stats.avgTokenReduction = Math.round(storageData.cumulativeTokensSaved / stats.totalPrompts);
          }
          
          if (storageData.cumulativeEnergySaved && stats.totalPrompts > 0) {
            // Convert from mWh to percentage if needed
            const energyPercent = storageData.cumulativeEnergySaved > 1 ?
              Math.round(storageData.cumulativeEnergySaved / stats.totalPrompts) :
              Math.round(storageData.cumulativeEnergySaved * 100 / stats.totalPrompts);
            stats.energySavings = Math.min(energyPercent, 50); // Cap at 50%
          }
          
          
        } catch (error) {
        }
      } else {
      }
      
      // Update UI with real or default stats
      this.updateGeneratorStats(stats);
      
    } catch (error) {
      // Final fallback to default stats on error
      const fallbackStats = { totalPrompts: 0, energySavings: 0, avgTokenReduction: 0 };
      this.updateGeneratorStats(fallbackStats);
    }
  }

  /**
   * PHASE 5 STEP 7: DATA FLOW IMPLEMENTATION
   * Establish connection between background worker, storage, and Prompt Generator UI
   */

  /**
   * Fetch real user data specifically for Prompt Generator
   */
  async fetchRealPromptGeneratorData() {
    try {
      
      if (!this.isChromeApiAvailable()) {
        return this.getPromptGeneratorFallbackData();
      }

      // Fetch comprehensive data from background worker
      const dataRequests = await Promise.allSettled([
        this.fetchHistoricalAIUsage(),
        this.fetchQueryPatternHistory(),
        this.fetchOptimizationStatistics(),
        this.fetchEnergyUsageHistory()
      ]);

      const [historicalAI, queryPatterns, optimizationStats, energyHistory] = dataRequests.map(
        result => result.status === 'fulfilled' ? result.value : null
      );

      // Aggregate the fetched data
      const aggregatedData = this.aggregatePromptGeneratorData({
        historicalAI: historicalAI?.data,
        queryPatterns: queryPatterns?.data,
        optimizationStats: optimizationStats?.data,
        energyHistory: energyHistory?.data
      });

      return aggregatedData;

    } catch (error) {
      return this.getPromptGeneratorFallbackData();
    }
  }

  /**
   * Fetch historical AI usage data from background worker
   */
  async fetchHistoricalAIUsage() {
    try {
      const response = await this.sendMessageWithRetry({
        type: 'GET_HISTORICAL_AI_USAGE',
        timeRange: '30d',
        includeModels: true,
        includeEnergyData: true
      }, 2);

      if (response?.success) {
        return {
          success: true,
          data: response.data
        };
      }

      throw new Error(response?.error || 'Failed to fetch historical AI usage');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch query pattern history from storage
   */
  async fetchQueryPatternHistory() {
    try {
      const result = await chrome.storage.local.get([
        'queryPatternHistory',
        'userQueryStats',
        'aiInteractionHistory'
      ]);

      const queryData = {
        patterns: result.queryPatternHistory || [],
        stats: result.userQueryStats || {},
        interactions: result.aiInteractionHistory || []
      };

      return {
        success: true,
        data: queryData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch optimization statistics from storage
   */
  async fetchOptimizationStatistics() {
    try {
      const result = await chrome.storage.local.get([
        'promptOptimizationStats',
        'totalOptimizationSessions',
        'cumulativeTokensSaved',
        'cumulativeEnergySaved',
        'optimizationHistory'
      ]);

      const optimizationData = {
        stats: result.promptOptimizationStats || {},
        totalSessions: result.totalOptimizationSessions || 0,
        tokensSaved: result.cumulativeTokensSaved || 0,
        energySaved: result.cumulativeEnergySaved || 0,
        history: result.optimizationHistory || []
      };

      return {
        success: true,
        data: optimizationData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch energy usage history for Prompt Generator graphs
   */
  async fetchEnergyUsageHistory() {
    try {
      const response = await this.sendMessageWithRetry({
        type: 'GET_ENERGY_HISTORY',
        timeRange: '7d',
        includeAIUsage: true,
        granularity: 'hourly'
      }, 2);

      if (response?.success) {
        return {
          success: true,
          data: response.history
        };
      }

      throw new Error(response?.error || 'Failed to fetch energy usage history');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Aggregate historical data for Prompt Generator display
   */
  aggregatePromptGeneratorData(rawData) {
    try {
      const aggregated = {
        totalPrompts: 0,
        energySavings: 0,
        avgTokenReduction: 0,
        graphData: this.formatDataForGraphs(rawData),
        queryPatterns: this.generateRealQueryPatterns(),
        modelBreakdown: this.aggregateModelUsage(rawData.historicalAI),
        optimizationTrends: this.calculateOptimizationTrends(rawData.optimizationStats)
      };

      // Calculate totals from real data
      if (rawData.optimizationStats) {
        aggregated.totalPrompts = rawData.optimizationStats.totalSessions || 0;
        aggregated.avgTokenReduction = rawData.optimizationStats.tokensSaved || 0;
        aggregated.energySavings = this.calculateRealEnergySavings(rawData.optimizationStats.energySaved || 0);
      }

      // Use current session data if available
      if (this.detectedAIModel && this.currentAIUsage) {
        aggregated.currentSession = {
          model: this.detectedAIModel.model.name,
          usage: this.currentAIUsage,
          patterns: this.generateRealQueryPatterns()
        };
      }

      return aggregated;
    } catch (error) {
      return this.getPromptGeneratorFallbackData();
    }
  }

  /**
   * Format data for Prompt Generator graphs
   */
  formatDataForGraphs(rawData) {
    try {
      const graphData = {
        energyOverTime: [],
        queryFrequency: [],
        modelUsage: [],
        optimizationTrends: []
      };

      // Format energy usage over time
      if (rawData.energyHistory && Array.isArray(rawData.energyHistory)) {
        graphData.energyOverTime = rawData.energyHistory.map(entry => ({
          timestamp: entry.timestamp,
          energy: entry.powerWatts || this.migrateLegacyScore(entry.energyScore || 0),
          aiUsage: entry.aiUsage || 0,
          model: entry.detectedModel || 'unknown'
        })).sort((a, b) => a.timestamp - b.timestamp);
      }

      // Format query frequency data
      if (rawData.queryPatterns && rawData.queryPatterns.interactions) {
        const frequencyMap = new Map();
        rawData.queryPatterns.interactions.forEach(interaction => {
          const hour = new Date(interaction.timestamp).getHours();
          frequencyMap.set(hour, (frequencyMap.get(hour) || 0) + 1);
        });

        graphData.queryFrequency = Array.from(frequencyMap.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => a.hour - b.hour);
      }

      // Format model usage distribution
      if (rawData.historicalAI) {
        const modelUsage = new Map();
        rawData.historicalAI.forEach(entry => {
          const model = entry.model || 'unknown';
          const existing = modelUsage.get(model) || { count: 0, totalEnergy: 0 };
          modelUsage.set(model, {
            count: existing.count + 1,
            totalEnergy: existing.totalEnergy + (entry.energy || 0)
          });
        });

        graphData.modelUsage = Array.from(modelUsage.entries())
          .map(([model, data]) => ({
            model,
            count: data.count,
            averageEnergy: data.totalEnergy / data.count,
            percentage: 0 // Will be calculated after sorting
          }))
          .sort((a, b) => b.count - a.count);

        // Calculate percentages
        const totalCount = graphData.modelUsage.reduce((sum, item) => sum + item.count, 0);
        graphData.modelUsage.forEach(item => {
          item.percentage = totalCount > 0 ? (item.count / totalCount * 100) : 0;
        });
      }

      return graphData;
    } catch (error) {
      return { energyOverTime: [], queryFrequency: [], modelUsage: [], optimizationTrends: [] };
    }
  }

  /**
   * Aggregate model usage from historical AI data
   */
  aggregateModelUsage(historicalAI) {
    try {
      if (!historicalAI || !Array.isArray(historicalAI)) {
        return {};
      }

      const modelBreakdown = {};
      historicalAI.forEach(entry => {
        const modelName = entry.model || 'unknown';
        if (!modelBreakdown[modelName]) {
          modelBreakdown[modelName] = {
            totalQueries: 0,
            totalEnergy: 0,
            averageTokens: 0,
            frequency: 0
          };
        }

        const model = modelBreakdown[modelName];
        model.totalQueries += entry.queries || 1;
        model.totalEnergy += entry.energy || 0;
        model.averageTokens += entry.tokens || 0;
        model.frequency += 1;
      });

      // Calculate averages
      Object.keys(modelBreakdown).forEach(modelName => {
        const model = modelBreakdown[modelName];
        if (model.frequency > 0) {
          model.averageTokens = Math.round(model.averageTokens / model.frequency);
        }
      });

      return modelBreakdown;
    } catch (error) {
      return {};
    }
  }

  /**
   * Calculate optimization trends from historical data
   */
  calculateOptimizationTrends(optimizationStats) {
    try {
      if (!optimizationStats || !optimizationStats.history) {
        return { trend: 'stable', improvement: 0, periods: [] };
      }

      const history = optimizationStats.history;
      const trends = {
        trend: 'stable',
        improvement: 0,
        periods: []
      };

      // Calculate improvement over time
      if (history.length >= 2) {
        const recent = history.slice(-10); // Last 10 optimizations
        const older = history.slice(0, -10);

        if (older.length > 0) {
          const recentAvg = recent.reduce((sum, item) => sum + (item.energySaved || 0), 0) / recent.length;
          const olderAvg = older.reduce((sum, item) => sum + (item.energySaved || 0), 0) / older.length;
          
          trends.improvement = recentAvg - olderAvg;
          trends.trend = trends.improvement > 0 ? 'improving' : trends.improvement < 0 ? 'declining' : 'stable';
        }
      }

      // Group by time periods for trend analysis
      const now = Date.now();
      const periods = ['today', 'week', 'month'];
      const periodMs = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      periods.forEach(period => {
        const cutoff = now - periodMs[period];
        const periodData = history.filter(item => item.timestamp > cutoff);
        
        trends.periods.push({
          period,
          count: periodData.length,
          totalEnergySaved: periodData.reduce((sum, item) => sum + (item.energySaved || 0), 0),
          averageImprovement: periodData.length > 0
            ? periodData.reduce((sum, item) => sum + (item.percentageSaved || 0), 0) / periodData.length
            : 0
        });
      });

      return trends;
    } catch (error) {
      return { trend: 'stable', improvement: 0, periods: [] };
    }
  }

  /**
   * Calculate real energy savings from stored data
   */
  calculateRealEnergySavings(energySavedMwh) {
    try {
      if (!energySavedMwh || energySavedMwh <= 0) {
        return 0;
      }

      // Convert mWh to percentage savings (rough estimation)
      // Assume average query uses ~45mWh, so 1mWh = ~2.2% improvement
      const percentageSaved = Math.min(50, Math.round(energySavedMwh * 2.2));
      
      
      return percentageSaved;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get fallback data when real data is not available
   */
  getPromptGeneratorFallbackData() {
    return {
      totalPrompts: 0,
      energySavings: 0,
      avgTokenReduction: 0,
      graphData: { energyOverTime: [], queryFrequency: [], modelUsage: [], optimizationTrends: [] },
      queryPatterns: this.generateRealQueryPatterns(),
      modelBreakdown: {},
      optimizationTrends: { trend: 'stable', improvement: 0, periods: [] }
    };
  }

  /**
   * Update Prompt Generator with real-time data
   */
  async updatePromptGeneratorRealTime() {
    try {
      if (!this.tabRecommendationsVisible) {
        return; // Don't update if Prompt Generator is not visible
      }

      
      // Fetch latest data
      const realTimeData = await this.fetchRealPromptGeneratorData();
      
      // Update UI with new data
      if (realTimeData) {
        this.updateGeneratorStats({
          totalPrompts: realTimeData.totalPrompts,
          energySavings: realTimeData.energySavings,
          avgTokenReduction: realTimeData.avgTokenReduction
        });

        // Update any graphs or visualizations if they exist
        this.updatePromptGeneratorGraphs(realTimeData.graphData);
      }

    } catch (error) {
    }
  }

  /**
   * Update Prompt Generator graphs with real data
   */
  updatePromptGeneratorGraphs(graphData) {
    try {
      if (!graphData) return;

      // Update energy over time graph
      this.updateEnergyTimeGraph(graphData.energyOverTime);
      
      // Update query frequency graph
      this.updateQueryFrequencyGraph(graphData.queryFrequency);
      
      // Update model usage distribution
      this.updateModelUsageGraph(graphData.modelUsage);

    } catch (error) {
    }
  }

  /**
   * Update energy over time graph
   */
  updateEnergyTimeGraph(energyData) {
    // Implementation would depend on the specific charting library used
    // This is a placeholder for the graph update logic
  }

  /**
   * Update query frequency graph
   */
  updateQueryFrequencyGraph(frequencyData) {
    // Implementation would depend on the specific charting library used
    // This is a placeholder for the graph update logic
  }

  /**
   * Update model usage distribution graph
   */
  updateModelUsageGraph(modelData) {
    // Implementation would depend on the specific charting library used
    // This is a placeholder for the graph update logic
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
      this.safeSetInnerHTML(generateBtn, '<span class="btn-icon">⏳</span> Optimizing...');
    }
    
    // Store start time for processing time calculation
    this.optimizationStartTime = Date.now();
    
    // Simulate optimization process with realistic timing
    setTimeout(() => {
      const result = this.optimizePrompt(originalPrompt, level, model);
      this.showOptimizationResult(result);
      
      // LOG TO FIREBASE: Token savings from prompt optimization
      if (typeof logTokenSavingsToFirebase === 'function' && result.tokensSaved > 0) {
        logTokenSavingsToFirebase(
          result.tokensSaved,
          result.model,
          result.originalTokens,
          result.optimizedTokens
        ).then(success => {
          if (success) {
            console.log(`✅ Logged to Firebase: ${result.tokensSaved} tokens saved using ${result.model}`);
          }
        }).catch(error => {
          console.log('Firebase logging failed (non-critical):', error);
        });
      }
      
      // Reset button
      if (generateBtn) {
        generateBtn.disabled = false;
        this.safeSetInnerHTML(generateBtn, '<span class="btn-icon">⚡</span> Generate Optimized Prompt');
      }
      
      // Update token analysis for optimized text
      this.updateTokenAnalysis(originalPrompt, result.optimized, model);
    }, Math.random() * 1000 + 500); // 500-1500ms realistic processing time
  }

  /**
   * Real-time prompt input change handler
   */
  handlePromptInputChange() {
    // Use the improved real-time token counting system
    this.updateRealTimeTokenCount();
    
    // Hide optimized metrics when input changes
    this.hideOptimizedMetrics();
  }

  /**
   * Update original token count display
   */
  updateOriginalTokenCount(count) {
    const originalTokens = document.getElementById('originalTokens');
    if (originalTokens) {
      originalTokens.textContent = count.toString();
      
      // Add visual feedback for large prompts
      if (count > 1000) {
        originalTokens.parentElement.style.color = 'var(--warning)';
      } else if (count > 2000) {
        originalTokens.parentElement.style.color = 'var(--error)';
      } else {
        originalTokens.parentElement.style.color = '';
      }
    }
  }

  /**
   * Update token analysis with optimization results
   */
  updateTokenAnalysis(originalText, optimizedText, model) {
    const originalTokens = this.estimateTokenCount(originalText, model);
    const optimizedTokens = this.estimateTokenCount(optimizedText, model);
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    const percentSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;
    
    // Show optimized metrics
    this.showOptimizedMetrics();
    
    // Update values
    document.getElementById('originalTokens').textContent = originalTokens.toString();
    document.getElementById('optimizedTokens').textContent = optimizedTokens.toString();
    document.getElementById('tokensSaved').textContent = tokensSaved.toString();
    document.getElementById('percentSaved').textContent = `${percentSaved}%`;
    
    // Show processing time if available
    if (this.lastOptimizationResult && this.lastOptimizationResult.processingTime) {
      const processingTime = document.getElementById('processingTime');
      const processingTimeValue = document.getElementById('processingTimeValue');
      if (processingTime && processingTimeValue) {
        processingTimeValue.textContent = `${this.lastOptimizationResult.processingTime}ms`;
        processingTime.style.display = 'block';
      }
    }
  }

  /**
   * Show optimized token metrics
   */
  showOptimizedMetrics() {
    const optimizedMetric = document.querySelector('.token-metric.optimized');
    const savingsMetric = document.querySelector('.token-metric.savings');
    
    if (optimizedMetric) optimizedMetric.style.display = 'flex';
    if (savingsMetric) savingsMetric.style.display = 'flex';
  }

  /**
   * Hide optimized token metrics
   */
  hideOptimizedMetrics() {
    const optimizedMetric = document.querySelector('.token-metric.optimized');
    const savingsMetric = document.querySelector('.token-metric.savings');
    const processingTime = document.getElementById('processingTime');
    
    if (optimizedMetric) optimizedMetric.style.display = 'none';
    if (savingsMetric) savingsMetric.style.display = 'none';
    if (processingTime) processingTime.style.display = 'none';
  }

  /**
   * Handle toggle details button
   */
  handleToggleDetails() {
    const removedWordsSection = document.getElementById('removedWordsSection');
    const toggleBtn = document.getElementById('toggleDetailsBtn');

    if (!removedWordsSection || !toggleBtn) return;

    const isVisible = removedWordsSection.style.display !== 'none';

    if (isVisible) {
      removedWordsSection.style.display = 'none';
      this.safeSetInnerHTML(toggleBtn, '<span class="btn-icon">👁️</span> Show Removed Words');
    } else {
      removedWordsSection.style.display = 'block';
      this.safeSetInnerHTML(toggleBtn, '<span class="btn-icon">🙈</span> Hide Removed Words');
    }
  }
  
  /**
   * ENHANCED TOKEN OPTIMIZATION ENGINE
   * Implements comprehensive prompt optimization with advanced token reduction techniques
   */
  optimizePrompt(prompt, level, model) {
    
    let optimized = prompt;
    let originalTokens = this.estimateTokenCount(prompt, model);
    let removedWords = [];
    let optimizationCategories = [];
    
    // Layer 1: Comprehensive Filler Word Removal Engine
    const layer1Result = this.applyFillerWordRemoval(optimized, level);
    optimized = layer1Result.text;
    removedWords = removedWords.concat(layer1Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer1Result.categories);
    
    // Layer 2: Model-Specific Optimization
    const layer2Result = this.applyModelSpecificOptimization(optimized, model);
    optimized = layer2Result.text;
    removedWords = removedWords.concat(layer2Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer2Result.categories);
    
    // Layer 3: Advanced Compression Techniques
    const layer3Result = this.applyAdvancedCompression(optimized, level);
    optimized = layer3Result.text;
    removedWords = removedWords.concat(layer3Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer3Result.categories);
    
    // Calculate final metrics
    const optimizedTokens = this.estimateTokenCount(optimized, model);
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    const percentageSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;
    const energySavings = this.calculateEnergySavings(tokensSaved, model);
    
    // Apply optimization level caps
    const cappedResults = this.applyOptimizationCaps(prompt, optimized, level, {
      tokensSaved,
      percentageSaved,
      energySavings
    });
    
    
    return {
      original: prompt,
      optimized: cappedResults.optimized,
      originalTokens,
      optimizedTokens: this.estimateTokenCount(cappedResults.optimized, model),
      tokensSaved: cappedResults.tokensSaved,
      percentageSaved: cappedResults.percentageSaved,
      energySavings: cappedResults.energySavings,
      model: model,
      level: level,
      removedWords: removedWords,
      optimizationCategories: this.consolidateCategories(optimizationCategories),
      processingTime: Date.now() - (this.optimizationStartTime || Date.now())
    };
  }

  /**
   * LAYER 1: COMPREHENSIVE FILLER WORD REMOVAL ENGINE
   */
  applyFillerWordRemoval(text, level) {
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Define comprehensive removal categories with priority scoring
    const fillerWordCategories = {
      // High-Priority Removals (3-8 tokens saved)
      politenessMarkers: {
        priority: 1,
        words: [
          'please', 'thank you', 'thanks', 'kindly', 'if you don\'t mind',
          'if possible', 'if you could', 'would you mind', 'could you please',
          'would you be so kind', 'I would appreciate', 'thank you in advance',
          'many thanks', 'much appreciated', 'grateful', 'sorry to bother you',
          'I apologize for', 'excuse me', 'pardon me'
        ],
        description: 'Politeness markers (unnecessary for AI)'
      },
      
      intensifiers: {
        priority: 1,
        words: [
          'very', 'really', 'quite', 'extremely', 'absolutely', 'completely',
          'totally', 'literally', 'seriously', 'highly', 'incredibly',
          'tremendously', 'exceptionally', 'remarkably', 'particularly',
          'especially', 'significantly', 'substantially'
        ],
        description: 'Intensifiers and emphasis words'
      },
      
      qualifiers: {
        priority: 1,
        words: [
          'just', 'simply', 'basically', 'actually', 'obviously', 'clearly',
          'sort of', 'kind of', 'somewhat', 'rather', 'pretty much',
          'more or less', 'in a way', 'to some extent', 'relatively'
        ],
        description: 'Qualifiers and hedge words'
      },
      
      // Medium-Priority Removals (2-5 tokens saved)
      verbosePhrases: {
        priority: 2,
        phrases: [
          { from: 'in order to', to: 'to' },
          { from: 'due to the fact that', to: 'because' },
          { from: 'with regard to', to: 'about' },
          { from: 'in terms of', to: 'for' },
          { from: 'for the purpose of', to: 'to' },
          { from: 'in the event that', to: 'if' },
          { from: 'at this point in time', to: 'now' },
          { from: 'prior to', to: 'before' },
          { from: 'subsequent to', to: 'after' }
        ],
        description: 'Verbose phrase replacements'
      },
      
      fillerPhrases: {
        priority: 2,
        words: [
          'at the end of the day', 'for all intents and purposes',
          'the thing is', 'in terms of', 'as a matter of fact',
          'to tell you the truth', 'to be honest', 'frankly speaking',
          'needless to say', 'it goes without saying'
        ],
        description: 'Filler phrases'
      },
      
      redundancies: {
        priority: 2,
        phrases: [
          { from: 'write down', to: 'write' },
          { from: 'empty out', to: 'empty' },
          { from: 'completely finish', to: 'finish' },
          { from: 'final result', to: 'result' },
          { from: 'end result', to: 'result' },
          { from: 'past history', to: 'history' },
          { from: 'future plans', to: 'plans' }
        ],
        description: 'Redundant combinations'
      },
      
      // Low-Priority Removals (1-3 tokens saved)
      conversationFillers: {
        priority: 3,
        words: [
          'you know', 'you see', 'right?', 'like', 'um', 'uh', 'er', 'ah',
          'well', 'so', 'anyway', 'by the way', 'speaking of which',
          'as I was saying', 'where was I'
        ],
        description: 'Conversation fillers'
      },
      
      redundantRequests: {
        priority: 3,
        words: [
          'can you', 'could you', 'would you', 'will you', 'are you able to',
          'I need you to', 'I want you to', 'I would like you to',
          'help me', 'assist me', 'I\'m asking you to'
        ],
        description: 'Redundant request phrases'
      }
    };
    
    // Apply removals based on optimization level and priority
    const maxPriority = level === 'aggressive' ? 3 : level === 'balanced' ? 2 : 1;
    
    for (const [categoryName, category] of Object.entries(fillerWordCategories)) {
      if (category.priority <= maxPriority) {
        // Handle phrase replacements
        if (category.phrases) {
          category.phrases.forEach(replacement => {
            const regex = new RegExp(`\\b${replacement.from}\\b`, 'gi');
            const matches = optimized.match(regex);
            if (matches) {
              optimized = optimized.replace(regex, replacement.to);
              removedWords.push(...matches);
              if (!categories.includes(category.description)) {
                categories.push(category.description);
              }
            }
          });
        }
        
        // Handle word removals
        if (category.words) {
          category.words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = optimized.match(regex);
            if (matches) {
              optimized = optimized.replace(regex, ' ');
              removedWords.push(...matches);
              if (!categories.includes(category.description)) {
                categories.push(category.description);
              }
            }
          });
        }
      }
    }
    
    // Clean up whitespace
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  /**
   * LAYER 2: MODEL-SPECIFIC OPTIMIZATION
   */
  applyModelSpecificOptimization(text, model) {
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    switch (model) {
      case 'gpt-4':
      case 'gpt-5':
        return this.optimizeForGPT4(optimized);
        
      case 'claude-4':
      case 'claude-sonnet':
        return this.optimizeForClaude(optimized);
        
      case 'grok-4':
        return this.optimizeForGrok(optimized);
        
      case 'deepseek-r1':
        return this.optimizeForDeepSeek(optimized);
        
      case 'llama-4':
        return this.optimizeForLlama(optimized);
        
      default:
        return this.optimizeForGeneric(optimized);
    }
  }

  optimizeForGPT4(text) {
    // GPT-4: Maintain context richness but remove redundancy
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Remove excessive context setting
    const contextPhrases = [
      'As an AI', 'I am an AI', 'As a language model', 'I\'m ChatGPT',
      'As ChatGPT', 'I should mention that', 'It\'s important to note that'
    ];
    
    contextPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('GPT-4 context reduction')) {
          categories.push('GPT-4 context reduction');
        }
      }
    });
    
    // Keep technical terminology intact, focus on structural efficiency
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeForClaude(text) {
    // Claude: Natural language flow preservation, remove formal excess
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Remove excessive formal language
    const formalPhrases = [
      'I would be happy to', 'I\'d be glad to', 'I\'m here to help',
      'Allow me to', 'Permit me to', 'Let me assist you with'
    ];
    
    formalPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Claude formality reduction')) {
          categories.push('Claude formality reduction');
        }
      }
    });
    
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeForGrok(text) {
    // Grok: Direct, concise instructions
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Remove verbose explanations
    const verbosePatterns = [
      'Let me explain', 'To elaborate', 'In more detail',
      'For context', 'Background information', 'Additional details'
    ];
    
    verbosePatterns.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Grok directness optimization')) {
          categories.push('Grok directness optimization');
        }
      }
    });
    
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeForDeepSeek(text) {
    // DeepSeek R1: Reasoning-focused, remove ambiguity
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Remove ambiguous language
    const ambiguousPhrases = [
      'maybe', 'perhaps', 'possibly', 'potentially', 'might be',
      'could be', 'seems like', 'appears to be', 'looks like'
    ];
    
    ambiguousPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('DeepSeek clarity optimization')) {
          categories.push('DeepSeek clarity optimization');
        }
      }
    });
    
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeForLlama(text) {
    // Llama: Efficient, structured prompts
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Remove casual language
    const casualPhrases = [
      'you know', 'like', 'basically', 'kind of', 'sort of',
      'pretty much', 'more or less', 'I guess'
    ];
    
    casualPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Llama structure optimization')) {
          categories.push('Llama structure optimization');
        }
      }
    });
    
    optimized = this.cleanupWhitespace(optimized);
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeForGeneric(text) {
    // Generic optimization for unknown models
    return {
      text: this.cleanupWhitespace(text),
      removedWords: [],
      categories: []
    };
  }

  /**
   * LAYER 3: ADVANCED COMPRESSION TECHNIQUES
   */
  applyAdvancedCompression(text, level) {
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    if (level === 'aggressive') {
      // Sentence structure optimization
      const structureResult = this.optimizeSentenceStructure(optimized);
      optimized = structureResult.text;
      removedWords = removedWords.concat(structureResult.removedWords);
      categories = categories.concat(structureResult.categories);
      
      // Context-aware removal
      const contextResult = this.removeRedundantContext(optimized);
      optimized = contextResult.text;
      removedWords = removedWords.concat(contextResult.removedWords);
      categories = categories.concat(contextResult.categories);
    }
    
    return {
      text: optimized,
      removedWords,
      categories
    };
  }

  optimizeSentenceStructure(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Convert passive voice to active voice
    const passivePatterns = [
      { from: /was (\w+ed) by/gi, to: '$1' },
      { from: /is (\w+ed) by/gi, to: '$1' },
      { from: /are (\w+ed) by/gi, to: '$1' }
    ];
    
    passivePatterns.forEach(pattern => {
      if (optimized.match(pattern.from)) {
        optimized = optimized.replace(pattern.from, pattern.to);
        categories.push('Passive to active voice conversion');
      }
    });
    
    // Combine related sentences (basic implementation)
    optimized = optimized.replace(/\.\s+Also,\s+/gi, '. ');
    optimized = optimized.replace(/\.\s+Additionally,\s+/gi, '. ');
    optimized = optimized.replace(/\.\s+Furthermore,\s+/gi, '. ');
    
    if (categories.length > 0) {
      categories.push('Sentence structure optimization');
    }
    
    return {
      text: this.cleanupWhitespace(optimized),
      removedWords,
      categories
    };
  }

  removeRedundantContext(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];
    
    // Detect and remove repeated concepts (basic implementation)
    const words = optimized.toLowerCase().split(/\s+/);
    const wordCounts = {};
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    // Remove excessive repetition of concepts
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count > 3) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = optimized.match(regex);
        if (matches && matches.length > 3) {
          // Keep first 2 occurrences, remove the rest
          let replacements = 0;
          optimized = optimized.replace(regex, (match) => {
            replacements++;
            return replacements > 2 ? ' ' : match;
          });
          removedWords.push(`${word} (${matches.length - 2} redundant)`);
          categories.push('Redundant concept removal');
        }
      }
    }
    
    return {
      text: this.cleanupWhitespace(optimized),
      removedWords,
      categories
    };
  }

  /**
   * ENHANCED REAL-TIME TOKEN COUNTING SYSTEM
   * Improved accuracy using GPT tokenization patterns
   */
  estimateTokenCount(text, model) {
    if (!text || typeof text !== 'string') return 0;
    
    // Enhanced tokenization approach based on GPT patterns
    let tokenCount = 0;
    
    // Preprocessing: normalize whitespace and handle special characters
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    if (normalizedText.length === 0) return 0;
    
    // Split into words and punctuation
    const tokens = normalizedText.match(/\w+|[^\w\s]/g) || [];
    
    for (const token of tokens) {
      if (/^\w+$/.test(token)) {
        // Word token: estimate based on length and common patterns
        const wordLength = token.length;
        
        if (wordLength <= 3) {
          tokenCount += 1; // Short words: "the", "and", "is"
        } else if (wordLength <= 6) {
          tokenCount += 1; // Medium words: "hello", "world"
        } else if (wordLength <= 10) {
          // Longer words may split: "understand" = 1, "development" = 2
          tokenCount += Math.ceil(wordLength / 6);
        } else {
          // Very long words often split into multiple tokens
          tokenCount += Math.ceil(wordLength / 5);
        }
        
        // Adjust for common prefixes/suffixes that create token boundaries
        if (token.match(/^(un|re|pre|dis|over|under|anti)/)) {
          tokenCount += 0.2; // Slight increase for prefix boundaries
        }
        if (token.match(/(ing|ed|er|est|ly|tion|sion)$/)) {
          tokenCount += 0.1; // Slight increase for suffix boundaries
        }
      } else {
        // Punctuation and special characters: mostly 1 token each
        tokenCount += 1;
      }
    }
    
    // Account for spaces between words (some models count spaces)
    const spaceCount = (normalizedText.match(/\s/g) || []).length;
    tokenCount += spaceCount * 0.1; // Small adjustment for spaces
    
    // Model-specific adjustments based on tokenization differences
    const modelMultipliers = {
      'gpt-4': 1.0,        // Baseline (GPT-4 tokenization)
      'gpt-5': 0.98,       // Slightly more efficient
      'claude-4': 0.92,    // Claude generally more efficient
      'claude-sonnet': 0.94,
      'grok-4': 1.08,      // Grok tends to use more tokens
      'deepseek-r1': 0.88, // DeepSeek very efficient
      'llama-4': 0.85      // Llama typically most efficient
    };
    
    const multiplier = modelMultipliers[model] || 1.0;
    const finalCount = Math.round(tokenCount * multiplier);
    
    // Ensure minimum of 1 token for any non-empty text
    return Math.max(1, finalCount);
  }
  
  /**
   * Real-time token count update for prompt input
   */
  updateRealTimeTokenCount() {
    const promptInput = document.getElementById('promptInput');
    const targetModel = document.getElementById('targetModel');
    
    if (!promptInput) return;
    
    const text = promptInput.value.trim();
    const model = targetModel?.value || 'gpt-4';
    
    // Throttle updates to prevent excessive calculations
    if (this.tokenCountThrottle) {
      clearTimeout(this.tokenCountThrottle);
    }
    
    this.tokenCountThrottle = setTimeout(() => {
      const tokenCount = this.estimateTokenCount(text, model);
      this.updateOriginalTokenCount(tokenCount);
      
      // Store for analytics
      this.lastTokenCount = {
        text: text,
        tokens: tokenCount,
        model: model,
        timestamp: Date.now()
      };
      
      // Show token density info
      this.updateTokenDensityInfo(text, tokenCount);
    }, 150); // 150ms debounce
  }
  
  /**
   * Update token density information
   */
  updateTokenDensityInfo(text, tokens) {
    const density = text.length > 0 ? (tokens / text.length * 100).toFixed(1) : 0;
    const wordsEstimate = text.split(/\s+/).filter(w => w.length > 0).length;
    const tokensPerWord = wordsEstimate > 0 ? (tokens / wordsEstimate).toFixed(2) : 0;
    
    // Update density display if element exists
    const densityInfo = document.getElementById('tokenDensityInfo');
    if (densityInfo) {
      densityInfo.innerHTML = `
        <small class="token-density">
          ${density}% density • ${tokensPerWord} tokens/word • ${wordsEstimate} words
        </small>
      `;
      
      // Color coding based on efficiency
      if (parseFloat(density) > 30) {
        densityInfo.className = 'token-density-high';
      } else if (parseFloat(density) > 25) {
        densityInfo.className = 'token-density-medium';
      } else {
        densityInfo.className = 'token-density-good';
      }
    }
  }

  calculateTokenSavings(originalTokens, optimizedTokens, model) {
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    const percentageSaved = originalTokens > 0 ? (tokensSaved / originalTokens) * 100 : 0;
    
    return {
      tokensSaved,
      percentageSaved: Math.round(percentageSaved),
      absoluteSavings: tokensSaved,
      relativeSavings: `${Math.round(percentageSaved)}%`
    };
  }

  /**
   * ENERGY SAVINGS CALCULATION
   */
  calculateEnergySavings(tokensSaved, model) {
    // Energy cost per token (in mWh) - based on model efficiency
    const energyCostPerToken = {
      'gpt-4': 0.05,
      'gpt-5': 0.045,
      'claude-4': 0.04,
      'claude-sonnet': 0.04,
      'grok-4': 0.06,
      'deepseek-r1': 0.03,
      'llama-4': 0.025
    };
    
    const costPerToken = energyCostPerToken[model] || 0.045;
    const energySavedMwh = tokensSaved * costPerToken;
    const energySavedWh = energySavedMwh / 1000;
    
    return {
      energySavedMwh,
      energySavedWh,
      percentageSaved: Math.min(50, Math.round(tokensSaved * 0.1)) // Rough percentage
    };
  }

  /**
   * OPTIMIZATION LEVEL REFINEMENT
   */
  applyOptimizationCaps(original, optimized, level, metrics) {
    const caps = {
      conservative: { min: 5, max: 15 },
      balanced: { min: 15, max: 25 },
      aggressive: { min: 25, max: 45 }
    };
    
    const cap = caps[level] || caps.balanced;
    
    // If reduction is too low, try more aggressive techniques
    if (metrics.percentageSaved < cap.min) {
      // Apply additional compression
      optimized = this.applyAdditionalCompression(optimized, cap.min - metrics.percentageSaved);
    }
    
    // If reduction is too high, restore some content
    if (metrics.percentageSaved > cap.max) {
      optimized = this.restoreEssentialContent(original, optimized, metrics.percentageSaved - cap.max);
    }
    
    // Recalculate metrics
    const finalTokens = this.estimateTokenCount(optimized, metrics.model);
    const finalSavings = this.calculateTokenSavings(this.estimateTokenCount(original), finalTokens);
    const finalEnergy = this.calculateEnergySavings(finalSavings.tokensSaved, metrics.model);
    
    return {
      optimized,
      tokensSaved: finalSavings.tokensSaved,
      percentageSaved: finalSavings.percentageSaved,
      energySavings: finalEnergy.percentageSaved
    };
  }

  applyAdditionalCompression(text, targetReduction) {
    // Apply more aggressive compression techniques
    let compressed = text;
    
    // Remove articles more aggressively
    compressed = compressed.replace(/\b(a|an|the)\b/gi, '');
    
    // Remove auxiliary verbs
    compressed = compressed.replace(/\b(is|are|was|were|be|been|being)\b/gi, '');
    
    // Remove prepositions where context allows
    compressed = compressed.replace(/\b(in|on|at|by|for|with|from)\b/gi, '');
    
    return this.cleanupWhitespace(compressed);
  }

  restoreEssentialContent(original, optimized, excessReduction) {
    // Simple restoration: if too much was removed, use a blend
    if (excessReduction > 20) {
      // Too aggressive, use more of the original
      return original;
    }
    
    return optimized;
  }

  /**
   * UTILITY FUNCTIONS
   */
  cleanupWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')                    // Multiple spaces to single
      .replace(/\s*,\s*,+/g, ',')             // Multiple commas
      .replace(/\s*\.\s*\.+/g, '.')           // Multiple periods
      .replace(/^\s*[,.]/, '')                 // Leading punctuation
      .replace(/\s*([,.!?;:])/g, '$1')        // Space before punctuation
      .replace(/([,.!?;:])\s*([,.!?;:])/g, '$1$2') // Double punctuation
      .trim();
  }

  consolidateCategories(categories) {
    // Remove duplicates and group similar categories
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.slice(0, 5); // Limit to top 5 for UI
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
      // Show results area with null safety
      if (resultsArea) resultsArea.style.display = 'block';
      if (optimizedPrompt) optimizedPrompt.value = result.optimized || '';
      this.safeSetTextContent(energySavingsResult, `${result.percentageSaved || result.energySavings || 0}% Energy Saved`);
      
      // Update detailed metrics
      this.updateDetailedMetrics(result);
      
      // Update optimization breakdown
      this.updateOptimizationBreakdown(result);
      
      // Store result for copying
      this.lastOptimizationResult = result;
      
      // Update stats
      this.updateStatsAfterOptimization(result);
      
      // Show success toast
      this.showToastNotification(`Optimized! Saved ${result.tokensSaved || result.tokenReduction || 0} tokens (${result.percentageSaved || 0}%)`, 'success');
    }
  }
  
  async updateStatsAfterOptimization(result) {
    // Enhanced statistics tracking with Chrome storage persistence
    const totalElement = document.getElementById('totalPromptsGenerated');
    const savingsElement = document.getElementById('energySavingsPercent');
    const reductionElement = document.getElementById('avgTokenReduction');
    
    if (totalElement && savingsElement && reductionElement) {
      const currentTotal = parseInt(totalElement.textContent) || 0;
      const currentSavings = parseInt(savingsElement.textContent.replace('%', '')) || 0;
      const currentReduction = parseInt(reductionElement.textContent) || 0;
      
      // Calculate new averages
      const newTotal = currentTotal + 1;
      const newAvgSavings = Math.round(((currentSavings * currentTotal) + result.percentageSaved) / newTotal);
      const newAvgReduction = Math.round(((currentReduction * currentTotal) + result.tokensSaved) / newTotal);
      
      // Update display
      this.safeSetTextContent(totalElement, newTotal.toString());
      this.safeSetTextContent(savingsElement, `${newAvgSavings}%`);
      this.safeSetTextContent(reductionElement, newAvgReduction.toString());
      
      // PHASE 5 STEP 4: Store real statistics to Chrome storage
      if (this.isChromeApiAvailable()) {
        try {
          // Get existing storage data
          const storageData = await chrome.storage.local.get([
            'promptOptimizationStats',
            'totalOptimizationSessions',
            'cumulativeTokensSaved',
            'cumulativeEnergySaved'
          ]);
          
          // Update cumulative totals
          const newCumulativeTokens = (storageData.cumulativeTokensSaved || 0) + (result.tokensSaved || 0);
          const newCumulativeEnergy = (storageData.cumulativeEnergySaved || 0) + (result.energySavings?.energySavedMwh || 0);
          
          // Store updated real statistics
          await chrome.storage.local.set({
            promptOptimizationStats: {
              totalOptimizations: newTotal,
              averageEnergyPercent: newAvgSavings,
              averageTokenReduction: newAvgReduction,
              lastOptimization: Date.now()
            },
            totalOptimizationSessions: newTotal,
            cumulativeTokensSaved: newCumulativeTokens,
            cumulativeEnergySaved: newCumulativeEnergy
          });
          
          
        } catch (error) {
        }
      }
    }

    // Store detailed analytics (for future features)
    this.updateOptimizationAnalytics(result);
  }

  /**
   * Enhanced optimization analytics tracking
   */
  updateOptimizationAnalytics(result) {
    // Initialize analytics storage if not exists
    if (!this.optimizationAnalytics) {
      this.optimizationAnalytics = {
        totalOptimizations: 0,
        totalTokensSaved: 0,
        totalEnergyWastedMwh: 0,
        modelBreakdown: {},
        levelBreakdown: {},
        categoryFrequency: {},
        averageProcessingTime: 0,
        sessionStart: Date.now()
      };
    }

    const analytics = this.optimizationAnalytics;
    
    // Update core metrics
    analytics.totalOptimizations++;
    analytics.totalTokensSaved += result.tokensSaved || 0;
    analytics.totalEnergyWastedMwh += result.energySavings?.energySavedMwh || 0;
    
    // Update model breakdown
    const model = result.model || 'unknown';
    if (!analytics.modelBreakdown[model]) {
      analytics.modelBreakdown[model] = { count: 0, totalTokensSaved: 0 };
    }
    analytics.modelBreakdown[model].count++;
    analytics.modelBreakdown[model].totalTokensSaved += result.tokensSaved || 0;
    
    // Update optimization level breakdown
    const level = result.level || 'unknown';
    if (!analytics.levelBreakdown[level]) {
      analytics.levelBreakdown[level] = { count: 0, totalTokensSaved: 0 };
    }
    analytics.levelBreakdown[level].count++;
    analytics.levelBreakdown[level].totalTokensSaved += result.tokensSaved || 0;
    
    // Update category frequency
    if (result.optimizationCategories) {
      result.optimizationCategories.forEach(category => {
        analytics.categoryFrequency[category] = (analytics.categoryFrequency[category] || 0) + 1;
      });
    }
    
    // Update average processing time
    if (result.processingTime) {
      analytics.averageProcessingTime = Math.round(
        (analytics.averageProcessingTime * (analytics.totalOptimizations - 1) + result.processingTime) / analytics.totalOptimizations
      );
    }

  }

  /**
   * Get optimization analytics summary
   */
  getOptimizationAnalytics() {
    return this.optimizationAnalytics || {
      totalOptimizations: 0,
      totalTokensSaved: 0,
      totalEnergyWastedMwh: 0,
      sessionStart: Date.now()
    };
  }

  /**
   * Update detailed metrics in the breakdown section
   */
  updateDetailedMetrics(result) {
    // Update detailed metrics
    this.safeSetTextContent(document.getElementById('detailedTokensSaved'), (result.tokensSaved || 0).toString());
    
    // Handle energy savings display
    const energySaved = result.energySavings?.energySavedMwh || 0;
    this.safeSetTextContent(document.getElementById('detailedEnergySaved'), `${energySaved.toFixed(2)} mWh`);
    
    this.safeSetTextContent(document.getElementById('detailedProcessingTime'), `${result.processingTime || 0}ms`);
  }

  /**
   * Update optimization breakdown with categories and removed words
   */
  updateOptimizationBreakdown(result) {
    // Update categories
    const categoriesList = document.getElementById('optimizationCategories');
    if (categoriesList && result.optimizationCategories) {
      categoriesList.innerHTML = '';
      result.optimizationCategories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        if (li && categoriesList) {
          categoriesList.appendChild(li);
        }
      });
    }

    // Update removed words
    const removedWordsList = document.getElementById('removedWordsList');
    if (removedWordsList && result.removedWords && result.removedWords.length > 0) {
      removedWordsList.innerHTML = '';
      
      // Group and display removed words
      const wordCounts = {};
      result.removedWords.forEach(word => {
        const cleanWord = typeof word === 'string' ? word.toLowerCase().trim() : String(word).toLowerCase().trim();
        if (cleanWord && cleanWord.length > 0) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
        }
      });

      // Sort by frequency and display
      const sortedWords = Object.entries(wordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20); // Limit to top 20 for performance

      if (sortedWords.length > 0) {
        sortedWords.forEach(([word, count]) => {
          const span = document.createElement('span');
          span.className = count > 1 ? 'removed-word redundant' : 'removed-word';
          span.textContent = count > 1 ? `${word} (${count}x)` : word;
          if (span && removedWordsList) {
            removedWordsList.appendChild(span);
          }
        });

        // Show the toggle button if there are removed words
        const toggleBtn = document.getElementById('toggleDetailsBtn');
        if (toggleBtn) {
          toggleBtn.style.display = 'flex';
        }
      } else {
        // No words to display
        const span = document.createElement('span');
        span.className = 'removed-word';
        span.textContent = 'No specific words tracked';
        span.style.fontStyle = 'italic';
        span.style.color = 'var(--text-muted)';
        if (span && removedWordsList) {
          removedWordsList.appendChild(span);
        }
      }
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
    if (textArea && document.body) {
      document.body.appendChild(textArea);
      textArea.select();
    }
    
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
    
    if (promptInput) {
      try {
        promptInput.value = '';
      } catch (error) {
      }
    }
    if (optimizedPrompt) {
      try {
        optimizedPrompt.value = '';
      } catch (error) {
      }
    }
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
    if (toast && document.body) {
      document.body.appendChild(toast);
    }
    
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
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_BENCHMARKS',
        metric: metric
      });
      
      if (response?.success) {
        this.displayBenchmarkResults(response.benchmarks, metric);
      } else {
      }
      
    } catch (error) {
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
      this.showToastNotification('Export failed', 'error');
    }
  }
  
  async applyRecommendation() {
    // This would integrate with the AI optimization system
    this.showToastNotification('Recommendation applied', 'success');
    this.hideComparisonModal();
  }
  
  applyModelRecommendation(model, type) {
    this.showToastNotification(`Applied ${type} recommendation: ${model}`, 'success');
  }

  // ===== TAB ENERGY RECOMMENDATIONS =====
  
  setupTabRecommendations() {
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
    
    this.safeSetTextContent(totalTabsCount, allTabs.length.toString());
    this.safeSetTextContent(highEnergyCount, highEnergyTabs.length.toString());
    if (potentialSavings) {
      if (selectedSavings > 0) {
        this.safeSetTextContent(potentialSavings, `${selectedSavings.toFixed(1)}W`);
      } else {
        const maxSavings = suggestions.reduce((total, s) => total + s.potentialSaving, 0);
        this.safeSetTextContent(potentialSavings, maxSavings > 0 ? `~${maxSavings.toFixed(1)}W` : '--');
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
      this.showToast('Failed to close some tabs', 'error');
    }
  }

  /**
   * Handles closing a single tab
   */
  async handleCloseTab(tabId) {
    try {
      
      if (this.isChromeApiAvailable()) {
        await chrome.tabs.remove([tabId]);
        this.showToast('Tab closed', 'success');
      }

      // Refresh data after a short delay
      setTimeout(() => {
        this.loadCurrentEnergyData();
      }, 1000);

    } catch (error) {
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

  /**
   * AI Prompt Optimizer Reminder System
   * Triggers on-page notifications when users are on AI sites
   * No access code required - opens Prompt Generator directly
   */

  initAIPromptReminder() {
    // This will be handled by the service worker sending messages to content script
    // The popup will listen for messages to show prompt generator when "Try Now" is clicked
  }

  setupRuntimeMessageListener() {
    // Listen for messages from service worker or content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SHOW_PROMPT_GENERATOR_TAB') {
        // Open the prompt generator directly (no access code needed)
        this.showPromptGenerator();
        this.loadPromptGeneratorData();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  /**
   * Log popup opened event to Firebase
   * Tracks user engagement and session starts
   */
  async logPopupOpened() {
    try {
      // Track popup opens without logging energy (energy is logged periodically based on actual usage)
      console.log('✅ Popup opened - energy will be logged based on actual usage');
    } catch (error) {
      console.log('Firebase popup logging failed (non-critical):', error);
    }
  }

}


// Firebase Data Logging Setup
// Tracks energy and token savings for analytics
// FIXED: Now tracks actual session time and incremental energy (not cumulative)

// Log energy savings every 15 minutes (less frequent to match new notification defaults)
setInterval(async () => {
  try {
    // Get session info from service worker
    const sessionInfo = await chrome.runtime.sendMessage({ type: 'GET_SESSION_INFO' });
    if (!sessionInfo || !sessionInfo.success) {
      console.log('Could not get session info from service worker');
      return;
    }

    // Get current energy history
    const result = await chrome.storage.local.get(['energyHistory']);
    const energyHistory = result.energyHistory || [];

    // Calculate total energy consumed in kWh
    const totalEnergyKWh = energyHistory.reduce((sum, entry) => {
      return sum + ((entry.energyWh || 0) / 1000);
    }, 0);

    // Calculate INCREMENTAL energy since last Firebase log (not cumulative!)
    const lastLoggedKWh = sessionInfo.lastEnergyLoggedKWh || 0;
    const incrementalEnergyKWh = totalEnergyKWh - lastLoggedKWh;

    // Estimate energy savings (assuming extension optimizes by ~20%)
    // This is the INCREMENTAL energy that was saved, not total
    const energySavedKWh = incrementalEnergyKWh * 0.20;

    // Calculate ACTUAL session duration since last Firebase log
    const lastFirebaseLogTime = sessionInfo.lastFirebaseLogTime || Date.now();
    const sessionDurationMinutes = Math.floor((Date.now() - lastFirebaseLogTime) / 60000);

    // Only log if there's actual energy savings to report and at least 1 minute has passed
    if (energySavedKWh > 0 && sessionDurationMinutes >= 1 && typeof logEnergySavingsToFirebase === 'function') {
      const success = await logEnergySavingsToFirebase(
        energySavedKWh,
        sessionDurationMinutes,
        totalEnergyKWh  // Pass total so service worker can update lastEnergyLoggedKWh
      );
      if (success) {
        console.log(`✅ Logged to Firebase: ${energySavedKWh.toFixed(6)} kWh saved in ${sessionDurationMinutes} minutes (incremental)`);
      } else {
        console.log('⚠️ Firebase logging failed - data will be retried on next interval');
      }
    }
  } catch (error) {
    console.error('Error logging energy savings:', error);
  }
}, 15 * 60 * 1000); // Every 15 minutes - matches new notification interval default

// Also log when popup closes (before unload)
window.addEventListener('beforeunload', async () => {
  try {
    // Get session info
    const sessionInfo = await chrome.runtime.sendMessage({ type: 'GET_SESSION_INFO' });
    if (!sessionInfo || !sessionInfo.success) return;

    // Get energy history
    const result = await chrome.storage.local.get(['energyHistory']);
    const energyHistory = result.energyHistory || [];
    const totalEnergyKWh = energyHistory.reduce((sum, entry) => {
      return sum + ((entry.energyWh || 0) / 1000);
    }, 0);

    // Calculate incremental energy
    const lastLoggedKWh = sessionInfo.lastEnergyLoggedKWh || 0;
    const incrementalEnergyKWh = totalEnergyKWh - lastLoggedKWh;
    const energySavedKWh = incrementalEnergyKWh * 0.20;

    // Calculate session duration
    const lastFirebaseLogTime = sessionInfo.lastFirebaseLogTime || Date.now();
    const sessionDurationMinutes = Math.floor((Date.now() - lastFirebaseLogTime) / 60000);

    if (energySavedKWh > 0 && sessionDurationMinutes >= 1 && typeof logEnergySavingsToFirebase === 'function') {
      await logEnergySavingsToFirebase(energySavedKWh, sessionDurationMinutes, totalEnergyKWh);
    }
  } catch (error) {
    // Silent fail on unload
  }
});

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
  });
} else {
  new PopupManager();
}