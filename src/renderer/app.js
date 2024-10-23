// src/renderer/app.js
import { setupEventListeners } from './events.js';
import { loadOrganizations, loadAggregatedData } from './dataLoader.js';

export function initializeApp() {
  loadOrganizations();
  loadAggregatedData();
  setupEventListeners();
}
