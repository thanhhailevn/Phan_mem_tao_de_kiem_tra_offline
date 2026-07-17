use serde::{Deserialize, Serialize};

/// Mô hình đại diện cho một Câu hỏi trong CSDL
/// Bắt buộc có comment bằng Tiếng Việt
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    /// UUID của câu hỏi
    pub id: String,
    /// ID của chủ đề chứa câu hỏi này
    pub topic_id: i64,
    /// ID của đoạn ngữ liệu nếu là câu hỏi chùm (có thể Null)
    pub passage_id: Option<String>,
    /// Loại câu hỏi: MCQ, ESSAY, MATCHING
    pub q_type: String,
    /// Nội dung văn bản của câu hỏi (dạng HTML)
    pub content: String,
    /// Tuỳ chọn hoặc cấu hình đáp án (lưu dạng JSON string)
    pub options: Option<String>,
    /// Đáp án đúng (lưu dạng JSON string)
    pub correct_answer: Option<String>,
    /// Giải thích/Hướng dẫn chấm điểm
    pub explanation: Option<String>,
    /// Số dòng kẻ trống cho tự luận
    pub solution_space: Option<i32>,
    /// Độ khó: EASY, MEDIUM, HARD
    pub difficulty: Option<String>,
}

/// Mô hình đại diện cho Môn học
#[derive(Debug, Serialize, Deserialize)]
pub struct Subject {
    pub id: i64,
    pub name: String,
}

/// Mô hình đại diện cho Khối lớp
#[derive(Debug, Serialize, Deserialize)]
pub struct Grade {
    pub id: i64,
    pub name: String,
}

/// Mô hình đại diện cho Chủ đề/Bài học
#[derive(Debug, Serialize, Deserialize)]
pub struct Topic {
    pub id: i64,
    pub subject_id: i64,
    pub grade_id: i64,
    pub parent_id: Option<i64>,
    pub name: String,
    pub order_index: i64,
    pub week_number: Option<i64>,
}

/// Mô hình đại diện cho một Đề thi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exam {
    pub id: String,
    pub title: String,
    pub created_by: String,
    pub exam_matrix: Option<String>, // JSON string
    pub question_ids: Option<String>, // JSON Array string
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

/// Cấu hình ma trận đề truyền từ UI xuống Backend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExamMatrixConfig {
    pub subject: String,            // Môn học (VD: Toán, Tiếng Việt, Hỗn hợp)
    pub grade_id: i64,              // Khối lớp (VD: 3)
    pub week_start: i64,            // Từ tuần
    pub week_end: i64,              // Đến tuần
    pub mcq_count: usize,           // Số lượng câu Trắc nghiệm (MCQ)
    pub essay_count: usize,         // Số lượng câu Tự luận (ESSAY)
    pub advanced_ratio: f64,        // Tỉ lệ câu Nâng cao (VD: 0.2 tức 20%)
    pub require_geometry: bool,     // Ràng buộc: Bắt buộc có Hình học
    pub require_reading: bool,      // Ràng buộc: Bắt buộc có Đọc hiểu
    pub shuffle_options: bool,      // Ràng buộc: Có trộn đáp án hay không
}

/// Struct dùng để gửi cấu trúc cây hoàn chỉnh xuống React
#[derive(Debug, Serialize, Deserialize)]
pub struct CurriculumTree {
    pub id: i64,
    pub name: String,
    pub grades: Vec<GradeNode>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GradeNode {
    pub id: i64,
    pub name: String,
    pub topics: Vec<TopicNode>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TopicNode {
    pub id: i64,
    pub name: String,
    pub order_index: i64,
    pub children: Option<Vec<TopicNode>>,
}
