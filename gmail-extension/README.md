# Gmail Unread Counter Chrome Extension

This Chrome extension shows your unread Gmail messages and provides a summary of top senders.

## Add more test users

Go to https://console.cloud.google.com/auth/audience
Go to test users
Add the user email.


## Features

- Display count of unread emails in your Gmail inbox
- Show a list of recent unread emails with sender and subject
- Provide a summary of top senders
- Badge counter showing unread email count directly on the extension icon
- Automatic refresh every 5 minutes

## Setup Instructions

### 1. Create OAuth Client ID

Before using this extension, you need to set up OAuth credentials correctly:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Gmail API" and enable it

5. Navigate to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "OAuth client ID"
7. Select "Chrome Extension" as the application type
8. Enter a name for your OAuth client
9. For the Application ID, enter your extension ID
   - To get your extension ID: Load the extension in Chrome, then go to chrome://extensions and copy the ID shown under your extension
10. Click "Create"
11. Copy the generated client ID

### 2. Configure the Extension

1. Open `manifest.json` in a text editor
2. Replace the placeholder client ID with your actual OAuth client ID:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     "scopes": ["https://www.googleapis.com/auth/gmail.readonly"]
   }
   ```
3. Remove the placeholder key value if present

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the extension directory
4. The extension should now appear in your Chrome toolbar

### 4. Using the Extension

1. Click the extension icon in the Chrome toolbar
2. Click "Sign in with Google" and authorize the extension
3. View your unread emails and sender statistics
4. Click "Refresh" to manually update the data

## Files Overview

- `manifest.json`: Extension configuration
- `popup.html`: Main extension UI
- `popup.css`: Styling for the UI
- `popup.js`: JavaScript for the popup UI functionality
- `background.js`: Background script for badge updates and periodic checks
- `images/`: Directory containing extension icons

## Permissions

This extension requires the following permissions:
- `identity`: For Google OAuth authentication
- `storage`: To store authentication tokens
- Access to Gmail API (readonly)

## Notes

- The extension only requests read-only access to your Gmail account
- All data is processed locally and is not sent to any third-party servers
