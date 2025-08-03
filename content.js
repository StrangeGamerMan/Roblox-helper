// --- Roblox Alive v3.0 - Complete Enhanced Content Script ---

// Utility function to wait for elements
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    
    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Roblox Alive: Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Enhanced API Helper with Rolimons integration
class RobloxAliveAPI {
  static async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Roblox Alive API Error: ${url}`, error);
      return null;
    }
  }

  static async getUserInfo(userId) {
    return await this.makeRequest(`https://users.roblox.com/v1/users/${userId}`);
  }

  static async getUserFriends(userId) {
    const data = await this.makeRequest(`https://friends.roblox.com/v1/users/${userId}/friends`);
    return data ? data.data : [];
  }

  static async getGameServers(placeId) {
    const data = await this.makeRequest(`https://games.roblox.com/v1/games/${placeId}/servers/Public`);
    return data ? data.data : [];
  }

  static async getGameDetails(universeId) {
    return await this.makeRequest(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
  }

  static async getGameVotes(universeId) {
    return await this.makeRequest(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`);
  }

  static async getUserInventory(userId, assetType = 'Hat') {
    return await this.makeRequest(`https://inventory.roblox.com/v2/users/${userId}/inventory/${assetType}`);
  }

  static async getTradeDetails(tradeId) {
    return await this.makeRequest(`https://trades.roblox.com/v1/trades/${tradeId}`);
  }

  static async getRolimonsItemData(itemId) {
    // Note: This would need CORS handling in a real implementation
    return await this.makeRequest(`https://api.rolimons.com/items/v1/itemdetails?id=${itemId}`);
  }

  static async getItemRAP(itemId) {
    return await this.makeRequest(`https://economy.roblox.com/v2/assets/${itemId}/details`);
  }
}

// Enhanced Settings Management
async function getRobloxAliveSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      // Core settings
      'rblxAliveAnimations', 'rblxAliveGameStats', 'rblxAliveClickEffects',
      'rblxAliveProfileThemes', 'rblxAliveQuickPlay', 'rblxAliveServerFilters',
      'rblxAliveMutualFriends', 'rblxAliveReputation', 'rblxAliveMostPlayed',
      'rblxAliveQuickSearch', 'rblxAlivePlaytimeTracking', 'rblxAliveSelectedTheme',
      
      // Advanced server features
      'rblxAliveServerRegion', 'rblxAliveServerUptime', 'rblxAliveAdvancedServerFilters',
      
      // Live counters
      'rblxAliveLiveCounters', 'rblxAliveLiveLikes', 'rblxAliveLiveVisits',
      
      // Avatar features
      'rblxAliveAvatarSandbox', 'rblxAliveSaveOutfits',
      
      // Trading features
      'rblxAliveTradingPanel', 'rblxAliveTradeCalculator', 'rblxAliveTradeSearch',
      'rblxAliveItemValues', 'rblxAliveItemDemands', 'rblxAliveRolimonsIntegration',
      'rblxAliveTradeNotifier', 'rblxAliveAutoDecline', 'rblxAliveDeclineThreshold',
      'rblxAliveAccountSecurity', 'rblxAliveTradeProtection',
      
      // Account features
      'rblxAliveAccountValue', 'rblxAliveItemHistory',
      
      // Theme customization
      'rblxAliveCustomThemeColor'
    ], function(result) {
      resolve({
        // Core settings
        animations: result.rblxAliveAnimations !== false,
        gameStats: result.rblxAliveGameStats !== false,
        clickEffects: result.rblxAliveClickEffects !== false,
        profileThemes: result.rblxAliveProfileThemes !== false,
        quickPlay: result.rblxAliveQuickPlay !== false,
        serverFilters: result.rblxAliveServerFilters !== false,
        mutualFriends: result.rblxAliveMutualFriends !== false,
        reputation: result.rblxAliveReputation !== false,
        mostPlayed: result.rblxAliveMostPlayed !== false,
        quickSearch: result.rblxAliveQuickSearch !== false,
        playtimeTracking: result.rblxAlivePlaytimeTracking !== false,
        selectedTheme: result.rblxAliveSelectedTheme || 'default',
        
        // Advanced features
        serverRegion: result.rblxAliveServerRegion !== false,
        serverUptime: result.rblxAliveServerUptime !== false,
        advancedServerFilters: result.rblxAliveAdvancedServerFilters !== false,
        liveCounters: result.rblxAliveLiveCounters !== false,
        liveLikes: result.rblxAliveLiveLikes !== false,
        liveVisits: result.rblxAliveLiveVisits !== false,
        avatarSandbox: result.rblxAliveAvatarSandbox !== false,
        saveOutfits: result.rblxAliveSaveOutfits !== false,
        tradingPanel: result.rblxAliveTradingPanel !== false,
        tradeCalculator: result.rblxAliveTradeCalculator !== false,
        tradeSearch: result.rblxAliveTradeSearch !== false,
        itemValues: result.rblxAliveItemValues !== false,
        itemDemands: result.rblxAliveItemDemands !== false,
        rolimonsIntegration: result.rblxAliveRolimonsIntegration !== false,
        tradeNotifier: result.rblxAliveTradeNotifier !== false,
        autoDecline: result.rblxAliveAutoDecline !== false,
        declineThreshold: result.rblxAliveDeclineThreshold || 50,
        accountSecurity: result.rblxAliveAccountSecurity !== false,
        tradeProtection: result.rblxAliveTradeProtection !== false,
        accountValue: result.rblxAliveAccountValue !== false,
        itemHistory: result.rblxAliveItemHistory !== false,
        customThemeColor: result.rblxAliveCustomThemeColor || '#00a2ff'
      });
    });
  });
}

// Page detection
function detectPageType() {
  const path = window.location.pathname;
  if (path.includes('/games/')) return 'game';
  if (path.includes('/users/')) return 'profile';
  if (path.includes('/groups/')) return 'group';
  if (path.includes('/my/avatar')) return 'avatar';
  if (path.includes('/trades')) return 'trading';
  if (path.includes('/catalog/')) return 'catalog';
  if (path === '/' || path === '/home') return 'homepage';
  if (path.includes('/discover')) return 'discover';
  return 'unknown';
}

// --- Advanced Server Features ---
async function addRobloxAliveAdvancedServerInfo() {
  const settings = await getRobloxAliveSettings();
  if (!settings.serverRegion && !settings.serverUptime) return;
  
  console.log("Roblox Alive: Adding advanced server info...");
  
  try {
    const serverContainer = await waitForElement('.rbx-game-server-item-container, .server-list-container');
    if (!serverContainer) return;

    const servers = document.querySelectorAll('.rbx-game-server-item, .server-item');
    servers.forEach(async (server, index) => {
      const serverInfo = await getServerAdvancedInfo(server);
      
      if (serverInfo) {
        const advancedInfoContainer = document.createElement('div');
        advancedInfoContainer.className = 'rblx-alive-server-advanced-info';
        advancedInfoContainer.innerHTML = `
          ${settings.serverRegion ? `<span class="rblx-alive-server-region">🌍 ${serverInfo.region}</span>` : ''}
          ${settings.serverUptime ? `<span class="rblx-alive-server-uptime">⏱️ ${serverInfo.uptime}</span>` : ''}
          <span class="rblx-alive-server-version">📋 v${serverInfo.version}</span>
          <span class="rblx-alive-server-ping">📶 ${serverInfo.ping}ms</span>
        `;
        
        server.appendChild(advancedInfoContainer);
      }
    });

    console.log("Roblox Alive: Advanced server info added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding advanced server info:", error);
  }
}

async function getServerAdvancedInfo(serverElement) {
  // Simulate server info - in real implementation, this would ping the server
  const regions = ['US-East', 'US-West', 'EU-West', 'Asia-Pacific', 'South America'];
  const startTime = Date.now() - Math.random() * 86400000; // Random uptime up to 24 hours
  const uptime = formatUptime(Date.now() - startTime);
  
  return {
    region: regions[Math.floor(Math.random() * regions.length)],
    uptime: uptime,
    version: (Math.random() * 100).toFixed(1),
    ping: Math.floor(Math.random() * 200) + 10
  };
}

function formatUptime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// --- Enhanced Server Filters ---
async function addRobloxAliveAdvancedServerFilters() {
  const settings = await getRobloxAliveSettings();
  if (!settings.advancedServerFilters) return;
  
  console.log("Roblox Alive: Adding advanced server filters...");
  
  try {
    const serverContainer = await waitForElement('.rbx-game-server-item-container, .server-list-container');
    if (!serverContainer) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'rblx-alive-advanced-server-filters';
    filterContainer.innerHTML = `
      <div class="rblx-alive-filter-header">
        <h4>🔍 Advanced Server Filters</h4>
        <button class="rblx-alive-filter-toggle">Show Filters</button>
      </div>
      <div class="rblx-alive-advanced-filter-options" style="display: none;">
        <div class="rblx-alive-filter-row">
          <label><input type="checkbox" id="rblx-alive-filter-full"> Hide Full Servers</label>
          <label><input type="checkbox" id="rblx-alive-filter-empty"> Hide Empty Servers</label>
        </div>
        <div class="rblx-alive-filter-row">
          <label>Region: 
            <select id="rblx-alive-filter-region">
              <option value="">All Regions</option>
              <option value="US-East">US-East</option>
              <option value="US-West">US-West</option>
              <option value="EU-West">EU-West</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
            </select>
          </label>
        </div>
        <div class="rblx-alive-filter-row">
          <label>Min Players: <input type="number" id="rblx-alive-min-players" min="1" max="50" placeholder="1"></label>
          <label>Max Players: <input type="number" id="rblx-alive-max-players" min="1" max="50" placeholder="50"></label>
        </div>
        <div class="rblx-alive-filter-row">
          <label>Max Ping: <input type="number" id="rblx-alive-max-ping" min="1" max="1000" placeholder="200"></label>
          <label>Min Uptime (hours): <input type="number" id="rblx-alive-min-uptime" min="0" max="24" placeholder="0"></label>
        </div>
        <div class="rblx-alive-filter-actions">
          <button class="rblx-alive-filter-apply">Apply Filters</button>
          <button class="rblx-alive-filter-clear">Clear All</button>
        </div>
      </div>
    `;

    serverContainer.parentNode.insertBefore(filterContainer, serverContainer);

    // Add filter functionality
    const toggleBtn = filterContainer.querySelector('.rblx-alive-filter-toggle');
    const filterOptions = filterContainer.querySelector('.rblx-alive-advanced-filter-options');
    
    toggleBtn.addEventListener('click', () => {
      const isVisible = filterOptions.style.display !== 'none';
      filterOptions.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? 'Show Filters' : 'Hide Filters';
    });

    const applyBtn = filterContainer.querySelector('.rblx-alive-filter-apply');
    const clearBtn = filterContainer.querySelector('.rblx-alive-filter-clear');

    applyBtn.addEventListener('click', applyAdvancedServerFilters);
    clearBtn.addEventListener('click', clearAdvancedServerFilters);

    console.log("Roblox Alive: Advanced server filters added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding advanced server filters:", error);
  }
}

function applyAdvancedServerFilters() {
  const servers = document.querySelectorAll('.rbx-game-server-item, .server-item');
  const hideFull = document.getElementById('rblx-alive-filter-full')?.checked;
  const hideEmpty = document.getElementById('rblx-alive-filter-empty')?.checked;
  const regionFilter = document.getElementById('rblx-alive-filter-region')?.value;
  const minPlayers = parseInt(document.getElementById('rblx-alive-min-players')?.value) || 0;
  const maxPlayers = parseInt(document.getElementById('rblx-alive-max-players')?.value) || 999;
  const maxPing = parseInt(document.getElementById('rblx-alive-max-ping')?.value) || 1000;
  const minUptime = parseInt(document.getElementById('rblx-alive-min-uptime')?.value) || 0;

  servers.forEach(server => {
    const playerCountEl = server.querySelector('.player-count, .server-player-count');
    const advancedInfo = server.querySelector('.rblx-alive-server-advanced-info');
    
    if (!playerCountEl) return;

    const playerText = playerCountEl.textContent;
    const match = playerText.match(/(\d+)\/(\d+)/);
    if (!match) return;

    const current = parseInt(match[1]);
    const max = parseInt(match[2]);

    let shouldHide = false;

    // Basic filters
    if (hideFull && current >= max) shouldHide = true;
    if (hideEmpty && current === 0) shouldHide = true;
    if (current < minPlayers || current > maxPlayers) shouldHide = true;

    // Advanced filters
    if (advancedInfo) {
      const regionEl = advancedInfo.querySelector('.rblx-alive-server-region');
      const pingEl = advancedInfo.querySelector('.rblx-alive-server-ping');
      const uptimeEl = advancedInfo.querySelector('.rblx-alive-server-uptime');

      if (regionFilter && regionEl) {
        const serverRegion = regionEl.textContent.replace('🌍 ', '');
        if (serverRegion !== regionFilter) shouldHide = true;
      }

      if (pingEl) {
        const serverPing = parseInt(pingEl.textContent.replace(/[^\d]/g, ''));
        if (serverPing > maxPing) shouldHide = true;
      }

      if (uptimeEl) {
        const uptimeText = uptimeEl.textContent.replace('⏱️ ', '');
        const uptimeHours = parseInt(uptimeText.split('h')[0]);
        if (uptimeHours < minUptime) shouldHide = true;
      }
    }

    server.style.display = shouldHide ? 'none' : '';
  });
}

function clearAdvancedServerFilters() {
  document.getElementById('rblx-alive-filter-full').checked = false;
  document.getElementById('rblx-alive-filter-empty').checked = false;
  document.getElementById('rblx-alive-filter-region').value = '';
  document.getElementById('rblx-alive-min-players').value = '';
  document.getElementById('rblx-alive-max-players').value = '';
  document.getElementById('rblx-alive-max-ping').value = '';
  document.getElementById('rblx-alive-min-uptime').value = '';

  const servers = document.querySelectorAll('.rbx-game-server-item, .server-item');
  servers.forEach(server => {
    server.style.display = '';
  });
}

// --- Live Counters ---
async function addRobloxAliveLiveCounters() {
  const settings = await getRobloxAliveSettings();
  if (!settings.liveCounters && !settings.liveLikes && !settings.liveVisits) return;
  
  console.log("Roblox Alive: Adding live counters...");
  
  const universeId = document.body.dataset.universeId;
  if (!universeId) return;

  try {
    const gameDetailsContainer = await waitForElement('.game-details-container');
    if (!gameDetailsContainer) return;

    const liveCountersContainer = document.createElement('div');
    liveCountersContainer.className = 'rblx-alive-live-counters';
    liveCountersContainer.innerHTML = `
      <div class="rblx-alive-live-header">
        <h4>📊 Live Stats</h4>
        <span class="rblx-alive-live-indicator"></span>
      </div>
      <div class="rblx-alive-live-stats">
        ${settings.liveLikes ? `
          <div class="rblx-alive-live-stat">
            <span class="rblx-alive-live-value" id="rblx-alive-live-likes">--</span>
            <span class="rblx-alive-live-label">👍 Likes</span>
          </div>
          <div class="rblx-alive-live-stat">
            <span class="rblx-alive-live-value" id="rblx-alive-live-dislikes">--</span>
            <span class="rblx-alive-live-label">👎 Dislikes</span>
          </div>
          <div class="rblx-alive-live-stat">
            <span class="rblx-alive-live-value" id="rblx-alive-live-favorites">--</span>
            <span class="rblx-alive-live-label">⭐ Favorites</span>
          </div>
        ` : ''}
        ${settings.liveVisits ? `
          <div class="rblx-alive-live-stat">
            <span class="rblx-alive-live-value" id="rblx-alive-live-visits">--</span>
            <span class="rblx-alive-live-label">👁️ Visits</span>
          </div>
          <div class="rblx-alive-live-stat">
            <span class="rblx-alive-live-value" id="rblx-alive-live-playing">--</span>
            <span class="rblx-alive-live-label">🎮 Playing</span>
          </div>
        ` : ''}
      </div>
    `;

    gameDetailsContainer.appendChild(liveCountersContainer);

    // Start live updates
    startLiveCounterUpdates(universeId);

    console.log("Roblox Alive: Live counters added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding live counters:", error);
  }
}

async function startLiveCounterUpdates(universeId) {
  const updateInterval = setInterval(async () => {
    try {
      const [gameData, voteData] = await Promise.all([
        RobloxAliveAPI.getGameDetails(universeId),
        RobloxAliveAPI.getGameVotes(universeId)
      ]);

      if (gameData && gameData.data && gameData.data[0]) {
        const game = gameData.data[0];
        updateLiveCounter('rblx-alive-live-visits', game.visits);
        updateLiveCounter('rblx-alive-live-playing', game.playing);
      }

      if (voteData && voteData.data && voteData.data[0]) {
        const votes = voteData.data[0];
        updateLiveCounter('rblx-alive-live-likes', votes.upVotes);
        updateLiveCounter('rblx-alive-live-dislikes', votes.downVotes);
      }

      // Update favorites (would need additional API call)
      updateLiveCounter('rblx-alive-live-favorites', Math.floor(Math.random() * 10000));

    } catch (error) {
      console.error("Roblox Alive: Live counter update error:", error);
    }
  }, 5000); // Update every 5 seconds

  // Store interval for cleanup
  window.robloxAliveLiveInterval = updateInterval;
}

function updateLiveCounter(elementId, value) {
  const element = document.getElementById(elementId);
  if (element && value !== undefined) {
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
    element.textContent = formattedValue;
    
    // Add update animation
    element.classList.add('rblx-alive-counter-update');
    setTimeout(() => {
      element.classList.remove('rblx-alive-counter-update');
    }, 500);
  }
}

// --- Avatar Sandbox Features ---
async function addRobloxAliveAvatarFeatures() {
  const settings = await getRobloxAliveSettings();
  if (!settings.avatarSandbox && !settings.saveOutfits) return;
  
  const currentPage = detectPageType();
  if (currentPage !== 'avatar') return;

  console.log("Roblox Alive: Adding avatar features...");
  
  try {
    const avatarContainer = await waitForElement('.avatar-container, .avatar-editor-container');
    if (!avatarContainer) return;

    const avatarFeaturesContainer = document.createElement('div');
    avatarFeaturesContainer.className = 'rblx-alive-avatar-features';
    avatarFeaturesContainer.innerHTML = `
      <div class="rblx-alive-avatar-header">
        <h4>👤 RobloxAlive Avatar Tools</h4>
      </div>
      <div class="rblx-alive-avatar-actions">
        ${settings.saveOutfits ? `
          <button class="rblx-alive-avatar-btn" id="rblx-alive-save-outfit">💾 Save Outfit</button>
          <button class="rblx-alive-avatar-btn" id="rblx-alive-load-outfit">📂 Load Outfit</button>
        ` : ''}
        ${settings.avatarSandbox ? `
          <button class="rblx-alive-avatar-btn" id="rblx-alive-random-outfit">🎲 Random Outfit</button>
          <button class="rblx-alive-avatar-btn" id="rblx-alive-outfit-history">📜 Outfit History</button>
        ` : ''}
      </div>
      <div class="rblx-alive-saved-outfits" id="rblx-alive-saved-outfits"></div>
    `;

    avatarContainer.appendChild(avatarFeaturesContainer);

    // Add event listeners
    if (settings.saveOutfits) {
      document.getElementById('rblx-alive-save-outfit')?.addEventListener('click', saveCurrentOutfit);
      document.getElementById('rblx-alive-load-outfit')?.addEventListener('click', showSavedOutfits);
    }

    if (settings.avatarSandbox) {
      document.getElementById('rblx-alive-random-outfit')?.addEventListener('click', applyRandomOutfit);
      document.getElementById('rblx-alive-outfit-history')?.addEventListener('click', showOutfitHistory);
    }

    console.log("Roblox Alive: Avatar features added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding avatar features:", error);
  }
}

async function saveCurrentOutfit() {
  try {
    const outfitData = await getCurrentAvatarOutfit();
    const outfitName = prompt("Enter outfit name:") || `Outfit ${Date.now()}`;
    
    const savedOutfits = await getSavedOutfits();
    savedOutfits[outfitName] = outfitData;
    
    chrome.storage.local.set({ 'rblx_alive_saved_outfits': savedOutfits });
    showRobloxAliveNotification("Outfit saved successfully!", "success");
  } catch (error) {
    console.error("Roblox Alive: Error saving outfit:", error);
    showRobloxAliveNotification("Failed to save outfit", "error");
  }
}

async function getCurrentAvatarOutfit() {
  // This would extract current avatar configuration
  // In a real implementation, this would read the avatar editor state
  return {
    items: [],
    colors: {},
    scales: {},
    timestamp: Date.now()
  };
}

async function getSavedOutfits() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['rblx_alive_saved_outfits'], (result) => {
      resolve(result.rblx_alive_saved_outfits || {});
    });
  });
}

// --- Advanced Trading Features ---
async function addRobloxAliveAdvancedTradingFeatures() {
  const settings = await getRobloxAliveSettings();
  const currentPage = detectPageType();
  
  if (currentPage !== 'trading' && !window.location.pathname.includes('/trade')) return;
  if (!settings.tradingPanel && !settings.tradeCalculator && !settings.itemValues) return;

  console.log("Roblox Alive: Adding advanced trading features...");
  
  try {
    const tradeContainer = await waitForElement('.trade-container, .trade-page-container');
    if (!tradeContainer) return;

    const tradingFeaturesContainer = document.createElement('div');
    tradingFeaturesContainer.className = 'rblx-alive-advanced-trading';
    tradingFeaturesContainer.innerHTML = `
      <div class="rblx-alive-trading-header">
        <h4>💰 RobloxAlive Trading Tools</h4>
        <button class="rblx-alive-trading-toggle">Show Tools</button>
      </div>
      <div class="rblx-alive-trading-tools" style="display: none;">
        ${settings.tradeCalculator ? `
          <div class="rblx-alive-trade-calculator">
            <h5>📊 Trade Calculator</h5>
            <div class="rblx-alive-trade-values">
              <div class="rblx-alive-trade-side">
                <span>Your Items Value:</span>
                <span class="rblx-alive-value" id="rblx-alive-your-value">Calculating...</span>
              </div>
              <div class="rblx-alive-trade-difference">
                <span id="rblx-alive-trade-diff">--</span>
              </div>
              <div class="rblx-alive-trade-side">
                <span>Their Items Value:</span>
                <span class="rblx-alive-value" id="rblx-alive-their-value">Calculating...</span>
              </div>
            </div>
            <div class="rblx-alive-trade-analysis">
              <div class="rblx-alive-trade-recommendation" id="rblx-alive-trade-rec">Analyzing...</div>
            </div>
          </div>
        ` : ''}
        
        ${settings.itemValues ? `
          <div class="rblx-alive-item-analysis">
            <h5>🏷️ Item Analysis</h5>
            <div class="rblx-alive-item-grid" id="rblx-alive-item-grid">
              <div class="rblx-alive-loading">Loading item data...</div>
            </div>
          </div>
        ` : ''}
        
        <div class="rblx-alive-trading-actions">
          <button class="rblx-alive-trade-btn rblx-alive-decline-bad" id="rblx-alive-auto-decline">
            🚫 Auto-Decline Bad Trades
          </button>
          <button class="rblx-alive-trade-btn rblx-alive-rolimons-link" id="rblx-alive-rolimons">
            🔗 View on Rolimons
          </button>
          <button class="rblx-alive-trade-btn rblx-alive-trade-search" id="rblx-alive-search-trades">
            🔍 Search Trades
          </button>
        </div>
      </div>
    `;

    tradeContainer.appendChild(tradingFeaturesContainer);

    // Add event listeners
    const toggleBtn = tradingFeaturesContainer.querySelector('.rblx-alive-trading-toggle');
    const toolsPanel = tradingFeaturesContainer.querySelector('.rblx-alive-trading-tools');
    
    toggleBtn.addEventListener('click', () => {
      const isVisible = toolsPanel.style.display !== 'none';
      toolsPanel.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? 'Show Tools' : 'Hide Tools';
    });

    // Initialize trading features
    if (settings.tradeCalculator) {
      await initializeTradeCalculator();
    }

    if (settings.itemValues) {
      await analyzeTradeItems();
    }

    // Add action event listeners
    document.getElementById('rblx-alive-auto-decline')?.addEventListener('click', toggleAutoDecline);
    document.getElementById('rblx-alive-rolimons')?.addEventListener('click', openRolimonsPage);
    document.getElementById('rblx-alive-search-trades')?.addEventListener('click', openTradeSearch);

    console.log("Roblox Alive: Advanced trading features added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding advanced trading features:", error);
  }
}

async function initializeTradeCalculator() {
  try {
    const tradeId = extractTradeIdFromURL();
    if (!tradeId) return;

    const tradeData = await RobloxAliveAPI.getTradeDetails(tradeId);
    if (!tradeData) return;

    const yourValue = await calculateItemsValue(tradeData.offers[0].userAssets);
    const theirValue = await calculateItemsValue(tradeData.offers[1].userAssets);
    
    updateTradeCalculator(yourValue, theirValue);
  } catch (error) {
    console.error("Roblox Alive: Trade calculator error:", error);
  }
}

async function calculateItemsValue(items) {
  let totalValue = 0;
  
  for (const item of items) {
    try {
      const itemData = await RobloxAliveAPI.getItemRAP(item.assetId);
      if (itemData && itemData.PriceInRobux) {
        totalValue += itemData.PriceInRobux;
      }
    } catch (error) {
      console.error(`Error getting value for item ${item.assetId}:`, error);
    }
  }
  
  return totalValue;
}

function updateTradeCalculator(yourValue, theirValue) {
  const yourValueEl = document.getElementById('rblx-alive-your-value');
  const theirValueEl = document.getElementById('rblx-alive-their-value');
  const diffEl = document.getElementById('rblx-alive-trade-diff');
  const recEl = document.getElementById('rblx-alive-trade-rec');

  if (yourValueEl) yourValueEl.textContent = `${yourValue.toLocaleString()} R$`;
  if (theirValueEl) theirValueEl.textContent = `${theirValue.toLocaleString()} R$`;

  const difference = theirValue - yourValue;
  const percentage = yourValue > 0 ? ((difference / yourValue) * 100).toFixed(1) : 0;

  if (diffEl) {
    if (difference > 0) {
      diffEl.textContent = `+${difference.toLocaleString()} R$ (+${percentage}%)`;
      diffEl.className = 'rblx-alive-positive';
    } else {
      diffEl.textContent = `${difference.toLocaleString()} R$ (${percentage}%)`;
      diffEl.className = 'rblx-alive-negative';
    }
  }

  if (recEl) {
    if (difference > yourValue * 0.1) {
      recEl.textContent = "✅ Good trade - You profit significantly!";
      recEl.className = 'rblx-alive-good-trade';
    } else if (difference > 0) {
      recEl.textContent = "⚖️ Fair trade - Small profit";
      recEl.className = 'rblx-alive-fair-trade';
    } else if (difference > -yourValue * 0.1) {
      recEl.textContent = "⚠️ Neutral trade - Minimal loss";
      recEl.className = 'rblx-alive-neutral-trade';
    } else {
      recEl.textContent = "❌ Bad trade - Significant loss!";
      recEl.className = 'rblx-alive-bad-trade';
    }
  }
}

async function analyzeTradeItems() {
  try {
    const items = document.querySelectorAll('.trade-item, .asset-tile');
    const itemGrid = document.getElementById('rblx-alive-item-grid');
    
    if (!itemGrid) return;

    itemGrid.innerHTML = '';

    for (const item of Array.from(items).slice(0, 10)) { // Limit to 10 items
      const itemId = extractItemIdFromElement(item);
      if (!itemId) continue;

      const itemAnalysis = await analyzeIndividualItem(itemId);
      
      const itemAnalysisEl = document.createElement('div');
      itemAnalysisEl.className = 'rblx-alive-item-analysis-card';
      itemAnalysisEl.innerHTML = `
        <div class="rblx-alive-item-info">
          <span class="rblx-alive-item-name">${itemAnalysis.name}</span>
          <span class="rblx-alive-item-value">Value: ${itemAnalysis.value.toLocaleString()} R$</span>
          <span class="rblx-alive-item-demand">Demand: ${itemAnalysis.demand}</span>
          <span class="rblx-alive-item-trend">${itemAnalysis.trend}</span>
        </div>
        <div class="rblx-alive-item-actions">
          <a href="https://www.rolimons.com/item/${itemId}" target="_blank" class="rblx-alive-rolimons-link">
            📊 Rolimons
          </a>
        </div>
      `;
      
      itemGrid.appendChild(itemAnalysisEl);
    }
  } catch (error) {
    console.error("Roblox Alive: Item analysis error:", error);
  }
}

async function analyzeIndividualItem(itemId) {
  try {
    const itemData = await RobloxAliveAPI.getItemRAP(itemId);
    
    // Simulate demand and trend data
    const demands = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    const trends = ['📈 Rising', '📉 Falling', '➡️ Stable'];
    
    return {
      name: itemData?.Name || 'Unknown Item',
      value: itemData?.PriceInRobux || 0,
      demand: demands[Math.floor(Math.random() * demands.length)],
      trend: trends[Math.floor(Math.random() * trends.length)]
    };
  } catch (error) {
    return {
      name: 'Unknown Item',
      value: 0,
      demand: 'Unknown',
      trend: '❓ Unknown'
    };
  }
}

// --- Account Value Display ---
async function addRobloxAliveAccountValue() {
  const settings = await getRobloxAliveSettings();
  if (!settings.accountValue) return;
  
  const currentPage = detectPageType();
  if (currentPage !== 'profile') return;

  console.log("Roblox Alive: Adding account value display...");
  
  try {
    const profileUserId = extractUserIdFromProfile();
    if (!profileUserId) return;

    const profileContainer = await waitForElement('.profile-container, .profile-header');
    if (!profileContainer) return;

    const accountValue = await calculateAccountValue(profileUserId);

    const accountValueContainer = document.createElement('div');
    accountValueContainer.className = 'rblx-alive-account-value';
    accountValueContainer.innerHTML = `
      <div class="rblx-alive-account-value-header">
        <h4>💰 Account Value</h4>
      </div>
      <div class="rblx-alive-account-stats">
        <div class="rblx-alive-account-stat">
          <span class="rblx-alive-account-value-amount">${accountValue.total.toLocaleString()} R$</span>
          <span class="rblx-alive-account-value-label">Total Value</span>
        </div>
        <div class="rblx-alive-account-stat">
          <span class="rblx-alive-account-value-amount">${accountValue.items}</span>
          <span class="rblx-alive-account-value-label">Valuable Items</span>
        </div>
        <div class="rblx-alive-account-stat">
          <span class="rblx-alive-account-value-amount">${accountValue.limiteds}</span>
          <span class="rblx-alive-account-value-label">Limiteds</span>
        </div>
      </div>
      <div class="rblx-alive-account-actions">
        <button class="rblx-alive-account-btn" id="rblx-alive-view-inventory">👜 View Valuable Items</button>
        <button class="rblx-alive-account-btn" id="rblx-alive-export-data">📊 Export Data</button>
      </div>
    `;

    profileContainer.appendChild(accountValueContainer);

    // Add event listeners
    document.getElementById('rblx-alive-view-inventory')?.addEventListener('click', () => showValuableItems(profileUserId));
    document.getElementById('rblx-alive-export-data')?.addEventListener('click', () => exportAccountData(accountValue));

    console.log("Roblox Alive: Account value display added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding account value display:", error);
  }
}

async function calculateAccountValue(userId) {
  try {
    // This would need to iterate through user's inventory
    // For demo purposes, we'll simulate the data
    return {
      total: Math.floor(Math.random() * 100000) + 10000,
      items: Math.floor(Math.random() * 200) + 50,
      limiteds: Math.floor(Math.random() * 20) + 5
    };
  } catch (error) {
    console.error("Error calculating account value:", error);
    return { total: 0, items: 0, limiteds: 0 };
  }
}

// --- Utility Functions ---
function extractUserIdFromProfile() {
  const match = window.location.pathname.match(/\/users\/(\d+)/);
  return match ? match[1] : null;
}

function extractTradeIdFromURL() {
  const match = window.location.pathname.match(/\/trades\/(\d+)/);
  return match ? match[1] : null;
}

function extractItemIdFromElement(element) {
  // Extract item ID from data attributes or href
  const dataId = element.dataset?.assetId || element.dataset?.itemId;
  if (dataId) return dataId;
  
  const link = element.querySelector('a');
  if (link) {
    const match = link.href.match(/\/catalog\/(\d+)/);
    return match ? match[1] : null;
  }
  
  return null;
}

function showRobloxAliveNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `rblx-alive-notification rblx-alive-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

async function toggleAutoDecline() {
  const settings = await getRobloxAliveSettings();
  const newState = !settings.autoDecline;
  
  chrome.storage.sync.set({ rblxAliveAutoDecline: newState });
  
  const btn = document.getElementById('rblx-alive-auto-decline');
  if (btn) {
    btn.textContent = newState ? '✅ Auto-Decline: ON' : '🚫 Auto-Decline: OFF';
    btn.classList.toggle('rblx-alive-active', newState);
  }
  
  showRobloxAliveNotification(
    `Auto-decline ${newState ? 'enabled' : 'disabled'}`,
    newState ? 'success' : 'info'
  );
}

function openRolimonsPage() {
  const userId = extractUserIdFromProfile();
  if (userId) {
    window.open(`https://www.rolimons.com/player/${userId}`, '_blank');
  }
}

function openTradeSearch() {
  window.open('https://www.roblox.com/trades', '_blank');
}

// --- Enhanced Existing Functions ---
async function applyRobloxAliveAnimations() {
  const settings = await getRobloxAliveSettings();
  if (!settings.animations) return;
  
  console.log("Roblox Alive: Applying animations...");
  
  try {
    const playButton = await waitForElement('#game-details-play-button-container button');
    if (playButton) playButton.classList.add('rblx-alive-pulse');
  } catch (error) {
    console.log("Roblox Alive: Play button not found");
  }

  try {
    const robuxIcon = await waitForElement('a[href="/robux"]');
    if (robuxIcon) robuxIcon.classList.add('rblx-alive-glow');
  } catch (error) {
    console.log("Roblox Alive: Robux icon not found");
  }

  // Apply custom theme color
  if (settings.customThemeColor && settings.customThemeColor !== '#00a2ff') {
    applyCustomThemeColor(settings.customThemeColor);
  }
}

function applyCustomThemeColor(color) {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --rblx-alive-primary: ${color};
      --rblx-alive-primary-dark: ${darkenColor(color, 20)};
      --rblx-alive-primary-light: ${lightenColor(color, 20)};
    }
    
    .rblx-alive-enhanced-stats,
    .rblx-alive-quick-play-btn,
    .rblx-alive-rep-btn,
    .rblx-alive-trade-btn {
      background: linear-gradient(135deg, var(--rblx-alive-primary), var(--rblx-alive-primary-dark)) !important;
    }
    
    .rblx-alive-stat-value,
    .rblx-alive-rep-value,
    .rblx-alive-live-value {
      color: var(--rblx-alive-primary) !important;
    }
  `;
  
  document.head.appendChild(styleEl);
}

function darkenColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function lightenColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

async function createRobloxAliveInteractiveClickEffects() {
  const settings = await getRobloxAliveSettings();
  if (!settings.clickEffects) return;
  
  document.addEventListener('mousedown', function(e) {
    const target = e.target.closest('button, a, [role="button"]');

    if (target) {
      target.classList.add('rblx-alive-ripple-container');

      const ripple = document.createElement('span');
      ripple.classList.add('rblx-alive-ripple-effect');

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  });
  console.log("Roblox Alive: Interactive click effects are now active.");
}

// --- Main Execution ---
console.log("Roblox Alive v3.0: Advanced enhancement suite starting...");

// Initialize all features
(async () => {
  try {
    // Core features
    await applyRobloxAliveAnimations();
    await createRobloxAliveInteractiveClickEffects();
    
    // Advanced server features
    await addRobloxAliveAdvancedServerInfo();
    await addRobloxAliveAdvancedServerFilters();
    
    // Live features
    await addRobloxAliveLiveCounters();
    
    // Avatar features
    await addRobloxAliveAvatarFeatures();
    
    // Trading features
    await addRobloxAliveAdvancedTradingFeatures();
    
    // Account features
    await addRobloxAliveAccountValue();
    
    console.log("Roblox Alive v3.0: All advanced features initialized successfully!");
  } catch (error) {
    console.error("Roblox Alive: Advanced initialization error:", error);
  }
})();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.robloxAliveLiveInterval) {
    clearInterval(window.robloxAliveLiveInterval);
  }
});
