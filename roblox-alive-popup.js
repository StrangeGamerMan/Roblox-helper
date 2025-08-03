// roblox-alive-popup.js - Roblox Alive Core Features v1
class RobloxAliveCore {
  constructor(settings) {
    this.settings = settings;
    this.api = window.RobloxAliveAPI; // Your existing API handler
    this.themeColor = settings.themeColor || '#00a2ff'; // default RoPro blue
  }

  async init() {
    await this.addLiveCounters();
    await this.addServerInfoSection();
    this.addThemeColorCustomizer();
    this.addServerFilters();
    console.log("Roblox Alive: Core features loaded!");
  }

  // --- Live Experience Counters (likes, dislikes, favorites, visits, players) ---
  async addLiveCounters() {
    try {
      const universeId = document.body.dataset.universeId;
      if (!universeId) return;

      const gameDetails = await this.waitForElement('.game-details-container');
      if (!gameDetails || document.querySelector('.rblx-alive-live-counters')) return;

      const [gameInfo, voteInfo, statsInfo] = await Promise.all([
        this.api.getGameInfo(universeId),
        this.api.getGameVotes(universeId),
        this.api.getGameStats(universeId)
      ]);

      if (!gameInfo || !voteInfo || !statsInfo) return;

      const liveCountersEl = document.createElement('div');
      liveCountersEl.className = 'rblx-alive-live-counters';
      liveCountersEl.innerHTML = `
        <div><strong>Likes:</strong> ${voteInfo.upVotes.toLocaleString()}</div>
        <div><strong>Dislikes:</strong> ${voteInfo.downVotes.toLocaleString()}</div>
        <div><strong>Favorites:</strong> ${gameInfo.favoriteCount.toLocaleString()}</div>
        <div><strong>Visits:</strong> ${gameInfo.visits.toLocaleString()}</div>
        <div><strong>Playing Now:</strong> ${gameInfo.playing.toLocaleString()}</div>
      `;

      gameDetails.appendChild(liveCountersEl);
    } catch (e) {
      console.error('Roblox Alive: Failed to add live counters', e);
    }
  }

  // --- Server Region, Version, Uptime Info ---
  async addServerInfoSection() {
    try {
      // Assume you have an API endpoint or data to get this, fake example:
      const universeId = document.body.dataset.universeId;
      if (!universeId) return;

      const gameDetails = await this.waitForElement('.game-details-container');
      if (!gameDetails || document.querySelector('.rblx-alive-server-info')) return;

      // Fetch server info (region, version, uptime) from your API or Roblox endpoint
      const serverInfo = await this.api.getServerInfo(universeId);
      if (!serverInfo) return;

      const serverInfoEl = document.createElement('div');
      serverInfoEl.className = 'rblx-alive-server-info';
      serverInfoEl.innerHTML = `
        <div><strong>Server Region:</strong> ${serverInfo.region || 'Unknown'}</div>
        <div><strong>Version:</strong> ${serverInfo.version || 'N/A'}</div>
        <div><strong>Uptime:</strong> ${this.formatUptime(serverInfo.uptimeSeconds)}</div>
      `;

      gameDetails.appendChild(serverInfoEl);
    } catch (e) {
      console.error('Roblox Alive: Failed to add server info', e);
    }
  }

  formatUptime(seconds) {
    if (!seconds) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  // --- Server Filters (region, connection, uptime) UI ---
  addServerFilters() {
    // Just example UI here, replace or expand with real filter logic and UI updates
    const container = document.querySelector('.game-details-container');
    if (!container || document.querySelector('.rblx-alive-server-filters')) return;

    const filtersEl = document.createElement('div');
    filtersEl.className = 'rblx-alive-server-filters';
    filtersEl.innerHTML = `
      <label>Filter by Region:
        <select id="rblx-alive-filter-region">
          <option value="">All</option>
          <option value="US">US</option>
          <option value="EU">EU</option>
          <option value="ASIA">Asia</option>
        </select>
      </label>
      <label>Filter by Connection:
        <select id="rblx-alive-filter-connection">
          <option value="">All</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Poor">Poor</option>
        </select>
      </label>
      <label>Filter by Uptime:
        <select id="rblx-alive-filter-uptime">
          <option value="">All</option>
          <option value="under1h">Under 1h</option>
          <option value="1-3h">1-3h</option>
          <option value="3+h">3+h</option>
        </select>
      </label>
    `;

    container.appendChild(filtersEl);

    // TODO: Add event listeners for filters & update server list accordingly
  }

  // --- RoPro Theme Color Customization ---
  addThemeColorCustomizer() {
    if (document.querySelector('.rblx-alive-theme-color-picker')) return;

    const header = document.querySelector('header');
    if (!header) return;

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'rblx-alive-theme-color-picker';
    colorPicker.value = this.themeColor;
    colorPicker.title = 'Customize RoPro Theme Color';

    colorPicker.style.marginLeft = '10px';
    colorPicker.style.cursor = 'pointer';

    colorPicker.addEventListener('input', (e) => {
      this.themeColor = e.target.value;
      this.applyThemeColor();
      this.saveThemeColor();
    });

    header.appendChild(colorPicker);
    this.applyThemeColor();
  }

  applyThemeColor() {
    document.documentElement.style.setProperty('--rblx-alive-theme-color', this.themeColor);
  }

  saveThemeColor() {
    chrome.storage.local.set({ rblxAliveThemeColor: this.themeColor });
  }

  async waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(selector)) return resolve(document.querySelector(selector));
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  }
}

// Initialize the core after loading settings
(async () => {
  const settings = await new Promise(resolve => {
    chrome.storage.local.get(['rblxAliveThemeColor'], (result) => {
      resolve({ themeColor: result.rblxAliveThemeColor || '#00a2ff' });
    });
  });

  const robloxAlive = new RobloxAliveCore(settings);
  robloxAlive.init();
})();
