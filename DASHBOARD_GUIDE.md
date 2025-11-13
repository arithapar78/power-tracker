# Power Tracker Dashboard - Quick Guide

## ✅ What You Got

A beautiful dashboard page that shows:
- 👥 **Total Active Students** using Power Tracker
- ⚡ **Total Energy Saved** (in kWh)
- 🤖 **Total Tokens Saved** from AI optimization
- ⏱️ **Total Time** students spent using the app
- 🌍 **Environmental Impact** (CO2, miles, trees, etc.)

Perfect for presentations and showing impact!

---

## 🚀 How to Use the Dashboard

### Option 1: Open Directly in Browser (Easiest)

1. **Navigate to your extension folder** where you have the `public/` directory
2. **Find the file** `dashboard.html`
3. **Double-click it** - it opens in your browser
4. **That's it!** The dashboard loads and shows all your data from Firebase

You can bookmark this page and open it anytime to see updated stats!

---

### Option 2: Through the Extension

The dashboard is in your extension folder, so you can also:

1. Type this in your browser: `chrome-extension://[YOUR-EXTENSION-ID]/dashboard.html`
2. (Replace `[YOUR-EXTENSION-ID]` with your actual extension ID from chrome://extensions/)

---

## 📊 What the Dashboard Shows

### Main Stats (Big Cards):
```
👥 Active Students: 87
   - Unique users who have used the extension

⚡ Energy Saved: 245.7 kWh
   - Total energy saved across all students

🤖 Tokens Saved: 1,245,000
   - AI tokens saved from prompt optimization

⏱️ Total Time: 1,234.5 hours
   - Combined time students spent using the app
```

### Environmental Impact:
```
🌱 CO2 Reduced: 98.3 kg
   - Carbon dioxide not released (0.4 kg per kWh)

🚗 Miles Not Driven: 217 miles
   - Equivalent car miles (2.2 miles per kg CO2)

🌳 Trees Planted: 3.7 trees
   - Tree equivalent (0.015 trees per kWh saved)

💡 LED Bulb Hours: 24,570 hours
   - 10W LED bulb runtime equivalent
```

---

## 🔄 Refreshing Data

- **Auto-refresh**: Dashboard updates every 5 minutes automatically
- **Manual refresh**: Click the "🔄 Refresh Data" button anytime
- **Last Updated**: Shows timestamp of last refresh at bottom

---

## 📸 Using for Presentations

### Screenshot the Dashboard:
1. Open `dashboard.html` in your browser
2. Press `F11` for fullscreen (looks professional!)
3. Take a screenshot
4. Use in PowerPoint, Google Slides, etc.

### Present Live:
1. Open dashboard during presentation
2. Click "🔄 Refresh Data" to show real-time stats
3. Impressive for school administrators!

---

## 🎯 Example Use Cases

### Weekly Check-ins:
"Let's see how much energy we saved this week!"
→ Open dashboard, compare to last week

### School Assembly:
"Ottoson Middle School has collectively saved X kWh!"
→ Show dashboard on projector

### Grant Applications:
"Our environmental program has measurable impact..."
→ Screenshot dashboard stats

### Student Motivation:
"We're at 200 students - let's get to 300!"
→ Share dashboard link with students

---

## 💡 Tips

### For Best Results:
- Open dashboard after students have been using extension for a few days
- More users = more impressive numbers!
- Environmental impact calculations are industry-standard

### Sharing the Dashboard:
- You can email the `dashboard.html` file to teachers/admin
- They can open it directly (no installation needed)
- It fetches live data from Firebase

### Customization:
- The dashboard is just an HTML file
- You can edit it to change colors, text, school name, etc.
- Just open `dashboard.html` in a text editor

---

## 🔒 Privacy Note

The dashboard shows:
- ✅ Aggregate anonymous statistics
- ✅ Total counts and sums
- ❌ NO individual student data
- ❌ NO names or personal information

Safe to share publicly!

---

## 🐛 Troubleshooting

### "Error loading data"
→ Check internet connection
→ Verify Firebase is working (try adding test data)

### Shows zeros
→ Wait for students to use the extension
→ Or add test data (see testing guide)

### Won't open
→ Make sure you're opening `dashboard.html` from the correct folder
→ Try right-click → Open With → Chrome

---

## 🎉 You're Ready!

Just open `dashboard.html` in your browser and you'll see your school's total impact!

Perfect for February 2026 presentations! 📊
