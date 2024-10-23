const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const initializeDatabase = require('./db/initDb');
const registerOrganizationHandlers = require('./ipcHandlers/organizationHandlers');
const registerProjectHandlers = require('./ipcHandlers/projectHandlers');
const registerTaskHandlers = require('./ipcHandlers/taskHandlers');
const registerTimeEntryHandlers = require('./ipcHandlers/timeEntryHandlers');

let tray = null;
let window = null;

function createWindow() {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    icon: path.join(__dirname, 'assets', 'iconTemplate.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  window.loadFile(path.join(__dirname, 'views', 'index.html'));

  // Hide the window when it loses focus
  window.on('blur', () => {
    window.hide();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'iconTemplate.png'));
  tray.setImage(path.join(__dirname, 'assets', 'iconTemplate.png'));

  tray.setToolTip('Trackerton');

  tray.on('click', () => {
    toggleWindow();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Dark Mode',
      click: () => {
        window.webContents.send('toggle-dark-mode');
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function toggleWindow() {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
}

function showWindow() {
  const trayBounds = tray.getBounds();
  const windowBounds = window.getBounds();

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  window.setPosition(x, y, false);
  window.show();
  window.focus();
}

app.whenReady().then(() => {
  initializeDatabase();
  registerOrganizationHandlers();
  registerProjectHandlers();
  registerTaskHandlers();
  registerTimeEntryHandlers();

  createTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
