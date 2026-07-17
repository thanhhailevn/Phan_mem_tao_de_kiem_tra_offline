use tauri::command;
use crate::domains::error::Result;
use crate::repository::models::Question;

/// Lệnh tạo mới câu hỏi vào cơ sở dữ liệu
/// Bắt buộc comment tiếng Việt
#[tauri::command]
pub async fn cmd_create_question(question: Question) -> Result<String> {
    // Todo: Gọi Repo để insert
    // let repo = SqliteRepo::new(...);
    // repo.create_question(&question)?;
    Ok(format!("Đã tạo câu hỏi: {}", question.id))
}

/// Lệnh cập nhật câu hỏi đã có
#[tauri::command]
pub async fn cmd_update_question(question: Question) -> Result<String> {
    // Todo: Gọi Repo để update
    Ok(format!("Đã cập nhật câu hỏi: {}", question.id))
}

/// Lệnh tìm kiếm Full-Text Search siêu tốc dùng FTS5
#[tauri::command]
pub async fn cmd_search_questions(_query: String) -> Result<Vec<Question>> {
    // Todo: Móc vào Repo để query qua bảng FTS ảo
    Ok(vec![])
}
