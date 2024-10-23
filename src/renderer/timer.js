import { timeToString } from '../utils/helpers.js';
import { loadAggregatedData } from './dataLoader.js';

let timerInterval;
let startTime;
let elapsedTime = 0;
let previousElapsedTime = 0;
let currentTaskId = null;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resumeButton = document.getElementById('resumeButton');
const timerDisplay = document.getElementById('timerDisplay');
const taskSelect = document.getElementById('task');
const projectSelect = document.getElementById('project');
const organizationSelect = document.getElementById('organization');

export function startTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  startButton.disabled = true;
  startButton.classList.add('hidden');
  stopButton.disabled = false;
  stopButton.classList.remove('hidden');
  resumeButton.disabled = true;
  resumeButton.classList.add('hidden');
}

export function stopTimer() {
  clearInterval(timerInterval);
  saveTimeEntry();
  resetTimer();

  resumeButton.classList.remove('hidden');
  resumeButton.disabled = false;
  
  stopButton.classList.add('hidden');
  startButton.disabled = true;
}

export function resumeTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  startButton.disabled = true;
  stopButton.disabled = false;
  stopButton.classList.remove('hidden');
  resumeButton.disabled = true;
  resumeButton.classList.add('hidden');

}

function hideAllButtons() {
  startButton.classList.add('hidden');
  stopButton.classList.add('hidden');
  resumeButton.classList.add('hidden');
}

function updateTimerDisplay() {
  elapsedTime = Date.now() - startTime;
  timerDisplay.textContent = timeToString(elapsedTime);
}

function resetTimer() {
  clearInterval(timerInterval);
  stopButton.disabled = true;
  if (elapsedTime > 0) {
    startButton.disabled = true;
    resumeButton.disabled = false;
  } else {
    startButton.disabled = false;
    resumeButton.disabled = true;
  }
  timerDisplay.textContent = timeToString(elapsedTime);
}

export async function saveTimeEntry() {
  if (!currentTaskId) return;
  if (elapsedTime === previousElapsedTime) return;
  
  const timeEntry = {
    taskId: currentTaskId,
    duration: elapsedTime - previousElapsedTime,
    timestamp: new Date().toISOString(),
  };

  await window.electronAPI.saveTimeEntry(timeEntry);

  previousElapsedTime = elapsedTime;

  loadAggregatedData();
}

function validateSelections() {
  const organizationSelect = document.getElementById('organization');
  const projectSelect = document.getElementById('project');

  if (!organizationSelect.value) {
    alert('Please select an organization.');
    return false;
  }
  if (!projectSelect.value) {
    alert('Please select a project.');
    return false;
  }
  if (!taskSelect.value) {
    alert('Please select a task.');
    return false;
  }

  currentTaskId = taskSelect.value;
  return true;
}

// Fetch total duration when a task is selected
taskSelect.addEventListener('change', async () => {
  await saveTimeEntry();
  resetTimer();
  currentTaskId = taskSelect.value;
  if (currentTaskId) {
    const totalDuration = await window.electronAPI.getTotalDurationByTask(currentTaskId);
    elapsedTime = totalDuration || 0;
    if (elapsedTime > 0) {
      resumeButton.disabled = false;
      resumeButton.classList.remove('hidden');

      startButton.disabled = true;
    } else {
      resumeButton.disabled = true;
      
      startButton.disabled = false;
      startButton.classList.remove('hidden');
    }
    stopButton.disabled = true;
    stopButton.classList.add('hidden');

    previousElapsedTime = elapsedTime;
    timerDisplay.textContent = timeToString(elapsedTime);

  } else {
    resetTimer();
  }
});

projectSelect.addEventListener('change', async () => {
  await saveTimeEntry();
  resetTimer();
  hideAllButtons(); // Hide all buttons when project is changed
});

organizationSelect.addEventListener('change', async () => {
  await saveTimeEntry();
  resetTimer();
  hideAllButtons(); // Hide all buttons when organization is changed
});