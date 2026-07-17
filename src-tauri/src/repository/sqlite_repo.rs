use rusqlite::{Connection, OpenFlags};
use std::path::Path;
use crate::domains::error::{AppError, Result};
use crate::repository::models::Question;

use std::sync::Mutex;

/// Cấu trúc đại diện cho kho dữ liệu SQLite
/// Bắt buộc có comment bằng Tiếng Việt
pub struct SqliteRepo {
    /// Kết nối nội bộ tới file SQLite (được bọc trong Mutex để Thread-safe)
    conn: Mutex<Connection>,
}

impl SqliteRepo {
    /// Khởi tạo kết nối tới cơ sở dữ liệu và bật chế độ WAL để tăng tốc độ
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        let conn = Connection::open_with_flags(
            db_path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        )?;
        
        // Bật chế độ Write-Ahead Logging
        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        
        Ok(Self { conn: Mutex::new(conn) })
    }

    /// Khởi tạo các bảng từ file init.sql
    pub fn init_schema(&self) -> Result<()> {
        let init_sql = include_str!("../../migrations/init.sql");
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(init_sql)?;
        Ok(())
    }

    /// Lấy danh sách toàn bộ câu hỏi
    pub fn get_all_questions(&self) -> Result<Vec<Question>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, topic_id, passage_id, q_type, content, options, correct_answer, explanation, solution_space, difficulty FROM questions")?;
        
        let question_iter = stmt.query_map([], |row| {
            Ok(Question {
                id: row.get(0)?,
                topic_id: row.get(1)?,
                passage_id: row.get(2)?,
                q_type: row.get(3)?,
                content: row.get(4)?,
                options: row.get(5)?,
                correct_answer: row.get(6)?,
                explanation: row.get(7)?,
                solution_space: row.get(8)?,
                difficulty: row.get(9)?,
            })
        })?;

        let mut questions = Vec::new();
        for q in question_iter {
            questions.push(q?);
        }
        Ok(questions)
    }

    /// Lọc câu hỏi theo Môn học và khoảng Tuần học (phục vụ Randomizer Engine)
    /// Bắt buộc comment tiếng Việt
    pub fn get_questions_by_filters(&self, _subject: &str, _week_start: i32, _week_end: i32) -> Result<Vec<Question>> {
        let conn = self.conn.lock().unwrap();
        // Tạm thời query toàn bộ (để test thuật toán)
        // Code production sẽ JOIN với bảng topics để lọc theo week_number và subject
        let mut stmt = conn.prepare("SELECT id, topic_id, passage_id, q_type, content, options, correct_answer, explanation, solution_space, difficulty FROM questions")?;
        
        let question_iter = stmt.query_map([], |row| {
            Ok(Question {
                id: row.get(0)?,
                topic_id: row.get(1)?,
                passage_id: row.get(2)?,
                q_type: row.get(3)?,
                content: row.get(4)?,
                options: row.get(5)?,
                correct_answer: row.get(6)?,
                explanation: row.get(7)?,
                solution_space: row.get(8)?,
                difficulty: row.get(9)?,
            })
        })?;

        let mut questions = Vec::new();
        for q in question_iter {
            questions.push(q?);
        }
        Ok(questions)
    }
}
