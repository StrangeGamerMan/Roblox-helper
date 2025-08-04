// Main content script for Roblox Pro Extension

class RobloxPro {
  constructor() {
    this.settings = {};
    this.gameData = {};
    this.serverData = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.injectCSS();
    this.createUI();
    this.setupEventListeners();
    this.startFeatures();
  }

  async loadSettings() {
    this.settings = await RobloxUtils.getStorageData([
      'autoJoinEnabled', 'serverHopEnabled', 'playerCountThreshold',
      'antiAfkEnabled', 'customTheme', 'notifications', 'toolbarPosition', 'compactMode'
    ]);
  }

  injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .roblox-pro-toolbar {
        position: fixed;
        top: 60px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        padding: 15px;
        border-radius: 10px;
        z-index: 10000;
        color: white;
        font-family: Arial, sans-serif;
        min-width: 200px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .roblox-pro-btn {
        background: #00b2ff;
        border: none;
        color: white;
        padding: 8px 12px;
        margin: 2px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
      }
      
      .roblox-pro-btn:hover {
        background: #0095d9;
        transform: translateY(-1px);
      }
      
      .roblox-pro-btn.danger {
        background: #ff4757;
      }
      
      .roblox-pro-btn.success {
        background: #2ed573;
      }
      
      .roblox-pro-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        padding: 20px;
        border-radius: 10px;
        z-index: 10001;
        color: white;
        min-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .roblox-pro-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
      }
      
      .roblox-pro-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      
      .roblox-pro-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ed573;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10002;
        transform: translateX(400px);
        transition: transform 0.3s;
      }
      
      .roblox-pro-notification.show {
        transform: translateX(0);
      }
      
      .roblox-pro-notification.error {
        background: #ff4757;
      }
      
      .roblox-pro-server-info {
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 5px;
        margin: 5px 0;
      }
      
      .roblox-pro-player-list {
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 5px;
      }
      
      .roblox-pro-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 10px 0;
      }
      
      .roblox-pro-stat {
        background: rgba(0, 0, 0, 0.3);
        padding: 8px;
        border-radius: 5px;
        text-align: center;
      }
      
      .roblox-pro-game-card {
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .roblox-pro-toggle {
        display: flex;
        align-items: center;
        margin: 5px 0;
      }
      
      .roblox-pro-toggle input {
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
    
    // Apply theme and position
    this.applyTheme();
    this.applyPosition();
  }

  applyTheme() {
    document.body.classList.add(`roblox-pro-theme-${this.settings.customTheme || 'dark'}`);
  }

  applyPosition() {
    const position = this.settings.toolbarPosition || 'top-right';
    if (this.toolbar) {
      this.toolbar.className = `roblox-pro-toolbar ${position}`;
      if (this.settings.compactMode) {
        this.toolbar.classList.add('compact');
      }
    }
  }

  createUI() {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'roblox-pro-toolbar';
    this.toolbar.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #00b2ff;">🚀 Roblox Pro</h4>
      <div id="roblox-pro-buttons"></div>
      <div id="roblox-pro-info" style="margin-top: 10px; font-size: 11px; opacity: 0.8;"></div>
    `;
    
    document.body.appendChild(this.toolbar);
    this.createButtons();
    this.updateInfo();
    this.applyPosition();
  }

  createButtons() {
    const buttonsContainer = document.getElementById('roblox-pro-buttons');
    
    // Server Hop Button
    const serverHopBtn = RobloxUtils.createButton('🔄 Server Hop', 'success', () => {
      this.serverHop();
    });
    
    // Auto Join Button
    const autoJoinBtn = RobloxUtils.createButton('⚡ Auto Join', '', () => {
      this.autoJoinBestServer();
    });
    
    // Player Tracker Button
    const playerTrackerBtn = RobloxUtils.createButton('👥 Players', '', () => {
      this.showPlayerTracker();
    });
    
    // Game Stats Button
    const gameStatsBtn = RobloxUtils.createButton('📊 Stats', '', () => {
      this.showGameStats();
    });
    
    // Server List Button
    const serverListBtn = RobloxUtils.createButton('🌐 Servers', '', () => {
      this.showServerList();
    });
    
    // Settings Button
    const settingsBtn = RobloxUtils.createButton('⚙️ Settings', '', () => {
      this.showSettings();
    });
    
    // Anti-AFK Toggle
    const antiAfkBtn = RobloxUtils.createButton('😴 Anti-AFK', this.settings.antiAfkEnabled ? 'success' : '', () => {
      this.toggleAntiAfk();
    });

    buttonsContainer.appendChild(serverHopBtn);
    buttonsContainer.appendChild(autoJoinBtn);
    buttonsContainer.appendChild(playerTrackerBtn);
    buttonsContainer.appendChild(gameStatsBtn);
    buttonsContainer.appendChild(serverListBtn);
    buttonsContainer.appendChild(antiAfkBtn);
    buttonsContainer.appendChild(settingsBtn);
  }

  async serverHop() {
    if (!this.settings.serverHopEnabled) {
      RobloxUtils.showNotification('Server hopping is disabled', 'error');
      return;
    }

    const gameId = RobloxUtils.getCurrentGameId();
    if (!gameId) {
      RobloxUtils.showNotification('Could not find game ID', 'error');
      return;
    }

    RobloxUtils.showNotification('Finding new server...', 'info');
    
    try {
      const servers = await this.getGameServers(gameId);
      const currentUrl = window.location.href;
      const bestServer = servers.find(server => 
        server.playing < server.maxPlayers - 2 && 
        server.playing >= this.settings.playerCountThreshold &&
        !currentUrl.includes(server.id)
      );

      if (bestServer) {
        window.location.href = `https://www.roblox.com/games/${gameId}?privateServerLinkCode=${bestServer.id}`;
      } else {
        RobloxUtils.showNotification('No better servers found', 'error');
      }
    } catch (error) {
      RobloxUtils.showNotification('Failed to find servers', 'error');
    }
  }

  async autoJoinBestServer() {
    const gameId = RobloxUtils.getCurrentGameId();
    if (!gameId) {
      RobloxUtils.showNotification('Could not find game ID', 'error');
      return;
    }

    try {
      const servers = await this.getGameServers(gameId);
      const bestServer = servers
        .filter(server => server.playing < server.maxPlayers - 1)
        .sort((a, b) => Math.abs(a.playing - this.settings.playerCountThreshold) - Math.abs(b.playing - this.settings.playerCountThreshold))[0];

      if (bestServer) {
        if (typeof Roblox !== 'undefined' && Roblox.GameLauncher) {
          Roblox.GameLauncher.joinGameInstance(gameId, bestServer.id);
        }
        RobloxUtils.showNotification(`Joining server with ${bestServer.playing} players`, 'success');
      } else {
        RobloxUtils.showNotification('No suitable servers found', 'error');
      }
    } catch (error) {
      RobloxUtils.showNotification('Failed to join server', 'error');
    }
  }

  async getGameServers(gameId) {
    // Mock implementation - in real version would call Roblox API
    return [
      { id: '123', playing: 15, maxPlayers: 20, ping: 45 },
      { id: '456', playing: 8, maxPlayers: 20, ping: 67 },
      { id: '789', playing: 18, maxPlayers: 20, ping: 23 }
    ];
  }

  showPlayerTracker() {
    const content = `
      <div class="roblox-pro-player-list">
        <h4>Current Server Players</h4>
        <div id="player-list-content">Loading players...</div>
      </div>
      <div class="roblox-pro-stats">
        <div class="roblox-pro-stat">
          <div><strong>Players Online</strong></div>
          <div id="players-count">--</div>
        </div>
        <div class="roblox-pro-stat">
          <div><strong>Server Region</strong></div>
          <div id="server-region">Unknown</div>
        </div>
      </div>
      <div class="roblox-pro-game-card">
        <h4>Player Actions</h4>
        <button class="roblox-pro-btn" onclick="robloxPro.refreshPlayerList()">🔄 Refresh List</button>
        <button class="roblox-pro-btn success" onclick="robloxPro.exportPlayerList()">📋 Export List</button>
      </div>
    `;
    
    const panel = RobloxUtils.createPanel('👥 Player Tracker', content);
    document.body.appendChild(panel);
    
    this.loadPlayerData();
  }

  showGameStats() {
    const content = `
      <div class="roblox-pro-stats">
        <div class="roblox-pro-stat">
          <div><strong>Visits</strong></div>
          <div id="game-visits">Loading...</div>
        </div>
        <div class="roblox-pro-stat">
          <div><strong>Favorites</strong></div>
          <div id="game-favorites">Loading...</div>
        </div>
        <div class="roblox-pro-stat">
          <div><strong>Rating</strong></div>
          <div id="game-rating">Loading...</div>
        </div>
        <div class="roblox-pro-stat">
          <div><strong>Created</strong></div>
          <div id="game-created">Loading...</div>
        </div>
      </div>
      <div class="roblox-pro-game-card">
        <h4>Quick Actions</h4>
        <button class="roblox-pro-btn" onclick="robloxPro.copyGameLink()">📋 Copy Game Link</button>
        <button class="roblox-pro-btn success" onclick="robloxPro.favoriteGame()">⭐ Add to Favorites</button>
        <button class="roblox-pro-btn" onclick="robloxPro.shareGame()">🔗 Share Game</button>
      </div>
    `;
    
    const panel = RobloxUtils.createPanel('📊 Game Statistics', content);
    document.body.appendChild(panel);
    
    this.loadGameStats();
  }

  showServerList() {
    const content = `
      <div class="roblox-pro-server-list" id="server-list">
        <div class="roblox-pro-loading">Loading servers...</div>
      </div>
      <div class="roblox-pro-game-card">
        <h4>Server Options</h4>
        <button class="roblox-pro-btn" onclick="robloxPro.refreshServerList()">🔄 Refresh</button>
        <button class="roblox-pro-btn success" onclick="robloxPro.joinBestServer()">⚡ Join Best</button>
        <button class="roblox-pro-btn" onclick="robloxPro.joinRandomServer()">🎲 Join Random</button>
      </div>
    `;
    
    const panel = RobloxUtils.createPanel('🌐 Server Browser', content);
    document.body.appendChild(panel);
    
    this.loadServerList();
  }

  showSettings() {
    const content = `
      <div class="roblox-pro-toggle">
        <input type="checkbox" id="autoJoinToggle" ${this.settings.autoJoinEnabled ? 'checked' : ''}>
        <label for="autoJoinToggle">Enable Auto-Join</label>
      </div>
      <div class="roblox-pro-toggle">
        <input type="checkbox" id="serverHopToggle" ${this.settings.serverHopEnabled ? 'checked' : ''}>
        <label for="serverHopToggle">Enable Server Hopping</label>
      </div>
      <div class="roblox-pro-toggle">
        <input type="checkbox" id="antiAfkToggle" ${this.settings.antiAfkEnabled ? 'checked' : ''}>
        <label for="antiAfkToggle">Enable Anti-AFK</label>
      </div>
      <div class="roblox-pro-toggle">
        <input type="checkbox" id="notificationsToggle" ${this.settings.notifications ? 'checked' : ''}>
        <label for="notificationsToggle">Enable Notifications</label>
      </div>
      <div style="margin: 15px 0;">
        <label for="playerThreshold">Player Count Threshold: </label>
        <input type="number" id="playerThreshold" value="${this.settings.playerCountThreshold}" min="1" max="50" style="width: 60px;">
      </div>
      <div style="margin: 15px 0;">
        <label for="themeSelect">Theme: </label>
        <select id="themeSelect" style="padding: 5px;">
          <option value="dark" ${this.settings.customTheme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="light" ${this.settings.customTheme === 'light' ? 'selected' : ''}>Light</option>
          <option value="blue" ${this.settings.customTheme === 'blue' ? 'selected' : ''}>Blue</option>
          <option value="purple" ${this.settings.customTheme === 'purple' ? 'selected' : ''}>Purple</option>
          <option value="green" ${this.settings.customTheme === 'green' ? 'selected' : ''}>Green</option>
        </select>
      </div>
      <button class="roblox-pro-btn success" onclick="robloxPro.saveSettings()">💾 Save Settings</button>
      <button class="roblox-pro-btn" onclick="robloxPro.openAdvancedSettings()">⚙️ Advanced Settings</button>
    `;
    
    const panel = RobloxUtils.createPanel('⚙️ Quick Settings', content);
    document.body.appendChild(panel);
  }

  async saveSettings() {
    const newSettings = {
      autoJoinEnabled: document.getElementById('autoJoinToggle').checked,
      serverHopEnabled: document.getElementById('serverHopToggle').checked,
      antiAfkEnabled: document.getElementById('antiAfkToggle').checked,
      notifications: document.getElementById('notificationsToggle').checked,
      playerCountThreshold: parseInt(document.getElementById('playerThreshold').value),
      customTheme: document.getElementById('themeSelect').value
    };
    
    await RobloxUtils.setStorageData(newSettings);
    this.settings = { ...this.settings, ...newSettings };
    RobloxUtils.showNotification('Settings saved!', 'success');
    
    // Apply new theme
    document.body.className = document.body.className.replace(/roblox-pro-theme-\w+/g, '');
    this.applyTheme();
    
    // Close settings panel
    document.querySelector('.roblox-pro-panel').remove();
  }

  openAdvancedSettings() {
    chrome.runtime.openOptionsPage();
  }

  toggleAntiAfk() {
    this.settings.antiAfkEnabled = !this.settings.antiAfkEnabled;
    RobloxUtils.setStorageData({ antiAfkEnabled: this.settings.antiAfkEnabled });
    
    if (this.settings.antiAfkEnabled) {
      this.startAntiAfk();
      RobloxUtils.showNotification('Anti-AFK enabled', 'success');
    } else {
      this.stopAntiAfk();
      RobloxUtils.showNotification('Anti-AFK disabled', 'error');
    }
    
    // Update button appearance
    const buttons = document.querySelectorAll('.roblox-pro-btn');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Anti-AFK')) {
        btn.className = `roblox-pro-btn ${this.settings.antiAfkEnabled ? 'success' : ''}`;
      }
    });
  }

  startAntiAfk() {
    if (this.afkInterval) clearInterval(this.afkInterval);
    
    this.afkInterval = setInterval(() => {
      // Simulate small mouse movements
      const event = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: Math.random() * 10,
        clientY: Math.random() * 10
      });
      document.dispatchEvent(event);
      
      // Simulate key press
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Shift',
        code: 'ShiftLeft',
        bubbles: true
      });
      document.dispatchEvent(keyEvent);
    }, 60000); // Every minute
  }

  stopAntiAfk() {
    if (this.afkInterval) {
      clearInterval(this.afkInterval);
      this.afkInterval = null;
    }
  }

  loadPlayerData() {
    // Mock player data loading
    setTimeout(() => {
      const playerList = document.getElementById('player-list-content');
      if (playerList) {
        playerList.innerHTML = `
          <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">🟢 Player1 - Level 50</div>
          <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">🟢 Player2 - Level 32</div>
          <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">🟡 Player3 - Level 18</div>
          <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">🔴 Player4 - Level 5</div>
        `;
      }
      
      const playersCount = document.getElementById('players-count');
      if (playersCount) playersCount.textContent = '15/20';
      
      const serverRegion = document.getElementById('server-region');
      if (serverRegion) serverRegion.textContent = 'US East';
    }, 1000);
  }

  loadGameStats() {
    // Mock game stats loading
    setTimeout(() => {
      const visits = document.getElementById('game-visits');
      if (visits) visits.textContent = RobloxUtils.formatNumber(1234567);
      
      const favorites = document.getElementById('game-favorites');
      if (favorites) favorites.textContent = RobloxUtils.formatNumber(89456);
      
      const rating = document.getElementById('game-rating');
      if (rating) rating.textContent = '94% 👍';
      
      const created = document.getElementById('game-created');
      if (created) created.textContent = '2 years ago';
    }, 1000);
  }

  loadServerList() {
    setTimeout(() => {
      const serverList = document.getElementById('server-list');
      if (serverList) {
        serverList.innerHTML = `
          <div class="roblox-pro-server-item">
            <div class="roblox-pro-server-info">
              <div class="roblox-pro-server-players">15/20 Players</div>
              <div class="roblox-pro-server-ping">Ping: 45ms</div>
            </div>
            <button class="roblox-pro-btn success" onclick="robloxPro.joinServer('123')">Join</button>
          </div>
          <div class="roblox-pro-server-item">
            <div class="roblox-pro-server-info">
              <div class="roblox-pro-server-players">8/20 Players</div>
              <div class="roblox-pro-server-ping">Ping: 67ms</div>
            </div>
            <button class="roblox-pro-btn success" onclick="robloxPro.joinServer('456')">Join</button>
          </div>
          <div class="roblox-pro-server-item">
            <div class="roblox-pro-server-info">
              <div class="roblox-pro-server-players">18/20 Players</div>
              <div class="roblox-pro-server-ping">Ping: 23ms</div>
            </div>
            <button class="roblox-pro-btn success" onclick="robloxPro.joinServer('789')">Join</button>
          </div>
        `;
      }
    }, 1000);
  }

  updateInfo() {
    const infoDiv = document.getElementById('roblox-pro-info');
    if (infoDiv) {
      const gameId = RobloxUtils.getCurrentGameId();
      const userId = RobloxUtils.getCurrentUserId();
      infoDiv.innerHTML = `
        Game ID: ${gameId || 'N/A'}<br>
        User ID: ${userId || 'N/A'}<br>
        Status: Ready
      `;
    }
  }

  setupEventListeners() {
    // Make functions available globally for onclick handlers
    window.robloxPro = this;
    
    // Listen for page changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.updateInfo(), 1000);
      }
    }).observe(document, {subtree: true, childList: true});
  }

  startFeatures() {
    // Start anti-AFK if enabled
    if (this.settings.antiAfkEnabled) {
      this.startAntiAfk();
    }
    
    // Auto-join logic for game pages
    if (this.settings.autoJoinEnabled && window.location.href.includes('/games/')) {
      setTimeout(() => {
        const playButton = document.querySelector('[data-testid="play-button"]') || 
                          document.querySelector('.btn-primary-lg') ||
                          document.querySelector('.btn-primary-md');
        if (playButton && !playButton.disabled) {
          // Auto-click play button with small delay
          setTimeout(() => playButton.click(), 2000);
        }
      }, 3000);
    }
  }

  // Additional utility methods
  copyGameLink() {
    navigator.clipboard.writeText(window.location.href);
    RobloxUtils.showNotification('Game link copied!', 'success');
  }

  favoriteGame() {
    // This would interact with Roblox's favorite system
    RobloxUtils.showNotification('Added to favorites!', 'success');
  }

  shareGame() {
    const gameTitle = document.title.replace(' - Roblox', '');
    const shareText = `Check out this awesome Roblox game: ${gameTitle} ${window.location.href}`;
    navigator.clipboard.writeText(shareText);
    RobloxUtils.showNotification('Share text copied!', 'success');
  }

  refreshPlayerList() {
    RobloxUtils.showNotification('Refreshing player list...', 'info');
    this.loadPlayerData();
  }

  exportPlayerList() {
    const playerData = "Player1,Level 50\nPlayer2,Level 32\nPlayer3,Level 18\nPlayer4,Level 5";
    const blob = new Blob([playerData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roblox_players.csv';
    a.click();
    RobloxUtils.showNotification('Player list exported!', 'success');
  }

  refreshServerList() {
    RobloxUtils.showNotification('Refreshing servers...', 'info');
    this.loadServerList();
  }

  joinBestServer() {
    RobloxUtils.showNotification('Joining best server...', 'success');
    // Implementation would join the server with best ping/player ratio
  }

  joinRandomServer() {
    RobloxUtils.showNotification('Joining random server...', 'success');
    // Implementation would join a random server
  }

  joinServer(serverId) {
    RobloxUtils.showNotification(`Joining server ${serverId}...`, 'success');
    // Implementation would join specific server
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RobloxPro();
  });
} else {
  new RobloxPro();
}
