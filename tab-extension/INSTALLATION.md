# Installation Instructions

## Quick Start

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `/Users/alan/code/stuff/tab-extension` folder
   - Click "Select" or "Open"

4. **Verify Installation**
   - You should see "Tab Manager" appear in your extensions list
   - The extension icon will appear in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon and pin "Tab Manager"

## Using the Extension

1. **Open Tab Manager**
   - Click the Tab Manager icon in your toolbar
   - A new tab will open with the manager interface

2. **Manage Tabs**
   - Each window appears as a separate card
   - Check boxes next to tabs to select them
   - Click "Close Selected" to close multiple tabs at once
   - Click the × button on individual tabs to close them

3. **Reorder Tabs**
   - Click and drag any tab row to reorder it
   - The actual browser tab will move to match

4. **Sort Tabs**
   - Use the dropdown in each window card header
   - Sort by: Default Order, Title, or Domain

5. **Search**
   - Use the search bar at the top to filter tabs
   - Searches across tab titles and URLs

## Troubleshooting

**Extension won't load:**
- Make sure you selected the correct folder (tab-extension)
- Check that all files are present (manifest.json, manager.html, etc.)

**Icons not showing:**
- SVG icons should work in Chrome. If not, open `icons/generate-icons.html` in a browser
- Download the PNG icons and replace the .svg references in manifest.json

**Tabs not updating:**
- The interface auto-refreshes every 2 seconds
- You can also close and reopen the manager tab

## Development

To make changes:
1. Edit the files in the extension folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Tab Manager extension card
4. Reopen the manager tab to see changes
