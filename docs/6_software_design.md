# 6. Thiết kế Phần mềm & Hợp đồng Mã nguồn (Software Design Blueprint)

Tài liệu này xác định kiến trúc lớp Ứng dụng (Application Layer), thiết kế trạng thái State Management ở Frontend, và đặc tả 100% các Hợp đồng Giao tiếp (IPC Contracts) giữa React và Rust theo nguyên lý **Deep Modules**.

---

## 6.1. Kiến Trúc Frontend State Management (Zustand)

Frontend không sử dụng Redux (vì Boilerplate quá lớn) mà chia nhỏ thành các **Store độc lập** (Atomic Stores) sử dụng `zustand`.

### 6.1.1. `useCurriculumStore` (Quản lý Cây Sàn Kiến thức)
- **State:**
  - `topics: CurriculumTopic[]` (Danh sách chủ đề bóc từ SQLite)
  - `isLoading: boolean`
  - `activeTopicId: string | null` (Chủ đề đang được chọn trên Sidebar)
- **Actions:**
  - `fetchTopics()`: Gọi IPC lấy toàn bộ cây thư mục.
  - `setActiveTopic(id)`: Highlight chủ đề đang xem.

### 6.1.2. `useQuestionBankStore` (Quản lý Bảng Câu Hỏi)
- **State:**
  - `questions: QuestionItem[]`
  - `filters: { difficulty?: number, type?: string, searchKeyword: string }`
  - `pagination: { page: number, limit: number, total: number }`
- **Actions:**
  - `loadQuestions()`: Gửi filter và pagination xuống Rust để lấy Data (tích hợp FTS5 nếu có `searchKeyword`).
  - `deleteQuestion(id)`: Gọi IPC xóa câu hỏi, sau đó gỡ khỏi mảng `questions` (Optimistic UI update).

### 6.1.3. `useExamStore` (Quản lý Trạng thái Đề thi)
- **State:**
  - `examConfig: ExamMatrixConfig` (Form Cấu hình sinh đề)
  - `currentDraft: ExamDraft | null` (Tờ đề nháp hiện tại đang tương tác)
- **Actions:**
  - `generateExam()`: Gửi `examConfig` xuống Rust, nhận về `currentDraft`.
  - `swapQuestion(oldId, newId)`: Thay đổi câu hỏi ngay trên bản nháp.
  - `exportToPdf()`: Gửi `currentDraft.exam_id` xuống Rust để render PDF.

---

## 6.2. Đặc tả Hợp đồng API 100% (Tauri IPC Contracts)

Ranh giới giữa TypeScript và Rust phải được Type-Safe tuyệt đối. Dưới đây là các Hợp đồng cốt lõi (Contracts).

### 6.2.1. Module Sàn Kiến thức (Curriculum)
**Rust Endpoint:**
```rust
#[tauri::command]
async fn sync_curriculum(url: String, api_key: Option<String>) -> Result<SyncReport, AppError>

#[tauri::command]
fn get_curriculum_tree() -> Result<Vec<CurriculumTopic>, AppError>
```
**TypeScript Mappings:**
```typescript
interface CurriculumTopic {
  id: string; // UUID
  subject: "Toán" | "Tiếng Việt";
  grade: number;
  week_number: number;
  title: string;
}
interface SyncReport { topics_inserted: number; last_synced_at: string; }
```

### 6.2.2. Module Câu Hỏi (Question Bank)
**Rust Endpoint:**
```rust
#[tauri::command]
fn create_question(payload: CreateQuestionPayload) -> Result<String, AppError> // Trả về UUID

#[tauri::command]
fn get_questions(filter: QuestionFilter) -> Result<PaginatedQuestions, AppError>

#[tauri::command]
fn save_image_to_local(base64_data: String) -> Result<String, AppError> // Trả về "images/uuid.png"
```
**TypeScript Mappings:**
```typescript
interface CreateQuestionPayload {
  topic_id: string;
  type: "mcq" | "essay" | "matching";
  content: string; // Rich Text HTML
  options: any[]; // Denormalized JSON array
  correct_answer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

interface QuestionFilter {
  topic_id?: string;
  search_keyword?: string; // Kích hoạt FTS5 MATCH query
  page: number;
  limit: number;
}
```

### 6.2.3. Module Sinh Đề (Randomizer & Exams)
**Rust Endpoint:**
```rust
#[tauri::command]
fn generate_exam(config: ExamMatrixConfig) -> Result<ExamDraft, AppError>

#[tauri::command]
fn swap_question(exam_id: String, old_question_id: String) -> Result<QuestionItem, AppError>

#[tauri::command]
fn export_exam(exam_id: String, format: String) -> Result<String, AppError> // Trả về file path
```
**TypeScript Mappings:**
```typescript
interface ExamMatrixConfig {
  title: string;          // MỚI: Tên đề thi (Bắt buộc)
  created_by: string;     // MỚI: Người tạo (Bắt buộc)
  subject: "Toán" | "Tiếng Việt" | "Hỗn hợp";
  grade: number;
  week_start: number;
  week_end: number;
  difficulty: "Cơ bản" | "Nâng cao";
  counts: {
    mcq: number;
    essay: number;
    matching: number;
    reading: number;
  };
  mixed_ratio?: { math: number; vietnamese: number }; // Nếu môn "Hỗn hợp"
  hard_constraints: {
    must_have_geometry?: boolean;
    shuffle_options?: boolean;
  };
}
```

---

## 6.3. Cấu Trúc Bắt Lỗi Chuyên Sâu (Error Enums)

Rust backend sử dụng Enum `AppError` kết hợp `thiserror` và `serde::Serialize` để giao tiếp mượt mà với React. Tuyệt đối không dùng `unwrap()` bừa bãi.

```rust
#[derive(Debug, thiserror::Error, serde::Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("Lỗi cơ sở dữ liệu: {0}")]
    DatabaseError(String),
    
    #[error("Không thể kết nối tải dữ liệu. Lỗi: {0}")]
    NetworkError(String),
    
    #[error("Thiếu câu hỏi. Cần {required}, chỉ tìm thấy {available}. Vui lòng nới lỏng điều kiện.")]
    NotEnoughQuestions { required: usize, available: usize },
    
    #[error("Lỗi phân tích file Excel dòng số {line}: {reason}")]
    ExcelParseError { line: u32, reason: String },
    
    #[error("Lỗi lưu file ảnh vào ổ cứng: {0}")]
    IoError(String),
}
```

Trên giao diện React, Hook gọi IPC sẽ map trực tiếp Type này vào Toast Notification:
```typescript
invoke("generate_exam", { config }).catch((err: AppError) => {
  if (err.type === "NotEnoughQuestions") {
    toast.error(err.message); // Hiển thị nguyên văn tiếng Việt rất thân thiện
  }
});
```
