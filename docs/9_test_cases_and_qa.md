# 8. Kịch bản Kiểm thử Tự động (Test Cases & QA Blueprint)

Để đảm bảo chất lượng phần mềm (Quality Assurance), hệ thống áp dụng phương pháp Automated Testing (Kiểm thử tự động). Thay vì dùng sức người (QA Manual) đi click từng nút, Developer BẮT BUỘC phải viết mã kiểm thử sử dụng `cargo test` cho Rust và `vitest` cho React.

Tài liệu này đặc tả các bộ Test Cases khắt khe nhất cần phải vượt qua.

---

## 8.1. Backend Unit Tests (Rust - `cargo test`)

Thuật toán Randomizer (Sinh đề) là trái tim của hệ thống. Đây là nơi xảy ra nhiều rủi ro logic nhất (Edge cases).

### Test Suite: `randomizer_engine_tests`

#### 1. Test Case: Đủ số lượng và đúng Tỉ lệ (Happy Path)
- **Mô tả:** Đảm bảo hàm `generate_exam` trả về đúng số lượng câu hỏi theo từng dạng bài cấu hình.
- **Input:** `ExamMatrixConfig` yêu cầu 10 Trắc nghiệm, 2 Tự luận, Môn Toán, Độ khó Cơ bản. (Mock DB có 50 câu).
- **Expected Output:**
  - `Result::Ok` chứa đối tượng `ExamDraft`.
  - Mảng `questions.len() == 12`.
  - Có đúng 10 câu `type == mcq` và 2 câu `type == essay`.
- **Lệnh chạy:** `cargo test test_generate_happy_path`

#### 2. Test Case: Thiếu câu hỏi trong kho (Not Enough Data)
- **Mô tả:** Kiểm thử khả năng bắt rủi ro khi số lượng câu hỏi trong kho ít hơn số lượng cấu hình.
- **Input:** Cấu hình đòi 20 câu Trắc nghiệm, nhưng Mock DB chỉ có 15 câu Trắc nghiệm thuộc Tuần 1.
- **Expected Output:**
  - `Result::Err(AppError::NotEnoughQuestions { required: 20, available: 15 })`.
  - Quá trình Transaction không ghi dữ liệu rác vào bảng `EXAMS`.

#### 3. Test Case: Ràng buộc Bắt buộc (Hard Constraints)
- **Mô tả:** Kiểm thử tùy chọn "Bắt buộc có câu Hình học".
- **Input:** Checkbox `must_have_geometry = true`.
- **Expected Output:**
  - Lọc toàn bộ mảng kết quả, phải có ít nhất 1 câu hỏi mang thẻ `geometry`.
  - Nếu Mock DB không có câu Hình học nào -> Phải văng lỗi `AppError::ConstraintFailed("Thiếu câu hình học")`.

### Test Suite: `file_io_tests` (Xử lý Hình ảnh)
- **Test Case:** Lưu Base64 sang Ảnh thật.
- **Input:** Truyền một chuỗi `Base64` giả lập ảnh PNG có dung lượng 50KB vào hàm `save_image_to_local`.
- **Expected Output:**
  - Hàm trả về đường dẫn `images/{uuid}.png`.
  - Hàm `fs::metadata` xác nhận file vật lý thực sự tồn tại ở thư mục `images/` và dung lượng > 0 bytes.
- **Teardown:** Chạy lệnh xóa file ảnh vừa tạo để giữ sạch môi trường test.

---

## 8.2. Frontend Integration Tests (React - `vitest` + `@testing-library/react`)

Kiểm thử việc gọi các API (IPC) và tính năng kết xuất giao diện mà không cần click tay.

### Test Suite: `question_editor_form.test.tsx`

#### 1. Test Case: Bắt lỗi Validation khi thiếu đáp án
- **Mô tả:** Đảm bảo Form không cho phép gọi IPC lưu câu hỏi nếu Giáo viên quên tick đáp án đúng.
- **Hành động (Action):**
  - Giả lập gõ chữ vào Editor.
  - Gõ vào 4 TextBox (A, B, C, D).
  - KHÔNG tick vào Radio Button nào.
  - Bấm nút `[Lưu Câu Hỏi]`.
- **Expected Output:**
  - Hàm `invoke("create_question")` KHÔNG được gọi (Spy func `not.toHaveBeenCalled()`).
  - Dòng chữ lỗi *"Vui lòng chọn 1 đáp án đúng"* hiển thị trên DOM.

### Test Suite: `excel_import_parser.test.ts`

#### 1. Test Case: Phân tích file Excel sai format
- **Mô tả:** Kiểm thử hàm Parse của thư viện XLSX khi user ném nhầm file.
- **Input:** Một file Excel bị thiếu cột "Đáp án đúng".
- **Expected Output:**
  - Hàm parse trả về mảng báo lỗi chi tiết cho dòng 2, 3...
  - UI hiển thị Bảng Data Table với các dòng màu đỏ, cột Status báo: `"Thiếu đáp án đúng"`.

---

## 8.3. E2E (End-to-End) Flow

Đây là kịch bản Tích hợp Toàn hệ thống (Chạy thật ứng dụng qua công cụ WebDriver của Tauri).

- **Kịch bản "Zero to Hero":**
  1. Khởi động phần mềm với CSDL trống.
  2. Simulate click nút `[Đồng bộ Sàn Kiến Thức]`. Đợi 2 giây. Assert cây thư mục hiện lên màn hình.
  3. Simulate thao tác gõ tạo 1 câu hỏi Trắc nghiệm -> Lưu. Thấy hiển thị trong bảng.
  4. Mở Tab Sinh đề -> Chọn tự động -> Sinh đề 1 câu hỏi đó.
  5. Assert màn hình chuyển sang Tờ Đề Tương Tác và hiển thị đúng câu hỏi vừa gõ.

*(Bộ quy tắc này đóng vai trò như một bản hợp đồng bảo vệ chất lượng. Bất kỳ đoạn Code mới nào khi Push lên Git mà làm Fail một trong các Test Cases này sẽ ngay lập tức bị từ chối - CI/CD chặn).*
