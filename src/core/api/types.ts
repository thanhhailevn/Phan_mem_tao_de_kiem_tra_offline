// ==========================================
// IPC TYPES - MUST MATCH RUST MODELS EXACTLY
// ==========================================

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ' | 'ESSAY' | 'MATCHING';

export interface Question {
    id: string;
    topic_id: number;
    passage_id: string | null;
    q_type: QuestionType;
    content: string;
    options: string | null; // JSON String, we'll parse it in frontend
    correct_answer: string | null;
    explanation: string | null;
    solution_space: number | null;
    difficulty: Difficulty | null;
}

export interface Topic {
    id: number;
    subject_id: number;
    grade_id: number;
    parent_id: number | null;
    name: string;
    order_index: number;
    week_number: number | null;
}

export interface Exam {
    id: string;
    title: string;
    created_by: string;
    exam_matrix: string | null; // JSON String
    question_ids: string | null; // JSON Array String
    created_at: string | null;
    updated_at: string | null;
}

export interface ExamMatrixConfig {
  subject: string;
  grade_id: number;
  week_start: number;
  week_end: number;
  mcq_count: number;
  essay_count: number;
  advanced_ratio: number;
  require_geometry: boolean;
  require_reading: boolean;
  shuffle_options: boolean;
}

// ==========================================
// APP ERROR
// ==========================================
export interface AppError {
    BusinessLogic?: string;
    Database?: string;
    FileSystem?: string;
    Unknown?: string;
}
