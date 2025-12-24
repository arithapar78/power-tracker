// Firebase Helper Functions
// Use these functions from popup.js or options.js to log data to Firebase

/**
 * Log energy savings to Firebase
 * Call this periodically (e.g., every 15 minutes or when user closes browser)
 *
 * @param {number} energySavedKWh - Incremental energy saved in kilowatt-hours (since last log)
 * @param {number} sessionDurationMinutes - Duration of session in minutes (since last log)
 * @param {number} totalEnergyKWh - Total energy consumed to date (for tracking)
 * @returns {Promise<boolean>} Success status
 *
 * Example usage:
 * await logEnergySavingsToFirebase(0.025, 30, 0.125); // Saved 0.025 kWh in 30 minutes, total 0.125 kWh
 */
async function logEnergySavingsToFirebase(energySavedKWh, sessionDurationMinutes, totalEnergyKWh = 0) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'LOG_ENERGY_SAVINGS',
      data: {
        energySavedKWh: energySavedKWh,
        sessionDurationMinutes: sessionDurationMinutes,
        totalEnergyKWh: totalEnergyKWh
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error logging energy savings:', chrome.runtime.lastError);
        resolve(false);
      } else {
        resolve(response?.success || false);
      }
    });
  });
}

/**
 * Log token savings from prompt optimization
 * Call this when user uses the prompt generator
 * 
 * @param {number} tokensSaved - Number of tokens saved
 * @param {string} aiModel - AI model name (e.g., 'GPT-4', 'Claude Sonnet 4')
 * @param {number} originalTokens - Original prompt token count
 * @param {number} optimizedTokens - Optimized prompt token count
 * @returns {Promise<boolean>} Success status
 * 
 * Example usage:
 * await logTokenSavingsToFirebase(500, 'GPT-4', 1500, 1000);
 */
async function logTokenSavingsToFirebase(tokensSaved, aiModel, originalTokens, optimizedTokens) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'LOG_TOKEN_SAVINGS',
      data: {
        tokensSaved: tokensSaved,
        aiModel: aiModel,
        originalTokens: originalTokens,
        optimizedTokens: optimizedTokens
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error logging token savings:', chrome.runtime.lastError);
        resolve(false);
      } else {
        resolve(response?.success || false);
      }
    });
  });
}

/**
 * Get aggregate statistics from Firebase
 * Shows total energy/tokens saved across ALL users
 * 
 * @returns {Promise<Object|null>} Stats object or null if error
 * 
 * Example usage:
 * const stats = await getAggregateStatsFromFirebase();
 * console.log(`Total users: ${stats.totalUsers}`);
 * console.log(`Total energy saved: ${stats.totalEnergySavedKWh} kWh`);
 * console.log(`Total tokens saved: ${stats.totalTokensSaved}`);
 */
async function getAggregateStatsFromFirebase() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'GET_AGGREGATE_STATS'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting aggregate stats:', chrome.runtime.lastError);
        resolve(null);
      } else if (response?.success) {
        resolve(response.stats);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Calculate energy saved from backend energy history
 * This estimates how much energy was saved by the extension
 * 
 * @param {Array} backendHistory - Backend energy history from storage
 * @returns {number} Total energy saved in kWh
 */
function calculateEnergySavedFromHistory(backendHistory) {
  if (!backendHistory || backendHistory.length === 0) {
    return 0;
  }
  
  // Calculate total energy that would have been used without optimization
  // Assuming 15-45% energy savings (using 30% as average)
  const AVERAGE_SAVINGS_PERCENTAGE = 0.30;
  
  const totalEnergyUsed = backendHistory.reduce((sum, entry) => {
    return sum + (entry.estimatedEnergyWh || 0);
  }, 0);
  
  // Convert Wh to kWh and calculate savings
  const energySavedKWh = (totalEnergyUsed / 1000) * AVERAGE_SAVINGS_PERCENTAGE;
  
  return energySavedKWh;
}

/**
 * Calculate tokens saved from prompt optimization
 * Call this when user successfully optimizes a prompt
 * 
 * @param {string} originalPrompt - Original prompt text
 * @param {string} optimizedPrompt - Optimized prompt text
 * @returns {Object} Token counts and savings
 */
function estimateTokenSavings(originalPrompt, optimizedPrompt) {
  // Rough estimation: ~4 characters per token on average
  const CHARS_PER_TOKEN = 4;
  
  const originalTokens = Math.ceil(originalPrompt.length / CHARS_PER_TOKEN);
  const optimizedTokens = Math.ceil(optimizedPrompt.length / CHARS_PER_TOKEN);
  const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
  
  return {
    originalTokens,
    optimizedTokens,
    tokensSaved,
    savingsPercentage: originalTokens > 0 ? ((tokensSaved / originalTokens) * 100).toFixed(1) : 0
  };
}
