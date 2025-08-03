// --- Function to find an element safely and wait for it if needed ---
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
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// --- Function to Apply Passive Animations ---
async function applyAnimations() {
  console.log("Roblox Alive: Applying passive animations...");
  const playButton = await waitForElement('#game-details-play-button-container button');
  if (playButton) {
    playButton.classList.add('rblx-alive-pulse');
  }
  const robuxIcon = await waitForElement('a[href="/robux"]');
  if (robuxIcon) {
    robuxIcon.classList.add('rblx-alive-glow');
  }
}

// --- Function to Add Improved Game Statistics ---
async function addGameStats() {
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

    const statsElement = document.createElement('div');
    statsElement.className = 'rblx-alive-stats-container';
    statsElement.innerHTML = `<strong>${likeRatio}%</strong><span>Like Ratio</span>`;

    const voteContainer = await waitForElement('#game-voting-buttons-container');
    if (voteContainer && !document.querySelector('.rblx-alive-stats-container')) {
      voteContainer.appendChild(statsElement);
    }
  } catch (error) {
    console.error("Roblox Alive: Failed to fetch or process game votes.", error);
  }
}

// --- NEW: Function to Create Interactive Click Effects ---
function createInteractiveClickEffects() {
  // Listen for a mousedown event anywhere on the page
  document.addEventListener('mousedown', function(e) {
    // Find the closest parent element that is a button or a link
    const target = e.target.closest('button, a, [role="button"]');

    if (target) {
      // Add a class to the button to prepare it for the ripple
      target.classList.add('rblx-alive-ripple-container');

      // Create the ripple span element
      const ripple = document.createElement('span');
      ripple.classList.add('rblx-alive-ripple-effect');

      // Calculate the size and position of the ripple
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      // Add the ripple to the button
      target.appendChild(ripple);

      // Clean up and remove the ripple element after the animation is done
      setTimeout(() => {
        ripple.remove();
      }, 600); // 600ms matches the animation duration in the CSS
    }
  });
  console.log("Roblox Alive: Interactive click effects are now active.");
}

// --- Main execution ---
console.log("Roblox Alive extension script has started!");
applyAnimations();
addGameStats();
createInteractiveClickEffects(); // Activate the new click effects
