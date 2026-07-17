# Kế hoạch Triển khai Chi tiết (Implementation Plan & WBS)

## Phase 1: Setup Nền tảng (Infrastructure & Tooling)
**Mục tiêu:** Xây dựng móng nhà vững chắc trước khi xây tầng.

### 1.1 Khởi tạo Project & Frontend
- Chạy lệnh `npm create tauri-app@latest` (Mẫu React + TypeScript + Vite).
- Cấu hình TailwindCSS.
- Tích hợp Shadcn/UI (Cài đặt các atom cơ bản: `button`, `dialog`, `input`, `select`, `toast`, `tabs`).
- Thiết lập thư mục kiến trúc Frontend: `src/features`, `src/core`, `src/app`.
- Cài đặt các thư viện lõi: `zustand` (State), `react-hook-form` & `zod` (Form), `@tiptap/react` & `katex` (Editor).

### 1.2 Thiết lập Backend Rust & SQLite
- Bổ sung thư viện Rust vào `Cargo.toml`: `rusqlite` (Database), `tokio` (Async), `serde` & `serde_json` (Parse JSON), `thiserror` (Quản lý lỗi).
- Cấu hình SQLite connection với `PRAGMA journal_mode=WAL;`. Thiết lập thư mục `sqlx migrations`.
- Thiết lập Custom Protocol `local://` trong `main.rs` để đọc file từ thư mục `media/`.
- Tích hợp Embedded Fallback Data: Chèn cứng `default_curriculum.json` vào mã nguồn thông qua macro `include_str!`.
- Viết hàm tự động tạo thư mục `database/` và `media/` ở tầng AppData khi app khởi chạy lần đầu.

### 1.3 Cấu hình Testing & QA (Test-Driven Development)
- Thiết lập thư mục `tests/` ở Backend Rust. Viết các Unit Test (`cargo test`) giả lập thuật toán `exam_randomizer` (sinh ma trận đề).
- Cài đặt `vitest` và `@testing-library/react` cho các Core logic ở React.

## Phase 2: Database Engine (Lớp Dữ Liệu)
**Mục tiêu:** Tạo các bảng và cấu trúc Query.

- **DB_1:** Viết file script `init.sql` khởi tạo toàn bộ các bảng: `subjects`, `grades`, `topics`, `reading_passages`, `questions`, `exams`, `exam_questions`.
- **DB_2:** Khởi tạo bảng ảo FTS5 (Full-Text Search) cho bảng `questions`.
- **DB_3:** Viết hệ thống `AppError` Enum ở Rust để trả lỗi JSON sạch cho React.
- **DB_4:** Viết file `sqlite_repo.rs` định nghĩa các hàm CRUD cơ sở (Chưa nối vào Tauri Command).

## Phase 3: Module 1 - Sàn Kiến Thức
**Mục tiêu:** Hiển thị cây chương trình giáo dục.

### 3.1 Giao tiếp Backend (IPC & Offline-first)
- `cmd_sync_curriculum`: Lệnh kéo file JSON chuẩn từ Github/Cloud. Nếu mất mạng, hệ thống tự động fallback đọc từ `default_curriculum.json`.
- `cmd_get_tree`: Lệnh đệ quy (Recursive query) lấy cây `Khối -> Môn -> Chủ đề`.
- `cmd_update_topic_order`: Lệnh cập nhật thứ tự `order_index` khi người dùng kéo thả.

### 3.2 Giao diện Frontend (UI)
- Khởi tạo `useCurriculumStore.ts` (Zustand).
- Xây dựng Component `TreeView` hỗ trợ Expand/Collapse.
- Tích hợp thư viện `@hello-pangea/dnd` vào `TreeView` để hỗ trợ Drag & Drop.

## Phase 4: Module 2 - Ngân Hàng Câu Hỏi
**Mục tiêu:** Chức năng trọng tâm của hệ thống (Trắc nghiệm, Tự luận, Nối từ, Đọc hiểu).

### 4.1 Quản lý Media (Ảnh)
- Backend `cmd_save_media`: Nhận Base64 từ UI, lưu thành file vật lý đuôi `.png/.jpg` trong thư mục `media/`, trả về URI `<img src="local://...">`.

### 4.2 Lõi Soạn thảo Editor
- Build Component `TipTapEditor.tsx`: Tích hợp Toolbar (Bold, Italic), Image drop (gọi `cmd_save_media`), Math module (gọi KaTeX).

### 4.3 Form Tạo Câu hỏi (React Hook Form + Zod)
- Xây dựng `Zod Schema` cho 3 định dạng JSON: MCQ, MATCHING, ESSAY.
- Build Form `CreateMCQ`: Giao diện 4 text input đáp án, 1 radio box chọn câu đúng, 1 TipTap cho Lời giải.
- Build Form `CreateMatching`: Giao diện Add/Remove Cột Trái, Cột Phải, Select Box để nối.
- Build Form `CreateEssay`: Giao diện chọn loại khung (Lines/Box) và nhập số dòng.
- Build luồng `Grouped Question`: Popup tạo Ngữ liệu (Passage) -> Render thẻ Passage gốc -> Cung cấp nút `[+ Thêm câu hỏi con]` nối `passage_id`.

### 4.4 Các lệnh Backend tương ứng
- `cmd_create_passage` và `cmd_create_question` (Insert DB).
- `cmd_search_questions`: Trả về danh sách phân trang dựa theo Filter (Độ khó, Loại câu, Text search).

### 4.5 Giao diện Quản lý (Dashboard)
- Build `QuestionBankLayout`: Bố cục chia Cột Trái (Filter/Cây bài học), Cột Phải (Danh sách câu hỏi). Áp dụng **DOM Virtualization** (`@tanstack/react-virtual`) cho cuộn mượt mà.
- Build `QuestionCard`: Component render HTML an toàn (bắt buộc gọi qua `DOMPurify.sanitize()`), bôi màu đáp án, hiển thị Badge độ khó.

## Phase 5: Module 3 - Sinh Đề & Tinh Chỉnh
**Mục tiêu:** Thuật toán ma trận và giao diện làm mịn đề.

### 5.1 Thuật toán Lõi
- Backend `cmd_generate_matrix`:
  - Input: Tổng câu, Tỉ lệ Trắc nghiệm/Tự luận, Trọng số Độ khó, Phạm vi Bài học.
  - Xử lý: Query SQLite -> Bốc ngẫu nhiên.
  - **Edge Case:** Nếu bốc trúng câu hỏi chùm -> Gom toàn bộ câu hỏi có cùng `passage_id` vào mảng.
- Backend `cmd_swap_question`: Tìm 1 câu (LIMIT 1) cùng Topic, cùng Difficulty nhưng chưa xuất hiện trong List hiện tại.

### 5.2 Giao diện Frontend
- Build Component `MatrixConfigDialog`: Form nhập các thông số sinh đề.
- Build `DraftExamBoard`: Giao diện xem trước tờ đề.
- Tính năng Inline Edit: Double click vào câu hỏi mở Modal sửa text, lưu lại cache.
- Tính năng Swap: Click icon Random -> Lời gọi IPC đổi câu.
- Tính năng Drag & Drop: Sắp xếp lại vị trí câu hỏi trên tờ đề.

## Phase 6: Module 4 - Xuất Bản
**Mục tiêu:** Render ra 3 định dạng cuối.

- Frontend `InteractiveHtmlRenderer`: Đóng gói CSS/JS thành file tĩnh. Tính năng tự động chấm (Duyệt array so sánh ID đáp án).
- Frontend `DocxExporter`: Sử dụng thư viện `docx` (Node/Browser). Parse cây DOM HTML của tờ đề thành các đối tượng OpenXML tương ứng. Chèn Header Trường/Lớp.
- Frontend `PdfExporter`: Sử dụng `window.print()` của Browser với `@media print` CSS chuyên biệt (Giấu nút UI, cố định lề A4, bảo vệ hình ảnh không bị cắt ngang trang).
