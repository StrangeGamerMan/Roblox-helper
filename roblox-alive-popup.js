// Roblox Alive - Game Features
class RobloxAliveGames {
  constructor(settings) {
    this.settings = settings;
    this.api = window.RobloxAliveAPI;
  }

  async addMostPlayedSection() {
    console.log("Roblox Alive: Adding most played section to homepage...");
    
    try {
      // Get user's play history from storage
      const playHistory = await this.getPlayHistory();
      const mostPlayed = this.analyzeMostPlayed(playHistory);

      if (mostPlayed.length === 0) return;

      const homepageContainer = await this.waitForElement('.container-main');
      if (!homepageContainer) return;

      const mostPlayedSection = this.createMostPlayedSection(mostPlayed);
      homepageContainer.insertBefore(mostPlayedSection, homepageContainer.firstChild);

      console.log("Roblox Alive: Most played section added successfully!");
    } catch (error) {
      console.error("Roblox Alive: Error adding most played section:", error);
    }
  }

  async addQuickPlayFeatures() {
    console.log("Roblox Alive: Adding quick play features...");
    
    try {
      const gameDetailsPlay = await this.waitForElement('#game-details-play-button-container');
      if (!gameDetailsPlay) return;

      // Add quick play button with server selection
      const quickPlayContainer = document.createElement('div');
      quickPlayContainer.className = 'rblx-alive-quick-play-container';
      quickPlayContainer.innerHTML = `
        <div class="rblx-alive-quick-play-options">
          <button class="rblx-alive-quick-play-btn" data-action="random">Join Random Server</button>
          <button class="rblx-alive-quick-play-btn" data-action="best">Join Best Server</button>
          <button class="rblx-alive-quick-play-btn" data-action="recent">Rejoin Recent</button>
        </div>
      `;

      gameDetailsPlay.appendChild(quickPlayContainer);

      // Add event listeners
      quickPlayContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('rblx-alive-quick-play-btn')) {
          this.handleQuickPlay(e.target.dataset.action);
        }
      });

      console.log("Roblox Alive: Quick play features added!");
    } catch (error) {
      console.error("Roblox Alive: Error adding quick play features:", error);
    }
  }

  async addEnhancedGameStats() {
    console.log("Roblox Alive: Adding enhanced game statistics...");
    
    const universeId = document.body.dataset.universeId;
    if (!universeId) return;

    try {
      const [gameInfo, voteInfo] = await Promise.all([
        this.api.getGameInfo(universeId),
        this.api.getGameVotes(universeId)
      ]);

      if (!gameInfo || !voteInfo) return;

      const statsContainer = this.createEnhancedStatsContainer(gameInfo, voteInfo);
      const gameDetails = await this.waitForElement('.game-details-container');
      
      if (gameDetails && !document.querySelector('.rblx-alive-enhanced-stats')) {
        gameDetails.appendChild(statsContainer);
        console.log("Roblox Alive: Enhanced game stats added!");
      }
    } catch (error) {
      console.error("Roblox Alive: Error adding enhanced game stats:", error);
    }
  }

  createEnhancedStatsContainer(gameInfo, voteInfo) {
    const upVotes = voteInfo.upVotes;
    const downVotes = voteInfo.downVotes;
    const totalVotes = upVotes + downVotes;
    const likeRatio = totalVotes > 0 ? ((upVotes / totalVotes) * 100).toFixed(1) : "N/A";
    
    const container = document.createElement('div');
    container.className = 'rblx-alive-enhanced-stats';
    container.innerHTML = `
      <div class="rblx-alive-stat-item">
        <span class="rblx-alive-stat-value">${likeRatio}%</span>
        <span class="rblx-alive-stat-label">Like Ratio</span>
      </div>
      <div class="rblx-alive-stat-item">
        <span class="rblx-alive-stat-value">${gameInfo.playing.toLocaleString()}</span>
        <span class="rblx-alive-stat-label">Playing Now</span>
      </div>
      <div class="rblx-alive-stat-item">
        <span class="rblx-alive-stat-value">${gameInfo.visits.toLocaleString()}</span>
        <span class="rblx-alive-stat-label">Total Visits</span>
      </div>
      <div class="rblx-alive-stat-item">
        <span class="rblx-alive-stat-value">${gameInfo.maxPlayers}</span>
        <span class="rblx-alive-stat-label">Max Players</span>
      </div>
    `;
    
    return container;
  }

  async getPlayHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['rblxAlivePlayHistory'], (result) => {
        resolve(result.rblxAlivePlayHistory || []);
      });
    });
  }

  analyzeMostPlayed(playHistory) {
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

  createMostPlayedSection(mostPlayed) {
    const section = document.createElement('div');
    section.className = 'rblx-alive-most-played-section';
    section.innerHTML = `
      <div class="rblx-alive-section-header">
        <h2>Your Most Played Games</h2>
        <span class="rblx-alive-section-subtitle">Based on your play history</span>
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
    
    return section;
  }

  async handleQuickPlay(action) {
    console.log(`Roblox Alive: Quick play action: ${action}`);
    // Implementation for different quick play actions
    // This would handle joining servers based on the selected action
  }

  async waitForElement(selector, timeout = 10000) {
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
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}
