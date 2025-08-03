// Roblox Alive - Game Features (Icon-Free UI Version)
class RobloxAliveGames {
  constructor(settings) {
    this.settings = settings;
    this.api = window.RobloxAliveAPI;
  }

  async addMostPlayedSection() {
    console.log("Roblox Alive: Adding most played section to homepage...");

    try {
      const playHistory = await this.getPlayHistory();
      const mostPlayed = this.analyzeMostPlayed(playHistory);

      if (mostPlayed.length === 0) return;

      const homepageContainer = await this.waitForElement('.container-main');
      if (!homepageContainer) return;

      // Create text-only most played section (no thumbnails)
      const mostPlayedSection = this.createMostPlayedSection(mostPlayed);
      homepageContainer.insertBefore(mostPlayedSection, homepageContainer.firstChild);

      console.log("Roblox Alive: Most played section added successfully!");
    } catch (error) {
      console.error("Roblox Alive: Error adding most played section:", error);
    }
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
          <div class="rblx-alive-game-card" data-game-id="${game.gameId}" style="padding: 10px; border-bottom: 1px solid #ccc;">
            <h4>${game.gameName}</h4>
            <span class="rblx-alive-play-count">${game.playCount} plays</span>
          </div>
        `).join('')}
      </div>
    `;

    return section;
  }

  // The rest of the script stays the same, only UI icon/image parts removed or replaced with text.

  async addQuickPlayFeatures() {
    console.log("Roblox Alive: Adding quick play features...");

    try {
      const gameDetailsPlay = await this.waitForElement('#game-details-play-button-container');
      if (!gameDetailsPlay) return;

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

  // ... rest of the class remains the same
}
