// Background script for Gmail Unread Counter extension

// Handle extension icon click - open Gmail
chrome.action.onClicked.addListener((tab) => {
  // Check if current tab is already Gmail
  if (tab.url && tab.url.includes('mail.google.com')) {
    // Already on Gmail, just reload to ensure content script is injected
    chrome.tabs.reload(tab.id);
  } else {
    // Open Gmail in a new tab
    chrome.tabs.create({ url: 'https://mail.google.com/mail/u/0/#inbox' });
  }
});

// Check for unread emails and update badge
function checkUnreadEmails() {
  chrome.storage.local.get(['token'], function(result) {
    if (!result.token) {
      updateBadge('?');
      return;
    }

    const token = result.token;
    
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
      // Update unread count using the messagesUnread property
      const count = data.messagesUnread || 0;
      updateBadge(count.toString());
    })
    .catch(error => {
      console.error('Error checking unread emails:', error);
      updateBadge('!');
    });
  });
}

// Update the extension badge
function updateBadge(text) {
  chrome.action.setBadgeText({ text: text });
  
  // Set badge color based on content
  if (text === '0') {
    chrome.action.setBadgeBackgroundColor({ color: '#34a853' }); // Green
  } else if (text === '?' || text === '!') {
    chrome.action.setBadgeBackgroundColor({ color: '#ea4335' }); // Red
  } else {
    chrome.action.setBadgeBackgroundColor({ color: '#4285f4' }); // Blue
  }
}



// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authenticate') {
    // Handle authentication request from content script
    chrome.identity.getAuthToken({ interactive: message.interactive || false }, function(token) {
      const lastError = chrome.runtime.lastError;
      
      if (lastError) {
        console.error('Chrome identity error:', lastError);
        sendResponse({ 
          success: false, 
          error: lastError.message,
          extensionId: chrome.runtime.id
        });
      } else if (token) {
        console.log('Successfully obtained auth token');
        chrome.storage.local.set({ token: token }, function() {
          sendResponse({ success: true, token: token });
        });
      } else {
        console.error('Failed to get auth token');
        sendResponse({ 
          success: false, 
          error: 'Failed to get auth token',
          extensionId: chrome.runtime.id
        });
      }
    });
    return true; // Required for async sendResponse
  } else if (message.action === 'clearAuth') {
    // Handle logout request from content script
    chrome.identity.clearAllCachedAuthTokens(function() {
      chrome.storage.local.remove(['token', 'userEmail'], function() {
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (message.action === 'removeCachedToken') {
    // Remove a specific cached token
    chrome.identity.removeCachedAuthToken({ token: message.token }, function() {
      sendResponse({ success: true });
    });
    return true;
  } else if (message.action === 'refreshUnreadCount') {
    checkUnreadEmails();
    sendResponse({ success: true });
  } else if (message.action === 'openGmail') {
    // Check if current tab is Gmail, if so use it, otherwise open a new tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
        // Current tab is Gmail, update it
        console.log('Current tab is Gmail, updating it')
        const url = message.url || 'https://mail.google.com/mail/u/0/#inbox';
        chrome.tabs.update(tabs[0].id, { url: url });
      } else {
        // Current tab is not Gmail, open a new tab
        console.log('Current tab is not Gmail, opening a new tab')
        chrome.tabs.create({ url: 'https://mail.google.com/mail/u/0/#inbox' });
      }
    });
    sendResponse({ success: true });
  } else if (message.action === 'searchGmail') {
    console.log('searchGmail', message)
    // Update current tab with Gmail search query
    const query = encodeURIComponent(message.query);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { url: `https://mail.google.com/mail/u/0/#search/from%3A${query}` });
      }
    });
    sendResponse({ success: true });
  }
  return true; // Required for async sendResponse
});
