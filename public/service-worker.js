// background/service-worker.js
// EnergyTrackingApp — Manifest V3 service worker
// Robust against restarts, handles async sendResponse correctly, and
// never crashes the content script if the SW gets reloaded.

// Suppress non-critical errors
self.addEventListener('error', (event) => {
  // Suppress common non-critical service worker errors
  if (event.message && (
    event.message.includes('No SW') ||
    event.message.includes('Could not establish connection') ||
    event.message.includes('Extension context invalidated')
  )) {
    event.preventDefault();
    return;
  }
});

self.addEventListener('unhandledrejection', (event) => {
  // Suppress common promise rejection errors
  if (event.reason && event.reason.message && (
    event.reason.message.includes('No SW') ||
    event.reason.message.includes('Could not establish connection') ||
    event.reason.message.includes('Extension context invalidated')
  )) {
    event.preventDefault();
    return;
  }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
});

chrome.runtime.onInstalled.addListener(() => {
});

// Global flags for dependency availability
let POWER_CALCULATOR_AVAILABLE = false;
let DATA_MIGRATION_AVAILABLE = false;
let AGENT_SYSTEM_AVAILABLE = false;

// Import PowerCalculator for watts-based energy measurement and DataMigrationUtility
try {
  importScripts('power-calculator.js');
  POWER_CALCULATOR_AVAILABLE = true;
} catch (error) {
}

// Import Energy-Saving Tips Database
let ENERGY_TIPS_AVAILABLE = false;
try {
  importScripts('energy-saving-tips.js');
  ENERGY_TIPS_AVAILABLE = true;
} catch (error) {
}

try {
  importScripts('data-migration.js');
  DATA_MIGRATION_AVAILABLE = true;
} catch (error) {
}

// Import Enhanced Power Tracker with Agent System and Enhanced Integration
let ENHANCED_INTEGRATION_AVAILABLE = false;

try {
  importScripts('energy-tracker-with-agent.js');
  AGENT_SYSTEM_AVAILABLE = true;
} catch (error) {
}

// Import Firebase for database tracking
let FIREBASE_AVAILABLE = false;

(function initFirebase() {
  try {
    importScripts('firebase-config.js');
    importScripts('firebase-manager.js');
    FIREBASE_AVAILABLE = true;
    
    // Initialize Firebase asynchronously without crashing SW
    setTimeout(() => {
      if (typeof firebaseManager !== 'undefined' && firebaseManager) {
        firebaseManager.initialize()
          .then(success => {
            if (success) {
              console.log('Firebase initialized in service worker');
            }
          })
          .catch(error => {
            console.log('Firebase initialization failed (non-critical):', error);
          });
      }
    }, 1000);
  } catch (error) {
    console.log('Firebase not available (extension will work without it):', error);
    FIREBASE_AVAILABLE = false;
  }
})();

// Try to load enhanced AI energy database and integration
try {
  importScripts('enhanced-ai-energy-database.js');
} catch (error) {
}

try {
  importScripts('energy-tracker-enhanced-integration.js');
  ENHANCED_INTEGRATION_AVAILABLE = true;
} catch (error) {
}

// Initialize session tracking for accurate Firebase logging
// Track when extension was installed/updated and when last Firebase log occurred
(async function initSessionTracking() {
  try {
    const result = await chrome.storage.local.get([
      'extensionInstallTime',
      'lastEnergyLoggedKWh',
      'lastFirebaseLogTime'
    ]);

    // Set install time if this is first run
    if (!result.extensionInstallTime) {
      await chrome.storage.local.set({
        extensionInstallTime: Date.now(),
        lastEnergyLoggedKWh: 0,
        lastFirebaseLogTime: Date.now()
      });
    }
  } catch (error) {
    console.log('Session tracking initialization failed (non-critical):', error);
  }
})();


class EnergyTracker {
  constructor() {
    this.isReady = false;
    this.initPromise = null;

    // Initialize power calculator for watts-based measurements with enhanced safety
    this.powerCalculator = null;
    if (POWER_CALCULATOR_AVAILABLE) {
      try {
        if (typeof PowerCalculator !== 'undefined') {
          this.powerCalculator = new PowerCalculator();
        } else {
        }
      } catch (error) {
        this.powerCalculator = null;
      }
    }
    
    if (!this.powerCalculator) {
    }

    // Initialize energy-saving tips database
    this.energyTipsDatabase = null;
    if (ENERGY_TIPS_AVAILABLE) {
      try {
        if (typeof EnergySavingTipsDatabase !== 'undefined') {
          this.energyTipsDatabase = new EnergySavingTipsDatabase();
        } else {
        }
      } catch (error) {
        this.energyTipsDatabase = null;
      }
    }
    
    if (!this.energyTipsDatabase) {
    }
    
    // Initialize data migration utility with enhanced safety
    this.dataMigration = null;
    if (DATA_MIGRATION_AVAILABLE) {
      try {
        if (typeof DataMigrationUtility !== 'undefined') {
          this.dataMigration = new DataMigrationUtility();
        } else {
        }
      } catch (error) {
        this.dataMigration = null;
      }
    }
    
    if (!this.dataMigration) {
    }

    // Runtime state (in‑memory; OK to rebuild after SW restart)
    // Updated to track power consumption in watts instead of energy score
    this.currentTabs = new Map(); // tabId -> { startTime, lastUpdate, url, title, powerWatts, lastMetrics, powerData }

    // Phase 4: Rolling Average Tracking for Compare Tabs Strip
    this.tabRollingData = new Map(); // tabId -> { title, samples, rollingAverage, lastUpdate }
    this.ROLLING_WINDOW_SIZE = 10; // Number of samples for rolling average
    this.UPDATE_INTERVAL = 2000; // 2 seconds update interval for compare strip

    // Kick off init
    this.initPromise = this.init();
  }

  async init() {
    if (this.isReady) return;

    // Check and run comprehensive data migration if needed
    await this.checkAndRunMigration();

    this.setupListeners();
    await this.ensureStorageDefaults();
    this.setupKeepAlive();

    this.isReady = true;
  }

  /**
   * Check if comprehensive data migration is needed and run it
   */
  async checkAndRunMigration() {
    // Skip migration if DataMigrationUtility is not available
    if (!this.dataMigration) {
      return;
    }
    
    try {
      // Check if we've already attempted migration recently
      const { lastMigrationAttempt } = await chrome.storage.local.get('lastMigrationAttempt');
      const now = Date.now();
      const hoursSinceLastAttempt = (now - (lastMigrationAttempt || 0)) / (1000 * 60 * 60);
      
      // Don't retry migration if attempted within last 24 hours
      if (lastMigrationAttempt && hoursSinceLastAttempt < 24) {
        return;
      }
      
      const migrationStats = await this.dataMigration.getMigrationStats();
      
      if (!migrationStats.completed) {
        
        // Create backup before migration
        const backupKey = `migration_backup_${Date.now()}`;
        await this.createSafetyBackup(backupKey);
        
        const result = await this.dataMigration.migrateLegacyData();
        
        // Record attempt regardless of outcome
        await chrome.storage.local.set({ lastMigrationAttempt: now });
        
        if (result.success) {
          
          // Show notification about successful migration
          if (chrome.notifications) {
            try {
              await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon-48.png',
                title: 'PowerTracker - Data Migration Complete',
                message: `Successfully migrated ${result.stats.entriesMigrated} entries to the new power-based system.`
              });
            } catch (notificationError) {
            }
          }
        } else {
          // Don't retry automatically - let user handle it
        }
      } else {
      }
    } catch (error) {
      // Record failed attempt to prevent infinite retries
      await chrome.storage.local.set({ lastMigrationAttempt: Date.now() });
    }
  }

  async createSafetyBackup(backupKey) {
    try {
      const data = await chrome.storage.local.get(['energyHistory', 'settings', 'backendEnergyHistory']);
      await chrome.storage.local.set({ [backupKey]: data });
    } catch (error) {
      throw new Error('Cannot proceed with migration - backup failed');
    }
  }

  setupListeners() {
    // Install/open welcome
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html?welcome=true') });
      }
    });

    chrome.runtime.onStartup.addListener(() => {
      this.init(); // best-effort
    });

    // Tab lifecycle
    chrome.tabs.onActivated.addListener(async (info) => {
      try {
        await this.startTrackingTab(info.tabId);
      } catch (e) {
      }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      try {
        if (changeInfo.status === 'complete' && tab.url) {
          this.updateTabInfo(tabId, tab);
          if (!this.currentTabs.has(tabId)) {
            await this.startTrackingTab(tabId);
          }

          // Check if this is an AI site and trigger reminder if needed
          await this.checkAndShowAIReminder(tabId, tab);

          // Maybe show a carbon footprint tip
          await this.maybeShowCarbonTip(tabId);
        }
      } catch (e) {
      }
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.stopTrackingTab(tabId);
    });

    // Messages (popup + content + options) - Enhanced with robust error handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // CRITICAL FIX: Always respond to prevent "Receiving end does not exist" errors
      const handleRequest = async () => {
        try {
          // Ensure service worker is initialized
          if (!this.initPromise) {
            this.initPromise = this.init();
          }
          await this.initPromise;

          switch (message.type) {
            case 'ENERGY_DATA': {
              const tabId = sender.tab?.id;
              if (tabId) await this.processEnergyData(tabId, message.data);
              return { success: true };
            }
            case 'GET_CURRENT_ENERGY': {
              const data = await this.getCurrentEnergySnapshot();
              return { success: true, data };
            }
            case 'ENSURE_TAB_TRACKING': {
              const tabId = message.tabId;
              const tabInfo = message.tabInfo;
              
              if (tabId && tabInfo) {
                // Force start tracking this tab
                const trackingStarted = await this.startTrackingTab(tabId);
                
                // Update tab info if we have current data
                if (this.currentTabs.has(tabId)) {
                  const currentData = this.currentTabs.get(tabId);
                  this.currentTabs.set(tabId, {
                    ...currentData,
                    url: tabInfo.url || currentData.url,
                    title: tabInfo.title || currentData.title,
                    lastUpdate: Date.now()
                  });
                }
                
                // Enhanced content script injection with safety checks
                let contentScriptInjected = false;
                try {
                  // Check if we can inject into this tab
                  const tab = await chrome.tabs.get(tabId);
                  const canInject = tab && tab.url &&
                    (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                    !tab.url.includes('chrome://') && !tab.url.includes('chrome-extension://');
                  
                  if (canInject) {
                    await chrome.scripting.executeScript({
                      target: { tabId },
                      files: ['content-script.js']
                    });
                    contentScriptInjected = true;
                  } else {
                  }
                } catch (scriptError) {
                }
                
                return {
                  success: true,
                  tracking: this.currentTabs.has(tabId),
                  contentScriptInjected: contentScriptInjected,
                  trackingStarted: trackingStarted
                };
              }
              return { success: false, error: 'Invalid tab info provided' };
            }
            case 'GET_SETTINGS': {
              const settings = await this.getSettings();
              return { success: true, settings };
            }
            case 'UPDATE_SETTINGS': {
              await this.updateSettings(message.settings);
              return { success: true };
            }
            case 'GET_HISTORY': {
              const history = await this.getEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'GET_ENERGY_HISTORY': {
              // Alias for GET_HISTORY - some code uses this variant
              const history = await this.getEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'GET_BACKEND_ENERGY_HISTORY': {
              const history = await this.getBackendEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'GET_HISTORICAL_AI_USAGE': {
              // Alias for GET_BACKEND_ENERGY_HISTORY
              const history = await this.getBackendEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'LOG_BACKEND_ENERGY': {
              await this.logBackendEnergy(message.entry);
              return { success: true };
            }
            case 'DELETE_BACKEND_ENERGY_ENTRY': {
              await this.deleteBackendEnergyEntry(message.entryId);
              return { success: true };
            }
            case 'GET_BACKEND_ENERGY_SUMMARY': {
              const data = await this.getBackendEnergySummary(message.timeRange);
              return { success: true, data };
            }
            case 'GET_POWER_SUMMARY': {
              const data = await this.getPowerSummary(message.timeRange);
              return { success: true, data };
            }
            case 'MIGRATE_LEGACY_DATA': {
              if (this.dataMigration) {
                const result = await this.dataMigration.migrateLegacyData();
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'GET_MIGRATION_STATUS': {
              if (this.dataMigration) {
                const stats = await this.dataMigration.getMigrationStats();
                return { success: true, ...stats };
              } else {
                return { success: true, completed: false, error: 'Migration utility not available' };
              }
            }
            case 'RESTORE_FROM_BACKUP': {
              if (this.dataMigration) {
                const result = await this.dataMigration.restoreFromBackup(message.backupKey);
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'CLEANUP_OLD_BACKUPS': {
              if (this.dataMigration) {
                const result = await this.dataMigration.cleanupOldBackups(message.keepCount);
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'CLOSE_CURRENT_TAB': {
              // Get the sender's tab ID and close it
              const tabId = sender.tab?.id;
              if (tabId) {
                await chrome.tabs.remove(tabId);
                return { success: true };
              }
              return { success: false, error: 'No tab to close' };
            }
            case 'OPEN_SETTINGS': {
              await chrome.tabs.create({
                url: chrome.runtime.getURL('options.html?tab=settings')
              });
              return { success: true };
            }
            case 'HIDE_ENERGY_TIP': {
              // Forward to content script if needed
              const tabId = sender.tab?.id;
              if (tabId) {
                try {
                  await chrome.tabs.sendMessage(tabId, { type: 'HIDE_ENERGY_TIP' });
                  return { success: true };
                } catch (e) {
                  return { success: false, error: 'Could not hide tip' };
                }
              }
              return { success: true };
            }
            case 'EXECUTE_TIP_ACTION': {
              // Handle notification actions
              const result = await this.executeTipAction(message.action, message.notificationData, sender.tab?.id);
              return result;
            }
            case 'GET_NOTIFICATION_SETTINGS': {
              const settings = await this.getNotificationSettings();
              return { success: true, settings };
            }
            case 'UPDATE_NOTIFICATION_SETTINGS': {
              await this.updateNotificationSettings(message.settings);
              return { success: true };
            }
            case 'DISABLE_ALL_POPUPS': {
              // Disable ALL popups globally
              await this.updateNotificationSettings({ enabled: false });
              return { success: true };
            }
            case 'TRIGGER_SCHEDULED_TIP': {
              // Triggered by the settings page countdown timer
              await this.triggerScheduledTip();
              return { success: true };
            }
            case 'GET_TOP_TABS': {
              const topTabs = await this.getTopEnergyTabs(message.count || 3);
              return { success: true, topTabs };
            }
            case 'CLOSE_TAB': {
              const tabId = message.tabId;
              if (tabId) {
                await chrome.tabs.remove(tabId);
                this.stopTrackingTab(tabId);
                return { success: true };
              }
              return { success: false, error: 'No tab ID provided' };
            }
            case 'PING': {
              return { success: true, message: 'Service worker alive' };
            }
            case 'SHOW_ENERGY_TIP': {
              // Handle tip display request
              return { success: true };
            }
            case 'GET_HISTORICAL_AI_USAGE': {
              const timeRange = message.timeRange || '30d';
              const includeModels = message.includeModels || false;
              const includeEnergyData = message.includeEnergyData || false;
              
              try {
                // Get AI usage data from storage or generate sample data
                const { aiUsageHistory = [] } = await chrome.storage.local.get('aiUsageHistory');
                const now = Date.now();
                const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
                const dur = windows[timeRange] ?? windows['30d'];
                const cutoff = now - dur;
                
                const filteredData = aiUsageHistory.filter(entry => entry.timestamp > cutoff);
                
                return {
                  success: true,
                  data: {
                    entries: filteredData,
                    totalEntries: filteredData.length,
                    timeRange: timeRange,
                    models: includeModels ? this.getUniqueModels(filteredData) : undefined,
                    totalEnergyWh: includeEnergyData ? this.calculateTotalEnergy(filteredData) : undefined
                  }
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_ENERGY_HISTORY': {
              const timeRange = message.timeRange || '7d';
              const includeAIUsage = message.includeAIUsage || false;
              const granularity = message.granularity || 'daily';
              
              try {
                const history = await this.getEnergyHistory(timeRange);
                
                // Process history based on granularity
                const processedHistory = this.processHistoryByGranularity(history, granularity);
                
                return {
                  success: true,
                  history: processedHistory,
                  totalEntries: processedHistory.length,
                  timeRange: timeRange,
                  granularity: granularity
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_AI_MODEL_USAGE_SUMMARY': {
              const timeRange = message.timeRange || '24h';
              
              try {
                const { aiUsageHistory = [] } = await chrome.storage.local.get('aiUsageHistory');
                const now = Date.now();
                const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
                const dur = windows[timeRange] ?? windows['24h'];
                const cutoff = now - dur;
                
                const recentEntries = aiUsageHistory.filter(entry => entry.timestamp > cutoff);
                const totalEnergy = recentEntries.reduce((sum, entry) => sum + (entry.energy || 0), 0);
                
                return {
                  success: true,
                  data: {
                    totalEnergy: totalEnergy,
                    recentEntries: recentEntries.slice(-10),
                    entryCount: recentEntries.length,
                    modelBreakdown: this.getModelBreakdown(recentEntries)
                  }
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_MODEL_COMPARISON': {
              const models = message.models || [];
              const criteria = message.criteria || 'all';
              
              try {
                const comparison = await this.generateModelComparison(models, criteria);
                return {
                  success: true,
                  comparison: comparison
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_MODEL_BENCHMARKS': {
              const metric = message.metric || 'intelligence';
              
              try {
                const benchmarks = await this.getModelBenchmarks(metric);
                return {
                  success: true,
                  benchmarks: benchmarks
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_TRENDING_MODELS': {
              const timeframe = message.timeframe || '7d';
              
              try {
                const trending = await this.getTrendingModels(timeframe);
                return {
                  success: true,
                  trending: trending
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'EXPORT_COMPARISON_DATA': {
              const models = message.models || [];
              const format = message.format || 'json';
              
              try {
                const exportData = await this.exportComparisonData(models, format);
                return {
                  success: true,
                  exportData: exportData
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'OPEN_PROMPT_GENERATOR': {
              console.log('[ServiceWorker] OPEN_PROMPT_GENERATOR message received');
              // Chrome doesn't allow programmatically opening the popup
              // Best we can do is:
              // 1. Try to notify any open popup windows to show the prompt generator
              // 2. Open the options page with a flag to show instructions
              try {
                // First, try to send message to popup if it's already open
                chrome.runtime.sendMessage({
                  type: 'SHOW_PROMPT_GENERATOR_TAB'
                }).catch(() => {
                  console.log('[ServiceWorker] Popup not open (expected)');
                });

                // Open options page with a special flag to show prompt generator instructions
                const optionsUrl = chrome.runtime.getURL('options.html?openPromptGenerator=true');
                console.log('[ServiceWorker] Opening options page:', optionsUrl);

                await chrome.tabs.create({
                  url: optionsUrl,
                  active: true
                });

                console.log('[ServiceWorker] Options page opened successfully');
                return { success: true };
              } catch (error) {
                console.error('[ServiceWorker] Error opening options page:', error);
                return { success: false, error: error.message };
              }
            }
            case 'SNOOZE_AI_REMINDER': {
              try {
                const duration = message.duration || 15 * 60 * 1000; // Default 15 min
                const snoozedUntil = Date.now() + duration;
                await chrome.storage.local.set({ aiReminderSnoozedUntil: snoozedUntil });
                return { success: true };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'DISMISS_AI_REMINDER': {
              try {
                await chrome.storage.local.set({ aiReminderDismissed: true });
                return { success: true };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'NOTIFICATION_ACTION': {
              try {
                const action = message.action;
                const data = message.data;

                // Handle different notification actions
                switch (action) {
                  case 'high_power_video':
                  case 'pause_media':
                    // User acknowledged - we can't actually pause media from service worker
                    // Just acknowledge the action
                    return { success: true, message: 'Media action acknowledged' };

                  case 'high_power_gaming':
                  case 'close_tab':
                    // Close the current tab if requested
                    if (message.tabId) {
                      try {
                        await chrome.tabs.remove(message.tabId);
                        return { success: true, message: 'Tab closed' };
                      } catch (err) {
                        return { success: false, error: 'Could not close tab' };
                      }
                    }
                    return { success: true, message: 'Close tab acknowledged' };

                  case 'high_power_general':
                  case 'refresh_page':
                    // Reload the tab
                    if (message.tabId) {
                      try {
                        await chrome.tabs.reload(message.tabId);
                        return { success: true, message: 'Tab refreshed' };
                      } catch (err) {
                        return { success: false, error: 'Could not reload tab' };
                      }
                    }
                    return { success: true, message: 'Refresh acknowledged' };

                  default:
                    return { success: true, message: 'Action acknowledged' };
                }
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_SESSION_INFO': {
              // Get session tracking info for accurate Firebase logging
              try {
                const result = await chrome.storage.local.get([
                  'extensionInstallTime',
                  'lastEnergyLoggedKWh',
                  'lastFirebaseLogTime'
                ]);
                return {
                  success: true,
                  extensionInstallTime: result.extensionInstallTime || Date.now(),
                  lastEnergyLoggedKWh: result.lastEnergyLoggedKWh || 0,
                  lastFirebaseLogTime: result.lastFirebaseLogTime || Date.now()
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'LOG_ENERGY_SAVINGS': {
              // Log energy savings to Firebase
              if (!FIREBASE_AVAILABLE || !firebaseManager || !firebaseManager.initialized) {
                return { success: false, error: 'Firebase not available' };
              }
              try {
                const userId = await firebaseManager.getUserId();
                const result = await firebaseManager.logEnergySavings({
                  userId: userId,
                  energySavedKWh: message.data.energySavedKWh,
                  sessionDurationMinutes: message.data.sessionDurationMinutes
                });

                // Update last logged energy and time after successful Firebase write
                if (result) {
                  await chrome.storage.local.set({
                    lastEnergyLoggedKWh: message.data.totalEnergyKWh || 0,
                    lastFirebaseLogTime: Date.now()
                  });
                }

                return { success: result };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'LOG_TOKEN_SAVINGS': {
              // Log token savings to Firebase
              if (!FIREBASE_AVAILABLE || !firebaseManager || !firebaseManager.initialized) {
                return { success: false, error: 'Firebase not available' };
              }
              try {
                const userId = await firebaseManager.getUserId();
                const result = await firebaseManager.logTokenSavings({
                  userId: userId,
                  tokensSaved: message.data.tokensSaved,
                  aiModel: message.data.aiModel,
                  originalTokens: message.data.originalTokens,
                  optimizedTokens: message.data.optimizedTokens
                });
                return { success: result };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_AGGREGATE_STATS': {
              // Get aggregate statistics from Firebase
              if (!FIREBASE_AVAILABLE || !firebaseManager || !firebaseManager.initialized) {
                return { success: false, error: 'Firebase not available' };
              }
              try {
                const stats = await firebaseManager.getAggregateStats();
                return { success: true, stats };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            case 'GET_FIREBASE_ERROR_STATS': {
              // Get Firebase error statistics for debugging
              if (!FIREBASE_AVAILABLE || !firebaseManager) {
                return { success: false, error: 'Firebase not available' };
              }
              try {
                const errorStats = await firebaseManager.getErrorStats();
                return { success: true, errorStats };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            default:
              return { success: false, error: 'Unknown message type: ' + message.type };
          }
        } catch (error) {
          return { success: false, error: error.message || String(error) };
        }
      };

      // Handle async responses properly with timeout protection
      handleRequest().then(response => {
        try {
          if (sendResponse) {
            sendResponse(response);
          }
        } catch (responseError) {
        }
      }).catch(error => {
        try {
          if (sendResponse) {
            sendResponse({ success: false, error: error.message || String(error) });
          }
        } catch (responseError) {
        }
      });

      // Return true to indicate async response
      return true;
    });

    // Alarms (keep SW warm + cleanup) - WITH DIAGNOSTIC LOGGING
    
    if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.onAlarm) {
      chrome.alarms.onAlarm.addListener(async (alarm) => {
        try {
          if (alarm.name === 'et_process') {
            await this.periodicCleanup();
            // Check if notifications should be auto-re-enabled
            await this.checkAutoReEnableNotifications();
          }
        } catch (e) {
        }
      });
    } else {
    }
  }

  setupKeepAlive() {
    // 1) periodic alarm keeps the SW from going cold forever - WITH DIAGNOSTIC LOGGING
    
    try {
      if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.create) {
        chrome.alarms.create('et_process', { periodInMinutes: 1 });
      } else {
      }
    } catch (e) {
    }
  }

  async ensureStorageDefaults() {
    try {
      const { settings, energyHistory } = await chrome.storage.local.get(['settings', 'energyHistory']);
      if (!settings) {
        await chrome.storage.local.set({
          settings: {
            trackingEnabled: true,
            notificationsEnabled: true,
            energyThreshold: 75,
            dataRetentionDays: 30,
            samplingInterval: 5000
          }
        });
      }
      if (!energyHistory) {
        await chrome.storage.local.set({ energyHistory: [] });
      }
    } catch (e) {
    }
  }

  async startTrackingTab(tabId) {
    // validate tab exists
    let tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch {
      return false;
    }
    if (!tab?.url) {
      return false;
    }

    // skip system/extension pages
    const u = tab.url;
    if (
      u.startsWith('chrome://') || u.startsWith('edge://') || u.startsWith('about:') ||
      u.startsWith('moz-extension://') || u.startsWith('chrome-extension://') ||
      u === 'chrome://newtab/' || u === 'about:blank'
    ) {
      return false;
    }
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      return false;
    }

    // Check if already tracking
    if (this.currentTabs.has(tabId)) {
      // Update existing data
      const existingData = this.currentTabs.get(tabId);
      this.currentTabs.set(tabId, {
        ...existingData,
        url: tab.url,
        title: tab.title || existingData.title || 'Unknown',
        lastUpdate: Date.now()
      });
      return true;
    }


    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-script.js']
      });
      
      // Wait for content script to be ready with timeout
      const isReady = await this.waitForContentScriptReady(tabId);
    } catch (e) {
      // Some sites disallow injection; that's fine.
    }

    // Create initial tab data
    const tabData = {
      startTime: Date.now(),
      lastUpdate: Date.now(),
      url: tab.url,
      title: tab.title || 'Unknown',
      powerWatts: 8.0, // Default idle browsing power consumption
      energyScore: 0, // Keep for migration compatibility
      lastMetrics: null,
      powerData: null,
      isNew: true
    };

    this.currentTabs.set(tabId, tabData);

    return true;
  }

  async waitForContentScriptReady(tabId, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'PING' });
        return true; // Content script is ready
      } catch (e) {
        if (i === maxRetries - 1) {
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      }
    }
  }

  stopTrackingTab(tabId) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;

    this.saveHistoryEntry(tabId, data).catch((e) => {
    });
    this.currentTabs.delete(tabId);
    
    // Phase 4: Clean up rolling average data
    this.tabRollingData.delete(tabId);
  }

  updateTabInfo(tabId, tab) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;
    data.url = tab.url || data.url;
    data.title = tab.title || data.title;
    data.lastUpdate = Date.now();
    this.currentTabs.set(tabId, data);
  }

  async processEnergyData(tabId, metrics) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;

    // Calculate power consumption using new system
    const powerData = this.calculatePowerConsumption(metrics, data);
    const powerWatts = powerData.totalWatts;
    
    // Keep legacy energy score for migration compatibility
    const legacyScore = this.calculateLegacyEnergyScore(metrics);
    
    data.powerWatts = powerWatts;
    data.energyScore = legacyScore; // Maintain compatibility
    data.powerData = powerData;
    data.lastMetrics = metrics;
    data.lastUpdate = Date.now();
    this.currentTabs.set(tabId, data);

    // Phase 4: Update rolling average for Compare Tabs Strip
    this.updateTabRollingAverage(tabId, powerWatts, data.title);

    // Show browser notification for high power (legacy)
    await this.maybeNotifyHighPower(powerWatts);
    
    // Show contextual in-tab tip (new feature)
    await this.maybeShowEnergyTip(tabId, powerWatts, data);
  }

  calculatePowerConsumption(metrics, tabData) {
    // Enhanced metrics with tab context
    const enhancedMetrics = {
      ...metrics,
      url: tabData.url,
      title: tabData.title,
      // Add timestamp for activity calculations
      timestamp: Date.now(),
      tabStartTime: tabData.startTime
    };

    // Use PowerCalculator if available, otherwise use fallback
    if (this.powerCalculator) {
      return this.powerCalculator.calculatePowerConsumption(enhancedMetrics);
    } else {
      return this.fallbackCalculatePowerConsumption(enhancedMetrics);
    }
  }
  
  /**
   * Fallback power calculation when PowerCalculator is not available
   */
  fallbackCalculatePowerConsumption(metrics) {
    const domNodes = metrics.domNodes || 0;
    const cpuElements = metrics.cpuIntensiveElements?.count || 0;
    const videos = metrics.cpuIntensiveElements?.videos || 0;
    const url = metrics.url || '';
    
    // Simple fallback calculation
    let watts = 8.5; // Base idle power
    
    // Add power based on DOM complexity
    if (domNodes > 2000) watts += (domNodes - 2000) * 0.001;
    
    // Add power based on CPU intensive elements
    watts += cpuElements * 0.4;
    watts += videos * 6.2;
    
    // Site-specific adjustments
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube') || urlLower.includes('video')) {
      watts *= 1.4;
    } else if (urlLower.includes('game')) {
      watts *= 1.6;
    }
    
    // Ensure realistic bounds
    watts = Math.max(6, Math.min(65, watts));
    
    return {
      totalWatts: Math.round(watts * 10) / 10,
      breakdown: {
        baseline: 8.5,
        dom: Math.min((domNodes - 2000) * 0.001, 5),
        cpu: Math.min(cpuElements * 0.4 + videos * 6.2, 20)
      },
      confidence: 0.6,
      methodology: 'fallback'
    };
  }

  // Keep legacy calculation for backward compatibility and migration
  calculateLegacyEnergyScore(m) {
    // simple weighted model (0–100)
    const {
      // try to read values from our content metrics; fallback to 0
      cpuUsage = 0,
      memoryUsage = 0,
      resources = null,
      domNodes = 0,
      rendering = null
    } = m || {};

    // derive some hints if present
    const networkRequests = resources?.totalRequests || m?.activeConnections?.recentRequests || 0;
    const renderingTime = (rendering && typeof rendering['first-contentful-paint'] === 'number')
      ? rendering['first-contentful-paint']
      : 0;

    const cpuScore = Math.min(cpuUsage * 2, 40);          // 0–40
    const memScore = Math.min(memoryUsage / 10, 20);      // 0–20
    const netScore = Math.min(networkRequests * 0.5, 20); // 0–20
    const domScore = Math.min(domNodes / 100, 10);        // 0–10
    const renScore = Math.min(renderingTime / 10, 10);    // 0–10

    return Math.round(cpuScore + memScore + netScore + domScore + renScore);
  }

  async maybeNotifyHighPower(powerWatts) {
    try {
      const s = await this.getSettings();
      if (s.notificationsEnabled) {
        // Convert threshold to watts (75% threshold ≈ 40W for high power usage)
        const powerThreshold = this.convertThresholdToWatts(s.energyThreshold);
        
        if (powerWatts > powerThreshold) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon-48.png',
            title: 'High Power Consumption',
            message: `This tab is using ${powerWatts}W of power. Consider closing or optimizing it.`
          });
        }
      }
    } catch (e) {
    }
  }

  // Enhanced method for contextual in-tab tips
  async maybeShowEnergyTip(tabId, powerWatts, tabData) {
    try {
      const s = await this.getSettings();
      const notificationSettings = await this.getNotificationSettings();

      if (!s.notificationsEnabled || !notificationSettings.enabled) return;

      // Check cooldown to prevent notification spam
      const now = Date.now();
      const { lastEnergyTipTime = 0 } = await chrome.storage.local.get('lastEnergyTipTime');
      const cooldownPeriod = notificationSettings.notificationInterval || 300000; // 5 minutes default

      if (now - lastEnergyTipTime < cooldownPeriod) {
        return; // Still in cooldown period
      }

      // Check if tab has been consuming power for sustained period
      const sustainedDuration = 30 * 1000; // 30 seconds
      const tabStartTime = tabData.startTime || now;
      const tabDuration = now - tabStartTime;

      // Different thresholds based on power level
      const shouldShowTip =
        (powerWatts >= 45 && tabDuration >= sustainedDuration) ||        // High power after 30s
        (powerWatts >= 35 && tabDuration >= 2 * sustainedDuration) ||    // Medium power after 1min
        (powerWatts >= 25 && tabDuration >= 5 * sustainedDuration) ||    // Moderate power after 2.5min
        (powerWatts < 20 && tabDuration >= 10 * sustainedDuration);      // Achievement for efficient browsing

      if (shouldShowTip) {
        // Generate advanced contextual tip
        const tipData = this.generateAdvancedContextualTip(powerWatts, tabData, notificationSettings);
        
        if (tipData) {
          // Send tip to content script (enhanced notification system)
          try {
            await chrome.tabs.sendMessage(tabId, {
              type: 'SHOW_ENERGY_TIP',
              tipData: tipData
            });
            // Update last notification time
            await chrome.storage.local.set({ lastEnergyTipTime: Date.now() });
          } catch (contentScriptError) {
            // Fallback to browser notification
            if (chrome.notifications) {
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon-48.png',
                title: tipData.title || 'Power AI Tip',
                message: tipData.message
              });
              // Update last notification time even for fallback
              await chrome.storage.local.set({ lastEnergyTipTime: Date.now() });
            }
          }
        }
      }
    } catch (e) {
    }
  }

  /**
   * Trigger a scheduled tip - called when the countdown timer reaches 0
   * This sends a tip to the active tab regardless of power conditions
   */
  async triggerScheduledTip() {
    try {
      const notificationSettings = await this.getNotificationSettings();
      if (!notificationSettings.enabled) return;

      // Get the active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) return;

      // Get tab data if available, or create minimal data
      const tabData = this.tabMetrics.get(activeTab.id) || {
        url: activeTab.url || '',
        title: activeTab.title || 'Current Tab',
        watts: 15 // Default moderate power
      };

      // Generate a tip (use moderate power level for scheduled tips)
      const powerWatts = tabData.watts || 15;
      const tipData = this.generateAdvancedContextualTip(powerWatts, tabData, notificationSettings);

      if (tipData) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: 'SHOW_ENERGY_TIP',
            tipData: tipData
          });
          // Update last notification time
          await chrome.storage.local.set({ lastEnergyTipTime: Date.now() });
        } catch (contentScriptError) {
          // Fallback to browser notification if content script not available
          if (chrome.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon-48.png',
              title: tipData.title || 'Power Tracker Tip',
              message: tipData.message
            });
            await chrome.storage.local.set({ lastEnergyTipTime: Date.now() });
          }
        }
      }
    } catch (error) {
      console.error('Failed to trigger scheduled tip:', error);
    }
  }

  // Convert legacy energy threshold percentage to watts
  convertThresholdToWatts(thresholdPercent) {
    // Map 0-100% threshold to realistic watts ranges
    // 0% = 5W (minimum active browsing)
    // 50% = 25W (moderate usage)
    // 75% = 40W (high usage threshold)
    // 100% = 60W+ (very high usage)
    return 5 + (thresholdPercent / 100) * 55;
  }

  // Legacy method for backward compatibility
  async maybeNotifyHighEnergy(score) {
    try {
      const s = await this.getSettings();
      if (s.notificationsEnabled && score > s.energyThreshold) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon-48.png',
          title: 'High Energy Consumption',
          message: `This tab is using ${score}% energy. Consider closing or optimizing.`
        });
      }
    } catch (e) {
    }
  }

  async getCurrentEnergySnapshot() {
    
    const out = {};
    
    // First, try to get data from in-memory cache
    for (const [tabId, data] of this.currentTabs.entries()) {
      try {
        await chrome.tabs.get(tabId);
        const duration = Date.now() - (data.startTime || Date.now());
        
        out[tabId] = {
          // New watts-based data (primary)
          powerWatts: data.powerWatts || 8.0,
          powerData: data.powerData,
          
          // Legacy energy score (for compatibility)
          energyScore: data.energyScore || 0,
          
          // Common data
          url: data.url || '',
          title: data.title || 'Unknown',
          domNodes: data.lastMetrics?.domNodes || 0,
          duration: duration,
          timestamp: data.lastUpdate || Date.now(),
          
          // Energy consumption calculations
          energyConsumption: this.powerCalculator?.calculateEnergyConsumption(
            data.powerWatts || 8.0,
            duration
          ) || { kWh: 0, cost: 0 }
        };
      } catch {
        this.currentTabs.delete(tabId);
      }
    }
    
    // If no in-memory data, try to recover from persistent storage
    if (Object.keys(out).length === 0) {
      try {
        const { currentTabsSnapshot } = await chrome.storage.local.get('currentTabsSnapshot');
        if (currentTabsSnapshot && typeof currentTabsSnapshot === 'object') {
          const now = Date.now();
          
          // Only use recent data (within last 10 minutes)
          for (const [tabId, data] of Object.entries(currentTabsSnapshot)) {
            if (data && (now - (data.lastUpdate || 0)) < 600000) {
              try {
                await chrome.tabs.get(parseInt(tabId));
                out[tabId] = {
                  ...data,
                  timestamp: data.lastUpdate || now,
                  isRecovered: true,
                  dataSource: 'recovered_storage'
                };
              } catch {
                // Tab no longer exists
              }
            }
          }
        }
      } catch (storageError) {
      }
    }
    
    // Persist current snapshot for future recovery
    if (Object.keys(out).length > 0) {
      try {
        await chrome.storage.local.set({
          currentTabsSnapshot: out,
          lastSnapshotTime: Date.now()
        });
      } catch (persistError) {
      }
    }
    
    return out;
  }

  async getSettings() {
    const defaultSettings = {
      trackingEnabled: true,
      notificationsEnabled: true,
      energyThreshold: 75,
      powerThreshold: 40, // Add power threshold with default
      dataRetentionDays: 30,
      samplingInterval: 5000
    };

    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        return defaultSettings;
      }

      const { settings } = await chrome.storage.local.get('settings');
      if (!settings || typeof settings !== 'object') {
        return defaultSettings;
      }

      // Merge with defaults to ensure all required properties exist
      return { ...defaultSettings, ...settings };
    } catch (error) {
      return defaultSettings;
    }
  }

  async updateSettings(newSettings) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        return false;
      }

      if (!newSettings || typeof newSettings !== 'object') {
        return false;
      }

      // Sanitize settings before saving
      const sanitizedSettings = this.sanitizeSettings(newSettings);
      await chrome.storage.local.set({ settings: sanitizedSettings });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize settings to ensure valid values
   */
  sanitizeSettings(settings) {
    const sanitized = { ...settings };
    
    // Ensure boolean values
    if (typeof sanitized.trackingEnabled !== 'boolean') {
      sanitized.trackingEnabled = true;
    }
    if (typeof sanitized.notificationsEnabled !== 'boolean') {
      sanitized.notificationsEnabled = true;
    }
    
    // Ensure numeric values are within valid ranges
    if (typeof sanitized.energyThreshold !== 'number' || sanitized.energyThreshold < 0 || sanitized.energyThreshold > 100) {
      sanitized.energyThreshold = 75;
    }
    if (typeof sanitized.powerThreshold !== 'number' || sanitized.powerThreshold < 5 || sanitized.powerThreshold > 100) {
      sanitized.powerThreshold = 40;
    }
    if (typeof sanitized.dataRetentionDays !== 'number' || sanitized.dataRetentionDays < 1 || sanitized.dataRetentionDays > 365) {
      sanitized.dataRetentionDays = 30;
    }
    if (typeof sanitized.samplingInterval !== 'number' || sanitized.samplingInterval < 1000 || sanitized.samplingInterval > 60000) {
      sanitized.samplingInterval = 5000;
    }
    
    return sanitized;
  }

  async getEnergyHistory(timeRange = '24h') {
    try {
      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      const now = Date.now();
      const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const dur = windows[timeRange] ?? windows['24h'];
      const cutoff = now - dur;
      return energyHistory.filter(e => e.timestamp > cutoff);
    } catch {
      return [];
    }
  }

  async saveHistoryEntry(tabId, data) {
    const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
    const duration = Math.max(0, Date.now() - (data.startTime || Date.now()));
    const powerWatts = data.powerWatts || 8.0;
    
    // Calculate energy consumption for this session
    const energyData = this.powerCalculator?.calculateEnergyConsumption(powerWatts, duration) ||
      this.fallbackCalculateEnergyConsumption(powerWatts, duration);
    
    const historyEntry = {
      timestamp: Date.now(),
      tabId,
      url: data.url,
      title: data.title,
      
      // New watts-based data (primary)
      powerWatts: powerWatts,
      energyKwh: energyData.kWh,
      energyCost: energyData.cost,
      co2Grams: energyData.co2Grams,
      
      // Legacy energy score (for backward compatibility)
      energyScore: data.energyScore || 0,
      
      // Duration and metadata
      duration: duration,
      powerData: data.powerData
    };
    
    energyHistory.push(historyEntry);

    // trim to avoid unbounded growth
    const MAX = 10000;
    if (energyHistory.length > MAX) {
      energyHistory.splice(0, energyHistory.length - MAX);
    }
    await chrome.storage.local.set({ energyHistory });
  }

  async periodicCleanup() {
    // delete old history beyond retention
    try {
      const s = await this.getSettings();
      const keepMs = (s.dataRetentionDays || 30) * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - keepMs;

      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      const filtered = energyHistory.filter(e => e.timestamp > cutoff);
      if (filtered.length !== energyHistory.length) {
        await chrome.storage.local.set({ energyHistory: filtered });
      }
    } catch (e) {
    }
  }

  async getBackendEnergyHistory(timeRange = '7d') {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      const now = Date.now();
      const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const dur = windows[timeRange] ?? windows['7d'];
      const cutoff = now - dur;
      return backendEnergyHistory.filter(e => e.timestamp > cutoff);
    } catch (e) {
      return [];
    }
  }

  async logBackendEnergy(entry) {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      backendEnergyHistory.push(entry);
      
      // trim to avoid unbounded growth
      const MAX = 5000;
      if (backendEnergyHistory.length > MAX) {
        backendEnergyHistory.splice(0, backendEnergyHistory.length - MAX);
      }
      
      await chrome.storage.local.set({ backendEnergyHistory });
    } catch (e) {
      throw e;
    }
  }

  async deleteBackendEnergyEntry(entryId) {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      const filtered = backendEnergyHistory.filter(e => e.id !== entryId);
      await chrome.storage.local.set({ backendEnergyHistory: filtered });
    } catch (e) {
      throw e;
    }
  }

  async getBackendEnergySummary(timeRange = '24h') {
    try {
      const history = await this.getBackendEnergyHistory(timeRange);
      const totalEnergy = history.reduce((sum, entry) => sum + (entry.energyConsumption || 0), 0);
      return {
        totalEnergy,
        recentEntries: history.slice(-10),
        entryCount: history.length
      };
    } catch (e) {
      return { totalEnergy: 0, recentEntries: [], entryCount: 0 };
    }
  }

  async getPowerSummary(timeRange = '24h') {
    try {
      const history = await this.getEnergyHistory(timeRange);
      
      // Calculate power-based statistics
      const totalEntries = history.length;
      const totalWatts = history.reduce((sum, entry) => sum + (entry.powerWatts || 0), 0);
      const totalKwh = history.reduce((sum, entry) => sum + (entry.energyKwh || 0), 0);
      const totalCost = history.reduce((sum, entry) => sum + (entry.energyCost || 0), 0);
      const totalCO2 = history.reduce((sum, entry) => sum + (entry.co2Grams || 0), 0);
      
      const averagePowerWatts = totalEntries > 0 ? totalWatts / totalEntries : 0;
      
      // Count efficiency levels
      const efficiencyLevels = {
        excellent: 0, // < 15W
        good: 0,      // 15-25W
        average: 0,   // 25-40W
        poor: 0       // > 40W
      };
      
      history.forEach(entry => {
        const watts = entry.powerWatts || 0;
        if (watts < 15) efficiencyLevels.excellent++;
        else if (watts < 25) efficiencyLevels.good++;
        else if (watts < 40) efficiencyLevels.average++;
        else efficiencyLevels.poor++;
      });
      
      // Find peak power usage
      const peakEntry = history.reduce((peak, entry) => {
        return (entry.powerWatts || 0) > (peak.powerWatts || 0) ? entry : peak;
      }, { powerWatts: 0 });
      
      return {
        totalEntries,
        averagePowerWatts: Math.round(averagePowerWatts * 10) / 10,
        totalEnergyKwh: Math.round(totalKwh * 10000) / 10000, // 4 decimal places
        totalCostUSD: Math.round(totalCost * 100) / 100, // 2 decimal places
        totalCO2Grams: Math.round(totalCO2),
        efficiencyLevels,
        peakPowerWatts: peakEntry.powerWatts || 0,
        peakPowerUrl: peakEntry.url || '',
        recentEntries: history.slice(-10)
      };
    } catch (e) {
      return {
        totalEntries: 0,
        averagePowerWatts: 0,
        totalEnergyKwh: 0,
        totalCostUSD: 0,
        totalCO2Grams: 0,
        efficiencyLevels: { excellent: 0, good: 0, average: 0, poor: 0 },
        peakPowerWatts: 0,
        peakPowerUrl: '',
        recentEntries: []
      };
    }
  }

  async migrateLegacyEnergyData() {
    try {
      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      
      let migratedCount = 0;
      let alreadyMigratedCount = 0;
      
      const migratedHistory = energyHistory.map(entry => {
        // Check if entry already has power data
        if (entry.powerWatts !== undefined) {
          alreadyMigratedCount++;
          return entry;
        }
        
        // Migrate legacy energy score to watts
        const estimatedWatts = this.powerCalculator ?
          this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore || 0, { url: entry.url, title: entry.title }) :
          this.fallbackMigrateEnergyScore(entry.energyScore || 0);
        
        // Calculate energy consumption for the duration
        const energyData = this.powerCalculator ?
          this.powerCalculator.calculateEnergyConsumption(estimatedWatts, entry.duration || 0) :
          this.fallbackCalculateEnergyConsumption(estimatedWatts, entry.duration || 0);
        
        migratedCount++;
        
        return {
          ...entry,
          // New watts-based data
          powerWatts: estimatedWatts,
          energyKwh: energyData.kWh,
          energyCost: energyData.cost,
          co2Grams: energyData.co2Grams,
          // Mark as migrated
          migrated: true,
          migrationTimestamp: Date.now()
        };
      });
      
      // Save migrated data
      await chrome.storage.local.set({ energyHistory: migratedHistory });
      
      
      return {
        migratedCount,
        alreadyMigratedCount,
        totalEntries: energyHistory.length
      };
      
    } catch (e) {
      return {
        error: e.message,
        migratedCount: 0,
        alreadyMigratedCount: 0,
        totalEntries: 0
      };
    }
  }
  
  /**
   * Fallback energy consumption calculation
   */
  fallbackCalculateEnergyConsumption(watts, durationMs) {
    const hours = durationMs / (1000 * 60 * 60);
    const kWh = (watts * hours) / 1000;
    
    return {
      watts: watts,
      durationHours: hours,
      kWh: kWh,
      cost: kWh * 0.12, // $0.12/kWh average US rate
      co2Grams: kWh * 500 // 500g CO2/kWh average
    };
  }
  
  /**
   * Fallback energy score to watts migration
   */
  fallbackMigrateEnergyScore(energyScore) {
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

  /**
   * Execute tip actions from the notification system
   */
  async executeTipAction(action, notificationData, tabId) {
    
    try {
      switch (action) {
        case 'pause_media':
          if (tabId) {
            // Send message to content script to pause media elements
            await chrome.tabs.sendMessage(tabId, {
              type: 'PAUSE_MEDIA_ELEMENTS'
            });
            return { success: true, message: 'Media elements paused' };
          }
          break;
          
        case 'reduce_animations':
          if (tabId) {
            // Send message to content script to reduce animations
            await chrome.tabs.sendMessage(tabId, {
              type: 'REDUCE_ANIMATIONS'
            });
            return { success: true, message: 'Animations reduced' };
          }
          break;
          
        case 'refresh_page':
          if (tabId) {
            await chrome.tabs.reload(tabId);
            return { success: true, message: 'Page refreshed' };
          }
          break;
          
        case 'close_tab':
          if (tabId) {
            await chrome.tabs.remove(tabId);
            return { success: true, message: 'Tab closed' };
          }
          break;
          
        case 'open_settings':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html?tab=settings')
          });
          return { success: true, message: 'Settings opened' };
          
        case 'show_history':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html?tab=history')
          });
          return { success: true, message: 'History opened' };
          
        case 'optimize_tab':
          if (tabId) {
            // Send comprehensive optimization message
            await chrome.tabs.sendMessage(tabId, {
              type: 'OPTIMIZE_TAB',
              actions: ['pause_media', 'reduce_animations', 'cleanup_dom']
            });
            return { success: true, message: 'Tab optimized' };
          }
          break;
          
        default:
          return { success: false, error: 'Unknown action' };
      }
      
      return { success: false, error: 'Action could not be executed' };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification system settings
   */
  async getNotificationSettings() {
    const defaultSettings = {
      enabled: true,
      position: 'top-right',
      duration: 5500, // 5.5 seconds (changed from 7000ms)
      maxVisible: 3,
      respectReducedMotion: true,
      showHighPowerAlerts: true,
      showEfficiencyTips: true,
      showAchievements: true,
      notificationInterval: 900000, // 15 minutes in milliseconds (CHANGED from 5 min to be less intrusive for teachers)
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      frequency: 'normal' // minimal, normal, aggressive
    };

    try {
      const { notificationSettings } = await chrome.storage.local.get('notificationSettings');
      return { ...defaultSettings, ...notificationSettings };
    } catch (error) {
      return defaultSettings;
    }
  }

  /**
   * Update notification system settings
   */
  async updateNotificationSettings(newSettings) {
    try {
      const currentSettings = await this.getNotificationSettings();
      const sanitizedSettings = this.sanitizeNotificationSettings(newSettings);

      // Track when notifications are disabled for auto-re-enable feature
      if (sanitizedSettings.enabled === false && currentSettings.enabled === true) {
        // Notifications being disabled - store timestamp for auto-re-enable
        sanitizedSettings.disabledAt = Date.now();
        sanitizedSettings.autoReEnableAt = Date.now() + (10 * 60 * 60 * 1000); // 10 hours
      } else if (sanitizedSettings.enabled === true) {
        // Notifications being enabled - clear disabled timestamps
        delete sanitizedSettings.disabledAt;
        delete sanitizedSettings.autoReEnableAt;
      }

      await chrome.storage.local.set({ notificationSettings: sanitizedSettings });

      // Broadcast settings update to all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'UPDATE_NOTIFICATION_SETTINGS',
            settings: sanitizedSettings
          });
        } catch (e) {
          // Content script might not be loaded, ignore
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check and auto-re-enable notifications if disabled timeout has passed
   */
  async checkAutoReEnableNotifications() {
    try {
      const settings = await this.getNotificationSettings();

      if (settings.enabled === false && settings.autoReEnableAt) {
        const now = Date.now();
        if (now >= settings.autoReEnableAt) {
          // Auto-re-enable notifications
          settings.enabled = true;
          delete settings.disabledAt;
          delete settings.autoReEnableAt;
          await this.updateNotificationSettings(settings);
          return true; // Notifications were re-enabled
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize notification settings
   */
  sanitizeNotificationSettings(settings) {
    const sanitized = { ...settings };

    // Ensure boolean values
    if (typeof sanitized.enabled !== 'boolean') sanitized.enabled = true;
    if (typeof sanitized.respectReducedMotion !== 'boolean') sanitized.respectReducedMotion = true;
    if (typeof sanitized.showHighPowerAlerts !== 'boolean') sanitized.showHighPowerAlerts = true;
    if (typeof sanitized.showEfficiencyTips !== 'boolean') sanitized.showEfficiencyTips = true;
    if (typeof sanitized.showAchievements !== 'boolean') sanitized.showAchievements = true;

    // Ensure valid position
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (!validPositions.includes(sanitized.position)) sanitized.position = 'top-right';

    // Ensure valid duration
    if (typeof sanitized.duration !== 'number' || sanitized.duration < 1000 || sanitized.duration > 30000) {
      sanitized.duration = 7000;
    }

    // Ensure valid maxVisible
    if (typeof sanitized.maxVisible !== 'number' || sanitized.maxVisible < 1 || sanitized.maxVisible > 10) {
      sanitized.maxVisible = 3;
    }

    // Ensure valid notification interval (1-60 minutes in milliseconds)
    if (typeof sanitized.notificationInterval !== 'number' ||
        sanitized.notificationInterval < 60000 ||
        sanitized.notificationInterval > 3600000) {
      sanitized.notificationInterval = 300000; // Default 5 minutes
    }

    // Ensure valid frequency
    const validFrequencies = ['minimal', 'normal', 'aggressive'];
    if (!validFrequencies.includes(sanitized.frequency)) sanitized.frequency = 'normal';

    // Ensure valid quiet hours
    if (!sanitized.quietHours || typeof sanitized.quietHours !== 'object') {
      sanitized.quietHours = { enabled: false, start: '22:00', end: '08:00' };
    }

    return sanitized;
  }

  /**
   * Check if we're in quiet hours
   */
  isInQuietHours() {
    try {
      const settings = this.getNotificationSettings();
      if (!settings.quietHours?.enabled) return false;
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const start = settings.quietHours.start;
      const end = settings.quietHours.end;
      
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (start > end) {
        return currentTime >= start || currentTime <= end;
      } else {
        return currentTime >= start && currentTime <= end;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Enhanced contextual tip generation using comprehensive tips database
   */
  generateAdvancedContextualTip(powerWatts, tabData, settings) {
    // Skip if in quiet hours
    if (this.isInQuietHours()) return null;
    
    // Skip based on frequency setting
    const frequencyChances = {
      minimal: 0.1,
      normal: 0.3,
      aggressive: 0.7
    };
    
    if (Math.random() > frequencyChances[settings.frequency || 'normal']) {
      return null;
    }

    // Use comprehensive tips database if available
    if (this.energyTipsDatabase) {
      try {
        const tip = this.energyTipsDatabase.getContextualTip(powerWatts, tabData, settings);
        if (tip) {
          return tip;
        }
      } catch (error) {
        // Fall through to legacy system
      }
    }

    // Fallback to legacy tip generation if database unavailable
    return this.generateLegacyContextualTip(powerWatts, tabData, settings);
  }

  /**
   * Legacy contextual tip generation (fallback)
   */
  generateLegacyContextualTip(powerWatts, tabData, settings) {
    const url = tabData.url || '';
    const title = tabData.title || '';
    const domain = this.getDomain(url);
    const metrics = tabData.lastMetrics || {};
    
    // High power usage (>= 45W)
    if (powerWatts >= 45) {
      if (!settings.showHighPowerAlerts) return null;
      
      // Video streaming
      if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('twitch') ||
          title.toLowerCase().includes('video') || metrics.cpuIntensiveElements?.videos > 0) {
        return {
          type: 'high_power_video',
          severity: 'urgent',
          title: 'High Video Power Usage',
          message: `Video streaming is using ${powerWatts}W. Consider lowering quality to save energy.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 25) * 0.024)} kWh/hour saved`,
          action: 'pause_media',
          actionText: 'Pause Media',
          duration: 8000,
          cooldown: 10 * 60 * 1000,
          efficiency: 'poor',
          icon: '📹'
        };
      }
      
      // Gaming/WebGL
      if (url.includes('game') || title.toLowerCase().includes('game') ||
          metrics.cpuIntensiveElements?.canvases > 0) {
        return {
          type: 'high_power_gaming',
          severity: 'urgent',
          title: 'Gaming Power Alert',
          message: `This game is consuming ${powerWatts}W. Close when not actively playing.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 15) * 0.024)} kWh/hour saved`,
          action: 'close_tab',
          actionText: 'Close Tab',
          duration: 8000,
          cooldown: 15 * 60 * 1000,
          efficiency: 'poor',
          icon: '🎮'
        };
      }
      
      // General high power
      return {
        type: 'high_power_general',
        severity: 'urgent',
        title: 'Very High Power Usage',
        message: `This tab is using ${powerWatts}W. Refreshing may help reduce consumption.`,
        powerWatts: powerWatts,
        impact: `~${Math.round((powerWatts - 20) * 0.024)} kWh/hour saved`,
        action: 'refresh_page',
        actionText: 'Refresh Page',
        duration: 8000,
        cooldown: 10 * 60 * 1000,
        efficiency: 'poor',
        icon: '🔄'
      };
    }
    
    // Moderate high power (35-44W)
    if (powerWatts >= 35) {
      if (!settings.showEfficiencyTips) return null;
      
      // Social media
      if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram') ||
          domain.includes('linkedin') || domain.includes('tiktok')) {
        return {
          type: 'moderate_power_social',
          severity: 'warning',
          title: 'Social Media Power Usage',
          message: `Auto-playing content is using ${powerWatts}W. Consider pausing videos.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 20) * 0.024)} kWh/hour saved`,
          action: 'pause_media',
          actionText: 'Pause Media',
          duration: 6000,
          cooldown: 20 * 60 * 1000,
          efficiency: 'average',
          icon: '📱'
        };
      }
      
      // Animation-heavy sites
      if (metrics.cpuIntensiveElements?.count > 5) {
        return {
          type: 'moderate_power_animations',
          severity: 'warning',
          title: 'Animation Power Usage',
          message: `Multiple animations are using ${powerWatts}W. Reducing them saves energy.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 18) * 0.024)} kWh/hour saved`,
          action: 'reduce_animations',
          actionText: 'Reduce Animations',
          duration: 6000,
          cooldown: 15 * 60 * 1000,
          efficiency: 'average',
          icon: '✨'
        };
      }
    }
    
    // Achievement notifications
    if (settings.showAchievements && powerWatts < 20) {
      // Only show occasionally for efficient browsing
      if (Math.random() < 0.05) {
        return {
          type: 'achievement_efficient',
          severity: 'success',
          title: 'Efficient Browsing! 🌱',
          message: `Great job! This tab is only using ${powerWatts}W - very energy efficient.`,
          powerWatts: powerWatts,
          impact: 'Saving ~0.5 kWh/day vs average',
          action: null,
          actionText: 'Keep it up!',
          duration: 4000,
          cooldown: 60 * 60 * 1000, // 1 hour
          efficiency: 'excellent',
          icon: '🌱'
        };
      }
    }
    
    return null;
  }

  /**
   * Helper method to extract domain from URL safely
   */
  getDomain(url) {
    try {
      if (!url || typeof url !== 'string') return '';
      return new URL(url).hostname;
    } catch (error) {
      return '';
    }
  }

  /**
   * Phase 4: Update rolling average for tab energy consumption
   */
  updateTabRollingAverage(tabId, powerWatts, title) {
    const now = Date.now();
    
    if (!this.tabRollingData.has(tabId)) {
      // Initialize new tab rolling data
      this.tabRollingData.set(tabId, {
        tabId: tabId,
        title: title || 'Unknown',
        samples: [],
        rollingAverage: powerWatts,
        lastUpdate: now
      });
      return;
    }

    const rollingData = this.tabRollingData.get(tabId);
    
    // Update title if provided
    if (title) {
      rollingData.title = title;
    }
    
    // Add new sample
    rollingData.samples.push({
      watts: powerWatts,
      timestamp: now
    });
    
    // Keep only recent samples within the rolling window
    if (rollingData.samples.length > this.ROLLING_WINDOW_SIZE) {
      rollingData.samples.shift(); // Remove oldest sample
    }
    
    // Calculate rolling average
    const totalWatts = rollingData.samples.reduce((sum, sample) => sum + sample.watts, 0);
    rollingData.rollingAverage = totalWatts / rollingData.samples.length;
    rollingData.lastUpdate = now;
    
    this.tabRollingData.set(tabId, rollingData);
    
  }

  /**
   * Phase 4: Get top energy consuming tabs for Compare Tabs Strip
   */
  async getTopEnergyTabs(count = 3) {
    try {
      const topTabs = [];
      
      // Get all tabs with rolling data
      for (const [tabId, rollingData] of this.tabRollingData.entries()) {
        try {
          // Verify tab still exists
          const tab = await chrome.tabs.get(parseInt(tabId));
          
          if (tab && tab.url && !this.isSystemUrl(tab.url)) {
            // Get current tab data for additional info
            const currentData = this.currentTabs.get(parseInt(tabId));
            
            topTabs.push({
              tabId: parseInt(tabId),
              title: this.truncateTitle(rollingData.title || tab.title || 'Unknown', 30),
              fullTitle: rollingData.title || tab.title || 'Unknown',
              watts: Math.round(rollingData.rollingAverage * 10) / 10,
              rollingAverage: rollingData.rollingAverage,
              url: tab.url,
              muted: tab.mutedInfo?.muted || false,
              lastUpdate: rollingData.lastUpdate,
              sampleCount: rollingData.samples.length,
              // Add color coding level
              energyLevel: this.getEnergyLevel(rollingData.rollingAverage),
              // Additional metadata
              powerData: currentData?.powerData || null,
              domain: this.getDomain(tab.url)
            });
          }
        } catch (tabError) {
          // Tab no longer exists, remove from tracking
          this.tabRollingData.delete(tabId);
          this.currentTabs.delete(parseInt(tabId));
        }
      }
      
      // Sort by rolling average watts (descending) and take top N
      const sortedTabs = topTabs
        .sort((a, b) => b.rollingAverage - a.rollingAverage)
        .slice(0, count);
      
      return sortedTabs;
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if URL is a system URL that should be excluded
   */
  isSystemUrl(url) {
    return url.startsWith('chrome://') ||
           url.startsWith('edge://') ||
           url.startsWith('about:') ||
           url.startsWith('moz-extension://') ||
           url.startsWith('chrome-extension://') ||
           url === 'chrome://newtab/' ||
           url === 'about:blank';
  }

  /**
   * Truncate tab title to specified length
   */
  truncateTitle(title, maxLength) {
    if (!title || title.length <= maxLength) {
      return title || 'Unknown';
    }
    return title.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get energy level classification for color coding
   */
  getEnergyLevel(watts) {
    if (watts < 15) return 'low';      // Green: < 15W
    if (watts < 30) return 'medium';   // Yellow: 15-30W
    return 'high';                     // Red: > 30W
  }

  // Helper methods for the new message handlers
  getUniqueModels(usageData) {
    const models = new Set();
    usageData.forEach(entry => {
      if (entry.model) {
        models.add(entry.model);
      }
    });
    return Array.from(models);
  }

  calculateTotalEnergy(usageData) {
    return usageData.reduce((total, entry) => total + (entry.energy || 0), 0);
  }

  processHistoryByGranularity(history, granularity) {
    if (granularity === 'hourly') {
      return this.groupByHour(history);
    } else if (granularity === 'daily') {
      return this.groupByDay(history);
    } else {
      return history;
    }
  }

  groupByHour(history) {
    const groups = new Map();
    history.forEach(entry => {
      const hour = new Date(entry.timestamp);
      hour.setMinutes(0, 0, 0);
      const key = hour.getTime();
      
      if (!groups.has(key)) {
        groups.set(key, { timestamp: key, energy: 0, count: 0 });
      }
      
      const group = groups.get(key);
      group.energy += entry.energy || 0;
      group.count += 1;
    });
    
    return Array.from(groups.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  groupByDay(history) {
    const groups = new Map();
    history.forEach(entry => {
      const day = new Date(entry.timestamp);
      day.setHours(0, 0, 0, 0);
      const key = day.getTime();
      
      if (!groups.has(key)) {
        groups.set(key, { timestamp: key, energy: 0, count: 0 });
      }
      
      const group = groups.get(key);
      group.energy += entry.energy || 0;
      group.count += 1;
    });
    
    return Array.from(groups.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  getModelBreakdown(usageData) {
    const breakdown = {};
    usageData.forEach(entry => {
      if (entry.model) {
        if (!breakdown[entry.model]) {
          breakdown[entry.model] = { count: 0, energy: 0 };
        }
        breakdown[entry.model].count += 1;
        breakdown[entry.model].energy += entry.energy || 0;
      }
    });
    return breakdown;
  }

  async generateModelComparison(models, criteria) {
    // Generate comparison data for the specified models
    const comparison = {};
    
    for (const model of models) {
      comparison[model] = {
        efficiency: await this.getModelEfficiency(model),
        performance: await this.getModelPerformance(model),
        cost: await this.getModelCost(model),
        availability: await this.getModelAvailability(model)
      };
    }
    
    return comparison;
  }

  async getModelEfficiency(model) {
    // Return efficiency data for the model
    const efficiencyMap = {
      'gpt-4': 85,
      'gpt-3.5-turbo': 92,
      'claude-3-opus': 88,
      'claude-3-sonnet': 90,
      'claude-3-haiku': 95,
      'gemini-pro': 87
    };
    return efficiencyMap[model] || 80;
  }

  async getModelPerformance(model) {
    // Return performance data for the model
    const performanceMap = {
      'gpt-4': 95,
      'gpt-3.5-turbo': 85,
      'claude-3-opus': 93,
      'claude-3-sonnet': 90,
      'claude-3-haiku': 82,
      'gemini-pro': 88
    };
    return performanceMap[model] || 75;
  }

  async getModelCost(model) {
    // Return cost data for the model (per 1k tokens)
    const costMap = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'claude-3-haiku': 0.00025,
      'gemini-pro': 0.001
    };
    return costMap[model] || 0.01;
  }

  async getModelAvailability(model) {
    // Return availability percentage for the model
    const availabilityMap = {
      'gpt-4': 98.5,
      'gpt-3.5-turbo': 99.2,
      'claude-3-opus': 97.8,
      'claude-3-sonnet': 98.9,
      'claude-3-haiku': 99.1,
      'gemini-pro': 96.5
    };
    return availabilityMap[model] || 95.0;
  }

  async getModelBenchmarks(metric) {
    // Return benchmark data for all models based on the specified metric
    const benchmarks = {
      intelligence: {
        'gpt-4': 92,
        'claude-3-opus': 90,
        'gemini-pro': 87,
        'claude-3-sonnet': 85,
        'gpt-3.5-turbo': 82,
        'claude-3-haiku': 78
      },
      efficiency: {
        'claude-3-haiku': 95,
        'gpt-3.5-turbo': 92,
        'claude-3-sonnet': 90,
        'claude-3-opus': 88,
        'gemini-pro': 87,
        'gpt-4': 85
      },
      cost: {
        'claude-3-haiku': 95,
        'gemini-pro': 90,
        'gpt-3.5-turbo': 88,
        'claude-3-sonnet': 85,
        'claude-3-opus': 70,
        'gpt-4': 60
      }
    };
    
    return benchmarks[metric] || benchmarks.intelligence;
  }

  async getTrendingModels(timeframe) {
    // Get trending models based on usage patterns
    const { aiUsageHistory = [] } = await chrome.storage.local.get('aiUsageHistory');
    const now = Date.now();
    const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    const dur = windows[timeframe] ?? windows['7d'];
    const cutoff = now - dur;
    
    const recentUsage = aiUsageHistory.filter(entry => entry.timestamp > cutoff);
    const modelCounts = {};
    
    recentUsage.forEach(entry => {
      if (entry.model) {
        modelCounts[entry.model] = (modelCounts[entry.model] || 0) + 1;
      }
    });
    
    // Sort by usage count and return top models
    const trending = Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([model, count]) => ({ model, count }));
    
    return trending;
  }

  async exportComparisonData(models, format) {
    const comparison = await this.generateModelComparison(models, 'all');

    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Model,Efficiency,Performance,Cost,Availability\n';
      for (const [model, data] of Object.entries(comparison)) {
        csv += `${model},${data.efficiency},${data.performance},${data.cost},${data.availability}\n`;
      }
      return csv;
    } else {
      // Return as JSON
      return JSON.stringify(comparison, null, 2);
    }
  }

  /**
   * Carbon Footprint Tips System
   * Shows helpful tips about reducing carbon footprint
   */
  async maybeShowCarbonTip(tabId) {
    try {
      const notificationSettings = await this.getNotificationSettings();
      if (!notificationSettings.enabled) return;

      // Check cooldown for carbon tips (separate from energy tips)
      const now = Date.now();
      const { lastCarbonTipTime = 0 } = await chrome.storage.local.get('lastCarbonTipTime');
      const cooldownPeriod = 10 * 60 * 1000; // 10 minutes between carbon tips

      if (now - lastCarbonTipTime < cooldownPeriod) {
        return; // Still in cooldown
      }

      // Random chance to show (20% chance when conditions are met)
      if (Math.random() > 0.2) return;

      // Carbon footprint tips database
      const carbonTips = [
        {
          icon: '🌱',
          title: 'Carbon Tip: Close Unused Tabs',
          message: 'Each open tab uses energy. Close tabs you\'re not using to reduce your carbon footprint!',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '💡',
          title: 'Carbon Tip: Lower Screen Brightness',
          message: 'Reducing screen brightness by 50% can cut display energy use significantly.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '🔋',
          title: 'Carbon Tip: Enable Battery Saver',
          message: 'Battery saver mode reduces background activity and saves energy across all apps.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '🌍',
          title: 'Carbon Tip: Dark Mode Saves Energy',
          message: 'Dark mode can reduce screen energy consumption by up to 30% on OLED displays.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '⚡',
          title: 'Carbon Tip: Pause Auto-Play Videos',
          message: 'Disable auto-play on videos to prevent unnecessary energy consumption.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '🌳',
          title: 'Carbon Tip: Use Energy-Efficient Search',
          message: 'Every search query uses energy. Be specific to reduce multiple searches.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '📧',
          title: 'Carbon Tip: Clean Your Inbox',
          message: 'Storing emails uses data center energy. Delete old emails you don\'t need.',
          type: 'carbon_tip',
          duration: 2500
        },
        {
          icon: '☁️',
          title: 'Carbon Tip: Limit Cloud Storage',
          message: 'Cloud storage requires energy 24/7. Delete duplicate or unused files.',
          type: 'carbon_tip',
          duration: 2500
        }
      ];

      // Pick a random tip
      const tip = carbonTips[Math.floor(Math.random() * carbonTips.length)];

      // Send to content script
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'SHOW_ENERGY_TIP',
          tipData: tip
        });

        // Update last shown time
        await chrome.storage.local.set({ lastCarbonTipTime: now });
      } catch (error) {
        // Content script not ready or tab closed
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * AI Prompt Reminder System
   * Checks if user is on an AI site and shows reminder notification
   * FIXED: Now respects user's notification interval settings instead of hardcoded 30 seconds
   */
  async checkAndShowAIReminder(tabId, tab) {
    try {
      // Check if this is an AI site
      const url = (tab.url || '').toLowerCase();
      const title = (tab.title || '').toLowerCase();

      const isAISite =
        url.includes('chat.openai.com') ||
        url.includes('chatgpt.com') ||
        url.includes('claude.ai') ||
        url.includes('gemini.google.com') ||
        url.includes('perplexity.ai') ||
        title.includes('chatgpt') ||
        title.includes('claude') ||
        title.includes('gemini') ||
        title.includes('perplexity');

      if (!isAISite) {
        return; // Not an AI site, skip
      }

      // Get notification settings to respect user's interval preference
      const notificationSettings = await this.getNotificationSettings();

      // Use the user's notification interval setting (default 15 minutes for AI reminders)
      // This is MUCH less aggressive than the old 30-second interval
      const reminderIntervalMs = notificationSettings.notificationInterval || (15 * 60 * 1000);

      // Get reminder state from storage
      const result = await chrome.storage.local.get([
        'aiReminderDismissed',
        'aiReminderLastShown',
        'aiReminderSnoozedUntil',
        'aiTabOpenedTime_' + tabId
      ]);

      const now = Date.now();

      // If user dismissed permanently, don't show
      if (result.aiReminderDismissed) {
        return;
      }

      // If snoozed, check if snooze period has passed
      if (result.aiReminderSnoozedUntil && now < result.aiReminderSnoozedUntil) {
        return; // Still snoozed
      }

      // Check global cooldown - prevent showing reminders too frequently
      const lastShown = result.aiReminderLastShown || 0;
      if (now - lastShown < reminderIntervalMs) {
        return; // Still in cooldown period
      }

      // Track when this tab was first opened on an AI site
      const tabOpenedTimeKey = 'aiTabOpenedTime_' + tabId;
      const tabOpenedTime = result[tabOpenedTimeKey];

      if (!tabOpenedTime) {
        // First time seeing this tab on an AI site - record it
        await chrome.storage.local.set({ [tabOpenedTimeKey]: now });

        // Don't show reminder immediately - wait for the interval period
        // This gives users time to work without interruption
        return;
      }

      // Only show reminder if enough time has passed since tab opened
      const timeSinceTabOpened = now - tabOpenedTime;
      if (timeSinceTabOpened >= reminderIntervalMs) {
        // Send message to content script to show reminder
        try {
          await chrome.tabs.sendMessage(tabId, {
            type: 'SHOW_AI_PROMPT_REMINDER',
            data: {}
          });

          // Update last shown time
          await chrome.storage.local.set({ aiReminderLastShown: now });
        } catch (error) {
          // Content script might not be ready yet, ignore
        }
      }
    } catch (error) {
      // Silently fail - this is not critical
    }
  }
}

// Initialize the appropriate tracker based on available dependencies
let tracker;

if (ENHANCED_INTEGRATION_AVAILABLE && typeof EnergyTrackerEnhancedIntegration !== 'undefined') {
  tracker = new EnergyTrackerEnhancedIntegration();
} else if (AGENT_SYSTEM_AVAILABLE && typeof EnergyTrackerWithAgent !== 'undefined') {
  tracker = new EnergyTrackerWithAgent();
} else {
  tracker = new EnergyTracker();
}
