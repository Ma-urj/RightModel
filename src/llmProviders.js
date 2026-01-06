const axios = require('axios');

/**
 * Handles API interactions with different LLM providers
 */
class LLMProviders {
  constructor() {
    this.apiKeys = {
      openai: null,
      anthropic: null,
      groq: null,
      ollama: 'http://localhost:11434' // Ollama doesn't need API key, just URL
    };

    this.conversationHistory = [];
  }

  /**
   * Set API keys for various providers
   * @param {Object} keys - API keys object
   */
  setApiKeys(keys) {
    if (keys.openai) this.apiKeys.openai = keys.openai;
    if (keys.anthropic) this.apiKeys.anthropic = keys.anthropic;
    if (keys.groq) this.apiKeys.groq = keys.groq;
    if (keys.ollama) this.apiKeys.ollama = keys.ollama;
  }

  /**
   * Get list of available providers based on configured keys
   * @returns {Array} List of provider names
   */
  getAvailableProviders() {
    const available = [];
    if (this.apiKeys.openai) available.push('openai');
    if (this.apiKeys.anthropic) available.push('anthropic');
    if (this.apiKeys.groq) available.push('groq');
    if (this.apiKeys.ollama) available.push('ollama');
    return available;
  }

  /**
   * Get completion from specified provider
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @param {string} prompt - User prompt
   * @returns {Promise<string>} Model response
   */
  async getCompletion(provider, model, prompt) {
    switch (provider) {
      case 'openai':
        return await this.getOpenAICompletion(model, prompt);
      case 'anthropic':
        return await this.getAnthropicCompletion(model, prompt);
      case 'groq':
        return await this.getGroqCompletion(model, prompt);
      case 'ollama':
        return await this.getOllamaCompletion(model, prompt);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * OpenAI API completion
   */
  async getOpenAICompletion(model, prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
            },
            ...this.conversationHistory,
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.openai}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const assistantMessage = response.data.choices[0].message.content;
      this.updateHistory(prompt, assistantMessage);
      return assistantMessage;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Anthropic (Claude) API completion
   */
  async getAnthropicCompletion(model, prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model,
          max_tokens: 2000,
          messages: [
            ...this.conversationHistory,
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': this.apiKeys.anthropic,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const assistantMessage = response.data.content[0].text;
      this.updateHistory(prompt, assistantMessage);
      return assistantMessage;
    } catch (error) {
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Groq API completion (fast inference)
   */
  async getGroqCompletion(model, prompt) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
            },
            ...this.conversationHistory,
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.groq}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const assistantMessage = response.data.choices[0].message.content;
      this.updateHistory(prompt, assistantMessage);
      return assistantMessage;
    } catch (error) {
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Ollama (local) API completion
   */
  async getOllamaCompletion(model, prompt) {
    try {
      const response = await axios.post(
        `${this.apiKeys.ollama}/api/generate`,
        {
          model: model,
          prompt: prompt,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const assistantMessage = response.data.response;
      this.updateHistory(prompt, assistantMessage);
      return assistantMessage;
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}. Make sure Ollama is running locally.`);
    }
  }

  /**
   * Update conversation history (keep last 10 exchanges)
   */
  updateHistory(userMessage, assistantMessage) {
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    );

    // Keep only last 10 exchanges (20 messages)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = LLMProviders;
