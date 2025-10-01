# Quick Start Guide

## Install (2 minutes)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this folder: `/Users/alan/code/stuff/tab-extension`
5. Done! Click the extension icon to open

## Key Features

| Feature | How to Use |
|---------|------------|
| **Open Manager** | Click extension icon in toolbar |
| **Close Multiple Tabs** | Check boxes → "Close Selected" |
| **Close One Tab** | Click × on the tab row |
| **Reorder Tabs** | Drag and drop tab rows within a window |
| **Move Between Windows** | Drag tab to another window card |
| **Sort Tabs** | Use dropdown: Default/Title/Domain |
| **Search** | Type in search bar at top |
| **Select All** | Check box in "Select All" row |

## Interface Layout

```
┌─────────────────────────────────────────────┐
│  🟢 Tab Manager        [Search...]          │ ← Header
├──────────┬──────────────────────────────────┤
│ Active   │  Current Window          (5)     │
│ Windows  │  [Sort ▼] [Close Selected]       │ ← Window Card
│          ├──────────────────────────────────┤
│          │  ☐ Select All                    │
│          │  ☐ 🌐 Tab Title                  │ ← Tab Rows
│          │  ☐ 🌐 Another Tab                │
│          │  ☐ 🌐 More Tabs...               │
│          │                                   │
│          │  Window 2                 (3)    │ ← Another Window
│          │  [Sort ▼] [Close Selected]       │
│          │  ...                             │
└──────────┴──────────────────────────────────┘
```

## Tips

- **Drag & Drop Within Window**: Click and hold a tab row, then drag to reorder
- **Drag Between Windows**: Drag a tab to another window card to move it
- **Drop Positioning**: Drop on a specific tab to place before it, or on empty space to add at the end
- **Bulk Actions**: Select multiple tabs across windows before closing
- **Search**: Searches both tab titles and URLs
- **Auto-Refresh**: Interface updates every 2 seconds automatically
- **Current Window**: Marked with green indicator
- **Visual Feedback**: Window cards highlight in green when you drag a tab over them

## Troubleshooting

**Can't see extension icon?**
→ Click puzzle piece icon, then pin Tab Manager

**Changes not showing?**
→ Wait 2 seconds for auto-refresh, or close/reopen manager tab

**Want PNG icons instead of SVG?**
→ Open `icons/generate-icons.html` in browser and download

---

**Ready to use!** Click the extension icon and start managing your tabs.
