/**
 * Analyzes prompt complexity to determine the appropriate model tier
 */
class ComplexityAnalyzer {
  constructor() {
    // Keywords that indicate different complexity levels
    this.complexityIndicators = {
      high: [
        'analyze', 'complex', 'detailed', 'comprehensive', 'research',
        'explain in depth', 'multiple steps', 'strategy', 'architecture',
        'design pattern', 'algorithm', 'optimize', 'refactor', 'debug',
        'compare and contrast', 'evaluate', 'critique', 'reasoning',
        'philosophy', 'ethics', 'creative', 'story', 'poem', 'essay',
        'thesis', 'argument', 'prove', 'derive', 'mathematical proof'
      ],
      medium: [
        'explain', 'how to', 'what is', 'describe', 'summarize',
        'translate', 'convert', 'implement', 'create', 'write',
        'generate', 'make', 'build', 'code', 'function', 'class',
        'compare', 'difference', 'example', 'demonstrate'
      ],
      low: [
        'define', 'what', 'when', 'where', 'who', 'list',
        'name', 'yes or no', 'true or false', 'simple',
        'quick', 'short', 'brief', 'basic', 'hello',
        'hi', 'thanks', 'okay', 'ok'
      ]
    };
  }

  /**
   * Analyzes a prompt and returns complexity score and reasoning
   * @param {string} prompt - The user's input prompt
   * @returns {Object} Analysis result with complexity level and score
   */
  analyzePrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const wordCount = prompt.split(/\s+/).length;
    const sentenceCount = prompt.split(/[.!?]+/).length;

    let complexityScore = 0;
    let reasoning = [];

    // 1. Word count analysis (longer prompts often indicate complexity)
    if (wordCount > 100) {
      complexityScore += 3;
      reasoning.push('lengthy prompt');
    } else if (wordCount > 50) {
      complexityScore += 2;
      reasoning.push('moderate length');
    } else if (wordCount < 10) {
      complexityScore -= 1;
      reasoning.push('brief prompt');
    }

    // 2. Sentence structure complexity
    const avgWordsPerSentence = wordCount / sentenceCount;
    if (avgWordsPerSentence > 20) {
      complexityScore += 2;
      reasoning.push('complex sentences');
    }

    // 3. Check for technical indicators
    const technicalPatterns = [
      /\b(code|programming|function|class|algorithm|database|api|server)\b/i,
      /\b(javascript|python|java|c\+\+|react|node|sql)\b/i,
      /[{}\[\]();]/,  // Code symbols
      /\b(async|await|promise|callback|closure|recursion)\b/i
    ];

    technicalPatterns.forEach(pattern => {
      if (pattern.test(prompt)) {
        complexityScore += 1;
      }
    });

    // 4. Check for mathematical/logical content
    if (/\b(equation|formula|calculate|solve|proof|theorem)\b/i.test(prompt)) {
      complexityScore += 2;
      reasoning.push('mathematical content');
    }

    // 5. Keyword-based complexity scoring
    let highCount = 0, mediumCount = 0, lowCount = 0;

    this.complexityIndicators.high.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        highCount++;
        complexityScore += 2;
      }
    });

    this.complexityIndicators.medium.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        mediumCount++;
        complexityScore += 1;
      }
    });

    this.complexityIndicators.low.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        lowCount++;
        complexityScore -= 1;
      }
    });

    if (highCount > 0) reasoning.push('complex task indicators');
    if (mediumCount > 0 && highCount === 0) reasoning.push('moderate task indicators');
    if (lowCount > 0 && highCount === 0 && mediumCount === 0) reasoning.push('simple task indicators');

    // 6. Question marks (multiple questions can indicate complexity)
    const questionCount = (prompt.match(/\?/g) || []).length;
    if (questionCount > 2) {
      complexityScore += 1;
      reasoning.push('multiple questions');
    }

    // 7. Context/conversation continuation
    if (/\b(also|furthermore|additionally|moreover|continue|and)\b/i.test(lowerPrompt)) {
      complexityScore += 1;
    }

    // Determine final complexity level
    let complexity;
    if (complexityScore >= 6) {
      complexity = 'high';
    } else if (complexityScore >= 2) {
      complexity = 'medium';
    } else {
      complexity = 'low';
    }

    return {
      complexity,
      score: complexityScore,
      reasoning: reasoning.join(', ') || 'general query',
      wordCount,
      technicalContent: technicalPatterns.some(p => p.test(prompt))
    };
  }

  /**
   * Get recommended model tier based on complexity
   * @param {string} complexity - The complexity level (low/medium/high)
   * @returns {string} Model tier recommendation
   */
  getModelTier(complexity) {
    const tiers = {
      low: 'fast',      // Fast, efficient models (GPT-3.5, Claude Haiku, Groq, Ollama)
      medium: 'balanced', // Balanced models (Claude Sonnet, GPT-3.5-Turbo-16k)
      high: 'advanced'   // Most capable models (GPT-4, Claude Opus)
    };
    return tiers[complexity] || 'balanced';
  }
}

module.exports = ComplexityAnalyzer;
