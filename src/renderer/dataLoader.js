// src/renderer/dataLoader.js
import { aggregateTime, displayAggregatedData } from './display.js';
import { timeToString } from '../utils/helpers.js';

export async function loadOrganizations() {
  const organizationSelect = document.getElementById('organization');
  const organizations = await window.electronAPI.getOrganizations();
  organizationSelect.innerHTML = '<option value="">Select Organization</option>';
  organizations.forEach(org => {
    const option = document.createElement('option');
    option.value = org.id;
    option.textContent = org.name;
    organizationSelect.appendChild(option);
  });
}

export async function loadProjects(organizationId) {
  const projectSelect = document.getElementById('project');
  const projects = await window.electronAPI.getProjects(organizationId);
  projectSelect.innerHTML = '<option value="">Select Project</option>';
  console.log('Projects:', projects, "for organizationId:", organizationId);
  projects.forEach(proj => {
    console.log('Project:', proj);
    const option = document.createElement('option');
    option.value = proj.id;
    option.textContent = proj.name;
    projectSelect.appendChild(option);
  });
  console.log('Project select:', projectSelect);
}

export async function loadTasks(projectId) {
  const taskSelect = document.getElementById('task');
  const tasks = await window.electronAPI.getTasks(projectId);
  console.log('Tasks:', tasks, "for projectId:", projectId);
  taskSelect.innerHTML = '<option value="">Select Task</option>';
  tasks.forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.name;
    taskSelect.appendChild(option);
  });
}

export async function loadAggregatedData(taskId) {
  const filter = { taskId }; // Assuming you're passing the taskId for aggregation
  const entries = await window.electronAPI.getTimeEntries(filter);
  const aggregatedData = aggregateTime(entries);
  displayAggregatedData(aggregatedData);
}

export async function loadProjectsAndTasks(organizationId) {
  // Fetch projects for the organization
  const projects = await window.electronAPI.getProjects(organizationId);

  // For each project, fetch tasks and total time
  const projectsAndTasks = [];

  for (const project of projects) {
    const tasks = await window.electronAPI.getTasks(project.id);

    // For each task, get total time
    const tasksWithTime = [];
    for (const task of tasks) {
      const totalDuration = await window.electronAPI.getTotalDurationByTask(task.id);
      tasksWithTime.push({
        id: task.id,
        name: task.name,
        totalTime: timeToString(totalDuration || 0),
      });
    }

    projectsAndTasks.push({
      id: project.id,
      name: project.name,
      tasks: tasksWithTime,
    });
  }

  return projectsAndTasks;
}

// State persistence
export function saveSelectionState(orgId, projId, taskId) {
  localStorage.setItem('selectedOrganization', orgId || '');
  localStorage.setItem('selectedProject', projId || '');
  localStorage.setItem('selectedTask', taskId || '');
}

export function getSelectionState() {
  return {
    organizationId: localStorage.getItem('selectedOrganization') || '',
    projectId: localStorage.getItem('selectedProject') || '',
    taskId: localStorage.getItem('selectedTask') || '',
  };
}

export async function restoreSelectionState() {
  const state = getSelectionState();
  console.log('Restoring state from localStorage:', state);
  const organizationSelect = document.getElementById('organization');
  const projectSelect = document.getElementById('project');
  const taskSelect = document.getElementById('task');
  
  if (state.organizationId) {
    // Load child data first
    await loadProjects(state.organizationId);
    
    if (state.projectId) {
      await loadTasks(state.projectId);
    }
    
    // Force DOM refresh by cloning and replacing each select with its value set
    const forceSelectUpdate = (selectElement, valueToSet) => {
      if (!valueToSet) return selectElement;
      
      // Clone the select element WITH all its children (the options)
      const newSelect = selectElement.cloneNode(true);
      
      // Set the value on the clone
      newSelect.value = valueToSet;
      
      // Replace the original with the clone
      selectElement.parentNode.replaceChild(newSelect, selectElement);
      
      return newSelect;
    };
    
    // Update organization
    const newOrgSelect = forceSelectUpdate(organizationSelect, state.organizationId);
    
    // Update project and task (need to get new references after replacement)
    let newProjectSelect = projectSelect;
    let newTaskSelect = taskSelect;
    
    if (state.projectId) {
      newProjectSelect = document.getElementById('project');
      newProjectSelect = forceSelectUpdate(newProjectSelect, state.projectId);
      
      if (state.taskId) {
        newTaskSelect = document.getElementById('task');
        newTaskSelect = forceSelectUpdate(newTaskSelect, state.taskId);
      }
    }
    
    // Return the state AND the new element references so event listeners can be re-attached
    return { 
      state, 
      elements: {
        organization: newOrgSelect,
        project: newProjectSelect,
        task: newTaskSelect
      }
    };
  }
  
  // Return the state so the caller can update UI buttons
  return { state, elements: null };
}