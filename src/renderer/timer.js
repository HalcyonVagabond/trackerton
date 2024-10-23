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

export function startTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  startButton.disabled = true;
  stopButton.disabled = false;
  resumeButton.disabled = true;
}

export function stopTimer() {
  clearInterval(timerInterval);
  saveTimeEntry();
  resetTimer();
}

export function resumeTimer() {
  if (!validateSelections()) return;

  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimerDisplay, 1000);

  startButton.disabled = true;
  stopButton.disabled = false;
  resumeButton.disabled = true;
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
  currentTaskId = taskSelect.value;
  if (currentTaskId) {
    const totalDuration = await window.electronAPI.getTotalDurationByTask(currentTaskId);
    elapsedTime = totalDuration || 0;
    previousElapsedTime = elapsedTime;
    timerDisplay.textContent = timeToString(elapsedTime);

    if (elapsedTime > 0) {
      resumeButton.disabled = false;
      startButton.disabled = true;
    } else {
      resumeButton.disabled = true;
      startButton.disabled = false;
    }

    stopButton.disabled = true;
  } else {
    resetTimer();
  }
});
