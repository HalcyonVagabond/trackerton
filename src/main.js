const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');
const initializeDatabase = require('./db/initDb');
const registerOrganizationHandlers = require('./ipcHandlers/organizationHandlers');
const registerProjectHandlers = require('./ipcHandlers/projectHandlers');
const registerTaskHandlers = require('./ipcHandlers/taskHandlers');
const registerTimeEntryHandlers = require('./ipcHandlers/timeEntryHandlers');


require('electron-reload')(path.join(__dirname, '../'), {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

// Request single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
} else {
  // This is the first instance
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

let tray = null;
let menuBarWindow = null; // Small popup from menu bar
let mainWindow = null; // Full application window
let currentTheme = 'light'; // Track current theme
let timerState = {
  status: 'idle',
  elapsedTime: 0,
  display: '00:00:00',
  task: null,
  updatedAt: Date.now(),
  source: 'main',
};

function broadcastTimerState() {
  if (menuBarWindow && !menuBarWindow.isDestroyed()) {
    menuBarWindow.webContents.send('timer-state', timerState);
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('timer-state', timerState);
  }
}

ipcMain.on('timer-state-update', (_event, state) => {
  timerState = {
    ...timerState,
    ...state,
    source: 'main',
    updatedAt: state?.updatedAt ?? Date.now(),
  };
  broadcastTimerState();
});

ipcMain.handle('timer-state-get', () => timerState);

// Theme management
ipcMain.on('theme-change', (_event, theme) => {
  currentTheme = theme;
  // Broadcast to all windows
  if (menuBarWindow && !menuBarWindow.isDestroyed()) {
    menuBarWindow.webContents.send('theme-change', theme);
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('theme-change', theme);
  }
});

ipcMain.handle('get-theme', () => currentTheme);

ipcMain.on('timer-command', (_event, command) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('timer-command-execute', command);
  }
});

// Create the small menu bar popup window
function createMenuBarWindow() {
  menuBarWindow = new BrowserWindow({
    width: 336,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  menuBarWindow.loadFile(path.join(__dirname, 'views', 'menuBarPopup.html'));

  menuBarWindow.webContents.once('did-finish-load', () => {
    broadcastTimerState();
  });

  menuBarWindow.on('blur', () => {
    if (!menuBarWindow.webContents.isDevToolsOpened()) {
      menuBarWindow.hide();
    }
  });
}

// Create the main application window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    show: false,
    icon: path.join(__dirname, 'assets', 'logo-icon-white-bg.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'views', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    broadcastTimerState();
  });

  // Open DevTools for debugging
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
    // Surface the main window automatically in development so it is reachable
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.focus();
    });
  }

  mainWindow.on('close', (event) => {
    // Don't quit the app, just hide the window
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Fall back to a text-based tray entry so macOS always shows it
  const emptyIcon = nativeImage.createEmpty();
  tray = new Tray(emptyIcon);
  tray.setToolTip('Trackerton - Time Tracking');
  tray.setTitle('⏱ Trackerton');
  if (typeof tray.setHighlightMode === 'function') {
    tray.setHighlightMode('always');
  }

  tray.on('click', () => {
    toggleMenuBarWindow();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Trackerton',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show Quick Access',
      click: () => showMenuBarWindow(),
    },
    {
      label: 'Open Main Window',
      click: () => showMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  
  console.log('✓ Tray text entry added to the menu bar (⏱ Trackerton)');
  console.log('  If you do not see it, try rearranging menu bar items while holding ⌘.');
}

function toggleMenuBarWindow() {
  if (menuBarWindow.isVisible()) {
    menuBarWindow.hide();
  } else {
    showMenuBarWindow();
  }
}

function showMenuBarWindow() {
  const trayBounds = tray.getBounds();
  const windowBounds = menuBarWindow.getBounds();

  // Position window near tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  menuBarWindow.setPosition(x, y, false);
  menuBarWindow.show();
  menuBarWindow.focus();
  
  console.log('Menu bar popup shown at position:', { x, y });
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
  console.log('Main window shown');
}

app.whenReady().then(async () => {
  await initializeDatabase();
  registerOrganizationHandlers();
  registerProjectHandlers();
  registerTaskHandlers();
  registerTimeEntryHandlers();

  // Handle opening main window from menu bar popup
  ipcMain.on('open-main-window', () => {
    showMainWindow();
  });

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    const dockIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'logo-icon-white-bg.png'));
    app.dock.setIcon(dockIcon);
  }

  createTray();
  createMenuBarWindow(); // Small popup
  createMainWindow(); // Full window
  
  // Show a notification to confirm the app is running
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Trackerton Started',
      body: 'Click the menu bar icon to get started!',
    });
    notification.show();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMenuBarWindow();
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, allow the app to quit when all windows are closed during development
  // In production, you might want to keep it running in the tray
  if (process.platform !== 'darwin' || process.env.NODE_ENV !== 'production') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Clean up on exit
app.on('will-quit', () => {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
});
