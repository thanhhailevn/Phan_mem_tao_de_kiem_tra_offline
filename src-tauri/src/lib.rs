mod commands;
mod infrastructure;
mod domains;
mod repository;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            infrastructure::file_system::setup_app_directories(app)?;
            
            // Khởi tạo SqliteRepo và nhét vào State
            let app_data_dir = app.path().app_data_dir()?;
            let db_dir = app_data_dir.join("database");
            let db_path = db_dir.join("antigravity.db");
            
            let repo = repository::sqlite_repo::SqliteRepo::new(db_path)?;
            repo.init_schema()?; // Tạo bảng nếu chưa có
            app.manage(repo);
            
            Ok(())
        })
        .register_uri_scheme_protocol("local", |app, request| {
            use tauri::Manager;
            use std::fs;
            
            let path = request.uri().path().trim_start_matches('/');
            let app_data_dir = app.app_handle().path().app_data_dir().unwrap_or_default();
            let full_path = app_data_dir.join(path);
            
            match fs::read(&full_path) {
                Ok(data) => tauri::http::Response::builder()
                    .status(200)
                    .header("Access-Control-Allow-Origin", "*")
                    .body(data)
                    .unwrap(),
                Err(_) => tauri::http::Response::builder()
                    .status(404)
                    .body(Vec::new())
                    .unwrap(),
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::curriculum_cmd::cmd_sync_curriculum,
            commands::curriculum_cmd::cmd_get_tree,
            commands::curriculum_cmd::cmd_update_topic_order,
            commands::question_cmd::cmd_create_question,
            commands::question_cmd::cmd_update_question,
            commands::question_cmd::cmd_search_questions,
            commands::exam_cmd::cmd_generate_exam_auto,
            commands::exam_cmd::cmd_swap_question,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
