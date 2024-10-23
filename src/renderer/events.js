// src/renderer/events.js
import {
    startTimer,
    stopTimer,
    resumeTimer,
    saveTimeEntry,
  } from './timer.js';
  import {
    addOrganizationModal,
    addProjectModal,
    addTaskModal,
  } from './modals.js';
  import {
    loadProjects,
    loadTasks,
    loadAggregatedData,
  } from './dataLoader.js';
  
  export function setupEventListeners() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resumeButton = document.getElementById('resumeButton');
    const organizationSelect = document.getElementById('organization');
    const projectSelect = document.getElementById('project');
    const taskSelect = document.getElementById('task');
    const viewOrganizationWorkBtn = document.getElementById('viewOrganizationWorkBtn');
  
    // Timer buttons
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);
    resumeButton.addEventListener('click', resumeTimer);
  
    // Organization, Project, Task selection
    organizationSelect.addEventListener('change', async () => {
      const orgId = organizationSelect.value;
      console.log('Organization selected:', orgId);
      if (orgId) {
        await loadProjects(orgId);
      }
      // projectSelect.innerHTML = '<option value="">Select Project</option>';
      taskSelect.innerHTML = '<option value="">Select Task</option>';
      loadAggregatedData();
    });
  
    projectSelect.addEventListener('change', async () => {
      const projId = projectSelect.value;
      if (projId) {
        await loadTasks(projId);
      }
      // taskSelect.innerHTML = '<option value="">Select Task</option>';
      loadAggregatedData();
    });
  
    taskSelect.addEventListener('change', () => {
      loadAggregatedData();
    });
  
    // Modals
    addOrganizationModal();
    addProjectModal();
    addTaskModal();
  
    // View Organization Work
    viewOrganizationWorkBtn.addEventListener('click', () => {
      const organizationId = organizationSelect.value;
      if (!organizationId) {
        alert('Please select an organization.');
        return;
      }
      window.location.href = `organizationView.html?organizationId=${organizationId}`;
    });
  }
  