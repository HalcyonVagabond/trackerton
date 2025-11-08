// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');
// const { GET_TOTAL_DURATION_BY_TASK } = require('./constants/ipcChannels');
// const ipcChannels = require('./constants/ipcChannels');
const ipcChannels = {
  GET_ORGANIZATIONS: 'get-organizations',
  ADD_ORGANIZATION: 'add-organization',
  UPDATE_ORGANIZATION: 'update-organization',
  DELETE_ORGANIZATION: 'delete-organization',
  GET_PROJECTS: 'get-projects',
  ADD_PROJECT: 'add-project',
  UPDATE_PROJECT: 'update-project',
  DELETE_PROJECT: 'delete-project',
  GET_TASKS: 'get-tasks',
  ADD_TASK: 'add-task',
  UPDATE_TASK: 'update-task',
  DELETE_TASK: 'delete-task',
  SAVE_TIME_ENTRY: 'save-time-entry',
  GET_TIME_ENTRIES: 'get-time-entries',
  UPDATE_TIME_ENTRY: 'update-time-entry',
  DELETE_TIME_ENTRY: 'delete-time-entry',
  GET_LATEST_TIME_ENTRY: 'get-latest-time-entry',
  GET_TOTAL_DURATION_BY_TASK: 'get-total-duration-by-task',
  TOGGLE_DARK_MODE: 'toggle-dark-mode',
  UPDATE_TIMER_STATE: 'timer-state-update',
  GET_TIMER_STATE: 'timer-state-get',
  TIMER_STATE: 'timer-state',
  SEND_TIMER_COMMAND: 'timer-command',
  EXECUTE_TIMER_COMMAND: 'timer-command-execute',
  OPEN_MAIN_WINDOW: 'open-main-window',
  THEME_CHANGE: 'theme-change',
  GET_THEME: 'get-theme',
};

contextBridge.exposeInMainWorld('electronAPI', {
  // Organizations
  getOrganizations: () => ipcRenderer.invoke(ipcChannels.GET_ORGANIZATIONS),
  addOrganization: (name) => ipcRenderer.invoke(ipcChannels.ADD_ORGANIZATION, name),
  updateOrganization: (id, name) => ipcRenderer.invoke(ipcChannels.UPDATE_ORGANIZATION, { id, name }),
  deleteOrganization: (id) => ipcRenderer.invoke(ipcChannels.DELETE_ORGANIZATION, id),

  // Projects
  getProjects: (organizationId) => ipcRenderer.invoke(ipcChannels.GET_PROJECTS, organizationId),
  addProject: (name, organizationId) => ipcRenderer.invoke(ipcChannels.ADD_PROJECT, { name, organizationId }),
  updateProject: (id, name, description = '') => ipcRenderer.invoke(ipcChannels.UPDATE_PROJECT, { id, name, description }),
  deleteProject: (id) => ipcRenderer.invoke(ipcChannels.DELETE_PROJECT, id),

  // Tasks
  getTasks: (projectId) => ipcRenderer.invoke(ipcChannels.GET_TASKS, projectId),
  addTask: (name, projectId) => ipcRenderer.invoke(ipcChannels.ADD_TASK, { name, projectId }),
  updateTask: (id, name) => ipcRenderer.invoke(ipcChannels.UPDATE_TASK, { id, name }),
  deleteTask: (id) => ipcRenderer.invoke(ipcChannels.DELETE_TASK, id),

  // Time Entries
  saveTimeEntry: (data) => ipcRenderer.send(ipcChannels.SAVE_TIME_ENTRY, data),
  getTimeEntries: (filter) => ipcRenderer.invoke(ipcChannels.GET_TIME_ENTRIES, filter),
  updateTimeEntry: (id, duration, timestamp) => ipcRenderer.invoke(ipcChannels.UPDATE_TIME_ENTRY, { id, duration, timestamp }),
  deleteTimeEntry: (id) => ipcRenderer.invoke(ipcChannels.DELETE_TIME_ENTRY, id),
  getLatestTimeEntry: (taskId) => ipcRenderer.invoke(ipcChannels.GET_LATEST_TIME_ENTRY, taskId),
  getTotalDurationByTask: (taskId) => ipcRenderer.invoke(ipcChannels.GET_TOTAL_DURATION_BY_TASK, taskId),

  // Dark Mode
  onToggleDarkMode: (callback) => ipcRenderer.on(ipcChannels.TOGGLE_DARK_MODE, callback),
  
  // Theme Management
  sendThemeChange: (theme) => ipcRenderer.send(ipcChannels.THEME_CHANGE, theme),
  getTheme: () => ipcRenderer.invoke(ipcChannels.GET_THEME),
  onThemeChange: (callback) => ipcRenderer.on(ipcChannels.THEME_CHANGE, (_event, theme) => callback(theme)),
  
  // Window Management
  openMainWindow: () => ipcRenderer.send(ipcChannels.OPEN_MAIN_WINDOW),

  // Timer state sharing between windows
  updateTimerState: (state) => ipcRenderer.send(ipcChannels.UPDATE_TIMER_STATE, state),
  requestTimerState: () => ipcRenderer.invoke(ipcChannels.GET_TIMER_STATE),
  onTimerState: (callback) => ipcRenderer.on(ipcChannels.TIMER_STATE, (_event, state) => callback(state)),
  sendTimerCommand: (command) => ipcRenderer.send(ipcChannels.SEND_TIMER_COMMAND, command),
  onTimerCommand: (callback) => ipcRenderer.on(ipcChannels.EXECUTE_TIMER_COMMAND, (_event, command) => callback(command)),
});
