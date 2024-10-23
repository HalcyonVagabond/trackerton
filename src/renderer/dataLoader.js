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