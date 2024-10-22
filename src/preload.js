const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Organizations
  getOrganizations: () => ipcRenderer.invoke('get-organizations'),
  addOrganization: (name) => ipcRenderer.invoke('add-organization', name),
  updateOrganization: (id, name) => ipcRenderer.invoke('update-organization', { id, name }),
  deleteOrganization: (id) => ipcRenderer.invoke('delete-organization', id),

  // Projects
  getProjects: (organizationId) => ipcRenderer.invoke('get-projects', organizationId),
  addProject: (name, organizationId) => ipcRenderer.invoke('add-project', { name, organizationId }),
  updateProject: (id, name) => ipcRenderer.invoke('update-project', { id, name }),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),

  // Tasks
  getTasks: (projectId) => ipcRenderer.invoke('get-tasks', projectId),
  addTask: (name, projectId) => ipcRenderer.invoke('add-task', { name, projectId }),
  updateTask: (id, name) => ipcRenderer.invoke('update-task', { id, name }),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),

  // Time Entries
  saveTimeEntry: (data) => ipcRenderer.send('save-time-entry', data),
  getTimeEntries: () => ipcRenderer.invoke('get-time-entries'),

  // Dark Mode
  onToggleDarkMode: (callback) => ipcRenderer.on('toggle-dark-mode', () => callback()),
});
