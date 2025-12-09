/**
 * Prompt Helper Core - Shared module for prompt optimization
 * Used by both the popup and the content script widget
 */

const PromptHelperCore = {
  /**
   * Optimize a prompt by removing filler words, applying model-specific optimizations,
   * and using advanced compression techniques.
   * @param {string} prompt - The original prompt text
   * @param {string} level - Optimization level: 'conservative', 'balanced', 'aggressive'
   * @param {string} model - Target AI model: 'gpt-4', 'claude-4', 'grok-4', 'deepseek-r1', 'llama-4'
   * @returns {Object} Optimization result with metrics
   */
  optimizePrompt(prompt, level = 'balanced', model = 'gpt-4') {
    const startTime = Date.now();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return {
        success: false,
        error: 'Please enter a prompt to optimize',
        original: prompt || '',
        optimized: prompt || '',
        originalTokens: 0,
        optimizedTokens: 0,
        tokensSaved: 0,
        percentageSaved: 0,
        energySavings: { energySavedMwh: 0, energySavedWh: 0, percentageSaved: 0 },
        processingTime: 0
      };
    }

    let optimized = prompt;
    const originalTokens = this.estimateTokenCount(prompt, model);
    let removedWords = [];
    let optimizationCategories = [];

    // Layer 1: Comprehensive Filler Word Removal
    const layer1Result = this.applyFillerWordRemoval(optimized, level);
    optimized = layer1Result.text;
    removedWords = removedWords.concat(layer1Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer1Result.categories);

    // Layer 2: Model-Specific Optimization
    const layer2Result = this.applyModelSpecificOptimization(optimized, model);
    optimized = layer2Result.text;
    removedWords = removedWords.concat(layer2Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer2Result.categories);

    // Layer 3: Advanced Compression Techniques
    const layer3Result = this.applyAdvancedCompression(optimized, level);
    optimized = layer3Result.text;
    removedWords = removedWords.concat(layer3Result.removedWords);
    optimizationCategories = optimizationCategories.concat(layer3Result.categories);

    // Calculate final metrics
    const optimizedTokens = this.estimateTokenCount(optimized, model);
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    const percentageSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;
    const energySavings = this.calculateEnergySavings(tokensSaved, model);
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      original: prompt,
      optimized: optimized.trim(),
      originalTokens,
      optimizedTokens,
      tokensSaved,
      percentageSaved,
      energySavings,
      model,
      level,
      removedWords: [...new Set(removedWords)], // Deduplicate
      optimizationCategories: [...new Set(optimizationCategories)],
      processingTime
    };
  },

  /**
   * Layer 1: Comprehensive Filler Word Removal Engine
   */
  applyFillerWordRemoval(text, level) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const fillerWordCategories = {
      politenessMarkers: {
        priority: 1,
        words: [
          'please', 'thank you', 'thanks', 'kindly', 'if you don\'t mind',
          'if possible', 'if you could', 'would you mind', 'could you please',
          'would you be so kind', 'I would appreciate', 'thank you in advance',
          'many thanks', 'much appreciated', 'grateful', 'sorry to bother you',
          'I apologize for', 'excuse me', 'pardon me'
        ],
        description: 'Politeness markers'
      },
      intensifiers: {
        priority: 1,
        words: [
          'very', 'really', 'quite', 'extremely', 'absolutely', 'completely',
          'totally', 'literally', 'seriously', 'highly', 'incredibly',
          'tremendously', 'exceptionally', 'remarkably', 'particularly',
          'especially', 'significantly', 'substantially'
        ],
        description: 'Intensifiers'
      },
      qualifiers: {
        priority: 1,
        words: [
          'just', 'simply', 'basically', 'actually', 'obviously', 'clearly',
          'sort of', 'kind of', 'somewhat', 'rather', 'pretty much',
          'more or less', 'in a way', 'to some extent', 'relatively'
        ],
        description: 'Qualifiers'
      },
      verbosePhrases: {
        priority: 2,
        phrases: [
          { from: 'in order to', to: 'to' },
          { from: 'due to the fact that', to: 'because' },
          { from: 'with regard to', to: 'about' },
          { from: 'in terms of', to: 'for' },
          { from: 'for the purpose of', to: 'to' },
          { from: 'in the event that', to: 'if' },
          { from: 'at this point in time', to: 'now' },
          { from: 'prior to', to: 'before' },
          { from: 'subsequent to', to: 'after' }
        ],
        description: 'Verbose phrases'
      },
      fillerPhrases: {
        priority: 2,
        words: [
          'at the end of the day', 'for all intents and purposes',
          'the thing is', 'as a matter of fact',
          'to tell you the truth', 'to be honest', 'frankly speaking',
          'needless to say', 'it goes without saying'
        ],
        description: 'Filler phrases'
      },
      redundancies: {
        priority: 2,
        phrases: [
          { from: 'write down', to: 'write' },
          { from: 'empty out', to: 'empty' },
          { from: 'completely finish', to: 'finish' },
          { from: 'final result', to: 'result' },
          { from: 'end result', to: 'result' },
          { from: 'past history', to: 'history' },
          { from: 'future plans', to: 'plans' }
        ],
        description: 'Redundancies'
      },
      conversationFillers: {
        priority: 3,
        words: [
          'you know', 'you see', 'like', 'um', 'uh', 'er', 'ah',
          'well', 'anyway', 'by the way', 'speaking of which',
          'as I was saying', 'where was I'
        ],
        description: 'Conversation fillers'
      },
      redundantRequests: {
        priority: 3,
        words: [
          'can you', 'could you', 'would you', 'will you', 'are you able to',
          'I need you to', 'I want you to', 'I would like you to',
          'help me', 'assist me', 'I\'m asking you to'
        ],
        description: 'Redundant requests'
      }
    };

    const maxPriority = level === 'aggressive' ? 3 : level === 'balanced' ? 2 : 1;

    for (const [categoryName, category] of Object.entries(fillerWordCategories)) {
      if (category.priority <= maxPriority) {
        // Handle phrase replacements
        if (category.phrases) {
          category.phrases.forEach(replacement => {
            const regex = new RegExp(`\\b${this.escapeRegex(replacement.from)}\\b`, 'gi');
            const matches = optimized.match(regex);
            if (matches) {
              optimized = optimized.replace(regex, replacement.to);
              removedWords.push(...matches);
              if (!categories.includes(category.description)) {
                categories.push(category.description);
              }
            }
          });
        }

        // Handle word removals
        if (category.words) {
          category.words.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = optimized.match(regex);
            if (matches) {
              optimized = optimized.replace(regex, ' ');
              removedWords.push(...matches);
              if (!categories.includes(category.description)) {
                categories.push(category.description);
              }
            }
          });
        }
      }
    }

    optimized = this.cleanupWhitespace(optimized);

    return { text: optimized, removedWords, categories };
  },

  /**
   * Layer 2: Model-Specific Optimization
   */
  applyModelSpecificOptimization(text, model) {
    switch (model) {
      case 'gpt-4':
      case 'gpt-5':
        return this.optimizeForGPT4(text);
      case 'claude-4':
      case 'claude-sonnet':
        return this.optimizeForClaude(text);
      case 'grok-4':
        return this.optimizeForGrok(text);
      case 'deepseek-r1':
        return this.optimizeForDeepSeek(text);
      case 'llama-4':
        return this.optimizeForLlama(text);
      default:
        return { text: this.cleanupWhitespace(text), removedWords: [], categories: [] };
    }
  },

  optimizeForGPT4(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const contextPhrases = [
      'As an AI', 'I am an AI', 'As a language model', 'I\'m ChatGPT',
      'As ChatGPT', 'I should mention that', 'It\'s important to note that'
    ];

    contextPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('GPT-4 context reduction')) {
          categories.push('GPT-4 context reduction');
        }
      }
    });

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  optimizeForClaude(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const formalPhrases = [
      'I would be happy to', 'I\'d be glad to', 'I\'m here to help',
      'Allow me to', 'Permit me to', 'Let me assist you with'
    ];

    formalPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Claude formality reduction')) {
          categories.push('Claude formality reduction');
        }
      }
    });

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  optimizeForGrok(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const verbosePatterns = [
      'Let me explain', 'To elaborate', 'In more detail',
      'For context', 'Background information', 'Additional details'
    ];

    verbosePatterns.forEach(phrase => {
      const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Grok directness optimization')) {
          categories.push('Grok directness optimization');
        }
      }
    });

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  optimizeForDeepSeek(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const ambiguousPhrases = [
      'maybe', 'perhaps', 'possibly', 'potentially', 'might be',
      'could be', 'seems like', 'appears to be', 'looks like'
    ];

    ambiguousPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('DeepSeek clarity optimization')) {
          categories.push('DeepSeek clarity optimization');
        }
      }
    });

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  optimizeForLlama(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const casualPhrases = [
      'you know', 'like', 'basically', 'kind of', 'sort of',
      'pretty much', 'more or less', 'I guess'
    ];

    casualPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, '');
        removedWords.push(phrase);
        if (!categories.includes('Llama structure optimization')) {
          categories.push('Llama structure optimization');
        }
      }
    });

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  /**
   * Layer 3: Advanced Compression Techniques
   */
  applyAdvancedCompression(text, level) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    if (level === 'aggressive') {
      // Sentence structure optimization
      const structureResult = this.optimizeSentenceStructure(optimized);
      optimized = structureResult.text;
      removedWords = removedWords.concat(structureResult.removedWords);
      categories = categories.concat(structureResult.categories);

      // Context-aware removal
      const contextResult = this.removeRedundantContext(optimized);
      optimized = contextResult.text;
      removedWords = removedWords.concat(contextResult.removedWords);
      categories = categories.concat(contextResult.categories);
    }

    return { text: optimized, removedWords, categories };
  },

  optimizeSentenceStructure(text) {
    let optimized = text;
    let categories = [];

    // Convert passive voice to active voice (basic)
    const passivePatterns = [
      { from: /was (\w+ed) by/gi, to: '$1' },
      { from: /is (\w+ed) by/gi, to: '$1' },
      { from: /are (\w+ed) by/gi, to: '$1' }
    ];

    passivePatterns.forEach(pattern => {
      if (optimized.match(pattern.from)) {
        optimized = optimized.replace(pattern.from, pattern.to);
        if (!categories.includes('Passive to active voice')) {
          categories.push('Passive to active voice');
        }
      }
    });

    // Combine related sentences
    optimized = optimized.replace(/\.\s+Also,\s+/gi, '. ');
    optimized = optimized.replace(/\.\s+Additionally,\s+/gi, '. ');
    optimized = optimized.replace(/\.\s+Furthermore,\s+/gi, '. ');

    return { text: this.cleanupWhitespace(optimized), removedWords: [], categories };
  },

  removeRedundantContext(text) {
    let optimized = text;
    let removedWords = [];
    let categories = [];

    const words = optimized.toLowerCase().split(/\s+/);
    const wordCounts = {};

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });

    for (const [word, count] of Object.entries(wordCounts)) {
      if (count > 3) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = optimized.match(regex);
        if (matches && matches.length > 3) {
          let replacements = 0;
          optimized = optimized.replace(regex, (match) => {
            replacements++;
            return replacements > 2 ? ' ' : match;
          });
          removedWords.push(`${word} (${matches.length - 2} redundant)`);
          if (!categories.includes('Redundant concept removal')) {
            categories.push('Redundant concept removal');
          }
        }
      }
    }

    return { text: this.cleanupWhitespace(optimized), removedWords, categories };
  },

  /**
   * Estimate token count based on GPT patterns
   */
  estimateTokenCount(text, model = 'gpt-4') {
    if (!text || typeof text !== 'string') return 0;

    const normalizedText = text.trim().replace(/\s+/g, ' ');
    if (normalizedText.length === 0) return 0;

    let tokenCount = 0;
    const tokens = normalizedText.match(/\w+|[^\w\s]/g) || [];

    for (const token of tokens) {
      if (/^\w+$/.test(token)) {
        const wordLength = token.length;
        if (wordLength <= 3) {
          tokenCount += 1;
        } else if (wordLength <= 6) {
          tokenCount += 1;
        } else if (wordLength <= 10) {
          tokenCount += Math.ceil(wordLength / 6);
        } else {
          tokenCount += Math.ceil(wordLength / 5);
        }

        if (token.match(/^(un|re|pre|dis|over|under|anti)/)) {
          tokenCount += 0.2;
        }
        if (token.match(/(ing|ed|er|est|ly|tion|sion)$/)) {
          tokenCount += 0.1;
        }
      } else {
        tokenCount += 1;
      }
    }

    const spaceCount = (normalizedText.match(/\s/g) || []).length;
    tokenCount += spaceCount * 0.1;

    const modelMultipliers = {
      'gpt-4': 1.0,
      'gpt-5': 0.98,
      'claude-4': 0.92,
      'claude-sonnet': 0.94,
      'grok-4': 1.08,
      'deepseek-r1': 0.88,
      'llama-4': 0.85
    };

    const multiplier = modelMultipliers[model] || 1.0;
    return Math.max(1, Math.round(tokenCount * multiplier));
  },

  /**
   * Calculate energy savings based on tokens saved
   */
  calculateEnergySavings(tokensSaved, model) {
    const energyCostPerToken = {
      'gpt-4': 0.05,
      'gpt-5': 0.045,
      'claude-4': 0.04,
      'claude-sonnet': 0.04,
      'grok-4': 0.06,
      'deepseek-r1': 0.03,
      'llama-4': 0.025
    };

    const costPerToken = energyCostPerToken[model] || 0.045;
    const energySavedMwh = tokensSaved * costPerToken;
    const energySavedWh = energySavedMwh / 1000;

    return {
      energySavedMwh,
      energySavedWh,
      percentageSaved: Math.min(50, Math.round(tokensSaved * 0.1))
    };
  },

  /**
   * Clean up whitespace in text
   */
  cleanupWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s([.,!?;:])/g, '$1')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  },

  /**
   * Escape special regex characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptHelperCore;
} else if (typeof window !== 'undefined') {
  window.PromptHelperCore = PromptHelperCore;
}
