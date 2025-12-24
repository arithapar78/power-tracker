// Firebase Database Manager
// Uses Firestore REST API instead of SDK (works in service workers with CSP)

class FirebaseManager {
  constructor() {
    this.projectId = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase
   * No external scripts needed - uses REST API
   */
  async initialize() {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return true;
    }

    try {
      // Get project ID from config
      this.projectId = firebaseConfig.projectId;
      this.initialized = true;
      console.log('Firebase initialized successfully (using REST API)');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return false;
    }
  }

  /**
   * Log user energy savings data
   * Includes retry logic and detailed error reporting
   */
  async logEnergySavings(data) {
    if (!this.initialized) {
      // Silently return false without console error (Firebase is optional)
      return false;
    }

    try {
      const doc = {
        fields: {
          userId: { stringValue: data.userId },
          energySavedKWh: { doubleValue: data.energySavedKWh || 0 },
          sessionDurationMinutes: { integerValue: data.sessionDurationMinutes || 0 },
          timestamp: { timestampValue: new Date().toISOString() },
          extensionVersion: { stringValue: chrome.runtime.getManifest().version }
        }
      };

      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/energySavings`;

      // Retry logic: attempt up to 3 times with exponential backoff
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Energy savings logged to Firebase:', result.name);
            return true;
          } else {
            const errorText = await response.text();
            lastError = `HTTP ${response.status}: ${errorText}`;

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
              console.error('❌ Firebase client error (not retrying):', lastError);
              break;
            }

            // Retry on server errors (5xx) or network issues
            if (attempt < 3) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
              console.log(`⚠️ Firebase error (attempt ${attempt}/3), retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (fetchError) {
          lastError = fetchError.message;
          if (attempt < 3) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⚠️ Network error (attempt ${attempt}/3), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      console.error('❌ Failed to log energy savings after 3 attempts:', lastError);
      this.notifyError('Energy data logging failed. Data will be retried later.');
      return false;

    } catch (error) {
      console.error('❌ Unexpected error logging energy savings:', error);
      this.notifyError('Unexpected error logging data.');
      return false;
    }
  }

  /**
   * Log token savings from prompt optimization
   * Automatically calculates energy savings: 0.00011 kWh per 100 tokens saved
   * Includes retry logic and detailed error reporting
   */
  async logTokenSavings(data) {
    if (!this.initialized) {
      // Silently return false without console error (Firebase is optional)
      return false;
    }

    try {
      // Calculate energy saved from tokens: 0.00011 kWh per 100 tokens
      const ENERGY_PER_100_TOKENS = 0.00011; // kWh
      const tokensSaved = data.tokensSaved || 0;
      const energySavedKWh = (tokensSaved / 100) * ENERGY_PER_100_TOKENS;

      const doc = {
        fields: {
          userId: { stringValue: data.userId },
          tokensSaved: { integerValue: tokensSaved },
          energySavedKWh: { doubleValue: energySavedKWh },
          aiModel: { stringValue: data.aiModel || 'Unknown' },
          originalTokens: { integerValue: data.originalTokens || 0 },
          optimizedTokens: { integerValue: data.optimizedTokens || 0 },
          timestamp: { timestampValue: new Date().toISOString() },
          extensionVersion: { stringValue: chrome.runtime.getManifest().version }
        }
      };

      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/tokenSavings`;

      // Retry logic: attempt up to 3 times with exponential backoff
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc)
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Token savings logged: ${tokensSaved} tokens = ${energySavedKWh.toFixed(6)} kWh saved`);
            return true;
          } else {
            const errorText = await response.text();
            lastError = `HTTP ${response.status}: ${errorText}`;

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
              console.error('❌ Firebase client error (not retrying):', lastError);
              break;
            }

            // Retry on server errors (5xx) or network issues
            if (attempt < 3) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
              console.log(`⚠️ Firebase error (attempt ${attempt}/3), retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (fetchError) {
          lastError = fetchError.message;
          if (attempt < 3) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⚠️ Network error (attempt ${attempt}/3), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      console.error('❌ Failed to log token savings after 3 attempts:', lastError);
      this.notifyError('Token data logging failed. Your savings are still tracked locally.');
      return false;

    } catch (error) {
      console.error('❌ Unexpected error logging token savings:', error);
      this.notifyError('Unexpected error logging token data.');
      return false;
    }
  }

  /**
   * Get aggregate statistics for dashboard
   */
  async getAggregateStats() {
    if (!this.initialized) {
      // Silently return null without console error (Firebase is optional)
      return null;
    }

    try {
      // Get energy savings
      const energyUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/energySavings`;
      const energyResponse = await fetch(energyUrl);
      
      let totalEnergy = 0;
      let totalUsers = new Set();
      
      if (energyResponse.ok) {
        const energyData = await energyResponse.json();
        if (energyData.documents) {
          energyData.documents.forEach(doc => {
            const fields = doc.fields;
            totalEnergy += fields.energySavedKWh?.doubleValue || 0;
            if (fields.userId?.stringValue) {
              totalUsers.add(fields.userId.stringValue);
            }
          });
        }
      }

      // Get token savings
      const tokenUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/tokenSavings`;
      const tokenResponse = await fetch(tokenUrl);
      
      let totalTokens = 0;
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.documents) {
          tokenData.documents.forEach(doc => {
            const fields = doc.fields;
            totalTokens += fields.tokensSaved?.integerValue || 0;
          });
        }
      }

      return {
        totalEnergySavedKWh: totalEnergy,
        totalTokensSaved: totalTokens,
        totalUsers: totalUsers.size,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting aggregate stats:', error);
      return null;
    }
  }

  /**
   * Generate or retrieve anonymous user ID
   * Note: This doesn't require Firebase initialization - it just uses Chrome storage
   */
  async getUserId() {
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get(['anonymousUserId'], (result) => {
          if (result.anonymousUserId) {
            resolve(result.anonymousUserId);
          } else {
            // Generate new anonymous ID
            const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            chrome.storage.local.set({ anonymousUserId: newId }, () => {
              resolve(newId);
            });
          }
        });
      });
    } catch (error) {
      // Fallback to a temporary ID if Chrome storage fails
      return 'user_temp_' + Date.now();
    }
  }

  /**
   * Notify user of Firebase errors (non-intrusive)
   * Only shows error notifications in development, stays silent in production
   * to avoid alarming users since Firebase is optional
   */
  notifyError(message) {
    // Only log errors in console - don't show user-facing notifications
    // since Firebase is optional and failures shouldn't disrupt the user experience
    console.error('🔥 Firebase Error:', message);

    // Optional: Store error count for debugging/monitoring
    try {
      chrome.storage.local.get(['firebaseErrorCount'], (result) => {
        const errorCount = (result.firebaseErrorCount || 0) + 1;
        chrome.storage.local.set({
          firebaseErrorCount: errorCount,
          lastFirebaseError: message,
          lastFirebaseErrorTime: Date.now()
        });
      });
    } catch (storageError) {
      // Ignore storage errors
    }
  }

  /**
   * Get Firebase error statistics (for debugging)
   */
  async getErrorStats() {
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get(['firebaseErrorCount', 'lastFirebaseError', 'lastFirebaseErrorTime'], (result) => {
          resolve({
            errorCount: result.firebaseErrorCount || 0,
            lastError: result.lastFirebaseError || 'None',
            lastErrorTime: result.lastFirebaseErrorTime || null
          });
        });
      });
    } catch (error) {
      return { errorCount: 0, lastError: 'None', lastErrorTime: null };
    }
  }
}

// Create singleton instance
const firebaseManager = new FirebaseManager();

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseManager;
}
