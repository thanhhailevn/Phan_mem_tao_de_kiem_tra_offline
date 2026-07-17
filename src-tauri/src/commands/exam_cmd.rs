use tauri::{command, State, AppHandle};
use crate::domains::error::{Result, AppError};
use crate::repository::models::{ExamMatrixConfig, Question, Exam};
use crate::repository::sqlite_repo::SqliteRepo;

/// Lệnh sinh đề thi tự động từ Backend
/// Bắt buộc comment tiếng Việt
#[tauri::command]
pub async fn cmd_generate_exam_auto(
    config: ExamMatrixConfig,
    state: State<'_, SqliteRepo>,
) -> Result<Vec<Question>> {
    // Bước 1: Fetch toàn bộ câu hỏi thỏa mãn Môn học và Giới hạn Tuần
    // Lưu ý: config.subject và config.week_start, week_end sẽ được truyền vào query
    let base_questions = state.get_questions_by_filters(
        &config.subject, 
        config.week_start as i32, 
        config.week_end as i32
    )?;

    // Bước 2: Truyền vào lõi thuật toán Randomizer
    let generated_exam = crate::domains::exam_generator::generate_exam_auto(base_questions, &config)?;

    // Bước 3: Lưu vào database mảng câu hỏi này (Tạo bản nháp)
    // Code thực tế sẽ tạo UUID cho Exam và chèn vào DB, 
    // Tạm thời trả thẳng kết quả về Frontend hiển thị
    
    Ok(generated_exam)
}

/// Lệnh đổi 1 câu hỏi trong quá trình tinh chỉnh đề (Interactive Draft)
/// Bắt buộc comment tiếng Việt
#[tauri::command]
pub async fn cmd_swap_question(
    exam_id: String,
    old_question_id: String,
    state: State<'_, SqliteRepo>
) -> Result<Question> {
    // Todo: Lấy 1 câu cùng độ khó, cùng chuyên đề để thay thế
    Err(AppError::BusinessLogic("Tính năng đổi câu hỏi đang được xây dựng".to_string()))
}
