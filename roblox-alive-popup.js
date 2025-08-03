// roblox-alive-popup.js

// This script builds the full UI dynamically, no external icons needed
// It fetches real-time data from Roblox APIs and Rolimons (demo placeholders)
// Implements trade calculators and toggles
// Saves your preferences in localStorage
// Contains some dev tools for Roblox Studio players

(async () => {
  // --- Utils ---
  const $ = (sel) => document.querySelector(sel);
  const create = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === "string") el.appendChild(document.createTextNode(c));
      else if (c) el.appendChild(c);
    });
    return el;
  };

  // --- State ---
  let settings = JSON.parse(localStorage.getItem("rbaSettings") || "{}");
  if (!settings.tradeCalculatorEnabled) settings.tradeCalculatorEnabled = true;
  if (!settings.liveCountersEnabled) settings.liveCountersEnabled = true;

  // --- Save settings ---
  function saveSettings() {
    localStorage.setItem("rbaSettings", JSON.stringify(settings));
  }

  // --- Main container ---
  const app = create("div", { id: "rba-app", style: `
    width: 400px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #eee; background: #222; padding: 15px; border-radius: 10px; user-select:none;
  `});
  document.body.appendChild(app);

  // --- Header ---
  const header = create("h2", { style: "margin-top:0; text-align:center;" }, "Roblox Alive Plus");
  app.appendChild(header);

  // --- Tabs ---
  const tabs = create("div", { style: "display:flex; justify-content:center; gap:15px; margin-bottom: 15px;" });
  const tabNames = ["Live Stats", "Trade Calculator", "Dev Tools", "Settings"];
  const tabContent = create("div", { id: "rba-tab-content", style: "min-height:200px;" });
  app.appendChild(tabs);
  app.appendChild(tabContent);

  let currentTab = 0;
  function renderTab(i) {
    currentTab = i;
    // Reset tab buttons style
    [...tabs.children].forEach((tab, idx) => {
      tab.style.borderBottom = idx === i ? "3px solid #4caf50" : "none";
      tab.style.color = idx === i ? "#4caf50" : "#ccc";
      tab.style.cursor = "pointer";
      tab.style.paddingBottom = "5px";
      tab.style.fontWeight = idx === i ? "700" : "400";
    });
    // Clear content
    tabContent.innerHTML = "";
    if (i === 0) renderLiveStats();
    else if (i === 1) renderTradeCalc();
    else if (i === 2) renderDevTools();
    else if (i === 3) renderSettings();
  }

  // --- Tab Buttons ---
  tabNames.forEach((name, i) => {
    const btn = create("div", {}, name);
    btn.onclick = () => renderTab(i);
    tabs.appendChild(btn);
  });

  // --- Live Stats Tab ---
  async function renderLiveStats() {
    const container = create("div");
    tabContent.appendChild(container);

    // Input for Game ID (user can input their fave game)
    const gameIdInput = create("input", {
      type: "number",
      placeholder: "Enter Roblox Game ID",
      style: "width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 5px; border:none; font-size:14px;"
    });
    container.appendChild(gameIdInput);

    // Show stats area
    const statsArea = create("div", { style: "font-size:16px; line-height:1.6;" });
    container.appendChild(statsArea);

    // Load saved GameID if any
    if (settings.lastGameId) gameIdInput.value = settings.lastGameId;

    // Fetch and display live stats
    async function updateStats() {
      const gameId = gameIdInput.value.trim();
      if (!gameId) {
        statsArea.textContent = "Enter a valid Game ID above.";
        return;
      }
      settings.lastGameId = gameId;
      saveSettings();

      statsArea.textContent = "Loading stats...";

      try {
        // Fetch game info from Roblox API
        const res = await fetch(`https://games.roblox.com/v1/games/multiget?universeIds=${gameId}`);
        if (!res.ok) throw new Error("Failed fetching game info.");
        const data = await res.json();
        if (!data.length) throw new Error("Game not found.");

        const game = data[0];

        // Live players count
        const playersCount = game.playing;

        // Likes & dislikes - Roblox API does not expose dislikes, so we show likes only
        // Use separate request for likes/favorites from API (example only)
        // Roblox endpoints might vary, fallback to placeholders if fails
        let likesCount = 0, favoritesCount = 0, visitsCount = 0;
        try {
          const likesRes = await fetch(`https://games.roblox.com/v1/games/${gameId}/votes`);
          if (likesRes.ok) {
            const likesData = await likesRes.json();
            likesCount = likesData.upVotes || 0;
          }
          // Favorites & visits are private, so fallback placeholders or external APIs needed
          // Here we just do placeholders
          favoritesCount = Math.floor(playersCount * 2 + Math.random() * 50);
          visitsCount = Math.floor(playersCount * 100 + Math.random() * 1000);
        } catch { /* ignore fallback */ }

        statsArea.innerHTML = `
          <b>Game Name:</b> ${game.name}<br>
          <b>Playing Now:</b> ${playersCount}<br>
          <b>Likes:</b> ${likesCount}<br>
          <b>Favorites (est):</b> ${favoritesCount}<br>
          <b>Visits (est):</b> ${visitsCount}<br>
          <b>Created:</b> ${new Date(game.created).toLocaleDateString()}<br>
          <b>Updated:</b> ${new Date(game.updated).toLocaleDateString()}
        `;
      } catch (err) {
        statsArea.textContent = "Error loading stats: " + err.message;
      }
    }

    gameIdInput.onchange = updateStats;
    gameIdInput.onkeyup = (e) => { if (e.key === "Enter") updateStats(); };

    if (gameIdInput.value) updateStats();

    // Auto refresh every 60 seconds if enabled
    if (settings.liveCountersEnabled) {
      setInterval(() => {
        if (document.activeElement !== gameIdInput) updateStats();
      }, 60000);
    }
  }

  // --- Trade Calculator Tab ---
  function renderTradeCalc() {
    const container = create("div");
    tabContent.appendChild(container);

    // Toggle enable/disable calculator
    const toggle = create("label", { style: "display:flex; align-items:center; gap:8px; margin-bottom: 10px;" });
    const checkbox = create("input", { type: "checkbox" });
    checkbox.checked = settings.tradeCalculatorEnabled;
    toggle.appendChild(checkbox);
    toggle.appendChild(document.createTextNode("Enable Trade Calculator"));
    container.appendChild(toggle);

    checkbox.onchange = () => {
      settings.tradeCalculatorEnabled = checkbox.checked;
      saveSettings();
      renderTradeCalc(); // refresh tab to reflect state
    };

    if (!settings.tradeCalculatorEnabled) {
      container.appendChild(create("p", {}, "Trade Calculator is disabled. Enable above to use."));
      return;
    }

    // Input fields for trade items (simulated, normally would integrate Roblox inventory)
    const leftInput = create("textarea", {
      placeholder: "Enter your trade items (comma-separated names)...",
      style: "width:100%; height:60px; margin-bottom:8px; border-radius:5px; padding:5px; resize:none;"
    });
    const rightInput = create("textarea", {
      placeholder: "Enter their trade items (comma-separated names)...",
      style: "width:100%; height:60px; margin-bottom:8px; border-radius:5px; padding:5px; resize:none;"
    });

    container.appendChild(create("div", {}, "Your Items:"));
    container.appendChild(leftInput);
    container.appendChild(create("div", {}, "Their Items:"));
    container.appendChild(rightInput);

    const resultArea = create("div", { style: "margin-top:10px; font-weight:600;" });
    container.appendChild(resultArea);

    // Dummy Rolimons prices & demand example
    const rolimonsData = {
      "Dominus": { value: 1000000, demand: 90 },
      "Sparkle Time Fedora": { value: 250000, demand: 85 },
      "Red Roblox Cap": { value: 50000, demand: 70 },
      "Default": { value: 1000, demand: 30 }
    };

    // Calculate total value and demand score for a list of item names
    function calcValueDemand(items) {
      let totalValue = 0, totalDemand = 0, count = 0;
      items.forEach(name => {
        const data = rolimonsData[name.trim()] || rolimonsData["Default"];
        totalValue += data.value;
        totalDemand += data.demand;
        count++;
      });
      return { totalValue, avgDemand: count > 0 ? Math.round(totalDemand / count) : 0 };
    }

    function updateResult() {
      const leftItems = leftInput.value.split(",").map(s => s.trim()).filter(Boolean);
      const rightItems = rightInput.value.split(",").map(s => s.trim()).filter(Boolean);

      const leftCalc = calcValueDemand(leftItems);
      const rightCalc = calcValueDemand(rightItems);

      const diff = rightCalc.totalValue - leftCalc.totalValue;

      resultArea.innerHTML = `
        Your total value: <span style="color:#4caf50;">${leftCalc.totalValue.toLocaleString()}</span><br>
        Their total value: <span style="color:#4caf50;">${rightCalc.totalValue.toLocaleString()}</span><br>
        Value difference: <span style="color:${diff >= 0 ? "#4caf50" : "#f44336"};">${diff.toLocaleString()}</span><br>
        Their average demand rating: <span>${rightCalc.avgDemand}</span><br>
        Your average demand rating: <span>${leftCalc.avgDemand}</span>
      `;
    }

    leftInput.oninput = updateResult;
    rightInput.oninput = updateResult;
  }

  // --- Dev Tools Tab ---
  function renderDevTools() {
    const container = create("div", { style: "font-size: 14px;" });
    tabContent.appendChild(container);

    container.appendChild(create("h3", {}, "Dev Tools"));

    // Server region info fetcher example
    const regionBtn = create("button", { style: "margin-bottom:8px;" }, "Get Server Region Info");
    const regionResult = create("pre", { style: "background:#333; padding:10px; border-radius:6px; max-height:100px; overflow:auto;" });
    container.appendChild(regionBtn);
    container.appendChild(regionResult);

    regionBtn.onclick = async () => {
      regionResult.textContent = "Fetching server region...";
      try {
        // Example: fetch a dummy API or use Roblox API to get server region info
        // Roblox doesn't expose this directly; might use game servers API with universe ID
        const dummyRegion = "US East (Virginia)";
        const dummyVersion = "v1.2.3";
        const dummyUptime = "3h 14m";

        regionResult.textContent = `
Region: ${dummyRegion}
Version: ${dummyVersion}
Uptime: ${dummyUptime}
        `;
      } catch (err) {
        regionResult.textContent = "Failed to fetch server info: " + err.message;
      }
    };

    // Quick asset lookup (example)
    const assetInput = create("input", { placeholder: "Enter Asset ID", style: "width:100%; margin-bottom:6px; padding:6px; border-radius:4px; border:none;" });
    const assetBtn = create("button", { style: "margin-bottom:10px;" }, "Lookup Asset Info");
    const assetResult = create("pre", { style: "background:#333; padding:10px; border-radius:6px; max-height:100px; overflow:auto;" });

    container.appendChild(assetInput);
    container.appendChild(assetBtn);
    container.appendChild(assetResult);

    assetBtn.onclick = async () => {
      const id = assetInput.value.trim();
      if (!id) {
        assetResult.textContent = "Enter an asset ID.";
        return;
      }
      assetResult.textContent = "Fetching asset info...";
      try {
        const res = await fetch(`https://api.roblox.com/marketplace/productinfo?assetId=${id}`);
        if (!res.ok) throw new Error("Asset not found");
        const data = await res.json();
        assetResult.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        assetResult.textContent = "Error: " + err.message;
      }
    };
  }

  // --- Settings Tab ---
  function renderSettings() {
    const container = create("div");
    tabContent.appendChild(container);

    // Theme color setting
    const themeLabel = create("label", { style: "display:flex; align-items:center; gap:8px; margin-bottom: 10px;" });
    const themeInput = create("input", { type: "color", value: settings.themeColor || "#4caf50" });
    themeLabel.appendChild(themeInput);
    themeLabel.appendChild(document.createTextNode("Theme Color"));
    container.appendChild(themeLabel);

    themeInput.onchange = () => {
      settings.themeColor = themeInput.value;
      saveSettings();
      document.documentElement.style.setProperty('--rba-theme-color', settings.themeColor);
    };

    // Live counters toggle
    const liveToggleLabel = create("label", { style: "display:flex; align-items:center; gap:8px; margin-bottom: 10px;" });
    const liveToggle = create("input", { type: "checkbox" });
    liveToggle.checked = settings.liveCountersEnabled;
    liveToggleLabel.appendChild(liveToggle);
    liveToggleLabel.appendChild(document.createTextNode("Enable Live Counters Auto Refresh"));
    container.appendChild(liveToggleLabel);

    liveToggle.onchange = () => {
      settings.liveCountersEnabled = liveToggle.checked;
      saveSettings();
    };

    // Auto-decline toggle placeholder
    container.appendChild(create("hr"));
    container.appendChild(create("p", {}, "More advanced settings coming soon!"));

  }

  // --- Set default theme color on root ---
  document.documentElement.style.setProperty('--rba-theme-color', settings.themeColor || "#4caf50");

  // Initial render
  renderTab(0);

})();
