// renderer.js

let timerInterval;
let startTime;
let elapsedTime = 0;
let darkMode = false;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const timerDisplay = document.getElementById('timerDisplay');
const organizationSelect = document.getElementById('organization');
const projectSelect = document.getElementById('project');
const taskSelect = document.getElementById('task');
const aggregatedDataDiv = document.getElementById('aggregatedData');

// Modal Elements
const addOrganizationBtn = document.getElementById('addOrganizationBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const addTaskBtn = document.getElementById('addTaskBtn');

const addOrganizationModal = document.getElementById('addOrganizationModal');
const newOrganizationName = document.getElementById('newOrganizationName');
const saveOrganizationBtn = document.getElementById('saveOrganizationBtn');
const cancelOrganizationBtn = document.getElementById('cancelOrganizationBtn');

const addProjectModal = document.getElementById('addProjectModal');
const newProjectName = document.getElementById('newProjectName');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');

const addTaskModal = document.getElementById('addTaskModal');
const newTaskName = document.getElementById('newTaskName');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

// Initialize the app
loadOrganizations();
loadAggregatedData();

// Event listeners for start and stop buttons
startButton.addEventListener('click', () => {
  startTimer();
});

stopButton.addEventListener('click', () => {
  stopTimer();
});

// Event listeners for dropdowns
organizationSelect.addEventListener('change', () => {
  const orgId = organizationSelect.value;
  if (orgId) {
    loadProjects(orgId);
  } else {
    projectSelect.innerHTML = '<option value="">Select Project</option>';
    taskSelect.innerHTML = '<option value="">Select Task</option>';
  }
});

projectSelect.addEventListener('change', () => {
  const projId = projectSelect.value;
  if (projId) {
    loadTasks(projId);
  } else {
    taskSelect.innerHTML = '<option value="">Select Task</option>';
  }
});

// Event listeners for modals
addOrganizationBtn.addEventListener('click', () => {
  addOrganizationModal.classList.remove('hidden');
});

saveOrganizationBtn.addEventListener('click', async () => {
  const name = newOrganizationName.value.trim();
  if (name) {
    await window.electronAPI.addOrganization(name);
    newOrganizationName.value = '';
    addOrganizationModal.classList.add('hidden');
    await loadOrganizations();
  }
});

cancelOrganizationBtn.addEventListener('click', () => {
  addOrganizationModal.classList.add('hidden');
});

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
    await window.electronAPI.addProject(name, organizationId);
    newProjectName.value = '';
    addProjectModal.classList.add('hidden');
    await loadProjects(organizationId);
  }
});

cancelProjectBtn.addEventListener('click', () => {
  addProjectModal.classList.add('hidden');
});

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
    await window.electronAPI.addTask(name, projectId);
    newTaskName.value = '';
    addTaskModal.classList.add('hidden');
    await loadTasks(projectId);
  }
});

cancelTaskBtn.addEventListener('click', () => {
  addTaskModal.classList.add('hidden');
});

// Functions to handle timer and data loading
// ... (Same as previous code)


function startTimer() {
  if (!organizationSelect.value) {
    alert('Please select an organization.');
    return;
  }
  if (!projectSelect.value) {
    alert('Please select a project.');
    return;
  }
  if (!taskSelect.value) {
    alert('Please select a task.');
    return;
  }

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    timerDisplay.textContent = timeToString(elapsedTime);
  }, 1000);

  startButton.disabled = true;
  stopButton.disabled = false;
}

function stopTimer() {
  clearInterval(timerInterval);
  saveTimeEntry();
  resetTimer();
}

function resetTimer() {
  startButton.disabled = false;
  stopButton.disabled = true;
  elapsedTime = 0;
  timerDisplay.textContent = '00:00:00';
}

function timeToString(time) {
  const diffInHrs = time / 3600000;
  const hh = Math.floor(diffInHrs).toString().padStart(2, '0');

  const diffInMin = (diffInHrs - hh) * 60;
  const mm = Math.floor(diffInMin).toString().padStart(2, '0');

  const diffInSec = Math.floor((diffInMin - mm) * 60).toString().padStart(2, '0');

  return `${hh}:${mm}:${diffInSec}`;
}

function saveTimeEntry() {
  const timeEntry = {
    taskId: taskSelect.value,
    duration: elapsedTime,
    timestamp: new Date().toISOString(),
  };

  window.electronAPI.saveTimeEntry(timeEntry);
  loadAggregatedData();
}

async function loadOrganizations() {
  const organizations = await window.electronAPI.getOrganizations();
  organizationSelect.innerHTML = '<option value="">Select Organization</option>';
  organizations.forEach(org => {
    const option = document.createElement('option');
    option.value = org.id;
    option.textContent = org.name;
    organizationSelect.appendChild(option);
  });
}

async function loadProjects(organizationId) {
  const projects = await window.electronAPI.getProjects(organizationId);
  projectSelect.innerHTML = '<option value="">Select Project</option>';
  projects.forEach(proj => {
    const option = document.createElement('option');
    option.value = proj.id;
    option.textContent = proj.name;
    projectSelect.appendChild(option);
  });
}

async function loadTasks(projectId) {
  const tasks = await window.electronAPI.getTasks(projectId);
  taskSelect.innerHTML = '<option value="">Select Task</option>';
  tasks.forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.name;
    taskSelect.appendChild(option);
  });
}

async function loadAggregatedData() {
  const entries = await window.electronAPI.getTimeEntries();
  const aggregatedData = aggregateTime(entries);
  displayAggregatedData(aggregatedData);
}

function aggregateTime(entries) {
  const aggregation = {};

  entries.forEach((entry) => {
    const key = `${entry.organization_name} - ${entry.project_name} - ${entry.task_name}`;
    if (!aggregation[key]) {
      aggregation[key] = 0;
    }
    aggregation[key] += entry.duration;
  });

  return aggregation;
}

function displayAggregatedData(data) {
  aggregatedDataDiv.innerHTML = '';

  for (const [key, value] of Object.entries(data)) {
    const timeString = timeToString(value);
    const div = document.createElement('div');
    div.textContent = `${key}: ${timeString}`;
    div.className = 'text-gray-700 dark:text-gray-300 mb-2';
    aggregatedDataDiv.appendChild(div);
  }
}

// Handle dark mode toggle
window.electronAPI.onToggleDarkMode(() => {
  toggleDarkMode();
});

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
}
