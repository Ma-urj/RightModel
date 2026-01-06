const ComplexityAnalyzer = require('./complexityAnalyzer');
const LLMProviders = require('./llmProviders');

/**
 * Routes prompts to the most appropriate LLM model based on complexity
 */
class ModelRouter {
  constructor() {
    this.analyzer = new ComplexityAnalyzer();
    this.providers = new LLMProviders();

    // Model configuration with tier assignments
    this.modelConfig = {
      // Fast tier - for simple, quick queries
      fast: [
        { provider: 'groq', model: 'llama-3.1-8b-instant', priority: 1 },
        { provider: 'ollama', model: 'llama3.2', priority: 2 },
        { provider: 'openai', model: 'gpt-3.5-turbo', priority: 3 },
        { provider: 'anthropic', model: 'claude-3-haiku-20240307', priority: 4 }
      ],
      // Balanced tier - for moderate complexity
      balanced: [
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', priority: 1 },
        { provider: 'openai', model: 'gpt-4o-mini', priority: 2 },
        { provider: 'groq', model: 'llama-3.1-70b-versatile', priority: 3 }
      ],
      // Advanced tier - for complex reasoning and tasks
      advanced: [
        { provider: 'anthropic', model: 'claude-opus-4-20250514', priority: 1 },
        { provider: 'openai', model: 'gpt-4o', priority: 2 },
        { provider: 'openai', model: 'gpt-4-turbo', priority: 3 }
      ]
    };
  }

  /**
   * Set API keys for providers
   * @param {Object} apiKeys - Object containing API keys for different providers
   */
  setApiKeys(apiKeys) {
    this.providers.setApiKeys(apiKeys);
  }

  /**
   * Get list of available providers based on configured API keys
   * @returns {Array} List of available providers
   */
  getAvailableProviders() {
    return this.providers.getAvailableProviders();
  }

  /**
   * Analyzes prompt and selects the most appropriate model
   * @param {string} prompt - User's input prompt
   * @returns {Object} Analysis result with selected model
   */
  analyzePrompt(prompt) {
    // Get complexity analysis
    const analysis = this.analyzer.analyzePrompt(prompt);

    // Get recommended tier
    const tier = this.analyzer.getModelTier(analysis.complexity);

    // Select best available model from tier
    const selectedModel = this.selectBestModel(tier);

    return {
      ...analysis,
      tier,
      selectedModel: selectedModel.model,
      provider: selectedModel.provider,
      reasoning: `${analysis.reasoning} → ${tier} tier model`
    };
  }

  /**
   * Selects the best available model from a given tier
   * @param {string} tier - Model tier (fast/balanced/advanced)
   * @returns {Object} Selected model configuration
   */
  selectBestModel(tier) {
    const tierModels = this.modelConfig[tier];
    const availableProviders = this.providers.getAvailableProviders();

    // Find the highest priority model that has an available provider
    for (const modelConfig of tierModels) {
      if (availableProviders.includes(modelConfig.provider)) {
        return modelConfig;
      }
    }

    // Fallback to any available model if none in tier are available
    console.warn(`No models available in ${tier} tier, falling back...`);

    // Try all tiers in order: balanced, fast, advanced
    const fallbackOrder = ['balanced', 'fast', 'advanced'];
    for (const fallbackTier of fallbackOrder) {
      for (const modelConfig of this.modelConfig[fallbackTier]) {
        if (availableProviders.includes(modelConfig.provider)) {
          return modelConfig;
        }
      }
    }

    // If no providers available, return a default (will error when trying to use)
    throw new Error('No LLM providers configured. Please set up API keys in settings.');
  }

  /**
   * Gets response from the selected model
   * @param {string} prompt - User's input prompt
   * @param {Object} analysis - Analysis result from analyzePrompt
   * @returns {Promise<string>} Model response
   */
  async getResponse(prompt, analysis) {
    const { provider, selectedModel } = analysis;

    try {
      const response = await this.providers.getCompletion(
        provider,
        selectedModel,
        prompt
      );

      return response;
    } catch (error) {
      console.error(`Error getting response from ${provider}:`, error);

      // Try fallback to another model
      return this.getFallbackResponse(prompt, analysis);
    }
  }

  /**
   * Attempts to get response from a fallback model if primary fails
   * @param {string} prompt - User's input prompt
   * @param {Object} analysis - Original analysis
   * @returns {Promise<string>} Fallback model response
   */
  async getFallbackResponse(prompt, analysis) {
    const availableProviders = this.providers.getAvailableProviders();

    // Filter out the failed provider
    const otherProviders = availableProviders.filter(p => p !== analysis.provider);

    if (otherProviders.length === 0) {
      throw new Error('No fallback providers available');
    }

    // Try the first available alternative provider
    const fallbackProvider = otherProviders[0];

    // Find a model for this provider
    let fallbackModel;
    for (const tier of Object.keys(this.modelConfig)) {
      const model = this.modelConfig[tier].find(m => m.provider === fallbackProvider);
      if (model) {
        fallbackModel = model.model;
        break;
      }
    }

    console.log(`Falling back to ${fallbackProvider} with model ${fallbackModel}`);

    return await this.providers.getCompletion(
      fallbackProvider,
      fallbackModel,
      prompt
    );
  }
}

module.exports = ModelRouter;
