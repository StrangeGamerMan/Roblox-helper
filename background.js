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
    refreshInterval: 30
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
      iconUrl: 'icon48.png',
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
