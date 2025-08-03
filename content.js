// --- Function to Apply Animations (with updated, more reliable selectors) ---
function applyAnimations() {
  console.log("Roblox Alive: Applying animations...");

  // Define elements to animate. These selectors are more robust and likely to work after Roblox updates.
  const elementsToAnimate = {
    glow: [
      '[aria-label="Robux"]' // Robux Icon
    ],
    pulse: [
      '[data-testid="game-play-button"]' // The main "Play" button on a game page
    ]
  };

  // Apply glow
  document.querySelectorAll(elementsToAnimate.glow.join(', ')).forEach(el => {
    el.classList.add('rblx-alive-glow');
  });

  // Apply pulse
  document.querySelectorAll(elementsToAnimate.pulse.join(', ')).forEach(el => {
    el.classList.add('rblx-alive-pulse');
  });
}

// --- Function to Add Improved Game Statistics ---
async function addGameStats() {
  console.log("Roblox Alive: Checking for game stats...");

  // 1. Get the Game's Universe ID from the page
  const gameInfoElement = document.querySelector('[data-universe-id]');
  if (!gameInfoElement) {
    console.log("Roblox Alive: Not a game page or could not find Universe ID. Stopping stats function.");
    return; // Exit if we're not on a game page
  }
  const universeId = gameInfoElement.getAttribute('data-universe-id');

  // 2. Use Roblox's API to get the vote counts
  try {
    const response = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`);
    const data = await response.json();
    const votes = data.data[0];
    
    if (!votes) {
      console.log("Roblox Alive: API did not return vote data.");
      return;
    }

    const upVotes = votes.upVotes;
    const downVotes = votes.downVotes;
    const totalVotes = upVotes + downVotes;
    
    // Avoid division by zero
    const likeRatio = totalVotes > 0 ? ((upVotes / totalVotes) * 100).toFixed(1) : "N/A";

    // 3. Create the new HTML element to display the stats
    const statsElement = document.createElement('div');
    statsElement.className = 'rblx-alive-stats-container';
    statsElement.innerHTML = `
      <strong>${likeRatio}%</strong> 
      <span>Like Ratio</span>
    `;

    // 4. Find the right place on the page to add our new element
    const voteContainer = document.querySelector('.game-votes-container');
    if (voteContainer) {
      voteContainer.appendChild(statsElement);
      console.log(`Roblox Alive: Added stats! Ratio: ${likeRatio}%`);
    } else {
      console.log("Roblox Alive: Could not find vote container to add stats element.");
    }

  } catch (error) {
    console.error("Roblox Alive: Failed to fetch or process game votes.", error);
  }
}

// --- Main execution ---
// We wait for the window to fully load to make sure all Roblox elements are on the page
window.addEventListener('load', () => {
  applyAnimations();
  addGameStats();
});
