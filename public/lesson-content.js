// Lesson Content Library - Educational content for different grade levels
// Age-appropriate energy education content

class LessonContentManager {
  constructor() {
    this.currentLesson = null;
    this.completedLessons = [];
    
    // Grade-level appropriate lesson content
    this.lessons = {
      'K-2': {
        'energy-basics': {
          title: '⚡ What is Digital Energy?',
          duration: '5 minutes',
          difficulty: 'Easy',
          content: `
            <div class="lesson-card kid-friendly">
              <div class="lesson-hero">
                <h2>🌟 Digital Energy is Everywhere! 🌟</h2>
                <div class="big-emoji">💻⚡</div>
              </div>
              
              <div class="lesson-section">
                <h3>Did You Know? 🤔</h3>
                <p class="big-text">Your computer uses electricity just like a light bulb! 💡</p>
                <p class="big-text">Every time you click or type, you're using a tiny bit of energy! ⚡</p>
              </div>
              
              <div class="lesson-activity">
                <h3>🎮 Fun Activity!</h3>
                <p>Look at your energy number at the top! Can you make it smaller by closing tabs you don't need?</p>
                <div class="activity-box">
                  <div class="energy-demo" id="kidEnergyDemo">Your energy: <span class="demo-number">15W</span></div>
                  <button class="fun-button" onclick="showEnergyTip()">Get a Super Tip! 🚀</button>
                </div>
              </div>
              
              <div class="lesson-fact">
                <div class="fact-bubble">
                  <strong>🌍 Amazing Fact!</strong><br>
                  If everyone saved just a little energy on their computers, it's like taking 1 million cars off the road! 🚗➡️🌱
                </div>
              </div>
            </div>
          `,
          quiz: [
            {
              question: "What does your computer use to work?",
              options: ["Water 💧", "Electricity ⚡", "Air 💨", "Magic ✨"],
              correct: 1,
              explanation: "Great job! Computers use electricity to power all their parts! ⚡"
            }
          ]
        },
        'saving-energy': {
          title: '🌱 How to Save Energy',
          duration: '7 minutes',
          difficulty: 'Easy',
          content: `
            <div class="lesson-card kid-friendly">
              <div class="lesson-hero">
                <h2>🌱 Be an Energy Superhero! 🦸‍♂️</h2>
                <div class="big-emoji">🦸‍♀️💚</div>
              </div>
              
              <div class="lesson-section">
                <h3>Super Powers for Saving Energy! 💪</h3>
                <div class="superhero-tips">
                  <div class="tip-card">
                    <div class="tip-emoji">🚪</div>
                    <div class="tip-text">Close tabs you don't need!</div>
                  </div>
                  <div class="tip-card">
                    <div class="tip-emoji">🌙</div>
                    <div class="tip-text">Turn down screen brightness!</div>
                  </div>
                  <div class="tip-card">
                    <div class="tip-emoji">⏯️</div>
                    <div class="tip-text">Pause videos when not watching!</div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-activity">
                <h3>🎯 Your Mission!</h3>
                <p class="mission-text">Try to get your energy number below 20! You can do it! 🌟</p>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 30%"></div>
                  <span class="progress-text">Keep going! 🚀</span>
                </div>
              </div>
            </div>
          `
        }
      },
      '3-5': {
        'energy-basics': {
          title: '⚡ Understanding Digital Energy',
          duration: '8 minutes',
          difficulty: 'Medium',
          content: `
            <div class="lesson-card">
              <div class="lesson-hero">
                <h2>⚡ How Computers Use Energy</h2>
                <div class="lesson-icon">💻🔌</div>
              </div>
              
              <div class="lesson-section">
                <h3>Energy and Your Computer 🖥️</h3>
                <p>Every time you use your computer, it needs electricity to:</p>
                <ul class="energy-list">
                  <li>💡 Light up your screen</li>
                  <li>🧠 Process your clicks and typing</li>
                  <li>🌐 Connect to the internet</li>
                  <li>🔊 Play sounds and videos</li>
                </ul>
              </div>
              
              <div class="lesson-experiment">
                <h3>🧪 Cool Experiment!</h3>
                <p>The number at the top shows how much energy you're using right now. It's measured in "watts" - the same unit used for light bulbs!</p>
                <div class="comparison-box">
                  <div class="compare-item">
                    <div class="compare-icon">💡</div>
                    <div class="compare-text">LED Light Bulb<br><strong>10 watts</strong></div>
                  </div>
                  <div class="compare-vs">VS</div>
                  <div class="compare-item">
                    <div class="compare-icon">💻</div>
                    <div class="compare-text">Your Computer<br><strong><span id="currentWatts">25</span> watts</strong></div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-challenge">
                <h3>🎯 Energy Challenge!</h3>
                <p>Can you reduce your energy use by 20%? Here's how:</p>
                <div class="challenge-steps">
                  <div class="step">1️⃣ Close unnecessary browser tabs</div>
                  <div class="step">2️⃣ Pause any videos playing</div>
                  <div class="step">3️⃣ Lower your screen brightness</div>
                  <div class="step">4️⃣ Watch your energy number go down! 📉</div>
                </div>
              </div>
            </div>
          `,
          quiz: [
            {
              question: "What unit do we use to measure energy consumption?",
              options: ["Pounds", "Watts", "Miles", "Degrees"],
              correct: 1,
              explanation: "Correct! Watts measure how much electricity something uses per second."
            },
            {
              question: "Which uses more energy?",
              options: ["A single webpage", "Multiple tabs with videos", "A calculator", "A text document"],
              correct: 1,
              explanation: "Right! Multiple tabs with videos use much more energy than simple text pages."
            }
          ]
        },
        'co2-connection': {
          title: '🌍 Energy and Our Planet',
          duration: '10 minutes',
          difficulty: 'Medium',
          content: `
            <div class="lesson-card">
              <div class="lesson-hero">
                <h2>🌍 How Computer Energy Affects Earth</h2>
                <div class="lesson-icon">🌱💚</div>
              </div>
              
              <div class="lesson-section">
                <h3>The Energy Journey 🔄</h3>
                <div class="energy-journey">
                  <div class="journey-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>⚡ Power Plant</h4>
                      <p>Electricity is made at power plants</p>
                    </div>
                  </div>
                  <div class="journey-arrow">→</div>
                  <div class="journey-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>🏠 Your Home</h4>
                      <p>Electricity travels to your computer</p>
                    </div>
                  </div>
                  <div class="journey-arrow">→</div>
                  <div class="journey-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>🌍 Environment</h4>
                      <p>Making electricity can create CO₂</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-impact">
                <h3>Your Impact Today 🌟</h3>
                <div class="impact-stats">
                  <div class="stat-item">
                    <div class="stat-icon">💾</div>
                    <div class="stat-text">Energy saved: <strong id="energySavedToday">2.5W</strong></div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">🌱</div>
                    <div class="stat-text">CO₂ prevented: <strong id="co2Prevented">1.2g</strong></div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">🌳</div>
                    <div class="stat-text">Like planting: <strong id="treeEquivalent">0.01</strong> trees!</div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-action">
                <h3>🚀 Take Action!</h3>
                <p>Every watt you save helps protect our planet. Small actions make a big difference when everyone does them!</p>
                <div class="action-grid">
                  <div class="action-item">🔋 Use energy wisely</div>
                  <div class="action-item">🌿 Protect nature</div>
                  <div class="action-item">🌍 Help the planet</div>
                  <div class="action-item">⭐ Be a hero!</div>
                </div>
              </div>
            </div>
          `
        }
      },
      '6-8': {
        'energy-systems': {
          title: '⚡ Digital Energy Systems',
          duration: '12 minutes',
          difficulty: 'Advanced',
          content: `
            <div class="lesson-card advanced">
              <div class="lesson-hero">
                <h2>⚡ Understanding Digital Energy Systems</h2>
                <div class="lesson-icon">🔬⚙️</div>
              </div>
              
              <div class="lesson-section">
                <h3>Computer Components and Energy 🖥️</h3>
                <div class="component-breakdown">
                  <div class="component">
                    <div class="component-icon">🧠</div>
                    <div class="component-info">
                      <h4>CPU (Processor)</h4>
                      <p>Uses: 15-65 watts</p>
                      <p>More complex tasks = more energy</p>
                    </div>
                  </div>
                  <div class="component">
                    <div class="component-icon">🖼️</div>
                    <div class="component-info">
                      <h4>GPU (Graphics)</h4>
                      <p>Uses: 5-250 watts</p>
                      <p>Videos and games use the most</p>
                    </div>
                  </div>
                  <div class="component">
                    <div class="component-icon">💡</div>
                    <div class="component-info">
                      <h4>Display</h4>
                      <p>Uses: 20-100 watts</p>
                      <p>Brightness affects energy use</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-data">
                <h3>📊 Real Energy Data</h3>
                <p>Your current browser is using approximately <strong><span id="realTimeWatts">32.5</span> watts</strong></p>
                <div class="energy-breakdown">
                  <div class="breakdown-item">
                    <span class="breakdown-label">Base System:</span>
                    <span class="breakdown-value">12W</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="breakdown-label">Web Processing:</span>
                    <span class="breakdown-value">8W</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="breakdown-label">Display:</span>
                    <span class="breakdown-value">12.5W</span>
                  </div>
                </div>
              </div>
              
              <div class="lesson-calculation">
                <h3>🧮 Energy Math Challenge</h3>
                <p>If your computer uses 30 watts for 1 hour, that's 30 watt-hours (Wh) of energy.</p>
                <div class="math-problem">
                  <p><strong>Problem:</strong> How much energy do you use if you leave your computer on for 8 hours?</p>
                  <div class="calculation-box">
                    <input type="number" id="mathAnswer" placeholder="Enter your answer in Wh">
                    <button class="check-answer" onclick="checkMathAnswer()">Check Answer ✓</button>
                  </div>
                  <div class="answer-feedback" id="mathFeedback"></div>
                </div>
              </div>
            </div>
          `,
          quiz: [
            {
              question: "Which computer component typically uses the most energy when watching videos?",
              options: ["CPU", "GPU (Graphics)", "RAM", "Hard Drive"],
              correct: 1,
              explanation: "Correct! The GPU (Graphics Processing Unit) works hardest when processing videos and uses the most energy."
            }
          ]
        }
      },
      '9-12': {
        'advanced-energy': {
          title: '🔬 Advanced Energy Analysis',
          duration: '15 minutes',
          difficulty: 'Expert',
          content: `
            <div class="lesson-card expert">
              <div class="lesson-hero">
                <h2>🔬 Advanced Digital Energy Analysis</h2>
                <div class="lesson-icon">📈⚛️</div>
              </div>
              
              <div class="lesson-section">
                <h3>Energy Efficiency Metrics 📊</h3>
                <div class="metrics-grid">
                  <div class="metric-card">
                    <h4>Power Usage Effectiveness (PUE)</h4>
                    <p>Measures data center efficiency. Lower is better.</p>
                    <div class="metric-example">Google's PUE: ~1.1</div>
                  </div>
                  <div class="metric-card">
                    <h4>Carbon Intensity</h4>
                    <p>gCO₂/kWh - varies by power source</p>
                    <div class="metric-example">Coal: 820g | Solar: 40g</div>
                  </div>
                </div>
              </div>
              
              <div class="lesson-research">
                <h3>🔍 Research Project</h3>
                <p>Investigate your local power grid's carbon intensity:</p>
                <ol class="research-steps">
                  <li>Find your utility company's energy mix</li>
                  <li>Calculate the carbon footprint of your computer usage</li>
                  <li>Compare renewable vs fossil fuel impact</li>
                  <li>Propose optimization strategies</li>
                </ol>
              </div>
              
              <div class="lesson-coding">
                <h3>💻 Code Challenge</h3>
                <p>Write a function to calculate daily energy consumption:</p>
                <pre class="code-block">
function calculateDailyEnergy(watts, hoursUsed) {
    // Your code here
    // Return energy in kWh
}

// Test: 50W computer used 8 hours = ? kWh
</pre>
                <button class="code-hint" onclick="showCodeHint()">Show Hint 💡</button>
              </div>
            </div>
          `
        }
      }
    };
    
    this.init();
  }
  
  init() {
    console.log('[LessonContentManager] Lesson content library initialized');
  }
  
  getLessonsForGrade(gradeLevel) {
    return this.lessons[gradeLevel] || this.lessons['3-5'];
  }
  
  getLesson(gradeLevel, lessonId) {
    const gradeLessons = this.getLessonsForGrade(gradeLevel);
    return gradeLessons[lessonId] || null;
  }
  
  startLesson(gradeLevel, lessonId) {
    const lesson = this.getLesson(gradeLevel, lessonId);
    if (!lesson) {
      console.error('[LessonContentManager] Lesson not found:', gradeLevel, lessonId);
      return false;
    }
    
    this.currentLesson = {
      gradeLevel,
      lessonId,
      startTime: Date.now(),
      completed: false
    };
    
    console.log('[LessonContentManager] Started lesson:', lesson.title);
    return true;
  }
  
  completeLesson() {
    if (!this.currentLesson) return false;
    
    this.currentLesson.completed = true;
    this.currentLesson.completionTime = Date.now();
    this.currentLesson.duration = this.currentLesson.completionTime - this.currentLesson.startTime;
    
    // Add to completed lessons
    this.completedLessons.push({...this.currentLesson});
    
    console.log('[LessonContentManager] Lesson completed:', this.currentLesson);
    
    // Clear current lesson
    this.currentLesson = null;
    
    return true;
  }
  
  // Interactive lesson functions for the content
  showEnergyTip() {
    const tips = [
      "🚪 Close tabs you're not using to save energy!",
      "🌙 Lower your screen brightness to use less power!",
      "⏯️ Pause videos when you're not watching them!",
      "🔄 Refresh pages that seem slow instead of opening new tabs!",
      "💾 Save your work and take breaks to let your computer rest!"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    this.showTipPopup(randomTip);
  }
  
  showTipPopup(tip) {
    const popup = document.createElement('div');
    popup.className = 'lesson-tip-popup';
    popup.innerHTML = `
      <div class="tip-popup-content">
        <div class="tip-popup-text">${tip}</div>
        <button class="tip-popup-close" onclick="this.parentElement.parentElement.remove()">Got it! ✨</button>
      </div>
    `;
    
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #fef3c7, #fed7aa); border: 2px solid #f59e0b;
      border-radius: 12px; padding: 20px; z-index: 9999; text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: bounceIn 0.5s ease;
      max-width: 300px; font-size: 16px; color: #92400e; font-weight: 500;
    `;
    
    document.body.appendChild(popup);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (popup.parentElement) popup.remove();
    }, 5000);
  }
  
  checkMathAnswer() {
    const answerInput = document.getElementById('mathAnswer');
    const feedbackDiv = document.getElementById('mathFeedback');
    
    if (!answerInput || !feedbackDiv) return;
    
    const userAnswer = parseInt(answerInput.value);
    const correctAnswer = 30 * 8; // 240 Wh
    
    if (userAnswer === correctAnswer) {
      feedbackDiv.innerHTML = `<div class="correct-answer">🎉 Correct! 30W × 8 hours = 240 Wh</div>`;
      feedbackDiv.className = 'answer-feedback correct';
    } else {
      feedbackDiv.innerHTML = `<div class="wrong-answer">❌ Not quite. Try: 30 watts × 8 hours = ?</div>`;
      feedbackDiv.className = 'answer-feedback incorrect';
    }
  }
  
  showCodeHint() {
    alert('💡 Hint: Energy in kWh = (watts × hours) ÷ 1000\n\nExample: return (watts * hoursUsed) / 1000;');
  }
  
  getCurrentLesson() {
    return this.currentLesson;
  }
  
  getCompletedLessons() {
    return this.completedLessons;
  }
  
  // Calculate lesson completion percentage for grade
  getGradeProgress(gradeLevel) {
    const gradeLessons = this.getLessonsForGrade(gradeLevel);
    const totalLessons = Object.keys(gradeLessons).length;
    const completedForGrade = this.completedLessons.filter(
      lesson => lesson.gradeLevel === gradeLevel
    ).length;
    
    return totalLessons > 0 ? (completedForGrade / totalLessons) * 100 : 0;
  }
}

// Interactive lesson helper functions (global scope for HTML content)
function showEnergyTip() {
  if (window.lessonManager) {
    window.lessonManager.showEnergyTip();
  }
}

function checkMathAnswer() {
  if (window.lessonManager) {
    window.lessonManager.checkMathAnswer();
  }
}

function showCodeHint() {
  if (window.lessonManager) {
    window.lessonManager.showCodeHint();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonContentManager;
} else if (typeof window !== 'undefined') {
  window.LessonContentManager = LessonContentManager;
}