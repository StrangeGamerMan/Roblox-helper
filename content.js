// --- Roblox Alive - Enhanced Content Script ---

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

// API Helper functions
class RobloxAliveAPI {
  static async makeRequest(url) {
    try {
      const response = await fetch(url);
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
}

// Settings management
async function getRobloxAliveSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'rblxAliveAnimations', 'rblxAliveGameStats', 'rblxAliveClickEffects',
      'rblxAliveProfileThemes', 'rblxAliveQuickPlay', 'rblxAliveServerFilters',
      'rblxAliveMutualFriends', 'rblxAliveReputation', 'rblxAliveMostPlayed',
      'rblxAliveQuickSearch', 'rblxAlivePlaytimeTracking', 'rblxAliveTradingPanel',
      'rblxAliveSelectedTheme'
    ], function(result) {
      resolve({
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
        tradingPanel: result.rblxAliveTradingPanel !== false,
        selectedTheme: result.rblxAliveSelectedTheme || 'default'
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
  if (path === '/' || path === '/home') return 'homepage';
  if (path.includes('/discover')) return 'discover';
  return 'unknown';
}

// --- Animation Features ---
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

  // Add hover animations to game cards
  document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card, .game-tile');
    gameCards.forEach(card => {
      card.classList.add('rblx-alive-hover-card');
    });
  });
}

// --- Game Statistics ---
async function addRobloxAliveGameStats() {
  const settings = await getRobloxAliveSettings();
  if (!settings.gameStats) return;
  
  console.log("Roblox Alive: Adding enhanced game stats...");
  const universeId = document.body.dataset.universeId;
  if (!universeId) return;

  try {
    const [votesResponse, detailsResponse] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`),
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    ]);

    const votesData = await votesResponse.json();
    const detailsData = await detailsResponse.json();
    
    const votes = votesData.data[0];
    const gameDetails = detailsData.data[0];

    if (votes && gameDetails) {
      const upVotes = votes.upVotes;
      const downVotes = votes.downVotes;
      const totalVotes = upVotes + downVotes;
      const likeRatio = totalVotes > 0 ? ((upVotes / totalVotes) * 100).toFixed(1) : "N/A";
      const playing = gameDetails.playing;
      const visits = gameDetails.visits;

      const statsContainer = document.createElement('div');
      statsContainer.className = 'rblx-alive-enhanced-stats';
      statsContainer.innerHTML = `
        <div class="rblx-alive-stat-item">
          <span class="rblx-alive-stat-value">${likeRatio}%</span>
          <span class="rblx-alive-stat-label">Like Ratio</span>
        </div>
        <div class="rblx-alive-stat-item">
          <span class="rblx-alive-stat-value">${playing.toLocaleString()}</span>
          <span class="rblx-alive-stat-label">Playing Now</span>
        </div>
        <div class="rblx-alive-stat-item">
          <span class="rblx-alive-stat-value">${visits.toLocaleString()}</span>
          <span class="rblx-alive-stat-label">Total Visits</span>
        </div>
        <div class="rblx-alive-stat-item">
          <span class="rblx-alive-stat-value">${gameDetails.maxPlayers}</span>
          <span class="rblx-alive-stat-label">Max Players</span>
        </div>
      `;

      const gameDetailsContainer = await waitForElement('.game-details-container');
      if (gameDetailsContainer && !document.querySelector('.rblx-alive-enhanced-stats')) {
        gameDetailsContainer.appendChild(statsContainer);
        console.log("Roblox Alive: Enhanced game stats added!");
      }
    }
  } catch (error) {
    console.error("Roblox Alive: Enhanced stats error:", error);
  }
}

// --- Quick Play Features ---
async function addRobloxAliveQuickPlay() {
  const settings = await getRobloxAliveSettings();
  if (!settings.quickPlay) return;
  
  console.log("Roblox Alive: Adding quick play features...");
  
  try {
    const gameDetailsPlay = await waitForElement('#game-details-play-button-container');
    if (!gameDetailsPlay) return;

    const quickPlayContainer = document.createElement('div');
    quickPlayContainer.className = 'rblx-alive-quick-play-container';
    quickPlayContainer.innerHTML = `
      <div class="rblx-alive-quick-play-options">
        <button class="rblx-alive-quick-play-btn" data-action="random">
          <span>🎲</span> Join Random Server
        </button>
        <button class="rblx-alive-quick-play-btn" data-action="best">
          <span>⭐</span> Join Best Server
        </button>
        <button class="rblx-alive-quick-play-btn" data-action="recent">
          <span>🔄</span> Rejoin Recent
        </button>
      </div>
    `;

    gameDetailsPlay.appendChild(quickPlayContainer);

    quickPlayContainer.addEventListener('click', async (e) => {
      if (e.target.closest('.rblx-alive-quick-play-btn')) {
        const action = e.target.closest('.rblx-alive-quick-play-btn').dataset.action;
        await handleQuickPlay(action);
      }
    });

    console.log("Roblox Alive: Quick play features added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding quick play features:", error);
  }
}

async function handleQuickPlay(action) {
  const placeId = document.body.dataset.placeId;
  if (!placeId) return;

  console.log(`Roblox Alive: Quick play action: ${action}`);
  
  try {
    const servers = await RobloxAliveAPI.getGameServers(placeId);
    if (!servers || servers.length === 0) {
      console.log("Roblox Alive: No servers available");
      return;
    }

    let targetServer;
    switch (action) {
      case 'random':
        targetServer = servers[Math.floor(Math.random() * servers.length)];
        break;
      case 'best':
        targetServer = servers.reduce((best, current) => 
          current.playing > best.playing ? current : best
        );
        break;
      case 'recent':
        // Get recent server from storage
        const recentServer = await getRecentServer(placeId);
        targetServer = servers.find(s => s.id === recentServer) || servers[0];
        break;
    }

    if (targetServer) {
      window.location.href = `roblox://placeId=${placeId}&gameInstanceId=${targetServer.id}`;
    }
  } catch (error) {
    console.error("Roblox Alive: Quick play error:", error);
  }
}

// --- Server Filters ---
async function addRobloxAliveServerFilters() {
  const settings = await getRobloxAliveSettings();
  if (!settings.serverFilters) return;
  
  console.log("Roblox Alive: Adding server filters...");
  
  try {
    const serverContainer = await waitForElement('.rbx-game-server-item-container, .server-list-container');
    if (!serverContainer) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'rblx-alive-server-filters';
    filterContainer.innerHTML = `
      <div class="rblx-alive-filter-header">
        <h4>🔍 Server Filters</h4>
      </div>
      <div class="rblx-alive-filter-options">
        <label><input type="checkbox" id="rblx-alive-filter-full"> Hide Full Servers</label>
        <label><input type="checkbox" id="rblx-alive-filter-empty"> Hide Empty Servers</label>
        <label><input type="number" id="rblx-alive-min-players" placeholder="Min Players" min="1" max="50"></label>
        <label><input type="number" id="rblx-alive-max-players" placeholder="Max Players" min="1" max="50"></label>
      </div>
    `;

    serverContainer.parentNode.insertBefore(filterContainer, serverContainer);

    // Add filter functionality
    const filterInputs = filterContainer.querySelectorAll('input');
    filterInputs.forEach(input => {
      input.addEventListener('change', applyServerFilters);
    });

    console.log("Roblox Alive: Server filters added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding server filters:", error);
  }
}

function applyServerFilters() {
  const servers = document.querySelectorAll('.rbx-game-server-item, .server-item');
  const hideFull = document.getElementById('rblx-alive-filter-full')?.checked;
  const hideEmpty = document.getElementById('rblx-alive-filter-empty')?.checked;
  const minPlayers = parseInt(document.getElementById('rblx-alive-min-players')?.value) || 0;
  const maxPlayers = parseInt(document.getElementById('rblx-alive-max-players')?.value) || 999;

  servers.forEach(server => {
    const playerCountEl = server.querySelector('.player-count, .server-player-count');
    if (!playerCountEl) return;

    const playerText = playerCountEl.textContent;
    const match = playerText.match(/(\d+)\/(\d+)/);
    if (!match) return;

    const current = parseInt(match[1]);
    const max = parseInt(match[2]);

    let shouldHide = false;

    if (hideFull && current >= max) shouldHide = true;
    if (hideEmpty && current === 0) shouldHide = true;
    if (current < minPlayers || current > maxPlayers) shouldHide = true;

    server.style.display = shouldHide ? 'none' : '';
  });
}

// --- Profile Features ---
async function addRobloxAliveProfileFeatures() {
  const settings = await getRobloxAliveSettings();
  const currentPage = detectPageType();
  
  if (currentPage !== 'profile') return;

  if (settings.mutualFriends) {
    await addMutualFriends();
  }

  if (settings.reputation) {
    await addReputationSystem();
  }

  if (settings.profileThemes) {
    await applyProfileTheme();
  }
}

async function addMutualFriends() {
  console.log("Roblox Alive: Adding mutual friends...");
  
  try {
    const profileUserId = extractUserIdFromProfile();
    const currentUserId = await getCurrentUserId();
    
    if (!profileUserId || !currentUserId || profileUserId === currentUserId) return;

    const [profileFriends, currentFriends] = await Promise.all([
      RobloxAliveAPI.getUserFriends(profileUserId),
      RobloxAliveAPI.getUserFriends(currentUserId)
    ]);

    const mutualFriends = profileFriends.filter(pf => 
      currentFriends.some(cf => cf.id === pf.id)
    );

    if (mutualFriends.length > 0) {
      const mutualContainer = document.createElement('div');
      mutualContainer.className = 'rblx-alive-mutual-friends';
      mutualContainer.innerHTML = `
        <div class="rblx-alive-mutual-header">
          <h4>👥 Mutual Friends (${mutualFriends.length})</h4>
        </div>
        <div class="rblx-alive-mutual-list">
          ${mutualFriends.slice(0, 6).map(friend => `
            <div class="rblx-alive-mutual-friend">
              <img src="https://www.roblox.com/headshot-thumbnail/image?userId=${friend.id}&width=60&height=60&format=png" alt="${friend.displayName}">
              <span>${friend.displayName}</span>
            </div>
          `).join('')}
        </div>
      `;

      const profileContainer = await waitForElement('.profile-container, .profile-header');
      if (profileContainer) {
        profileContainer.appendChild(mutualContainer);
        console.log("Roblox Alive: Mutual friends added!");
      }
    }
  } catch (error) {
    console.error("Roblox Alive: Error adding mutual friends:", error);
  }
}

async function addReputationSystem() {
  console.log("Roblox Alive: Adding reputation system...");
  
  try {
    const profileUserId = extractUserIdFromProfile();
    if (!profileUserId) return;

    // Get reputation from storage
    const reputation = await getStoredReputation(profileUserId);

    const reputationContainer = document.createElement('div');
    reputationContainer.className = 'rblx-alive-reputation-container';
    reputationContainer.innerHTML = `
      <div class="rblx-alive-reputation-header">
        <h4>⭐ RobloxAlive Reputation</h4>
      </div>
      <div class="rblx-alive-reputation-score">
        <span class="rblx-alive-rep-value">${reputation.score}</span>
        <span class="rblx-alive-rep-label">Rating</span>
      </div>
      <div class="rblx-alive-reputation-actions">
        <button class="rblx-alive-rep-btn rblx-alive-rep-positive" data-action="positive">👍 Positive</button>
        <button class="rblx-alive-rep-btn rblx-alive-rep-negative" data-action="negative">👎 Negative</button>
      </div>
    `;

    const profileContainer = await waitForElement('.profile-container, .profile-header');
    if (profileContainer) {
      profileContainer.appendChild(reputationContainer);

      // Add event listeners for reputation buttons
      reputationContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('rblx-alive-rep-btn')) {
          const action = e.target.dataset.action;
          await handleReputationVote(profileUserId, action);
        }
      });

      console.log("Roblox Alive: Reputation system added!");
    }
  } catch (error) {
    console.error("Roblox Alive: Error adding reputation system:", error);
  }
}

// --- Most Played Games ---
async function addRobloxAliveMostPlayed() {
  const settings = await getRobloxAliveSettings();
  if (!settings.mostPlayed || detectPageType() !== 'homepage') return;
  
  console.log("Roblox Alive: Adding most played games...");
  
  try {
    const playHistory = await getPlayHistory();
    const mostPlayed = analyzeMostPlayed(playHistory);

    if (mostPlayed.length === 0) return;

    const homepageContainer = await waitForElement('.container-main, .homepage-container');
    if (!homepageContainer) return;

    const mostPlayedSection = document.createElement('div');
    mostPlayedSection.className = 'rblx-alive-most-played-section';
    mostPlayedSection.innerHTML = `
      <div class="rblx-alive-section-header">
        <h2>🎮 Your Most Played Games</h2>
        <span class="rblx-alive-section-subtitle">Based on your RobloxAlive tracking</span>
      </div>
      <div class="rblx-alive-most-played-grid">
        ${mostPlayed.map(game => `
          <div class="rblx-alive-game-card" data-game-id="${game.gameId}">
            <div class="rblx-alive-game-thumbnail">
              <img src="https://www.roblox.com/asset-thumbnail/image?assetId=${game.gameId}&width=150&height=150&format=png" alt="${game.gameName}">
            </div>
            <div class="rblx-alive-game-info">
              <h4>${game.gameName}</h4>
              <span class="rblx-alive-play-count">${game.playCount} plays</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    homepageContainer.insertBefore(mostPlayedSection, homepageContainer.firstChild);
    console.log("Roblox Alive: Most played games added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding most played games:", error);
  }
}

// --- Click Effects ---
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

// --- Quick Search ---
async function addRobloxAliveQuickSearch() {
  const settings = await getRobloxAliveSettings();
  if (!settings.quickSearch) return;
  
  console.log("Roblox Alive: Adding quick search...");
  
  try {
    const navbar = await waitForElement('.navbar, .navigation-container');
    if (!navbar) return;

    const quickSearchContainer = document.createElement('div');
    quickSearchContainer.className = 'rblx-alive-quick-search';
    quickSearchContainer.innerHTML = `
      <div class="rblx-alive-search-box">
        <input type="text" placeholder="🔍 Quick search games..." id="rblx-alive-search-input">
        <div class="rblx-alive-search-results" id="rblx-alive-search-results"></div>
      </div>
    `;

    navbar.appendChild(quickSearchContainer);

    const searchInput = document.getElementById('rblx-alive-search-input');
    const searchResults = document.getElementById('rblx-alive-search-results');

    searchInput.addEventListener('input', debounce(async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      // Simple search simulation - in real implementation, you'd call Roblox search API
      searchResults.innerHTML = `
        <div class="rblx-alive-search-item">Searching for "${query}"...</div>
      `;
      searchResults.style.display = 'block';
    }, 300));

    console.log("Roblox Alive: Quick search added!");
  } catch (error) {
    console.error("Roblox Alive: Error adding quick search:", error);
  }
}

// --- Utility Functions ---
function extractUserIdFromProfile() {
  const match = window.location.pathname.match(/\/users\/(\d+)/);
  return match ? match[1] : null;
}

async function getCurrentUserId() {
  try {
    const response = await fetch('/mobileapi/userinfo');
    const data = await response.json();
    return data.UserID;
  } catch (error) {
    return null;
  }
}

async function getStoredReputation(userId) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`rblx_alive_rep_${userId}`], (result) => {
      resolve(result[`rblx_alive_rep_${userId}`] || { score: 0, votes: 0 });
    });
  });
}

async function handleReputationVote(userId, action) {
  const reputation = await getStoredReputation(userId);
  
  if (action === 'positive') {
    reputation.score += 1;
  } else {
    reputation.score -= 1;
  }
  reputation.votes += 1;

  chrome.storage.local.set({ [`rblx_alive_rep_${userId}`]: reputation });
  
  // Update UI
  const scoreEl = document.querySelector('.rblx-alive-rep-value');
  if (scoreEl) scoreEl.textContent = reputation.score;
}

async function getPlayHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['rblxAlivePlayHistory'], (result) => {
      resolve(result.rblxAlivePlayHistory || []);
    });
  });
}

function analyzeMostPlayed(playHistory) {
  const gameStats = {};
  
  playHistory.forEach(entry => {
    if (!gameStats[entry.gameId]) {
      gameStats[entry.gameId] = {
        gameId: entry.gameId,
        gameName: entry.gameName,
        playCount: 0,
        totalTime: 0
      };
    }
    gameStats[entry.gameId].playCount++;
    gameStats[entry.gameId].totalTime += entry.duration || 0;
  });

  return Object.values(gameStats)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 6);
}

async function getRecentServer(placeId) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`rblx_alive_recent_${placeId}`], (result) => {
      resolve(result[`rblx_alive_recent_${placeId}`] || null);
    });
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function applyProfileTheme() {
  const settings = await getRobloxAliveSettings();
  const theme = settings.selectedTheme;
  
  if (theme && theme !== 'default') {
    document.body.classList.add(`rblx-alive-theme-${theme}`);
  }
}

// --- Main Execution ---
console.log("Roblox Alive v2.0: Enhanced extension starting...");

// Initialize all features
(async () => {
  try {
    await applyRobloxAliveAnimations();
    await addRobloxAliveGameStats();
    await addRobloxAliveQuickPlay();
    await addRobloxAliveServerFilters();
    await addRobloxAliveProfileFeatures();
    await addRobloxAliveMostPlayed();
    await createRobloxAliveInteractiveClickEffects();
    await addRobloxAliveQuickSearch();
    
    console.log("Roblox Alive: All features initialized successfully!");
  } catch (error) {
    console.error("Roblox Alive: Initialization error:", error);
  }
})();
