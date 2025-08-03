// popup.js
// The main frontend script that talks to background.js and updates the UI dynamically

class RobloxAlivePlus {
  constructor() {
    this.settings = {
      tradeLossThreshold: 50,
      tradeAutoDecline: true,
      outboundTradeProtection: true,
      outboundTradeCancelThreshold: 1000000,
      roproThemeColor: '#00a2ff'
    };

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupThemePicker();
    this.initUISections();
    this.loadMostPlayedGames();
    this.loadQuickPlay();
    this.loadEnhancedGameStats();
    this.loadServerInfo();
    this.loadAvatarSandbox();
    this.loadMutualsOnFriendsPage();
    this.loadTradeTools();
    this.loadAccountValue();
    this.setupSettingsButton();
    this.setupTradeAutoDeclineListener();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['rblxAliveSettings'], (result) => {
        if (result.rblxAliveSettings) {
          Object.assign(this.settings, result.rblxAliveSettings);
        }
        resolve();
      });
    });
  }

  saveSettings() {
    chrome.storage.local.set({ rblxAliveSettings: this.settings });
    chrome.runtime.sendMessage({ action: 'updateSettings', settings: this.settings });
  }

  setupThemePicker() {
    const container = document.getElementById('ropro-theme-color-picker');
    const input = document.createElement('input');
    input.type = 'color';
    input.value = this.settings.roproThemeColor;
    input.addEventListener('input', (e) => {
      this.settings.roproThemeColor = e.target.value;
      document.documentElement.style.setProperty('--ropro-theme-color', this.settings.roproThemeColor);
      this.saveSettings();
    });
    container.appendChild(input);
    document.documentElement.style.setProperty('--ropro-theme-color', this.settings.roproThemeColor);
  }

  async initUISections() {
    // Initialize sections placeholders or skeleton loaders here if needed
  }

  async loadMostPlayedGames() {
    const mostPlayedSection = document.getElementById('most-played-section');
    // Fetch play history from storage or API (mock here)
    const playHistory = await this.fetchPlayHistory();
    mostPlayedSection.innerHTML = '<h2>Most Played Games</h2>';
    // Render play history list
    playHistory.forEach(game => {
      const div = document.createElement('div');
      div.textContent = `${game.name} — Played ${game.playCount} times`;
      mostPlayedSection.appendChild(div);
    });
  }

  async fetchPlayHistory() {
    // Mock returning recent games data, should be from your actual API or storage
    return [
      { name: 'Super Power Simulator', playCount: 24 },
      { name: 'Mega Build Battle', playCount: 15 },
      { name: 'Trade Tycoon', playCount: 9 }
    ];
  }

  async loadQuickPlay() {
    // Example quick play setup - could be clickable game list or search
    const quickPlaySection = document.getElementById('quick-play-section');
    quickPlaySection.innerHTML = '<h2>Quick Play</h2>';
    // Add quick play buttons or search here
  }

  async loadEnhancedGameStats() {
    const enhancedStats = document.getElementById('enhanced-game-stats');
    enhancedStats.innerHTML = '<h2>Enhanced Game Stats</h2>';
    // Pull data from background or APIs and display
  }

  async loadServerInfo() {
    const serverInfoSection = document.getElementById('server-info');
    serverInfoSection.innerHTML = '<h2>Server Info</h2>';

    // Example universeId from current tab URL or mock
    const universeId = await this.getUniverseIdFromTab();
    if (!universeId) {
      serverInfoSection.textContent = 'Could not determine Universe ID.';
      return;
    }

    const stats = await this.getGameStats(universeId);
    if (!stats) {
      serverInfoSection.textContent = 'Could not fetch server info.';
      return;
    }

    const { gameInfo, voteInfo } = stats;

    const uptime = this.calculateUptime(gameInfo.created); // mock
    serverInfoSection.innerHTML += `<p>Region: ${gameInfo && gameInfo.playableDevices ? 'Global' : 'Unknown'}</p>`;
    serverInfoSection.innerHTML += `<p>Version: ${gameInfo && gameInfo.created ? new Date(gameInfo.created).toLocaleString() : 'N/A'}</p>`;
    serverInfoSection.innerHTML += `<p>Uptime: ${uptime}</p>`;
  }

  calculateUptime(startDateStr) {
    if (!startDateStr) return 'N/A';
    const startDate = new Date(startDateStr);
    const diffMs = Date.now() - startDate.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
    return `${diffHours}h ${diffMinutes}m`;
  }

  async getUniverseIdFromTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (!url) {
          resolve(null);
          return;
        }
        const match = url.match(/games\.roblox\.com\/v1\/games\/games\/(\d+)/) || url.match(/games\/(\d+)/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    });
  }

  async getGameStats(universeId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getGameStats', universeId }, (response) => {
        resolve(response);
      });
    });
  }

  async loadAvatarSandbox() {
    const avatarSandboxSection = document.getElementById('avatar-sandbox');
    avatarSandboxSection.innerHTML = '<h2>Avatar Sandbox</h2>';
    // Save/load outfits UI here
    // Use chrome.storage to save/load outfit JSON objects

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Current Outfit';
    avatarSandboxSection.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Saved Outfits';
    avatarSandboxSection.appendChild(loadBtn);

    saveBtn.addEventListener('click', () => {
      // Dummy save: get current outfit data from page or API
      const outfitData = { timestamp: Date.now(), items: ['Hat1', 'Shirt2', 'Pants3'] };
      chrome.storage.local.get({ outfits: [] }, (data) => {
        const newOutfits = [...data.outfits, outfitData];
        chrome.storage.local.set({ outfits: newOutfits }, () => {
          alert('Outfit saved!');
        });
      });
    });

    loadBtn.addEventListener('click', () => {
      chrome.storage.local.get({ outfits: [] }, (data) => {
        alert('Saved outfits:\n' + JSON.stringify(data.outfits, null, 2));
      });
    });
  }

  async loadMutualsOnFriendsPage() {
    const mutualsSection = document.getElementById('friends-mutuals');
    mutualsSection.innerHTML = '<h2>More Mutuals on Friends Page</h2>';

    // Would require content script injection on friends page to scrape mutuals and send message here
    mutualsSection.innerHTML += '<p>Feature loading... (requires page content scripts)</p>';
  }

  async loadTradeTools() {
    const tradeToolsSection = document.getElementById('trade-tools');
    tradeToolsSection.innerHTML = '<h2>Trade Tools</h2>';

    // Example buttons
    const calcValueBtn = document.createElement('button');
    calcValueBtn.textContent = 'Calculate Trade Value';
    tradeToolsSection.appendChild(calcValueBtn);

    const searchTradesBtn = document.createElement('button');
    searchTradesBtn.textContent = 'Advanced Trade Search';
    tradeToolsSection.appendChild(searchTradesBtn);

    calcValueBtn.addEventListener('click', () => {
      alert('Calculating trade value... (mock)');
    });

    searchTradesBtn.addEventListener('click', () => {
      alert('Opening advanced trade search... (mock)');
    });
  }

  async loadAccountValue() {
    const accountValueSection = document.getElementById('account-value');
    accountValueSection.innerHTML = '<h2>Account Value</h2>';

    // Example user ID extraction from current profile tab
    const userId = await this.getUserIdFromProfileTab();
    if (!userId) {
      accountValueSection.textContent = 'Could not find user ID.';
      return;
    }

    const valueData = await this.getAccountValue(userId);
    if (!valueData) {
      accountValueSection.textContent = 'Could not fetch account value.';
      return;
    }

    accountValueSection.innerHTML += `<p>Total Value: ${valueData.totalValue || 'N/A'}</p>`;
  }

  async getUserIdFromProfileTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (!url) {
          resolve(null);
          return;
        }
        const match = url.match(/users\/(\d+)/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    });
  }

  async getAccountValue(userId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getAccountValue', userId }, (response) => {
        resolve(response);
      });
    });
  }

  setupSettingsButton() {
    document.getElementById('settings-btn').addEventListener('click', () => {
      alert(`Settings:\nTrade Auto Decline: ${this.settings.tradeAutoDecline}\nTrade Loss Threshold: ${this.settings.tradeLossThreshold}%\nOutbound Trade Protection: ${this.settings.outboundTradeProtection}\nOutbound Cancel Threshold: ${this.settings.outboundTradeCancelThreshold}`);
    });
  }

  setupTradeAutoDeclineListener() {
    // Listen for trade auto-decline commands from popup UI or content scripts
    chrome.runtime.onMessage.addListener((msg, sender, respond) => {
      if (msg.action === "triggerAutoDecline") {
        if (this.settings.tradeAutoDecline) {
          // Trigger background auto-decline logic
          chrome.runtime.sendMessage({ action: 'autoDeclineTrade' }, (response) => {
            alert(response.message);
            respond(response);
          });
          return true;
        } else {
          alert('Trade auto-decline is disabled.');
          respond({ success: false });
        }
      }
    });
  }
}

window.onload = () => {
  new RobloxAlivePlus();
};
