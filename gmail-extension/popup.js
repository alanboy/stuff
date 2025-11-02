document.addEventListener('DOMContentLoaded', function() {
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
  
  // For copy to clipboard functionality
  let lastClickedButton = null;
  let resetTimeout = null;

  console.log('Popup loaded')
  
  // Keep popup open when clicking on Gmail
  setupPopupBehavior();

  // Check if user is authenticated
  checkAuthStatus();

  // Event listeners
  loginButton.addEventListener('click', authenticate);
  logoutButton.addEventListener('click', logout);
  refreshButton.addEventListener('click', fetchEmails);
  
  // Setup popup behavior to prevent closing when clicking on Gmail
  function setupPopupBehavior() {
    // Create a MutationObserver to detect when Gmail links are added to the DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Find all links in the added nodes
              const links = node.querySelectorAll('a');
              links.forEach(link => {
                // Check if it's a Gmail link
                if (link.href && link.href.includes('mail.google.com')) {
                  // Prevent default behavior and handle Gmail links specially
                  link.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Send message to background script to open Gmail in new tab
                    chrome.runtime.sendMessage({ 
                      action: 'openGmail',
                      url: link.href
                    });
                  });
                }
              });
            }
          });
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also handle clicks on the Gmail domain in the popup
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.tagName === 'A' && target.href && target.href.includes('mail.google.com')) {
        e.preventDefault();
        chrome.runtime.sendMessage({ 
          action: 'openGmail',
          url: target.href
        });
      }
    });
    
    // Prevent extension from closing when clicking on Gmail page
    // This captures clicks on the document and prevents them from bubbling up to the browser
    document.addEventListener('mousedown', function(e) {
      // Only stop propagation if the click is within our extension popup
      // This prevents the extension from closing when clicking inside it
      e.stopPropagation();
    }, true);
  }

  // Check authentication status
  function checkAuthStatus() {
    chrome.storage.local.get(['token'], function(result) {
      if (result.token) {
        // Check if token is still valid
        chrome.identity.getAuthToken({ interactive: false }, function(token) {
          if (token) {
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
    
    // Get user profile information
    fetchUserProfile();
  }

  // Show UI for non-authenticated users
  function showLoginUI() {
    loginContainer.classList.remove('hidden');
    contentContainer.classList.add('hidden');
    logoutButton.classList.add('hidden');
    // Keep account info visible
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
    
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      // Check for Chrome runtime errors
      const lastError = chrome.runtime.lastError;
      
      if (lastError) {
        console.error('Chrome identity error:', lastError);
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.borderColor = '#f5c6cb';
        statusDiv.style.color = '#721c24';
        statusDiv.innerHTML = `
          <strong>Authentication Error</strong><br>
          <strong>Error:</strong> ${lastError.message}<br><br>
          Common causes:<br>
          1. OAuth client ID must be type "Chrome Extension" (not "Web application")<br>
          2. Extension ID must match the one in Google Cloud Console<br>
          3. Gmail API must be enabled in your Google Cloud project<br>
          <br>
          <strong>Extension ID:</strong> ${chrome.runtime.id}<br>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Open Google Cloud Console</a>
        `;
        return;
      }
      
      if (token) {
        console.log('Successfully obtained auth token');
        chrome.storage.local.set({ token: token }, function() {
          showAuthenticatedUI();
          fetchEmails();
        });
      } else {
        console.error('Failed to get auth token - no token returned and no error');
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.borderColor = '#f5c6cb';
        statusDiv.style.color = '#721c24';
        statusDiv.innerHTML = `
          <strong>Authentication Error</strong><br>
          Failed to get auth token. Please check that you have:<br>
          1. Set up a valid OAuth client ID in the Google Cloud Console<br>
          2. Updated the manifest.json with your client ID<br>
          3. Enabled the Gmail API in your Google Cloud project<br>
          <br>
          <strong>Extension ID:</strong> ${chrome.runtime.id}<br>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Open Google Cloud Console</a>
        `;
      }
    });
  }

  // Logout
  function logout() {
    chrome.identity.clearAllCachedAuthTokens(function() {
      chrome.storage.local.remove(['token', 'userEmail'], function() {
        showLoginUI();
        sendersList.innerHTML = '';
        unreadCount.textContent = '0';
      });
    });
  }
  
  // Fetch user profile to get email address
  function fetchUserProfile() {
    chrome.storage.local.get(['token', 'userEmail'], function(result) {
      if (!result.token) {
        return;
      }
      
      // If we already have the email in storage, use that
      if (result.userEmail) {
        userEmail.textContent = result.userEmail;
        return;
      }
      
      const token = result.token;
      
      // Use Gmail API to get user profile
      fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.emailAddress) {
          // Save email to storage and update UI
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

  // Fetch unread emails directly with headers included
  function fetchEmails() {
    // Show loading state
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
      
      // Use Gmail API's labels endpoint to get accurate unread count
      // This matches what Gmail UI shows more accurately
      fetch('https://www.googleapis.com/gmail/v1/users/me/labels/INBOX', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Inbox label data:', data);
        // Update unread count using the messagesUnread property
        const count = data.messagesUnread || 0;
        unreadCount.textContent = count;
        
        if (count === 0) {
          sendersList.innerHTML = '<div class="no-emails">No unread emails!</div>';
          statusIndicator.className = 'status connected';
          return;
        }
        
        // Then fetch sender information directly
        return fetchSenderInfo(token);
      })
      .catch(error => {
        console.error('Error fetching emails:', error);
        
        // Check if this is an authorization error (401)
        if (error.message && error.message.includes('401')) {
          // Token might be expired, try to refresh it
          chrome.identity.removeCachedAuthToken({ token: token }, function() {
            chrome.identity.getAuthToken({ interactive: true }, function(newToken) {
              if (newToken) {
                chrome.storage.local.set({ token: newToken }, function() {
                  // Try fetching emails again with the new token
                  fetchEmails();
                });
              } else {
                // If we still can't get a token, show login UI
                showLoginUI();
                sendersList.innerHTML = `
                  <div class="error">
                    <strong>Error: Network response error: 401</strong>
                    <p>Your authentication token has expired or is invalid.</p>
                    <p>Please sign in again.</p>
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
  
  // Fetch sender information efficiently using list API with headers included
  function fetchSenderInfo(token) {
    console.log('Fetching sender information...');
    const senders = {};
    const loadingElement = document.querySelector('.loading');
    const progressText = loadingElement ? loadingElement.querySelector('.progress-text') : null;
    const progressFill = loadingElement ? loadingElement.querySelector('.progress-fill') : null;
    
    if (progressText && progressFill) {
      progressText.textContent = 'Fetching messages...';
      progressFill.style.width = '20%';
    }
    
    // Function to fetch all messages with pagination
    async function fetchAllMessages(pageToken = null) {
      let allMessages = [];
      let url = 'https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox+is:unread&maxResults=100';
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Page of message IDs received:', data);
        
        if (data.messages && data.messages.length > 0) {
          allMessages = allMessages.concat(data.messages);
          
          // If there's a next page token, fetch the next page
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
    
    // Start fetching all messages with pagination
    return fetchAllMessages()
      .then(allMessages => {
        console.log(`Total message IDs received: ${allMessages.length}`);
        
        if (allMessages.length === 0) {
          // No unread messages, update UI accordingly
          console.log('No unread messages found');
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
        
        // Get message details in batches to avoid rate limiting
        const messageIds = allMessages.map(msg => msg.id);
        const batchSize = 10;
        const batches = [];
        
        // Create batches of message IDs
        for (let i = 0; i < messageIds.length; i += batchSize) {
          batches.push(messageIds.slice(i, i + batchSize));
        }
        
        console.log(`Processing ${batches.length} batches of messages`);
      
      // Process batches sequentially
      return batches.reduce((promise, batch, batchIndex) => {
        return promise.then(() => {
          if (progressText && progressFill) {
            const progress = 40 + Math.floor((batchIndex / batches.length) * 30);
            progressText.textContent = `Processing batch ${batchIndex + 1}/${batches.length}...`;
            progressFill.style.width = `${progress}%`;
          }
          
          // Create promises for each message in the batch
          const batchPromises = batch.map(messageId => {
            return fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`, {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            })
            .then(response => {
              if (!response.ok) {
                console.warn(`Error fetching message ${messageId}: ${response.status}`);
                return null;
              }
              return response.json();
            })
            .catch(error => {
              console.warn(`Error fetching message ${messageId}:`, error);
              return null;
            });
          });
          
          // Process all messages in this batch
          return Promise.all(batchPromises).then(messages => {
            messages.forEach(message => {
              if (message && message.payload && message.payload.headers) {
                try {
                  // Find From header
                  const fromHeader = message.payload.headers.find(h => h.name === 'From');
                  if (fromHeader) {
                    const sender = fromHeader.value;
                    // Count senders
                    if (senders[sender]) {
                      senders[sender]++;
                    } else {
                      senders[sender] = 1;
                    }
                  }
                } catch (e) {
                  console.warn('Error processing message data:', e);
                }
              }
            });
          });
        });
      }, Promise.resolve()).then(() => {
        console.log('Processed senders:', Object.keys(senders).length);
        
        // Update UI with results
        updateSendersList(senders);
        statusIndicator.className = 'status connected';
        
        if (progressText && progressFill) {
          progressText.textContent = 'Done!';
          progressFill.style.width = '100%';
        }
        
        return senders;
      });
    })
    .catch(error => {
      console.error('Error fetching sender info:', error);
      statusIndicator.className = 'status error';
      
      // If rate limited, wait and retry once
      if (error.message.includes('429') || error.message.includes('rate')) {
        if (progressText) {
          progressText.textContent = 'Rate limited. Retrying in 3 seconds...';
        }
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(fetchSenderInfo(token));
          }, 3000);
        });
      } else {
        sendersList.innerHTML = `<div class="error">Error: ${error.message} <button id="retry-button">Retry</button></div>`;
        document.getElementById('retry-button')?.addEventListener('click', () => fetchEmails());
        throw error;
      }
    });
  }
  
  // Extract name and email from sender string
  function parseSender(sender) {
    // Try to match "Name <email@example.com>" format
    const match = sender.match(/^([^<]+)<([^>]+)>/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim(),
        full: sender
      };
    }
    // If no match, it might be just an email
    return {
      name: sender,
      email: sender,
      full: sender
    };
  }
  
  // Search for email in Gmail
  function searchInGmail(email) {
    // Send message to background script to open Gmail with search query
    chrome.runtime.sendMessage({ 
      action: 'searchGmail',
      query: email
    });
  }
  
  // Update the senders list
  function updateSendersList(senders) {
    // Convert to array and sort by count
    const sortedSenders = Object.entries(senders)
      .sort((a, b) => b[1] - a[1]);
    
    sendersList.innerHTML = '';
    
    sortedSenders.forEach(([sender, count]) => {
      const parsedSender = parseSender(sender);
      const li = document.createElement('li');
      
      // Create sender info container
      const senderInfo = document.createElement('div');
      senderInfo.className = 'sender-info';
      
      // Add sender name
      const nameSpan = document.createElement('div');
      nameSpan.className = 'sender-name';
      nameSpan.textContent = parsedSender.name;
      senderInfo.appendChild(nameSpan);
      
      // Add sender email
      const emailSpan = document.createElement('div');
      emailSpan.className = 'sender-email';
      emailSpan.textContent = parsedSender.email;
      senderInfo.appendChild(emailSpan);
      
      // Add sender info to list item
      li.appendChild(senderInfo);
      
      // Add count badge
      const countSpan = document.createElement('span');
      countSpan.className = 'sender-count';
      countSpan.textContent = count;
      li.appendChild(countSpan);
      
      // Add copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', function() {
        copyToClipboard(parsedSender.email, this);
      });
      li.appendChild(copyButton);
      
      // Add search button
      const searchButton = document.createElement('button');
      searchButton.className = 'search-button';
      searchButton.textContent = 'Search';
      searchButton.addEventListener('click', function() {
        searchInGmail(parsedSender.email);
      });
      li.appendChild(searchButton);
      
      // Add to list
      sendersList.appendChild(li);
    });
  }
});
