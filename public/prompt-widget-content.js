/**
 * Prompt Helper Widget - Content Script
 * Grammarly-style floating widget for AI chat sites
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__promptHelperWidgetInitialized) {
    return;
  }
  window.__promptHelperWidgetInitialized = true;

  // Constants
  const WIDGET_ID = 'ph-widget-container';
  const PANEL_ID = 'ph-panel';
  const SUPPORTED_SITES = {
    'chat.openai.com': {
      name: 'ChatGPT',
      model: 'gpt-4',
      inputSelectors: [
        '#prompt-textarea',
        'textarea[data-id="root"]',
        'textarea[placeholder*="Send a message"]',
        'div[contenteditable="true"][data-placeholder]',
        'textarea'
      ]
    },
    'chatgpt.com': {
      name: 'ChatGPT',
      model: 'gpt-4',
      inputSelectors: [
        '#prompt-textarea',
        'textarea[data-id="root"]',
        'textarea[placeholder*="Message"]',
        'div[contenteditable="true"]',
        'textarea'
      ]
    },
    'claude.ai': {
      name: 'Claude',
      model: 'claude-4',
      inputSelectors: [
        'div.ProseMirror[contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        'fieldset div[contenteditable="true"]',
        '[data-placeholder] div[contenteditable="true"]',
        'div[contenteditable="true"]',
        'textarea'
      ],
      // Claude needs more lenient validation due to dynamic input sizing
      minHeight: 10
    },
    'gemini.google.com': {
      name: 'Gemini',
      model: 'gpt-4', // Use GPT-4 as approximation
      inputSelectors: [
        'rich-textarea div[contenteditable="true"]',
        'div[contenteditable="true"]',
        'textarea'
      ]
    },
    'www.perplexity.ai': {
      name: 'Perplexity',
      model: 'gpt-4',
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    },
    'perplexity.ai': {
      name: 'Perplexity',
      model: 'gpt-4',
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    },
    'grok.com': {
      name: 'Grok',
      model: 'grok-4',
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea[placeholder*="Message"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    },
    'x.com': {
      name: 'Grok',
      model: 'grok-4',
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea[placeholder*="Message"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    },
    'deepseek.com': {
      name: 'DeepSeek',
      model: 'deepseek-r1',
      inputSelectors: [
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    },
    'chat.deepseek.com': {
      name: 'DeepSeek',
      model: 'deepseek-r1',
      inputSelectors: [
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ]
    }
  };

  // State
  let currentInput = null;
  let widgetElement = null;
  let panelElement = null;
  let isGenerating = false;
  let lastResult = null;
  let repositionThrottle = null;
  let lastKnownInputTop = null;
  let positionCheckInterval = null;
  let currentTab = 0; // 0: Prompt Generator, 1: Current Energy, 2: Statistics
  let energyUpdateInterval = null;
  let statsUpdateInterval = null;
  const TAB_NAMES = ['Prompt Generator', 'Current Energy', 'Statistics'];

  /**
   * Get site configuration for current hostname
   */
  function getSiteConfig() {
    const hostname = window.location.hostname.replace(/^www\./, '');
    return SUPPORTED_SITES[hostname] || SUPPORTED_SITES['www.' + hostname] || null;
  }

  /**
   * Find the main chat input on the page
   */
  function findChatInput() {
    const config = getSiteConfig();
    if (!config) {
      console.debug('[PromptHelper] Site not supported:', window.location.hostname);
      return null;
    }

    for (const selector of config.inputSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isValidInput(el)) {
          return el;
        }
      }
    }

    // Fallback: find largest visible textarea or contenteditable
    const allInputs = [
      ...document.querySelectorAll('textarea'),
      ...document.querySelectorAll('[contenteditable="true"]')
    ];

    let bestInput = null;
    let bestArea = 0;

    for (const input of allInputs) {
      if (isValidInput(input)) {
        const rect = input.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > bestArea) {
          bestArea = area;
          bestInput = input;
        }
      }
    }

    return bestInput;
  }

  /**
   * Check if an element is a valid input
   */
  function isValidInput(el) {
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    const config = getSiteConfig();
    const minHeight = config?.minHeight || 20;
    if (rect.width < 100 || rect.height < minHeight) return false;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) < 0.1) return false;

    return true;
  }

  /**
   * Create the floating widget button
   */
  function createWidget() {
    if (document.getElementById(WIDGET_ID)) {
      widgetElement = document.getElementById(WIDGET_ID);
      return widgetElement;
    }

    const container = document.createElement('div');
    container.id = WIDGET_ID;
    container.className = 'ph-widget';
    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', 'Open Prompt Helper');
    container.title = 'Open Prompt Helper';

    // Create icon using extension icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icon-48.png');
    icon.alt = 'Prompt Helper';
    icon.className = 'ph-widget-icon';

    container.appendChild(icon);

    // Event listeners
    container.addEventListener('click', togglePanel);
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePanel();
      }
    });

    document.body.appendChild(container);
    widgetElement = container;

    return container;
  }

  /**
   * Position the widget near the input (uses fixed positioning)
   * Positioned just outside the text box, close but not overlapping
   */
  function positionWidget() {
    if (!widgetElement || !currentInput) return;

    const inputRect = currentInput.getBoundingClientRect();
    const widgetSize = 32;
    const offset = 4; // Small gap - close but outside

    // Position just outside the input - to the right of the text box
    let left = inputRect.right + offset;
    let top = inputRect.top + (inputRect.height / 2) - (widgetSize / 2);

    // Ensure widget stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If no room on the right, position at bottom-right corner of input
    if (left + widgetSize > viewportWidth - 5) {
      left = inputRect.right - widgetSize - 4;
      top = inputRect.bottom + offset;
    }

    // Boundary checks
    if (left < 5) {
      left = 5;
    }
    if (top < 5) {
      top = inputRect.bottom + offset;
    }
    if (top + widgetSize > viewportHeight - 5) {
      top = viewportHeight - widgetSize - 5;
    }

    // Fixed positioning - no scroll offset needed
    widgetElement.style.left = `${left}px`;
    widgetElement.style.top = `${top}px`;

    // Store the input's top position for change detection
    lastKnownInputTop = inputRect.top;
  }

  /**
   * Create the floating panel with tabs
   */
  function createPanel() {
    if (document.getElementById(PANEL_ID)) {
      return document.getElementById(PANEL_ID);
    }

    const config = getSiteConfig();
    const modelName = config?.name || 'AI';

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'ph-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Power Tracker Panel');

    panel.innerHTML = `
      <div class="ph-panel-header">
        <button class="ph-nav-btn ph-nav-prev" aria-label="Previous tab" title="Previous">&#8249;</button>
        <div class="ph-panel-title">
          <img src="${chrome.runtime.getURL('icon-48.png')}" alt="" class="ph-panel-logo">
          <span id="ph-tab-title">${TAB_NAMES[0]}</span>
        </div>
        <button class="ph-nav-btn ph-nav-next" aria-label="Next tab" title="Next">&#8250;</button>
        <button class="ph-close-btn" aria-label="Close panel" title="Close">&times;</button>
      </div>

      <div class="ph-tab-indicator">
        <span class="ph-tab-dot ph-tab-dot-active" data-tab="0"></span>
        <span class="ph-tab-dot" data-tab="1"></span>
        <span class="ph-tab-dot" data-tab="2"></span>
      </div>

      <!-- Tab 0: Prompt Generator -->
      <div class="ph-panel-body ph-tab-content ph-tab-active" id="ph-tab-0">
        <div class="ph-status" id="ph-status">
          Enter your prompt idea below
        </div>

        <div class="ph-input-section">
          <label for="ph-prompt-input" class="ph-label">Your prompt idea:</label>
          <textarea
            id="ph-prompt-input"
            class="ph-textarea"
            placeholder="Describe what you want to ask ${modelName}..."
            rows="4"
          ></textarea>
        </div>

        <div class="ph-options">
          <div class="ph-option-group">
            <label for="ph-level" class="ph-option-label">Optimization:</label>
            <select id="ph-level" class="ph-select">
              <option value="conservative">Conservative</option>
              <option value="balanced" selected>Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div class="ph-option-group">
            <label for="ph-model" class="ph-option-label">Model:</label>
            <select id="ph-model" class="ph-select">
              <option value="gpt-4">GPT-4</option>
              <option value="claude-4">Claude</option>
              <option value="grok-4">Grok</option>
              <option value="deepseek-r1">DeepSeek</option>
              <option value="llama-4">Llama</option>
            </select>
          </div>
        </div>

        <button id="ph-generate-btn" class="ph-btn ph-btn-primary">
          <span class="ph-btn-icon">⚡</span>
          Generate / Optimize
        </button>

        <div class="ph-result-section" id="ph-result-section" style="display: none;">
          <div class="ph-result-header">
            <span class="ph-result-title">Optimized Prompt</span>
            <span class="ph-savings" id="ph-savings"></span>
          </div>
          <div class="ph-result-text" id="ph-result-text"></div>

          <div class="ph-actions">
            <button id="ph-copy-btn" class="ph-btn ph-btn-action" title="Copy to clipboard">
              <span class="ph-btn-icon">📋</span>
              Copy
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 1: Current Energy Usage (Total = Frontend + Backend) -->
      <div class="ph-panel-body ph-tab-content" id="ph-tab-1">
        <div class="ph-energy-display">
          <div class="ph-energy-gauge">
            <div class="ph-gauge-circle">
              <svg viewBox="0 0 100 100">
                <circle class="ph-gauge-bg" cx="50" cy="50" r="42" />
                <circle class="ph-gauge-fill" id="ph-gauge-fill" cx="50" cy="50" r="42" />
              </svg>
              <div class="ph-gauge-value">
                <span id="ph-current-watts">--</span>
                <span class="ph-gauge-unit">W</span>
              </div>
            </div>
          </div>
          <div class="ph-energy-label" id="ph-energy-label">Loading...</div>
          <div class="ph-energy-subtitle">Browser + AI Backend</div>
          <div class="ph-energy-details">
            <div class="ph-energy-row">
              <span class="ph-energy-row-label">Current Page</span>
              <span class="ph-energy-row-value" id="ph-current-page">--</span>
            </div>
            <div class="ph-energy-row">
              <span class="ph-energy-row-label">Session Duration</span>
              <span class="ph-energy-row-value" id="ph-session-duration">--</span>
            </div>
            <div class="ph-energy-row">
              <span class="ph-energy-row-label">Total Energy</span>
              <span class="ph-energy-row-value" id="ph-energy-used">--</span>
            </div>
            <div class="ph-energy-row">
              <span class="ph-energy-row-label">Water Used</span>
              <span class="ph-energy-row-value" id="ph-water-used">--</span>
            </div>
            <div class="ph-energy-row">
              <span class="ph-energy-row-label">Est. Total Cost</span>
              <span class="ph-energy-row-value" id="ph-est-cost">--</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Statistics -->
      <div class="ph-panel-body ph-tab-content" id="ph-tab-2">
        <div class="ph-stats-container">
          <div class="ph-stats-header">Session Statistics</div>
          <div class="ph-stats-grid">
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-total-energy">--</div>
              <div class="ph-stat-label">Total Energy (Wh)</div>
            </div>
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-avg-power">--</div>
              <div class="ph-stat-label">Avg Power (W)</div>
            </div>
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-peak-power">--</div>
              <div class="ph-stat-label">Peak Power (W)</div>
            </div>
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-water-used">--</div>
              <div class="ph-stat-label">Water (L)</div>
            </div>
          </div>
          <div class="ph-stats-header" style="margin-top: 12px;">AI Usage</div>
          <div class="ph-stats-grid">
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-ai-queries">--</div>
              <div class="ph-stat-label">AI Queries</div>
            </div>
            <div class="ph-stat-card">
              <div class="ph-stat-value" id="ph-stat-ai-energy">--</div>
              <div class="ph-stat-label">AI Energy (Wh)</div>
            </div>
          </div>
          <div class="ph-stats-header" style="margin-top: 12px;">Total Cost</div>
          <div class="ph-stat-card" style="margin-bottom: 8px;">
            <div class="ph-stat-value" id="ph-stat-total-cost">--</div>
            <div class="ph-stat-label">Electricity + Water ($)</div>
          </div>
          <div class="ph-stats-header">Efficiency</div>
          <div class="ph-efficiency-bar">
            <div class="ph-efficiency-fill" id="ph-efficiency-fill" style="width: 0%"></div>
          </div>
          <div class="ph-efficiency-label" id="ph-efficiency-label">Calculating...</div>
        </div>
      </div>
    `;

    // Set default model based on site
    if (config?.model) {
      const modelSelect = panel.querySelector('#ph-model');
      if (modelSelect) {
        modelSelect.value = config.model;
      }
    }

    // Event listeners
    panel.querySelector('.ph-close-btn').addEventListener('click', closePanel);
    panel.querySelector('#ph-generate-btn').addEventListener('click', handleGenerate);
    panel.querySelector('#ph-copy-btn').addEventListener('click', handleCopy);
    panel.querySelector('.ph-nav-prev').addEventListener('click', () => navigateTab(-1));
    panel.querySelector('.ph-nav-next').addEventListener('click', () => navigateTab(1));

    // Tab dot click handlers
    panel.querySelectorAll('.ph-tab-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const tabIndex = parseInt(dot.dataset.tab);
        switchToTab(tabIndex);
      });
    });

    // Close on Escape key
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePanel();
      }
      if (e.key === 'ArrowLeft') {
        navigateTab(-1);
      }
      if (e.key === 'ArrowRight') {
        navigateTab(1);
      }
    });

    document.body.appendChild(panel);
    panelElement = panel;

    return panel;
  }

  /**
   * Navigate between tabs
   */
  function navigateTab(direction) {
    const newTab = (currentTab + direction + 3) % 3;
    switchToTab(newTab);
  }

  /**
   * Switch to a specific tab
   */
  function switchToTab(tabIndex) {
    if (tabIndex < 0 || tabIndex > 2) return;
    currentTab = tabIndex;

    // Update tab title
    const titleEl = panelElement?.querySelector('#ph-tab-title');
    if (titleEl) {
      titleEl.textContent = TAB_NAMES[tabIndex];
    }

    // Update tab content visibility
    panelElement?.querySelectorAll('.ph-tab-content').forEach((content, idx) => {
      content.classList.toggle('ph-tab-active', idx === tabIndex);
    });

    // Update tab indicators
    panelElement?.querySelectorAll('.ph-tab-dot').forEach((dot, idx) => {
      dot.classList.toggle('ph-tab-dot-active', idx === tabIndex);
    });

    // Start/stop updates based on tab
    if (tabIndex === 1) {
      startEnergyUpdates();
    } else {
      stopEnergyUpdates();
    }

    if (tabIndex === 2) {
      startStatsUpdates();
      updateStatistics(); // Immediate update
    } else {
      stopStatsUpdates();
    }
  }

  /**
   * Start live energy updates
   */
  function startEnergyUpdates() {
    updateCurrentEnergy();
    if (energyUpdateInterval) clearInterval(energyUpdateInterval);
    energyUpdateInterval = setInterval(updateCurrentEnergy, 2000);
  }

  /**
   * Stop energy updates
   */
  function stopEnergyUpdates() {
    if (energyUpdateInterval) {
      clearInterval(energyUpdateInterval);
      energyUpdateInterval = null;
    }
  }

  /**
   * Start live statistics updates
   */
  function startStatsUpdates() {
    if (statsUpdateInterval) clearInterval(statsUpdateInterval);
    statsUpdateInterval = setInterval(updateStatistics, 5000);
  }

  /**
   * Stop statistics updates
   */
  function stopStatsUpdates() {
    if (statsUpdateInterval) {
      clearInterval(statsUpdateInterval);
      statsUpdateInterval = null;
    }
  }

  /**
   * Update current energy display (Total = Frontend + Backend)
   * Includes water usage calculation for data center cooling
   */
  async function updateCurrentEnergy() {
    try {
      // Get frontend energy data
      const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_ENERGY' });

      // Get backend (AI) energy data - ALL history, not just recent
      const backendResponse = await chrome.runtime.sendMessage({ type: 'GET_BACKEND_ENERGY_HISTORY' });
      const backendHistory = backendResponse?.history || [];

      // Find tab data for current URL
      let tabData = null;
      let frontendWatts = 8.0;
      let frontendDuration = 0;
      let frontendEnergyWh = 0;

      if (response?.success && response.data) {
        // Find data matching current hostname
        const currentHost = window.location.hostname;
        for (const [tabId, data] of Object.entries(response.data)) {
          if (data.url && data.url.includes(currentHost)) {
            tabData = data;
            frontendWatts = data.powerWatts || 8.0;
            frontendDuration = data.duration || 0;
            frontendEnergyWh = (data.energyConsumption?.kWh || 0) * 1000;
            break;
          }
        }

        // If no match, use first available data
        if (!tabData && Object.keys(response.data).length > 0) {
          const firstKey = Object.keys(response.data)[0];
          tabData = response.data[firstKey];
          frontendWatts = tabData.powerWatts || 8.0;
          frontendDuration = tabData.duration || 0;
          frontendEnergyWh = (tabData.energyConsumption?.kWh || 0) * 1000;
        }
      }

      // Calculate TOTAL backend energy from ALL history (not just recent)
      let backendEnergyWh = 0;
      let totalAiQueries = 0;

      backendHistory.forEach(entry => {
        // Sum up all backend energy - energyWh, energy, or calculate from kWh
        if (entry.energyWh) {
          backendEnergyWh += entry.energyWh;
        } else if (entry.energy) {
          backendEnergyWh += entry.energy;
        } else if (entry.energyKwh) {
          backendEnergyWh += entry.energyKwh * 1000;
        } else if (entry.kWh) {
          backendEnergyWh += entry.kWh * 1000;
        }
        totalAiQueries++;
      });

      // Calculate total energy (frontend + backend)
      const totalEnergyWh = frontendEnergyWh + backendEnergyWh;

      // Estimate combined watts (backend energy converted to average watts over session)
      const sessionHours = frontendDuration > 0 ? frontendDuration / 3600000 : 1/60; // default 1 min
      const backendWattsEquivalent = sessionHours > 0 ? backendEnergyWh / sessionHours : 0;
      const totalWatts = frontendWatts + Math.min(backendWattsEquivalent, 30); // Cap backend contribution

      // Calculate water usage (data centers use ~1.8 liters per kWh for cooling)
      // AI queries use additional water - approximately 0.5ml per query for cooling
      const waterFromEnergy = (totalEnergyWh / 1000) * 1.8; // liters from energy
      const waterFromAI = totalAiQueries * 0.0005; // liters from AI queries (0.5ml each)
      const totalWaterLiters = waterFromEnergy + waterFromAI;

      // Calculate total cost:
      // - Electricity: ~$0.12/kWh
      // - Water: ~$0.004/liter (average US rate)
      const electricityCost = (totalEnergyWh / 1000) * 0.12;
      const waterCost = totalWaterLiters * 0.004;
      const totalCost = electricityCost + waterCost;

      // Update watts display
      const wattsEl = panelElement?.querySelector('#ph-current-watts');
      if (wattsEl) wattsEl.textContent = totalWatts.toFixed(1);

      // Update gauge
      const gaugeEl = panelElement?.querySelector('#ph-gauge-fill');
      if (gaugeEl) {
        // Map 6-65W to 0-100%
        const percentage = Math.min(100, Math.max(0, ((totalWatts - 6) / 59) * 100));
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (percentage / 100) * circumference;
        gaugeEl.style.strokeDasharray = `${circumference}`;
        gaugeEl.style.strokeDashoffset = `${offset}`;

        // Color based on power level
        if (totalWatts < 15) {
          gaugeEl.style.stroke = '#22c55e'; // Green
        } else if (totalWatts < 35) {
          gaugeEl.style.stroke = '#eab308'; // Yellow
        } else {
          gaugeEl.style.stroke = '#ef4444'; // Red
        }
      }

      // Update energy label
      const labelEl = panelElement?.querySelector('#ph-energy-label');
      if (labelEl) {
        if (totalWatts < 15) {
          labelEl.textContent = 'Low Energy Usage';
          labelEl.className = 'ph-energy-label ph-energy-good';
        } else if (totalWatts < 35) {
          labelEl.textContent = 'Moderate Energy Usage';
          labelEl.className = 'ph-energy-label ph-energy-moderate';
        } else {
          labelEl.textContent = 'High Energy Usage';
          labelEl.className = 'ph-energy-label ph-energy-high';
        }
      }

      // Update details
      const pageEl = panelElement?.querySelector('#ph-current-page');
      if (pageEl) {
        const hostname = window.location.hostname.replace(/^www\./, '');
        pageEl.textContent = hostname.length > 20 ? hostname.substring(0, 18) + '...' : hostname;
      }

      const durationEl = panelElement?.querySelector('#ph-session-duration');
      if (durationEl) durationEl.textContent = formatDuration(frontendDuration);

      const energyEl = panelElement?.querySelector('#ph-energy-used');
      if (energyEl) {
        // Show total with breakdown hint
        const totalStr = totalEnergyWh.toFixed(2);
        energyEl.textContent = `${totalStr} Wh`;
        energyEl.title = `Frontend: ${frontendEnergyWh.toFixed(2)} Wh, AI Backend: ${backendEnergyWh.toFixed(2)} Wh`;
      }

      // Update water usage
      const waterEl = panelElement?.querySelector('#ph-water-used');
      if (waterEl) {
        if (totalWaterLiters >= 1) {
          waterEl.textContent = `${totalWaterLiters.toFixed(2)} L`;
        } else {
          waterEl.textContent = `${(totalWaterLiters * 1000).toFixed(0)} mL`;
        }
        waterEl.title = `Data center cooling water usage`;
      }

      const costEl = panelElement?.querySelector('#ph-est-cost');
      if (costEl) {
        costEl.textContent = '$' + totalCost.toFixed(4);
        costEl.title = `Electricity: $${electricityCost.toFixed(4)}, Water: $${waterCost.toFixed(4)}`;
      }

    } catch (error) {
      console.debug('[PromptHelper] Energy update error:', error);

      // Show default values on error
      const wattsEl = panelElement?.querySelector('#ph-current-watts');
      if (wattsEl && wattsEl.textContent === '--') {
        wattsEl.textContent = '8.0';
      }
      const labelEl = panelElement?.querySelector('#ph-energy-label');
      if (labelEl && labelEl.textContent === 'Loading...') {
        labelEl.textContent = 'Calculating...';
      }
    }
  }

  /**
   * Update statistics display
   * Includes water usage and combined cost calculations
   */
  async function updateStatistics() {
    try {
      // Get energy history
      const historyResponse = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
      const history = historyResponse?.history || [];

      // Get backend energy history (AI usage)
      const backendResponse = await chrome.runtime.sendMessage({ type: 'GET_BACKEND_ENERGY_HISTORY' });
      const backendHistory = backendResponse?.history || [];

      // Get current energy
      const currentResponse = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_ENERGY' });
      const currentData = currentResponse?.data || {};

      // Calculate frontend statistics
      let frontendEnergy = 0;
      let totalPower = 0;
      let peakPower = 0;
      let count = 0;

      // From history
      history.forEach(entry => {
        const power = entry.powerWatts || entry.energyScore || 0;
        totalPower += power;
        if (power > peakPower) peakPower = power;
        if (entry.energyConsumption?.kWh) {
          frontendEnergy += entry.energyConsumption.kWh * 1000; // Convert to Wh
        }
        count++;
      });

      // From current tabs
      Object.values(currentData).forEach(tab => {
        const power = tab.powerWatts || 8;
        totalPower += power;
        if (power > peakPower) peakPower = power;
        if (tab.energyConsumption?.kWh) {
          frontendEnergy += tab.energyConsumption.kWh * 1000;
        }
        count++;
      });

      const avgPower = count > 0 ? totalPower / count : 0;

      // Calculate backend (AI) statistics - sum ALL entries
      let aiQueries = backendHistory.length;
      let aiEnergy = 0;
      backendHistory.forEach(entry => {
        if (entry.energyWh) {
          aiEnergy += entry.energyWh;
        } else if (entry.energy) {
          aiEnergy += entry.energy;
        } else if (entry.energyKwh) {
          aiEnergy += entry.energyKwh * 1000;
        } else if (entry.kWh) {
          aiEnergy += entry.kWh * 1000;
        }
      });

      // Calculate total energy (frontend + backend)
      const totalEnergy = frontendEnergy + aiEnergy;

      // Calculate water usage
      // Data centers: ~1.8 L/kWh for cooling
      // AI queries: ~0.5mL per query additional
      const waterFromEnergy = (totalEnergy / 1000) * 1.8;
      const waterFromAI = aiQueries * 0.0005;
      const totalWater = waterFromEnergy + waterFromAI;

      // Calculate total cost (electricity + water)
      const electricityCost = (totalEnergy / 1000) * 0.12; // $0.12/kWh
      const waterCost = totalWater * 0.004; // $0.004/L
      const totalCost = electricityCost + waterCost;

      // Update UI
      const totalEnergyEl = panelElement?.querySelector('#ph-stat-total-energy');
      if (totalEnergyEl) {
        totalEnergyEl.textContent = totalEnergy.toFixed(2);
        totalEnergyEl.title = `Frontend: ${frontendEnergy.toFixed(2)} Wh, AI: ${aiEnergy.toFixed(2)} Wh`;
      }

      const avgPowerEl = panelElement?.querySelector('#ph-stat-avg-power');
      if (avgPowerEl) avgPowerEl.textContent = avgPower.toFixed(1);

      const peakPowerEl = panelElement?.querySelector('#ph-stat-peak-power');
      if (peakPowerEl) peakPowerEl.textContent = peakPower.toFixed(1);

      const waterUsedEl = panelElement?.querySelector('#ph-stat-water-used');
      if (waterUsedEl) {
        waterUsedEl.textContent = totalWater.toFixed(2);
        waterUsedEl.title = 'Data center cooling water';
      }

      const totalCostEl = panelElement?.querySelector('#ph-stat-total-cost');
      if (totalCostEl) {
        totalCostEl.textContent = totalCost.toFixed(4);
        totalCostEl.title = `Electricity: $${electricityCost.toFixed(4)}, Water: $${waterCost.toFixed(4)}`;
      }

      const aiQueriesEl = panelElement?.querySelector('#ph-stat-ai-queries');
      if (aiQueriesEl) aiQueriesEl.textContent = aiQueries;

      const aiEnergyEl = panelElement?.querySelector('#ph-stat-ai-energy');
      if (aiEnergyEl) aiEnergyEl.textContent = aiEnergy.toFixed(2);

      // Calculate efficiency (lower power = better, 0-100)
      const efficiencyScore = Math.max(0, Math.min(100, 100 - (avgPower / 65 * 100)));

      const efficiencyFillEl = panelElement?.querySelector('#ph-efficiency-fill');
      if (efficiencyFillEl) {
        efficiencyFillEl.style.width = `${efficiencyScore}%`;
        if (efficiencyScore >= 70) {
          efficiencyFillEl.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
        } else if (efficiencyScore >= 40) {
          efficiencyFillEl.style.background = 'linear-gradient(90deg, #eab308, #facc15)';
        } else {
          efficiencyFillEl.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        }
      }

      const efficiencyLabelEl = panelElement?.querySelector('#ph-efficiency-label');
      if (efficiencyLabelEl) {
        if (efficiencyScore >= 70) {
          efficiencyLabelEl.textContent = `Excellent Efficiency (${efficiencyScore.toFixed(0)}%)`;
        } else if (efficiencyScore >= 40) {
          efficiencyLabelEl.textContent = `Moderate Efficiency (${efficiencyScore.toFixed(0)}%)`;
        } else {
          efficiencyLabelEl.textContent = `Low Efficiency (${efficiencyScore.toFixed(0)}%)`;
        }
      }
    } catch (error) {
      console.debug('[PromptHelper] Statistics update error:', error);
    }
  }

  /**
   * Format duration in human readable format
   */
  function formatDuration(ms) {
    if (!ms || ms < 0) return '0s';
    const seconds = Math.floor(ms / 1000);
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

  /**
   * Position the panel near the widget (uses fixed positioning)
   */
  function positionPanel() {
    if (!panelElement || !currentInput) return;

    const inputRect = currentInput.getBoundingClientRect();
    const panelWidth = 360;
    const panelHeight = panelElement.offsetHeight || 400;
    const offset = 10;

    // Try to position above the input
    let left = inputRect.left;
    let top = inputRect.top - panelHeight - offset;

    // If not enough space above, position below
    if (top < 10) {
      top = inputRect.bottom + offset;
    }

    // Ensure panel stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + panelWidth > viewportWidth - 10) {
      left = viewportWidth - panelWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (top + panelHeight > viewportHeight - 10) {
      top = viewportHeight - panelHeight - 10;
    }

    // Fixed positioning - no scroll offset needed
    panelElement.style.left = `${left}px`;
    panelElement.style.top = `${top}px`;
  }

  /**
   * Toggle the panel open/closed
   */
  function togglePanel() {
    if (!panelElement) {
      createPanel();
    }

    const isVisible = panelElement.classList.contains('ph-panel-visible');

    if (isVisible) {
      closePanel();
    } else {
      openPanel();
    }
  }

  /**
   * Open the panel
   */
  function openPanel() {
    if (!panelElement) {
      createPanel();
    }

    positionPanel();
    panelElement.classList.add('ph-panel-visible');
    widgetElement?.classList.add('ph-widget-active');

    // Focus the input
    setTimeout(() => {
      const input = panelElement.querySelector('#ph-prompt-input');
      if (input) input.focus();
    }, 100);
  }

  /**
   * Close the panel
   */
  function closePanel() {
    if (panelElement) {
      panelElement.classList.remove('ph-panel-visible');
    }
    if (widgetElement) {
      widgetElement.classList.remove('ph-widget-active');
    }
    // Stop any active update intervals
    stopEnergyUpdates();
    stopStatsUpdates();
  }

  /**
   * Update status message
   */
  function updateStatus(message, type = 'info') {
    const statusEl = panelElement?.querySelector('#ph-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `ph-status ph-status-${type}`;
    }
  }

  /**
   * Handle generate button click
   */
  async function handleGenerate() {
    if (isGenerating) return;

    const promptInput = panelElement?.querySelector('#ph-prompt-input');
    const levelSelect = panelElement?.querySelector('#ph-level');
    const modelSelect = panelElement?.querySelector('#ph-model');
    const generateBtn = panelElement?.querySelector('#ph-generate-btn');
    const resultSection = panelElement?.querySelector('#ph-result-section');

    const input = promptInput?.value?.trim();
    if (!input) {
      updateStatus('Please enter a prompt to optimize', 'error');
      return;
    }

    const level = levelSelect?.value || 'balanced';
    const model = modelSelect?.value || 'gpt-4';

    isGenerating = true;
    updateStatus('Generating optimized prompt...', 'loading');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="ph-spinner"></span> Generating...';
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'PROMPT_HELPER_GENERATE',
        payload: {
          input,
          level,
          model,
          source: 'ai_site_widget',
          hostname: window.location.hostname
        }
      });

      if (response?.success) {
        lastResult = response;
        displayResult(response);
        updateStatus('Done! Here\'s your optimized prompt.', 'success');
      } else {
        const errorMsg = response?.error || 'Could not generate prompt, please try again.';
        updateStatus(`Error: ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error('[PromptHelper] Generate error:', error);
      if (chrome.runtime.lastError) {
        updateStatus('Extension error. Please refresh the page.', 'error');
      } else {
        updateStatus('Error: Could not generate prompt, please try again.', 'error');
      }
    } finally {
      isGenerating = false;
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="ph-btn-icon">⚡</span> Generate / Optimize';
      }
    }
  }

  /**
   * Display the optimization result
   */
  function displayResult(result) {
    const resultSection = panelElement?.querySelector('#ph-result-section');
    const resultText = panelElement?.querySelector('#ph-result-text');
    const savings = panelElement?.querySelector('#ph-savings');

    if (!resultSection || !resultText) return;

    resultText.textContent = result.resultPrompt || result.optimized || '';

    if (savings && result.stats) {
      const { tokensSaved, percentageSaved } = result.stats;
      savings.textContent = `${tokensSaved || 0} tokens saved (${percentageSaved || 0}%)`;
    }

    resultSection.style.display = 'block';
  }

  /**
   * Handle copy button click
   */
  async function handleCopy() {
    if (!lastResult) {
      updateStatus('No result to copy', 'error');
      return;
    }

    const text = lastResult.resultPrompt || lastResult.optimized || '';

    try {
      await navigator.clipboard.writeText(text);
      updateStatus('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('[PromptHelper] Copy error:', error);
      updateStatus('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Throttled reposition handler
   */
  function handleReposition() {
    if (repositionThrottle) return;

    repositionThrottle = setTimeout(() => {
      positionWidget();
      if (panelElement?.classList.contains('ph-panel-visible')) {
        positionPanel();
      }
      repositionThrottle = null;
    }, 100);
  }

  /**
   * Start checking if the input has moved significantly
   */
  function startPositionCheck() {
    if (positionCheckInterval) {
      clearInterval(positionCheckInterval);
    }

    positionCheckInterval = setInterval(() => {
      if (!currentInput || !widgetElement) return;

      // Check if input is still in DOM
      if (!document.body.contains(currentInput)) {
        const newInput = findChatInput();
        if (newInput) {
          currentInput = newInput;
          lastKnownInputTop = null;
          positionWidget();
        }
        return;
      }

      // Check if input position changed significantly (more than 20px)
      const inputRect = currentInput.getBoundingClientRect();
      if (lastKnownInputTop !== null && Math.abs(inputRect.top - lastKnownInputTop) > 20) {
        positionWidget();
      }
    }, 1000); // Check every 1 second - very gentle
  }

  /**
   * Try to initialize the widget - called when input might be available
   */
  function tryInitWidget() {
    if (widgetElement) return; // Already created

    currentInput = findChatInput();
    if (currentInput) {
      createWidget();
      positionWidget();
      startPositionCheck();
    }
  }

  /**
   * Initialize the widget
   */
  function init() {
    const config = getSiteConfig();
    if (!config) {
      console.debug('[PromptHelper] Site not supported');
      return;
    }

    // Find input and create widget
    tryInitWidget();

    // Set up MutationObserver to detect DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check if we need to re-find the input or create widget
      if (!widgetElement || !currentInput || !document.body.contains(currentInput)) {
        const newInput = findChatInput();
        if (newInput && newInput !== currentInput) {
          currentInput = newInput;
          lastKnownInputTop = null;
          if (!widgetElement) {
            createWidget();
          }
          positionWidget();
          startPositionCheck();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Reposition on resize only (fixed positioning handles viewport changes)
    window.addEventListener('resize', handleReposition, { passive: true });

    // Also watch for input focus to update position
    document.addEventListener('focusin', (e) => {
      const target = e.target;
      if (target && (target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        const config = getSiteConfig();
        if (config) {
          for (const selector of config.inputSelectors) {
            if (target.matches(selector)) {
              currentInput = target;
              lastKnownInputTop = null;
              positionWidget();
              break;
            }
          }
        }
      }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (panelElement?.classList.contains('ph-panel-visible')) {
        if (!panelElement.contains(e.target) && !widgetElement?.contains(e.target)) {
          closePanel();
        }
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure site's own scripts have run
    setTimeout(init, 500);
  }

  // Also try again after a longer delay for SPAs
  // Multiple retries to handle slow-loading chat interfaces like Claude
  const retryDelays = [2000, 4000, 6000];
  retryDelays.forEach(delay => {
    setTimeout(() => {
      if (!widgetElement && getSiteConfig()) {
        tryInitWidget();
      }
    }, delay);
  });

})();
