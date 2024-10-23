import { loadOrganizations, loadProjectsAndTasks } from '../dataLoader.js';

export function setupOrganizationView() {
  const organizationSelect = document.getElementById('organizationSelect');
  const projectsContainer = document.getElementById('projectsContainer');
  const backButton = document.getElementById('backButton');

  // Load organizations into the dropdown
  loadOrganizationsIntoSelect();

  // Event listener for organization selection
  organizationSelect.addEventListener('change', async () => {
    const organizationId = organizationSelect.value;
    if (organizationId) {
      const projectsAndTasks = await loadProjectsAndTasks(organizationId);
      displayProjectsAndTasks(projectsAndTasks);
    } else {
      projectsContainer.innerHTML = '';
    }
  });

  // Event listener for back button
  backButton.addEventListener('click', () => {
    window.location.href = '../../views/index.html';
  });
}

async function loadOrganizationsIntoSelect() {
  const organizationSelect = document.getElementById('organizationSelect');
  const organizations = await window.electronAPI.getOrganizations();
  organizationSelect.innerHTML = '<option value="">Select Organization</option>';
  organizations.forEach(org => {
    const option = document.createElement('option');
    option.value = org.id;
    option.textContent = org.name;
    organizationSelect.appendChild(option);
  });
}

function displayProjectsAndTasks(projectsAndTasks) {
  const projectsContainer = document.getElementById('projectsContainer');
  projectsContainer.innerHTML = ''; // Clear existing content

  projectsAndTasks.forEach(project => {
    // Create project accordion item
    const projectDiv = document.createElement('div');
    projectDiv.className = 'mb-4';

    // Project header
    const projectHeader = document.createElement('button');
    projectHeader.className = 'w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md';
    projectHeader.textContent = project.name;
    projectHeader.addEventListener('click', () => {
      projectTasksDiv.classList.toggle('hidden');
    });

    // Project tasks container
    const projectTasksDiv = document.createElement('div');
    projectTasksDiv.className = 'pl-4 mt-2 hidden';

    project.tasks.forEach(task => {
      // Task item
      const taskDiv = document.createElement('div');
      taskDiv.className = 'mb-2';

      // Task header
      const taskHeader = document.createElement('button');
      taskHeader.className = 'w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md';
      taskHeader.textContent = task.name;
      taskHeader.addEventListener('click', () => {
        taskDetailsDiv.classList.toggle('hidden');
      });

      // Task details (e.g., total time)
      const taskDetailsDiv = document.createElement('div');
      taskDetailsDiv.className = 'pl-4 mt-2 hidden';

      const taskTimeDiv = document.createElement('div');
      taskTimeDiv.textContent = `Total Time: ${task.totalTime}`;
      taskTimeDiv.className = 'text-gray-700 dark:text-gray-300';

      taskDetailsDiv.appendChild(taskTimeDiv);

      // Append to taskDiv
      taskDiv.appendChild(taskHeader);
      taskDiv.appendChild(taskDetailsDiv);

      // Append taskDiv to projectTasksDiv
      projectTasksDiv.appendChild(taskDiv);
    });

    // Append to projectDiv
    projectDiv.appendChild(projectHeader);
    projectDiv.appendChild(projectTasksDiv);

    // Append projectDiv to projectsContainer
    projectsContainer.appendChild(projectDiv);
  });
}
