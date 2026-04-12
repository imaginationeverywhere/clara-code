# System tray (scaffold)

Configured in `tauri.conf.json` under `app.trayIcon` (icon path, tooltip, `showMenuOnLeftClick`).

Planned menu items (implement in Rust with `tauri::tray`, not in JSON):

| Item             | Action |
|------------------|--------|
| Open Clara Code  | Show/focus main window; navigate to app home if needed |
| Talk to Clara    | Open voice UI (deep link or in-app route once defined) |
| Quit             | Exit the application |

Tray click: show menu on left click is enabled via `showMenuOnLeftClick: true` for when a menu exists.

Replace `icons/tray-icon.png` with the official Clara Code 32×32 PNG when available.
