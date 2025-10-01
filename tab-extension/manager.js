// State management
let allWindows = [];
let currentWindowId = null;
let searchQuery = '';

// Initialize the manager
async function init() {
  currentWindowId = (await chrome.windows.getCurrent()).id;
  await loadWindows();
  setupEventListeners();
  setupChromeListeners();
}

// Setup Chrome API listeners for real-time updates
function setupChromeListeners() {
  // Listen for tab changes
  chrome.tabs.onCreated.addListener(() => loadWindows());
  chrome.tabs.onRemoved.addListener(() => loadWindows());
  chrome.tabs.onUpdated.addListener(() => loadWindows());
  chrome.tabs.onMoved.addListener(() => loadWindows());
  chrome.tabs.onAttached.addListener(() => loadWindows());
  chrome.tabs.onDetached.addListener(() => loadWindows());
  
  // Listen for window changes
  chrome.windows.onCreated.addListener(() => loadWindows());
  chrome.windows.onRemoved.addListener(() => loadWindows());
}

// Load all windows and tabs
async function loadWindows() {
  const windows = await chrome.windows.getAll({ populate: true });
  allWindows = windows;
  renderWindows();
}

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderWindows();
  });
}

// Render all windows
function renderWindows() {
  const container = document.getElementById('windowsContainer');
  container.innerHTML = '';
  
  const filteredWindows = allWindows.filter(window => {
    if (!searchQuery) return true;
    return window.tabs.some(tab => 
      tab.title.toLowerCase().includes(searchQuery) || 
      tab.url.toLowerCase().includes(searchQuery)
    );
  });
  
  filteredWindows.forEach(window => {
    const windowCard = createWindowCard(window);
    container.appendChild(windowCard);
  });
  
  if (filteredWindows.length === 0) {
    container.innerHTML = '<div class="empty-state">No windows found</div>';
  }
}

// Create a window card
function createWindowCard(window) {
  const card = document.createElement('div');
  card.className = 'window-card';
  card.dataset.windowId = window.id;
  
  const isCurrentWindow = window.id === currentWindowId;
  const windowTitle = isCurrentWindow ? 'Current Window' : `Window ${window.id}`;
  
  const filteredTabs = window.tabs.filter(tab => {
    if (!searchQuery) return true;
    return tab.title.toLowerCase().includes(searchQuery) || 
           tab.url.toLowerCase().includes(searchQuery);
  });
  
  card.innerHTML = `
    <div class="window-header">
      <div class="window-title">
        <svg class="window-title-icon" viewBox="0 0 20 20" fill="${isCurrentWindow ? '#10b981' : '#6b7280'}">
          <circle cx="10" cy="10" r="10"/>
        </svg>
        <span class="window-title-text">${windowTitle}</span>
        <span class="window-title-count">(${filteredTabs.length})</span>
      </div>
      <div class="window-actions">
        <select class="sort-dropdown" data-window-id="${window.id}">
          <option value="default">Default Order</option>
          <option value="title">Sort by Title</option>
          <option value="domain">Sort by Domain</option>
        </select>
        <button class="btn btn-danger btn-close-selected" data-window-id="${window.id}" disabled>
          Close Selected
        </button>
      </div>
    </div>
    <div class="select-all-container">
      <input type="checkbox" class="select-all-checkbox" data-window-id="${window.id}">
      <label class="select-all-label">Select All</label>
    </div>
    <div class="tabs-table" data-window-id="${window.id}">
      ${filteredTabs.map(tab => createTabRow(tab, window.id)).join('')}
    </div>
  `;
  
  // Setup event listeners for this window card
  setupWindowCardListeners(card, window);
  
  return card;
}

// Create a tab row
function createTabRow(tab, windowId) {
  try {
    let urlPath = '';
    try {
      const urlObj = new URL(tab.url);
      const hostname = urlObj.hostname || '';
      const pathname = urlObj.pathname || '';
      const search = urlObj.search || '';
      
      // Combine hostname with path
      urlPath = hostname + pathname + search;
      
      // Truncate if too long
      if (urlPath.length > 80) {
        urlPath = urlPath.substring(0, 77) + '...';
      }
    } catch (e) {
      urlPath = tab.url;
    }
    
    const favicon = tab.favIconUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Crect width=%2216%22 height=%2216%22 fill=%22%23ccc%22/%3E%3C/svg%3E';
    const fallbackIcon = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Crect width=%2216%22 height=%2216%22 fill=%22%23ccc%22/%3E%3C/svg%3E';
    
    // Escape the favicon URL for use in HTML attribute
    const escapedFavicon = favicon.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    // Format metadata
    let metaHtml = '<div class="tab-meta">';
    
    // Last accessed time (if available)
    if (tab.lastAccessed) {
      const timeAgo = getTimeAgo(tab.lastAccessed);
      metaHtml += `<span class="tab-meta-item" title="Last accessed">🕐 ${timeAgo}</span>`;
    }
    
    // Audible indicator
    if (tab.audible) {
      metaHtml += `<span class="tab-meta-item" title="Playing audio">🔊</span>`;
    }
    
    // Pinned indicator
    if (tab.pinned) {
      metaHtml += `<span class="tab-meta-item" title="Pinned">📌</span>`;
    }
    
    metaHtml += '</div>';
    
    return `
      <div class="tab-row" data-tab-id="${tab.id}" data-window-id="${windowId}" draggable="true">
        <input type="checkbox" class="tab-checkbox" data-tab-id="${tab.id}">
        <img src="${escapedFavicon}" class="tab-favicon" data-fallback="${fallbackIcon}">
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title)}</div>
          <div class="tab-url">${escapeHtml(urlPath)}</div>
          ${metaHtml}
        </div>
        <div class="tab-actions">
          <button class="tab-action-btn" data-action="close" data-tab-id="${tab.id}">✕</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error creating tab row:', error, tab);
    return '';
  }
}

// Get human-readable time ago
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Setup event listeners for a window card
function setupWindowCardListeners(card, window) {
  const windowId = window.id;
  
  // Sort dropdown
  const sortDropdown = card.querySelector('.sort-dropdown');
  sortDropdown.addEventListener('change', (e) => {
    sortTabs(windowId, e.target.value);
  });
  
  // Select all checkbox
  const selectAllCheckbox = card.querySelector('.select-all-checkbox');
  selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = card.querySelectorAll('.tab-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateCloseButton(windowId);
  });
  
  // Tab checkboxes
  const tabCheckboxes = card.querySelectorAll('.tab-checkbox');
  tabCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateCloseButton(windowId);
      updateSelectAllCheckbox(windowId);
    });
  });
  
  // Close selected button
  const closeButton = card.querySelector('.btn-close-selected');
  closeButton.addEventListener('click', () => {
    closeSelectedTabs(windowId);
  });
  
  // Tab action buttons
  const actionButtons = card.querySelectorAll('.tab-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const tabId = parseInt(btn.dataset.tabId);
      
      if (action === 'close') {
        chrome.tabs.remove(tabId);
        setTimeout(loadWindows, 100);
      }
    });
  });
  
  // Drag and drop for tab rows
  const tabRows = card.querySelectorAll('.tab-row');
  tabRows.forEach(row => {
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);
  });
  
  // Drag and drop for window card (to drop tabs on empty space)
  card.addEventListener('dragover', handleDragOver);
  card.addEventListener('drop', handleDrop);
  
  // Handle favicon errors
  const favicons = card.querySelectorAll('.tab-favicon');
  favicons.forEach(img => {
    img.addEventListener('error', function() {
      this.src = this.dataset.fallback;
    });
  });
}

// Update close button state
function updateCloseButton(windowId) {
  const card = document.querySelector(`[data-window-id="${windowId}"]`);
  const checkboxes = card.querySelectorAll('.tab-checkbox:checked');
  const closeButton = card.querySelector('.btn-close-selected');
  closeButton.disabled = checkboxes.length === 0;
}

// Update select all checkbox state
function updateSelectAllCheckbox(windowId) {
  const card = document.querySelector(`[data-window-id="${windowId}"]`);
  const allCheckboxes = card.querySelectorAll('.tab-checkbox');
  const checkedCheckboxes = card.querySelectorAll('.tab-checkbox:checked');
  const selectAllCheckbox = card.querySelector('.select-all-checkbox');
  
  selectAllCheckbox.checked = allCheckboxes.length === checkedCheckboxes.length && allCheckboxes.length > 0;
  selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
}

// Close selected tabs
async function closeSelectedTabs(windowId) {
  const card = document.querySelector(`[data-window-id="${windowId}"]`);
  const checkedCheckboxes = card.querySelectorAll('.tab-checkbox:checked');
  const tabIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.dataset.tabId));
  
  if (tabIds.length > 0) {
    await chrome.tabs.remove(tabIds);
    setTimeout(loadWindows, 100);
  }
}

// Extract top-level domain from hostname
function getTopLevelDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    if (!hostname) return url;
    
    // Split by dots and get the last two parts (e.g., google.com, co.uk)
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Handle cases like .co.uk, .com.au, etc.
      const tld = parts.slice(-2).join('.');
      return tld;
    }
    return hostname;
  } catch (e) {
    return url;
  }
}

// Sort tabs
async function sortTabs(windowId, sortType) {
  const window = allWindows.find(w => w.id === windowId);
  if (!window) return;
  
  let sortedTabs = [...window.tabs];
  
  if (sortType === 'title') {
    sortedTabs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortType === 'domain') {
    sortedTabs.sort((a, b) => {
      const domainA = getTopLevelDomain(a.url);
      const domainB = getTopLevelDomain(b.url);
      return domainA.localeCompare(domainB);
    });
  } else {
    // Default order - no sorting needed
    return;
  }
  
  // Move tabs to new positions
  for (let i = 0; i < sortedTabs.length; i++) {
    await chrome.tabs.move(sortedTabs[i].id, { index: i });
  }
  
  setTimeout(loadWindows, 100);
}

// Drag and drop handlers
let draggedElement = null;
let draggedTabId = null;
let draggedWindowId = null;

function handleDragStart(e) {
  draggedElement = e.target;
  draggedTabId = parseInt(e.target.dataset.tabId);
  draggedWindowId = parseInt(e.target.dataset.windowId);
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedTabId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const targetRow = e.target.closest('.tab-row');
  if (targetRow && targetRow !== draggedElement) {
    targetRow.classList.add('drag-over');
  }
  
  // Also allow dropping on window cards
  const targetCard = e.target.closest('.window-card');
  if (targetCard) {
    const tabsTable = targetCard.querySelector('.tabs-table');
    if (tabsTable && !tabsTable.contains(e.target.closest('.tab-row'))) {
      targetCard.classList.add('window-drag-over');
    }
  }
}

function handleDrop(e) {
  e.preventDefault();
  
  const targetRow = e.target.closest('.tab-row');
  const targetCard = e.target.closest('.window-card');
  
  // Case 1: Dropping on a specific tab row
  if (targetRow && targetRow !== draggedElement) {
    const targetTabId = parseInt(targetRow.dataset.tabId);
    const targetWindowId = parseInt(targetRow.dataset.windowId);
    
    // Find the target tab to get its index
    const targetWindow = allWindows.find(w => w.id === targetWindowId);
    if (!targetWindow) return;
    
    const targetTab = targetWindow.tabs.find(t => t.id === targetTabId);
    if (!targetTab) return;
    
    // Move tab to the target window and position
    chrome.tabs.move(draggedTabId, { 
      windowId: targetWindowId, 
      index: targetTab.index 
    });
    
    setTimeout(loadWindows, 100);
  }
  // Case 2: Dropping on a window card (not on a specific tab)
  else if (targetCard) {
    const targetWindowId = parseInt(targetCard.dataset.windowId);
    
    // Only move if dropping on a different window
    if (targetWindowId !== draggedWindowId) {
      // Move tab to the end of the target window
      chrome.tabs.move(draggedTabId, { 
        windowId: targetWindowId, 
        index: -1 
      });
      
      setTimeout(loadWindows, 100);
    }
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  
  // Remove drag-over class from all rows and cards
  document.querySelectorAll('.tab-row').forEach(row => {
    row.classList.remove('drag-over');
  });
  document.querySelectorAll('.window-card').forEach(card => {
    card.classList.remove('window-drag-over');
  });
  
  draggedElement = null;
  draggedTabId = null;
  draggedWindowId = null;
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start the application
init();
