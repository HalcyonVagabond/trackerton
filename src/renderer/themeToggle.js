// Theme Toggle Manager
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    // Apply stored theme on load
    this.applyTheme(this.currentTheme);

    // Set up event listeners
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.openSettings());
    document.getElementById('settingsCloseBtn')?.addEventListener('click', () => this.closeSettings());
    document.getElementById('lightThemeBtn')?.addEventListener('click', () => this.setTheme('light'));
    document.getElementById('darkThemeBtn')?.addEventListener('click', () => this.setTheme('dark'));

    // Close settings modal when clicking outside
    document.getElementById('settingsModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') {
        this.closeSettings();
      }
    });

    // Update active theme button
    this.updateThemeButtons();
  }

  getStoredTheme() {
    return localStorage.getItem('trackerton-theme');
  }

  setStoredTheme(theme) {
    localStorage.setItem('trackerton-theme', theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.setStoredTheme(theme);
    this.updateThemeButtons();

    // Broadcast theme change to menu bar popup
    if (window.electronAPI?.sendThemeChange) {
      window.electronAPI.sendThemeChange(theme);
    }
  }

  setTheme(theme) {
    this.applyTheme(theme);
  }

  updateThemeButtons() {
    const lightBtn = document.getElementById('lightThemeBtn');
    const darkBtn = document.getElementById('darkThemeBtn');

    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle('active', this.currentTheme === 'light');
      darkBtn.classList.toggle('active', this.currentTheme === 'dark');
    }
  }

  openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}

export default ThemeManager;
