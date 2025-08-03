// --- Function to find an element safely and wait for it if needed ---
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
    
    // Add timeout to prevent infinite waiting
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Roblox Alive: Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// --- Function to check user settings ---
async function getRobloxAliveSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['rblxAliveAnimations', 'rblxAliveGameStats', 'rblxAliveClickEffects'], function(result) {
      resolve({
        animations: result.rblxAliveAnimations !== false,
        gameStats: result.rblxAliveGameStats !== false,
        clickEffects: result.rblxAliveClickEffects !== false
      });
    });
  });
}

// --- Function to Apply Passive Animations ---
async function applyRobloxAliveAnimations() {
  const settings = await getRobloxAliveSettings();
  if (!settings.animations) return;
  
  console.log("Roblox Alive: Applying passive animations...");
  
  try {
    const playButton = await waitForElement('#game-details-play-button-container button');
    if (playButton) {
      playButton.classList.add('rblx-alive-pulse');
    }
  } catch (error) {
    console.log("Roblox Alive: Play button not found for animations");
  }

  try {
    const robuxIcon = await waitForElement('a[href="/robux"]');
    if (robuxIcon) {
      robuxIcon.classList.add('rblx-alive-glow');
    }
  } catch (error) {
    console.log("Roblox Alive: Robux icon not found for animations");
  }

  // Add floating animation to badges
  try {
    const badges = await waitForElement('.badge-container');
    if (badges) {
      const badgeElements = badges.querySelectorAll('.badge');
      badgeElements.forEach(badge => {
        badge.classList.add('rblx-alive-float');
      });
    }
  } catch (error) {
    console.log("Roblox Alive: Badges not found for animations");
  }
}

// --- Function to Add Improved Game Statistics ---
async function addRobloxAliveGameStats() {
  const settings = await getRobloxAliveSettings();
  if (!settings.gameStats) return;
  
  console.log("Roblox Alive: Checking for game stats...");
  const universeId = document.body.dataset.universeId;
  if (!universeId) return;

  try {
    const response = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`);
    const data = await response.json();
    const votes = data.data[0];
    if (!votes) return;

    const upVotes = votes.upVotes;
    const downVotes = votes.downVotes;
    const totalVotes = upVotes + downVotes;
    const likeRatio = totalVotes > 0 ? ((upVotes / totalVotes) * 100).toFixed(1) : "N/A";

    const robloxAliveStatsElement = document.createElement('div');
    robloxAliveStatsElement.className = 'rblx-alive-stats-container';
    robloxAliveStatsElement.innerHTML = `<strong>${likeRatio}%</strong><span>Like Ratio</span>`;

    const voteContainer = await waitForElement('#game-voting-buttons-container');
    if (voteContainer && !document.querySelector('.rblx-alive-stats-container')) {
      voteContainer.appendChild(robloxAliveStatsElement);
      console.log("Roblox Alive: Game stats successfully added!");
    }
  } catch (error) {
    console.error("Roblox Alive: Failed to fetch or process game votes.", error);
  }
}

// --- Function to Add Enhanced Game Statistics ---
async function addRobloxAliveEnhancedGameStats() {
  const settings = await getRobloxAliveSettings();
  if (!settings.gameStats) return;
  
  console.log("Roblox Alive: Adding enhanced game statistics...");
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

      const robloxAliveEnhancedStatsContainer = document.createElement('div');
      robloxAliveEnhancedStatsContainer.className = 'rblx-alive-enhanced-stats';
      robloxAliveEnhancedStatsContainer.innerHTML = `
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
      `;

      const gameDetailsContainer = await waitForElement('.game-details-container');
      if (gameDetailsContainer && !document.querySelector('.rblx-alive-enhanced-stats')) {
        gameDetailsContainer.appendChild(robloxAliveEnhancedStatsContainer);
        console.log("Roblox Alive: Enhanced game stats successfully added!");
      }
    }
  } catch (error) {
    console.error("Roblox Alive: Enhanced stats error:", error);
  }
}

// --- Function to Create Interactive Click Effects ---
async function createRobloxAliveInteractiveClickEffects() {
  const settings = await getRobloxAliveSettings();
  if (!settings.clickEffects) return;
  
  document.addEventListener('mousedown', function(e) {
    const target = e.target.closest('button, a, [role="button"]');

    if (target) {
      target.classList.add('rblx-alive-ripple-container');

      const robloxAliveRipple = document.createElement('span');
      robloxAliveRipple.classList.add('rblx-alive-ripple-effect');

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      robloxAliveRipple.style.width = robloxAliveRipple.style.height = `${size}px`;
      robloxAliveRipple.style.left = `${e.clientX - rect.left - size / 2}px`;
      robloxAliveRipple.style.top = `${e.clientY - rect.top - size / 2}px`;

      target.appendChild(robloxAliveRipple);

      setTimeout(() => {
        robloxAliveRipple.remove();
      }, 600);
    }
  });
  console.log("Roblox Alive: Interactive click effects are now active.");
}

// --- Main execution ---
console.log("Roblox Alive extension script has started!");
applyRobloxAliveAnimations();
addRobloxAliveGameStats();
addRobloxAliveEnhancedGameStats();
createRobloxAliveInteractiveClickEffects();
