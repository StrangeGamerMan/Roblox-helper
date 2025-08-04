// Utility functions for Roblox Pro Extension

class RobloxUtils {
  static async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  static getCurrentGameId() {
    const url = window.location.href;
    const gameIdMatch = url.match(/games\/(\d+)/);
    return gameIdMatch ? gameIdMatch[1] : null;
  }

  static getCurrentUserId() {
    const metaTag = document.querySelector('meta[name="user-data"]');
    if (metaTag) {
      try {
        const userData = JSON.parse(metaTag.getAttribute('data-user'));
        return userData.userid;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  static getTimeAgo(timestamp) {
    const now = new Date().getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  static createButton(text, className = '', onClick = null) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `roblox-pro-btn ${className}`;
    if (onClick) button.addEventListener('click', onClick);
    return button;
  }

  static createPanel(title, content) {
    const panel = document.createElement('div');
    panel.className = 'roblox-pro-panel';
    panel.innerHTML = `
      <div class="roblox-pro-panel-header">
        <h3>${title}</h3>
        <button class="roblox-pro-close">×</button>
      </div>
      <div class="roblox-pro-panel-content">
        ${content}
      </div>
    `;
    
    panel.querySelector('.roblox-pro-close').addEventListener('click', () => {
      panel.remove();
    });
    
    return panel;
  }

  static async getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  static async setStorageData(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }

  static showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `roblox-pro-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Export for use in other scripts
window.RobloxUtils = RobloxUtils;
