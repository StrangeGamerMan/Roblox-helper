document.addEventListener('DOMContentLoaded', function() {
  console.log("Roblox Alive: Popup loaded!");
  
  // Load saved Roblox Alive settings
  chrome.storage.sync.get(['rblxAliveAnimations', 'rblxAliveGameStats', 'rblxAliveClickEffects'], function(result) {
    document.getElementById('rblxAliveAnimations').checked = result.rblxAliveAnimations !== false;
    document.getElementById('rblxAliveGameStats').checked = result.rblxAliveGameStats !== false;
    document.getElementById('rblxAliveClickEffects').checked = result.rblxAliveClickEffects !== false;
    console.log("Roblox Alive: Settings loaded successfully!");
  });

  // Save Roblox Alive settings
  document.getElementById('rblxAliveSaveSettings').addEventListener('click', function() {
    const robloxAliveSettings = {
      rblxAliveAnimations: document.getElementById('rblxAliveAnimations').checked,
      rblxAliveGameStats: document.getElementById('rblxAliveGameStats').checked,
      rblxAliveClickEffects: document.getElementById('rblxAliveClickEffects').checked
    };
    
    chrome.storage.sync.set(robloxAliveSettings, function() {
      console.log("Roblox Alive: Settings saved successfully!");
      
      // Show saved confirmation
      const button = document.getElementById('rblxAliveSaveSettings');
      const status = document.getElementById('rblxAliveSaveStatus');
      
      button.textContent = 'Saved!';
      status.textContent = 'Settings saved successfully!';
      
      setTimeout(() => {
        button.textContent = 'Save Settings';
        status.textContent = '';
      }, 2000);
      
      // Notify content script to reload settings
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('roblox.com')) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
