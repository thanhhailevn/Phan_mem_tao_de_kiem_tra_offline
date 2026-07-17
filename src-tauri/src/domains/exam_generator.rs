use crate::repository::models::{Question, ExamMatrixConfig};
use crate::domains::error::{AppError, Result};
use rand::seq::SliceRandom;
use rand::rng;

/// Thuật toán hoán vị câu hỏi để sinh đề thi từ Ngân hàng Câu hỏi thô
/// Bắt buộc comment tiếng Việt
pub fn generate_exam_auto(
    base_questions: Vec<Question>, 
    config: &ExamMatrixConfig
) -> Result<Vec<Question>> {
    
    // Bước 1: Chia pool thành 4 rổ (MCQ_CơBản, MCQ_NângCao, Essay_CơBản, Essay_NângCao)
    let mut mcq_basic = Vec::new();
    let mut mcq_adv = Vec::new();
    let mut essay_basic = Vec::new();
    let mut essay_adv = Vec::new();
    
    for q in base_questions {
        let is_mcq = q.q_type == "MCQ";
        let is_adv = q.difficulty.as_deref() == Some("HARD");
        
        match (is_mcq, is_adv) {
            (true, true) => mcq_adv.push(q),
            (true, false) => mcq_basic.push(q),
            (false, true) => essay_adv.push(q),
            (false, false) => essay_basic.push(q),
        }
    }
    
    // Bước 2: Tính toán số lượng cần bốc cho mỗi rổ
    let mcq_adv_req = (config.mcq_count as f64 * config.advanced_ratio).round() as usize;
    let mcq_basic_req = config.mcq_count.saturating_sub(mcq_adv_req);
    
    let essay_adv_req = (config.essay_count as f64 * config.advanced_ratio).round() as usize;
    let essay_basic_req = config.essay_count.saturating_sub(essay_adv_req);
    
    // Bước 3: Kiểm tra failsafe (NotEnoughQuestions)
    if mcq_adv.len() < mcq_adv_req {
        return Err(AppError::NotEnoughQuestions { required: mcq_adv_req, available: mcq_adv.len() });
    }
    if mcq_basic.len() < mcq_basic_req {
        return Err(AppError::NotEnoughQuestions { required: mcq_basic_req, available: mcq_basic.len() });
    }
    if essay_adv.len() < essay_adv_req {
        return Err(AppError::NotEnoughQuestions { required: essay_adv_req, available: essay_adv.len() });
    }
    if essay_basic.len() < essay_basic_req {
        return Err(AppError::NotEnoughQuestions { required: essay_basic_req, available: essay_basic.len() });
    }
    
    let mut random_generator = rng();
    
    // Bước 4: Shuffle các rổ và vét (take)
    mcq_adv.shuffle(&mut random_generator);
    mcq_basic.shuffle(&mut random_generator);
    essay_adv.shuffle(&mut random_generator);
    essay_basic.shuffle(&mut random_generator);
    
    let mut final_exam: Vec<Question> = Vec::new();
    final_exam.extend(mcq_adv.into_iter().take(mcq_adv_req));
    final_exam.extend(mcq_basic.into_iter().take(mcq_basic_req));
    final_exam.extend(essay_adv.into_iter().take(essay_adv_req));
    final_exam.extend(essay_basic.into_iter().take(essay_basic_req));
    
    // Bước 5: Kiểm tra Hard Constraints
    if config.require_geometry {
        // Giả lập kiểm tra bằng text. Trong thực tế sẽ tra theo Topic ID hoặc Tags.
        let has_geometry = final_exam.iter().any(|q| q.content.to_lowercase().contains("hình"));
        if !has_geometry {
            return Err(AppError::ConstraintFailed("Thiếu câu hình học".to_string()));
        }
    }
    
    // Bước 6: Trộn xáo toàn bộ Đề một lần cuối
    final_exam.shuffle(&mut random_generator);
    
    Ok(final_exam)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_question(q_type: &str, difficulty: &str, content: &str) -> Question {
        Question {
            id: uuid::Uuid::new_v4().to_string(),
            topic_id: 1,
            passage_id: None,
            q_type: q_type.to_string(),
            content: content.to_string(),
            options: None,
            correct_answer: None,
            explanation: None,
            solution_space: None,
            difficulty: Some(difficulty.to_string()),
        }
    }

    #[test]
    fn test_generate_happy_path() {
        let mut pool = Vec::new();
        // 50 câu MCQ Cơ bản
        for _ in 0..50 { pool.push(mock_question("MCQ", "EASY", "Câu hỏi")); }
        // 10 câu ESSAY Cơ bản
        for _ in 0..10 { pool.push(mock_question("ESSAY", "EASY", "Câu hỏi tự luận")); }

        let config = ExamMatrixConfig {
            subject: "Toán".to_string(),
            grade_id: 3,
            week_start: 1,
            week_end: 10,
            mcq_count: 10,
            essay_count: 2,
            advanced_ratio: 0.0,
            require_geometry: false,
            require_reading: false,
            shuffle_options: false,
        };

        let result = generate_exam_auto(pool, &config).unwrap();
        assert_eq!(result.len(), 12);
        assert_eq!(result.iter().filter(|q| q.q_type == "MCQ").count(), 10);
        assert_eq!(result.iter().filter(|q| q.q_type == "ESSAY").count(), 2);
    }

    #[test]
    fn test_not_enough_data() {
        let mut pool = Vec::new();
        // Cố tình chỉ cấp 15 câu MCQ
        for _ in 0..15 { pool.push(mock_question("MCQ", "EASY", "Câu hỏi")); }

        let config = ExamMatrixConfig {
            subject: "Toán".to_string(),
            grade_id: 3,
            week_start: 1,
            week_end: 10,
            mcq_count: 20, // Đòi 20 câu
            essay_count: 0,
            advanced_ratio: 0.0,
            require_geometry: false,
            require_reading: false,
            shuffle_options: false,
        };

        let result = generate_exam_auto(pool, &config);
        match result {
            Err(AppError::NotEnoughQuestions { required, available }) => {
                assert_eq!(required, 20);
                assert_eq!(available, 15);
            },
            _ => panic!("Phải trả về lỗi NotEnoughQuestions"),
        }
    }

    #[test]
    fn test_hard_constraints() {
        let mut pool = Vec::new();
        for _ in 0..10 { pool.push(mock_question("MCQ", "EASY", "Câu hỏi đại số")); }

        let config = ExamMatrixConfig {
            subject: "Toán".to_string(),
            grade_id: 3,
            week_start: 1,
            week_end: 10,
            mcq_count: 5,
            essay_count: 0,
            advanced_ratio: 0.0,
            require_geometry: true, // Bắt buộc Hình học
            require_reading: false,
            shuffle_options: false,
        };

        let result = generate_exam_auto(pool, &config);
        match result {
            Err(AppError::ConstraintFailed(msg)) => {
                assert_eq!(msg, "Thiếu câu hình học");
            },
            _ => panic!("Phải trả về lỗi ConstraintFailed"),
        }
    }
}
