// Popup script for Roblox Pro Extension

class PopupManager {
  constructor() {
    this.favoriteGames = [];
    this.recentGames = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.populateFavorites();
    this.populateRecent();
    this.updateStats();
  }

  async loadData() {
    const data = await this.getStorageData([
      'favoriteGames', 'recentGames', 'gamesPlayed', 'playTime'
    ]);
    
    this.favoriteGames = data.favoriteGames || [];
    this.recentGames = data.recentGames || [];
    this.gamesPlayed = data.gamesPlayed || 0;
    this.playTime = data.playTime || {};
  }

  setupEventListeners() {
    document.getElementById('openRoblox').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.roblox.com' });
      window.close();
    });

    document.getElementById('openDiscover').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.roblox.com/discover' });
      window.close();
    });

    document.getElementById('addFavorite').addEventListener('click', () => {
      this.addCurrentGameToFavorites();
    });

    document.getElementById('openSettings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      window.close();
    });

    document.getElementById('refreshData').addEventListener('click', () => {
      this.refreshData();
    });
  }

  populateFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (this.favoriteGames.length === 0) {
      favoritesList.innerHTML = '<div class="game-item">No favorites yet</div>';
      return;
    }

    favoritesList.innerHTML = '';
    this.favoriteGames.slice(0, 5).forEach(game => {
      const gameElement = document.createElement('div');
      gameElement.className = 'game-item';
      gameElement.innerHTML = `
        <span class="game-name">${game.name}</span>
        <span class="game-info">${game.players || 'Unknown'} playing</span>
      `;
      
      gameElement.addEventListener('click', () => {
        chrome.tabs.create({ url: `https://www.roblox.com/games/${game.id}` });
        window.close();
      });
      
      favoritesList.appendChild(gameElement);
    });
  }

  populateRecent() {
    const recentList = document.getElementById('recentList');
    
    if (this.recentGames.length === 0) {
      recentList.innerHTML = '<div class="game-item">No recent games</div>';
      return;
    }

    recentList.innerHTML = '';
    this.recentGames.slice(0, 5).forEach(game => {
      const gameElement = document.createElement('div');
      gameElement.className = 'game-item';
      gameElement.innerHTML = `
        <span class="game-name">${game.name}</span>
        <span class="game-info">Played ${this.formatTimeAgo(game.lastPlayed)}</span>
      `;
      
      gameElement.addEventListener('click', () => {
        chrome.tabs.create({ url: `https://www.roblox.com/games/${game.id}` });
        window.close();
      });
      
      recentList.appendChild(gameElement);
    });
  }

  updateStats() {
    document.getElementById('gamesPlayed').textContent = this.gamesPlayed;
    
    const today = new Date().toDateString();
    const todayTime = this.playTime[today] || 0;
    const hours = Math.floor(todayTime / 3600000);
    const minutes = Math.floor((todayTime % 3600000) / 60000);
    
    document.getElementById('hoursToday').textContent = 
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  async addCurrentGameToFavorites() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('roblox.com/games/')) {
        this.showMessage('Please navigate to a Roblox game first');
        return;
      }

      const gameIdMatch = tab.url.match(/games\/(\d+)/);
      if (!gameIdMatch) {
        this.showMessage('Could not find game ID');
        return;
      }

      const gameId = gameIdMatch[1];
      const gameName = await this.getGameName(tab.title);

      const gameData = {
        id: gameId,
        name: gameName,
        addedAt: Date.now()
      };

      // Check if already in favorites
      if (this.favoriteGames.some(game => game.id === gameId)) {
        this.showMessage('Game already in favorites');
        return;
      }

      this.favoriteGames.unshift(gameData);
      if (this.favoriteGames.length > 10) {
        this.favoriteGames = this.favoriteGames.slice(0, 10);
      }

      await this.setStorageData({ favoriteGames: this.favoriteGames });
      this.populateFavorites();
      this.showMessage('Added to favorites!');

    } catch (error) {
      this.showMessage('Failed to add favorite');
    }
  }

  async refreshData() {
    document.getElementById('refreshData').textContent = '🔄 Loading...';
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await this.loadData();
    this.populateFavorites();
    this.populateRecent();
    this.updateStats();
    
    document.getElementById('refreshData').textContent = '🔄 Refresh';
    this.showMessage('Data refreshed!');
  }

  getGameName(title) {
    // Extract game name from page title
    const cleanTitle = title.replace(' - Roblox', '').trim();
    return cleanTitle || 'Unknown Game';
  }

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  showMessage(message) {
    // Create temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 5px;
      text-align: center;
      font-size: 12px;
      z-index: 1000;
    `;
    
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2000);
  }

  async getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  async setStorageData(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
