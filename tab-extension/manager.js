// State management
let allWindows = [];
let currentWindowId = null;
let currentTabId = null;
let searchQuery = '';
let selectedTabIds = new Set(); // Track selected tab IDs across re-renders

const SORT_ORDERS = ['default', 'title', 'domain'];
const SORT_LABELS = { default: 'Default Order', title: 'Sort by Title', domain: 'Sort by Domain' };

// windowId of the currently open compact "move to" popup menu, if any
let openMoveToMenuId = null;

// Initialize the manager
async function init() {
  const currentWindow = await chrome.windows.getCurrent();
  currentWindowId = currentWindow.id;
  
  // Get the current active tab
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = currentTab ? currentTab.id : null;
  
  await loadWindows();
  setupEventListeners();
  setupChromeListeners();
}

// Setup Chrome API listeners for real-time updates
function setupChromeListeners() {
  // Listen for tab changes
  chrome.tabs.onCreated.addListener(() => scheduleReload());
  chrome.tabs.onRemoved.addListener(() => scheduleReload());
  chrome.tabs.onUpdated.addListener(() => scheduleReload());
  chrome.tabs.onMoved.addListener(() => scheduleReload());
  chrome.tabs.onAttached.addListener(() => scheduleReload());
  chrome.tabs.onDetached.addListener(() => scheduleReload());

  // Listen for window changes
  chrome.windows.onCreated.addListener(() => scheduleReload());
  chrome.windows.onRemoved.addListener(() => scheduleReload());

  // Re-render (if one was deferred) as soon as the user is done
  // interacting with a dropdown, instead of leaving it stale.
  document.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'SELECT') {
      // Let focus settle in case it moved to another dropdown.
      setTimeout(maybeFlushPendingRender, 0);
    }
  }, true);

  // Close the compact "move to" popup when clicking outside it, or on Escape.
  document.addEventListener('click', (e) => {
    if (openMoveToMenuId !== null && !e.target.closest('.move-to-compact')) {
      closeMoveToMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openMoveToMenuId !== null) {
      closeMoveToMenu();
    }
  });
}

// Re-render now if one was deferred and the user is no longer mid-interaction
// with a dropdown or the compact move-to popup.
function maybeFlushPendingRender() {
  if (renderPending && !isUserInteractingWithDropdown()) {
    renderWindows();
  }
}

// Toggle the compact "move to" popup menu for a window, closing any other open one.
function toggleMoveToMenu(windowId, menuEl) {
  if (openMoveToMenuId === windowId) {
    closeMoveToMenu();
    return;
  }
  closeMoveToMenu();
  menuEl.classList.add('open');
  openMoveToMenuId = windowId;
}

function closeMoveToMenu() {
  if (openMoveToMenuId === null) return;
  const openMenu = document.querySelector('.move-to-menu.open');
  if (openMenu) openMenu.classList.remove('open');
  openMoveToMenuId = null;
  maybeFlushPendingRender();
}

// Coalesce bursts of tab events (e.g. a page rapidly changing its title
// or favicon) into a single reload instead of one per event.
let reloadTimeout = null;
function scheduleReload() {
  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(loadWindows, 300);
}

// True while the user has a sort/move dropdown focused, or the compact
// move-to popup open. Used to avoid tearing down and rebuilding the DOM
// (which would close them) out from under them mid-interaction.
function isUserInteractingWithDropdown() {
  const active = document.activeElement;
  if (active && active.tagName === 'SELECT') return true;
  return openMoveToMenuId !== null;
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
  
  const mergeAllBtn = document.getElementById('mergeAllBtn');
  mergeAllBtn.addEventListener('click', mergeAllWindows);
  
  const closeDuplicatesBtn = document.getElementById('closeDuplicatesBtn');
  closeDuplicatesBtn.addEventListener('click', closeDuplicateTabs);
}

// Render all windows
let renderPending = false;
function renderWindows() {
  // Don't yank the DOM out from under an open dropdown - it would close
  // it and drop the interaction. Defer until the user is done with it.
  if (isUserInteractingWithDropdown()) {
    renderPending = true;
    return;
  }
  renderPending = false;

  // Save current checkbox selections before re-rendering
  saveCheckboxSelections();
  
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

  // Restore checkbox selections after re-rendering
  restoreCheckboxSelections();

  if (filteredWindows.length === 0) {
    container.innerHTML = '<div class="empty-state">No windows found</div>';
    container.style.height = '';
    return;
  }

  layoutMasonry();
}

// Masonry layout: pack window cards into columns like Tetris, so a short
// card doesn't leave a tall gap under it just because its row neighbor is tall.
const MASONRY_MIN_COL_WIDTH = 420;
const MASONRY_GAP = 16;

function layoutMasonry() {
  const container = document.getElementById('windowsContainer');
  const cards = Array.from(container.children).filter(el => el.classList.contains('window-card'));
  if (cards.length === 0) {
    container.style.height = '';
    return;
  }

  const containerWidth = container.clientWidth;
  const columns = Math.max(1, Math.floor((containerWidth + MASONRY_GAP) / (MASONRY_MIN_COL_WIDTH + MASONRY_GAP)));
  const colWidth = (containerWidth - MASONRY_GAP * (columns - 1)) / columns;
  const colHeights = new Array(columns).fill(0);

  cards.forEach(card => {
    // Place each card in whichever column is currently shortest.
    let col = 0;
    for (let i = 1; i < columns; i++) {
      if (colHeights[i] < colHeights[col]) col = i;
    }
    card.style.width = `${colWidth}px`;
    card.style.left = `${col * (colWidth + MASONRY_GAP)}px`;
    card.style.top = `${colHeights[col]}px`;
    colHeights[col] += card.offsetHeight + MASONRY_GAP;
  });

  container.style.height = `${Math.max(...colHeights) - MASONRY_GAP}px`;
}

// Re-run the masonry layout on resize (debounced) without refetching tab data.
let masonryResizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(masonryResizeTimeout);
  masonryResizeTimeout = setTimeout(layoutMasonry, 100);
});

// Turn a 0-based index into a spreadsheet-style label: A, B, ... Z, AA, AB, ...
function indexToLetters(index) {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

// Chrome's window ids are long and arbitrary, which crowded out the header
// controls. Show a short, stable label instead (based on ascending window
// id, so it doesn't reshuffle just from re-rendering or filtering).
function getWindowLabel(windowId) {
  if (windowId === currentWindowId) return 'Current';
  const otherIds = allWindows
    .map(w => w.id)
    .filter(id => id !== currentWindowId)
    .sort((a, b) => a - b);
  const idx = otherIds.indexOf(windowId);
  return idx === -1 ? 'Window' : indexToLetters(idx);
}

// Create a window card
function createWindowCard(window) {
  const card = document.createElement('div');
  card.className = 'window-card';
  card.dataset.windowId = window.id;

  const isCurrentWindow = window.id === currentWindowId;
  if (isCurrentWindow) card.classList.add('current-window');
  const windowTitle = getWindowLabel(window.id);

  const filteredTabs = window.tabs.filter(tab => {
    if (!searchQuery) return true;
    return tab.title.toLowerCase().includes(searchQuery) || 
           tab.url.toLowerCase().includes(searchQuery);
  });
  
  card.innerHTML = `
    <div class="window-header">
      <div class="window-title">
        <span class="window-title-text" title="Window ID: ${window.id}">${windowTitle}</span>
        <span class="window-title-count">(${filteredTabs.length})</span>
      </div>
      <div class="window-actions">
        <select class="sort-dropdown" data-window-id="${window.id}">
          <option value="default">Default Order</option>
          <option value="title">Sort by Title</option>
          <option value="domain">Sort by Domain</option>
        </select>
        <button class="btn btn-icon sort-icon-btn" data-window-id="${window.id}" data-sort="default" title="Sort: Default Order">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 5h10"></path>
            <path d="M11 9h7"></path>
            <path d="M11 13h4"></path>
            <path d="m3 17 3 3 3-3"></path>
            <path d="M6 18V4"></path>
          </svg>
        </button>

        <select class="move-to-dropdown" data-window-id="${window.id}" disabled>
          <option value="">Move to...</option>
        </select>
        <div class="move-to-compact">
          <button class="btn btn-icon move-to-icon-btn" data-window-id="${window.id}" disabled title="Move to...">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
          <div class="move-to-menu" data-window-id="${window.id}"></div>
        </div>

        <button class="btn btn-danger btn-close-selected" data-window-id="${window.id}" disabled title="Close Selected">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
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
    
    // Format metadata (only icons, no time)
    let metaHtml = '<div class="tab-meta">';
    
    // Audible indicator
    if (tab.audible) {
      metaHtml += `<span class="tab-meta-item" title="Playing audio">🔊</span>`;
    }
    
    // Pinned indicator
    if (tab.pinned) {
      metaHtml += `<span class="tab-meta-item" title="Pinned">📌</span>`;
    }
    
    metaHtml += '</div>';
    
    // Time ago for top right
    let timeAgoHtml = '';
    if (tab.lastAccessed) {
      const timeAgo = getTimeAgo(tab.lastAccessed);
      timeAgoHtml = `<span class="tab-time" title="Last accessed">${timeAgo}</span>`;
    }
    
    const isCurrentTab = tab.id === currentTabId;
    const tabRowClass = isCurrentTab ? 'tab-row current-tab' : 'tab-row';
    
    return `
      <div class="${tabRowClass}" data-tab-id="${tab.id}" data-window-id="${windowId}" draggable="true">
        <input type="checkbox" class="tab-checkbox" data-tab-id="${tab.id}">
        <img src="${escapedFavicon}" class="tab-favicon" data-fallback="${fallbackIcon}">
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title)}${isCurrentTab ? ' (Current)' : ''}</div>
          <div class="tab-url">${escapeHtml(urlPath)}</div>
          ${metaHtml}
        </div>
        ${timeAgoHtml}
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
    // The choice is committed and the popup is already closed at this
    // point, so release focus rather than holding up the next re-render.
    e.target.blur();
  });

  // Compact sort button - cycles through the same sort orders, for narrow cards
  const sortIconBtn = card.querySelector('.sort-icon-btn');
  sortIconBtn.addEventListener('click', () => {
    const nextIndex = (SORT_ORDERS.indexOf(sortIconBtn.dataset.sort) + 1) % SORT_ORDERS.length;
    const next = SORT_ORDERS[nextIndex];
    sortIconBtn.dataset.sort = next;
    sortIconBtn.title = `Sort: ${SORT_LABELS[next]}`;
    sortDropdown.value = next; // keep the wide dropdown in sync
    sortTabs(windowId, next);
  });

  // Move to dropdown - populate with other windows
  const moveToDropdown = card.querySelector('.move-to-dropdown');
  const moveToMenu = card.querySelector('.move-to-menu');
  allWindows.forEach(w => {
    if (w.id !== windowId) {
      const label = getWindowLabel(w.id);

      const option = document.createElement('option');
      option.value = w.id;
      option.textContent = label;
      moveToDropdown.appendChild(option);

      const menuItem = document.createElement('button');
      menuItem.type = 'button';
      menuItem.className = 'move-to-menu-item';
      menuItem.textContent = label;
      menuItem.addEventListener('click', () => {
        moveSelectedTabs(windowId, w.id);
        closeMoveToMenu();
      });
      moveToMenu.appendChild(menuItem);
    }
  });

  moveToDropdown.addEventListener('change', (e) => {
    if (e.target.value) {
      moveSelectedTabs(windowId, parseInt(e.target.value));
      e.target.value = ''; // Reset dropdown
    }
  });

  // Compact move-to button - opens a popup menu instead of a native select
  const moveToIconBtn = card.querySelector('.move-to-icon-btn');
  moveToIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (moveToIconBtn.disabled) return;
    toggleMoveToMenu(windowId, moveToMenu);
  });
  
  // Select all checkbox
  const selectAllCheckbox = card.querySelector('.select-all-checkbox');
  selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = card.querySelectorAll('.tab-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
      const tabId = parseInt(cb.dataset.tabId);
      if (e.target.checked) {
        selectedTabIds.add(tabId);
      } else {
        selectedTabIds.delete(tabId);
      }
    });
    updateCloseButton(windowId);
    updateMoveToButton(windowId);
  });
  
  // Tab checkboxes
  const tabCheckboxes = card.querySelectorAll('.tab-checkbox');
  tabCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const tabId = parseInt(checkbox.dataset.tabId);
      if (checkbox.checked) {
        selectedTabIds.add(tabId);
      } else {
        selectedTabIds.delete(tabId);
      }
      updateCloseButton(windowId);
      updateMoveToButton(windowId);
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
        selectedTabIds.delete(tabId); // Remove from selections
        chrome.tabs.remove(tabId);
        setTimeout(loadWindows, 100);
      }
    });
  });
  
  // Click handler for tab rows - toggle checkbox when clicking empty space
  const tabRows = card.querySelectorAll('.tab-row');
  tabRows.forEach(row => {
    const tabId = parseInt(row.dataset.tabId);
    const windowId = parseInt(row.dataset.windowId);
    const checkbox = row.querySelector('.tab-checkbox');
    
    row.addEventListener('click', (e) => {
      // Don't handle clicks on interactive elements
      if (e.target.closest('.tab-checkbox') || 
          e.target.closest('.tab-action-btn') || 
          e.target.closest('.tab-title')) {
        return;
      }
      
      // Toggle checkbox when clicking empty space
      e.stopPropagation();
      checkbox.checked = !checkbox.checked;
      
      // Update selected tabs
      if (checkbox.checked) {
        selectedTabIds.add(tabId);
      } else {
        selectedTabIds.delete(tabId);
      }
      
      updateCloseButton(windowId);
      updateMoveToButton(windowId);
      updateSelectAllCheckbox(windowId);
    });
  });
  
  // Click handler for tab titles - only activate on actual text
  const tabTitles = card.querySelectorAll('.tab-title');
  tabTitles.forEach(title => {
    const tabRow = title.closest('.tab-row');
    const tabId = parseInt(tabRow.dataset.tabId);
    const windowId = parseInt(tabRow.dataset.windowId);
    
    title.addEventListener('click', (e) => {
      e.stopPropagation();
      // Switch to the tab
      chrome.tabs.update(tabId, { active: true });
      // Focus the window
      chrome.windows.update(windowId, { focused: true });
    });
  });
  
  // Add drag and drop handlers to the existing tabRows
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
  if (!card) return; // window's card may be filtered out by search
  const checkboxes = card.querySelectorAll('.tab-checkbox:checked');
  const closeButton = card.querySelector('.btn-close-selected');
  closeButton.disabled = checkboxes.length === 0;
}

// Update move to button state
function updateMoveToButton(windowId) {
  const card = document.querySelector(`[data-window-id="${windowId}"]`);
  if (!card) return; // window's card may be filtered out by search
  const checkboxes = card.querySelectorAll('.tab-checkbox:checked');
  const moveToDropdown = card.querySelector('.move-to-dropdown');
  moveToDropdown.disabled = checkboxes.length === 0;
  const moveToIconBtn = card.querySelector('.move-to-icon-btn');
  moveToIconBtn.disabled = checkboxes.length === 0;
}

// Update select all checkbox state
function updateSelectAllCheckbox(windowId) {
  const card = document.querySelector(`[data-window-id="${windowId}"]`);
  if (!card) return; // window's card may be filtered out by search
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
    // Remove from selectedTabIds since we're closing them
    tabIds.forEach(tabId => selectedTabIds.delete(tabId));
    await chrome.tabs.remove(tabIds);
    setTimeout(loadWindows, 100);
  }
}

// Move selected tabs to another window
async function moveSelectedTabs(fromWindowId, toWindowId) {
  const card = document.querySelector(`[data-window-id="${fromWindowId}"]`);
  const checkedCheckboxes = card.querySelectorAll('.tab-checkbox:checked');
  const tabIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.dataset.tabId));
  
  if (tabIds.length > 0) {
    for (const tabId of tabIds) {
      await chrome.tabs.move(tabId, { windowId: toWindowId, index: -1 });
    }
    // Keep selections after moving (tabs still exist, just in different window)
    setTimeout(loadWindows, 100);
  }
}

// Close duplicate tabs in each window (by URL)
async function closeDuplicateTabs() {
  if (allWindows.length === 0) {
    return; // No windows to process
  }
  
  // Disable the button during processing
  const closeDuplicatesBtn = document.getElementById('closeDuplicatesBtn');
  closeDuplicatesBtn.disabled = true;
  closeDuplicatesBtn.textContent = 'Closing Duplicates...';
  
  try {
    let totalClosed = 0;
    
    // Process each window separately
    for (const window of allWindows) {
      const tabsToClose = [];
      const seenUrls = new Map(); // Map URL to first tab that has it
      
      // Go through tabs and identify duplicates
      for (const tab of window.tabs) {
        if (seenUrls.has(tab.url)) {
          // This is a duplicate - but never close the current active tab
          if (tab.id !== currentTabId) {
            tabsToClose.push(tab.id);
          }
        } else {
          // First time seeing this URL - keep it
          seenUrls.set(tab.url, tab);
        }
      }
      
      // Close duplicate tabs in this window
      if (tabsToClose.length > 0) {
        // Remove from selectedTabIds since we're closing them
        tabsToClose.forEach(tabId => selectedTabIds.delete(tabId));
        await chrome.tabs.remove(tabsToClose);
        totalClosed += tabsToClose.length;
      }
    }
    
    // Show a brief notification of how many duplicates were closed
    if (totalClosed > 0) {
      console.log(`Closed ${totalClosed} duplicate tabs`);
    }
    
    setTimeout(loadWindows, 200);
  } finally {
    // Re-enable the button
    setTimeout(() => {
      closeDuplicatesBtn.disabled = false;
      closeDuplicatesBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Close Duplicates
      `;
    }, 300);
  }
}

// Merge all tabs from all windows into the current window
async function mergeAllWindows() {
  if (allWindows.length <= 1) {
    return; // Nothing to merge
  }
  
  // Disable the button during merge
  const mergeBtn = document.getElementById('mergeAllBtn');
  mergeBtn.disabled = true;
  mergeBtn.textContent = 'Merging...';
  
  try {
    // Get all tabs from all windows except the current window
    const tabsToMove = [];
    
    for (const window of allWindows) {
      if (window.id !== currentWindowId) {
        tabsToMove.push(...window.tabs.map(tab => tab.id));
      }
    }
    
    // Move all tabs to the current window
    for (const tabId of tabsToMove) {
      await chrome.tabs.move(tabId, { windowId: currentWindowId, index: -1 });
    }
    
    // Close empty windows
    for (const window of allWindows) {
      if (window.id !== currentWindowId) {
        try {
          await chrome.windows.remove(window.id);
        } catch (e) {
          // Window might already be closed
          console.log('Window already closed:', window.id);
        }
      }
    }
    
    setTimeout(loadWindows, 200);
  } finally {
    // Re-enable the button
    setTimeout(() => {
      mergeBtn.disabled = false;
      mergeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
          <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
          <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        Merge All
      `;
    }, 300);
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
      
      // First, compare by top-level domain
      const domainCompare = domainA.localeCompare(domainB);
      if (domainCompare !== 0) {
        return domainCompare;
      }
      
      // If top-level domains are the same, compare by full URL (hostname + path)
      try {
        const urlA = new URL(a.url);
        const urlB = new URL(b.url);
        const fullA = urlA.hostname + urlA.pathname;
        const fullB = urlB.hostname + urlB.pathname;
        return fullA.localeCompare(fullB);
      } catch (e) {
        return a.url.localeCompare(b.url);
      }
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
  
  // Clear all previous drag-over indicators first
  document.querySelectorAll('.tab-row').forEach(row => {
    row.classList.remove('drag-over');
  });
  document.querySelectorAll('.window-card').forEach(card => {
    card.classList.remove('window-drag-over');
  });
  
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

// Save checkbox selections before re-rendering
function saveCheckboxSelections() {
  const checkboxes = document.querySelectorAll('.tab-checkbox:checked');
  checkboxes.forEach(checkbox => {
    const tabId = parseInt(checkbox.dataset.tabId);
    selectedTabIds.add(tabId);
  });
}

// Restore checkbox selections after re-rendering
function restoreCheckboxSelections() {
  // Remove tab IDs that no longer exist
  const allCurrentTabIds = new Set();
  allWindows.forEach(window => {
    window.tabs.forEach(tab => {
      allCurrentTabIds.add(tab.id);
    });
  });
  
  // Clean up selectedTabIds - remove tabs that no longer exist
  selectedTabIds.forEach(tabId => {
    if (!allCurrentTabIds.has(tabId)) {
      selectedTabIds.delete(tabId);
    }
  });
  
  // Restore checkboxes
  selectedTabIds.forEach(tabId => {
    const checkbox = document.querySelector(`.tab-checkbox[data-tab-id="${tabId}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
  
  // Update button states for each window
  allWindows.forEach(window => {
    updateCloseButton(window.id);
    updateMoveToButton(window.id);
    updateSelectAllCheckbox(window.id);
  });
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start the application
init();
