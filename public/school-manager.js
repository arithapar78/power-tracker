// School Manager - Handles all school-related functionality
// Local-only implementation for Chrome extension

class SchoolManager {
  constructor() {
    this.isInitialized = false;
    this.currentMode = 'regular'; // 'regular', 'school', 'lesson'
    this.studentInfo = null;
    this.dailyGoals = null;
    this.achievements = [];
    this.lessonManager = null;
    this.currentLesson = null;
    
    // Storage keys for school data
    this.STORAGE_KEYS = {
      SCHOOL_MODE: 'schoolModeEnabled',
      STUDENT_INFO: 'studentInfo',
      CLASS_CODE: 'classCode',
      DAILY_GOALS: 'dailyEnergyGoals',
      LESSON_MODE: 'lessonModeActive',
      ACHIEVEMENTS: 'studentAchievements',
      TEACHER_DATA: 'teacherData'
    };
    
    this.init();
  }
  
  async init() {
    try {
      console.log('[SchoolManager] Initializing school features...');
      
      // Initialize lesson content manager
      if (typeof LessonContentManager !== 'undefined') {
        this.lessonManager = new LessonContentManager();
        window.lessonManager = this.lessonManager; // Make globally available
        console.log('[SchoolManager] Lesson content manager initialized');
      }
      
      // Load existing school settings
      await this.loadSchoolSettings();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update UI based on current mode
      this.updateSchoolModeUI();
      
      this.isInitialized = true;
      console.log('[SchoolManager] School features initialized successfully');
    } catch (error) {
      console.error('[SchoolManager] Initialization failed:', error);
    }
  }
  
  async loadSchoolSettings() {
    try {
      if (!this.isChromeApiAvailable()) {
        console.log('[SchoolManager] Chrome APIs not available, using defaults');
        return;
      }
      
      const result = await chrome.storage.local.get([
        this.STORAGE_KEYS.SCHOOL_MODE,
        this.STORAGE_KEYS.STUDENT_INFO,
        this.STORAGE_KEYS.DAILY_GOALS,
        this.STORAGE_KEYS.LESSON_MODE,
        this.STORAGE_KEYS.ACHIEVEMENTS
      ]);
      
      // Load school mode state
      const schoolModeEnabled = result[this.STORAGE_KEYS.SCHOOL_MODE] || false;
      this.currentMode = schoolModeEnabled ? 'school' : 'regular';
      
      // Load student information
      this.studentInfo = result[this.STORAGE_KEYS.STUDENT_INFO] || null;
      
      // Load daily goals
      this.dailyGoals = result[this.STORAGE_KEYS.DAILY_GOALS] || null;
      
      // Load lesson mode
      const lessonMode = result[this.STORAGE_KEYS.LESSON_MODE] || false;
      if (lessonMode && schoolModeEnabled) {
        this.currentMode = 'lesson';
      }
      
      // Load achievements
      this.achievements = result[this.STORAGE_KEYS.ACHIEVEMENTS] || [];
      
      console.log('[SchoolManager] Settings loaded:', {
        mode: this.currentMode,
        hasStudent: !!this.studentInfo,
        achievements: this.achievements.length
      });
      
    } catch (error) {
      console.error('[SchoolManager] Failed to load school settings:', error);
    }
  }
  
  setupEventListeners() {
    // School mode toggle
    const schoolModeToggle = document.getElementById('schoolModeEnabled');
    if (schoolModeToggle) {
      schoolModeToggle.checked = this.currentMode !== 'regular';
      schoolModeToggle.addEventListener('change', this.handleSchoolModeToggle.bind(this));
    }
    
    // Student registration
    this.safeAddEventListener('joinClassBtn', 'click', this.handleStudentRegistration.bind(this));
    this.safeAddEventListener('cancelSetupBtn', 'click', this.hideStudentSetup.bind(this));
    
    // Lesson mode controls
    this.safeAddEventListener('lessonModeToggle', 'change', (e) => this.handleLessonModeToggle(e.target.checked));
    this.safeAddEventListener('startLessonBtn', 'click', this.startLesson.bind(this));
    this.safeAddEventListener('nextLessonBtn', 'click', this.nextLesson.bind(this));
    this.safeAddEventListener('completeLessonBtn', 'click', this.completeCurrentLesson.bind(this));
    
    console.log('[SchoolManager] Event listeners setup complete');
  }
  
  async handleSchoolModeToggle(event) {
    const isEnabled = event.target.checked;
    console.log('[SchoolManager] School mode toggled:', isEnabled);
    
    if (isEnabled) {
      // Enabling school mode
      if (!this.studentInfo) {
        // Show student registration if not setup
        this.showStudentSetup();
      } else {
        // Already registered, just enable school mode
        this.currentMode = 'school';
        await this.saveSchoolMode(true);
        this.updateSchoolModeUI();
      }
    } else {
      // Disabling school mode
      this.currentMode = 'regular';
      await this.saveSchoolMode(false);
      this.updateSchoolModeUI();
      this.hideStudentSetup();
    }
  }
  
  showStudentSetup() {
    const setupDiv = document.getElementById('studentSetup');
    if (setupDiv) {
      setupDiv.style.display = 'block';
      
      // Focus on first input
      const nameInput = document.getElementById('studentName');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
      }
    }
  }
  
  hideStudentSetup() {
    const setupDiv = document.getElementById('studentSetup');
    if (setupDiv) {
      setupDiv.style.display = 'none';
      
      // Clear form
      this.clearStudentForm();
    }
  }
  
  clearStudentForm() {
    const nameInput = document.getElementById('studentName');
    const classCodeInput = document.getElementById('classCodeInput');
    const gradeSelect = document.getElementById('gradeLevel');
    
    if (nameInput) nameInput.value = '';
    if (classCodeInput) classCodeInput.value = '';
    if (gradeSelect) gradeSelect.value = '';
  }
  
  async handleStudentRegistration() {
    const nameInput = document.getElementById('studentName');
    const classCodeInput = document.getElementById('classCodeInput');
    const gradeSelect = document.getElementById('gradeLevel');
    
    const studentName = nameInput?.value?.trim();
    const classCode = classCodeInput?.value?.trim();
    const gradeLevel = gradeSelect?.value;
    
    // Validate inputs
    if (!studentName) {
      this.showMessage('Please enter your name', 'error');
      nameInput?.focus();
      return;
    }
    
    if (!classCode) {
      this.showMessage('Please enter your class code', 'error');
      classCodeInput?.focus();
      return;
    }
    
    if (!gradeLevel) {
      this.showMessage('Please select your grade level', 'error');
      gradeSelect?.focus();
      return;
    }
    
    try {
      // Create student info object
      this.studentInfo = {
        name: studentName,
        classCode: classCode,
        gradeLevel: gradeLevel,
        joinedDate: Date.now(),
        energyScore: 0,
        achievements: [],
        dailyStats: {
          daysActive: 0,
          totalEnergyScored: 0,
          averageEnergyScore: 0
        }
      };
      
      // Set daily goals based on grade level
      this.setDailyEnergyGoal(gradeLevel);
      
      // Save student data
      await this.saveStudentData();
      
      // Enable school mode
      this.currentMode = 'school';
      await this.saveSchoolMode(true);
      
      // Hide setup and update UI
      this.hideStudentSetup();
      this.updateSchoolModeUI();
      
      this.showMessage(`Welcome ${studentName}! School mode activated.`, 'success');
      
      console.log('[SchoolManager] Student registered:', this.studentInfo);
      
    } catch (error) {
      console.error('[SchoolManager] Registration failed:', error);
      this.showMessage('Registration failed. Please try again.', 'error');
    }
  }
  
  setDailyEnergyGoal(gradeLevel) {
    // Set age-appropriate energy saving goals
    const goalMap = {
      'K-2': 5,    // 5% energy saving goal
      '3-5': 10,   // 10% energy saving goal  
      '6-8': 15,   // 15% energy saving goal
      '9-12': 20   // 20% energy saving goal
    };
    
    this.dailyGoals = {
      energySavingPercent: goalMap[gradeLevel] || 10,
      gradeLevel: gradeLevel,
      setDate: Date.now()
    };
    
    console.log('[SchoolManager] Daily goals set:', this.dailyGoals);
  }
  
  async saveStudentData() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.STUDENT_INFO]: this.studentInfo,
      [this.STORAGE_KEYS.DAILY_GOALS]: this.dailyGoals
    });
  }
  
  async saveSchoolMode(enabled) {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.SCHOOL_MODE]: enabled
    });
  }
  
  updateSchoolModeUI() {
    // Update school mode toggle
    const schoolModeToggle = document.getElementById('schoolModeEnabled');
    if (schoolModeToggle) {
      schoolModeToggle.checked = this.currentMode !== 'regular';
    }
    
    // Show/hide lesson mode toggle based on school mode
    this.toggleLessonModeVisibility();
    
    // Update lesson mode toggle state
    const lessonModeToggle = document.getElementById('lessonModeToggle');
    if (lessonModeToggle) {
      lessonModeToggle.checked = this.currentMode === 'lesson';
    }
    
    // Add school mode indicator to status
    this.updateStatusWithSchoolInfo();
    
    // Show/hide school-specific UI elements
    this.toggleSchoolElements();
    
    // Apply lesson interface if in lesson mode
    if (this.currentMode === 'lesson') {
      this.makeInterfaceKidFriendly();
    } else {
      this.restoreNormalInterface();
    }
  }
  
  toggleLessonModeVisibility() {
    const lessonModeContainer = document.getElementById('lessonModeContainer');
    if (!lessonModeContainer) return;
    
    const isSchoolMode = this.currentMode === 'school' || this.currentMode === 'lesson';
    
    if (isSchoolMode && this.studentInfo) {
      lessonModeContainer.style.display = 'flex';
      lessonModeContainer.classList.add('visible');
    } else {
      lessonModeContainer.style.display = 'none';
      lessonModeContainer.classList.remove('visible');
    }
  }
  
  updateStatusWithSchoolInfo() {
    const statusText = document.getElementById('statusText');
    if (!statusText) return;
    
    if (this.currentMode === 'school' && this.studentInfo) {
      const currentText = statusText.textContent || '';
      if (!currentText.includes('School Mode')) {
        statusText.textContent = `${currentText} | School Mode: ${this.studentInfo.name}`;
      }
    }
  }
  
  toggleSchoolElements() {
    // This will be expanded as we add more school-specific UI elements
    const elements = document.querySelectorAll('.school-only');
    elements.forEach(el => {
      if (this.currentMode === 'school' || this.currentMode === 'lesson') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }
  
  // Achievement system
  checkAchievements(energyData) {
    if (!this.studentInfo || this.currentMode === 'regular') return [];
    
    const newAchievements = [];
    const existingAchievements = this.achievements.map(a => a.id);
    
    // First Day Saver
    if (!existingAchievements.includes('first-day') && this.studentInfo.dailyStats.daysActive >= 1) {
      newAchievements.push({
        id: 'first-day',
        emoji: '🌱',
        title: 'First Day Saver',
        description: 'Saved energy on your first day!',
        earnedDate: Date.now()
      });
    }
    
    // Week Warrior (5 days active)
    if (!existingAchievements.includes('week-warrior') && this.studentInfo.dailyStats.daysActive >= 5) {
      newAchievements.push({
        id: 'week-warrior',
        emoji: '⭐',
        title: 'Week Warrior',
        description: 'Saved energy for 5 days in a row!',
        earnedDate: Date.now()
      });
    }
    
    // Goal achievement
    if (this.dailyGoals && energyData) {
      const currentSavings = this.calculateEnergySavings(energyData);
      if (currentSavings >= this.dailyGoals.energySavingPercent && !existingAchievements.includes('goal-met-today')) {
        newAchievements.push({
          id: 'goal-met-today',
          emoji: '🏆',
          title: 'Goal Crusher',
          description: `Exceeded your ${this.dailyGoals.energySavingPercent}% daily goal!`,
          earnedDate: Date.now()
        });
      }
    }
    
    // Save new achievements
    if (newAchievements.length > 0) {
      this.achievements.push(...newAchievements);
      this.saveAchievements();
    }
    
    return newAchievements;
  }
  
  async saveAchievements() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.ACHIEVEMENTS]: this.achievements
    });
  }
  
  calculateEnergySavings(energyData) {
    // Simple calculation - could be enhanced
    if (!energyData || !energyData.powerWatts) return 0;
    
    const baseline = 25; // Baseline power consumption
    const current = energyData.powerWatts;
    const savings = Math.max(0, (baseline - current) / baseline * 100);
    
    return Math.round(savings);
  }
  
  // Lesson mode functionality
  async handleLessonModeToggle(enabled) {
    if (this.currentMode !== 'school' && !enabled) return;
    
    console.log('[SchoolManager] Lesson mode toggled:', enabled);
    
    if (enabled) {
      this.currentMode = 'lesson';
      await this.saveLessonMode(true);
      this.enableLessonInterface();
      this.showAvailableLessons();
    } else {
      this.currentMode = 'school';
      await this.saveLessonMode(false);
      this.disableLessonInterface();
    }
    
    this.updateSchoolModeUI();
  }
  
  showAvailableLessons() {
    if (!this.lessonManager || !this.studentInfo) return;
    
    const gradeLevel = this.studentInfo.gradeLevel;
    const lessons = this.lessonManager.getLessonsForGrade(gradeLevel);
    
    console.log('[SchoolManager] Available lessons for', gradeLevel, ':', Object.keys(lessons));
    
    // Create lesson selection UI
    this.createLessonSelectionUI(lessons, gradeLevel);
  }
  
  createLessonSelectionUI(lessons, gradeLevel) {
    // Remove existing lesson UI
    const existingUI = document.getElementById('lessonSelectionUI');
    if (existingUI) existingUI.remove();
    
    // Create new lesson selection UI
    const lessonUI = document.createElement('div');
    lessonUI.id = 'lessonSelectionUI';
    lessonUI.className = 'lesson-selection-ui';
    
    lessonUI.innerHTML = `
      <div class="lesson-header">
        <h3>📚 Choose Your Lesson</h3>
        <p>Perfect for ${gradeLevel} students!</p>
      </div>
      <div class="lesson-list" id="lessonList">
        ${Object.entries(lessons).map(([lessonId, lesson]) => `
          <div class="lesson-item" data-lesson-id="${lessonId}">
            <div class="lesson-info">
              <h4>${lesson.title}</h4>
              <div class="lesson-meta">
                <span class="lesson-duration">⏱️ ${lesson.duration}</span>
                <span class="lesson-difficulty">📊 ${lesson.difficulty}</span>
              </div>
            </div>
            <button class="start-lesson-btn" onclick="window.schoolManager.startSpecificLesson('${gradeLevel}', '${lessonId}')">
              Start Lesson ▶️
            </button>
          </div>
        `).join('')}
      </div>
      <div class="lesson-controls">
        <button id="closeLessonSelection" class="secondary-btn">Close</button>
      </div>
    `;
    
    // Insert into popup
    const container = document.querySelector('.energy-display') || document.body;
    container.appendChild(lessonUI);
    
    // Add close event listener
    document.getElementById('closeLessonSelection')?.addEventListener('click', () => {
      lessonUI.remove();
    });
  }
  
  async startSpecificLesson(gradeLevel, lessonId) {
    if (!this.lessonManager) {
      console.error('[SchoolManager] Lesson manager not available');
      return;
    }
    
    console.log('[SchoolManager] Starting lesson:', gradeLevel, lessonId);
    
    // Start lesson in lesson manager
    const started = this.lessonManager.startLesson(gradeLevel, lessonId);
    if (!started) {
      this.showMessage('Failed to start lesson. Please try again.', 'error');
      return;
    }
    
    // Get lesson content
    const lesson = this.lessonManager.getLesson(gradeLevel, lessonId);
    this.currentLesson = { gradeLevel, lessonId, lesson };
    
    // Display lesson content
    this.displayLessonContent(lesson);
    
    // Hide lesson selection UI
    const selectionUI = document.getElementById('lessonSelectionUI');
    if (selectionUI) selectionUI.remove();
    
    this.showMessage(`Started: ${lesson.title}`, 'success');
  }
  
  displayLessonContent(lesson) {
    // Remove existing lesson content
    const existingContent = document.getElementById('currentLessonContent');
    if (existingContent) existingContent.remove();
    
    // Create lesson content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'currentLessonContent';
    contentContainer.className = 'lesson-content-container';
    
    contentContainer.innerHTML = `
      <div class="lesson-content-header">
        <h2>${lesson.title}</h2>
        <div class="lesson-progress">
          <span class="progress-text">Lesson in Progress</span>
          <button id="completeLessonBtn" class="complete-lesson-btn">Complete Lesson ✅</button>
        </div>
      </div>
      <div class="lesson-content-body">
        ${lesson.content}
      </div>
      <div class="lesson-controls">
        <button id="closeLessonBtn" class="secondary-btn">Close Lesson</button>
        <button id="nextLessonBtn" class="primary-btn" style="display: none;">Next Lesson ➡️</button>
      </div>
    `;
    
    // Insert into popup
    const container = document.querySelector('.popup-content') || document.body;
    container.appendChild(contentContainer);
    
    // Add event listeners
    document.getElementById('closeLessonBtn')?.addEventListener('click', () => {
      contentContainer.remove();
      this.currentLesson = null;
    });
    
    // Update lesson-specific dynamic content
    this.updateLessonDynamicContent();
  }
  
  updateLessonDynamicContent() {
    // Update real-time energy values in lesson content
    const currentWattsEl = document.getElementById('currentWatts');
    const realTimeWattsEl = document.getElementById('realTimeWatts');
    
    // Get current energy data (from main popup)
    const powerValue = document.getElementById('powerValue');
    const currentWatts = powerValue ? parseFloat(powerValue.textContent) || 25 : 25;
    
    if (currentWattsEl) currentWattsEl.textContent = currentWatts;
    if (realTimeWattsEl) realTimeWattsEl.textContent = currentWatts;
    
    // Update demo values
    const demoElements = document.querySelectorAll('.demo-number');
    demoElements.forEach(el => {
      el.textContent = `${currentWatts}W`;
    });
    
    // Update CO2 savings (simple calculation)
    const co2SavedEl = document.getElementById('co2Prevented');
    if (co2SavedEl) {
      const co2Saved = Math.max(0, (30 - currentWatts) * 0.5); // Simple formula
      co2SavedEl.textContent = `${co2Saved.toFixed(1)}g`;
    }
  }
  
  async completeCurrentLesson() {
    if (!this.currentLesson || !this.lessonManager) return;
    
    console.log('[SchoolManager] Completing lesson:', this.currentLesson.lessonId);
    
    // Complete lesson in lesson manager
    const completed = this.lessonManager.completeLesson();
    if (!completed) {
      this.showMessage('Failed to complete lesson.', 'error');
      return;
    }
    
    // Update student progress
    if (this.studentInfo) {
      this.studentInfo.lessonsCompleted = (this.studentInfo.lessonsCompleted || 0) + 1;
      await this.saveStudentData();
    }
    
    // Check for achievements
    this.checkLessonAchievements();
    
    // Show completion message
    this.showLessonCompletionMessage();
    
    // Clear current lesson
    this.currentLesson = null;
    
    // Remove lesson content
    const contentContainer = document.getElementById('currentLessonContent');
    if (contentContainer) contentContainer.remove();
  }
  
  checkLessonAchievements() {
    if (!this.studentInfo) return;
    
    const lessonsCompleted = this.studentInfo.lessonsCompleted || 0;
    const newAchievements = [];
    const existingAchievements = this.achievements.map(a => a.id);
    
    // Lesson Learner (3 lessons)
    if (lessonsCompleted >= 3 && !existingAchievements.includes('lesson-learner')) {
      newAchievements.push({
        id: 'lesson-learner',
        emoji: '🎓',
        title: 'Lesson Learner',
        description: 'Completed 3 energy lessons!',
        earnedDate: Date.now()
      });
    }
    
    // Knowledge Master (10 lessons)
    if (lessonsCompleted >= 10 && !existingAchievements.includes('knowledge-master')) {
      newAchievements.push({
        id: 'knowledge-master',
        emoji: '🧠',
        title: 'Knowledge Master',
        description: 'Completed 10 energy lessons!',
        earnedDate: Date.now()
      });
    }
    
    if (newAchievements.length > 0) {
      this.achievements.push(...newAchievements);
      this.saveAchievements();
      this.showAchievementNotification(newAchievements[0]);
    }
  }
  
  showLessonCompletionMessage() {
    const lesson = this.currentLesson.lesson;
    const completionMessage = `
      🎉 Lesson Complete!<br>
      <strong>${lesson.title}</strong><br>
      Great job learning about energy! 🌟
    `;
    
    // Create completion popup
    const popup = document.createElement('div');
    popup.className = 'lesson-completion-popup';
    popup.innerHTML = `
      <div class="completion-content">
        <div class="completion-icon">🏆</div>
        <div class="completion-message">${completionMessage}</div>
        <div class="completion-stats">
          <p>Lessons completed: <strong>${(this.studentInfo.lessonsCompleted || 0) + 1}</strong></p>
        </div>
        <button class="completion-close" onclick="this.parentElement.parentElement.remove()">
          Awesome! ✨
        </button>
      </div>
    `;
    
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #a3e635, #65a30d); color: white;
      border-radius: 16px; padding: 24px; z-index: 9999; text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3); animation: bounceIn 0.6s ease;
      max-width: 320px; font-size: 16px;
    `;
    
    document.body.appendChild(popup);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
      if (popup.parentElement) popup.remove();
    }, 8000);
  }
  
  startLesson() {
    // General lesson start - show lesson selection
    if (this.currentMode === 'lesson') {
      this.showAvailableLessons();
    } else {
      this.showMessage('Please enable lesson mode first!', 'error');
    }
  }
  
  nextLesson() {
    // Show next available lesson
    if (!this.lessonManager || !this.studentInfo) return;
    
    const gradeLevel = this.studentInfo.gradeLevel;
    const lessons = this.lessonManager.getLessonsForGrade(gradeLevel);
    const lessonIds = Object.keys(lessons);
    
    if (this.currentLesson) {
      const currentIndex = lessonIds.indexOf(this.currentLesson.lessonId);
      const nextIndex = (currentIndex + 1) % lessonIds.length;
      const nextLessonId = lessonIds[nextIndex];
      
      this.startSpecificLesson(gradeLevel, nextLessonId);
    } else {
      // Start first lesson
      if (lessonIds.length > 0) {
        this.startSpecificLesson(gradeLevel, lessonIds[0]);
      }
    }
  }
  
  async saveLessonMode(enabled) {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.LESSON_MODE]: enabled
    });
  }
  
  enableLessonInterface() {
    // Make interface more kid-friendly
    const powerValue = document.getElementById('powerValue');
    const powerDescription = document.getElementById('powerDescription');
    
    if (powerValue && powerDescription) {
      // Add fun emojis and simpler language
      powerValue.style.fontSize = '2.5rem';
      powerDescription.innerHTML = `
        <div class="kid-friendly-description">
          🌟 Your Energy Score is <strong>${powerValue.textContent}</strong>! 
          <br>Great job being eco-friendly! 🌱
        </div>
      `;
    }
    
    // Show lesson content if available
    this.showLessonContent();
  }
  
  disableLessonInterface() {
    // Restore normal interface
    const powerValue = document.getElementById('powerValue');
    if (powerValue) {
      powerValue.style.fontSize = '';
    }
  }
  
  showLessonContent() {
    // This would show educational content - placeholder for now
    console.log('[SchoolManager] Showing lesson content for grade:', this.studentInfo?.gradeLevel);
  }
  
  // Utility methods
  safeAddEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element && typeof handler === 'function') {
      element.addEventListener(eventType, handler);
      console.log(`[SchoolManager] Event listener added for ${elementId}`);
    }
  }
  
  isChromeApiAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }
  
  showMessage(message, type = 'info') {
    console.log(`[SchoolManager] ${type.toUpperCase()}: ${message}`);
    
    // Try to show toast if available (from popup.js)
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      // Fallback: create simple message display
      const messageEl = document.createElement('div');
      messageEl.className = `school-message ${type}`;
      messageEl.textContent = message;
      messageEl.style.cssText = `
        position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
        background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#0ea5e9'};
        color: white; padding: 8px 16px; border-radius: 6px; z-index: 9999;
      `;
      
      document.body.appendChild(messageEl);
      setTimeout(() => messageEl.remove(), 3000);
    }
  }
  
  // Public API methods
  getStudentInfo() {
    return this.studentInfo;
  }
  
  getCurrentMode() {
    return this.currentMode;
  }
  
  isSchoolModeEnabled() {
    return this.currentMode === 'school' || this.currentMode === 'lesson';
  }
  
  getDailyGoals() {
    return this.dailyGoals;
  }
  
  getAchievements() {
    return this.achievements;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchoolManager;
} else if (typeof window !== 'undefined') {
  window.SchoolManager = SchoolManager;
}