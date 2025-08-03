// --- Function to find an element safely and wait for it if needed ---
// Roblox loads things dynamically, so we need to wait for elements to appear.
function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}


// --- Function to Apply Animations ---
async function applyAnimations() {
  console.log("Roblox Alive: Applying animations...");

  // The big green "Play" button on a game page
  const playButton = await waitForElement('#game-details-play-button-container button');
  if (playButton) {
    playButton.classList.add('rblx-alive-pulse');
    console.log("Roblox Alive: Play button found and animated.");
  } else {
    console.log("Roblox Alive: Play button selector failed.");
  }

  // You can add more selectors for animations here
  // Example: Animate the Robux icon
  const robuxIcon = await waitForElement('a[href="/robux"]');
  if (robuxIcon) {
      robuxIcon.classList.add('rblx-alive-glow');
  }
}

// --- Function to Add Improved Game Statistics ---
async function addGameStats() {
  console.log("Roblox Alive: Checking for game stats...");

  // 1. Get the Game's Universe ID from the page
  const universeId = document.body.dataset.universeId;
  if (!universeId) {
    console.log("Roblox Alive: Not a game page or could not find Universe ID.");
    return;
  }

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
    
    const likeRatio = totalVotes > 0 ? ((upVotes / totalVotes) * 100).toFixed(1) : "N/A";

    // 3. Create the new HTML element to display the stats
    const statsElement = document.createElement('div');
    statsElement.className = 'rblx-alive-stats-container';
    statsElement.innerHTML = `<strong>${likeRatio}%</strong><span>Like Ratio</span>`;

    // 4. Find the right place on the page to add our new element
    // We wait for the vote buttons to exist before trying to add our stats
    const voteContainer = await waitForElement('#game-voting-buttons-container');
    if (voteContainer && !document.querySelector('.rblx-alive-stats-container')) {
      voteContainer.appendChild(statsElement);
      console.log(`Roblox Alive: Added stats! Ratio: ${likeRatio}%`);
    }

  } catch (error) {
    console.error("Roblox Alive: Failed to fetch or process game votes.", error);
  }
}

// --- Main execution ---
// This is the starting point of our script
console.log("Roblox Alive extension script has started!");
applyAnimations();
addGameStats();
