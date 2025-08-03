(() => {
  const app = document.getElementById('app');

  // Create header
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = '🎮 Roblox Alive';
  app.appendChild(header);

  // Helper to create counters with emojis
  function createCounter(label, emoji) {
    const container = document.createElement('div');
    container.className = 'counter';
    container.textContent = `${emoji} ${label}: 0`;
    return container;
  }

  // Create counters
  const visitsCounter = createCounter('Visits', '👁️');
  const likesCounter = createCounter('Likes', '👍');
  const favoritesCounter = createCounter('Favorites', '⭐');
  const playersCounter = createCounter('Players', '🧍');

  app.appendChild(visitsCounter);
  app.appendChild(likesCounter);
  app.appendChild(favoritesCounter);
  app.appendChild(playersCounter);

  // Button example for "Refresh Stats"
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn';
  refreshBtn.textContent = '🔄 Refresh Stats';
  app.appendChild(refreshBtn);

  // Fake API data fetch simulation
  function fetchLiveStats() {
    // You would replace this with real Roblox API calls or extension logic
    // For now, just simulate random numbers
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          visits: Math.floor(Math.random() * 100000),
          likes: Math.floor(Math.random() * 50000),
          favorites: Math.floor(Math.random() * 30000),
          players: Math.floor(Math.random() * 2000),
        });
      }, 700);
    });
  }

  // Update counters on screen
  async function updateStats() {
    const stats = await fetchLiveStats();
    visitsCounter.textContent = `👁️ Visits: ${stats.visits.toLocaleString()}`;
    likesCounter.textContent = `👍 Likes: ${stats.likes.toLocaleString()}`;
    favoritesCounter.textContent = `⭐ Favorites: ${stats.favorites.toLocaleString()}`;
    playersCounter.textContent = `🧍 Players: ${stats.players.toLocaleString()}`;
  }

  // Initial load
  updateStats();

  // Refresh button click
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Loading...';
    updateStats().finally(() => {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Refresh Stats';
    });
  });

  // Bonus: auto refresh every 30 seconds
  setInterval(updateStats, 30000);
})();
