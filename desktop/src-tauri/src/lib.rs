//! Clara Code desktop shell: loads claracode.ai (release) or a local dev server (development).
//!
//! ## Scaffolds (not wired yet)
//! - **System tray menu** — tray icon is declared in `tauri.conf.json` (`app.trayIcon`). Menu items
//!   (`Open Clara Code`, `Talk to Clara`, `Quit`) and click behavior belong in Rust via
//!   `tauri::tray`. See `scaffold/tray-menu.md`.
//! - **Global shortcut** — target: `CommandOrControl+Shift+C` to show/focus the main window. Use
//!   `tauri-plugin-global-shortcut` in `setup`. See `scaffold/global-shortcut.md`.

#![cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
