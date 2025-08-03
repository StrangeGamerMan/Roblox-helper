// Roblox Alive - Main Content Script Controller
class RobloxAliveController {
  constructor() {
    this.currentPage = this.detectPageType();
    this.settings = null;
    this.features = {};
    this.init();
  }

  async init() {
    console.log("Roblox Alive v2.0: Initializing...");
    
    try {
      // Load user settings
      this.settings = await this.loadSettings();
      
      // Initialize core features
      await this.initializeFeatures();
      
      // Start page-specific features
      await this.initializePageFeatures();
      
      console.log("Roblox Alive: All features initialized successfully!");
    } catch (error) {
      console.error("Roblox Alive: Initialization error:", error);
    }
  }

  detectPageType() {
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    
    if (path.includes('/games/')) return 'game';
    if (path.includes('/users/')) return 'profile';
    if (path.includes('/groups/')) return 'group';
    if (path.includes('/my/avatar')) return 'avatar';
    if (path.includes('/trades')) return 'trading';
    if (path === '/' || path === '/home') return 'homepage';
    if (path.includes('/discover')) return 'discover';
    if (path.includes('/develop')) return 'develop';
    
    return 'unknown';
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        // Core settings
        'rblxAliveAnimations',
        'rblxAliveGameStats',
        'rblxAliveClickEffects',
        
        // Theme settings
        'rblxAliveProfileThemes',
        'rblxAliveGlobalThemes',
        'rblxAliveSelectedTheme',
        
        // Game features
        'rblxAliveQuickPlay',
        'rblxAliveQuickSearch',
        'rblxAlivePlaytimeTracking',
        'rblxAliveServerFilters',
        'rblxAliveMostPlayed',
        
        // Profile features
        'rblxAliveMutualFriends',
        'rblxAliveReputation',
        'rblxAliveLastOnline',
        'rblxAliveLinkedDiscord',
        
        // Trading features
        'rblxAliveTradingPanel',
        'rblxAliveItemInfo',
        'rblxAliveQuickDecline',
        'rblxAliveQuickCancel'
      ], (result) => {
        const settings = {
          // Set defaults for all settings
          animations: result.rblxAliveAnimations !== false,
          gameStats: result.rblxAliveGameStats !== false,
          clickEffects: result.rblxAliveClickEffects !== false,
          profileThemes: result.rblxAliveProfileThemes !== false,
          globalThemes: result.rblxAliveGlobalThemes !== false,
          selectedTheme: result.rblxAliveSelectedTheme || 'default',
          quickPlay: result.rblxAliveQuickPlay !== false,
          quickSearch: result.rblxAliveQuickSearch !== false,
          playtimeTracking: result.rblxAlivePlaytimeTracking !== false,
          serverFilters: result.rblxAliveServerFilters !== false,
          mostPlayed: result.rblxAliveMostPlayed !== false,
          mutualFriends: result.rblxAliveMutualFriends !== false,
          reputation: result.rblxAliveReputation !== false,
          lastOnline: result.rblxAliveLastOnline !== false,
          linkedDiscord: result.rblxAliveLinkedDiscord !== false,
          tradingPanel: result.rblxAliveTradingPanel !== false,
          itemInfo: result.rblxAliveItemInfo !== false,
          quickDecline: result.rblxAliveQuickDecline !== false,
          quickCancel: result.rblxAliveQuickCancel !== false
        };
        resolve(settings);
      });
    });
  }

  async initializeFeatures() {
    // Initialize feature classes
    this.features.animations = new RobloxAliveAnimations(this.settings);
    this.features.themes = new RobloxAliveThemes(this.settings);
    this.features.profiles = new RobloxAliveProfiles(this.settings);
    this.features.games = new RobloxAliveGames(this.settings);
    this.features.servers = new RobloxAliveServers(this.settings);
    this.features.trading = new RobloxAliveTrading(this.settings);
  }

  async initializePageFeatures() {
    switch (this.currentPage) {
      case 'homepage':
        await this.initializeHomepageFeatures();
        break;
      case 'game':
        await this.initializeGameFeatures();
        break;
      case 'profile':
        await this.initializeProfileFeatures();
        break;
      case 'trading':
        await this.initializeTradingFeatures();
        break;
      case 'avatar':
        await this.initializeAvatarFeatures();
        break;
      default:
        await this.initializeGlobalFeatures();
    }
  }

  async initializeHomepageFeatures() {
    if (this.settings.mostPlayed) {
      await this.features.games.addMostPlayedSection();
    }
    if (this.settings.animations) {
      await this.features.animations.applyHomepageAnimations();
    }
  }

  async initializeGameFeatures() {
    if (this.settings.gameStats) {
      await this.features.games.addEnhancedGameStats();
    }
    if (this.settings.quickPlay) {
      await this.features.games.addQuickPlayFeatures();
    }
    if (this.settings.serverFilters) {
      await this.features.servers.addServerFilters();
    }
  }

  async initializeProfileFeatures() {
    if (this.settings.profileThemes) {
      await this.features.themes.applyProfileTheme();
    }
    if (this.settings.mutualFriends) {
      await this.features.profiles.showMutualFriends();
    }
    if (this.settings.reputation) {
      await this.features.profiles.addReputationSystem();
    }
  }

  async initializeTradingFeatures() {
    if (this.settings.tradingPanel) {
      await this.features.trading.addTradingPanel();
    }
    if (this.settings.quickDecline) {
      await this.features.trading.addQuickActions();
    }
  }

  async initializeAvatarFeatures() {
    // Avatar editor enhancements
    console.log("Roblox Alive: Initializing avatar features...");
  }

  async initializeGlobalFeatures() {
    if (this.settings.animations) {
      await this.features.animations.applyGlobalAnimations();
    }
    if (this.settings.globalThemes) {
      await this.features.themes.applyGlobalTheme();
    }
    if (this.settings.clickEffects) {
      await this.features.animations.initializeClickEffects();
    }
  }
}

// Start Roblox Alive
const robloxAlive = new RobloxAliveController();
