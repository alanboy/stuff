# Tab Manager Chrome Extension

A Chrome extension for managing browser tabs and windows, inspired by Cluster Tab Manager.

## Features

- **Two-Column Layout**: View windows side-by-side for better space utilization
- **Window Cards**: View all open windows in a clean card-based interface
- **Tab Management**: 
  - Select multiple tabs with checkboxes
  - Close selected tabs in bulk
  - Close individual tabs
- **Rich Tab Information**:
  - Full URL path (not just domain)
  - Memory usage per tab
  - Last accessed time
  - Audio/pinned indicators
- **Drag & Drop**: 
  - Reorder tabs within a window by dragging them to new positions
  - Move tabs between windows by dragging to another window card
- **Sorting**: Sort tabs by title or top-level domain
- **Search**: Filter tabs across all windows
- **Real-time Updates**: Interface updates automatically as you open/close tabs

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `tab-extension` folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. A new tab will open with the Tab Manager interface
3. Each window appears as a card with all its tabs listed
4. Use checkboxes to select tabs, then click "Close Selected" to close them
5. **Drag and drop tabs**:
   - Drag within a window to reorder tabs
   - Drag to another window card to move tabs between windows
   - Drop on a specific tab to place it at that position
   - Drop on empty space in a window to add it to the end
6. Use the sort dropdown to sort tabs by title or domain
7. Use the search bar to filter tabs across all windows

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `background.js` - Service worker that opens the manager page
- `manager.html` - Main UI page
- `manager.js` - Tab management logic
- `styles.css` - UI styling
- `icons/` - Extension icons (16x16, 48x48, 128x128)

## Permissions

- `tabs` - Required to read and manage browser tabs
- `storage` - For future features (saved window sessions)
