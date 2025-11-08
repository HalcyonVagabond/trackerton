import {
    startTimer,
    stopTimer,
    resumeTimer,
    saveTimeEntry,
    initializeTimerSync,
} from './timer.js';
import { initializeModal } from './modals.js';
import {
  loadOrganizations,
  loadProjects,
  loadTasks,
  loadAggregatedData,
  saveSelectionState,
  restoreSelectionState,
} from './dataLoader.js';
import { showToast } from '../utils/toast.js';

export function setupEventListeners() {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const resumeButton = document.getElementById('resumeButton');
  const organizationSelect = document.getElementById('organization');
  const projectSelect = document.getElementById('project');
  const taskSelect = document.getElementById('task');
  const viewOrganizationWorkBtn = document.getElementById('viewOrganizationWorkBtn');

  // More options buttons and menus
  const moreOrgBtn = document.getElementById('moreOrganizationBtn');
  const moreProjBtn = document.getElementById('moreProjectBtn');
  const moreTaskBtn = document.getElementById('moreTaskBtn');
  const orgActionsMenu = document.getElementById('organizationActionsMenu');
  const projActionsMenu = document.getElementById('projectActionsMenu');
  const taskActionsMenu = document.getElementById('taskActionsMenu');

  function toggleMoreButton(moreBtn) {
    // Organization menu: always visible (has Add option)
    // Project menu: visible when org is selected
    // Task menu: visible when project is selected
    const isOrgButton = moreBtn === moreOrgBtn;
    const isProjButton = moreBtn === moreProjBtn;
    const isTaskButton = moreBtn === moreTaskBtn;
    
    if (isOrgButton) {
      // Always show organization menu
      moreBtn.classList.remove('hidden');
    } else if (isProjButton) {
      // Show project menu when org is selected
      const orgSelected = organizationSelect.value;
      if (orgSelected) {
        moreBtn.classList.remove('hidden');
      } else {
        moreBtn.classList.add('hidden');
      }
    } else if (isTaskButton) {
      // Show task menu when project is selected
      const projSelected = projectSelect.value;
      if (projSelected) {
        moreBtn.classList.remove('hidden');
      } else {
        moreBtn.classList.add('hidden');
      }
    }
  }
  
  function updateMenuActions() {
    // Organization menu actions
    const orgSelected = organizationSelect.value;
    const editOrgAction = document.getElementById('editOrganizationAction');
    const deleteOrgAction = document.getElementById('deleteOrganizationAction');
    if (orgSelected) {
      editOrgAction?.classList.remove('hidden');
      deleteOrgAction?.classList.remove('hidden');
    } else {
      editOrgAction?.classList.add('hidden');
      deleteOrgAction?.classList.add('hidden');
    }
    
    // Project menu actions
    const projSelected = projectSelect.value;
    const editProjAction = document.getElementById('editProjectAction');
    const deleteProjAction = document.getElementById('deleteProjectAction');
    if (projSelected) {
      editProjAction?.classList.remove('hidden');
      deleteProjAction?.classList.remove('hidden');
    } else {
      editProjAction?.classList.add('hidden');
      deleteProjAction?.classList.add('hidden');
    }
    
    // Task menu actions
    const taskSelected = taskSelect.value;
    const editTaskAction = document.getElementById('editTaskAction');
    const deleteTaskAction = document.getElementById('deleteTaskAction');
    if (taskSelected) {
      editTaskAction?.classList.remove('hidden');
      deleteTaskAction?.classList.remove('hidden');
    } else {
      editTaskAction?.classList.add('hidden');
      deleteTaskAction?.classList.add('hidden');
    }
  }

  function closeAllMenus() {
    orgActionsMenu?.classList.add('hidden');
    projActionsMenu?.classList.add('hidden');
    taskActionsMenu?.classList.add('hidden');
  }

  function toggleMenu(menuElement) {
    const isHidden = menuElement.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) {
      menuElement.classList.remove('hidden');
    }
  }

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn--more') && !e.target.closest('.actions-menu')) {
      closeAllMenus();
    }
  });

  // More options button handlers
  moreOrgBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(orgActionsMenu);
  });

  moreProjBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(projActionsMenu);
  });

  moreTaskBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(taskActionsMenu);
  });

  // Action menu item handlers
  document.querySelectorAll('.actions-menu__item').forEach(item => {
    item.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      closeAllMenus();
      
      // Trigger the appropriate action with validation
      if (action === 'add-organization') {
        document.getElementById('addOrganizationBtn')?.click();
      } else if (action === 'edit-organization') {
        if (!organizationSelect.value) {
          showToast('Please select an organization to edit');
          return;
        }
        document.getElementById('editOrganizationBtn')?.click();
      } else if (action === 'delete-organization') {
        if (!organizationSelect.value) {
          showToast('Please select an organization to delete');
          return;
        }
        document.getElementById('deleteOrganizationBtn')?.click();
      } else if (action === 'add-project') {
        if (!organizationSelect.value) {
          showToast('Please select an organization first');
          return;
        }
        document.getElementById('addProjectBtn')?.click();
      } else if (action === 'edit-project') {
        if (!projectSelect.value) {
          showToast('Please select a project to edit');
          return;
        }
        document.getElementById('editProjectBtn')?.click();
      } else if (action === 'delete-project') {
        if (!projectSelect.value) {
          showToast('Please select a project to delete');
          return;
        }
        document.getElementById('deleteProjectBtn')?.click();
      } else if (action === 'add-task') {
        if (!projectSelect.value) {
          showToast('Please select a project first');
          return;
        }
        document.getElementById('addTaskBtn')?.click();
      } else if (action === 'edit-task') {
        if (!taskSelect.value) {
          showToast('Please select a task to edit');
          return;
        }
        document.getElementById('editTaskBtn')?.click();
      } else if (action === 'delete-task') {
        if (!taskSelect.value) {
          showToast('Please select a task to delete');
          return;
        }
        document.getElementById('deleteTaskBtn')?.click();
      }
    });
  });

  // Timer buttons
  startButton.addEventListener('click', startTimer);
  stopButton.addEventListener('click', stopTimer);
  resumeButton.addEventListener('click', resumeTimer);

  initializeTimerSync();

  // Organization, Project, Task selection
  organizationSelect.addEventListener('change', async () => {
    const orgId = organizationSelect.value;
    toggleMoreButton(moreOrgBtn);
    updateMenuActions();
    
    if (orgId) {
      await loadProjects(orgId);
    } else {
      projectSelect.innerHTML = '<option value="">Select Project</option>';
      toggleMoreButton(moreProjBtn);
    }
    taskSelect.innerHTML = '<option value="">Select Task</option>';
    toggleMoreButton(moreTaskBtn);
    updateMenuActions();
    closeAllMenus();
    loadAggregatedData();
    
    // Save state
    saveSelectionState(orgId, '', '');
  });

  projectSelect.addEventListener('change', async () => {
    const projId = projectSelect.value;
    toggleMoreButton(moreProjBtn);
    updateMenuActions();
    
    if (projId) {
      await loadTasks(projId);
      toggleMoreButton(moreTaskBtn);  // Show task menu when project selected
    } else {
      taskSelect.innerHTML = '<option value="">Select Task</option>';
      toggleMoreButton(moreTaskBtn);  // Hide task menu when no project
    }
    updateMenuActions();
    closeAllMenus();
    loadAggregatedData();
    
    // Save state
    const orgId = organizationSelect.value;
    saveSelectionState(orgId, projId, '');
  });

  taskSelect.addEventListener('change', () => {
    toggleMoreButton(moreTaskBtn);
    updateMenuActions();
    closeAllMenus();
    loadAggregatedData();
    
    // Save state
    const orgId = organizationSelect.value;
    const projId = projectSelect.value;
    const taskId = taskSelect.value;
    saveSelectionState(orgId, projId, taskId);
  });

  // Initialize generic modal
  initializeModal();
  
  // Initialize the organization more button visibility and menu actions
  toggleMoreButton(moreOrgBtn);
  updateMenuActions();

  // View Organization Work - pass selected org if available
  viewOrganizationWorkBtn.addEventListener('click', () => {
    const selectedOrgId = organizationSelect.value;
    const selectedProjId = projectSelect.value;
    const selectedTaskId = taskSelect.value;
    
    console.log('Opening Task Management with:', { selectedOrgId, selectedProjId, selectedTaskId });
    
    // Build URL with selected values
    const params = new URLSearchParams();
    if (selectedOrgId) params.append('organizationId', selectedOrgId);
    if (selectedProjId) params.append('projectId', selectedProjId);
    if (selectedTaskId) params.append('taskId', selectedTaskId);
    
    const queryString = params.toString();
    const url = queryString ? `organizationView.html?${queryString}` : 'organizationView.html';
    console.log('Navigating to:', url);
    window.location.href = url;
  });
}
