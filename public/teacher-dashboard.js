// Teacher Dashboard Manager - Handles teacher-specific functionality
// Local-only implementation for Chrome extension

class TeacherDashboard {
  constructor() {
    this.isInitialized = false;
    this.classes = {};
    this.localStudentData = {};
    this.statistics = {
      totalStudents: 0,
      totalClasses: 0,
      avgEnergyScore: 0,
      totalCO2Saved: 0
    };
    
    // Storage keys
    this.STORAGE_KEYS = {
      TEACHER_CLASSES: 'teacherClasses',
      LOCAL_STUDENT_DATA: 'localStudentData',
      TEACHER_STATS: 'teacherStatistics'
    };
    
    this.init();
  }
  
  async init() {
    try {
      console.log('[TeacherDashboard] Initializing teacher dashboard...');
      
      // Load existing data
      await this.loadTeacherData();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update UI
      this.updateDashboardUI();
      
      this.isInitialized = true;
      console.log('[TeacherDashboard] Teacher dashboard initialized successfully');
    } catch (error) {
      console.error('[TeacherDashboard] Initialization failed:', error);
    }
  }
  
  async loadTeacherData() {
    try {
      if (!this.isChromeApiAvailable()) {
        console.log('[TeacherDashboard] Chrome APIs not available, using defaults');
        return;
      }
      
      const result = await chrome.storage.local.get([
        this.STORAGE_KEYS.TEACHER_CLASSES,
        this.STORAGE_KEYS.LOCAL_STUDENT_DATA,
        this.STORAGE_KEYS.TEACHER_STATS
      ]);
      
      // Load teacher classes
      this.classes = result[this.STORAGE_KEYS.TEACHER_CLASSES] || {};
      
      // Load local student data (students who used this device)
      this.localStudentData = result[this.STORAGE_KEYS.LOCAL_STUDENT_DATA] || {};
      
      // Load statistics
      this.statistics = result[this.STORAGE_KEYS.TEACHER_STATS] || {
        totalStudents: 0,
        totalClasses: 0,
        avgEnergyScore: 0,
        totalCO2Saved: 0
      };
      
      console.log('[TeacherDashboard] Teacher data loaded:', {
        classCount: Object.keys(this.classes).length,
        studentCount: Object.keys(this.localStudentData).length
      });
      
    } catch (error) {
      console.error('[TeacherDashboard] Failed to load teacher data:', error);
    }
  }
  
  setupEventListeners() {
    // Class creation
    this.safeAddEventListener('generateClassCode', 'click', this.handleGenerateClass.bind(this));
    
    // Export functionality
    this.safeAddEventListener('exportCSVBtn', 'click', this.handleExportCSV.bind(this));
    this.safeAddEventListener('previewReportBtn', 'click', this.handlePreviewReport.bind(this));
    
    // Update export class dropdown when classes change
    this.updateExportClassOptions();
    
    console.log('[TeacherDashboard] Event listeners setup complete');
  }
  
  async handleGenerateClass() {
    const classNameInput = document.getElementById('className');
    const gradeLevelSelect = document.getElementById('gradeLevel');
    
    const className = classNameInput?.value?.trim();
    const gradeLevel = gradeLevelSelect?.value;
    
    // Validate inputs
    if (!className) {
      this.showMessage('Please enter a class name', 'error');
      classNameInput?.focus();
      return;
    }
    
    if (!gradeLevel) {
      this.showMessage('Please select a grade level', 'error');
      gradeLevelSelect?.focus();
      return;
    }
    
    try {
      // Generate unique class code
      const classCode = this.generateClassCode();
      
      // Create class object
      const newClass = {
        name: className,
        code: classCode,
        gradeLevel: gradeLevel,
        created: Date.now(),
        students: [],
        energyGoals: this.getDefaultGoalsForGrade(gradeLevel),
        statistics: {
          totalStudents: 0,
          avgEnergyScore: 0,
          totalCO2Saved: 0,
          lessonsCompleted: 0
        }
      };
      
      // Save class
      this.classes[classCode] = newClass;
      await this.saveTeacherData();
      
      // Update statistics
      this.statistics.totalClasses = Object.keys(this.classes).length;
      await this.saveStatistics();
      
      // Show generated code
      this.displayGeneratedCode(classCode);
      
      // Clear form
      classNameInput.value = '';
      gradeLevelSelect.value = '';
      
      // Update UI
      this.updateClassesList();
      this.updateLocalStatistics();
      this.updateExportClassOptions();
      
      this.showMessage(`Class created successfully! Code: ${classCode}`, 'success');
      
      console.log('[TeacherDashboard] Class created:', newClass);
      
    } catch (error) {
      console.error('[TeacherDashboard] Failed to create class:', error);
      this.showMessage('Failed to create class. Please try again.', 'error');
    }
  }
  
  generateClassCode() {
    // Generate a unique, memorable class code
    const adjectives = [
      'Green', 'Bright', 'Smart', 'Eco', 'Save', 'Clean', 'Fresh', 'Pure',
      'Swift', 'Wise', 'Cool', 'Bold', 'Quick', 'Strong', 'Super', 'Happy'
    ];
    
    const nouns = [
      'Leafs', 'Stars', 'Minds', 'Heroes', 'Squad', 'Team', 'Force', 'Power',
      'Energy', 'Savers', 'Guards', 'Crew', 'Club', 'Group', 'League', 'Unit'
    ];
    
    const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
    
    let classCode;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Ensure uniqueness
    do {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      classCode = `${adjective}${noun}${numbers + attempts}`;
      attempts++;
    } while (this.classes[classCode] && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based code
      classCode = `Class${Date.now().toString().slice(-6)}`;
    }
    
    return classCode;
  }
  
  getDefaultGoalsForGrade(gradeLevel) {
    const goalMap = {
      'K-2': { energySaving: 5, description: 'Save 5% energy each day' },
      '3-5': { energySaving: 10, description: 'Save 10% energy each day' },
      '6-8': { energySaving: 15, description: 'Save 15% energy each day' },
      '9-12': { energySaving: 20, description: 'Save 20% energy each day' }
    };
    
    return goalMap[gradeLevel] || goalMap['3-5'];
  }
  
  displayGeneratedCode(classCode) {
    const display = document.getElementById('generatedCodeDisplay');
    const codeElement = document.getElementById('generatedCode');
    
    if (display && codeElement) {
      codeElement.textContent = classCode;
      display.style.display = 'block';
      
      // Add copy to clipboard functionality
      codeElement.addEventListener('click', () => {
        navigator.clipboard.writeText(classCode).then(() => {
          this.showMessage('Class code copied to clipboard!', 'success');
        }).catch(() => {
          console.log('Failed to copy to clipboard');
        });
      });
      
      codeElement.style.cursor = 'pointer';
      codeElement.title = 'Click to copy code';
    }
  }
  
  updateClassesList() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;
    
    const classKeys = Object.keys(this.classes);
    
    if (classKeys.length === 0) {
      classesList.innerHTML = '<div class="no-data">No classes created yet. Create your first class to get started!</div>';
      return;
    }
    
    let html = '';
    classKeys.forEach(classCode => {
      const classData = this.classes[classCode];
      const createdDate = new Date(classData.created).toLocaleDateString();
      
      html += `
        <div class="class-item" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-2);">
            <div>
              <h4 style="margin: 0; color: var(--text-primary); font-size: var(--text-base);">${this.escapeHtml(classData.name)}</h4>
              <p style="margin: var(--space-1) 0; color: var(--text-muted); font-size: var(--text-sm);">Grade: ${classData.gradeLevel}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-weight: 600; color: var(--primary); font-size: var(--text-lg);">${classCode}</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">Created: ${createdDate}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); font-size: var(--text-sm);">
            <div><strong>${classData.statistics.totalStudents}</strong> students</div>
            <div><strong>${classData.statistics.avgEnergyScore.toFixed(1)}</strong> avg score</div>
            <div><strong>${classData.statistics.totalCO2Saved.toFixed(2)}g</strong> CO₂ saved</div>
          </div>
        </div>
      `;
    });
    
    classesList.innerHTML = html;
  }
  
  updateLocalStatistics() {
    // Update the statistics display
    const elements = {
      totalStudentsLocal: document.getElementById('totalStudentsLocal'),
      totalClassesLocal: document.getElementById('totalClassesLocal'),
      avgEnergyScoreLocal: document.getElementById('avgEnergyScoreLocal'),
      totalCO2SavedLocal: document.getElementById('totalCO2SavedLocal')
    };
    
    if (elements.totalStudentsLocal) {
      elements.totalStudentsLocal.textContent = Object.keys(this.localStudentData).length;
    }
    
    if (elements.totalClassesLocal) {
      elements.totalClassesLocal.textContent = Object.keys(this.classes).length;
    }
    
    // Calculate average energy score from local student data
    const studentScores = Object.values(this.localStudentData)
      .map(student => student.energyScore || 0)
      .filter(score => score > 0);
    
    const avgScore = studentScores.length > 0 
      ? studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length 
      : 0;
    
    if (elements.avgEnergyScoreLocal) {
      elements.avgEnergyScoreLocal.textContent = avgScore > 0 ? avgScore.toFixed(1) : '--';
    }
    
    // Calculate total CO2 saved (rough estimate)
    const totalCO2 = studentScores.reduce((total, score) => {
      // Rough calculation: higher energy score = more CO2 saved
      return total + (score * 0.1); // 0.1g per energy score point
    }, 0);
    
    if (elements.totalCO2SavedLocal) {
      elements.totalCO2SavedLocal.textContent = totalCO2 > 0 ? totalCO2.toFixed(2) + 'g' : '--';
    }
  }
  
  updateExportClassOptions() {
    const exportSelect = document.getElementById('exportClass');
    if (!exportSelect) return;
    
    // Clear existing options (keep first one)
    exportSelect.innerHTML = '<option value="">Select a class...</option>';
    
    // Add class options
    Object.keys(this.classes).forEach(classCode => {
      const classData = this.classes[classCode];
      const option = document.createElement('option');
      option.value = classCode;
      option.textContent = `${classData.name} (${classCode})`;
      exportSelect.appendChild(option);
    });
  }
  
  async handleExportCSV() {
    const exportSelect = document.getElementById('exportClass');
    const selectedClass = exportSelect?.value;
    
    if (!selectedClass) {
      this.showMessage('Please select a class to export', 'error');
      return;
    }
    
    try {
      const classData = this.classes[selectedClass];
      if (!classData) {
        this.showMessage('Selected class not found', 'error');
        return;
      }
      
      // Generate CSV content
      const csvContent = this.generateCSVReport(classData);
      
      // Create and download file
      this.downloadCSV(csvContent, `${classData.name}_Energy_Report_${new Date().toISOString().split('T')[0]}.csv`);
      
      this.showMessage('Class report exported successfully!', 'success');
      
    } catch (error) {
      console.error('[TeacherDashboard] Export failed:', error);
      this.showMessage('Export failed. Please try again.', 'error');
    }
  }
  
  generateCSVReport(classData) {
    const headers = [
      'Class Name',
      'Class Code', 
      'Grade Level',
      'Created Date',
      'Total Students (Local)',
      'Average Energy Score',
      'Total CO2 Saved (g)',
      'Energy Goal (%)',
      'Report Generated'
    ];
    
    const createdDate = new Date(classData.created).toLocaleDateString();
    const reportDate = new Date().toLocaleDateString();
    
    const data = [
      classData.name,
      classData.code,
      classData.gradeLevel,
      createdDate,
      classData.statistics.totalStudents,
      classData.statistics.avgEnergyScore.toFixed(2),
      classData.statistics.totalCO2Saved.toFixed(2),
      classData.energyGoals.energySaving,
      reportDate
    ];
    
    // Convert to CSV format
    let csv = headers.join(',') + '\n';
    csv += data.map(field => `"${field}"`).join(',') + '\n';
    
    // Add notes section
    csv += '\n\nNotes:\n';
    csv += '"This report shows local data only from this device/browser."\n';
    csv += '"For complete class data, students must use the Power Tracker extension on this same device."\n';
    csv += '"Energy scores range from 0-100, where higher scores indicate better energy efficiency."\n';
    csv += '"CO2 savings are estimated based on energy efficiency improvements."\n';
    
    return csv;
  }
  
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
  
  handlePreviewReport() {
    const exportSelect = document.getElementById('exportClass');
    const selectedClass = exportSelect?.value;
    const reportPreview = document.getElementById('reportPreview');
    const reportContent = document.getElementById('reportContent');
    
    if (!selectedClass) {
      this.showMessage('Please select a class to preview', 'error');
      return;
    }
    
    const classData = this.classes[selectedClass];
    if (!classData) {
      this.showMessage('Selected class not found', 'error');
      return;
    }
    
    // Generate preview HTML
    const previewHTML = this.generateReportPreview(classData);
    
    if (reportContent && reportPreview) {
      reportContent.innerHTML = previewHTML;
      reportPreview.style.display = 'block';
      
      // Scroll to preview
      reportPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  generateReportPreview(classData) {
    const createdDate = new Date(classData.created).toLocaleDateString();
    
    return `
      <table>
        <tr>
          <th>Class Information</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Class Name</td>
          <td>${this.escapeHtml(classData.name)}</td>
        </tr>
        <tr>
          <td>Class Code</td>
          <td><strong>${classData.code}</strong></td>
        </tr>
        <tr>
          <td>Grade Level</td>
          <td>${classData.gradeLevel}</td>
        </tr>
        <tr>
          <td>Created Date</td>
          <td>${createdDate}</td>
        </tr>
        <tr>
          <td>Energy Goal</td>
          <td>${classData.energyGoals.energySaving}% daily saving</td>
        </tr>
        <tr>
          <td>Students (Local Device)</td>
          <td>${classData.statistics.totalStudents}</td>
        </tr>
        <tr>
          <td>Average Energy Score</td>
          <td>${classData.statistics.avgEnergyScore.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Estimated CO₂ Saved</td>
          <td>${classData.statistics.totalCO2Saved.toFixed(2)}g</td>
        </tr>
      </table>
      <div style="margin-top: var(--space-4); padding: var(--space-3); background: var(--surface-hover); border-radius: var(--radius); font-size: var(--text-sm); color: var(--text-secondary);">
        <strong>Note:</strong> This report shows data from students who have used the Power Tracker extension on this specific device/browser only.
      </div>
    `;
  }
  
  updateDashboardUI() {
    this.updateClassesList();
    this.updateLocalStatistics();
    this.updateExportClassOptions();
    this.updateEnergyInsights();
  }
  
  updateEnergyInsights() {
    const insightsDiv = document.getElementById('energyInsights');
    if (!insightsDiv) return;
    
    const classCount = Object.keys(this.classes).length;
    const studentCount = Object.keys(this.localStudentData).length;
    
    if (classCount === 0 && studentCount === 0) {
      insightsDiv.innerHTML = '<div class="no-data">Create classes and have students use the extension to see energy insights!</div>';
      return;
    }
    
    let insights = [];
    
    if (classCount > 0) {
      insights.push(`📚 You have created <strong>${classCount}</strong> class${classCount !== 1 ? 'es' : ''}`);
    }
    
    if (studentCount > 0) {
      insights.push(`👥 <strong>${studentCount}</strong> student${studentCount !== 1 ? 's have' : ' has'} used the extension on this device`);
      
      // Calculate average energy score
      const scores = Object.values(this.localStudentData)
        .map(s => s.energyScore || 0)
        .filter(s => s > 0);
      
      if (scores.length > 0) {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avgScore > 70) {
          insights.push(`⭐ Excellent work! Average energy score is <strong>${avgScore.toFixed(1)}</strong>`);
        } else if (avgScore > 50) {
          insights.push(`👍 Good progress! Average energy score is <strong>${avgScore.toFixed(1)}</strong>`);
        } else {
          insights.push(`📈 Room for improvement - average energy score is <strong>${avgScore.toFixed(1)}</strong>`);
        }
      }
    }
    
    if (insights.length > 0) {
      insightsDiv.innerHTML = insights.map(insight => 
        `<div style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border); font-size: var(--text-sm);">${insight}</div>`
      ).join('');
    } else {
      insightsDiv.innerHTML = '<div class="no-data">Use the extension to generate energy insights!</div>';
    }
  }
  
  async saveTeacherData() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.TEACHER_CLASSES]: this.classes
    });
  }
  
  async saveStatistics() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.TEACHER_STATS]: this.statistics
    });
  }
  
  // Utility methods
  safeAddEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element && typeof handler === 'function') {
      element.addEventListener(eventType, handler);
      console.log(`[TeacherDashboard] Event listener added for ${elementId}`);
    }
  }
  
  isChromeApiAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }
  
  showMessage(message, type = 'info') {
    console.log(`[TeacherDashboard] ${type.toUpperCase()}: ${message}`);
    
    // Create simple message display
    const messageEl = document.createElement('div');
    messageEl.className = `teacher-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#0ea5e9'};
      color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 500;
      animation: slideInTeacherMessage 0.3s ease-out;
    `;
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInTeacherMessage {
        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageEl);
    setTimeout(() => {
      messageEl.remove();
      style.remove();
    }, 4000);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Public API
  getClasses() {
    return this.classes;
  }
  
  getClass(classCode) {
    return this.classes[classCode];
  }
  
  getLocalStudentData() {
    return this.localStudentData;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
  });
} else {
  new TeacherDashboard();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeacherDashboard;
} else if (typeof window !== 'undefined') {
  window.TeacherDashboard = TeacherDashboard;
}