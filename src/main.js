const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./db/database');

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

  window.loadFile(path.join(__dirname, 'index.html'));

  // Hide the window when it loses focus
  window.on('blur', () => {
    window.hide();
  });
}

app.whenReady().then(() => {
  createTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'iconTemplate.png'));

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

  // Calculate the position of the window
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  window.setPosition(x, y, false);
  window.show();
  window.focus();
}

app.on('window-all-closed', (e) => {
  // Prevent app from quitting
  e.preventDefault();
});

// IPC Event Handlers

// Organizations
ipcMain.handle('get-organizations', async () => {
  return new Promise((resolve) => {
    dbModule.getOrganizations((err, rows) => {
      resolve(rows);
    });
  });
});

ipcMain.handle('add-organization', async (event, name) => {
  return new Promise((resolve) => {
    dbModule.addOrganization(name, (err, org) => {
      resolve(org);
    });
  });
});

ipcMain.handle('update-organization', async (event, { id, name }) => {
  return new Promise((resolve) => {
    dbModule.updateOrganization(id, name, (err) => {
      resolve();
    });
  });
});

ipcMain.handle('delete-organization', async (event, id) => {
  return new Promise((resolve) => {
    dbModule.deleteOrganization(id, (err) => {
      resolve();
    });
  });
});

// Projects
ipcMain.handle('get-projects', async (event, organizationId) => {
  return new Promise((resolve) => {
    dbModule.getProjects(organizationId, (err, rows) => {
      resolve(rows);
    });
  });
});

ipcMain.handle('add-project', async (event, { name, organizationId }) => {
  return new Promise((resolve) => {
    dbModule.addProject(name, organizationId, (err, proj) => {
      resolve(proj);
    });
  });
});

ipcMain.handle('update-project', async (event, { id, name }) => {
  return new Promise((resolve) => {
    dbModule.updateProject(id, name, (err) => {
      resolve();
    });
  });
});

ipcMain.handle('delete-project', async (event, id) => {
  return new Promise((resolve) => {
    dbModule.deleteProject(id, (err) => {
      resolve();
    });
  });
});

// Tasks
ipcMain.handle('get-tasks', async (event, projectId) => {
  return new Promise((resolve) => {
    dbModule.getTasks(projectId, (err, rows) => {
      resolve(rows);
    });
  });
});

ipcMain.handle('add-task', async (event, { name, projectId }) => {
  return new Promise((resolve) => {
    dbModule.addTask(name, projectId, (err, task) => {
      resolve(task);
    });
  });
});

ipcMain.handle('update-task', async (event, { id, name }) => {
  return new Promise((resolve) => {
    dbModule.updateTask(id, name, (err) => {
      resolve();
    });
  });
});

ipcMain.handle('delete-task', async (event, id) => {
  return new Promise((resolve) => {
    dbModule.deleteTask(id, (err) => {
      resolve();
    });
  });
});

// Time Entries
ipcMain.on('save-time-entry', (event, timeEntry) => {
  dbModule.addTimeEntry(
    timeEntry.taskId,
    timeEntry.duration,
    timeEntry.timestamp,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        // Optionally send updated time entries back to renderer
        // sendTimeEntries();
      }
    }
  );
});

ipcMain.handle('get-time-entries', async () => {
  return new Promise((resolve) => {
    dbModule.getTimeEntries((err, rows) => {
      resolve(rows);
    });
  });
});

// Toggle Dark Mode Event
ipcMain.on('toggle-dark-mode', (event) => {
  window.webContents.send('toggle-dark-mode');
});
