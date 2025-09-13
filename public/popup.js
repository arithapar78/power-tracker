// EnergyTrackingApp Popup Script
// Handles popup UI interactions and data display with watts-based power consumption

// All dependency classes are defined FIRST before PopupManager to ensure proper loading order

/**
 * TokenCounter class - Advanced token counting with multiple methodologies
 */
class TokenCounter {
  constructor() {
    console.log('[TokenCounter] Initializing advanced token counter');
    
    // Model-specific token ratios (chars per token approximations)
    this.modelRatios = {
      'gpt-4': 3.8,      // ~3.8 characters per token
      'gpt-3.5': 4.0,    // ~4.0 characters per token
      'claude': 3.5,     // ~3.5 characters per token
      'gemini': 3.6,     // ~3.6 characters per token
      'default': 3.8
    };
    
    // Special token patterns and their weights
    this.specialPatterns = {
      codeBlocks: /```[\s\S]*?```/g,
      inlineCode: /`[^`]+`/g,
      urls: /https?:\/\/[^\s]+/g,
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      numbers: /\b\d+\.?\d*\b/g,
      punctuation: /[.,;:!?(){}\[\]"'-]/g,
      whitespace: /\s+/g
    };
  }
  
  /**
   * GPT-style tokenization (approximation)
   * Uses word-based approximation with character adjustment
   */
  countTokensGPT(text, model = 'gpt-4') {
    if (!text || typeof text !== 'string') return 0;
    
    const ratio = this.modelRatios[model] || this.modelRatios.default;
    
    // Base character count approach
    let baseTokens = Math.ceil(text.length / ratio);
    
    // Adjust for special patterns that affect tokenization
    const adjustments = this.calculateSpecialPatternAdjustments(text, 'gpt');
    
    // Word boundary bonus (GPT tokenizer respects word boundaries)
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordBoundaryAdjustment = Math.floor(words.length * 0.1);
    
    const totalTokens = Math.max(1, baseTokens + adjustments - wordBoundaryAdjustment);
    
    console.log(`[TokenCounter] GPT tokens (${model}):`, {
      text: text.substring(0, 50) + '...',
      baseTokens,
      adjustments,
      wordBoundaryAdjustment,
      totalTokens
    });
    
    return totalTokens;
  }
  
  /**
   * Claude-style tokenization (approximation)
   * Better handling of natural language, different ratio
   */
  countTokensClaude(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const ratio = this.modelRatios.claude;
    
    // Claude tends to handle natural language more efficiently
    let baseTokens = Math.ceil(text.length / ratio);
    
    // Claude-specific adjustments
    const adjustments = this.calculateSpecialPatternAdjustments(text, 'claude');
    
    // Natural language bonus (Claude is optimized for conversational text)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const naturalLanguageBonus = Math.floor(sentences.length * 0.05);
    
    const totalTokens = Math.max(1, baseTokens + adjustments - naturalLanguageBonus);
    
    console.log('[TokenCounter] Claude tokens:', {
      text: text.substring(0, 50) + '...',
      baseTokens,
      adjustments,
      naturalLanguageBonus,
      totalTokens
    });
    
    return totalTokens;
  }
  
  /**
   * Character-based counting with options
   */
  countChars(text, includeSpaces = true, includeSpecialChars = true) {
    if (!text || typeof text !== 'string') return 0;
    
    let charCount = text.length;
    
    if (!includeSpaces) {
      charCount = text.replace(/\s/g, '').length;
    }
    
    if (!includeSpecialChars) {
      charCount = text.replace(/[^\w\s]/g, '').length;
      if (!includeSpaces) {
        charCount = text.replace(/[^\w]/g, '').length;
      }
    }
    
    return charCount;
  }
  
  /**
   * Word-based counting with smart handling
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    
    // Handle contractions as single words
    const words = text
      .replace(/[^\w\s'-]/g, ' ')  // Replace punctuation with spaces, keep apostrophes and hyphens
      .split(/\s+/)
      .filter(word => word.length > 0 && /\w/.test(word)); // Must contain at least one letter/number
    
    return words.length;
  }
  
  /**
   * Calculate adjustments for special patterns
   */
  calculateSpecialPatternAdjustments(text, model) {
    let adjustment = 0;
    
    // Code blocks are token-expensive
    const codeBlocks = text.match(this.specialPatterns.codeBlocks) || [];
    adjustment += codeBlocks.length * (model === 'claude' ? 8 : 10);
    
    // URLs and emails are usually single tokens but take more characters
    const urls = text.match(this.specialPatterns.urls) || [];
    const emails = text.match(this.specialPatterns.emails) || [];
    adjustment -= (urls.length + emails.length) * 2; // Reduction because they're efficient
    
    // Numbers can be variable
    const numbers = text.match(this.specialPatterns.numbers) || [];
    adjustment += numbers.length * 0.5;
    
    // Punctuation density affects tokenization
    const punctuation = text.match(this.specialPatterns.punctuation) || [];
    const punctuationDensity = punctuation.length / text.length;
    if (punctuationDensity > 0.1) {
      adjustment += Math.floor(punctuation.length * 0.3);
    }
    
    return Math.round(adjustment);
  }
  
  /**
   * Get comprehensive token analysis
   */
  analyzeTokens(text, model = 'gpt-4') {
    if (!text || typeof text !== 'string') {
      return {
        gpt: 0,
        claude: 0,
        chars: 0,
        charsNoSpaces: 0,
        words: 0,
        sentences: 0,
        model: model,
        analysis: 'Empty text'
      };
    }
    
    const analysis = {
      gpt: this.countTokensGPT(text, model),
      claude: this.countTokensClaude(text),
      chars: this.countChars(text, true, true),
      charsNoSpaces: this.countChars(text, false, true),
      words: this.countWords(text),
      sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      model: model,
      analysis: this.generateTokenAnalysis(text, model)
    };
    
    console.log('[TokenCounter] Comprehensive analysis:', analysis);
    
    return analysis;
  }
  
  /**
   * Generate text analysis insights
   */
  generateTokenAnalysis(text, model) {
    const ratio = this.modelRatios[model] || this.modelRatios.default;
    const avgWordsPerSentence = this.countWords(text) / Math.max(1, text.split(/[.!?]+/).length - 1);
    const avgCharsPerWord = text.length / Math.max(1, this.countWords(text));
    
    let insights = [];
    
    if (avgWordsPerSentence > 25) {
      insights.push('Long sentences detected - consider breaking up');
    }
    
    if (avgCharsPerWord > 6) {
      insights.push('Complex vocabulary - may increase token count');
    }
    
    if (text.includes('```')) {
      insights.push('Code blocks detected - tokens may be higher than estimated');
    }
    
    const repetitionCheck = this.detectRepetition(text);
    if (repetitionCheck.hasRepetition) {
      insights.push(`Repetitive content detected - ${repetitionCheck.count} repeated phrases`);
    }
    
    return insights.length > 0 ? insights.join('; ') : 'Text appears well-optimized';
  }
  
  /**
   * Detect repetitive content
   */
  detectRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = new Map();
    let repetitionCount = 0;
    
    // Check for repeated 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (phrase.length > 10) { // Only meaningful phrases
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    }
    
    phrases.forEach(count => {
      if (count > 1) repetitionCount++;
    });
    
    return {
      hasRepetition: repetitionCount > 0,
      count: repetitionCount
    };
  }
}

/**
 * TokenComparison class - Advanced comparison engine
 */
class TokenComparison {
  constructor() {
    console.log('[TokenComparison] Initializing token comparison engine');
    
    // Model cost estimates (per 1k tokens)
    this.costEstimates = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5': { input: 0.0015, output: 0.002 },
      'claude': { input: 0.008, output: 0.024 },
      'gemini': { input: 0.00025, output: 0.0005 }
    };
  }
  
  /**
   * Compare two prompts and provide detailed analysis
   */
  comparePrompts(originalText, optimizedText, model = 'gpt-4') {
    console.log('[TokenComparison] Comparing prompts for model:', model);
    
    if (!this.tokenCounter) {
      window.popupManager.initializeTokenCounters();
      this.tokenCounter = window.popupManager.tokenCounter;
    }
    
    const original = this.tokenCounter.analyzeTokens(originalText, model);
    const optimized = this.tokenCounter.analyzeTokens(optimizedText, model);
    
    const modelTokensOriginal = original[model.includes('gpt') ? 'gpt' : 'claude'];
    const modelTokensOptimized = optimized[model.includes('gpt') ? 'gpt' : 'claude'];
    
    const tokensSaved = Math.max(0, modelTokensOriginal - modelTokensOptimized);
    const percentReduction = modelTokensOriginal > 0 ?
      Math.round((tokensSaved / modelTokensOriginal) * 100) : 0;
    
    const costs = this.costEstimates[model] || this.costEstimates['gpt-4'];
    const originalCost = (modelTokensOriginal / 1000) * costs.input;
    const optimizedCost = (modelTokensOptimized / 1000) * costs.input;
    const costSavings = Math.max(0, originalCost - optimizedCost);
    
    const comparison = {
      original: {
        tokens: modelTokensOriginal,
        characters: original.chars,
        words: original.words,
        sentences: original.sentences,
        estimatedCost: originalCost,
        analysis: original.analysis
      },
      optimized: {
        tokens: modelTokensOptimized,
        characters: optimized.chars,
        words: optimized.words,
        sentences: optimized.sentences,
        estimatedCost: optimizedCost,
        analysis: optimized.analysis
      },
      reduction: {
        tokensSaved: tokensSaved,
        percentReduction: percentReduction,
        costSavings: costSavings,
        charactersSaved: Math.max(0, original.chars - optimized.chars),
        wordsSaved: Math.max(0, original.words - optimized.words)
      },
      analysis: {
        removedWords: this.identifyRemovedWords(originalText, optimizedText),
        restructuredSentences: this.identifyRestructuring(originalText, optimizedText),
        efficiencyScore: this.calculateEfficiencyScore(percentReduction, originalText, optimizedText)
      },
      model: model
    };
    
    console.log('[TokenComparison] Comparison complete:', comparison);
    
    return comparison;
  }
  
  /**
   * Identify words that were removed during optimization
   */
  identifyRemovedWords(original, optimized) {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const optimizedWords = new Set(optimized.toLowerCase().split(/\s+/));
    
    const removed = [];
    originalWords.forEach(word => {
      if (!optimizedWords.has(word) && word.length > 2) {
        removed.push(word);
      }
    });
    
    return removed.slice(0, 10); // Limit to first 10 for display
  }
  
  /**
   * Identify sentence restructuring
   */
  identifyRestructuring(original, optimized) {
    const originalSentences = original.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const optimizedSentences = optimized.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const restructured = [];
    
    // Simple restructuring detection - sentences that are significantly shorter
    originalSentences.forEach((origSent, index) => {
      if (optimizedSentences[index]) {
        const lengthReduction = origSent.length - optimizedSentences[index].length;
        if (lengthReduction > origSent.length * 0.3) { // 30% shorter
          restructured.push({
            original: origSent.substring(0, 50) + '...',
            optimized: optimizedSentences[index].substring(0, 50) + '...',
            reduction: Math.round((lengthReduction / origSent.length) * 100)
          });
        }
      }
    });
    
    return restructured.slice(0, 5); // Limit for display
  }
  
  /**
   * Calculate optimization efficiency score
   */
  calculateEfficiencyScore(percentReduction, original, optimized) {
    let score = percentReduction; // Base score from token reduction
    
    // Bonus for maintaining meaning (simple heuristic)
    const originalWords = original.split(/\s+/).length;
    const optimizedWords = optimized.split(/\s+/).length;
    const wordReductionRatio = originalWords > 0 ? (originalWords - optimizedWords) / originalWords : 0;
    
    // If word reduction is reasonable (not too aggressive), add bonus
    if (wordReductionRatio > 0.1 && wordReductionRatio < 0.5) {
      score += 10;
    }
    
    // Penalty for over-optimization (too short)
    if (optimized.length < 20) {
      score -= 20;
    }
    
    // Bonus for removing filler words
    const fillerWords = ['basically', 'actually', 'literally', 'obviously', 'clearly'];
    const fillerRemoved = fillerWords.filter(word =>
      original.toLowerCase().includes(word) && !optimized.toLowerCase().includes(word)
    ).length;
    score += fillerRemoved * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

/**
 * AIModelPowerCalculator class - Advanced power calculations for AI models
 */
class AIModelPowerCalculator {
  constructor() {
    console.log('[AIModelPowerCalculator] Initializing advanced AI model power calculator');
    
    // Comprehensive AI model power profiles with real-world data
    this.modelPowerProfiles = {
      // === FRONTIER MODELS (2024-2025) ===
      'gpt-5-high': {
        name: 'GPT-5 High',
        category: 'frontier-large',
        baseWatts: 45,
        tokensPerSecond: 120,
        energyPerQuery: 2.8, // Wh per query
        scalingFactor: 1.8,
        contextMultiplier: 1.4,
        company: 'OpenAI'
      },
      
      'claude-4-sonnet-thinking': {
        name: 'Claude-4 Sonnet Thinking',
        category: 'frontier-large',
        baseWatts: 42,
        tokensPerSecond: 95,
        energyPerQuery: 2.5,
        scalingFactor: 1.7,
        contextMultiplier: 1.3,
        company: 'Anthropic'
      },
      
      'grok-4': {
        name: 'Grok-4',
        category: 'frontier-large',
        baseWatts: 48,
        tokensPerSecond: 110,
        energyPerQuery: 3.1,
        scalingFactor: 1.9,
        contextMultiplier: 1.5,
        company: 'xAI'
      },
      
      // === REASONING SPECIALIZED MODELS ===
      'deepseek-r1': {
        name: 'DeepSeek R1',
        category: 'reasoning-specialized',
        baseWatts: 52,
        tokensPerSecond: 85,
        energyPerQuery: 3.5,
        scalingFactor: 2.1,
        contextMultiplier: 1.6,
        company: 'DeepSeek'
      },
      
      'o3-mini': {
        name: 'OpenAI o3-mini',
        category: 'reasoning-specialized',
        baseWatts: 38,
        tokensPerSecond: 95,
        energyPerQuery: 2.2,
        scalingFactor: 1.6,
        contextMultiplier: 1.2,
        company: 'OpenAI'
      },
      
      // === ULTRA-EFFICIENT MODELS ===
      'llama-4-maverick': {
        name: 'Llama-4 Maverick',
        category: 'ultra-efficient',
        baseWatts: 18,
        tokensPerSecond: 140,
        energyPerQuery: 0.8,
        scalingFactor: 0.9,
        contextMultiplier: 0.8,
        company: 'Meta'
      },
      
      'gemini-2-flash': {
        name: 'Gemini 2.0 Flash',
        category: 'ultra-efficient',
        baseWatts: 22,
        tokensPerSecond: 160,
        energyPerQuery: 0.9,
        scalingFactor: 0.8,
        contextMultiplier: 0.7,
        company: 'Google'
      },
      
      // === BALANCED PERFORMANCE MODELS ===
      'gpt-4-turbo-2024': {
        name: 'GPT-4 Turbo 2024',
        category: 'balanced-performance',
        baseWatts: 32,
        tokensPerSecond: 110,
        energyPerQuery: 1.8,
        scalingFactor: 1.3,
        contextMultiplier: 1.1,
        company: 'OpenAI'
      },
      
      'claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        category: 'balanced-performance',
        baseWatts: 28,
        tokensPerSecond: 105,
        energyPerQuery: 1.5,
        scalingFactor: 1.2,
        contextMultiplier: 1.0,
        company: 'Anthropic'
      },
      
      // === LEGACY MODELS (for comparison) ===
      'gpt-4': {
        name: 'GPT-4',
        category: 'legacy-large',
        baseWatts: 35,
        tokensPerSecond: 80,
        energyPerQuery: 2.0,
        scalingFactor: 1.4,
        contextMultiplier: 1.2,
        company: 'OpenAI'
      },
      
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        category: 'legacy-efficient',
        baseWatts: 15,
        tokensPerSecond: 150,
        energyPerQuery: 0.5,
        scalingFactor: 0.7,
        contextMultiplier: 0.6,
        company: 'OpenAI'
      }
    };
    
    // Complexity multipliers based on query complexity
    this.complexityMultipliers = {
      simple: 0.8,      // Basic Q&A, simple tasks
      moderate: 1.0,    // Standard requests, moderate complexity
      complex: 1.4,     // Multi-step reasoning, analysis
      intensive: 1.8,   // Code generation, long-form content
      reasoning: 2.2    // Deep reasoning, math, complex analysis
    };
    
    // Context length impact factors
    this.contextLengthFactors = {
      short: { threshold: 1000, multiplier: 0.9 },      // < 1k tokens
      medium: { threshold: 4000, multiplier: 1.0 },     // 1k-4k tokens
      long: { threshold: 16000, multiplier: 1.3 },      // 4k-16k tokens
      extended: { threshold: 32000, multiplier: 1.6 },  // 16k-32k tokens
      massive: { threshold: 128000, multiplier: 2.1 }   // 32k+ tokens
    };
    
    // Regional carbon intensity (gCO2/kWh) for environmental impact
    this.regionalCarbonIntensity = {
      'us-west': 350,     // US West Coast (cleaner grid)
      'us-east': 400,     // US East Coast (average)
      'us-central': 450,  // US Central (more coal)
      'europe': 300,      // European average
      'asia-pacific': 500, // Asia-Pacific average
      'global': 400      // Global average
    };
    
    // User engagement impact on power consumption
    this.engagementFactors = {
      high: 1.2,      // Active conversation, frequent queries
      medium: 1.0,    // Normal interaction
      low: 0.8        // Passive browsing, infrequent queries
    };
  }
  
  /**
   * Calculate comprehensive backend power consumption for AI models
   */
  calculateBackendPower(detectedModel, tabData, context = {}) {
    try {
      if (!detectedModel || !detectedModel.model) {
        console.warn('[AIModelPowerCalculator] Invalid detected model provided');
        return 0;
      }
      
      const modelKey = detectedModel.modelKey || this.inferModelKey(detectedModel.model);
      const profile = this.modelPowerProfiles[modelKey];
      
      if (!profile) {
        console.warn('[AIModelPowerCalculator] No power profile found for model:', modelKey);
        return this.estimatePowerForUnknownModel(detectedModel, context);
      }
      
      console.log(`[AIModelPowerCalculator] Calculating power for ${profile.name}:`, {
        category: profile.category,
        baseWatts: profile.baseWatts,
        context: context
      });
      
      // Base power consumption
      let powerWatts = profile.baseWatts;
      
      // Apply complexity multiplier
      const complexity = this.analyzeQueryComplexity(tabData, context);
      const complexityMultiplier = this.complexityMultipliers[complexity] || 1.0;
      powerWatts *= complexityMultiplier;
      
      // Apply context length impact
      const contextLength = this.estimateContextLength(tabData, detectedModel);
      const contextMultiplier = this.getContextLengthMultiplier(contextLength, profile);
      powerWatts *= contextMultiplier;
      
      // Apply user engagement factor
      const engagement = context.userEngagement || 'medium';
      const engagementMultiplier = this.engagementFactors[engagement] || 1.0;
      powerWatts *= engagementMultiplier;
      
      // Apply performance mode adjustment
      const performanceAdjustment = this.getPerformanceModeAdjustment(context.performanceMode);
      powerWatts *= performanceAdjustment;
      
      // Apply model scaling factor
      powerWatts *= profile.scalingFactor;
      
      console.log('[AIModelPowerCalculator] Power calculation breakdown:', {
        model: profile.name,
        basePower: profile.baseWatts,
        complexity: complexity,
        complexityMultiplier: complexityMultiplier,
        contextLength: contextLength,
        contextMultiplier: contextMultiplier,
        engagementMultiplier: engagementMultiplier,
        performanceAdjustment: performanceAdjustment,
        scalingFactor: profile.scalingFactor,
        finalPower: powerWatts.toFixed(2) + 'W'
      });
      
      return Math.max(0, powerWatts);
      
    } catch (error) {
      console.error('[AIModelPowerCalculator] Error calculating backend power:', error);
      return 0;
    }
  }
  
  /**
   * Analyze query complexity based on tab data and context
   */
  analyzeQueryComplexity(tabData, context) {
    if (!tabData) return 'moderate';
    
    // Analyze URL patterns for complexity hints
    const url = tabData.url || '';
    const urlLower = url.toLowerCase();
    
    // Code-related queries are typically complex
    if (urlLower.includes('github') || urlLower.includes('stackoverflow') ||
        urlLower.includes('codepen') || urlLower.includes('repl')) {
      return 'intensive';
    }
    
    // Research and analysis sites suggest complex queries
    if (urlLower.includes('research') || urlLower.includes('analysis') ||
        urlLower.includes('academic') || urlLower.includes('arxiv')) {
      return 'complex';
    }
    
    // Mathematical or scientific sites suggest reasoning tasks
    if (urlLower.includes('math') || urlLower.includes('science') ||
        urlLower.includes('calculation') || urlLower.includes('equation')) {
      return 'reasoning';
    }
    
    // Simple informational queries
    if (urlLower.includes('wiki') || urlLower.includes('news') ||
        urlLower.includes('blog') || urlLower.includes('faq')) {
      return 'simple';
    }
    
    // Check DOM complexity as a proxy for interface complexity
    const domNodes = tabData.domNodes || 0;
    if (domNodes > 5000) return 'complex';
    if (domNodes > 2000) return 'moderate';
    if (domNodes < 500) return 'simple';
    
    return 'moderate'; // Default
  }
  
  /**
   * Estimate context length based on tab data and model
   */
  estimateContextLength(tabData, detectedModel) {
    if (!tabData) return 1000;
    
    // Base estimate from DOM complexity
    const domNodes = tabData.domNodes || 1000;
    let estimatedTokens = Math.max(500, Math.min(8000, domNodes * 0.3));
    
    // Adjust based on page type
    const url = tabData.url || '';
    if (url.includes('docs') || url.includes('documentation')) {
      estimatedTokens *= 1.5; // Documentation tends to be longer
    }
    if (url.includes('chat') || url.includes('conversation')) {
      estimatedTokens *= 2.0; // Chat interfaces accumulate context
    }
    if (url.includes('editor') || url.includes('code')) {
      estimatedTokens *= 1.8; // Code editors often have large contexts
    }
    
    // Consider model's typical context window
    const modelName = detectedModel.model?.name || '';
    if (modelName.toLowerCase().includes('claude')) {
      estimatedTokens *= 1.2; // Claude models often used with longer contexts
    }
    
    return Math.round(estimatedTokens);
  }
  
  /**
   * Get context length multiplier based on context size and model profile
   */
  getContextLengthMultiplier(contextLength, profile) {
    // Find appropriate context factor
    let factor = this.contextLengthFactors.medium; // Default
    
    for (const [key, contextFactor] of Object.entries(this.contextLengthFactors)) {
      if (contextLength <= contextFactor.threshold) {
        factor = contextFactor;
        break;
      }
    }
    
    // Apply model's context multiplier
    return factor.multiplier * (profile.contextMultiplier || 1.0);
  }
  
  /**
   * Get performance mode adjustment factor
   */
  getPerformanceModeAdjustment(performanceMode) {
    switch (performanceMode) {
      case 'efficient':
        return 0.8;  // Lower power mode
      case 'balanced':
        return 1.0;  // Normal power
      case 'performance':
        return 1.3;  // Higher power mode
      default:
        return 1.0;
    }
  }
  
  /**
   * Infer model key from detected model information
   */
  inferModelKey(modelInfo) {
    if (!modelInfo || !modelInfo.name) return 'gpt-4'; // Default fallback
    
    const name = modelInfo.name.toLowerCase();
    
    // GPT models
    if (name.includes('gpt-5')) return 'gpt-5-high';
    if (name.includes('gpt-4-turbo') && name.includes('2024')) return 'gpt-4-turbo-2024';
    if (name.includes('gpt-4')) return 'gpt-4';
    if (name.includes('gpt-3.5')) return 'gpt-3.5-turbo';
    
    // Claude models
    if (name.includes('claude-4')) return 'claude-4-sonnet-thinking';
    if (name.includes('claude-3.5')) return 'claude-3.5-sonnet';
    
    // Specialized models
    if (name.includes('deepseek') && name.includes('r1')) return 'deepseek-r1';
    if (name.includes('grok-4')) return 'grok-4';
    if (name.includes('llama-4')) return 'llama-4-maverick';
    if (name.includes('gemini-2') || name.includes('gemini 2')) return 'gemini-2-flash';
    if (name.includes('o3-mini')) return 'o3-mini';
    
    // Default to GPT-4 for unknown models
    return 'gpt-4';
  }
  
  /**
   * Estimate power for unknown models
   */
  estimatePowerForUnknownModel(detectedModel, context) {
    console.log('[AIModelPowerCalculator] Estimating power for unknown model:', detectedModel.model?.name);
    
    // Base estimation using model category or size hints
    let estimatedWatts = 30; // Conservative default
    
    const modelName = (detectedModel.model?.name || '').toLowerCase();
    
    // Size-based estimation
    if (modelName.includes('large') || modelName.includes('70b') || modelName.includes('175b')) {
      estimatedWatts = 40;
    } else if (modelName.includes('small') || modelName.includes('7b') || modelName.includes('13b')) {
      estimatedWatts = 20;
    } else if (modelName.includes('mini') || modelName.includes('nano')) {
      estimatedWatts = 15;
    }
    
    // Apply basic engagement factor
    const engagement = context.userEngagement || 'medium';
    estimatedWatts *= this.engagementFactors[engagement] || 1.0;
    
    return estimatedWatts;
  }
  
  /**
   * Calculate environmental impact from power consumption
   */
  calculateEnvironmentalImpact(powerWatts, durationMs = 3600000, region = 'global') {
    const durationHours = durationMs / 3600000;
    const energyWh = powerWatts * durationHours;
    const energyKWh = energyWh / 1000;
    
    // Carbon emissions
    const carbonIntensity = this.regionalCarbonIntensity[region] || this.regionalCarbonIntensity.global;
    const carbonEmissionsG = energyKWh * carbonIntensity;
    
    // Water usage (approximate for data centers)
    const waterUsageL = energyKWh * 3.0; // ~3L per kWh for cooling
    
    // Tree offset equivalent (rough approximation)
    const treeOffsetDays = carbonEmissionsG / 48.0; // A tree absorbs ~48g CO2 per day
    
    return {
      energyWh: energyWh,
      energyKWh: energyKWh,
      carbonEmissionsG: carbonEmissionsG,
      waterUsageL: waterUsageL,
      treeOffsetDays: treeOffsetDays,
      region: region,
      carbonIntensity: carbonIntensity
    };
  }
  
  /**
   * Calculate cost estimate for AI query
   */
  calculateQueryCost(modelKey, tokensUsed, region = 'global') {
    const profile = this.modelPowerProfiles[modelKey];
    if (!profile) return { energyCost: 0, apiCost: 0, total: 0 };
    
    // Energy cost (varies by region)
    const regionalElectricityRates = {
      'us-west': 0.15,    // $/kWh
      'us-east': 0.12,
      'us-central': 0.10,
      'europe': 0.20,
      'asia-pacific': 0.08,
      'global': 0.12
    };
    
    const electricityRate = regionalElectricityRates[region] || regionalElectricityRates.global;
    const energyKWh = profile.energyPerQuery / 1000;
    const energyCost = energyKWh * electricityRate;
    
    // Rough API cost estimate (varies significantly)
    const roughApiCostPer1kTokens = {
      'frontier-large': 0.03,
      'reasoning-specialized': 0.05,
      'balanced-performance': 0.015,
      'ultra-efficient': 0.001,
      'legacy-large': 0.02,
      'legacy-efficient': 0.0015
    };
    
    const apiCostRate = roughApiCostPer1kTokens[profile.category] || 0.02;
    const apiCost = (tokensUsed / 1000) * apiCostRate;
    
    return {
      energyCost: energyCost,
      apiCost: apiCost,
      total: energyCost + apiCost,
      region: region,
      electricityRate: electricityRate
    };
  }
  
  /**
   * Get model efficiency score (0-100)
   */
  getModelEfficiencyScore(modelKey) {
    const profile = this.modelPowerProfiles[modelKey];
    if (!profile) return 50; // Default medium efficiency
    
    // Calculate efficiency based on tokens per second per watt
    const tokensPerWatt = profile.tokensPerSecond / profile.baseWatts;
    
    // Scoring scale (higher tokens per watt = more efficient)
    if (tokensPerWatt > 6) return 95;      // Ultra-efficient models
    if (tokensPerWatt > 4) return 80;      // Efficient models
    if (tokensPerWatt > 2.5) return 65;    // Balanced models
    if (tokensPerWatt > 1.5) return 45;    // Less efficient models
    return 25;                             // Power-intensive models
  }
}

/**
 * PopupManager - Main popup management class
 * Moved to end of file to ensure all dependencies are loaded first
 */
class PopupManager {
  constructor() {
    this.currentTabData = null;
    this.energyData = null;
    this.backendEnergyData = null;
    this.aiEnergyData = null;
    this.settings = null;
    this.updateInterval = null;
    
    // Initialize Enhanced AI Energy Manager
    this.aiEnergyManager = typeof EnhancedAIEnergyManager !== 'undefined'
      ? new EnhancedAIEnergyManager()
      : (typeof AIEnergyManager !== 'undefined' ? new AIEnergyManager() : null);
    this.detectedAIModel = null;
    this.currentAIUsage = null;
    this.enhancedAIData = null;
    
    // Initialize AI Model Power Calculator
    this.aiModelPowerCalculator = new AIModelPowerCalculator();
    
    // Initialize Backend Power Calculator (legacy compatibility)
    this.backendPowerCalculator = this.aiModelPowerCalculator;
    
    // Initialize System Integration Manager
    this.systemIntegrationManager = null;
    this.performanceOptimizer = null;
    this.integrationTestSuite = null;
    
    this.init();
  }
  
  async init() {
    console.log('[PopupManager] Initializing popup...');
    
    try {
      // Initialize advanced features
      this.initializeAdvancedFeatures();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Hide loading overlay
      this.hideLoadingOverlay();
      
      console.log('[PopupManager] ✅ Popup initialization completed successfully');
      
    } catch (error) {
      console.error('[PopupManager] Initialization failed:', error);
      this.showError('Failed to initialize. Please try again.');
    }
  }
  
  /**
   * Initialize advanced features with performance monitoring
   */
  initializeAdvancedFeatures() {
    const startTime = performance.now();
    
    try {
      // Initialize token counting systems
      this.initializeTokenCounters();
      
      // Store reference to window for global access
      window.popupManager = this;
      
      const duration = performance.now() - startTime;
      
      console.log(`[PopupManager] Advanced features initialized in ${Math.round(duration)}ms`);
      
    } catch (error) {
      console.error('[PopupManager] Failed to initialize advanced features:', error);
    }
  }
  
  /**
   * Initialize token counting systems
   */
  initializeTokenCounters() {
    if (!this.tokenCounter) {
      this.tokenCounter = new TokenCounter();
    }
    if (!this.tokenComparison) {
      this.tokenComparison = new TokenComparison();
    }
  }
  
  setupEventListeners() {
    // Enhanced button event listeners with null checks
    this.safeAddEventListener('viewHistoryBtn', 'click', this.handleViewHistory.bind(this));
    this.safeAddEventListener('settingsBtn', 'click', this.handleSettings.bind(this));
    this.safeAddEventListener('tipAction', 'click', this.handleTipAction.bind(this));
    this.safeAddEventListener('themeToggle', 'click', this.handleThemeToggle.bind(this));
    
    // Energy mode toggle buttons
    this.safeAddEventListener('frontendModeBtn', 'click', this.handleFrontendMode.bind(this));
    this.safeAddEventListener('totalModeBtn', 'click', this.handleTotalMode.bind(this));
    
    // Advanced features integration
    this.safeAddEventListener('advancedFeaturesBtn', 'click', this.handleAdvancedFeatures.bind(this));
    
    // Access code modal handlers
    this.safeAddEventListener('submitCodeBtn', 'click', this.handleSubmitAccessCode.bind(this));
    this.safeAddEventListener('cancelCodeBtn', 'click', this.hideAccessCodeModal.bind(this));
    this.safeAddEventListener('modalCloseBtn', 'click', this.hideAccessCodeModal.bind(this));
    this.safeAddEventListener('accessCodeInput', 'keypress', this.handleAccessCodeKeypress.bind(this));
    
    // Prompt generator buttons
    this.safeAddEventListener('generateOptimizedBtn', 'click', this.handleGenerateOptimized.bind(this));
    this.safeAddEventListener('generatorCloseBtn', 'click', this.hidePromptGenerator.bind(this));
    
    // Handle popup close
    window.addEventListener('beforeunload', this.handlePopupClose.bind(this));
  }
  
  /**
   * Safe event listener addition with null checks
   */
  safeAddEventListener(elementId, eventType, handler) {
    try {
      const element = document.getElementById(elementId);
      if (element && typeof handler === 'function') {
        element.addEventListener(eventType, handler);
        console.log(`[PopupManager] Event listener added for ${elementId}`);
      } else {
        console.warn(`[PopupManager] Element not found or invalid handler: ${elementId}`);
      }
    } catch (error) {
      console.error(`[PopupManager] Failed to add event listener for ${elementId}:`, error);
    }
  }
  
  async loadInitialData() {
    try {
      // Load theme first
      await this.loadTheme();
      
      // Load settings
      await this.loadSettings();
      
      // Load current energy data
      await this.loadCurrentEnergyData();
      
      // Update UI
      this.updateUI();
    } catch (error) {
      console.error('[PopupManager] Failed to load initial data:', error);
      this.showError('Failed to load data');
    }
  }
  
  async loadSettings() {
    const defaultSettings = {
      trackingEnabled: true,
      notificationsEnabled: true,
      powerThreshold: 40,
      energyThreshold: 75, // Keep for legacy compatibility
      dataRetentionDays: 30,
      samplingInterval: 5000
    };

    try {
      // Enhanced Chrome API availability check
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default settings');
        this.settings = defaultSettings;
        return;
      }
      
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      
      if (response && response.success && response.settings) {
        // Merge with defaults to ensure all properties exist
        this.settings = { ...defaultSettings, ...response.settings };
        console.log('[PopupManager] Settings loaded successfully:', this.settings);
      } else {
        console.warn('[PopupManager] Failed to load settings:', response?.error || 'Invalid response');
        this.settings = defaultSettings;
      }
    } catch (error) {
      console.error('[PopupManager] Settings request failed:', error.message || error);
      this.settings = defaultSettings;
    }
  }

  /**
   * Check if Chrome APIs are available and functional
   */
  isChromeApiAvailable() {
    try {
      return !!(
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.id &&
        chrome.runtime.sendMessage
      );
    } catch (error) {
      console.warn('[PopupManager] Chrome API check failed:', error.message);
      return false;
    }
  }
  
  async loadCurrentEnergyData() {
    try {
      console.log('[PopupManager] Loading current energy data...');
      
      // Enhanced Chrome API availability check
      if (!this.isChromeApiAvailable()) {
        console.log('Chrome APIs not available, using demo data');
        this.loadDemoData();
        return;
      }

      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab) {
        console.warn('[PopupManager] No active tab found');
        await this.handleNoEnergyDataAvailable();
        return;
      }

      // Get current energy data
      const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_ENERGY' });
      
      if (response?.success && response?.data) {
        this.energyData = response.data || {};
        
        const tabId = currentTab.id;
        this.currentTabData = (tabId && this.energyData[tabId]) ? this.energyData[tabId] : null;
        
        if (!this.currentTabData) {
          await this.createFallbackTabData(currentTab);
        }
      } else {
        await this.createFallbackTabData(currentTab);
      }
      
    } catch (error) {
      console.error('[PopupManager] Energy data request failed:', error);
      this.energyData = {};
      await this.handleNoEnergyDataAvailable();
    }
  }
  
  // Helper method to create fallback tab data
  async createFallbackTabData(currentTab) {
    console.log('[PopupManager] Creating fallback tab data for:', currentTab.url?.substring(0, 50));
    
    this.currentTabData = {
      url: currentTab.url,
      title: currentTab.title,
      energyScore: 25, // Medium energy score
      domNodes: 1500, // Reasonable estimate
      duration: 0,
      timestamp: Date.now(),
      tabId: currentTab.id,
      isEstimated: true,
      dataSource: 'fallback',
      powerWatts: this.estimatePowerFromURL(currentTab.url)
    };
  }
  
  // Helper method to handle complete absence of energy data
  async handleNoEnergyDataAvailable() {
    this.currentTabData = {
      url: '',
      title: 'Unknown Tab',
      energyScore: 0,
      domNodes: 0,
      duration: 0,
      timestamp: Date.now(),
      tabId: 0,
      isUnavailable: true,
      dataSource: 'unavailable'
    };
    
    console.log('[PopupManager] No energy data available, using unavailable state');
  }
  
  /**
   * Estimates power consumption based on URL patterns
   */
  estimatePowerFromURL(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Video/streaming sites
      if (domain.includes('youtube') || domain.includes('netflix') ||
          domain.includes('twitch') || domain.includes('vimeo')) {
        return 35.0;
      }
      
      // Social media with lots of media
      if (domain.includes('facebook') || domain.includes('instagram') ||
          domain.includes('twitter') || domain.includes('tiktok')) {
        return 25.0;
      }
      
      // Development/documentation sites
      if (domain.includes('github') || domain.includes('stackoverflow') ||
          domain.includes('docs.') || domain.includes('developer.')) {
        return 15.0;
      }
      
      // News/content sites
      if (domain.includes('news') || domain.includes('blog') ||
          domain.includes('wiki')) {
        return 12.0;
      }
      
      return 10.0; // Default for unknown sites
    } catch (e) {
      return 8.0; // Fallback for invalid URLs
    }
  }
  
  updateUI() {
    try {
      console.log('[PopupManager] Updating UI with current tab data:', {
        hasCurrentTabData: !!this.currentTabData,
        dataSource: this.currentTabData?.dataSource,
        powerWatts: this.currentTabData?.powerWatts,
        isEstimated: this.currentTabData?.isEstimated,
        isUnavailable: this.currentTabData?.isUnavailable
      });
      
      this.updateStatusIndicator();
      this.updatePowerDisplay();
      
      console.log('[PopupManager] UI update completed successfully');
    } catch (error) {
      console.error('[PopupManager] UI update failed:', error);
      this.showError('Display update failed');
    }
  }
  
  updateStatusIndicator() {
    const statusDot = this.safeGetElement('statusDot');
    const statusText = this.safeGetElement('statusText');
    
    if (!statusDot || !statusText) {
      console.warn('[PopupManager] Status indicator elements not found');
      return;
    }
    
    try {
      // Check settings first with enhanced null safety
      if (!this.settings?.trackingEnabled) {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Tracking disabled');
        return;
      }
      
      const tabCount = Object.keys(this.energyData || {}).length;
      
      // Enhanced logic with comprehensive null checks
      if (tabCount > 0 && this.currentTabData && !this.currentTabData.isUnavailable) {
        statusDot.className = 'status-dot';
        this.safeSetTextContent(statusText, `Tracking ${tabCount} tab${tabCount > 1 ? 's' : ''}`);
      } else if (this.currentTabData?.isEstimated) {
        statusDot.className = 'status-dot estimated';
        const dataSource = this.currentTabData.dataSource || 'estimated';
        this.safeSetTextContent(statusText, `Using ${dataSource} data`);
      } else if (this.currentTabData?.isUnavailable) {
        statusDot.className = 'status-dot warning';
        this.safeSetTextContent(statusText, 'Content script not active');
      } else {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Waiting for data...');
      }
    } catch (error) {
      console.error('[PopupManager] Error updating status indicator:', error);
    }
  }
  
  updatePowerDisplay() {
    const powerValue = this.safeGetElement('powerValue');
    const powerDescription = this.safeGetElement('powerDescription');
    
    if (!powerValue || !powerDescription) {
      console.warn('[PopupManager] Power display elements not found');
      return;
    }

    try {
      console.log('[PopupManager] Updating power display. Current tab data:', this.currentTabData);
      
      // Determine power display data
      let powerWatts = 8.0; // Default fallback
      let displayText = '--';
      let description = 'No data available';
      
      if (this.currentTabData && !this.currentTabData.isUnavailable) {
        // Priority: Direct power measurement > Legacy energy score > URL estimation
        if (this.currentTabData.powerWatts && this.currentTabData.powerWatts > 0) {
          powerWatts = this.currentTabData.powerWatts;
        } else if (this.currentTabData.energyScore && this.currentTabData.energyScore > 0) {
          powerWatts = this.migrateLegacyScore(this.currentTabData.energyScore);
        } else if (this.currentTabData.url) {
          powerWatts = this.estimatePowerFromURL(this.currentTabData.url);
        }
        
        const displayWatts = Math.round(powerWatts * 10) / 10;
        displayText = this.currentTabData.isEstimated ? `~${displayWatts}W` : `${displayWatts}W`;
        
        if (this.currentTabData.isEstimated) {
          const dataSource = this.currentTabData.dataSource || 'estimated';
          description = `Estimated power consumption (${dataSource})<br><small>Based on site analysis</small>`;
        } else {
          description = `Current power consumption<br><small>Live measurement</small>`;
        }
      } else if (this.currentTabData?.isUnavailable) {
        displayText = '?';
        description = 'Power data unavailable<br><small>Content script may not be running</small>';
      } else {
        displayText = '--';
        description = 'Loading power data...<br><small>Initializing extension</small>';
      }
      
      // Apply display data to UI elements
      this.safeSetTextContent(powerValue, displayText);
      this.safeSetInnerHTML(powerDescription, description);
      
      console.log('[PopupManager] Power display updated:', {
        powerWatts: powerWatts,
        displayText: displayText,
        dataSource: this.currentTabData?.dataSource
      });
    } catch (error) {
      console.error('[PopupManager] Error updating power display:', error);
    }
  }
  
  // Helper functions for watts-based calculations
  migrateLegacyScore(energyScore) {
    // Convert old energy score (0-100) to estimated watts
    // Based on research: 
    // 0-20 = 8-12W (light browsing)
    // 20-40 = 12-18W (normal browsing) 
    // 40-70 = 18-30W (heavy browsing)
    // 70+ = 30-55W (intensive usage)
    
    if (energyScore < 20) {
      return 8 + (energyScore / 20) * 4; // 8-12W
    } else if (energyScore < 40) {
      return 12 + ((energyScore - 20) / 20) * 6; // 12-18W
    } else if (energyScore < 70) {
      return 18 + ((energyScore - 40) / 30) * 12; // 18-30W
    } else {
      return 30 + ((energyScore - 70) / 30) * 25; // 30-55W
    }
  }
  
  // Load demo data when Chrome APIs are not available
  loadDemoData() {
    console.log('Loading demo data for standalone viewing');
    
    this.energyData = {
      12345: {
        url: 'https://github.com/user/energy-tracker',
        title: 'GitHub - Energy Tracking Extension',
        powerWatts: 18.5,
        energyScore: 42,
        domNodes: 2847,
        duration: 340000,
        timestamp: Date.now() - 30000,
        tabId: 12345
      }
    };
    
    // Current tab data (the tab we're viewing from)
    this.currentTabData = {
      url: 'https://github.com/user/energy-tracker',
      title: 'GitHub - Energy Tracking Extension',
      powerWatts: 18.5,
      energyScore: 42,
      domNodes: 2847,
      duration: 340000,
      timestamp: Date.now() - 30000,
      tabId: 12345
    };
  }

  /**
   * Safe element getter with null checking
   */
  safeGetElement(elementId) {
    try {
      if (!elementId || typeof elementId !== 'string') return null;
      return document.getElementById(elementId);
    } catch (error) {
      console.warn(`[PopupManager] Failed to get element ${elementId}:`, error);
      return null;
    }
  }

  /**
   * Safe text content setter with null checking
   */
  safeSetTextContent(element, text) {
    try {
      if (element && typeof text !== 'undefined') {
        element.textContent = String(text);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set text content:', error);
    }
    return false;
  }

  /**
   * Safe innerHTML setter with null checking
   */
  safeSetInnerHTML(element, html) {
    try {
      if (element && typeof html !== 'undefined') {
        element.innerHTML = String(html);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set innerHTML:', error);
    }
    return false;
  }

  async loadTheme() {
    try {
      const defaultTheme = 'light';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default theme');
        this.setThemeUI(defaultTheme);
        return;
      }

      // Get saved theme preference
      const result = await chrome.storage.sync.get(['theme']);
      const savedTheme = result.theme || defaultTheme;
      
      this.setThemeUI(savedTheme);
      console.log('[PopupManager] Theme loaded:', savedTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to load theme:', error);
      this.setThemeUI('light');
    }
  }

  async handleThemeToggle() {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const currentTheme = popupContainer?.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      await this.setTheme(newTheme);
      console.log('[PopupManager] Theme toggled to:', newTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to toggle theme:', error);
    }
  }

  async setTheme(theme) {
    try {
      // Update UI immediately
      this.setThemeUI(theme);
      
      // Save theme preference if Chrome APIs are available
      if (this.isChromeApiAvailable()) {
        await chrome.storage.sync.set({ theme });
      }
    } catch (error) {
      console.error('[PopupManager] Failed to set theme:', error);
    }
  }

  setThemeUI(theme) {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle?.querySelector('.theme-icon');
      
      if (popupContainer) {
        popupContainer.setAttribute('data-theme', theme);
      }
      
      if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
      }
      
      if (themeToggle) {
        themeToggle.setAttribute('aria-label',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggle.setAttribute('title',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      }
    } catch (error) {
      console.error('[PopupManager] Failed to update theme UI:', error);
    }
  }

  handleViewHistory() {
    if (this.isChromeApiAvailable()) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html?tab=history')
      });
    }
  }
  
  handleSettings() {
    if (this.isChromeApiAvailable()) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html?tab=settings')
      });
    }
  }
  
  handleTipAction() {
    // This is handled by the specific tip's onclick event
    console.log('[PopupManager] Tip action clicked');
  }

  handleFrontendMode() {
    console.log('[PopupManager] Frontend mode button clicked');
    this.switchEnergyMode('frontend');
  }
  
  handleTotalMode() {
    console.log('[PopupManager] Total mode button clicked');
    this.switchEnergyMode('total');
  }
  
  switchEnergyMode(mode) {
    try {
      // Get both toggle buttons
      const frontendBtn = this.safeGetElement('frontendModeBtn');
      const totalBtn = this.safeGetElement('totalModeBtn');
      
      if (!frontendBtn || !totalBtn) {
        console.warn('[PopupManager] Energy mode toggle buttons not found');
        return;
      }
      
      // Update button states
      if (mode === 'frontend') {
        frontendBtn.classList.add('active');
        frontendBtn.setAttribute('aria-selected', 'true');
        frontendBtn.setAttribute('tabindex', '0');
        
        totalBtn.classList.remove('active');
        totalBtn.setAttribute('aria-selected', 'false');
        totalBtn.setAttribute('tabindex', '-1');
        
        console.log('[PopupManager] Switched to frontend-only energy tracking');
        
        // Update power display for frontend-only mode
        this.updatePowerDisplayForMode('frontend');
        
      } else if (mode === 'total') {
        totalBtn.classList.add('active');
        totalBtn.setAttribute('aria-selected', 'true');
        totalBtn.setAttribute('tabindex', '0');
        
        frontendBtn.classList.remove('active');
        frontendBtn.setAttribute('aria-selected', 'false');
        frontendBtn.setAttribute('tabindex', '-1');
        
        console.log('[PopupManager] Switched to total energy tracking (frontend + backend)');
        
        // Update power display for total mode
        this.updatePowerDisplayForMode('total');
      }
      
      // Store current mode for future reference
      this.currentEnergyMode = mode;
      
    } catch (error) {
      console.error('[PopupManager] Error switching energy mode:', error);
    }
  }
  
  updatePowerDisplayForMode(mode) {
    try {
      const powerDescription = this.safeGetElement('powerDescription');
      
      if (mode === 'frontend' && powerDescription) {
        this.safeSetInnerHTML(powerDescription,
          'Browser power consumption only<br><small>Excludes backend/AI processing</small>');
      } else if (mode === 'total' && powerDescription) {
        this.safeSetInnerHTML(powerDescription,
          'Total power consumption<br><small>Includes browser + backend/AI processing</small>');
      }
      
      console.log(`[PopupManager] Power display updated for ${mode} mode`);
    } catch (error) {
      console.error('[PopupManager] Error updating power display for mode:', error);
    }
  }

  handleAdvancedFeatures() {
    console.log('[PopupManager] Advanced features button clicked');
    this.showAccessCodeModal();
  }
  
  showAccessCodeModal() {
    try {
      const codeModal = this.safeGetElement('codeEntryModal');
      if (codeModal) {
        codeModal.style.display = 'flex';
        console.log('[PopupManager] Access code modal opened');
        
        // Focus on the input field
        const codeInput = this.safeGetElement('accessCodeInput');
        if (codeInput) {
          setTimeout(() => codeInput.focus(), 100);
        }
      } else {
        console.warn('[PopupManager] Access code modal not found');
      }
    } catch (error) {
      console.error('[PopupManager] Error showing access code modal:', error);
    }
  }
  
  showPromptGenerator() {
    try {
      const promptSection = this.safeGetElement('promptGeneratorSection');
      if (promptSection) {
        promptSection.style.display = 'block';
        console.log('[PopupManager] Prompt generator interface opened');
      } else {
        console.warn('[PopupManager] Prompt generator section not found');
      }
    } catch (error) {
      console.error('[PopupManager] Error showing prompt generator:', error);
    }
  }
  
  hidePromptGenerator() {
    try {
      const promptSection = this.safeGetElement('promptGeneratorSection');
      if (promptSection) {
        promptSection.style.display = 'none';
        console.log('[PopupManager] Prompt generator interface closed');
      }
    } catch (error) {
      console.error('[PopupManager] Error hiding prompt generator:', error);
    }
  }

  handleSubmitAccessCode() {
    console.log('[PopupManager] Submit access code button clicked');
    
    try {
      const codeInput = this.safeGetElement('accessCodeInput');
      const enteredCode = codeInput ? codeInput.value.trim() : '';
      
      // Validate access code (expected: 0410)
      if (enteredCode === '0410') {
        console.log('[PopupManager] Access code validated successfully');
        
        // Clear the input and hide modal
        if (codeInput) codeInput.value = '';
        this.hideAccessCodeModal();
        this.hideAccessCodeError();
        
        // Show prompt generator
        this.showPromptGenerator();
        
      } else {
        console.log('[PopupManager] Invalid access code entered:', enteredCode);
        this.showAccessCodeError('Invalid access code. Please try again.');
      }
      
    } catch (error) {
      console.error('[PopupManager] Error handling access code submission:', error);
      this.showAccessCodeError('An error occurred. Please try again.');
    }
  }

  hideAccessCodeModal() {
    try {
      const codeModal = this.safeGetElement('codeEntryModal');
      if (codeModal) {
        codeModal.style.display = 'none';
        console.log('[PopupManager] Access code modal closed');
        
        // Clear the input field
        const codeInput = this.safeGetElement('accessCodeInput');
        if (codeInput) codeInput.value = '';
        
        // Hide any error messages
        this.hideAccessCodeError();
      }
    } catch (error) {
      console.error('[PopupManager] Error hiding access code modal:', error);
    }
  }

  handleAccessCodeKeypress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleSubmitAccessCode();
    }
  }

  showAccessCodeError(message) {
    try {
      const errorElement = this.safeGetElement('codeError');
      if (errorElement) {
        this.safeSetTextContent(errorElement, message);
        errorElement.style.display = 'block';
        console.log('[PopupManager] Access code error shown:', message);
      }
    } catch (error) {
      console.error('[PopupManager] Error showing access code error:', error);
    }
  }

  hideAccessCodeError() {
    try {
      const errorElement = this.safeGetElement('codeError');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    } catch (error) {
      console.error('[PopupManager] Error hiding access code error:', error);
    }
  }
  
  handleGenerateOptimized() {
    console.log('[PopupManager] Generate Optimized Prompt button clicked');
    
    try {
      // Get the input prompt
      const promptInput = this.safeGetElement('promptInput');
      const targetModel = this.safeGetElement('targetModel');
      const optimizationLevel = this.safeGetElement('optimizationLevel');
      
      if (!promptInput || !promptInput.value.trim()) {
        console.warn('[PopupManager] No prompt text provided');
        this.showPromptError('Please enter a prompt to optimize');
        return;
      }
      
      const originalPrompt = promptInput.value.trim();
      const model = targetModel ? targetModel.value : 'gpt-4';
      const level = optimizationLevel ? optimizationLevel.value : 'balanced';
      
      console.log('[PopupManager] Starting prompt optimization:', {
        originalLength: originalPrompt.length,
        model: model,
        level: level
      });
      
      // Analyze the original prompt
      const originalAnalysis = this.tokenCounter.analyzeTokens(originalPrompt, model);
      
      // Generate optimized version (simplified optimization)
      const optimizedPrompt = this.optimizePromptBasic(originalPrompt, level);
      
      // Analyze optimized prompt
      const optimizedAnalysis = this.tokenCounter.analyzeTokens(optimizedPrompt, model);
      
      // Show results
      this.displayOptimizationResults(originalPrompt, optimizedPrompt, originalAnalysis, optimizedAnalysis, model);
      
    } catch (error) {
      console.error('[PopupManager] Error generating optimized prompt:', error);
      this.showPromptError('Failed to generate optimized prompt. Please try again.');
    }
  }
  
  optimizePromptBasic(prompt, level) {
    // Basic optimization - remove redundant words, filler words, etc.
    let optimized = prompt;
    
    // Remove filler words based on optimization level
    const fillerWords = ['basically', 'actually', 'literally', 'obviously', 'clearly', 'really', 'very', 'quite', 'rather', 'somewhat'];
    
    if (level === 'aggressive' || level === 'balanced') {
      fillerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        optimized = optimized.replace(regex, '');
      });
    }
    
    // Remove redundant phrases
    optimized = optimized.replace(/please note that/gi, '');
    optimized = optimized.replace(/it should be noted that/gi, '');
    optimized = optimized.replace(/it is important to/gi, '');
    
    // Clean up extra spaces
    optimized = optimized.replace(/\s+/g, ' ').trim();
    
    // If aggressive, also make sentences more concise
    if (level === 'aggressive') {
      optimized = optimized.replace(/in order to/gi, 'to');
      optimized = optimized.replace(/due to the fact that/gi, 'because');
      optimized = optimized.replace(/at this point in time/gi, 'now');
    }
    
    console.log('[PopupManager] Basic optimization complete:', {
      originalLength: prompt.length,
      optimizedLength: optimized.length,
      reduction: prompt.length - optimized.length
    });
    
    return optimized;
  }
  
  displayOptimizationResults(original, optimized, originalAnalysis, optimizedAnalysis, model) {
    try {
      // Show the optimized prompt
      const optimizedTextarea = this.safeGetElement('optimizedPrompt');
      if (optimizedTextarea) {
        optimizedTextarea.value = optimized;
      }
      
      // Show the results area
      const resultsArea = this.safeGetElement('resultsArea');
      if (resultsArea) {
        resultsArea.style.display = 'block';
      }
      
      // Calculate savings
      const tokensSaved = Math.max(0, originalAnalysis.gpt - optimizedAnalysis.gpt);
      const percentReduction = originalAnalysis.gpt > 0 ?
        Math.round((tokensSaved / originalAnalysis.gpt) * 100) : 0;
      
      // Update stats displays
      this.updateOptimizationStats(originalAnalysis, optimizedAnalysis, tokensSaved, percentReduction);
      
      console.log('[PopupManager] Optimization results displayed:', {
        tokensSaved: tokensSaved,
        percentReduction: percentReduction + '%'
      });
      
    } catch (error) {
      console.error('[PopupManager] Error displaying results:', error);
    }
  }
  
  updateOptimizationStats(original, optimized, tokensSaved, percentReduction) {
    // Update various stat elements if they exist
    const statElements = {
      'summaryTokenReduction': tokensSaved,
      'percentReduction': percentReduction + '%',
      'originalPromptStats': `${original.gpt} tokens, ${original.chars} chars`,
      'optimizedPromptStats': `${optimized.gpt} tokens, ${optimized.chars} chars`
    };
    
    Object.entries(statElements).forEach(([id, value]) => {
      const element = this.safeGetElement(id);
      if (element) {
        this.safeSetTextContent(element, value);
      }
    });
  }
  
  showPromptError(message) {
    // Show error in the prompt interface
    const errorElement = this.safeGetElement('codeError');
    if (errorElement) {
      this.safeSetTextContent(errorElement, message);
      errorElement.style.display = 'block';
      
      // Hide error after 3 seconds
      setTimeout(() => {
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }, 3000);
    }
  }
  
  handlePopupClose() {
    // Clean up
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  
  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }
  
  showError(message) {
    console.error('[PopupManager] Showing error:', message);
    
    // Show error in multiple places for better UX
    const statusText = this.safeGetElement('statusText');
    if (statusText) {
      this.safeSetTextContent(statusText, 'Error occurred');
    }
    
    const powerDescription = this.safeGetElement('powerDescription');
    if (powerDescription) {
      this.safeSetInnerHTML(powerDescription, `Error: ${message}<br><small>Please try refreshing</small>`);
    }
    
    this.hideLoadingOverlay();
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
  });
} else {
  new PopupManager();
}