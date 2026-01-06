// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.querySelector('.close');
const saveKeysBtn = document.getElementById('saveKeysBtn');
const clearKeysBtn = document.getElementById('clearKeysBtn');
const modelInfoBar = document.getElementById('modelInfoBar');
const modelBadge = document.getElementById('modelBadge');
const complexityBadge = document.getElementById('complexityBadge');
const reasoningText = document.getElementById('reasoningText');

// API Key inputs
const openaiKeyInput = document.getElementById('openaiKey');
const anthropicKeyInput = document.getElementById('anthropicKey');
const groqKeyInput = document.getElementById('groqKey');
const ollamaUrlInput = document.getElementById('ollamaUrl');

let isProcessing = false;

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadApiKeysFromStorage();
  addWelcomeMessage();
});

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

saveKeysBtn.addEventListener('click', saveApiKeys);
clearKeysBtn.addEventListener('click', clearApiKeys);

// Auto-resize textarea
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = messageInput.scrollHeight + 'px';
});

// Listen for model selection events
window.electronAPI.onModelSelected((data) => {
  updateModelInfoBar(data);
});

// Functions
function addWelcomeMessage() {
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'message system';
  welcomeMsg.innerHTML = `
    <strong>Welcome to RightModel!</strong><br>
    This intelligent chat app automatically selects the most appropriate LLM model based on your prompt's complexity.<br>
    <small>Click the settings button to configure your API keys.</small>
  `;
  chatMessages.appendChild(welcomeMsg);
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message || isProcessing) return;

  // Add user message to chat
  addMessageToChat('user', message);

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Disable send button
  isProcessing = true;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Thinking...';

  // Show loading indicator
  const loadingId = addLoadingMessage();

  try {
    // Send message to main process
    const result = await window.electronAPI.sendMessage(message);

    // Remove loading indicator
    removeLoadingMessage(loadingId);

    if (result.success) {
      // Add assistant response
      addMessageToChat('assistant', result.response, result.modelInfo);
    } else {
      // Show error
      addMessageToChat('system', `Error: ${result.error}`);
    }
  } catch (error) {
    removeLoadingMessage(loadingId);
    addMessageToChat('system', `Error: ${error.message}`);
  } finally {
    // Re-enable send button
    isProcessing = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    messageInput.focus();
  }
}

function addMessageToChat(role, content, modelInfo = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  if (role === 'assistant' && modelInfo) {
    // Parse markdown and sanitize HTML for assistant responses
    const parsedContent = marked.parse(content);
    const sanitizedContent = DOMPurify.sanitize(parsedContent);

    messageDiv.innerHTML = `
      <div class="message-content">${sanitizedContent}</div>
      <div class="message-meta">
        <span class="model-tag">${modelInfo.model}</span>
        <span>${modelInfo.provider}</span>
      </div>
    `;
  } else if (role === 'user') {
    // User messages - preserve line breaks
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    contentDiv.style.whiteSpace = 'pre-wrap';
    messageDiv.appendChild(contentDiv);
  } else {
    // System messages
    messageDiv.textContent = content;
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
  const loadingDiv = document.createElement('div');
  const loadingId = 'loading-' + Date.now();
  loadingDiv.id = loadingId;
  loadingDiv.className = 'message assistant';
  loadingDiv.innerHTML = '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return loadingId;
}

function removeLoadingMessage(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

function updateModelInfoBar(data) {
  modelBadge.textContent = `${data.provider}: ${data.model}`;
  complexityBadge.textContent = data.complexity.toUpperCase();
  complexityBadge.className = `complexity-badge ${data.complexity}`;
  reasoningText.textContent = data.reasoning;
  modelInfoBar.style.display = 'flex';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    modelInfoBar.style.display = 'none';
  }, 5000);
}

async function saveApiKeys() {
  const apiKeys = {
    openai: openaiKeyInput.value.trim(),
    anthropic: anthropicKeyInput.value.trim(),
    groq: groqKeyInput.value.trim(),
    ollama: ollamaUrlInput.value.trim()
  };

  // Save to localStorage
  localStorage.setItem('apiKeys', JSON.stringify(apiKeys));

  // Send to main process
  const result = await window.electronAPI.saveApiKeys(apiKeys);

  if (result.success) {
    addMessageToChat('system', 'API keys saved successfully!');
    settingsModal.style.display = 'none';

    // Show available providers
    const providers = await window.electronAPI.getAvailableProviders();
    if (providers.length > 0) {
      addMessageToChat('system', `Available providers: ${providers.join(', ')}`);
    } else {
      addMessageToChat('system', 'Warning: No providers configured. Please add at least one API key.');
    }
  } else {
    alert('Error saving API keys: ' + result.error);
  }
}

async function clearApiKeys() {
  const confirmed = confirm('Are you sure you want to clear all API keys? This will remove all saved credentials.');

  if (confirmed) {
    // Clear input fields
    openaiKeyInput.value = '';
    anthropicKeyInput.value = '';
    groqKeyInput.value = '';
    ollamaUrlInput.value = 'http://localhost:11434';

    // Clear from localStorage
    localStorage.removeItem('apiKeys');

    // Clear from main process
    const emptyKeys = {
      openai: '',
      anthropic: '',
      groq: '',
      ollama: 'http://localhost:11434'
    };
    await window.electronAPI.saveApiKeys(emptyKeys);

    addMessageToChat('system', 'All API keys have been cleared.');
    settingsModal.style.display = 'none';
  }
}

function loadApiKeysFromStorage() {
  const savedKeys = localStorage.getItem('apiKeys');
  if (savedKeys) {
    try {
      const apiKeys = JSON.parse(savedKeys);
      openaiKeyInput.value = apiKeys.openai || '';
      anthropicKeyInput.value = apiKeys.anthropic || '';
      groqKeyInput.value = apiKeys.groq || '';
      ollamaUrlInput.value = apiKeys.ollama || 'http://localhost:11434';

      // Auto-load into main process
      window.electronAPI.saveApiKeys(apiKeys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  }
}
