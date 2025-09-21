// ===========================
// Comprehensive Energy-Saving Tips Database
// 30+ tips organized by power usage, website type, and context
// ===========================

/**
 * Energy-Saving Tips Database
 * Provides contextual tips based on power usage and website characteristics
 */
class EnergySavingTipsDatabase {
  constructor() {
    this.tips = {
      // Very High Power Usage (45W+) - Immediate action needed
      veryHigh: {
        video: [
          {
            id: 'vh_video_quality',
            title: 'Lower Video Quality',
            message: 'High-definition video is using {powerWatts}W. Reducing to 720p can save 15-25W of power.',
            actionText: 'Pause Video',
            action: 'pause_media',
            impact: 'Save ~0.4 kWh/hour',
            cooldown: 5 * 60 * 1000,
            icon: '📹',
            efficiency: 'poor'
          },
          {
            id: 'vh_video_tabs',
            title: 'Multiple Video Tabs',
            message: 'Multiple video tabs are consuming {powerWatts}W total. Close unused video tabs.',
            actionText: 'Close Tab',
            action: 'close_tab',
            impact: 'Save ~0.3 kWh/hour per tab',
            cooldown: 8 * 60 * 1000,
            icon: '🎬',
            efficiency: 'poor'
          },
          {
            id: 'vh_video_fullscreen',
            title: 'Full Screen Video Power',
            message: 'Full-screen video uses {powerWatts}W. Exit full-screen when multitasking.',
            actionText: 'Exit Fullscreen',
            action: 'exit_fullscreen',
            impact: 'Save ~0.2 kWh/hour',
            cooldown: 10 * 60 * 1000,
            icon: '⛶',
            efficiency: 'poor'
          }
        ],
        gaming: [
          {
            id: 'vh_gaming_close',
            title: 'High Gaming Power Usage',
            message: 'This game is using {powerWatts}W. Close when not actively playing to save significant energy.',
            actionText: 'Close Game',
            action: 'close_tab',
            impact: 'Save ~0.5 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '🎮',
            efficiency: 'poor'
          },
          {
            id: 'vh_gaming_settings',
            title: 'Reduce Game Graphics',
            message: 'WebGL games at {powerWatts}W can be optimized. Lower graphics settings in game options.',
            actionText: 'Optimize Tab',
            action: 'optimize_tab',
            impact: 'Save ~0.3 kWh/hour',
            cooldown: 20 * 60 * 1000,
            icon: '⚙️',
            efficiency: 'poor'
          }
        ],
        general: [
          {
            id: 'vh_general_refresh',
            title: 'Memory Leak Suspected',
            message: 'Unusually high power usage ({powerWatts}W). A page refresh often fixes memory leaks.',
            actionText: 'Refresh Page',
            action: 'refresh_page',
            impact: 'Save ~0.4 kWh/hour',
            cooldown: 10 * 60 * 1000,
            icon: '🔄',
            efficiency: 'poor'
          },
          {
            id: 'vh_general_extensions',
            title: 'Extension Conflict',
            message: 'Very high power usage ({powerWatts}W) may be due to conflicting browser extensions.',
            actionText: 'Open Settings',
            action: 'open_settings',
            impact: 'Potential major savings',
            cooldown: 30 * 60 * 1000,
            icon: '🔧',
            efficiency: 'poor'
          }
        ]
      },

      // High Power Usage (35-44W) - Action recommended
      high: {
        social: [
          {
            id: 'h_social_autoplay',
            title: 'Social Media Auto-play',
            message: 'Auto-playing videos are using {powerWatts}W. Disable auto-play in settings.',
            actionText: 'Pause Media',
            action: 'pause_media',
            impact: 'Save ~0.25 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '📱',
            efficiency: 'average'
          },
          {
            id: 'h_social_infinite_scroll',
            title: 'Infinite Scroll Power Draw',
            message: 'Continuous scrolling uses {powerWatts}W. Take breaks or close when done browsing.',
            actionText: 'Close Tab',
            action: 'close_tab',
            impact: 'Save ~0.2 kWh/hour',
            cooldown: 20 * 60 * 1000,
            icon: '📜',
            efficiency: 'average'
          }
        ],
        streaming: [
          {
            id: 'h_streaming_background',
            title: 'Background Streaming',
            message: 'Background audio/video streaming uses {powerWatts}W. Pause when not actively watching.',
            actionText: 'Pause Media',
            action: 'pause_media',
            impact: 'Save ~0.3 kWh/hour',
            cooldown: 10 * 60 * 1000,
            icon: '🎵',
            efficiency: 'average'
          },
          {
            id: 'h_streaming_quality',
            title: 'Streaming Quality',
            message: 'High-quality streaming at {powerWatts}W. Consider lower quality for background listening.',
            actionText: 'Lower Quality',
            action: 'optimize_tab',
            impact: 'Save ~0.2 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '🎧',
            efficiency: 'average'
          }
        ],
        animations: [
          {
            id: 'h_animations_heavy',
            title: 'Animation-Heavy Site',
            message: 'Multiple animations are consuming {powerWatts}W. Reduce animations to save power.',
            actionText: 'Reduce Animations',
            action: 'reduce_animations',
            impact: 'Save ~0.15 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '✨',
            efficiency: 'average'
          },
          {
            id: 'h_animations_ads',
            title: 'Animated Advertisements',
            message: 'Animated ads are using {powerWatts}W. Consider an ad blocker for energy savings.',
            actionText: 'Open Settings',
            action: 'open_settings',
            impact: 'Save ~0.2 kWh/hour',
            cooldown: 30 * 60 * 1000,
            icon: '🚫',
            efficiency: 'average'
          }
        ]
      },

      // Moderate Power Usage (25-34W) - Optimization suggestions  
      moderate: {
        productivity: [
          {
            id: 'm_productivity_tabs',
            title: 'Too Many Productivity Tabs',
            message: 'Multiple work tabs are using {powerWatts}W combined. Close unused tabs.',
            actionText: 'Optimize Workspace',
            action: 'optimize_tabs',
            impact: 'Save ~0.1 kWh/hour',
            cooldown: 20 * 60 * 1000,
            icon: '💼',
            efficiency: 'good'
          },
          {
            id: 'm_productivity_refresh',
            title: 'Stale Content Updates',
            message: 'Live updating content is using {powerWatts}W. Refresh manually instead of auto-refresh.',
            actionText: 'Disable Auto-refresh',
            action: 'optimize_tab',
            impact: 'Save ~0.08 kWh/hour',
            cooldown: 25 * 60 * 1000,
            icon: '🔄',
            efficiency: 'good'
          }
        ],
        shopping: [
          {
            id: 'm_shopping_images',
            title: 'Image-Heavy Shopping',
            message: 'High-resolution product images use {powerWatts}W. Use list view instead of grid view.',
            actionText: 'Switch View',
            action: 'optimize_tab',
            impact: 'Save ~0.12 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '🛍️',
            efficiency: 'good'
          },
          {
            id: 'm_shopping_comparison',
            title: 'Multiple Shopping Tabs',
            message: 'Comparing products across {powerWatts}W worth of tabs. Bookmark and close some.',
            actionText: 'Bookmark Tabs',
            action: 'bookmark_tabs',
            impact: 'Save ~0.1 kWh/hour',
            cooldown: 20 * 60 * 1000,
            icon: '🔖',
            efficiency: 'good'
          }
        ],
        news: [
          {
            id: 'm_news_live',
            title: 'Live News Updates',
            message: 'Live news feeds are using {powerWatts}W with constant updates. Read in batches.',
            actionText: 'Pause Updates',
            action: 'optimize_tab',
            impact: 'Save ~0.1 kWh/hour',
            cooldown: 30 * 60 * 1000,
            icon: '📰',
            efficiency: 'good'
          },
          {
            id: 'm_news_videos',
            title: 'Auto-playing News Videos',
            message: 'News site videos are consuming {powerWatts}W. Disable video auto-play.',
            actionText: 'Pause Media',
            action: 'pause_media',
            impact: 'Save ~0.15 kWh/hour',
            cooldown: 15 * 60 * 1000,
            icon: '📺',
            efficiency: 'good'
          }
        ]
      },

      // Low Power Usage (15-24W) - General efficiency tips
      low: {
        general: [
          {
            id: 'l_general_dark_mode',
            title: 'Enable Dark Mode',
            message: 'Dark mode can save 15-20% screen energy on OLED displays. Currently using {powerWatts}W.',
            actionText: 'Enable Dark Mode',
            action: 'toggle_dark_mode',
            impact: 'Save ~0.05 kWh/hour',
            cooldown: 60 * 60 * 1000,
            icon: '🌙',
            efficiency: 'good'
          },
          {
            id: 'l_general_zoom',
            title: 'Optimize Zoom Level',
            message: 'Browser zoom affects rendering efficiency. Reset to 100% zoom for optimal {powerWatts}W usage.',
            actionText: 'Reset Zoom',
            action: 'reset_zoom',
            impact: 'Save ~0.03 kWh/hour',
            cooldown: 45 * 60 * 1000,
            icon: '🔍',
            efficiency: 'good'
          }
        ],
        browsing: [
          {
            id: 'l_browsing_bookmarks',
            title: 'Use Bookmarks More',
            message: 'Typing URLs uses more energy than bookmarks. Bookmark frequently visited sites.',
            actionText: 'Bookmark This',
            action: 'bookmark_current',
            impact: 'Save ~0.02 kWh/hour',
            cooldown: 90 * 60 * 1000,
            icon: '⭐',
            efficiency: 'good'
          },
          {
            id: 'l_browsing_tabs',
            title: 'Tab Management',
            message: 'Good energy habits! Consider bookmarking tabs you\'ll read later instead of keeping them open.',
            actionText: 'Organize Tabs',
            action: 'organize_tabs',
            impact: 'Maintain efficiency',
            cooldown: 60 * 60 * 1000,
            icon: '📑',
            efficiency: 'good'
          }
        ]
      },

      // Efficient Usage (Below 15W) - Achievements and encouragement
      efficient: [
        {
          id: 'e_achievement_green',
          title: 'Eco-Friendly Browsing! 🌱',
          message: 'Excellent! Only {powerWatts}W usage. You\'re saving the planet one tab at a time.',
          actionText: 'Keep It Up!',
          action: null,
          impact: 'Saving ~0.3 kWh/day vs average',
          cooldown: 2 * 60 * 60 * 1000,
          icon: '🌍',
          efficiency: 'excellent'
        },
        {
          id: 'e_achievement_efficient',
          title: 'Power Efficiency Master',
          message: 'Amazing! {powerWatts}W is very efficient. Share your energy-saving tips with others!',
          actionText: 'Share Tips',
          action: 'share_tips',
          impact: 'Leading by example',
          cooldown: 3 * 60 * 60 * 1000,
          icon: '⚡',
          efficiency: 'excellent'
        },
        {
          id: 'e_achievement_streak',
          title: 'Efficiency Streak!',
          message: 'You\'ve maintained efficient browsing at {powerWatts}W. Consistency is key!',
          actionText: 'View History',
          action: 'show_history',
          impact: 'Consistent savings',
          cooldown: 4 * 60 * 60 * 1000,
          icon: '🔥',
          efficiency: 'excellent'
        }
      ],

      // Browser and System Level Tips
      system: [
        {
          id: 's_browser_hardware',
          title: 'Hardware Acceleration',
          message: 'Enable hardware acceleration in browser settings to reduce CPU power usage.',
          actionText: 'Open Settings',
          action: 'open_browser_settings',
          impact: 'Save 10-30% CPU power',
          cooldown: 7 * 24 * 60 * 60 * 1000,
          icon: '🚀',
          efficiency: 'system'
        },
        {
          id: 's_browser_extensions',
          title: 'Extension Audit',
          message: 'Too many browser extensions can increase power usage. Disable unused extensions.',
          actionText: 'Manage Extensions',
          action: 'manage_extensions',
          impact: 'Save 5-15% total power',
          cooldown: 3 * 24 * 60 * 60 * 1000,
          icon: '🔧',
          efficiency: 'system'
        },
        {
          id: 's_system_power',
          title: 'System Power Plan',
          message: 'Switch to power saving mode in your OS for additional energy savings.',
          actionText: 'Power Settings',
          action: 'open_power_settings',
          impact: 'Save 20-40% system power',
          cooldown: 5 * 24 * 60 * 60 * 1000,
          icon: '💻',
          efficiency: 'system'
        }
      ],

      // Contextual tips based on time, website patterns, etc.
      contextual: [
        {
          id: 'c_time_break',
          title: 'Take a Screen Break',
          message: 'You\'ve been browsing for a while. Taking breaks saves energy and helps your eyes.',
          actionText: 'Close Tabs',
          action: 'close_tabs',
          impact: 'Save energy + health',
          cooldown: 60 * 60 * 1000,
          icon: '☕',
          efficiency: 'wellness'
        },
        {
          id: 'c_battery_low',
          title: 'Low Battery Mode',
          message: 'Battery is low. Close non-essential tabs to extend battery life.',
          actionText: 'Battery Saver',
          action: 'enable_battery_saver',
          impact: 'Extend battery 30-60min',
          cooldown: 30 * 60 * 1000,
          icon: '🔋',
          efficiency: 'critical'
        },
        {
          id: 'c_peak_hours',
          title: 'Peak Energy Hours',
          message: 'It\'s peak energy hours. Reducing usage now has greater environmental impact.',
          actionText: 'Optimize All',
          action: 'optimize_all_tabs',
          impact: 'Maximum eco impact',
          cooldown: 4 * 60 * 60 * 1000,
          icon: '⏰',
          efficiency: 'environmental'
        }
      ]
    };

    // Site-specific optimizations
    this.siteSpecificTips = {
      'youtube.com': [
        'Lower video quality to 720p or lower',
        'Use YouTube Music instead of video for audio',
        'Enable ambient mode for lower brightness',
        'Use keyboard shortcuts instead of clicking'
      ],
      'netflix.com': [
        'Download for offline viewing when possible',
        'Lower streaming quality in account settings',
        'Use mobile app for lower power consumption'
      ],
      'facebook.com': [
        'Disable auto-playing videos in settings',
        'Use Facebook Lite or mobile web version',
        'Turn off live notifications'
      ],
      'twitter.com': [
        'Use Twitter Lite or mobile version',
        'Disable auto-playing GIFs and videos',
        'Use lists instead of timeline for focused reading'
      ],
      'gmail.com': [
        'Use basic HTML version for lower power',
        'Enable offline Gmail for reduced syncing',
        'Archive emails instead of keeping inbox full'
      ]
    };
  }

  /**
   * Get contextual tip based on power usage, site type, and other factors
   */
  getContextualTip(powerWatts, tabData, userSettings = {}) {
    const url = tabData.url || '';
    const domain = this.extractDomain(url);
    const title = (tabData.title || '').toLowerCase();
    const metrics = tabData.lastMetrics || {};
    
    // Determine power category
    let powerCategory;
    if (powerWatts >= 45) powerCategory = 'veryHigh';
    else if (powerWatts >= 35) powerCategory = 'high';
    else if (powerWatts >= 25) powerCategory = 'moderate';
    else if (powerWatts >= 15) powerCategory = 'low';
    else powerCategory = 'efficient';

    // Determine site type
    const siteType = this.detectSiteType(domain, title, metrics);
    
    // Get appropriate tips
    let candidateTips = [];
    
    if (powerCategory === 'efficient') {
      candidateTips = this.tips.efficient;
    } else {
      const categoryTips = this.tips[powerCategory];
      if (categoryTips && categoryTips[siteType]) {
        candidateTips = categoryTips[siteType];
      } else if (categoryTips && categoryTips.general) {
        candidateTips = categoryTips.general;
      }
    }

    // Add system and contextual tips occasionally
    if (Math.random() < 0.1) {
      candidateTips = [...candidateTips, ...this.tips.system];
    }
    if (Math.random() < 0.05) {
      candidateTips = [...candidateTips, ...this.tips.contextual];
    }

    // Select random tip from candidates
    if (candidateTips.length === 0) return null;
    
    const selectedTip = candidateTips[Math.floor(Math.random() * candidateTips.length)];
    
    // Customize tip with current data
    return this.customizeTip(selectedTip, powerWatts, tabData, userSettings);
  }

  /**
   * Detect website type based on domain, title, and metrics
   */
  detectSiteType(domain, title, metrics) {
    // Video sites
    if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('twitch') ||
        domain.includes('vimeo') || domain.includes('dailymotion') || 
        title.includes('video') || metrics.cpuIntensiveElements?.videos > 0) {
      return 'video';
    }

    // Gaming sites
    if (domain.includes('game') || title.includes('game') || title.includes('play') ||
        metrics.cpuIntensiveElements?.canvases > 0) {
      return 'gaming';
    }

    // Social media
    if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram') ||
        domain.includes('linkedin') || domain.includes('tiktok') || domain.includes('snapchat') ||
        domain.includes('reddit')) {
      return 'social';
    }

    // Streaming (audio/music)
    if (domain.includes('spotify') || domain.includes('soundcloud') || domain.includes('pandora') ||
        domain.includes('music') || title.includes('music') || title.includes('radio')) {
      return 'streaming';
    }

    // Animation-heavy sites
    if (metrics.cpuIntensiveElements?.count > 3) {
      return 'animations';
    }

    // Productivity/work
    if (domain.includes('docs.google') || domain.includes('office') || domain.includes('slack') ||
        domain.includes('zoom') || domain.includes('teams') || title.includes('document')) {
      return 'productivity';
    }

    // Shopping
    if (domain.includes('amazon') || domain.includes('ebay') || domain.includes('shop') ||
        title.includes('buy') || title.includes('cart') || title.includes('store')) {
      return 'shopping';
    }

    // News
    if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc') ||
        domain.includes('reuters') || title.includes('news') || title.includes('breaking')) {
      return 'news';
    }

    // Browsing/reading
    if (domain.includes('wiki') || title.includes('read') || title.includes('article')) {
      return 'browsing';
    }

    return 'general';
  }

  /**
   * Customize tip with current power and tab data
   */
  customizeTip(tip, powerWatts, tabData, userSettings) {
    const customized = { ...tip };
    
    // Replace placeholders in message
    customized.message = customized.message.replace(/{powerWatts}/g, powerWatts);
    
    // Add severity based on power level
    if (powerWatts >= 45) customized.severity = 'urgent';
    else if (powerWatts >= 35) customized.severity = 'warning';
    else if (powerWatts >= 25) customized.severity = 'info';
    else customized.severity = 'success';

    // Add timestamp and power data
    customized.powerWatts = powerWatts;
    customized.timestamp = Date.now();
    customized.tabUrl = tabData.url;
    customized.tabTitle = tabData.title;

    return customized;
  }

  /**
   * Extract domain from URL safely
   */
  extractDomain(url) {
    try {
      if (!url || typeof url !== 'string') return '';
      return new URL(url).hostname.replace('www.', '');
    } catch (error) {
      return '';
    }
  }

  /**
   * Get site-specific optimization tips
   */
  getSiteSpecificTips(domain) {
    const cleanDomain = domain.replace('www.', '');
    return this.siteSpecificTips[cleanDomain] || [];
  }

  /**
   * Get all tips for a specific category
   */
  getTipsByCategory(category) {
    return this.tips[category] || [];
  }

  /**
   * Get achievement tips for efficient usage
   */
  getAchievementTips() {
    return this.tips.efficient;
  }
}

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergySavingTipsDatabase;
} else if (typeof window !== 'undefined') {
  window.EnergySavingTipsDatabase = EnergySavingTipsDatabase;
}