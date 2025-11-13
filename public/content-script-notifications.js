// ===========================
// Power AI - CSP-Compliant In-Page Notification System
// Secure implementation for Gmail, Docs, and other secure sites
// ===========================

(() => {
  // Prevent multiple initialization
  if (window.__powerAINotificationSystemLoaded) {
    return;
  }

  // Security checks for CSP compliance AND sites where notifications cause issues
  const isSecureSite = () => {
    try {
      const hostname = window.location.hostname.toLowerCase();
      const secureHosts = ['mail.google.com', 'docs.google.com', 'drive.google.com', 'gmail.com'];
      return secureHosts.some(host => hostname.includes(host));
    } catch (error) {
      return false;
    }
  };

  // Check if we should disable notifications on this site
  const shouldDisableNotifications = () => {
    try {
      const hostname = window.location.hostname.toLowerCase();
      // Sites where notifications have been reported to display incorrectly
      const problematicSites = [
        'claude.ai',
        'chat.openai.com',
        'chatgpt.com',
        'netflix.com',
        'youtube.com',
        'youtu.be',
        'gemini.google.com',
        'perplexity.ai',
        'bard.google.com',
        'bing.com/chat',
        'poe.com',
        'mail.google.com',
        'docs.google.com',
        'drive.google.com',
        'gmail.com'
      ];
      return problematicSites.some(site => hostname.includes(site));
    } catch (error) {
      return false;
    }
  };

  const hasStrictCSP = () => {
    try {
      // Check for Trusted Types policy (modern CSP indicator)
      if (typeof window.trustedTypes !== 'undefined') {
        return true;
      }
      
      // Check for Content-Security-Policy header indicators
      const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      if (metaTags.length > 0) {
        return true;
      }
      
      // Check for common secure site indicators
      const hostname = window.location.hostname.toLowerCase();
      const secureHosts = ['mail.google.com', 'docs.google.com', 'drive.google.com', 'gmail.com'];
      
      return secureHosts.some(host => hostname.includes(host));
    } catch (error) {
      // If we can't detect, assume strict CSP for safety
      return true;
    }
  };

  /**
   * CSP-Compliant Energy Tip Notification Manager
   * Features: Safe DOM creation, Chrome API error handling, demo mode
   */
  class EnergyTipNotificationManager {
    constructor() {
      this.notifications = [];
      this.container = null;
      this.isInitialized = false;
      this.messageListener = null;
      this.settings = null;
      this.apiAvailable = false;
      this.nextId = 1;
      this.isSecureSite = isSecureSite();
      this.hasStrictCSP = hasStrictCSP();
      this.notificationsDisabled = shouldDisableNotifications();

      // Hover management for graceful dismiss
      this.hoverTimers = new Map(); // Maps notification elements to their grace period timers
      this.autoDismissTimers = new Map(); // Maps notification elements to their auto-dismiss timers

      // Don't initialize if notifications are disabled on this site
      if (!this.notificationsDisabled) {
        this.init();
      }
    }

    init() {
      try {
        // Enhanced security logging
        if (this.isSecureSite) {
        }
        if (this.hasStrictCSP) {
        }
        
        // Check API availability first
        this.apiAvailable = this.checkChromeApiAvailability();
        
        if (this.apiAvailable) {
          this.setupChromeIntegration();
        } else {
          this.setupStandaloneMode();
        }
        
        this.createNotificationContainer();
        this.injectAnimationStyles();
        this.loadSettings();
        this.isInitialized = true;

      } catch (error) {
        this.setupStandaloneMode();
      }
    }

    injectAnimationStyles() {
      // Add CSS animations for prominent notifications
      if (document.getElementById('power-ai-animations')) {
        return; // Already injected
      }

      const styleElement = document.createElement('style');
      styleElement.id = 'power-ai-animations';
      styleElement.textContent = `
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1000px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 20px 70px rgba(59, 130, 246, 0.5), 0 0 0 1000px rgba(0, 0, 0, 0.5);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .prominent-reminder {
          animation: pulse-glow 2s ease-in-out infinite !important;
        }
      `;

      if (document.head) {
        document.head.appendChild(styleElement);
      }
    }

    checkChromeApiAvailability() {
      try {
        // Comprehensive Chrome API check
        if (typeof chrome === 'undefined') {
          return false;
        }
        
        if (!chrome.runtime) {
          return false;
        }
        
        if (!chrome.runtime.id) {
          return false;
        }
        
        if (!chrome.runtime.sendMessage) {
          return false;
        }
        
        return true;
        
      } catch (error) {
        return false;
      }
    }

    setupChromeIntegration() {
      try {
        // Set up message listener for extension communication
        if (chrome.runtime.onMessage) {
          this.messageListener = (message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
          };
          chrome.runtime.onMessage.addListener(this.messageListener);
        }
      } catch (error) {
        this.apiAvailable = false;
        this.setupStandaloneMode();
      }
    }

    setupStandaloneMode() {

      // Use default settings when Chrome APIs aren't available
      this.settings = {
        notificationsEnabled: true,
        notificationFrequency: 'normal',
        notificationPosition: 'top-right',
        darkMode: this.detectDarkMode()
      };

      // Simulate demo notifications
      setTimeout(() => {
        this.showDemoTip();
      }, 3000);
    }

    detectDarkMode() {
      try {
        // Check for system dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return true;
        }

        // Check for dark theme indicators in the page
        const bodyClass = document.body.className.toLowerCase();
        const htmlClass = document.documentElement.className.toLowerCase();

        return bodyClass.includes('dark') || htmlClass.includes('dark') ||
               bodyClass.includes('night') || htmlClass.includes('night');
      } catch (error) {
        return false;
      }
    }

    handleMessage(message, sender, sendResponse) {
      try {
        // Block all notification messages if disabled on this site
        if (this.notificationsDisabled) {
          if (sendResponse) {
            sendResponse({ success: false, error: 'Notifications disabled on this site' });
          }
          return true;
        }

        switch (message.type) {
          case 'SHOW_ENERGY_TIP':
            this.showTip(message.tipData);
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
          case 'SHOW_AI_PROMPT_REMINDER':
            this.showAIPromptReminder(message.data);
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
          case 'HIDE_ENERGY_TIP':
            if (message.id) {
              this.hideTip(message.id);
            } else {
              this.hideAllTips();
            }
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
          case 'UPDATE_NOTIFICATION_SETTINGS':
            this.updateSettings(message.settings);
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
        }
      } catch (error) {
        if (sendResponse) {
          sendResponse({ success: false, error: error.message });
        }
      }
      return true;
    }

    async loadSettings() {
      try {
        if (this.apiAvailable) {
          const response = await this.sendMessage({ type: 'GET_SETTINGS' });
          
          if (response && response.success) {
            this.settings = response.settings;
          } else {
            this.useDefaultSettings();
          }
        } else {
          this.useDefaultSettings();
        }
      } catch (error) {
        this.useDefaultSettings();
      }
    }

    useDefaultSettings() {
      this.settings = {
        notificationsEnabled: true,
        notificationFrequency: 'normal',
        notificationPosition: 'top-right',
        duration: 5500, // 5.5 seconds default
        darkMode: this.detectDarkMode()
      };
    }

    async sendMessage(message) {
      try {
        if (!this.apiAvailable) {
          return { success: false, error: 'API not available' };
        }
        
        if (!chrome.runtime || !chrome.runtime.id) {
          this.apiAvailable = false;
          return { success: false, error: 'Context invalid' };
        }
        
        const response = await chrome.runtime.sendMessage(message);
        return response || { success: false, error: 'No response' };
        
      } catch (error) {
        
        // Mark API as unavailable if connection fails
        if (error.message.includes('Could not establish connection') ||
            error.message.includes('Extension context invalidated')) {
          this.apiAvailable = false;
        }
        
        return { success: false, error: error.message };
      }
    }

    createNotificationContainer() {
      if (this.container) return;
      
      try {
        // Wait for document.body to be available
        if (!document.body) {
          setTimeout(() => this.createNotificationContainer(), 100);
          return;
        }

        this.container = this.createSecureElement('div', {
          id: 'power-ai-notification-container',
          className: 'power-ai-notifications',
          styles: {
            position: 'fixed',
            zIndex: '999999',
            pointerEvents: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            right: '30px',
            top: '80px'
          }
        });
        
        if (this.container && document.body) {
          document.body.appendChild(this.container);
        } else {
          // Body not ready, retry
          this.container = null;
          setTimeout(() => this.createNotificationContainer(), 100);
        }
      } catch (error) {
        // Retry container creation after a delay
        this.container = null;
        setTimeout(() => {
          if (!this.container) {
            this.createNotificationContainer();
          }
        }, 1000);
      }
    }

    // Safe DOM creation that works with Content Security Policy
    createSecureElement(tagName, options = {}) {
      try {
        const element = document.createElement(tagName);
        
        // Set attributes safely
        if (options.className) {
          element.className = options.className;
        }
        
        if (options.id) {
          element.id = options.id;
        }
        
        // Set text content safely (never use innerHTML)
        if (options.textContent) {
          element.textContent = options.textContent;
        }
        
        // Set styles safely
        if (options.styles) {
          Object.keys(options.styles).forEach(property => {
            element.style[property] = options.styles[property];
          });
        }
        
        // Add event listeners safely
        if (options.onclick) {
          element.addEventListener('click', options.onclick);
        }
        
        if (options.onmouseenter) {
          element.addEventListener('mouseenter', options.onmouseenter);
        }
        
        if (options.onmouseleave) {
          element.addEventListener('mouseleave', options.onmouseleave);
        }
        
        return element;
        
      } catch (error) {
        return null;
      }
    }

    createNotificationElement(tipData) {
      try {
        // Determine if this is a prominent AI reminder
        const isProminent = tipData.isProminent || tipData.type === 'ai_prompt_reminder';

        // Create main notification container - CSP compliant
        const notification = this.createSecureElement('div', {
          className: `energy-tip-notification ${this.settings?.darkMode ? 'dark-mode' : ''} ${isProminent ? 'prominent-reminder' : ''}`,
          styles: {
            position: 'fixed',
            top: isProminent ? '50%' : '80px',
            right: isProminent ? '50%' : '30px',
            transform: isProminent ? 'translate(50%, -50%) scale(0.9)' : 'translateX(100%)',
            opacity: isProminent ? '0' : '1',
            background: isProminent
              ? (this.settings?.darkMode ? 'rgba(20, 30, 48, 0.98)' : 'rgba(255, 255, 255, 0.98)')
              : (this.settings?.darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
            backdropFilter: 'blur(16px)',
            border: isProminent
              ? (this.settings?.darkMode ? '3px solid #3b82f6' : '3px solid #3b82f6')
              : (this.settings?.darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)'),
            borderRadius: isProminent ? '16px' : '12px',
            padding: isProminent ? '32px 40px' : '20px 24px',
            maxWidth: isProminent ? '500px' : '350px',
            minWidth: isProminent ? '450px' : '300px',
            boxShadow: isProminent
              ? '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1000px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.12)',
            zIndex: '2147483647',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            color: this.settings?.darkMode ? '#f1f5f9' : '#1f2937',
            pointerEvents: 'auto',
            animation: isProminent ? 'pulse-glow 2s ease-in-out infinite' : 'none'
          },
          onmouseenter: () => {
            this.handleNotificationMouseEnter(notification);
          },
          onmouseleave: () => {
            this.handleNotificationMouseLeave(notification);
          }
        });

        if (!notification) {
          return null;
        }
        
        // Create header section
        const header = this.createSecureElement('div', {
          styles: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px'
          }
        });

        // Create icon
        const icon = this.createSecureElement('span', {
          textContent: tipData.icon || '⚡',
          styles: {
            fontSize: isProminent ? '32px' : '20px',
            marginRight: isProminent ? '16px' : '10px',
            animation: isProminent ? 'bounce 1s ease-in-out infinite' : 'none'
          }
        });

        // Create title
        const title = this.createSecureElement('span', {
          textContent: tipData.title || 'Energy Tip',
          styles: {
            fontWeight: isProminent ? '700' : '600',
            fontSize: isProminent ? '20px' : '14px',
            flex: '1',
            background: isProminent ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'none',
            WebkitBackgroundClip: isProminent ? 'text' : 'unset',
            WebkitTextFillColor: isProminent ? 'transparent' : 'inherit',
            backgroundClip: isProminent ? 'text' : 'unset'
          }
        });
        
        // Create close button
        const closeButton = this.createSecureElement('button', {
          textContent: '×',
          styles: {
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: this.settings?.darkMode ? '#94a3b8' : '#6b7280',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          onclick: () => {
            this.dismissNotification(notification);
          }
        });
        
        // Create message section
        const message = this.createSecureElement('div', {
          textContent: tipData.message || 'Consider optimizing your energy usage.',
          styles: {
            fontSize: isProminent ? '16px' : '13px',
            lineHeight: isProminent ? '1.6' : '1.4',
            marginBottom: tipData.actionText ? (isProminent ? '20px' : '12px') : '0',
            color: this.settings?.darkMode ? '#cbd5e1' : '#4b5563',
            fontWeight: isProminent ? '500' : '400'
          }
        });
        
        // Assemble header with null safety
        if (header && icon) header.appendChild(icon);
        if (header && title) header.appendChild(title);
        if (header && closeButton) header.appendChild(closeButton);
        
        // Assemble notification with null safety
        if (notification && header) notification.appendChild(header);
        if (notification && message) notification.appendChild(message);
        
        // Create action buttons if specified
        if (tipData.actionText) {
          // Create buttons container for AI reminder (supports multiple buttons)
          const buttonsContainer = this.createSecureElement('div', {
            styles: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '12px'
            }
          });

          // Primary action button (Try Now)
          const actionButton = this.createSecureElement('button', {
            textContent: tipData.actionText,
            styles: {
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: isProminent ? '10px' : '6px',
              padding: isProminent ? '16px 24px' : '10px 16px',
              fontSize: isProminent ? '16px' : '13px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: isProminent ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
              transform: 'scale(1)',
              textTransform: isProminent ? 'none' : 'none'
            },
            onclick: async () => {
              // Handle action first, THEN dismiss (important for async operations)
              await this.handleActionClick(tipData);
              // Small delay to ensure message is sent before dismissing
              setTimeout(() => {
                this.dismissNotification(notification);
              }, 100);
            },
            onmouseenter: (e) => {
              e.target.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
              e.target.style.transform = isProminent ? 'scale(1.05)' : 'scale(1)';
              e.target.style.boxShadow = isProminent ? '0 6px 20px rgba(59, 130, 246, 0.6)' : 'none';
            },
            onmouseleave: (e) => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = isProminent ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none';
            }
          });

          if (buttonsContainer && actionButton) {
            buttonsContainer.appendChild(actionButton);
          }

          // Secondary action button (Snooze) - for AI reminder
          if (tipData.secondaryActionText) {
            const secondaryButton = this.createSecureElement('button', {
              textContent: tipData.secondaryActionText,
              styles: {
                background: this.settings?.darkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.2)',
                color: this.settings?.darkMode ? '#cbd5e1' : '#475569',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s'
              },
              onclick: () => {
                this.handleSnoozeClick(tipData);
                this.dismissNotification(notification);
              },
              onmouseenter: (e) => {
                e.target.style.backgroundColor = this.settings?.darkMode
                  ? 'rgba(100, 116, 139, 0.4)'
                  : 'rgba(148, 163, 184, 0.3)';
              },
              onmouseleave: (e) => {
                e.target.style.backgroundColor = this.settings?.darkMode
                  ? 'rgba(100, 116, 139, 0.3)'
                  : 'rgba(148, 163, 184, 0.2)';
              }
            });

            if (buttonsContainer && secondaryButton) {
              buttonsContainer.appendChild(secondaryButton);
            }
          }

          // Dismiss button (Got it!) - for AI reminder
          if (tipData.dismissText) {
            const dismissButton = this.createSecureElement('button', {
              textContent: tipData.dismissText,
              styles: {
                background: 'transparent',
                color: this.settings?.darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%',
                transition: 'color 0.2s',
                textAlign: 'center'
              },
              onclick: () => {
                this.handleDismissClick(tipData);
                this.dismissNotification(notification);
              },
              onmouseenter: (e) => {
                e.target.style.color = this.settings?.darkMode ? '#cbd5e1' : '#475569';
              },
              onmouseleave: (e) => {
                e.target.style.color = this.settings?.darkMode ? '#94a3b8' : '#64748b';
              }
            });

            if (buttonsContainer && dismissButton) {
              buttonsContainer.appendChild(dismissButton);
            }
          }

          // Add "Disable Notifications" button to ALL popups
          const disableButton = this.createSecureElement('button', {
            textContent: '🔕 Disable Notifications',
            styles: {
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              borderRadius: '6px',
              transition: 'all 0.2s',
              textAlign: 'center',
              marginTop: '4px'
            },
            onclick: async () => {
              await this.disableAllNotifications();
              this.dismissNotification(notification);
            },
            onmouseenter: (e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = 'white';
            },
            onmouseleave: (e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ef4444';
            }
          });

          if (buttonsContainer && disableButton) {
            buttonsContainer.appendChild(disableButton);
          }

          if (notification && buttonsContainer) {
            notification.appendChild(buttonsContainer);
          }
        }

        return notification;
        
      } catch (error) {
        return null;
      }
    }

    /**
     * Calculate word count for duration calculation
     */
    calculateWordCount(tipData) {
      let text = '';
      if (tipData.title) text += tipData.title + ' ';
      if (tipData.message) text += tipData.message + ' ';
      if (tipData.actionText) text += tipData.actionText + ' ';
      if (tipData.secondaryActionText) text += tipData.secondaryActionText + ' ';
      if (tipData.dismissText) text += tipData.dismissText + ' ';

      // Count words (split by whitespace and filter empty strings)
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      return words.length;
    }

    /**
     * Calculate duration based on word count
     * Formula: (word count × 0.5 seconds) + 1.5 seconds
     */
    calculateDuration(tipData) {
      // If duration is explicitly set to 0 (don't auto-dismiss), respect it
      if (tipData.duration === 0) {
        return 0;
      }

      const wordCount = this.calculateWordCount(tipData);
      const calculatedDuration = (wordCount * 500) + 1500; // Convert to milliseconds

      // Return calculated duration (in milliseconds)
      return calculatedDuration;
    }

    /**
     * Handle mouse entering notification - cancel any pending dismissals
     */
    handleNotificationMouseEnter(notificationElement) {
      // Cancel grace period timer if it exists
      const graceTimer = this.hoverTimers.get(notificationElement);
      if (graceTimer) {
        clearTimeout(graceTimer);
        this.hoverTimers.delete(notificationElement);
      }

      // Cancel auto-dismiss timer if it exists
      const autoDismissTimer = this.autoDismissTimers.get(notificationElement);
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
        this.autoDismissTimers.delete(notificationElement);
      }
    }

    /**
     * Handle mouse leaving notification - start grace period
     */
    handleNotificationMouseLeave(notificationElement) {
      // Start 1 second grace period before dismissing
      const graceTimer = setTimeout(() => {
        this.dismissNotification(notificationElement);
        this.hoverTimers.delete(notificationElement);
      }, 1000);

      this.hoverTimers.set(notificationElement, graceTimer);
    }

    showTip(tipData) {
      try {
        if (!this.settings || !this.settings.notificationsEnabled) {
          return;
        }

        // Create and show notification
        const notificationElement = this.createNotificationElement(tipData);
        if (notificationElement && this.container) {
          this.container.appendChild(notificationElement);

          // Animate in
          requestAnimationFrame(() => {
            if (notificationElement) {
              const isProminent = tipData.isProminent || tipData.type === 'ai_prompt_reminder';
              if (isProminent) {
                // Animate from scale 0.9 to scale 1
                setTimeout(() => {
                  notificationElement.style.transform = 'translate(50%, -50%) scale(1)';
                  notificationElement.style.opacity = '1';
                }, 50);
              } else {
                notificationElement.style.transform = 'translateX(0)';
              }
            }
          });

          // Store notification reference
          this.notifications.push({
            id: this.nextId++,
            element: notificationElement,
            data: tipData,
            timestamp: Date.now()
          });

          // Calculate duration based on word count
          const duration = this.calculateDuration(tipData);

          // Only set auto-dismiss if duration > 0
          if (duration > 0) {
            const autoDismissTimer = setTimeout(() => {
              this.dismissNotification(notificationElement);
              this.autoDismissTimers.delete(notificationElement);
            }, duration);

            this.autoDismissTimers.set(notificationElement, autoDismissTimer);
          }

        } else {
          // Try to recreate container if it's missing
          if (!this.container) {
            this.createNotificationContainer();
          }
        }
      } catch (error) {
      }
    }

    showDemoTip() {
      const demoTips = [
        {
          type: 'demo',
          icon: '⚡',
          title: 'PowerAI Demo Mode',
          message: 'This tab would normally show 23W energy usage. Install the extension for real data.',
          actionText: 'Learn More',
          severity: 'info',
          duration: 6000
        },
        {
          type: 'demo',
          icon: '🌱',
          title: 'Energy Tip',
          message: 'Gmail in dark mode can reduce screen energy consumption by up to 15%.',
          actionText: 'Enable Dark Mode',
          severity: 'success',
          duration: 8000
        }
      ];
      
      const randomTip = demoTips[Math.floor(Math.random() * demoTips.length)];
      this.showTip(randomTip);
    }

    showAIPromptReminder(data = {}) {
      // Create special AI prompt reminder notification - PROMINENT VERSION
      const reminderData = {
        type: 'ai_prompt_reminder',
        icon: '🌟',
        title: '⚡ Save Energy with AI Prompt Generator!',
        message: 'Reduce your AI energy usage by 15-45% per query! Our Prompt Generator optimizes your prompts for maximum efficiency while maintaining quality. Try it now!',
        actionText: '🚀 Open Prompt Generator',
        secondaryActionText: '⏰ Remind Me in 15 min',
        dismissText: 'Don\'t show again',
        severity: 'info',
        duration: 0, // Don't auto-dismiss - user must interact
        isProminent: true, // Flag for special styling
        ...data
      };

      this.showTip(reminderData);
    }

    async handleActionClick(tipData) {
      if (this.apiAvailable) {
        // Handle AI prompt reminder actions specially
        if (tipData.type === 'ai_prompt_reminder') {
          // Send message to open popup with prompt generator
          try {
            const response = await this.sendMessage({
              type: 'OPEN_PROMPT_GENERATOR',
              data: tipData
            });
          } catch (error) {
            console.error('[PowerAI] Error sending message:', error);
          }
        } else {
          // Get current tab ID
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const currentTabId = tabs && tabs[0] ? tabs[0].id : null;

          // Send action to extension with tab ID
          await this.sendMessage({
            type: 'NOTIFICATION_ACTION',
            action: tipData.type || tipData.action,
            data: tipData,
            tabId: currentTabId
          });
        }
      }
    }

    async handleSnoozeClick(tipData) {
      if (this.apiAvailable) {
        // Send snooze message to service worker
        try {
          const response = await this.sendMessage({
            type: 'SNOOZE_AI_REMINDER',
            duration: 15 * 60 * 1000 // 15 minutes
          });

          if (response && response.success) {
            // Show confirmation
            this.showTip({
              type: 'confirmation',
              icon: '⏰',
              title: 'Reminder Snoozed',
              message: 'You will be reminded again in 15 minutes.',
              duration: 2500
            });
          }
        } catch (error) {
          console.error('Failed to snooze reminder:', error);
        }
      }
    }

    async handleDismissClick(tipData) {
      if (this.apiAvailable) {
        // Send dismiss message to service worker
        try {
          const response = await this.sendMessage({
            type: 'DISMISS_AI_REMINDER'
          });

          if (response && response.success) {
            // Show confirmation
            this.showTip({
              type: 'confirmation',
              icon: '✓',
              title: 'Reminder Disabled',
              message: 'You won\'t see this reminder again.',
              duration: 2500
            });
          }
        } catch (error) {
          console.error('Failed to dismiss reminder:', error);
        }
      }
    }

    async disableAllNotifications() {
      if (this.apiAvailable) {
        try {
          // Update notification settings to disable ALL popups globally
          const response = await this.sendMessage({
            type: 'DISABLE_ALL_POPUPS'
          });

          if (response && response.success) {
            // Update local settings immediately
            this.settings.notificationsEnabled = false;

            // Close all current notifications
            this.hideAllTips();

            // Show brief confirmation (this will be the last popup shown)
            const confirmationElement = this.createNotificationElement({
              type: 'confirmation',
              icon: '🔕',
              title: 'All Popups Disabled',
              message: 'All Power Tracker popups have been disabled. Re-enable in Settings → Notifications.',
              duration: 0 // We'll manually dismiss this
            });

            if (confirmationElement && this.container) {
              this.container.appendChild(confirmationElement);

              // Animate in
              requestAnimationFrame(() => {
                confirmationElement.style.transform = 'translateX(0)';
              });

              // Dismiss after 3 seconds
              setTimeout(() => {
                this.dismissNotification(confirmationElement);
              }, 3000);
            }
          }
        } catch (error) {
          console.error('Failed to disable notifications:', error);
        }
      }
    }

    dismissNotification(notificationElement) {
      try {
        if (!notificationElement || !notificationElement.parentNode) return;

        // Clean up any pending timers for this notification
        const graceTimer = this.hoverTimers.get(notificationElement);
        if (graceTimer) {
          clearTimeout(graceTimer);
          this.hoverTimers.delete(notificationElement);
        }

        const autoDismissTimer = this.autoDismissTimers.get(notificationElement);
        if (autoDismissTimer) {
          clearTimeout(autoDismissTimer);
          this.autoDismissTimers.delete(notificationElement);
        }

        // Animate out
        notificationElement.style.transform = 'translateX(100%)';
        notificationElement.style.opacity = '0';

        // Remove from DOM after animation
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
          }

          // Remove from notifications array
          this.notifications = this.notifications.filter(n => n.element !== notificationElement);
        }, 400);

      } catch (error) {
      }
    }

    hideAllTips() {
      this.notifications.forEach(notification => {
        this.dismissNotification(notification.element);
      });
    }

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }

    cleanup() {
      try {
        // Clear all timers
        this.hoverTimers.forEach(timer => clearTimeout(timer));
        this.hoverTimers.clear();
        this.autoDismissTimers.forEach(timer => clearTimeout(timer));
        this.autoDismissTimers.clear();

        // Remove message listener safely
        if (this.messageListener && chrome.runtime && chrome.runtime.onMessage) {
          chrome.runtime.onMessage.removeListener(this.messageListener);
        }

        // Remove notification container
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }

        this.notifications = [];
        this.isInitialized = false;

      } catch (error) {
      }
    }
  }

  // Safe initialization with error boundaries
  let notificationManager = null;

  try {
    // Only initialize if we're in a proper content script context
    if (document && document.documentElement) {
      if (!window.__powerAINotificationManager) {
        notificationManager = new EnergyTipNotificationManager();
        window.__powerAINotificationManager = notificationManager;
      } else {
        notificationManager = window.__powerAINotificationManager;
      }
    }
  } catch (initError) {
  }

  // Safe cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      try {
        if (notificationManager) {
          notificationManager.cleanup();
        }
      } catch (cleanupError) {
      }
    });
  }

  // Export for potential use by other scripts
  if (typeof window !== 'undefined') {
    window.energyNotificationManager = notificationManager;
  }

  // Export for cleanup
  window.__powerAINotificationSystemLoaded = true;


  // Universal error boundary for Chrome extension
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('Could not establish connection')) {
      event.preventDefault(); // Prevent the error from showing in console
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Could not establish connection')) {
      event.preventDefault();
      return true;
    }
  });
})();