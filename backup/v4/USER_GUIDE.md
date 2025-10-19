# Power Tracker User Guide

## Overview

Power Tracker is a browser extension that helps you monitor and reduce your browser's energy consumption. By tracking power usage in real-time, identifying energy-intensive tabs, and providing AI-powered insights, Power Tracker empowers you to browse more sustainably.

### Why Power Tracker?

- **Real-time Monitoring**: See exactly how much power your browser tabs are consuming
- **AI Detection**: Automatically detect and track AI model usage (ChatGPT, Claude, etc.)
- **Environmental Impact**: Understand your browsing's carbon footprint
- **Smart Recommendations**: Get personalized tips to reduce energy consumption
- **Historical Tracking**: Monitor your energy usage patterns over time

---

## Installation

### Chrome/Edge/Chromium-Based Browsers

1. Download the Power Tracker extension package (.zip file)
2. Extract the contents to a folder on your computer
3. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
4. Enable **Developer Mode** (toggle in the top-right corner)
5. Click **Load unpacked**
6. Select the extracted Power Tracker folder
7. The Power Tracker icon should now appear in your browser toolbar

---

## Features

### 1. Tab Energy Monitoring

**What it does**: Tracks real-time power consumption for each browser tab

**How to use**:
- Click the Power Tracker icon in your toolbar
- View the **Current Power Usage** display showing watts consumed
- The display automatically updates every few seconds
- Toggle between **Browser Only** and **Total Power** (includes AI usage)

**Understanding the Display**:
- **Green (< 10W)**: Low power consumption - efficient browsing
- **Yellow (10-20W)**: Moderate power usage
- **Red (> 20W)**: High power consumption - consider closing tabs

### 2. Compare Tabs Strip

**What it shows**: A live comparison of your top 3 most energy-consuming tabs

**How to use**:
- The Compare Tabs Strip appears automatically in the popup
- Shows tab title, current wattage, and visual indicator
- **Close button** (×): Quickly close energy-hungry tabs
- **Mute button** (🔇): Mute tabs with active media
- Color-coded by energy level (green/yellow/red)

**When it's useful**:
- Identifying which tabs are draining the most power
- Quickly closing tabs you no longer need
- Managing multiple active tabs efficiently

### 3. Environmental Impact

**What it shows**: Real-world comparisons of your energy consumption

**Metrics displayed**:
- 💡 **LED Bulbs**: Equivalent number of LED bulbs your browser could power
- 💧 **Water Usage**: Gallons of water used for power generation
- 🌱 **Carbon Footprint**: CO₂ emissions per hour of browsing

**Why it matters**: These comparisons help you understand the real environmental impact of your digital activities.

### 4. AI Model Detection

**What it does**: Automatically detects when you're using AI services

**Supported AI Models**:
- ChatGPT (GPT-3.5, GPT-4, GPT-4 Turbo)
- Claude (various versions)
- Gemini
- Other major AI platforms

**Information displayed**:
- AI model name and version
- Energy consumption per query
- Total queries made
- Carbon and water impact

**AI Energy Popups**:
- Appear when AI usage is detected
- Show estimated energy cost
- Include dismiss button (×) to hide
- Provide tips for efficient AI usage

### 5. Prompt Generator

**What it is**: Advanced feature showing detailed energy usage statistics and graphs

**How to access**:
- Click the **⚡ Prompt Generator** button in settings or popup
- Enter access code if required (check with your administrator)

**Features**:
- Real-time usage graphs
- Detailed statistics on browsing patterns
- AI query tracking
- Energy consumption trends
- Export data for analysis

**Data shown**:
- Total tabs tracked
- Average power consumption
- Peak usage times
- AI model usage breakdown
- Historical data graphs

### 6. Help System

**Where to find it**: Click **Help & Instructions** in the Settings page

**Help sections available**:
1. **Getting Started**: Basic setup and navigation
2. **Understanding Power Metrics**: How to read the displays
3. **Compare Tabs Feature**: Using the tab comparison tool
4. **AI Detection**: Understanding AI tracking
5. **Prompt Generator**: Advanced features guide
6. **Settings & Customization**: Personalizing your experience
7. **Troubleshooting**: Common issues and solutions

### 7. Settings

**How to access**: Click the **Settings** button in the popup

**Available settings**:
- **Theme**: Toggle between light and dark mode
- **Update Frequency**: How often data refreshes
- **Notifications**: Enable/disable energy alerts
- **AI Tracking**: Enable/disable AI model detection
- **Data Export**: Export your energy history
- **Clear History**: Reset all tracking data

---

## Tips & Best Practices

### Reducing Browser Energy Consumption

1. **Close Inactive Tabs**: Use the Compare Tabs Strip to identify and close tabs you're not actively using

2. **Limit AI Queries**: Each AI query consumes significant energy
   - GPT-4 queries: ~2.4 Wh per query
   - Use more efficient models when possible
   - Batch your questions instead of multiple separate queries

3. **Manage Media Playback**: Videos and animations consume more power
   - Pause videos when not watching
   - Use the mute feature on auto-playing content

4. **Use Reader Mode**: Text-only pages consume less power than media-rich pages

5. **Monitor Background Tabs**: Some tabs continue consuming power even when not visible
   - Close tabs you've finished with
   - Use bookmarks instead of keeping tabs open

6. **Check Energy Regularly**: Make it a habit to check your Power Tracker daily

### Interpreting Efficiency Ratings

- **Excellent**: You're browsing very efficiently!
- **Good**: Reasonable energy usage, minor improvements possible
- **Average**: Consider reducing active tabs or AI usage
- **Poor**: High energy consumption - review open tabs and close unnecessary ones

---

## Troubleshooting

### Extension Not Loading

**Problem**: Power Tracker icon doesn't appear or shows errors

**Solutions**:
1. Refresh the extensions page (`chrome://extensions/`)
2. Disable and re-enable the extension
3. Check for browser updates
4. Reload the extension (click the refresh icon)

### Power Data Shows "---" or "Loading"

**Problem**: Energy data isn't displaying

**Solutions**:
1. Wait a few seconds for data to load
2. Refresh the current tab
3. Close and reopen the popup
4. Check if the extension has necessary permissions

### AI Detection Not Working

**Problem**: AI usage isn't being detected

**Solutions**:
1. Ensure AI Detection is enabled in Settings
2. Refresh the AI service page (ChatGPT, Claude, etc.)
3. Clear browser cache and reload
4. Check that you're on a supported AI platform

### Compare Tabs Strip Not Appearing

**Problem**: Top energy consumers strip is missing

**Solutions**:
1. Open at least 2-3 tabs
2. Wait for energy data to populate
3. The strip only appears when tabs are consuming measurable power

### High Memory Usage

**Problem**: Browser feels slow with Power Tracker enabled

**Solutions**:
1. Close unused browser tabs
2. Clear browsing history and cache
3. Adjust update frequency in settings to "Low"
4. Restart your browser

---

## FAQ

### How accurate is the power tracking?

Power Tracker uses industry-standard calculations based on CPU usage, network activity, DOM complexity, and known power consumption patterns. While estimates may vary by 10-15%, they provide reliable relative comparisons between tabs.

### Does Power Tracker itself consume much power?

No. Power Tracker is optimized to use minimal resources (typically < 0.5W). The insights you gain far outweigh the small overhead.

### Can I export my energy data?

Yes! Go to Settings → Data Export to download your complete energy history as a JSON file.

### How does AI detection work?

Power Tracker analyzes page URLs, DOM structures, and network requests to identify AI services. It uses known energy consumption data from published research to estimate AI query costs.

### Is my data private?

Absolutely. All data is stored locally on your device. Power Tracker never sends your browsing data to external servers.

### What browsers are supported?

Power Tracker works on all Chromium-based browsers:
- Google Chrome (recommended)
- Microsoft Edge
- Brave
- Opera
- Vivaldi

Minimum version: Chrome 88+

### Can I use this on mobile?

Not currently. Power Tracker is designed for desktop browsers. Mobile support may be added in future versions.

### How often should I check my energy usage?

We recommend checking daily to build awareness, especially when starting to use the extension. Once you've optimized your browsing habits, weekly checks are sufficient.

### What's the difference between "Browser Only" and "Total Power"?

- **Browser Only**: Shows power consumption from DOM rendering, JavaScript execution, and network activity
- **Total Power**: Includes browser power PLUS estimated backend AI server power consumption

### Can I track energy across multiple devices?

Currently, each installation tracks data independently. Cloud sync may be added in future versions.

---

## Support & Feedback

### Need Help?

1. Check this User Guide
2. Review the in-app Help & Instructions (Settings → Help)
3. Search existing issues on our GitHub repository
4. Contact support (see README.md for contact info)

### Report a Bug

If you encounter issues:
1. Note the browser version and OS
2. Describe the steps to reproduce the issue
3. Include screenshots if helpful
4. Check browser console for error messages (F12 → Console)
5. Submit an issue on our GitHub repository

### Feature Requests

We welcome suggestions! Submit feature ideas through our GitHub repository or contact the development team.

---

## Credits

Power Tracker was developed to promote sustainable computing and digital awareness.

**Version**: 2.1.0
**Last Updated**: 2024

Thank you for using Power Tracker to make browsing more sustainable! 🌍💚
