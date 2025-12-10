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

    // Calculate initial metrics
    let optimizedTokens = this.estimateTokenCount(optimized, model);
    let tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    let percentageSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;

    // Apply optimization caps to match the popup's behavior
    // This ensures consistent results between widget and popup
    const cappedResults = this.applyOptimizationCaps(prompt, optimized, level, {
      tokensSaved,
      percentageSaved,
      model
    });

    optimized = cappedResults.optimized;
    tokensSaved = cappedResults.tokensSaved;
    percentageSaved = cappedResults.percentageSaved;
    optimizedTokens = this.estimateTokenCount(optimized, model);

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
      // Priority 1: Basic filler words to delete
      basicFillers: {
        priority: 1,
        words: [
          'actually', 'really', 'very', 'basically', 'literally', 'honestly',
          'essentially', 'kind of', 'sort of', 'just', 'like', 'totally',
          'completely', 'entirely', 'absolutely', 'quite', 'rather', 'somewhat',
          'maybe', 'perhaps', 'possibly', 'probably'
        ],
        description: 'Basic filler words'
      },
      conversationalFillers: {
        priority: 1,
        words: [
          'I mean', 'you know', 'you see', 'in fact', 'as a matter of fact',
          'truth be told', 'to be honest', 'to be frank', 'for the most part',
          'by the way', 'FYI', 'at the end of the day', 'in my opinion',
          'in my personal opinion', 'in my honest opinion', 'I believe that',
          'I think that', 'it seems that', 'it appears that', 'to be fair',
          'needless to say', 'for what it\'s worth', 'basically speaking',
          'practically speaking', 'technically speaking',
          'well', 'um', 'uh', 'er', 'ah', 'anyway', 'speaking of which',
          'as I was saying', 'where was I'
        ],
        description: 'Conversational fillers'
      },
      intensifiers: {
        priority: 1,
        words: [
          'extremely', 'highly', 'seriously', 'significantly', 'definitely',
          'certainly', 'clearly', 'obviously', 'surely', 'undoubtedly',
          'remarkably', 'particularly', 'mostly', 'largely', 'slightly',
          'arguably', 'virtually', 'relatively', 'frankly', 'incredibly',
          'tremendously', 'exceptionally', 'especially', 'substantially'
        ],
        description: 'Intensifiers'
      },
      // Priority 2: Verbose phrase replacements
      verbosePhrases: {
        priority: 2,
        phrases: [
          { from: 'in order to', to: 'to' },
          { from: 'due to the fact that', to: 'because' },
          { from: 'in the event that', to: 'if' },
          { from: 'with regard to', to: 'about' },
          { from: 'with respect to', to: 'about' },
          { from: 'in terms of', to: 'about' },
          { from: 'as a result of', to: 'because of' },
          { from: 'in light of the fact that', to: 'because' },
          { from: 'for the purpose of', to: 'to' },
          { from: 'for the reason that', to: 'because' },
          { from: 'for the sake of', to: 'for' },
          { from: 'in relation to', to: 'about' },
          { from: 'in connection with', to: 'about' },
          { from: 'in consideration of', to: 'for' },
          { from: 'for all intents and purposes', to: 'basically' },
          { from: 'at this point in time', to: 'now' },
          { from: 'at the present time', to: 'now' },
          { from: 'at this moment', to: 'now' },
          { from: 'at some point in time', to: 'later' },
          { from: 'regardless of the fact that', to: 'although' },
          { from: 'despite the fact that', to: 'although' },
          { from: 'because of the fact that', to: 'because' },
          { from: 'in close proximity to', to: 'near' },
          { from: 'until such time as', to: 'until' },
          { from: 'in the near future', to: 'soon' },
          { from: 'in the immediate future', to: 'soon' },
          { from: 'in the majority of cases', to: 'usually' },
          { from: 'a large number of', to: 'many' },
          { from: 'a small number of', to: 'few' },
          { from: 'at a later date', to: 'later' },
          { from: 'prior to', to: 'before' },
          { from: 'subsequent to', to: 'after' }
        ],
        description: 'Verbose phrases'
      },
      // Priority 2: Phrases to delete entirely
      deletablePhrases: {
        priority: 2,
        words: [
          'it should be noted that', 'it is worth mentioning that',
          'it is important to note that', 'the fact that', 'in my view',
          'from my perspective', 'I would like to say that',
          'I want to point out that', 'I am writing to inform you that',
          'the purpose of this is to', 'for your information',
          'please be advised that', 'it is clear that',
          'it goes without saying that', 'it is obvious that',
          'as previously mentioned', 'as mentioned earlier', 'as I said before',
          'as stated above', 'let me be clear', 'you could say that',
          'sorta kinda', 'for the record', 'at this point', 'in reality',
          'for example', 'for instance'
        ],
        description: 'Deletable phrases'
      },
      // Priority 2: Padding phrases
      paddingPhrases: {
        priority: 2,
        words: [
          'a little bit', 'a whole lot', 'as soon as possible',
          'as quickly as possible', 'as much as possible',
          'to the best of your ability', 'if possible', 'if you can',
          'if you are able to', 'with the best possible detail',
          'in a detailed manner', 'in a quick manner', 'in a simple manner',
          'in a clear manner', 'for the time being', 'in the meantime',
          'moving forward', 'going forward', 'from here on out',
          'until further notice'
        ],
        description: 'Padding phrases'
      },
      // Priority 2: Verb upgrades
      verbUpgrades: {
        priority: 2,
        phrases: [
          { from: 'make', to: 'create' },
          { from: 'do', to: 'perform' },
          { from: 'use', to: 'apply' },
          { from: 'get', to: 'obtain' },
          { from: 'give', to: 'provide' },
          { from: 'show', to: 'demonstrate' },
          { from: 'tell', to: 'explain' },
          { from: 'look', to: 'examine' },
          { from: 'put', to: 'place' },
          { from: 'try', to: 'attempt' },
          { from: 'fix', to: 'repair' },
          { from: 'take', to: 'capture' },
          { from: 'have', to: 'include' },
          { from: 'seem', to: 'appear' },
          { from: 'think', to: 'consider' },
          { from: 'say', to: 'state' }
        ],
        description: 'Verb upgrades'
      },
      // Priority 2: Redundant phrase pairs
      redundancies: {
        priority: 2,
        phrases: [
          { from: 'each and every', to: 'every' },
          { from: 'first and foremost', to: 'first' },
          { from: 'any and all', to: 'all' },
          { from: 'various different', to: 'various' },
          { from: 'future plans', to: 'plans' },
          { from: 'end result', to: 'result' },
          { from: 'final outcome', to: 'outcome' },
          { from: 'past history', to: 'history' },
          { from: 'advance warning', to: 'warning' },
          { from: 'free gift', to: 'gift' },
          { from: 'new innovation', to: 'innovation' },
          { from: 'basic fundamentals', to: 'fundamentals' },
          { from: 'unexpected surprise', to: 'surprise' },
          { from: 'close proximity', to: 'proximity' },
          { from: 'completely finished', to: 'finished' },
          { from: 'completely complete', to: 'complete' },
          { from: 'general consensus', to: 'consensus' },
          { from: 'final conclusion', to: 'conclusion' },
          { from: 'personal opinion', to: 'opinion' },
          { from: 'important essentials', to: 'essentials' },
          { from: 'true facts', to: 'facts' },
          { from: 'write down', to: 'write' },
          { from: 'empty out', to: 'empty' },
          { from: 'completely finish', to: 'finish' },
          { from: 'final result', to: 'result' }
        ],
        description: 'Redundancies'
      },
      // Priority 2: Request simplifications
      requestSimplifications: {
        priority: 2,
        phrases: [
          { from: 'please provide me with', to: 'provide' },
          { from: 'could you possibly', to: '' },
          { from: 'I would like you to', to: '' },
          { from: 'I need you to', to: '' },
          { from: 'help me understand', to: 'explain' },
          { from: 'help me figure out', to: 'explain' },
          { from: 'help me solve', to: 'solve' },
          { from: 'help me write', to: 'write' },
          { from: 'I request that you', to: '' },
          { from: 'I am looking for', to: '' },
          { from: 'I am curious about', to: '' },
          { from: 'I want to know', to: '' },
          { from: 'can you tell me', to: 'explain' },
          { from: 'could you give me', to: 'provide' },
          { from: 'would you mind', to: '' },
          { from: 'just wanted to', to: '' }
        ],
        description: 'Request simplifications'
      },
      // Priority 2: Academic filler
      academicFiller: {
        priority: 2,
        words: [
          'the objective of this request is to', 'the primary focus of this is',
          'this analysis will demonstrate that', 'this paper aims to show',
          'it can be seen that', 'one could argue that', 'this illustrates that',
          'this indicates that', 'it is evident that', 'it is widely known that',
          'research suggests that', 'studies have shown that',
          'it is commonly believed that'
        ],
        description: 'Academic filler'
      },
      // Priority 2: Corporate jargon
      corporateJargon: {
        priority: 2,
        words: [
          'synergy', 'optimize workflow', 'leverage resources', 'value-added',
          'actionable insight', 'thought leadership', 'circle back',
          'low-hanging fruit', 'best practices', 'mission-critical',
          'core competency', 'scalable solution', 'strategic initiative',
          'streamline process', 'touch base', 'paradigm shift', 'bandwidth',
          'move the needle', 'drill down', 'align stakeholders', 'visibility',
          'holistic approach'
        ],
        description: 'Corporate jargon'
      },
      // Priority 3: Politeness markers
      politenessMarkers: {
        priority: 3,
        words: [
          'please', 'thank you', 'thanks', 'kindly', 'if you don\'t mind',
          'could you please', 'would you be so kind', 'I would appreciate',
          'thank you in advance', 'many thanks', 'much appreciated', 'grateful',
          'sorry to bother you', 'I apologize for', 'excuse me', 'pardon me'
        ],
        description: 'Politeness markers'
      },
      // Priority 3: Redundant requests
      redundantRequests: {
        priority: 3,
        words: [
          'can you', 'could you', 'would you', 'will you', 'are you able to',
          'I want you to', 'I would like you to', 'help me', 'assist me',
          'I\'m asking you to'
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
   * Clean up whitespace in text (matches popup.js implementation)
   */
  cleanupWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')                    // Multiple spaces to single
      .replace(/\s*,\s*,+/g, ',')             // Multiple commas
      .replace(/\s*\.\s*\.+/g, '.')           // Multiple periods
      .replace(/^\s*[,.]/, '')                 // Leading punctuation
      .replace(/\s*([,.!?;:])/g, '$1')        // Space before punctuation
      .replace(/([,.!?;:])\s*([,.!?;:])/g, '$1$2') // Double punctuation
      .trim();
  },

  /**
   * Apply optimization caps to ensure consistent results with popup
   * This is the key function that makes widget match the popup's behavior
   */
  applyOptimizationCaps(original, optimized, level, metrics) {
    const caps = {
      conservative: { min: 5, max: 15 },
      balanced: { min: 15, max: 25 },
      aggressive: { min: 25, max: 45 }
    };

    const cap = caps[level] || caps.balanced;

    // If reduction is too low, try more aggressive techniques
    if (metrics.percentageSaved < cap.min) {
      optimized = this.applyAdditionalCompression(optimized, cap.min - metrics.percentageSaved);
    }

    // If reduction is too high, restore some content
    if (metrics.percentageSaved > cap.max) {
      optimized = this.restoreEssentialContent(original, optimized, metrics.percentageSaved - cap.max);
    }

    // Recalculate metrics
    const finalTokens = this.estimateTokenCount(optimized, metrics.model);
    const originalTokens = this.estimateTokenCount(original, metrics.model);
    const tokensSaved = Math.max(0, originalTokens - finalTokens);
    const percentageSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;

    return {
      optimized,
      tokensSaved,
      percentageSaved
    };
  },

  /**
   * Apply additional compression when initial optimization doesn't reach target
   * Matches popup.js applyAdditionalCompression exactly
   */
  applyAdditionalCompression(text, targetReduction) {
    let compressed = text;

    // Remove articles more aggressively
    compressed = compressed.replace(/\b(a|an|the)\b/gi, '');

    // Remove auxiliary verbs
    compressed = compressed.replace(/\b(is|are|was|were|be|been|being)\b/gi, '');

    // Remove prepositions where context allows
    compressed = compressed.replace(/\b(in|on|at|by|for|with|from)\b/gi, '');

    return this.cleanupWhitespace(compressed);
  },

  /**
   * Restore essential content if too much was removed
   * Matches popup.js restoreEssentialContent exactly
   */
  restoreEssentialContent(original, optimized, excessReduction) {
    // Simple restoration: if too much was removed, use a blend
    if (excessReduction > 20) {
      // Too aggressive, use more of the original
      return original;
    }

    return optimized;
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
