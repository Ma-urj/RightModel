const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ModelRouter = require('./src/modelRouter');

let mainWindow;
const modelRouter = new ModelRouter();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle chat messages from renderer
ipcMain.handle('send-message', async (event, message) => {
  try {
    // Analyze prompt complexity and select appropriate model
    const analysis = modelRouter.analyzePrompt(message);

    // Send analysis back to renderer for display
    event.sender.send('model-selected', {
      model: analysis.selectedModel,
      provider: analysis.provider,
      complexity: analysis.complexity,
      reasoning: analysis.reasoning
    });

    // Get response from the selected model
    const response = await modelRouter.getResponse(message, analysis);

    return {
      success: true,
      response: response,
      modelInfo: {
        model: analysis.selectedModel,
        provider: analysis.provider,
        complexity: analysis.complexity
      }
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle API key configuration
ipcMain.handle('save-api-keys', async (event, apiKeys) => {
  try {
    modelRouter.setApiKeys(apiKeys);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-available-providers', async () => {
  return modelRouter.getAvailableProviders();
});
