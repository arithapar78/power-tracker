# System Patterns - Power Tracker Chrome Extension

## Architecture Overview

Power Tracker follows a **layered, modular architecture** designed for Chrome Manifest V3 compliance while maintaining extensibility and reliability. The system employs multiple architectural patterns to handle real-time monitoring, intelligent optimization, and user interaction.

```
┌─── User Interface Layer ───┐
│  Popup UI    Options Page  │
├─── Service Worker Layer ───┤
│  EnergyTracker (Core)      │
│  Agent System (AI)         │
│  Data Migration            │
├─── Content Script Layer ───┤
│  PageEnergyMonitor         │
│  EnergyTipNotifications    │
├─── Calculation Layer ──────┤
│  PowerCalculator           │
│  BackendPowerCalculator    │
└─── Storage Layer ──────────┘
   Chrome Storage APIs
```

## Core Architectural Patterns

### 1. Service Worker Orchestration Pattern

**Pattern**: Central coordination hub with dependency injection
**Implementation**: `EnergyTracker` class serves as the main orchestrator

```javascript
class EnergyTracker {
  constructor() {
    this.powerCalculator = null;
    this.dataMigration = null;
    this.isReady = false;
    this.initPromise = null;
  }
}
```

**Key Features**:
- **Safe Dependency Loading**: Optional dependencies load gracefully with fallbacks
- **Async Initialization**: `initPromise` ensures proper startup sequence
- **State Management**: Maintains tab tracking and energy data in memory
- **Message Router**: Handles all cross-component communication

**Benefits**:
- Reliable startup even with missing components
- Clean separation of concerns
- Centralized error handling and logging

### 2. Progressive Enhancement Pattern

**Pattern**: Core functionality works universally, advanced features load conditionally
**Implementation**: Dependency availability flags control feature activation

```javascript
let POWER_CALCULATOR_AVAILABLE = false;
let AGENT_SYSTEM_AVAILABLE = false;
let ENHANCED_INTEGRATION_AVAILABLE = false;

// Graceful feature loading
if (AGENT_SYSTEM_AVAILABLE && typeof EnergyTrackerWithAgent !== 'undefined') {
  tracker = new EnergyTrackerWithAgent();
} else {
  tracker = new EnergyTracker();
}
```

**Key Features**:
- **Fallback Mechanisms**: Every advanced feature has a fallback implementation
- **Runtime Detection**: System adapts to available components
- **User Experience Continuity**: Extension works regardless of component availability

### 3. Message-Driven Architecture Pattern

**Pattern**: Asynchronous communication with retry logic and error handling
**Implementation**: Enhanced message passing with exponential backoff

```javascript
class BackoffManager {
  constructor(options = {}) {
    this.initialDelayMs = options.initialDelayMs || 500;
    this.maxRetries = options.maxRetries || 3;
    this.jitterFactor = options.jitterFactor || 0.1;
  }
}
```

**Key Features**:
- **Retry Logic**: Exponential backoff with jitter prevents thundering herd
- **Error Classification**: Different retry strategies for different error types
- **Context Validation**: Ensures extension context validity before operations
- **Graceful Degradation**: Returns null instead of throwing on failures

### 4. Observer Pattern for Energy Monitoring

**Pattern**: Content scripts observe page metrics and report to service worker
**Implementation**: `PageEnergyMonitor` with multiple observers

```javascript
class PageEnergyMonitor {
  constructor() {
    this.mutationObserver = null;
    this.performanceObserver = null;
    this.intervalId = null;
  }
  
  setupPerformanceObserver() {
    this.performanceObserver = new PerformanceObserver((list) => {
      this.processPerformanceEntries(list.getEntries());
    });
  }
}
```

**Key Features**:
- **Multi-Observer Setup**: MutationObserver, PerformanceObserver, and periodic sampling
- **Adaptive Sampling**: Adjusts frequency based on tab visibility and activity
- **Resource Management**: Automatic cleanup and memory bounds
- **Safety Checks**: Extension context validation before message sending

### 5. Strategy Pattern for Power Calculation

**Pattern**: Multiple calculation strategies with fallback mechanisms
**Implementation**: Research-based algorithms with confidence scoring

```javascript
class PowerCalculator {
  calculatePowerConsumption(metrics) {
    const resourcePower = this.calculateResourceBasedPower(metrics);
    const domPower = this.calculateDOMPower(domNodes, domDepth);
    const cpuPower = this.calculateCPUActivityPower(cpuIntensiveElements);
    
    return {
      totalWatts: Math.round(totalWatts * 10) / 10,
      breakdown: { baseline, resources: resourcePower, dom: domPower, cpu: cpuPower },
      confidence: this.calculateConfidence(metrics),
      methodology: 'research-based'
    };
  }
}
```

**Key Features**:
- **Multi-Factor Calculation**: Combines DOM, CPU, network, and media factors
- **Confidence Scoring**: Indicates accuracy of power estimates
- **Bounded Results**: Ensures realistic power consumption ranges (6-65W)
- **Legacy Migration**: Converts old energy scores to watts-based measurements

## Advanced System Patterns

### 6. Agent System (OODA Loop Pattern)

**Pattern**: Observe-Orient-Decide-Act cycle for intelligent optimization
**Implementation**: `EnergyAgent` with deterministic decision making

```javascript
class EnergyAgent {
  async observe(energyData, userContext) { /* Pattern recognition */ }
  async analyze(timeWindow) { /* Trend analysis and optimization opportunities */ }
  async decide(context, urgencyLevel) { /* Rule-based decision making */ }
  async act(decision) { /* Execute optimizations */ }
  async learn(actionResults) { /* Update effectiveness scores */ }
}
```

**Key Features**:
- **Deterministic Intelligence**: Rule-based decisions without external AI
- **Pattern Recognition**: Statistical analysis of usage patterns
- **Safety Validation**: All decisions validated against safety rules
- **Effectiveness Tracking**: Learns from action results to improve future decisions

### 7. Command Pattern for Actions

**Pattern**: Encapsulated actions with undo capability and safety checks
**Implementation**: `IntelligentActions` with validation and impact assessment

```javascript
class IntelligentActions {
  registerAction(actionId, config) {
    this.actions.set(actionId, {
      handler: config.handler,
      energySaving: config.energySaving,
      riskLevel: config.riskLevel,
      validation: config.validation
    });
  }
}
```

**Key Features**:
- **Action Registry**: Central catalog of available optimizations
- **Safety Limits**: Rate limiting and impact thresholds
- **Pre/Post Analysis**: Impact assessment before and after execution
- **User Consent**: All actions require explicit or learned user approval

### 8. Facade Pattern for UI Complexity

**Pattern**: Simple interface hiding complex backend operations
**Implementation**: `PopupManager` coordinates multiple subsystems

```javascript
class PopupManager {
  constructor() {
    this.aiEnergyManager = new EnhancedAIEnergyManager();
    this.backendPowerCalculator = new BackendPowerCalculator();
    this.energyDisplayMode = 'frontend'; // or 'total'
  }
  
  updateUI() {
    this.updateStatusIndicator();
    this.updatePowerDisplay();
    this.updateDeviceComparisons();
    this.updateAIModelInfoSection();
  }
}
```

**Key Features**:
- **Unified Interface**: Single class manages all UI interactions
- **Mode Switching**: Frontend-only vs. total energy display modes
- **Real-time Updates**: Periodic refresh with minimal performance impact
- **Progressive Loading**: Advanced features load on demand

## Data Flow Patterns

### 9. Pipeline Pattern for Data Processing

**Pattern**: Sequential data transformation with validation at each step
**Implementation**: Metrics collection → Processing → Storage → Display

```
Raw Metrics → Validation → Power Calculation → Environmental Impact → UI Display
     ↓              ↓              ↓                    ↓              ↓
Content Script → Service Worker → PowerCalculator → PopupManager → User Interface
```

**Key Features**:
- **Data Validation**: Each stage validates input data
- **Transformation Chain**: Progressive enrichment of energy data
- **Error Isolation**: Failures in one stage don't break the entire pipeline
- **Caching Strategy**: Intermediate results cached for performance

### 10. Repository Pattern for Data Persistence

**Pattern**: Abstracted data access with migration support
**Implementation**: Chrome Storage wrapper with version management

```javascript
class DataMigrationUtility {
  async migrateLegacyData() {
    const backup = await this.createBackup();
    try {
      const result = await this.performMigration();
      return result;
    } catch (error) {
      await this.restoreFromBackup(backup);
      throw error;
    }
  }
}
```

**Key Features**:
- **Automatic Backups**: Safety backups before data migrations
- **Version Tracking**: Schema version management for upgrades
- **Rollback Capability**: Restore functionality if migration fails
- **Data Integrity**: Validation and consistency checks

## Security and Safety Patterns

### 11. Access Control Pattern

**Pattern**: Layered security with progressive access levels
**Implementation**: Access code protection for advanced features

```javascript
validateAccessCode(code) {
  return code === '0410'; // Advanced features access
}

handleAdvancedFeatures() {
  if (this.validateAccessCode(userCode)) {
    this.showPromptGenerator();
  }
}
```

**Key Features**:
- **Progressive Disclosure**: Basic features open, advanced features protected
- **Session-Based Access**: No persistent storage of access credentials
- **Feature Isolation**: Advanced features cleanly separated from core functionality

### 12. Namespace Protection Pattern

**Pattern**: Global namespace isolation to prevent extension conflicts
**Implementation**: Prefixed global variables and careful API usage

```javascript
// Protected globals
window.__energyTrackerContentLoaded
window.__energyTrackerInstance
window.__energyBackoffManager

// Safe message routing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type.startsWith('MY_EXT_')) {
    return this.handleMessage(message);
  }
  return false; // Let other extensions handle their messages
});
```

**Key Features**:
- **Conflict Prevention**: Unique prefixes prevent variable collisions
- **Message Filtering**: Only handle relevant messages
- **Clean Teardown**: Proper cleanup on script reload or extension disable

## Performance Optimization Patterns

### 13. Lazy Loading Pattern

**Pattern**: Load expensive components only when needed
**Implementation**: Dynamic script loading for advanced features

```javascript
const script = document.createElement('script');
script.src = chrome.runtime.getURL('content-script-notifications.js');
script.onload = () => {
  if (window.__powerAINotificationManager) {
    window.__energyTipInstance = window.__powerAINotificationManager;
  }
};
```

**Key Features**:
- **On-Demand Loading**: Heavy components load only when required
- **Fallback Management**: Graceful handling if enhanced features fail to load
- **Memory Efficiency**: Reduced baseline memory footprint

### 14. Caching and Memoization Pattern

**Pattern**: Cache expensive calculations and API results
**Implementation**: Multiple cache levels for different data types

```javascript
// Metric cache between sends
this.lastMetrics = {};

// Pattern cache with LRU eviction
maintainDataWindow() {
  const maxAge = 5 * 60 * 1000;
  const cutoff = Date.now() - maxAge;
  // Remove old entries
}
```

**Key Features**:
- **Multi-Level Caching**: Different cache strategies for different data types
- **LRU Eviction**: Automatic cleanup of old cache entries
- **Cache Invalidation**: Smart invalidation based on data freshness

## Integration Patterns

### 15. Extension Compatibility Pattern

**Pattern**: Safe coexistence with other Chrome extensions
**Implementation**: Comprehensive conflict prevention and detection

```javascript
// Namespace isolation
const MyExtension = {
  namespace: 'MY_EXT_',
  sendMessage(type, data) {
    return chrome.runtime.sendMessage({
      type: this.namespace + type,
      data: data
    });
  }
};
```

**Key Features**:
- **Namespace Isolation**: Unique prefixes for all global identifiers
- **Message Routing**: Filtered message handling to prevent conflicts
- **Storage Separation**: Prefixed storage keys prevent data conflicts
- **CSS Scoping**: Scoped stylesheets prevent style conflicts

These architectural patterns work together to create a robust, scalable, and maintainable system that handles the complexities of browser energy monitoring while providing an excellent user experience.