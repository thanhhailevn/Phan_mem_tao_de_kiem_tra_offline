use serde::Serialize;
use thiserror::Error;

/// Đại diện cho các lỗi nghiệp vụ trong ứng dụng (AppError)
/// Bắt buộc có comment Tiếng Việt cho các biến lỗi để đúng RULES.md
#[derive(Debug, Error)]
pub enum AppError {
    /// Lỗi khi thao tác với cơ sở dữ liệu SQLite
    #[error("Lỗi cơ sở dữ liệu: {0}")]
    Database(#[from] rusqlite::Error),
    
    /// Lỗi khi xử lý file I/O (Lưu ảnh, Đọc dữ liệu)
    #[error("Lỗi đọc/ghi file: {0}")]
    Io(#[from] std::io::Error),
    
    /// Lỗi khi dữ liệu JSON không hợp lệ
    #[error("Lỗi xử lý dữ liệu JSON: {0}")]
    Json(#[from] serde_json::Error),
    
    /// Lỗi nghiệp vụ chung (Ví dụ: Không tìm thấy ID)
    #[error("Lỗi nghiệp vụ: {0}")]
    BusinessLogic(String),
    
    /// Bắt buộc cho QA Test 2: Thiếu dữ liệu câu hỏi
    #[error("Thất bại: Trong kho chỉ có {available} câu, nhưng cấu hình yêu cầu {required} câu.")]
    NotEnoughQuestions { required: usize, available: usize },
    
    /// Bắt buộc cho QA Test 3: Ràng buộc thất bại
    #[error("Thất bại: {0}")]
    ConstraintFailed(String),
}

/// Chuyển đổi AppError sang định dạng JSON để gửi lên React (Frontend)
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Trả về chuỗi thông báo lỗi thuần túy
        serializer.serialize_str(&self.to_string())
    }
}

/// Bí danh kiểu (Type Alias) dùng cho toàn bộ backend
pub type Result<T, E = AppError> = std::result::Result<T, E>;
