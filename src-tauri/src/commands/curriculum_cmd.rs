use crate::domains::error::Result;

/// Lệnh đồng bộ dữ liệu Sàn kiến thức
/// Nếu mạng lỗi sẽ fallback đọc file `default_curriculum.json`
/// Bắt buộc comment bằng tiếng Việt
#[tauri::command]
pub async fn cmd_sync_curriculum() -> Result<String> {
    // Tạm thời mock logic đọc fallback
    let _data = crate::infrastructure::embedded_data::DEFAULT_CURRICULUM;
    // Todo: Insert vào Database
    Ok("Đồng bộ thành công".to_string())
}

/// Lấy toàn bộ cây Sàn kiến thức (Môn -> Khối -> Chủ đề)
#[tauri::command]
pub async fn cmd_get_tree() -> Result<String> {
    // Trả về dữ liệu gốc để Frontend hiển thị
    let data = crate::infrastructure::embedded_data::DEFAULT_CURRICULUM;
    Ok(data.to_string())
}

/// Lệnh cập nhật thứ tự Chủ đề
/// Bắt buộc comment bằng tiếng Việt
#[tauri::command]
pub async fn cmd_update_topic_order(_topic_id: i64, _new_order: i64) -> Result<String> {
    // Todo: Gọi DB để update
    Ok("Cập nhật thành công".to_string())
}
