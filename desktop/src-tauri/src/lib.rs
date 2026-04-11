// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

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
