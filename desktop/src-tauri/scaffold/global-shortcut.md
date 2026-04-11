# Global shortcut (scaffold)

**Target:** `CommandOrControl+Shift+C` — show and focus the main window.

**Not implemented** in this phase. Next steps:

1. Add dependency: `tauri-plugin-global-shortcut` (version aligned with Tauri 2).
2. Register the shortcut in `lib.rs` `setup`, resolving the main `WebviewWindow` by label `main`.
3. On shortcut event: `window.show()`, `window.set_focus(true)` (and unminimize if needed).
4. Add the plugin to `capabilities/default.json` permissions when the plugin registers commands.
