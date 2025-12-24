# Changelog

All notable changes to Power Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.0] - 2024-12-XX

### Code Refactoring & Notification Control

#### Added
- **Organized Directory Structure**: Refactored codebase into logical directories (js/core, js/content, js/popup, js/options, js/features, js/utils, js/config, html, css, icons, docs)
- **Individual Notification Flags**: Three separate flags for granular control (`ENABLE_ENERGY_TIPS`, `ENABLE_CARBON_TIPS`, `ENABLE_AI_REMINDERS`)
- **Comprehensive Documentation**: Added ARCHITECTURE.md, REFACTORING_SUMMARY.md, POPUP_TYPES.md, NOTIFICATION_CONTROL.md

#### Changed
- **Default Notification State**: All in-page notifications are now **disabled by default** (flags set to `false`)
- **File Organization**: All files moved to organized directory structure
- **Path Updates**: Updated all file references in manifest.json, HTML files, and JavaScript files
- **Script Loading Order**: Added clear comments in HTML files showing script loading order

#### Fixed
- File path references after refactoring
- Service worker importScripts paths for root-level files

#### Documentation
- Updated README.md with new directory structure
- Created comprehensive architecture documentation
- Consolidated notification control documentation into single file

## [6.0.0] - 2024-11-07

### Firebase Integration & Cloud Sync

#### Added
- **Firebase/Firestore Integration**: Cloud storage capabilities for energy history
- **Host Permissions**: Added firestore.googleapis.com for cloud sync
- **Cloud Backup**: Optional cloud backup for energy tracking data
- **Enhanced Security**: Firestore security rules and permissions

#### Changed
- Updated manifest version to 6.0.0
- Enhanced storage architecture to support both local and cloud storage
- Improved data persistence with cloud sync capabilities

## [2.1.0] - 2024-10-29

### Phase 8: Deployment Preparation & Documentation

#### Added
- Production build preparation with console log cleanup script
- Comprehensive CLAUDE.md for AI assistant guidance
- CHANGELOG.md for version tracking
- Enhanced documentation across all memory bank files

#### Changed
- Consolidated Current Tab sections in popup UI
- Improved AI detection with fallback URL/title-based detection
- Backend energy data integration with real database values
- Enhanced UI organization for better user experience

#### Fixed
- Help tab visibility with CSS contrast improvements
- AI model detection reliability issues
- Console warnings from missing documentation references

#### Documentation
- Updated INTEGRATION_MEMORY_BANK.md with complete API reference
- Enhanced README.md with comprehensive feature descriptions
- Added CLAUDE.md for development guidance
- Improved code comments and inline documentation

## [2.0.0] - 2024-10-19

### Major Release: AI Energy Tracking & Optimization

#### Added
- **AI Backend Energy Tracking**: Monitor energy consumption of GPT-4, Claude Sonnet 4, Gemini, and other AI platforms
- **AI Prompt Optimization Engine**: Reduce AI query energy usage by 15-45%
- **Multi-Level Optimization**: Conservative (5-15%), Balanced (15-25%), and Aggressive (25-45%) modes
- **Model-Specific Energy Profiles**: Accurate energy estimates based on research data
- **Enhanced AI Energy Database**: Comprehensive model profiles with energy per query data
- **Backend Power Calculator**: Specialized calculations for AI model energy consumption
- **AI Detection System**: Automatic detection and tracking of AI platform usage

#### Changed
- Upgraded to watts-based power measurements (6-65W range) from abstract scores
- Enhanced popup UI with dedicated AI model and backend energy sections
- Improved real-time power monitoring with confidence scoring
- Updated storage schema to support AI energy tracking

#### Enhanced
- Environmental impact calculations (CO2, LED bulb equivalents, water usage)
- Historical energy tracking with AI-specific metrics
- Advanced analytics for AI energy consumption patterns

## [1.5.0] - 2024-08-23

### Agent System & Pattern Recognition

#### Added
- **OODA Loop Intelligent Agent System**: Observe-Orient-Decide-Act cycle for optimization
- **Pattern Recognition System**: Statistical behavioral analysis
- **Intelligent Actions**: Automated optimization suggestions
- **Agent Dashboard**: Monitor and control agent learning system
- **Connection Fixes**: Improved extension stability and communication

#### Changed
- Enhanced energy tracking with agent integration
- Improved notification system with pattern-based triggers
- Better settings management with agent configuration

#### Documentation
- Added ENERGY_AGENT_SYSTEM_DOCUMENTATION.md
- Created CONNECTION_FIXES.md
- Enhanced INTEGRATION_MEMORY_BANK.md with agent system details

## [1.0.0] - 2024-08-18

### Initial Release

#### Core Features
- Real-time energy monitoring for browser tabs
- Power consumption calculations based on DOM activity, network requests, and resource usage
- Historical energy tracking with data retention controls
- Chrome storage integration for persistent data
- Extension popup with live energy display
- Options page with settings and analytics

#### Architecture
- Chrome Manifest V3 compliance
- Service Worker-based background processing
- Content Script for page-level monitoring
- Message passing system for inter-component communication
- Storage schema with migration support

#### UI Components
- Popup interface with real-time energy metrics
- Options page with historical charts
- In-page notifications for energy tips
- LearnTAV design system integration

#### Privacy & Security
- Local-only processing (no external API calls)
- User-controlled data retention
- Namespace isolation for extension compatibility
- Privacy-first architecture

#### Documentation
- INTEGRATION_MEMORY_BANK.md for technical reference
- QUICK_INTEGRATION_REFERENCE.md for quick lookups
- Memory bank system with project brief, tech context, and system patterns

---

## Version Numbering Scheme

Power Tracker follows Semantic Versioning (SemVer):
- **MAJOR** (X.0.0): Breaking changes, major new features, architecture changes
- **MINOR** (0.X.0): New features, enhancements, backwards-compatible changes
- **PATCH** (0.0.X): Bug fixes, minor improvements, documentation updates

## Upcoming Features

### Version 2.2.0 (Planned)
- Enhanced prompt generator with better data integration
- Improved token reduction algorithms
- Additional AI platform support (Grok-4, DeepSeek R1)
- Advanced export capabilities with privacy controls
- Performance optimizations for lower overhead

### Version 3.0.0 (Future)
- Firefox and Safari support
- Cloud sync capabilities (optional, privacy-preserving)
- Team/enterprise features
- Advanced ML-based optimization
- Real-time collaborative energy reduction

---

**Power Tracker** - Making digital energy consumption visible, actionable, and optimizable.

For more information, visit [learntav.com/ai-tools/power-tracker/](https://learntav.com/ai-tools/power-tracker/)
