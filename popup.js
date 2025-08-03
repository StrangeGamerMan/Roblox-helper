// Grab DOM elements
const liveCountersToggle = document.getElementById('liveCountersToggle');
const tradeCalcToggle = document.getElementById('tradeCalcToggle');
const devToolsToggle = document.getElementById('devToolsToggle');
const liveCountersData = document.getElementById('liveCountersData');

// Save toggle settings to Chrome storage
function saveSettings() {
  chrome.storage.local.set({
    liveCounters: liveCountersToggle.checked,
    tradeCalculator: tradeCalcToggle.checked,
    devTools: devToolsToggle.checked,
  });
}

// Load settings and update UI toggles
function loadSettings() {
  chrome.storage.local.get(['liveCounters', 'tradeCalculator', 'devTools'], (data) => {
    if(data.liveCounters !== undefined) liveCountersToggle.checked = data.liveCounters;
    if(data.tradeCalculator !== undefined) tradeCalcToggle.checked = data.tradeCalculator;
    if(data.devTools !== undefined) devToolsToggle.checked = data.devTools;
    
    if (liveCountersToggle.checked) startLiveCounters();
    else liveCountersData.textContent = "";
  });
}

// Add event listeners for toggles
liveCountersToggle.addEventListener('change', () => {
  saveSettings();
  if(liveCountersToggle.checked) startLiveCounters();
  else liveCountersData.textContent = "";
});
tradeCalcToggle.addEventListener('change', saveSettings);
devToolsToggle.addEventListener('change', saveSettings);

// Example: Live counters feature — fetch Roblox game's player count & visits (demo with hardcoded gameId)
// Replace with real gameId or dynamic source in your implementation
const gameId = 1818; // Roblox example gameId for demo

function startLiveCounters() {
  liveCountersData.textContent = "Loading live counters...";

  // Roblox API for game stats (note: this API is public but limited)
  const visitsUrl = `https://games.roblox.com/v1/games?universeIds=${gameId}`;

  fetch(visitsUrl)
    .then(res => res.json())
    .then(data => {
      if(data.data && data.data.length > 0) {
        const gameInfo = data.data[0];
        liveCountersData.innerHTML = `
          <strong>Game ID:</strong> ${gameId}<br>
          <strong>Visits:</strong> ${gameInfo.visits.toLocaleString()}<br>
          <strong>Players Online:</strong> ${gameInfo.playing.toLocaleString()}<br>
          <strong>Favorites:</strong> ${gameInfo.favoriteCount.toLocaleString()}<br>
          <strong>Max Players:</strong> ${gameInfo.maxPlayers.toLocaleString()}
        `;
      } else {
        liveCountersData.textContent = "No data found for the game.";
      }
    })
    .catch(err => {
      liveCountersData.textContent = "Error fetching live counters.";
      console.error(err);
    });
}

// Initialize on popup open
loadSettings();
