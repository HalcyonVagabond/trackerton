// src/renderer/app.js
import { setupEventListeners } from './events.js';
import { loadOrganizations, restoreSelectionState } from './dataLoader.js';

export async function initializeApp() {
  // Set up event listeners first
  setupEventListeners();
  
  // Then load data and restore state
  await loadOrganizations();
  const result = await restoreSelectionState();
  
  // If elements were cloned, we need to re-setup event listeners on the new elements
  if (result.elements) {
    setupEventListeners();
  }
  
  // Manually trigger change events to update UI (including more buttons)
  const organizationSelect = document.getElementById('organization');
  const projectSelect = document.getElementById('project');
  const taskSelect = document.getElementById('task');
  
  if (result.state.organizationId) {
    organizationSelect.dispatchEvent(new Event('change'));
  }
  if (result.state.projectId) {
    projectSelect.dispatchEvent(new Event('change'));
  }
  if (result.state.taskId) {
    taskSelect.dispatchEvent(new Event('change'));
  }
}
