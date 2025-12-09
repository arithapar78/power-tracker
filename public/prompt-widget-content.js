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
        '[data-placeholder] div[contenteditable="true"]',
        'fieldset div[contenteditable="true"]',
        'div[contenteditable="true"]',
        'textarea'
      ]
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
    if (rect.width < 100 || rect.height < 20) return false;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) < 0.1) return false;

    return true;
  }

  /**
   * Get the value from an input element (textarea or contenteditable)
   */
  function getInputValue(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value || '';
    }
    return el.innerText || el.textContent || '';
  }

  /**
   * Set the value of an input element
   */
  function setInputValue(el, value) {
    if (!el) return;

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.contentEditable === 'true') {
      // For contenteditable elements (like Claude's input)
      el.innerHTML = '';

      // Handle ProseMirror editors
      if (el.classList.contains('ProseMirror')) {
        const p = document.createElement('p');
        p.textContent = value;
        el.appendChild(p);
      } else {
        el.textContent = value;
      }

      // Dispatch events to notify the app
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

      // Some apps need focus events
      el.focus();
      el.dispatchEvent(new Event('focus', { bubbles: true }));
    }
  }

  /**
   * Append value to an input element
   */
  function appendInputValue(el, value) {
    if (!el) return;
    const currentValue = getInputValue(el);
    const separator = currentValue.trim() ? '\n\n' : '';
    setInputValue(el, currentValue + separator + value);
  }

  /**
   * Create the floating widget button
   */
  function createWidget() {
    if (document.getElementById(WIDGET_ID)) {
      return document.getElementById(WIDGET_ID);
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
   */
  function positionWidget() {
    if (!widgetElement || !currentInput) return;

    const inputRect = currentInput.getBoundingClientRect();
    const widgetSize = 36;
    const offset = 12;

    // Position at the right side of the input, vertically centered
    let left = inputRect.right - widgetSize - offset;
    let top = inputRect.top + (inputRect.height / 2) - (widgetSize / 2);

    // Ensure widget stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + widgetSize > viewportWidth - 10) {
      left = viewportWidth - widgetSize - 10;
    }
    if (left < 10) {
      left = inputRect.right + offset;
    }
    if (top < 10) {
      top = 10;
    }
    if (top + widgetSize > viewportHeight - 10) {
      top = viewportHeight - widgetSize - 10;
    }

    // Fixed positioning - no scroll offset needed
    widgetElement.style.left = `${left}px`;
    widgetElement.style.top = `${top}px`;

    // Store the input's top position for change detection
    lastKnownInputTop = inputRect.top;
  }

  /**
   * Create the floating panel
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
    panel.setAttribute('aria-label', 'Prompt Helper Panel');

    panel.innerHTML = `
      <div class="ph-panel-header">
        <div class="ph-panel-title">
          <img src="${chrome.runtime.getURL('icon-48.png')}" alt="" class="ph-panel-logo">
          <span>Prompt Helper</span>
        </div>
        <button class="ph-close-btn" aria-label="Close panel" title="Close">&times;</button>
      </div>

      <div class="ph-panel-body">
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
            <button id="ph-replace-btn" class="ph-btn ph-btn-action" title="Replace text box content">
              <span class="ph-btn-icon">↻</span>
              Replace
            </button>
            <button id="ph-append-btn" class="ph-btn ph-btn-action" title="Append to text box">
              <span class="ph-btn-icon">+</span>
              Append
            </button>
            <button id="ph-copy-btn" class="ph-btn ph-btn-action" title="Copy to clipboard">
              <span class="ph-btn-icon">📋</span>
              Copy
            </button>
          </div>
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
    panel.querySelector('#ph-replace-btn').addEventListener('click', handleReplace);
    panel.querySelector('#ph-append-btn').addEventListener('click', handleAppend);
    panel.querySelector('#ph-copy-btn').addEventListener('click', handleCopy);

    // Close on Escape key
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    });

    document.body.appendChild(panel);
    panelElement = panel;

    return panel;
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
   * Handle replace button click
   */
  function handleReplace() {
    if (!lastResult || !currentInput) {
      updateStatus('No result to insert', 'error');
      return;
    }

    const text = lastResult.resultPrompt || lastResult.optimized || '';
    setInputValue(currentInput, text);
    updateStatus('Replaced text box content', 'success');

    // Close panel after action
    setTimeout(closePanel, 800);
  }

  /**
   * Handle append button click
   */
  function handleAppend() {
    if (!lastResult || !currentInput) {
      updateStatus('No result to insert', 'error');
      return;
    }

    const text = lastResult.resultPrompt || lastResult.optimized || '';
    appendInputValue(currentInput, text);
    updateStatus('Appended to text box', 'success');

    // Close panel after action
    setTimeout(closePanel, 800);
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
   * Initialize the widget
   */
  function init() {
    const config = getSiteConfig();
    if (!config) {
      console.debug('[PromptHelper] Site not supported');
      return;
    }

    // Find input and create widget
    currentInput = findChatInput();
    if (!currentInput) {
      console.debug('[PromptHelper] No suitable input found, will retry...');
    } else {
      createWidget();
      positionWidget();
      startPositionCheck();
    }

    // Set up MutationObserver to detect DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check if we need to re-find the input
      if (!currentInput || !document.body.contains(currentInput)) {
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
  setTimeout(() => {
    if (!widgetElement && getSiteConfig()) {
      currentInput = findChatInput();
      if (currentInput) {
        createWidget();
        positionWidget();
        startPositionCheck();
      }
    }
  }, 2000);

})();
