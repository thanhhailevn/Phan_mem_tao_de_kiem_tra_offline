use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize)]
struct CurriculumData {
    version: String,
    updated_at: String,
    subjects: Vec<Subject>,
}

#[derive(Debug, Deserialize)]
struct Subject {
    subject_id: String,
    subject_name: String,
    grade: u32,
    topics: Vec<Topic>,
}

#[derive(Debug, Deserialize)]
struct Topic {
    topic_id: String,
    week_number: u32,
    title: String,
}

fn main() -> Result<()> {
    println!(">>> Bắt đầu tiến trình kiểm thử DB & Fetch Curriculum...");

    // 1. Khởi tạo thư mục database
    let db_path = Path::new("../database/app.db");
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).unwrap_or_default();
    }

    // 2. Mở kết nối SQLite (tạo mới nếu chưa có)
    let conn = Connection::open(db_path)?;
    println!("Đã kết nối thành công tới SQLite tại: {:?}", db_path);

    // 3. Tạo bảng settings và curriculum_topics
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS curriculum_topics (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            grade INTEGER NOT NULL,
            week_number INTEGER,
            title TEXT NOT NULL
        )",
        [],
    )?;

    println!("Đã khởi tạo xong các bảng CSDL (settings, curriculum_topics).");

    // 4. Giả lập quá trình Kéo Sàn kiến thức (từ file JSON local)
    // Trong thực tế, đoạn này sẽ dùng reqwest để tải từ URL trong settings
    let mock_json_path = "../mock_data/curriculum_lop3.json";
    println!("Đang đọc cấu trúc Sàn kiến thức chuẩn từ nguồn: {}", mock_json_path);
    
    let json_content = fs::read_to_string(mock_json_path)
        .expect("Không thể đọc file mock_data/curriculum_lop3.json. Hãy đảm bảo chạy script này ở đúng thư mục.");
    
    let data: CurriculumData = serde_json::from_str(&json_content)
        .expect("Parse JSON thất bại");

    // 5. Lưu vào CSDL
    // Lưu cấu hình
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params!["curriculum_source_url", "https://raw.githubusercontent.com/.../curriculum_lop3.json"],
    )?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params!["last_synced_at", data.updated_at],
    )?;

    // Lưu topics
    let mut stmt = conn.prepare(
        "INSERT OR REPLACE INTO curriculum_topics (id, subject, grade, week_number, title) 
         VALUES (?1, ?2, ?3, ?4, ?5)"
    )?;

    let mut count = 0;
    for subject in data.subjects {
        for topic in subject.topics {
            stmt.execute(params![
                topic.topic_id,
                subject.subject_name,
                subject.grade,
                topic.week_number,
                topic.title
            ])?;
            count += 1;
        }
    }

    println!("Thành công! Đã lưu {} Chủ đề/Tuần học vào CSDL SQLite.", count);

    // 6. Test xuất dữ liệu ra màn hình
    println!("\n>>> KIỂM TRA DỮ LIỆU ĐÃ LƯU TRONG DB:");
    let mut query = conn.prepare("SELECT key, value FROM settings")?;
    let settings_iter = query.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    for s in settings_iter {
        let (k, v) = s?;
        println!(" - [Settings] {}: {}", k, v);
    }

    let mut query = conn.prepare("SELECT subject, grade, week_number, title FROM curriculum_topics")?;
    let topic_iter = query.query_map([], |row| {
        Ok(format!("{} Lớp {} - Tuần {}: {}", 
            row.get::<_, String>(0)?, 
            row.get::<_, u32>(1)?, 
            row.get::<_, u32>(2)?, 
            row.get::<_, String>(3)?)
        )
    })?;
    for t in topic_iter {
        println!(" - [Curriculum] {}", t?);
    }

    Ok(())
}
