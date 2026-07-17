CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    grade_id INTEGER,
    parent_id INTEGER,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    week_number INTEGER, -- MỚI: Dùng để giới hạn tuần học khi trộn đề
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(grade_id) REFERENCES grades(id),
    FOREIGN KEY(parent_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS reading_passages (
    id TEXT PRIMARY KEY,
    topic_id INTEGER,
    content TEXT NOT NULL,
    FOREIGN KEY(topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    topic_id INTEGER,
    passage_id TEXT,
    q_type TEXT CHECK( q_type IN ('MCQ', 'ESSAY', 'MATCHING') ) NOT NULL,
    content TEXT NOT NULL,
    options TEXT, -- JSON Array Text
    correct_answer TEXT,
    explanation TEXT,
    solution_space INTEGER, -- MỚI: Số dòng kẻ trống cho câu tự luận
    difficulty TEXT CHECK( difficulty IN ('EASY', 'MEDIUM', 'HARD') ),
    FOREIGN KEY(topic_id) REFERENCES topics(id),
    FOREIGN KEY(passage_id) REFERENCES reading_passages(id)
);

-- Khởi tạo bảng ảo FTS5 (Full-Text Search) cho phép tìm kiếm siêu tốc trên câu hỏi
CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(
    id UNINDEXED,
    content,
    content='questions',
    content_rowid='rowid'
);

CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_by TEXT NOT NULL, -- MỚI: Tên người tạo
    exam_matrix TEXT, -- JSON Text: Lưu config sinh đề
    question_ids TEXT, -- JSON Array: Lưu mảng UUID các câu hỏi
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

