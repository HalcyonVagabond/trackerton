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
  updateProject: (id, name) => ipcRenderer.invoke(ipcChannels.UPDATE_PROJECT, { id, name }),
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
});
