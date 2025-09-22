// Goal & Achievement System - Enhanced student progress tracking
// Local-only implementation for Chrome extension

class GoalAchievementSystem {
  constructor(schoolManager) {
    this.schoolManager = schoolManager;
    this.goals = {};
    this.achievements = [];
    this.streaks = {};
    this.dailyProgress = {};
    
    // Achievement definitions
    this.ACHIEVEMENT_DEFINITIONS = {
      // Energy Saving Achievements
      'first-saver': {
        id: 'first-saver',
        emoji: '🌱',
        title: 'First Energy Saver',
        description: 'Saved energy for the first time!',
        category: 'energy',
        points: 10,
        condition: (data) => data.energySaved > 0
      },
      'power-reducer': {
        id: 'power-reducer',
        emoji: '⚡',
        title: 'Power Reducer',
        description: 'Reduced power usage by 20% in one session',
        category: 'energy',
        points: 25,
        condition: (data) => data.energyReduction >= 20
      },
      'eco-warrior': {
        id: 'eco-warrior',
        emoji: '🦸‍♀️',
        title: 'Eco Warrior',
        description: 'Saved energy 5 days in a row!',
        category: 'streak',
        points: 50,
        condition: (data) => data.dailyStreak >= 5
      },
      'carbon-crusher': {
        id: 'carbon-crusher',
        emoji: '🌍',
        title: 'Carbon Crusher',
        description: 'Prevented 100g of CO₂ emissions',
        category: 'environmental',
        points: 75,
        condition: (data) => data.totalCO2Saved >= 100
      },
      
      // Learning Achievements
      'lesson-starter': {
        id: 'lesson-starter',
        emoji: '📚',
        title: 'Lesson Starter',
        description: 'Completed your first energy lesson!',
        category: 'learning',
        points: 15,
        condition: (data) => data.lessonsCompleted >= 1
      },
      'knowledge-seeker': {
        id: 'knowledge-seeker',
        emoji: '🎓',
        title: 'Knowledge Seeker',
        description: 'Completed 5 energy lessons',
        category: 'learning',
        points: 40,
        condition: (data) => data.lessonsCompleted >= 5
      },
      'energy-expert': {
        id: 'energy-expert',
        emoji: '🧠',
        title: 'Energy Expert',
        description: 'Completed 10 energy lessons',
        category: 'learning',
        points: 100,
        condition: (data) => data.lessonsCompleted >= 10
      },
      'quiz-master': {
        id: 'quiz-master',
        emoji: '💯',
        title: 'Quiz Master',
        description: 'Got 100% on 3 lesson quizzes',
        category: 'learning',
        points: 60,
        condition: (data) => data.perfectQuizzes >= 3
      },
      
      // Goal Achievements
      'goal-getter': {
        id: 'goal-getter',
        emoji: '🎯',
        title: 'Goal Getter',
        description: 'Met your daily energy goal!',
        category: 'goals',
        points: 20,
        condition: (data) => data.dailyGoalMet === true
      },
      'streak-keeper': {
        id: 'streak-keeper',
        emoji: '🔥',
        title: 'Streak Keeper',
        description: 'Met your goal 7 days in a row!',
        category: 'goals',
        points: 80,
        condition: (data) => data.goalStreak >= 7
      },
      'overachiever': {
        id: 'overachiever',
        emoji: '⭐',
        title: 'Overachiever',
        description: 'Exceeded your goal by 50%!',
        category: 'goals',
        points: 30,
        condition: (data) => data.goalExceedPercent >= 150
      },
      
      // Special Achievements
      'early-bird': {
        id: 'early-bird',
        emoji: '🌅',
        title: 'Early Bird',
        description: 'Started saving energy before 9 AM',
        category: 'special',
        points: 15,
        condition: (data) => data.startHour < 9
      },
      'night-saver': {
        id: 'night-saver',
        emoji: '🌙',
        title: 'Night Saver',
        description: 'Saved energy after 8 PM',
        category: 'special',
        points: 15,
        condition: (data) => data.saveHour >= 20
      },
      'consistent-saver': {
        id: 'consistent-saver',
        emoji: '📈',
        title: 'Consistent Saver',
        description: 'Maintained steady energy savings for 30 days',
        category: 'special',
        points: 200,
        condition: (data) => data.consistentDays >= 30
      }
    };
    
    // Goal types with grade-appropriate defaults
    this.GOAL_TYPES = {
      'daily-energy-reduction': {
        name: 'Daily Energy Reduction',
        description: 'Reduce your energy usage by a target percentage each day',
        unit: '%',
        defaultTargets: {
          'K-2': 5,
          '3-5': 10,
          '6-8': 15,
          '9-12': 20
        }
      },
      'weekly-lessons': {
        name: 'Weekly Lesson Completion',
        description: 'Complete energy lessons each week',
        unit: 'lessons',
        defaultTargets: {
          'K-2': 1,
          '3-5': 2,
          '6-8': 3,
          '9-12': 4
        }
      },
      'co2-prevention': {
        name: 'Weekly CO₂ Prevention',
        description: 'Prevent CO₂ emissions through energy savings',
        unit: 'grams',
        defaultTargets: {
          'K-2': 25,
          '3-5': 50,
          '6-8': 100,
          '9-12': 200
        }
      },
      'streak-maintenance': {
        name: 'Energy Saving Streak',
        description: 'Save energy consistently each day',
        unit: 'days',
        defaultTargets: {
          'K-2': 3,
          '3-5': 5,
          '6-8': 7,
          '9-12': 14
        }
      }
    };
    
    this.init();
  }
  
  async init() {
    console.log('[GoalAchievementSystem] Initializing goal and achievement system...');
    
    // Load existing data
    await this.loadGoalData();
    await this.loadAchievementData();
    
    // Set up default goals if none exist
    if (Object.keys(this.goals).length === 0) {
      this.setupDefaultGoals();
    }
    
    console.log('[GoalAchievementSystem] System initialized');
  }
  
  async loadGoalData() {
    try {
      if (!this.isChromeApiAvailable()) return;
      
      const result = await chrome.storage.local.get(['studentGoals', 'dailyProgress', 'streaks']);
      
      this.goals = result.studentGoals || {};
      this.dailyProgress = result.dailyProgress || {};
      this.streaks = result.streaks || {};
      
      console.log('[GoalAchievementSystem] Goal data loaded:', {
        goals: Object.keys(this.goals).length,
        progressDays: Object.keys(this.dailyProgress).length,
        streaks: Object.keys(this.streaks).length
      });
      
    } catch (error) {
      console.error('[GoalAchievementSystem] Failed to load goal data:', error);
    }
  }
  
  async loadAchievementData() {
    try {
      if (!this.isChromeApiAvailable()) return;
      
      const result = await chrome.storage.local.get(['studentAchievements']);
      this.achievements = result.studentAchievements || [];
      
      console.log('[GoalAchievementSystem] Achievement data loaded:', this.achievements.length, 'achievements');
      
    } catch (error) {
      console.error('[GoalAchievementSystem] Failed to load achievement data:', error);
    }
  }
  
  setupDefaultGoals() {
    const studentInfo = this.schoolManager.getStudentInfo();
    if (!studentInfo) return;
    
    const gradeLevel = studentInfo.gradeLevel;
    
    // Create default goals based on grade level
    Object.entries(this.GOAL_TYPES).forEach(([goalId, goalType]) => {
      this.goals[goalId] = {
        id: goalId,
        name: goalType.name,
        description: goalType.description,
        target: goalType.defaultTargets[gradeLevel] || goalType.defaultTargets['3-5'],
        unit: goalType.unit,
        current: 0,
        isActive: true,
        createdDate: Date.now(),
        lastUpdated: Date.now()
      };
    });
    
    this.saveGoalData();
    console.log('[GoalAchievementSystem] Default goals created for grade:', gradeLevel);
  }
  
  async saveGoalData() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      studentGoals: this.goals,
      dailyProgress: this.dailyProgress,
      streaks: this.streaks
    });
  }
  
  async saveAchievementData() {
    if (!this.isChromeApiAvailable()) return;
    
    await chrome.storage.local.set({
      studentAchievements: this.achievements
    });
  }
  
  // Goal Management
  createCustomGoal(name, description, target, unit, category = 'custom') {
    const goalId = `custom-${Date.now()}`;
    
    this.goals[goalId] = {
      id: goalId,
      name: name,
      description: description,
      target: target,
      unit: unit,
      category: category,
      current: 0,
      isActive: true,
      isCustom: true,
      createdDate: Date.now(),
      lastUpdated: Date.now()
    };
    
    this.saveGoalData();
    console.log('[GoalAchievementSystem] Custom goal created:', name);
    
    return goalId;
  }
  
  updateGoalProgress(goalId, value, operation = 'add') {
    if (!this.goals[goalId]) return false;
    
    const goal = this.goals[goalId];
    const oldValue = goal.current;
    
    switch (operation) {
      case 'add':
        goal.current += value;
        break;
      case 'set':
        goal.current = value;
        break;
      case 'max':
        goal.current = Math.max(goal.current, value);
        break;
      default:
        goal.current += value;
    }
    
    goal.lastUpdated = Date.now();
    
    // Check if goal was completed
    const wasCompleted = oldValue >= goal.target;
    const isCompleted = goal.current >= goal.target;
    
    if (!wasCompleted && isCompleted) {
      this.onGoalCompleted(goalId);
    }
    
    this.saveGoalData();
    return true;
  }
  
  onGoalCompleted(goalId) {
    const goal = this.goals[goalId];
    console.log('[GoalAchievementSystem] Goal completed:', goal.name);
    
    // Award points
    const points = this.calculateGoalPoints(goal);
    this.awardPoints(points);
    
    // Check for goal-related achievements
    this.checkGoalAchievements();
    
    // Show celebration
    this.showGoalCompletionCelebration(goal);
  }
  
  calculateGoalPoints(goal) {
    const basePoints = {
      'daily-energy-reduction': 20,
      'weekly-lessons': 30,
      'co2-prevention': 25,
      'streak-maintenance': 40,
      'custom': 15
    };
    
    return basePoints[goal.category] || basePoints['custom'];
  }
  
  // Achievement System
  checkAchievements(energyData = {}) {
    const studentInfo = this.schoolManager.getStudentInfo();
    if (!studentInfo) return [];
    
    const newAchievements = [];
    const existingIds = this.achievements.map(a => a.id);
    
    // Prepare data for achievement conditions
    const achievementData = {
      // Energy data
      energySaved: energyData.energySaved || 0,
      energyReduction: energyData.reductionPercent || 0,
      totalCO2Saved: this.getTotalCO2Saved(),
      
      // Learning data
      lessonsCompleted: studentInfo.lessonsCompleted || 0,
      perfectQuizzes: studentInfo.perfectQuizzes || 0,
      
      // Goal data
      dailyGoalMet: this.isDailyGoalMet(),
      goalStreak: this.getGoalStreak(),
      goalExceedPercent: this.getGoalExceedPercent(),
      
      // Time data
      startHour: new Date().getHours(),
      saveHour: new Date().getHours(),
      
      // Streak data
      dailyStreak: this.getDailyStreak(),
      consistentDays: this.getConsistentDays()
    };
    
    // Check each achievement condition
    Object.values(this.ACHIEVEMENT_DEFINITIONS).forEach(achievement => {
      if (!existingIds.includes(achievement.id) && achievement.condition(achievementData)) {
        const earnedAchievement = {
          ...achievement,
          earnedDate: Date.now(),
          data: { ...achievementData }
        };
        
        newAchievements.push(earnedAchievement);
        this.achievements.push(earnedAchievement);
      }
    });
    
    if (newAchievements.length > 0) {
      this.saveAchievementData();
      newAchievements.forEach(achievement => {
        this.showAchievementNotification(achievement);
        this.awardPoints(achievement.points);
      });
    }
    
    return newAchievements;
  }
  
  checkGoalAchievements() {
    // Check for goal-specific achievements
    const goalData = {
      dailyGoalMet: this.isDailyGoalMet(),
      goalStreak: this.getGoalStreak(),
      goalExceedPercent: this.getGoalExceedPercent()
    };
    
    this.checkAchievements(goalData);
  }
  
  // Progress Tracking
  recordDailyProgress(energyData) {
    const today = new Date().toDateString();
    
    this.dailyProgress[today] = {
      date: today,
      timestamp: Date.now(),
      energyReduction: energyData.reductionPercent || 0,
      co2Saved: energyData.co2Saved || 0,
      lessonsCompleted: energyData.lessonsCompleted || 0,
      goalsCompleted: this.getCompletedGoalsCount(),
      timeSpent: energyData.timeSpent || 0
    };
    
    // Update streaks
    this.updateStreaks(today);
    
    // Update goal progress
    this.updateDailyGoals(energyData);
    
    this.saveGoalData();
  }
  
  updateStreaks(today) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Energy saving streak
    if (this.dailyProgress[yesterday] && this.dailyProgress[yesterday].energyReduction > 0) {
      this.streaks.energySaving = (this.streaks.energySaving || 0) + 1;
    } else {
      this.streaks.energySaving = this.dailyProgress[today].energyReduction > 0 ? 1 : 0;
    }
    
    // Goal completion streak
    if (this.isDailyGoalMet(today)) {
      if (this.isDailyGoalMet(yesterday)) {
        this.streaks.goalCompletion = (this.streaks.goalCompletion || 0) + 1;
      } else {
        this.streaks.goalCompletion = 1;
      }
    } else {
      this.streaks.goalCompletion = 0;
    }
  }
  
  updateDailyGoals(energyData) {
    // Update energy reduction goal
    if (this.goals['daily-energy-reduction']) {
      this.updateGoalProgress('daily-energy-reduction', energyData.reductionPercent || 0, 'max');
    }
    
    // Update CO2 prevention goal
    if (this.goals['co2-prevention']) {
      this.updateGoalProgress('co2-prevention', energyData.co2Saved || 0, 'add');
    }
    
    // Update lesson goal
    if (this.goals['weekly-lessons'] && energyData.lessonsCompleted) {
      this.updateGoalProgress('weekly-lessons', 1, 'add');
    }
    
    // Update streak goal
    if (this.goals['streak-maintenance']) {
      this.updateGoalProgress('streak-maintenance', this.getDailyStreak(), 'set');
    }
  }
  
  // Helper Methods
  getTotalCO2Saved() {
    return Object.values(this.dailyProgress).reduce((total, day) => total + (day.co2Saved || 0), 0);
  }
  
  isDailyGoalMet(date = new Date().toDateString()) {
    const dayProgress = this.dailyProgress[date];
    if (!dayProgress) return false;
    
    // Check if main energy reduction goal was met
    const energyGoal = this.goals['daily-energy-reduction'];
    return energyGoal && dayProgress.energyReduction >= energyGoal.target;
  }
  
  getGoalStreak() {
    return this.streaks.goalCompletion || 0;
  }
  
  getGoalExceedPercent() {
    const energyGoal = this.goals['daily-energy-reduction'];
    if (!energyGoal) return 0;
    
    const today = new Date().toDateString();
    const todayProgress = this.dailyProgress[today];
    
    if (!todayProgress || energyGoal.target === 0) return 0;
    
    return Math.round((todayProgress.energyReduction / energyGoal.target) * 100);
  }
  
  getDailyStreak() {
    return this.streaks.energySaving || 0;
  }
  
  getConsistentDays() {
    // Calculate days with consistent energy saving
    const days = Object.values(this.dailyProgress);
    return days.filter(day => day.energyReduction >= 5).length; // At least 5% reduction
  }
  
  getCompletedGoalsCount() {
    return Object.values(this.goals).filter(goal => goal.current >= goal.target).length;
  }
  
  // Points System
  awardPoints(points) {
    const studentInfo = this.schoolManager.getStudentInfo();
    if (!studentInfo) return;
    
    studentInfo.totalPoints = (studentInfo.totalPoints || 0) + points;
    this.schoolManager.saveStudentData();
    
    console.log('[GoalAchievementSystem] Awarded', points, 'points. Total:', studentInfo.totalPoints);
  }
  
  // UI Methods
  showGoalCompletionCelebration(goal) {
    const celebration = document.createElement('div');
    celebration.className = 'goal-completion-celebration';
    celebration.innerHTML = `
      <div class="celebration-content">
        <div class="celebration-icon">🎯</div>
        <h3>Goal Achieved!</h3>
        <p><strong>${goal.name}</strong></p>
        <p>Target: ${goal.target} ${goal.unit}</p>
        <p>🌟 +${this.calculateGoalPoints(goal)} points!</p>
        <button class="celebration-close" onclick="this.parentElement.parentElement.remove()">
          Awesome! 🎉
        </button>
      </div>
    `;
    
    celebration.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #10b981, #059669); color: white;
      border-radius: 16px; padding: 24px; z-index: 9999; text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3); animation: goalCelebration 0.6s ease;
      max-width: 320px; font-size: 16px;
    `;
    
    // Add celebration animation
    if (!document.getElementById('goalCelebrationAnimation')) {
      const style = document.createElement('style');
      style.id = 'goalCelebrationAnimation';
      style.textContent = `
        @keyframes goalCelebration {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-5deg); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(2deg); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
      if (celebration.parentElement) celebration.remove();
    }, 10000);
  }
  
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-emoji">${achievement.emoji}</div>
        <div class="achievement-info">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          <p>🌟 +${achievement.points} points!</p>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
      border-radius: 12px; padding: 16px; z-index: 3000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: achievementSlide 0.5s ease;
      max-width: 280px; display: flex; align-items: center; gap: 12px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) notification.remove();
    }, 8000);
  }
  
  // Public API
  getGoals() {
    return this.goals;
  }
  
  getAchievements() {
    return this.achievements;
  }
  
  getProgress(timeframe = 'week') {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return Object.values(this.dailyProgress).filter(day => 
      new Date(day.timestamp) >= startDate
    );
  }
  
  getTotalPoints() {
    const studentInfo = this.schoolManager.getStudentInfo();
    return studentInfo?.totalPoints || 0;
  }
  
  getStreaks() {
    return this.streaks;
  }
  
  // Utility
  isChromeApiAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoalAchievementSystem;
} else if (typeof window !== 'undefined') {
  window.GoalAchievementSystem = GoalAchievementSystem;
}