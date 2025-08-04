// Background service worker for Roblox Pro Extension

chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.set({
    autoJoinEnabled: true,
    serverHopEnabled: true,
    playerCountThreshold: 10,
    antiAfkEnabled: false,
    customTheme: 'dark',
    notifications: true,
    autoRefresh: false,
    refreshInterval: 30,
    regionPref: 'auto',
    toolbarPosition: 'top-right',
    compactMode: false,
    friendNotifications: true,
    gameNotifications: true,
    dataCollection: false
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('roblox.com')) {
    // If already on Roblox, open popup instead
    chrome.action.setPopup({popup: "popup.html"});
  } else {
    chrome.tabs.create({ url: "https://www.roblox.com/discover" });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    chrome.notifications.create({
      type: 'basic',
      title: 'Roblox Pro',
      message: request.message
    });
  }
  
  if (request.action === 'openNewTab') {
    chrome.tabs.create({ url: request.url });
  }
  
  if (request.action === 'copyToClipboard') {
    // Handle clipboard operations
    sendResponse({success: true});
  }
});

// Auto-refresh functionality
let refreshIntervals = new Map();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('roblox.com')) {
    chrome.storage.sync.get(['autoRefresh', 'refreshInterval'], (data) => {
      if (data.autoRefresh) {
        if (refreshIntervals.has(tabId)) {
          clearInterval(refreshIntervals.get(tabId));
        }
        
        const interval = setInterval(() => {
          chrome.tabs.reload(tabId);
        }, data.refreshInterval * 1000);
        
        refreshIntervals.set(tabId, interval);
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (refreshIntervals.has(tabId)) {
    clearInterval(refreshIntervals.get(tabId));
    refreshIntervals.delete(tabId);
  }
});

// Friend activity tracking
let friendActivityInterval;

chrome.storage.sync.get(['friendNotifications'], (data) => {
  if (data.friendNotifications) {
    startFriendTracking();
  }
});

function startFriendTracking() {
  if (friendActivityInterval) return;
  
  friendActivityInterval = setInterval(async () => {
    // Check friend activity (mock implementation)
    const friends = await checkFriendActivity();
    friends.forEach(friend => {
      if (friend.justOnline) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Friend Online',
          message: `${friend.name} just came online!`
        });
      }
    });
  }, 60000); // Check every minute
}

async function checkFriendActivity() {
  // Mock friend activity data
  return [
    { name: 'Player123', justOnline: Math.random() > 0.9 },
    { name: 'GameMaster456', justOnline: Math.random() > 0.95 }
  ];
}

// Game update notifications
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.favoriteGames && namespace === 'sync') {
    checkGameUpdates(changes.favoriteGames.newValue || []);
  }
});

function checkGameUpdates(favoriteGames) {
  // Mock game update checking
  favoriteGames.forEach(game => {
    if (Math.random() > 0.98) { // 2% chance of update notification
      chrome.notifications.create({
        type: 'basic',
        title: 'Game Updated',
        message: `${game.name} has been updated!`
      });
    }
  });
}
