(() => {
  const content = document.getElementById('content');
  const tabs = document.querySelectorAll('.tab');

  // Keep track of user settings in localStorage
  const SETTINGS_KEY = 'robloxAliveSettings';

  let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
    autoDeclineEnabled: false,
    autoDeclineThreshold: 50, // percent
    outboundTradeProtection: false,
    outboundCancelThreshold: 30, // minutes
    themeColor: '#4caf50',
  };

  // Utility: save settings
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      document.querySelector('.tab.active').classList.remove('active');
      tab.classList.add('active');
      renderTab(tab.dataset.tab);
    });
  });

  // Create UI elements helpers
  function createCounterRow(label, emoji, value = 0) {
    const div = document.createElement('div');
    div.className = 'counter';
    div.innerHTML = `<span>${emoji} ${label}</span><span>${value}</span>`;
    return div;
  }

  function createToggle(labelText, checked, onChange) {
    const label = document.createElement('label');
    label.className = 'toggle-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    label.appendChild(input);
    label.appendChild(document.createTextNode(labelText));
    return label;
  }

  function createNumberInput(labelText, value, min, max, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '10px 0';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.marginRight = '10px';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = min;
    input.max = max;
    input.value = value;
    input.addEventListener('input', () => {
      let val = parseInt(input.value);
      if (isNaN(val)) val = min;
      if (val < min) val = min;
      if (val > max) val = max;
      input.value = val;
      onChange(val);
    });
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  // Simulated live stats data
  let liveStats = {
    visits: 123456,
    likes: 54321,
    favorites: 12000,
    players: 874,
  };

  // Update live stats (simulate with random deltas)
  function updateLiveStats() {
    liveStats.visits += Math.floor(Math.random() * 50);
    liveStats.likes += Math.floor(Math.random() * 20);
    liveStats.favorites += Math.floor(Math.random() * 15);
    liveStats.players = Math.max(1, liveStats.players + Math.floor(Math.random() * 11 - 5));
  }

  // General Tab
  function renderGeneral() {
    content.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'section-header';
    header.textContent = 'General Features';

    const visits = createCounterRow('Visits', '👁️', liveStats.visits.toLocaleString());
    const likes = createCounterRow('Likes', '👍', liveStats.likes.toLocaleString());
    const favorites = createCounterRow('Favorites', '⭐', liveStats.favorites.toLocaleString());
    const players = createCounterRow('Players', '🧍', liveStats.players.toLocaleString());

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn';
    refreshBtn.textContent = '🔄 Refresh Stats';
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '⏳ Loading...';
      setTimeout(() => {
        updateLiveStats();
        visits.querySelector('span:last-child').textContent = liveStats.visits.toLocaleString();
        likes.querySelector('span:last-child').textContent = liveStats.likes.toLocaleString();
        favorites.querySelector('span:last-child').textContent = liveStats.favorites.toLocaleString();
        players.querySelector('span:last-child').textContent = liveStats.players.toLocaleString();
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄 Refresh Stats';
      }, 1000);
    });

    content.appendChild(header);
    content.appendChild(visits);
    content.appendChild(likes);
    content.appendChild(favorites);
    content.appendChild(players);
    content.appendChild(refreshBtn);

    // Placeholder for “Save Avatar Sandbox Outfits” button
    const avatarBtn = document.createElement('button');
    avatarBtn.className = 'btn';
    avatarBtn.textContent = '💾 Save Avatar Sandbox Outfits (coming soon)';
    avatarBtn.disabled = true;
    content.appendChild(avatarBtn);
  }

  // Trading Tab
  function renderTrading() {
    content.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'section-header';
    header.textContent = 'Trading Features';

    // Auto Decline toggle + threshold
    const autoDeclineToggle = createToggle('Enable Auto-Decline Bad Trades', settings.autoDeclineEnabled, enabled => {
      settings.autoDeclineEnabled = enabled;
      saveSettings();
    });

    const thresholdInput = createNumberInput('Decline Loss Threshold (%)', settings.autoDeclineThreshold, 1, 100, val => {
      settings.autoDeclineThreshold = val;
      saveSettings();
    });

    // Trade notifier toggle
    const tradeNotifierToggle = createToggle('Enable Trade Notifier', settings.tradeNotifierEnabled || false, enabled => {
      settings.tradeNotifierEnabled = enabled;
      saveSettings();
    });

    // More placeholders for other trading features
    const comingSoon = document.createElement('div');
    comingSoon.className = 'status-msg';
    comingSoon.textContent = 'Advanced trading calculators and demand ratings coming soon!';

    content.appendChild(header);
    content.appendChild(autoDeclineToggle);
    content.appendChild(thresholdInput);
    content.appendChild(tradeNotifierToggle);
    content.appendChild(comingSoon);
  }

  // Account Security Tab
  function renderSecurity() {
    content.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'section-header';
    header.textContent = 'Account Security Features';

    // Outbound trade protection toggle + cancel threshold input
    const outboundProtectionToggle = createToggle('Enable Outbound Trade Protection', settings.outboundTradeProtection, enabled => {
      settings.outboundTradeProtection = enabled;
      saveSettings();
    });

    const cancelThresholdInput = createNumberInput('Cancel Outbound Trade After (minutes)', settings.outboundCancelThreshold, 1, 120, val => {
      settings.outboundCancelThreshold = val;
      saveSettings();
    });

    content.appendChild(header);
    content.appendChild(outboundProtectionToggle);
    content.appendChild(cancelThresholdInput);

    const note = document.createElement('div');
    note.className = 'status-msg';
    note.textContent = 'Your settings are saved locally.';
    content.appendChild(note);
  }

  // Initial render of General tab
  renderGeneral();

  // Tab switch handler
  function renderTab(tabName) {
    switch (tabName) {
      case 'general':
        renderGeneral();
        break;
      case 'trading':
        renderTrading();
        break;
      case 'security':
        renderSecurity();
        break;
    }
  }

  // Auto refresh live stats every 20 seconds
  setInterval(() => {
    updateLiveStats();
    if (document.querySelector('.tab.active').dataset.tab === 'general') {
      renderGeneral();
    }
  }, 20000);
})();
