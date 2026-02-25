// Content script that injects Gmail Unread Counter into Gmail page

// Wait for Gmail to load
function waitForGmail() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // Check if Gmail's main container is loaded
      const gmailContainer = document.querySelector('div[role="main"]') || 
                            document.querySelector('.nH') ||
                            document.querySelector('.aeN');
      if (gmailContainer) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500);
  });
}

// Create and inject the extension UI
function createExtensionUI() {
  // Check if already injected
  if (document.getElementById('gmail-unread-extension')) {
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'gmail-unread-extension';
  container.className = 'gmail-unread-container';
  
  // Create header with close button
  const header = document.createElement('div');
  header.className = 'gmail-unread-header';
  header.innerHTML = `
    <h1>
      Gmail Unread Messages
      <span id="unread-count" class="gmail-unread-badge">0</span>
    </h1>
    <div class="gmail-unread-header-right">
      <div id="status-indicator"></div>
      <button id="toggle-size" class="gmail-unread-toggle-btn" title="Minimize/Maximize">▾</button>
      <button id="close-btn" class="gmail-unread-close-btn" title="Close">×</button>
    </div>
  `;
  
  // Create login container
  const loginContainer = document.createElement('div');
  loginContainer.id = 'login-container';
  loginContainer.innerHTML = `
    <button id="login">Sign in with Google</button>
  `;
  
  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.id = 'content';
  contentContainer.className = 'hidden';
  contentContainer.innerHTML = `
    <div id="senders-container">
      <h2>Top Senders</h2>
      <ul id="senders-list"></ul>
    </div>
  `;
  
  // Create footer
  const footer = document.createElement('div');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-top">
      <button id="refresh">Refresh</button>
      <button id="logout" class="hidden">Sign Out</button>
    </div>
    <div class="account-info" id="account-info">
      <span>Account: </span><span id="user-email">Not signed in</span>
    </div>
    <div class="build-info" id="build-info"></div>
  `;
  
  // Assemble container
  container.appendChild(header);
  container.appendChild(loginContainer);
  container.appendChild(contentContainer);
  container.appendChild(footer);
  
  // Inject into page
  document.body.appendChild(container);
  
  // Initialize extension logic
  initializeExtension();
  
  // Setup close button
  document.getElementById('close-btn').addEventListener('click', () => {
    container.style.display = 'none';
  });

  // Setup minimize/maximize toggle
  document.getElementById('toggle-size')?.addEventListener('click', () => {
    const isCollapsed = container.classList.toggle('collapsed');
    const toggleBtn = document.getElementById('toggle-size');
    if (toggleBtn) {
      toggleBtn.textContent = isCollapsed ? '▸' : '▾';
    }
  });

  try {
    const manifest = chrome.runtime.getManifest();
    const stamp = manifest.version_name || manifest.version;
    const buildInfo = document.getElementById('build-info');
    if (buildInfo) {
      buildInfo.textContent = `Build: ${stamp}`;
      buildInfo.title = `Build: ${stamp}`;
    }
  } catch (e) {
    // ignore
  }
  
  // Make container draggable
  makeDraggable(container, header);
}

// Make the container draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    // Don't drag if clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.id === 'status-indicator') {
      return;
    }
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Initialize extension logic (similar to popup.js)
function initializeExtension() {
  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');
  const refreshButton = document.getElementById('refresh');
  const loginContainer = document.getElementById('login-container');
  const contentContainer = document.getElementById('content');
  const statusIndicator = document.getElementById('status-indicator');
  const unreadCount = document.getElementById('unread-count');
  const sendersList = document.getElementById('senders-list');
  const accountInfo = document.getElementById('account-info');
  const userEmail = document.getElementById('user-email');
  
  console.log('Gmail Unread Extension initialized');
  
  // Check if user is authenticated
  checkAuthStatus();
  
  // Event listeners
  loginButton.addEventListener('click', authenticate);
  logoutButton.addEventListener('click', logout);
  refreshButton.addEventListener('click', fetchEmails);
  
  // Check authentication status
  function checkAuthStatus() {
    chrome.storage.local.get(['token'], function(result) {
      if (result.token) {
        // Request non-interactive auth check from background script
        chrome.runtime.sendMessage({ 
          action: 'authenticate', 
          interactive: false 
        }, function(response) {
          if (response && response.success && response.token) {
            showAuthenticatedUI();
            fetchEmails();
          } else {
            showLoginUI();
          }
        });
      } else {
        showLoginUI();
      }
    });
  }
  
  // Show UI for authenticated users
  function showAuthenticatedUI() {
    loginContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
    accountInfo.classList.remove('hidden');
    statusIndicator.classList.add('connected');
    fetchUserProfile();
  }
  
  // Show UI for non-authenticated users
  function showLoginUI() {
    loginContainer.classList.remove('hidden');
    contentContainer.classList.add('hidden');
    logoutButton.classList.add('hidden');
    statusIndicator.classList.remove('connected');
    userEmail.textContent = 'Not signed in';
  }
  
  // Authenticate with Google
  function authenticate() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'auth-status';
    statusDiv.style.padding = '10px';
    statusDiv.style.margin = '10px 0';
    statusDiv.style.backgroundColor = '#f8f9fa';
    statusDiv.style.border = '1px solid #ddd';
    statusDiv.style.borderRadius = '4px';
    statusDiv.textContent = 'Authenticating...';
    loginContainer.appendChild(statusDiv);
    
    // Request interactive authentication from background script
    chrome.runtime.sendMessage({ 
      action: 'authenticate', 
      interactive: true 
    }, function(response) {
      if (response && response.success && response.token) {
        console.log('Successfully obtained auth token');
        statusDiv.remove();
        showAuthenticatedUI();
        fetchEmails();
      } else {
        console.error('Authentication failed:', response?.error);
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.borderColor = '#f5c6cb';
        statusDiv.style.color = '#721c24';
        statusDiv.innerHTML = `
          <strong>Authentication Error</strong><br>
          <strong>Error:</strong> ${response?.error || 'Unknown error'}<br><br>
          Common causes:<br>
          1. OAuth client ID must be type "Chrome Extension" (not "Web application")<br>
          2. Extension ID must match the one in Google Cloud Console<br>
          3. Gmail API must be enabled in your Google Cloud project<br>
          <br>
          <strong>Extension ID:</strong> ${response?.extensionId || 'Unknown'}<br>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Open Google Cloud Console</a>
        `;
      }
    });
  }
  
  // Logout
  function logout() {
    chrome.runtime.sendMessage({ action: 'clearAuth' }, function(response) {
      if (response && response.success) {
        showLoginUI();
        sendersList.innerHTML = '';
        unreadCount.textContent = '0';
      }
    });
  }
  
  // Fetch user profile
  function fetchUserProfile() {
    chrome.storage.local.get(['token', 'userEmail'], function(result) {
      if (!result.token) return;
      
      if (result.userEmail) {
        userEmail.textContent = result.userEmail;
        return;
      }
      
      const token = result.token;
      
      fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(response => response.json())
      .then(data => {
        if (data.emailAddress) {
          chrome.storage.local.set({ userEmail: data.emailAddress });
          userEmail.textContent = data.emailAddress;
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        userEmail.textContent = 'Error loading account info';
      });
    });
  }
  
  // Fetch emails
  function fetchEmails() {
    sendersList.innerHTML = `
      <div class="loading">
        <div class="progress-text">Loading senders...</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    `;
    
    chrome.storage.local.get(['token'], function(result) {
      if (!result.token) {
        showLoginUI();
        return;
      }
      
      const token = result.token;
      statusIndicator.className = 'status loading';
      
      fetch('https://www.googleapis.com/gmail/v1/users/me/labels/INBOX', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(response => {
        if (!response.ok) throw new Error(`Network response error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const count = data.messagesUnread || 0;
        unreadCount.textContent = count;
        
        if (count === 0) {
          sendersList.innerHTML = '<div class="no-emails">No unread emails!</div>';
          statusIndicator.className = 'status connected';
          return;
        }
        
        return fetchSenderInfo(token);
      })
      .catch(error => {
        console.error('Error fetching emails:', error);
        
        if (error.message && error.message.includes('401')) {
          // Token expired, try to refresh via background script
          chrome.runtime.sendMessage({ 
            action: 'removeCachedToken', 
            token: token 
          }, function() {
            chrome.runtime.sendMessage({ 
              action: 'authenticate', 
              interactive: true 
            }, function(response) {
              if (response && response.success && response.token) {
                fetchEmails();
              } else {
                showLoginUI();
                sendersList.innerHTML = `
                  <div class="error">
                    <strong>Error: Network response error: 401</strong>
                    <p>Your authentication token has expired. Please sign in again.</p>
                  </div>
                `;
                statusIndicator.className = 'status disconnected';
              }
            });
          });
        } else {
          statusIndicator.className = 'status error';
          sendersList.innerHTML = `<div class="error">Error: ${error.message} <button id="retry-button">Retry</button></div>`;
          document.getElementById('retry-button')?.addEventListener('click', () => fetchEmails());
        }
      });
    });
  }
  
  // Fetch sender information
  async function fetchSenderInfo(token) {
    console.log('Fetching sender information...');
    const senders = {};
    const loadingElement = document.querySelector('.loading');
    const progressText = loadingElement?.querySelector('.progress-text');
    const progressFill = loadingElement?.querySelector('.progress-fill');
    
    if (progressText && progressFill) {
      progressText.textContent = 'Fetching messages...';
      progressFill.style.width = '20%';
    }
    
    async function fetchAllMessages(pageToken = null) {
      let allMessages = [];
      let url = 'https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox+is:unread&maxResults=100';
      
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      try {
        const response = await fetch(url, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (!response.ok) throw new Error(`Network response error: ${response.status}`);
        
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          allMessages = allMessages.concat(data.messages);
          
          if (data.nextPageToken) {
            if (progressText) {
              progressText.textContent = `Fetching more messages (${allMessages.length} so far)...`;
            }
            const nextPageMessages = await fetchAllMessages(data.nextPageToken);
            allMessages = allMessages.concat(nextPageMessages);
          }
        }
        
        return allMessages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    }
    
    try {
      const allMessages = await fetchAllMessages();
      console.log(`Total message IDs received: ${allMessages.length}`);
      
      if (allMessages.length === 0) {
        updateSendersList({});
        statusIndicator.className = 'status connected';
        if (progressText && progressFill) {
          progressText.textContent = 'No unread messages';
          progressFill.style.width = '100%';
        }
        return {};
      }
      
      if (progressText && progressFill) {
        progressText.textContent = `Fetching details for ${allMessages.length} messages...`;
        progressFill.style.width = '40%';
      }
      
      const messageIds = allMessages.map(msg => msg.id);
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < messageIds.length; i += batchSize) {
        batches.push(messageIds.slice(i, i + batchSize));
      }
      
      console.log(`Processing ${batches.length} batches of messages`);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        if (progressText && progressFill) {
          const progress = 40 + Math.floor((batchIndex / batches.length) * 30);
          progressText.textContent = `Processing batch ${batchIndex + 1}/${batches.length}...`;
          progressFill.style.width = `${progress}%`;
        }
        
        const batchPromises = batch.map(messageId => {
          return fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`, {
            headers: { 'Authorization': 'Bearer ' + token }
          })
          .then(response => response.ok ? response.json() : null)
          .catch(() => null);
        });
        
        const messages = await Promise.all(batchPromises);
        
        messages.forEach(message => {
          if (message && message.payload && message.payload.headers) {
            const fromHeader = message.payload.headers.find(h => h.name === 'From');
            if (fromHeader) {
              const parsedSender = parseSender(fromHeader.value);
              const key = parsedSender.email;
              if (!senders[key]) {
                senders[key] = { count: 0, names: new Set() };
              }
              senders[key].count += 1;
              if (parsedSender.name && parsedSender.name !== parsedSender.email) {
                senders[key].names.add(parsedSender.name);
              }
            }
          }
        });
      }
      
      console.log('Processed senders:', Object.keys(senders).length);
      updateSendersList(senders);
      statusIndicator.className = 'status connected';
      
      if (progressText && progressFill) {
        progressText.textContent = 'Done!';
        progressFill.style.width = '100%';
      }
      
      return senders;
    } catch (error) {
      console.error('Error fetching sender info:', error);
      statusIndicator.className = 'status error';
      sendersList.innerHTML = `<div class="error">Error: ${error.message} <button id="retry-button">Retry</button></div>`;
      document.getElementById('retry-button')?.addEventListener('click', () => fetchEmails());
      throw error;
    }
  }
  
  // Parse sender
  function parseSender(sender) {
    const match = sender.match(/^([^<]+)<([^>]+)>/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim(),
        full: sender
      };
    }
    return {
      name: sender,
      email: sender,
      full: sender
    };
  }
  
  // Update senders list
  function updateSendersList(senders) {
    const sortedSenders = Object.entries(senders).sort((a, b) => (b[1]?.count || 0) - (a[1]?.count || 0));
    sendersList.innerHTML = '';
    
    sortedSenders.forEach(([email, senderData]) => {
      const count = senderData?.count || 0;
      const names = senderData?.names ? Array.from(senderData.names) : [];
      const namesText = names.join(', ');
      const li = document.createElement('li');
      
      const senderInfo = document.createElement('div');
      senderInfo.className = 'sender-info';
      
      const nameSpan = document.createElement('div');
      nameSpan.className = 'sender-name';
      nameSpan.textContent = email;
      senderInfo.appendChild(nameSpan);
      
      const emailSpan = document.createElement('div');
      emailSpan.className = 'sender-email';
      emailSpan.textContent = namesText;
      if (namesText) {
        emailSpan.title = namesText;
      }
      senderInfo.appendChild(emailSpan);
      
      li.appendChild(senderInfo);
      
      const countSpan = document.createElement('span');
      countSpan.className = 'sender-count';
      countSpan.textContent = count;
      li.appendChild(countSpan);
      
      const searchButton = document.createElement('button');
      searchButton.className = 'icon-action-button search-button';
      searchButton.title = 'Search (from:)';
      searchButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M10 4a6 6 0 104.472 10.06l4.234 4.234 1.414-1.414-4.234-4.234A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/>
        </svg>
      `;
      searchButton.addEventListener('click', function() {
        const query = encodeURIComponent(email);
        window.location.href = `https://mail.google.com/mail/u/0/#search/from%3A${query}`;
      });
      li.appendChild(searchButton);

      const searchUnreadButton = document.createElement('button');
      searchUnreadButton.className = 'icon-action-button search-unread-button';
      searchUnreadButton.title = 'Search unread (from: + is:unread)';
      searchUnreadButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M2 7l10 6 10-6v10H2V7zm10 4L2 5h20l-10 6z"/>
          <path fill="currentColor" d="M19 4h3v3h-2V6h-1V4z"/>
        </svg>
      `;
      searchUnreadButton.addEventListener('click', function() {
        const query = encodeURIComponent(`${email} is:unread`);
        window.location.href = `https://mail.google.com/mail/u/0/#search/from%3A${query}`;
      });
      li.appendChild(searchUnreadButton);
      
      sendersList.appendChild(li);
    });
  }
}

// Initialize when Gmail loads
waitForGmail().then(() => {
  console.log('Gmail loaded, injecting extension UI');
  createExtensionUI();
});
