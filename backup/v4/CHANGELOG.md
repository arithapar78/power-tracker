# Changelog

All notable changes to Power Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-10-19

### Major Features Added

#### Phase 1: Foundation
- Initial popup UI implementation with real-time power monitoring
- Basic power calculation based on DOM nodes and page complexity
- Environmental impact visualizations (LED bulbs, water usage, CO₂ emissions)
- Settings page with theme toggle and customization options

#### Phase 2: Enhancement
- Advanced power calculation algorithms
- Tab-level energy tracking
- Historical data storage and retrieval
- Data export functionality (JSON format)

#### Phase 3: Help System
- Comprehensive in-app help documentation
- Interactive help popup with 7 sections:
  - Getting Started
  - Understanding Power Metrics
  - Compare Tabs Feature
  - AI Detection
  - Prompt Generator
  - Settings & Customization
  - Troubleshooting
- Modal overlay with keyboard shortcuts (ESC to close)
- Professional LearnTAV design system integration

#### Phase 4: Compare Tabs Strip
- Real-time top 3 energy-consuming tabs display
- Live wattage updates for each tab
- Color-coded energy indicators (green/yellow/red)
- Quick action buttons:
  - Close tab (×)
  - Mute tab (🔇)
- Tab title and favicon display
- Dynamic positioning based on consumption levels

#### Phase 5: Prompt Generator (Advanced Features)
- Renamed from "Advanced Features" for clarity
- Real-time energy usage graphs
- Detailed statistics dashboard:
  - Total tabs tracked
  - Average power consumption
  - AI query tracking
  - Peak usage times
- AI model usage breakdown
- Historical data visualization
- Access code protection for advanced features

#### Phase 6: UI Fixes and Cleanup
- Fixed AI model display (dynamic detection instead of hardcoded)
- Removed double scrollbar issue
- Deleted test energy tips button
- Comprehensive button audit on settings page
- Fixed "Close Unused Tabs" functionality
- Removed broken/non-functional buttons
- Cleaned up orphaned event listeners

#### Phase 7: Testing and Validation
- Comprehensive load testing
- Feature validation across all components
- Cross-browser compatibility checks
- Performance optimization
- Error handling improvements

#### Phase 8: Documentation and Production Ready
- Created comprehensive USER_GUIDE.md
- Created detailed DEVELOPER_GUIDE.md
- Removed all 840+ console.log statements for production
- Code cleanup and optimization
- Manifest.json enhancements:
  - Added author field
  - Added homepage URL
  - Added options_page reference
  - Added minimum Chrome version requirement
  - Enhanced permissions structure
- Created this CHANGELOG.md
- Security review
- Accessibility improvements

### AI Detection Features
- Automatic detection of major AI platforms:
  - ChatGPT (GPT-3.5, GPT-4, GPT-4 Turbo)
  - Claude (all versions)
  - Gemini
  - Other major AI services
- Real-time AI query tracking
- Backend power estimation for AI usage
- AI energy cost notifications
- Model comparison capabilities

### Energy Tracking Improvements
- Frontend power calculation (browser rendering)
- Backend power estimation (AI server costs)
- Toggle between "Browser Only" and "Total Power" modes
- Environmental impact calculations:
  - LED bulb equivalents
  - Water usage (gallons/hour)
  - Carbon footprint (CO₂/hour)
- Efficiency ratings (Excellent/Good/Average/Poor)

### UI/UX Enhancements
- Modern LearnTAV design system
- Card-based interface
- Smooth transitions and animations
- Dark mode support
- Responsive layout
- Accessibility improvements:
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus indicators

### Performance Optimizations
- Optimized update intervals
- Efficient DOM queries
- Lazy loading for heavy components
- Debounced UI updates
- Minimal memory footprint
- Service worker efficiency improvements

### Developer Experience
- Comprehensive code documentation
- JSDoc comments for complex functions
- Test pages for development
- Modular architecture
- Clear separation of concerns
- Git workflow improvements

### Bug Fixes
- Fixed scrollbar duplication issue
- Corrected AI model detection display
- Removed orphaned test functionality
- Fixed keyboard shortcut interference with text inputs
- Resolved service worker connection issues
- Fixed settings persistence bugs
- Corrected data export formatting
- Fixed theme toggle state sync

### Removed
- Test Energy Tips button (development artifact)
- Non-functional settings buttons
- Console logging statements (all 840+)
- Commented-out code blocks
- Unused CSS rules
- Orphaned event listeners
- Development-only features

### Security
- All data stored locally (privacy-first)
- No external data transmission
- Secure message passing between components
- Content Security Policy compliance
- Manifest V3 security model

### Documentation
- USER_GUIDE.md: Complete end-user documentation
- DEVELOPER_GUIDE.md: Technical documentation for developers
- README.md: Project overview and quick start
- CHANGELOG.md: Version history
- Inline code comments for complex logic
- Phase documentation (phases 1-8)

---

## [2.0.11] - 2024-09-20

### Fixed
- Minor bug fixes
- Performance improvements

---

## [2.0.10] - 2024-09-19

### Fixed
- Extension stability improvements
- UI rendering fixes

---

## [2.0.0] - 2024-09

### Added
- Initial public release
- Basic power monitoring
- Simple UI
- Storage functionality

---

## Development Phases

The 2.1.0 release was developed over 8 comprehensive phases:

1. **Phase 1**: Foundation - Basic popup and power tracking
2. **Phase 2**: Enhancement - Advanced calculations and data management
3. **Phase 3**: Help System - In-app documentation
4. **Phase 4**: Compare Tabs - Real-time tab comparison strip
5. **Phase 5**: Prompt Generator - Advanced features dashboard
6. **Phase 6**: Fixes - UI cleanup and button audit
7. **Phase 7**: Testing - Comprehensive validation
8. **Phase 8**: Production - Documentation and deployment preparation

---

## Upgrade Guide

### From 2.0.x to 2.1.0

**What's New:**
- Compare Tabs Strip for quick tab management
- Comprehensive help system
- Prompt Generator for advanced analytics
- Improved AI detection
- Better environmental impact visualizations

**Breaking Changes:**
- None - fully backward compatible

**Migration:**
- Extension will auto-update
- Existing settings preserved
- Historical data maintained

**New Permissions:**
- `tabs`: Required for Compare Tabs feature
- `host_permissions`: Enhanced AI detection

---

## Future Roadmap

### Planned for 2.2.0
- Cloud sync across devices
- Machine learning predictions
- Energy leaderboards
- Browser comparison charts
- Mobile browser support

### Under Consideration
- Internationalization (i18n)
- More AI models
- Custom notification preferences
- Energy-saving automation
- Team/organization features

---

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report a bug](https://github.com/learntav/power-tracker/issues)
- Documentation: See USER_GUIDE.md and DEVELOPER_GUIDE.md
- Contact: See README.md for contact information

---

## Credits

**Development Team**: LearnTAV
**Version**: 2.1.0
**License**: See LICENSE file
**Homepage**: https://github.com/learntav/power-tracker

Thank you to all contributors and users who helped make Power Tracker better!

---

*Last Updated: October 19, 2024*
