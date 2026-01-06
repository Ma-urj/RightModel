# RightModel - Intelligent LLM Chat Application

An Electron-based chat application that intelligently selects the most appropriate LLM model based on prompt complexity, optimizing resource usage and cost.

## Features

- **Smart Model Selection**: Automatically analyzes prompt complexity and routes to the appropriate model tier
- **Multi-Provider Support**: Works with OpenAI, Anthropic (Claude), Groq, and local Ollama models
- **Cost Optimization**: Uses smaller, faster models for simple queries and reserves powerful models for complex tasks
- **Beautiful UI**: Modern, gradient-based interface with real-time model selection feedback
- **Markdown Rendering**: Full support for formatted responses including code blocks, lists, tables, and more
- **Conversation History**: Maintains context across multiple exchanges
- **Fallback System**: Automatically switches to alternative providers if one fails

## How It Works

### Complexity Analysis

The app analyzes your prompt based on:
- Word count and sentence structure
- Technical keywords and code indicators
- Mathematical/logical content
- Task complexity indicators
- Question complexity

### Model Tiers

1. **Fast Tier** (Simple queries)
   - Groq Llama 3.1 8B (fastest)
   - Ollama local models
   - GPT-3.5-Turbo
   - Claude Haiku

2. **Balanced Tier** (Moderate complexity)
   - Claude Sonnet
   - GPT-4o-mini
   - Groq Llama 70B

3. **Advanced Tier** (Complex reasoning)
   - Claude Opus
   - GPT-4o
   - GPT-4-Turbo

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Navigate to the project directory:
```bash
cd "...\RightModel"
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

For development mode with DevTools:
```bash
npm run dev
```

## Configuration

### API Keys

Click the "⚙️ API Settings" button and configure your API keys:

1. **OpenAI** (Required for GPT models)
   - Get your key from: https://platform.openai.com/api-keys
   - Format: `sk-...`

2. **Anthropic** (Required for Claude models)
   - Get your key from: https://console.anthropic.com/
   - Format: `sk-ant-...`

3. **Groq** (Optional, for fast inference)
   - Get your key from: https://console.groq.com/
   - Format: `gsk_...`

4. **Ollama** (Optional, for local models)
   - Install Ollama from: https://ollama.ai/
   - Default URL: `http://localhost:11434`
   - Pull models: `ollama pull llama3.2`

### Recommended Setup

For best results, configure at least:
- One provider from each tier (e.g., OpenAI + Anthropic + Groq/Ollama)
- This ensures the app can select the optimal model for any task

## Usage

1. Type your message in the input box
2. Press Enter to send (Shift+Enter for new line)
3. Watch the model info bar to see which model was selected and why
4. The app automatically handles conversation context

### Example Queries

**Simple (Fast Tier)**:
- "What is 2+2?"
- "Define recursion"
- "Hello!"

**Moderate (Balanced Tier)**:
- "Explain how promises work in JavaScript"
- "Write a function to sort an array"
- "Compare Python and JavaScript"

**Complex (Advanced Tier)**:
- "Design a scalable microservices architecture for an e-commerce platform"
- "Analyze the philosophical implications of AI consciousness"
- "Write a comprehensive algorithm for graph traversal with optimization"

## Project Structure

```
RightModel/
├── main.js                 # Electron main process
├── preload.js             # Preload script for IPC
├── index.html             # UI layout
├── styles.css             # Styling
├── renderer.js            # Renderer process (UI logic)
├── package.json           # Dependencies
└── src/
    ├── complexityAnalyzer.js  # Analyzes prompt complexity
    ├── modelRouter.js         # Routes to appropriate model
    └── llmProviders.js        # API integrations
```

## Cost Optimization

The app is designed to minimize costs:
- Simple greetings and basic queries use free/cheap models (Ollama, GPT-3.5)
- Moderate tasks use mid-tier models (Claude Sonnet, GPT-4o-mini)
- Complex reasoning reserves premium models (Claude Opus, GPT-4o)

**Estimated Savings**: 60-80% compared to always using top-tier models

## Troubleshooting

### No providers available
- Make sure you've configured at least one API key in settings
- Verify API keys are valid and have sufficient credits

### Ollama connection failed
- Ensure Ollama is running: `ollama serve`
- Check the URL is correct (default: `http://localhost:11434`)
- Pull a model: `ollama pull llama3.2`

### API errors
- Check your API key is correct
- Verify you have sufficient credits/quota
- The app will automatically try fallback providers

## Development

### Adding New Providers

1. Add provider configuration in `src/llmProviders.js`
2. Update model config in `src/modelRouter.js`
3. Add API key input in `index.html`

### Customizing Complexity Analysis

Edit the complexity indicators in `src/complexityAnalyzer.js` to adjust how prompts are classified.


## Contributing

Contributions welcome! Feel free to submit issues and pull requests.
