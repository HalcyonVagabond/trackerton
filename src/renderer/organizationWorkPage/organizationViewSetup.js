// Modern Accordion Task Management View
let currentOrganizationId = null;
let currentProjectId = null;
let currentTaskId = null;
let currentEditContext = null;
let allProjects = [];

// Save current selection state to localStorage for cross-page persistence
function saveCurrentState() {
  localStorage.setItem('selectedOrganization', currentOrganizationId || '');
  localStorage.setItem('selectedProject', currentProjectId || '');
  localStorage.setItem('selectedTask', currentTaskId || '');
  console.log('Saved state:', { currentOrganizationId, currentProjectId, currentTaskId });
  console.log('localStorage now has:', {
    org: localStorage.getItem('selectedOrganization'),
    proj: localStorage.getItem('selectedProject'),
    task: localStorage.getItem('selectedTask')
  });
}

export async function setupOrganizationView() {
  const organizationSelect = document.getElementById('organizationSelect');
  const projectsList = document.getElementById('projectsList');
  const backButton = document.getElementById('backButton');
  const modal = document.getElementById('editModal');
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingLogo = document.getElementById('loadingLogo');
  
  // Update logo for dark mode
  function updateLoadingLogo() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Use logo-icon.png for dark mode (it's lighter) and logo-icon-light.png for light mode
    loadingLogo.src = isDark ? '../assets/logo-icon.png' : '../assets/logo-icon-light.png';
  }
  updateLoadingLogo();
  
  // Ensure modal is hidden on load
  modal.classList.add('hidden');

  // Load organizations into the dropdown FIRST and wait for it
  await loadOrganizationsIntoSelect();

  // Event listener for organization selection
  organizationSelect.addEventListener('change', async () => {
    currentOrganizationId = organizationSelect.value;
    currentProjectId = null;
    currentTaskId = null;
    saveCurrentState(); // Save to localStorage
    if (currentOrganizationId) {
      await loadProjects(currentOrganizationId);
    } else {
      showEmptyProjects();
      showEmptyMain('Select an organization to begin');
    }
  });

  // Event listener for back button
  backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Set up modal handlers
  setupModalHandlers();
  
  // Check URL params and auto-load if specified (AFTER orgs are loaded)
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get('organizationId');
  const projId = urlParams.get('projectId');
  const taskId = urlParams.get('taskId');
  
  console.log('Task Management loaded with URL params:', { orgId, projId, taskId });
  console.log('Full URL:', window.location.href);
  
  if (orgId) {
    console.log('Setting org select to:', orgId);
    organizationSelect.value = orgId;
    currentOrganizationId = orgId;
    
    // Load projects for this org
    await loadProjects(orgId);
    console.log('Projects loaded for org:', orgId);
    
    // Now handle project/task selection if specified
    if (projId) {
      console.log('Looking for project card:', projId);
      // Give a moment for DOM to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projectCard = document.querySelector(`[data-project-id="${projId}"]`);
      console.log('Found project card:', projectCard);
      if (projectCard) {
        // Expand the project directly using the toggle function
        currentProjectId = projId;
        toggleProject(projId);
        
        // If task specified, wait for tasks to load then select it
        if (taskId) {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Selecting task:', taskId, 'for project:', projId);
          // Properly select the task using the existing function
          await selectTask(projId, taskId);
          
          // Scroll to it in sidebar
          const taskCard = document.querySelector(`.task-item-sidebar[data-task-id="${taskId}"]`);
          if (taskCard) {
            setTimeout(() => {
              taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }
      }
    }
  } else {
    console.log('No orgId in URL params');
  }
  
  // Hide loading screen with a slight delay for smooth transition
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 500);
}

async function loadOrganizationsIntoSelect() {
  const organizationSelect = document.getElementById('organizationSelect');
  try {
    const organizations = await window.electronAPI.getOrganizations();
    organizationSelect.innerHTML = '<option value="">Select organization...</option>';
    organizations.forEach(org => {
      const option = document.createElement('option');
      option.value = org.id;
      option.textContent = org.name;
      organizationSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading organizations:', error);
  }
}

async function loadProjects(organizationId) {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⏳</div><div class="empty-state__text">Loading...</div></div>';

  try {
    const projects = await window.electronAPI.getProjects(organizationId);
    
    if (!projects || projects.length === 0) {
      showEmptyProjects('No projects in this organization');
      showEmptyMain('No projects available');
      return;
    }

    // Get tasks for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await window.electronAPI.getTasks(project.id);
        return {
          ...project,
          tasks: tasks || [],
        };
      })
    );

    allProjects = projectsWithTasks;
    displayProjects(projectsWithTasks);
    showEmptyMain('Select a task from the sidebar');
  } catch (error) {
    console.error('Error loading projects:', error);
    showEmptyProjects('Error loading projects');
  }
}

function displayProjects(projects) {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';

  projects.forEach(project => {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    
    const projectHeader = document.createElement('div');
    projectHeader.className = 'project-header';
    projectHeader.dataset.projectId = project.id;
    
    projectHeader.innerHTML = `
      <div class="project-header__content">
        <div class="project-header__name">${escapeHtml(project.name)}</div>
        <div class="project-header__meta">
          <span>${project.tasks.length} task${project.tasks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="project-header__icon">▶</div>
    `;

    const tasksList = document.createElement('div');
    tasksList.className = 'project-tasks-list';
    
    if (project.tasks.length > 0) {
      project.tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item-sidebar';
        taskItem.dataset.taskId = task.id;
        taskItem.dataset.projectId = project.id;
        taskItem.textContent = task.name;
        
        taskItem.addEventListener('click', () => selectTask(project.id, task.id));
        tasksList.appendChild(taskItem);
      });
    }

    projectHeader.addEventListener('click', () => toggleProject(project.id));
    
    projectItem.appendChild(projectHeader);
    projectItem.appendChild(tasksList);
    projectsList.appendChild(projectItem);
  });
}

function toggleProject(projectId) {
  const projectHeader = document.querySelector(`.project-header[data-project-id="${projectId}"]`);
  const tasksList = projectHeader.nextElementSibling;
  
  const isExpanded = projectHeader.classList.contains('expanded');
  
  if (isExpanded) {
    projectHeader.classList.remove('expanded');
    tasksList.classList.remove('expanded');
    // Clear project selection when collapsing
    if (currentProjectId == projectId) {
      currentProjectId = null;
      currentTaskId = null;
      saveCurrentState();
    }
  } else {
    projectHeader.classList.add('expanded');
    tasksList.classList.add('expanded');
    // Set current project when expanding
    currentProjectId = projectId;
    saveCurrentState();
  }
}

async function selectTask(projectId, taskId) {
  currentProjectId = projectId;
  currentTaskId = taskId;
  saveCurrentState(); // Save to localStorage
  
  // Update active states
  document.querySelectorAll('.task-item-sidebar').forEach(item => {
    item.classList.toggle('active', item.dataset.taskId == taskId);
  });

  // Load and display task details
  await loadTaskDetails(projectId, taskId);
}

async function loadTaskDetails(projectId, taskId) {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⏳</div><div class="empty-state__text">Loading task...</div></div>';

  try {
    const project = allProjects.find(p => p.id == projectId);
    const tasks = await window.electronAPI.getTasks(projectId);
    const task = tasks.find(t => t.id == taskId);
    
    if (!task) {
      showEmptyMain('Task not found');
      return;
    }

    // Get time entries and stats
    const timeEntries = await window.electronAPI.getTimeEntries({ taskId: task.id });
    const totalDuration = await window.electronAPI.getTotalDurationByTask(task.id);
    const latestEntry = timeEntries.length > 0 ? timeEntries[timeEntries.length - 1] : null;
    const firstEntry = timeEntries.length > 0 ? timeEntries[0] : null;

    displayTaskDetails(project, {
      ...task,
      timeEntries: timeEntries || [],
      totalDuration: totalDuration || 0,
      latestTimestamp: latestEntry?.timestamp,
      firstTimestamp: firstEntry?.timestamp,
    });
  } catch (error) {
    console.error('Error loading task details:', error);
    mainContent.innerHTML = '<div class="empty-state"><div class="empty-state__icon">❌</div><div class="empty-state__text">Error loading task</div></div>';
  }
}

function displayTaskDetails(project, task) {
  const mainContent = document.getElementById('mainContent');
  
  const timeEntriesHtml = task.timeEntries.length > 0
    ? task.timeEntries.map(entry => createTimeEntryElement(entry)).join('')
    : '<div class="empty-state__text" style="padding: 20px;">No time entries yet</div>';

  mainContent.innerHTML = `
    <div class="panel-header">
      <div style="flex: 1;">
        <input 
          type="text" 
          class="project-name-input" 
          value="${escapeHtml(project.name)}"
          data-project-id="${project.id}"
          placeholder="Project name"
        />
        <div class="panel-subtitle">${task.timeEntries.length} time entr${task.timeEntries.length !== 1 ? 'ies' : 'y'}</div>
      </div>
      <div class="project-description">
        <div class="description-label">Project Description</div>
        <textarea 
          class="description-textarea" 
          data-project-id="${project.id}"
          placeholder="Add a project description..."
        >${escapeHtml(project.description || '')}</textarea>
      </div>
    </div>
    <div class="panel-content">
      <div class="task-detail-view">
        <div class="task-detail-header">
          <input 
            type="text" 
            class="task-detail-name" 
            value="${escapeHtml(task.name)}"
            data-task-id="${task.id}"
            placeholder="Task name"
          />
        </div>
        
        <div class="task-stats">
          <div class="stat-item">
            <div class="stat-label">Total Time</div>
            <div class="stat-value stat-value--time">${formatDuration(task.totalDuration)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">First Started</div>
            <div class="stat-value">${formatDateTime(task.firstTimestamp)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Worked</div>
            <div class="stat-value">${formatDateTime(task.latestTimestamp)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Time Entries</div>
            <div class="stat-value">${task.timeEntries.length}</div>
          </div>
        </div>

        ${task.timeEntries.length > 0 ? `
          <div class="time-entries-section">
            <div class="time-entries-header">Time Entries</div>
            ${timeEntriesHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Set up inline editing handlers
  setupInlineEditing(project.id, task.id);
}

function createTimeEntryElement(entry) {
  return `
    <div class="time-entry">
      <div class="time-entry__info">
        <span class="time-entry__duration">${formatDuration(entry.duration)}</span>
        <span class="time-entry__timestamp">${formatDateTime(entry.timestamp)}</span>
      </div>
      <div class="time-entry__actions">
        <button class="btn-text btn-text--edit" onclick="editTimeEntry(${entry.id}, ${entry.duration}, '${entry.timestamp}')">Edit</button>
        <button class="btn-text btn-text--delete" onclick="deleteTimeEntry(${entry.id})">Delete</button>
      </div>
    </div>
  `;
}

function setupInlineEditing(projectId, taskId) {
  // Project name editing
  const projectNameInput = document.querySelector('.project-name-input');
  let originalProjectName = projectNameInput.value;
  
  projectNameInput.addEventListener('focus', () => {
    originalProjectName = projectNameInput.value;
  });
  
  projectNameInput.addEventListener('blur', async () => {
    const newName = projectNameInput.value.trim();
    if (newName && newName !== originalProjectName) {
      try {
        const project = allProjects.find(p => p.id == projectId);
        await window.electronAPI.updateProject(projectId, newName, project.description || '');
        // Update in memory
        project.name = newName;
        // Update sidebar
        await loadProjects(currentOrganizationId);
        setTimeout(() => {
          const taskElement = document.querySelector(`.task-item-sidebar[data-task-id="${taskId}"]`);
          if (taskElement) {
            toggleProject(projectId);
            selectTask(projectId, taskId);
          }
        }, 100);
      } catch (error) {
        console.error('Error updating project name:', error);
        alert('Failed to update project name');
        projectNameInput.value = originalProjectName;
      }
    } else if (!newName) {
      projectNameInput.value = originalProjectName;
    }
  });
  
  projectNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      projectNameInput.blur();
    } else if (e.key === 'Escape') {
      projectNameInput.value = originalProjectName;
      projectNameInput.blur();
    }
  });

  // Project description editing
  const descriptionTextarea = document.querySelector('.description-textarea');
  let originalDescription = descriptionTextarea.value;
  
  descriptionTextarea.addEventListener('focus', () => {
    originalDescription = descriptionTextarea.value;
  });
  
  descriptionTextarea.addEventListener('blur', async () => {
    const newDescription = descriptionTextarea.value.trim();
    if (newDescription !== originalDescription) {
      try {
        const project = allProjects.find(p => p.id == projectId);
        await window.electronAPI.updateProject(projectId, project.name, newDescription);
        // Update in memory
        project.description = newDescription;
      } catch (error) {
        console.error('Error updating project description:', error);
        alert('Failed to update project description');
        descriptionTextarea.value = originalDescription;
      }
    }
  });
  
  descriptionTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      descriptionTextarea.value = originalDescription;
      descriptionTextarea.blur();
    }
  });

  // Task name editing
  const taskNameInput = document.querySelector('.task-detail-name');
  let originalTaskName = taskNameInput.value;
  
  taskNameInput.addEventListener('focus', () => {
    originalTaskName = taskNameInput.value;
  });
  
  taskNameInput.addEventListener('blur', async () => {
    const newName = taskNameInput.value.trim();
    if (newName && newName !== originalTaskName) {
      try {
        await window.electronAPI.updateTask(taskId, newName);
        // Update sidebar
        const taskElement = document.querySelector(`.task-item-sidebar[data-task-id="${taskId}"]`);
        if (taskElement) {
          taskElement.textContent = newName;
        }
      } catch (error) {
        console.error('Error updating task name:', error);
        alert('Failed to update task name');
        taskNameInput.value = originalTaskName;
      }
    } else if (!newName) {
      taskNameInput.value = originalTaskName;
    }
  });
  
  taskNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      taskNameInput.blur();
    } else if (e.key === 'Escape') {
      taskNameInput.value = originalTaskName;
      taskNameInput.blur();
    }
  });
}

// Global functions for inline event handlers - only for time entries now
window.editTimeEntry = function(entryId, duration, timestamp) {
  showEditModal('timeEntry', entryId, null, duration, timestamp);
};

window.deleteTimeEntry = async function(entryId) {
  if (confirm('Are you sure you want to delete this time entry?')) {
    try {
      await window.electronAPI.deleteTimeEntry(entryId);
      if (currentTaskId) {
        await loadTaskDetails(currentProjectId, currentTaskId);
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
      alert('Failed to delete time entry');
    }
  }
};

function showEditModal(type, id, name, duration = null, timestamp = null) {
  const modal = document.getElementById('editModal');
  const title = document.getElementById('modalTitle');
  const input = document.getElementById('modalInput');
  const textarea = document.getElementById('modalTextarea');
  const durationInputs = document.getElementById('modalDurationInputs');
  const hoursInput = document.getElementById('modalHoursInput');
  const minutesInput = document.getElementById('modalMinutesInput');
  const secondsInput = document.getElementById('modalSecondsInput');
  const timestampInput = document.getElementById('modalTimestampInput');

  // Reset all inputs
  input.classList.add('hidden');
  textarea.classList.add('hidden');
  durationInputs.classList.add('hidden');
  timestampInput.classList.add('hidden');

  // Only time entries use modals now
  if (type === 'timeEntry') {
    title.textContent = 'Edit Time Entry';
    durationInputs.classList.remove('hidden');
    timestampInput.classList.remove('hidden');
    
    // Convert seconds to HMS
    const totalSeconds = duration || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = seconds;
    
    // Convert timestamp to datetime-local format
    if (timestamp) {
      const date = new Date(timestamp);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      timestampInput.value = localDateTime;
    }
  }

  currentEditContext = { type, id };
  modal.classList.remove('hidden');
}

function setupModalHandlers() {
  const modal = document.getElementById('editModal');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const saveBtn = document.getElementById('modalSaveBtn');

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    currentEditContext = null;
  });

  saveBtn.addEventListener('click', async () => {
    if (!currentEditContext) return;

    try {
      const { type, id } = currentEditContext;

      // Only time entries use modals now
      if (type === 'timeEntry') {
        const hours = parseInt(document.getElementById('modalHoursInput').value) || 0;
        const minutes = parseInt(document.getElementById('modalMinutesInput').value) || 0;
        const seconds = parseInt(document.getElementById('modalSecondsInput').value) || 0;
        
        // Convert HMS to total seconds
        const duration = (hours * 3600) + (minutes * 60) + seconds;
        const timestamp = new Date(document.getElementById('modalTimestampInput').value).toISOString();
        
        if (duration < 0) {
          alert('Please enter a valid duration');
          return;
        }
        
        if (minutes > 59 || seconds > 59) {
          alert('Minutes and seconds must be less than 60');
          return;
        }
        
        await window.electronAPI.updateTimeEntry(id, duration, timestamp);
      }

      modal.classList.add('hidden');
      currentEditContext = null;
      
      // Reload current task view
      if (currentTaskId) {
        await loadTaskDetails(currentProjectId, currentTaskId);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    }
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      currentEditContext = null;
    }
  });
}

function showEmptyProjects(message = 'No projects available') {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">📁</div>
      <div class="empty-state__title">No Projects</div>
      <div class="empty-state__text">${message}</div>
    </div>
  `;
}

function showEmptyMain(message = 'Choose a project from the sidebar') {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">\u{1F448}</div>
      <div class="empty-state__title">Select a Project</div>
      <div class="empty-state__text">${message}</div>
    </div>
  `;
}

function formatDuration(seconds) {
  if (!seconds) return '0:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDateTime(isoString) {
  if (!isoString) return 'Never';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${timeStr}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ` at ${timeStr}`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}