# 11. Kế hoạch Thực thi Mã nguồn Chi tiết (Master Implementation Plan)

Sau khi rà soát Codebase và đối chiếu với Bộ Tài liệu Kiến trúc Enterprise, Kế hoạch Thực thi (Implementation Plan) dưới đây được thiết kế ở mức độ vi mô (Micro-level). Nó liệt kê chính xác tên hàm, tên module, tên component cần phải code. 

Dự án được chia thành 5 Phase (Giai đoạn) với chiến lược **Đáy lên Đỉnh (Bottom-Up)**: Làm móng DB -> Xây lõi Rust -> Ghép API -> Đắp giao diện React -> Kiểm thử tự động.

---

## PHASE 1: Data Access Layer (Làm lại Móng Database)
*Xóa bỏ toàn bộ tàn dư của thiết kế cũ. Áp dụng JSON Array và FTS5.*

### Task 1.1: Refactor Schema (`migrations/init.sql`)
- Xóa bỏ bảng `exam_questions`.
- Cập nhật bảng `questions`: Bổ sung cột `solution_space` (INT), đưa cột `options` về dạng JSON Text. Cập nhật `week_number` vào `topics` hoặc `questions`.
- Cập nhật bảng `exams`: Thêm `created_by` (TEXT), `exam_matrix` (JSON Text), `question_ids` (JSON Text). Bổ sung `updated_at`.
- Đảm bảo bảng ảo `questions_fts` được config đồng bộ.

### Task 1.2: Rust Models (`repository/models.rs`)
- Cập nhật struct `Question` và `Exam`.
- Định nghĩa các Struct trung gian (Dùng `serde::Deserialize`): `OptionItem`, `ExamMatrixConfig`, `QuestionIdArray`.

### Task 1.3: Rust SQLite Repository (`repository/sqlite_repo.rs`)
- Viết hàm: `pub fn create_question(&self, q: Question) -> Result<String>`
- Viết hàm: `pub fn get_questions_by_filters(&self, subject: &str, week_start: i32, week_end: i32) -> Result<Vec<Question>>`
- Viết hàm: `pub fn create_exam(&self, exam: Exam) -> Result<String>`
- Viết hàm: `pub fn update_exam_questions(&self, exam_id: &str, new_q_ids: Vec<String>) -> Result<()>`

---

## PHASE 2: Core Logic & Tauri IPC Contracts (Xây lõi Thuật toán)
*Biến Backend Rust thành một cỗ máy xử lý siêu tốc độ và Type-Safe.*

### Task 2.1: Image I/O Manager (`infrastructure/file_system.rs`)
- Hàm `save_base64_image(base64: String) -> Result<String, AppError>`:
  - Tách Header (VD: `data:image/png;base64,`). Decode chuỗi.
  - Sinh UUID (v4) làm tên file. Lưu file vật lý vào thư mục `/images/`. Trả về relative path.

### Task 2.2: API Sàn Kiến Thức (`commands/curriculum_cmd.rs`)
- `#[tauri::command] pub async fn sync_curriculum(...)` -> Tải JSON, insert hàng loạt vào DB.
- `#[tauri::command] pub fn get_curriculum_tree(...)` -> Lấy cây thư mục.

### Task 2.3: Lõi Randomizer Engine (`domains/exam_generator.rs`)
- Xóa bỏ hàm `mock` cũ. Cài đặt thuật toán thực tế:
  1. **Filter (Lọc):** Truy vấn SQLite lấy tất cả câu hỏi thỏa mãn Tuần, Môn học.
  2. **Split (Chia nhóm):** Tách thành 2 mảng `basic_pool` và `advanced_pool`.
  3. **Sample (Bốc mẫu):** Random chọn đúng số lượng theo Tỉ lệ % đầu vào.
  4. **Validate Constraints:** Kiểm tra nếu mảng kết quả không có câu Hình Học (khi User tick bắt buộc) -> `return Err(AppError::ConstraintFailed)`.
  5. **Shuffle:** Dùng `rand::seq::SliceRandom` trộn thứ tự đáp án A/B/C/D bên trong mảng JSON `options` của từng câu hỏi trắc nghiệm.

### Task 2.4: API Sinh Đề (`commands/exam_cmd.rs`)
- `#[tauri::command] pub fn generate_exam_auto(config: ExamMatrixConfig)` -> Gọi hàm ở 2.3, lưu DB, trả về `ExamDraft`.
- `#[tauri::command] pub fn swap_question(exam_id, old_q_id)` -> Đổi 1 câu hỏi ngẫu nhiên tương đương.

---

## PHASE 3: Frontend Architecture & Zustand (Lớp Trạng Thái)
*Bọc toàn bộ Logic kết nối IPC vào các React Hooks.*

### Task 3.1: API Clients (`src/core/api/`)
- Tạo file `tauri-invoke.ts` bọc hàm `invoke` của Tauri.
- Viết Type Def (TypeScript Interfaces) đồng nhất 100% với Rust Structs. Định nghĩa `AppError` type để bắt lỗi bằng `toast.error()`.

### Task 3.2: Zustand Stores (`src/core/stores/`)
- `useCurriculumStore.ts`: `topics`, `activeTopic`, `fetchAction()`.
- `useQuestionBankStore.ts`: `questions`, `filters`, `pagination`, `loadQuestions()`.
- `useExamStore.ts`: `examDraft`, `generateExamAction()`.

---

## PHASE 4: UI/UX Blueprint Implementation (Đắp Giao Diện)
*Xây dựng giao diện Desktop-native.*

### Task 4.1: Component Shell & Layout
- Sidebar, Topbar kính mờ (Glassmorphism).

### Task 4.2: Question Editor Dialog (`src/features/questions/components/`)
- Cài đặt `@tiptap/react` + `mathlive`. 
- Gắn thanh Toolbar (Bold, Italic, Color).
- Gắn sự kiện `onDrop`: Lấy file ảnh -> Đọc Base64 -> Gọi IPC `save_base64_image` -> Chèn `<img>` vào TipTap.
- Render form Động theo kiểu câu hỏi (4 ô Đáp án Trắc nghiệm, hoặc 2 cột Nối từ).
- **Validation:** Bắt buộc nhập đề, bắt buộc tick đáp án đúng (Dùng `zod` + `react-hook-form`).

### Task 4.3: Excel Import Feature
- Nút Import mở Dialog. Dropzone nhận file.
- Dùng `xlsx` package đọc file -> Validate -> Hiển thị Data Table (Dòng xanh/Dòng đỏ).

### Task 4.4: Auto Exam Generator Form (`src/features/exams/components/`)
- Dựng UI Form với Tabs (Tự động / Thủ công).
- Dual Sliders cho Tuần học và Tỉ lệ %.
- Checkboxes cho các Ràng buộc. Nút Submit bọc Loading Spinner.

### Task 4.5: Interactive Draft Screen (Split-pane)
- Màn hình chia đôi. Trái là Tờ đề (A4 style), Phải là Option Panel.
- Nút Xoay vòng (Swap) với CSS keyframes spin.

---

## PHASE 5: QA & Automated Testing
- **Task 5.1:** Viết 3 Unit Tests trong Rust cho hàm `exam_generator.rs` (Kiểm thử tỉ lệ cơ bản/nâng cao, kiểm thử thiếu dữ liệu).
- **Task 5.2:** Chạy `vitest` cho hàm parse Excel của Frontend.
