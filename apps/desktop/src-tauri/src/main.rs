// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Deserialize;
use std::fs;
use tauri::Manager;

#[derive(Debug, Deserialize)]
struct Delta {
    x: f64,
    y: f64,
}

#[tauri::command]
fn move_window(window: tauri::Window, delta: Delta) -> Result<(), String> {
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(
            (pos.x as f64 + delta.x).round() as i32,
            (pos.y as f64 + delta.y).round() as i32,
        )))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_position(window: tauri::Window, app_handle: tauri::AppHandle) -> Result<(), String> {
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let path = position_file_path(&app_handle)?;
    let data = format!("{{\"x\":{},\"y\":{}}}", pos.x, pos.y);
    fs::write(&path, data).map_err(|e| e.to_string())
}

fn position_file_path(app_handle: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let mut path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    path.push("window-position.json");
    Ok(path)
}

fn load_saved_position(app_handle: &tauri::AppHandle) -> Option<(i32, i32)> {
    let path = position_file_path(app_handle).ok()?;
    let content = fs::read_to_string(&path).ok()?;
    let json: serde_json::Value = serde_json::from_str(&content).ok()?;
    let x = json["x"].as_i64()? as i32;
    let y = json["y"].as_i64()? as i32;
    Some((x, y))
}

#[tauri::command]
fn report_ready() -> Result<(), String> {
    eprintln!("[Ragdoll] ✅ Frontend reported ready!");
    Ok(())
}

#[tauri::command]
fn report_error(message: String) -> Result<(), String> {
    eprintln!("[Ragdoll] ❌ Frontend error: {}", message);
    Ok(())
}

fn main() {
    eprintln!("[Ragdoll] Starting Tauri app...");

    tauri::Builder::default()
        .setup(|app| {
            eprintln!("[Ragdoll] Setup started");

            if let Some(window) = app.get_webview_window("main") {
                eprintln!("[Ragdoll] Got window handle");

                // Center on screen
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let size = monitor.size();
                    if let Ok(win_size) = window.inner_size() {
                        let cx = (size.width as i32 - win_size.width as i32) / 2;
                        let cy = (size.height as i32 - win_size.height as i32) / 2;
                        eprintln!("[Ragdoll] Centering window at ({}, {}), monitor {}x{}, window {}x{}", cx, cy, size.width, size.height, win_size.width, win_size.height);
                        let _ = window.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition::new(cx, cy),
                        ));
                    }
                }

                // Restore saved position (overrides center) — only if within a visible monitor
                if let Some((x, y)) = load_saved_position(&app.handle()) {
                    let is_visible = window.available_monitors().ok().map_or(false, |monitors| {
                        monitors.iter().any(|m| {
                            let s = m.size();
                            let p = m.position();
                            x >= p.x && y >= p.y && x < p.x + s.width as i32 && y < p.y + s.height as i32
                        })
                    });
                    if is_visible {
                        eprintln!("[Ragdoll] Restored position ({}, {})", x, y);
                        let _ = window.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition::new(x, y),
                        ));
                    } else {
                        eprintln!("[Ragdoll] Saved position ({}, {}) is off-screen, using center", x, y);
                    }
                }

                eprintln!("[Ragdoll] Showing window...");
                let _ = window.show();
                // Force window to front on macOS 26
                let _ = window.set_focus();
                let _ = window.set_always_on_top(true);
                std::thread::sleep(std::time::Duration::from_millis(100));
                let _ = window.set_always_on_top(false);
                eprintln!("[Ragdoll] Window shown and focused!");

                // Log window state
                if let Ok(pos) = window.outer_position() {
                    eprintln!("[Ragdoll] Final window position: {:?}", pos);
                }
                if let Ok(size) = window.inner_size() {
                    eprintln!("[Ragdoll] Final window inner size: {:?}", size);
                }
                if let Ok(scale) = window.scale_factor() {
                    eprintln!("[Ragdoll] Scale factor: {}", scale);
                }
            } else {
                eprintln!("[Ragdoll] ERROR: No window with label 'main' found!");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![move_window, save_position, report_ready, report_error])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
