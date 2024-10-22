export function initializeModals() {
    // Import modals HTML
    fetch('./ui/components/modals.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('modals-container').innerHTML = html;
        setupModals();
      });
  }
  
  function setupModals() {
    // Organization Modal
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
        await window.electronAPI.addOrganization(name);
        newOrganizationName.value = '';
        addOrganizationModal.classList.add('hidden');
        await loadOrganizations();
      }
    });
  
    cancelOrganizationBtn.addEventListener('click', () => {
      addOrganizationModal.classList.add('hidden');
    });
  
    // Similar setup for Project and Task Modals
    // Project Modal
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addProjectModal = document.getElementById('addProjectModal');
    const newProjectName = document.getElementById('newProjectName');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
  
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
  
    // Task Modal
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskModal = document.getElementById('addTaskModal');
    const newTaskName = document.getElementById('newTaskName');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  
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
  }
  
  // Helper functions to reload data
  async function loadOrganizations() {
    const organizations = await window.electronAPI.getOrganizations();
    const organizationSelect = document.getElementById('organization');
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
    const projectSelect = document.getElementById('project');
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
    const taskSelect = document.getElementById('task');
    taskSelect.innerHTML = '<option value="">Select Task</option>';
    tasks.forEach(task => {
      const option = document.createElement('option');
      option.value = task.id;
      option.textContent = task.name;
      taskSelect.appendChild(option);
    });
  }
  