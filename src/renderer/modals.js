// src/renderer/modals.js
import { loadOrganizations, loadProjects, loadTasks } from './dataLoader.js';

export function addOrganizationModal() {
  const organizationSelect = document.getElementById('organization');
  const addOrganizationBtn = document.getElementById('addOrganizationBtn');
  const addOrganizationModal = document.getElementById('addOrganizationModal');
  const newOrganizationName = document.getElementById('newOrganizationName');
  const saveOrganizationBtn = document.getElementById('saveOrganizationBtn');
  const cancelOrganizationBtn = document.getElementById('cancelOrganizationBtn');

  addOrganizationBtn.addEventListener('click', () => {
    addOrganizationModal.classList.remove('hidden');
  });

  saveOrganizationBtn.addEventListener('click', async () => {
    const name = newOrganizationName.value.trim();
    if (name) {
      const newOrg = await window.electronAPI.addOrganization(name); // Get the new organization
      newOrganizationName.value = '';
      addOrganizationModal.classList.add('hidden');
      await loadOrganizations();
      // Select the new organization
      organizationSelect.value = newOrg.id;
      // Trigger change event to load projects for the new organization
      organizationSelect.dispatchEvent(new Event('change'));
    }
  });

  cancelOrganizationBtn.addEventListener('click', () => {
    addOrganizationModal.classList.add('hidden');
  });
}


export function addProjectModal() {
  const addProjectBtn = document.getElementById('addProjectBtn');
  const addProjectModal = document.getElementById('addProjectModal');
  const newProjectName = document.getElementById('newProjectName');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const cancelProjectBtn = document.getElementById('cancelProjectBtn');
  const organizationSelect = document.getElementById('organization');
  const projectSelect = document.getElementById('project');

  addProjectBtn.addEventListener('click', () => {
    if (!organizationSelect.value) {
      alert('Please select an organization first.');
      return;
    }
    addProjectModal.classList.remove('hidden');
  });

  saveProjectBtn.addEventListener('click', async () => {
    const name = newProjectName.value.trim();
    const organizationId = organizationSelect.value;
    if (name && organizationId) {
      const newProject = await window.electronAPI.addProject(name, organizationId); // Get the new project
      newProjectName.value = '';
      addProjectModal.classList.add('hidden');
      await loadProjects(organizationId);
      // Select the new project
      projectSelect.value = newProject.id;
      // Trigger change event to load tasks for the new project
      projectSelect.dispatchEvent(new Event('change'));
    }
  });

  cancelProjectBtn.addEventListener('click', () => {
    addProjectModal.classList.add('hidden');
  });
}

export function addTaskModal() {
  const addTaskBtn = document.getElementById('addTaskBtn');
  const addTaskModal = document.getElementById('addTaskModal');
  const newTaskName = document.getElementById('newTaskName');
  const saveTaskBtn = document.getElementById('saveTaskBtn');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const projectSelect = document.getElementById('project');
  const taskSelect = document.getElementById('task');

  addTaskBtn.addEventListener('click', () => {
    if (!projectSelect.value) {
      alert('Please select a project first.');
      return;
    }
    addTaskModal.classList.remove('hidden');
  });

  saveTaskBtn.addEventListener('click', async () => {
    const name = newTaskName.value.trim();
    const projectId = projectSelect.value;
    if (name && projectId) {
      const newTask = await window.electronAPI.addTask(name, projectId); // Get the new task
      newTaskName.value = '';
      addTaskModal.classList.add('hidden');
      await loadTasks(projectId);
      // Select the new task
      taskSelect.value = newTask.id;
      // Trigger change event if needed
      taskSelect.dispatchEvent(new Event('change'));
    }
  });

  cancelTaskBtn.addEventListener('click', () => {
    addTaskModal.classList.add('hidden');
  });
}

