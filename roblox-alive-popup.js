// Roblox Alive Popup - Full UI created by script - NO ICONS VERSION

// Clear any existing body content
document.body.innerHTML = '';
document.body.style.margin = '0';
document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
document.body.style.backgroundColor = '#f5f5f5';
document.body.style.color = '#222';
document.body.style.minWidth = '350px';
document.body.style.padding = '12px';

// Utility to create elements quickly
function createElem(type, props = {}, ...children) {
  const el = document.createElement(type);
  Object.entries(props).forEach(([k,v]) => {
    if(k === 'className') el.className = v;
    else if(k === 'style') Object.assign(el.style, v);
    else if(k.startsWith('on') && typeof v === 'function') el.addEventListener(k.substring(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if(typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if(child) el.appendChild(child);
  });
  return el;
}

// Basic style injection for buttons and layout
const style = createElem('style');
style.textContent = `
  button {
    background-color: #0078d7;
    border: none;
    color: white;
    padding: 8px 14px;
    margin: 4px 0;
    cursor: pointer;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    transition: background-color 0.3s;
  }
  button:hover {
    background-color: #005ea3;
  }
  h2 {
    margin: 10px 0 6px 0;
    font-size: 18px;
    font-weight: 700;
  }
  .section {
    background: white;
    padding: 10px 14px;
    margin-bottom: 16px;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.1);
  }
  .counter {
    font-weight: 700;
    font-size: 16px;
    margin-top: 6px;
  }
  .small-btn {
    font-size: 13px;
    padding: 6px 10px;
    width: auto;
    margin-left: 8px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .input-field {
    width: 100%;
    padding: 6px 8px;
    font-size: 14px;
    margin-top: 6px;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  label {
    font-weight: 600;
    font-size: 14px;
  }
`;

// Append style
document.head.appendChild(style);

// Create main container
const container = createElem('div', {className: 'container'});

// 1) General Features Section
const generalSection = createElem('div', {className: 'section'});
generalSection.appendChild(createElem('h2', {}, 'General Features'));

// Server info display
const serverInfo = createElem('div');
serverInfo.appendChild(createElem('div', {}, 'Server Region: ', createElem('span', {id:'server-region'}, 'Loading...')));
serverInfo.appendChild(createElem('div', {}, 'Server Version: ', createElem('span', {id:'server-version'}, 'Loading...')));
serverInfo.appendChild(createElem('div', {}, 'Server Uptime: ', createElem('span', {id:'server-uptime'}, 'Loading...')));
generalSection.appendChild(serverInfo);

// Server filters (region, connection, uptime)
const filterTitle = createElem('label', {for:'filter-region'}, 'Server Filters:');
const filterRegionInput = createElem('input', {type:'text', id:'filter-region', placeholder:'Region filter'});
const filterConnectionInput = createElem('input', {type:'text', id:'filter-connection', placeholder:'Connection filter'});
const filterUptimeInput = createElem('input', {type:'text', id:'filter-uptime', placeholder:'Uptime filter'});
generalSection.appendChild(filterTitle);
generalSection.appendChild(filterRegionInput);
generalSection.appendChild(filterConnectionInput);
generalSection.appendChild(filterUptimeInput);

// RoPro theme color customization
generalSection.appendChild(createElem('label', {for:'theme-color'}, 'Customize RoPro Theme Color:'));
const themeColorInput = createElem('input', {type:'color', id:'theme-color', value:'#0078d7'});
generalSection.appendChild(themeColorInput);

// Live counters (like, dislike, favorite, visits, players)
generalSection.appendChild(createElem('div', {style:{marginTop:'10px', fontWeight:'600'}}, 'Live Counters:'));

const liveLikes = createElem('div', {}, 'Likes: ', createElem('span', {id:'live-likes'}, '0'));
const liveDislikes = createElem('div', {}, 'Dislikes: ', createElem('span', {id:'live-dislikes'}, '0'));
const liveFavorites = createElem('div', {}, 'Favorites: ', createElem('span', {id:'live-favorites'}, '0'));
const liveVisits = createElem('div', {}, 'Visits: ', createElem('span', {id:'live-visits'}, '0'));
const livePlayers = createElem('div', {}, 'Players: ', createElem('span', {id:'live-players'}, '0'));

generalSection.appendChild(liveLikes);
generalSection.appendChild(liveDislikes);
generalSection.appendChild(liveFavorites);
generalSection.appendChild(liveVisits);
generalSection.appendChild(livePlayers);

container.appendChild(generalSection);

// 2) Avatar Sandbox Outfits (Save outfits)
const avatarSection = createElem('div', {className: 'section'});
avatarSection.appendChild(createElem('h2', {}, 'Avatar Sandbox'));
const saveOutfitBtn = createElem('button', {id:'save-outfit-btn'}, 'Save Current Outfit');
avatarSection.appendChild(saveOutfitBtn);

container.appendChild(avatarSection);

// 3) Friends Page - More Mutuals
const friendsSection = createElem('div', {className: 'section'});
friendsSection.appendChild(createElem('h2', {}, 'Friends Page'));
const loadMutualsBtn = createElem('button', {id:'load-mutuals-btn'}, 'Load More Mutual Friends');
friendsSection.appendChild(loadMutualsBtn);
container.appendChild(friendsSection);

// 4) Trading Features Section
const tradeSection = createElem('div', {className: 'section'});
tradeSection.appendChild(createElem('h2', {}, 'Trading Features'));

// Trade value calculator input and button
tradeSection.appendChild(createElem('label', {for:'trade-items-input'}, 'Enter trade items (comma separated):'));
const tradeItemsInput = createElem('input', {type:'text', id:'trade-items-input', placeholder:'Item1, Item2, ...'});
tradeSection.appendChild(tradeItemsInput);
const calcTradeValueBtn = createElem('button', {id:'calc-trade-value-btn'}, 'Calculate Trade Value');
tradeSection.appendChild(calcTradeValueBtn);

// Trade demand rating (placeholder display)
const tradeDemandDisplay = createElem('div', {id:'trade-demand-rating', style:{marginTop:'8px', fontWeight:'600'}}, 'Demand Rating: N/A');
tradeSection.appendChild(tradeDemandDisplay);

// More trade panel buttons (placeholders)
const tradePanelBtns = createElem('div', {style:{marginTop:'10px'}});
tradePanelBtns.appendChild(createElem('button', {id:'btn-trade-search'}, 'Trade Search'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-advanced-search', className:'small-btn'}, 'Advanced Search'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-show-value-diff', className:'small-btn'}, 'Show Value Difference'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-rap-requirement', className:'small-btn'}, 'Under/Over RAP'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-trade-warnings', className:'small-btn'}, 'Trade Warnings'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-rolimons-links', className:'small-btn'}, 'Rolimons Links'));
tradePanelBtns.appendChild(createElem('button', {id:'btn-trade-offers'}, 'Trade Offers Page'));
tradeSection.appendChild(tradePanelBtns);

container.appendChild(tradeSection);

// 5) Account Security Features
const securitySection = createElem('div', {className: 'section'});
securitySection.appendChild(createElem('h2', {}, 'Account Security Features'));

securitySection.appendChild(createElem('label', {for:'auto-decline-threshold'}, 'Auto-Decline Loss Threshold (%):'));
const autoDeclineInput = createElem('input', {type:'number', id:'auto-decline-threshold', min:'0', max:'100', value:'50'});
securitySection.appendChild(autoDeclineInput);

securitySection.appendChild(createElem('button', {id:'btn-outbound-trade-protect'}, 'Enable Outbound Trade Protection'));
securitySection.appendChild(createElem('button', {id:'btn-set-cancel-threshold'}, 'Set Trade Cancel Threshold'));

container.appendChild(securitySection);

// Append container to body
document.body.appendChild(container);


// =====================
// Placeholder logic for UI interactions and dummy data updates
// Replace or hook up with your API calls and real logic as needed!

// Update live counters every 10 seconds (dummy random values)
function updateLiveCounters() {
  document.getElementById('live-likes').textContent = Math.floor(Math.random() * 10000);
  document.getElementById('live-dislikes').textContent = Math.floor(Math.random() * 5000);
  document.getElementById('live-favorites').textContent = Math.floor(Math.random() * 20000);
  document.getElementById('live-visits').textContent = Math.floor(Math.random() * 100000);
  document.getElementById('live-players').textContent = Math.floor(Math.random() * 5000);
}
updateLiveCounters();
setInterval(updateLiveCounters, 10000);

// Dummy server info
document.getElementById('server-region').textContent = 'US-East';
document.getElementById('server-version').textContent = 'v1.24.7';
document.getElementById('server-uptime').textContent = '12h 34m';

// Theme color changer
themeColorInput.addEventListener('input', (e) => {
  document.body.style.backgroundColor = e.target.value + '20'; // light transparent bg
});

// Save outfit button
saveOutfitBtn.addEventListener('click', () => {
  alert('Saving outfit... (hook this up to your actual avatar sandbox logic)');
});

// Load more mutuals button
loadMutualsBtn.addEventListener('click', () => {
  alert('Loading more mutual friends... (hook up to friends page enhancements)');
});

// Calculate trade value button
calcTradeValueBtn.addEventListener('click', () => {
  const items = tradeItemsInput.value.split(',').map(i => i.trim()).filter(Boolean);
  if(items.length === 0) {
    alert('Please enter some trade items.');
    return;
  }
  // Dummy calculation: sum length of all item names * 10
  const value = items.reduce((sum, item) => sum + item.length * 10, 0);
  const demandRating = Math.min(5, items.length); // dummy rating
  document.getElementById('trade-demand-rating').textContent = `Demand Rating: ${demandRating}/5, Total Value: ${value} Robux`;
});

// Other trade panel buttons (dummy alerts)
document.getElementById('btn-trade-search').addEventListener('click', () => alert('Trade Search clicked!'));
document.getElementById('btn-advanced-search').addEventListener('click', () => alert('Advanced Search clicked!'));
document.getElementById('btn-show-value-diff').addEventListener('click', () => alert('Value Difference toggled!'));
document.getElementById('btn-rap-requirement').addEventListener('click', () => alert('Under/Over RAP toggled!'));
document.getElementById('btn-trade-warnings').addEventListener('click', () => alert('Trade Warnings toggled!'));
document.getElementById('btn-rolimons-links').addEventListener('click', () => alert('Rolimons links opened!'));
document.getElementById('btn-trade-offers').addEventListener('click', () => alert('Trade Offers page opened!'));

// Account security buttons
document.getElementById('btn-outbound-trade-protect').addEventListener('click', () => alert('Outbound trade protection enabled!'));
document.getElementById('btn-set-cancel-threshold').addEventListener('click', () => {
  const threshold = autoDeclineInput.value;
  alert(`Trade cancel threshold set to ${threshold}%`);
});
