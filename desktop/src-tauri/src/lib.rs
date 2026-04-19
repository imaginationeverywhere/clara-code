//! Clara Code desktop shell: loads static `shell/` (see `tauri.conf.json` `devUrl` / `frontendDist`).
//!
//! ## Scaffolds (not wired yet)
//! - **System tray menu** — tray icon is declared in `tauri.conf.json` (`app.trayIcon`). Menu items
//!   (`Open Clara Code`, `Talk to Clara`, `Quit`) and click behavior belong in Rust via
//!   `tauri::tray`. See `scaffold/tray-menu.md`.
//! - **Global shortcut** — target: `CommandOrControl+Shift+C` to show/focus the main window. Use
//!   `tauri-plugin-global-shortcut` in `setup`. See `scaffold/global-shortcut.md`.

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
	format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![greet])
		.setup(|app| {
			let Some(window_config) = app.config().app.windows.first().cloned() else {
				return Err("Clara Code: missing app window config".into());
			};

			let init_script = include_str!("../voice-overlay.js");

			tauri::webview::WebviewWindowBuilder::from_config(app.handle(), &window_config)?
				.initialization_script(init_script)
				.build()?;

			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
