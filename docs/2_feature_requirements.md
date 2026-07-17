# 2. Đặc tả Yêu cầu Tính năng Sâu (Deep Feature Specifications - v2)

Tài liệu này đặc tả hành vi của Hệ thống (System Behaviors), các Trạng thái Giao diện (UI State Machines), và phương án xử lý Ngoại lệ (Edge Cases).

---

## 2.1. Module 1: Cấu hình và Đồng bộ Sàn Kiến thức (Curriculum Sync)

Cho phép ứng dụng tự động thiết lập cây thư mục môn học dựa trên một nguồn JSON chuẩn do đội ngũ phát triển cung cấp.

### 2.1.1. Máy trạng thái giao diện (UI State Machine)
- **`IDLE`:** Form nhập `Source URL` và `API Key`. Có nút "Kéo Dữ Liệu".
- **`FETCHING`:** Vô hiệu hóa nút bấm. Hiện Spinner. *"Đang kết nối tới máy chủ..."*.
- **`PARSING_SAVING`:** *"Đang lưu cấu trúc vào Cơ sở dữ liệu..."*. (SQLite Transaction).
- **`SUCCESS`:** Hiện dấu Tick xanh. Toast notification: *"Đã đồng bộ 3 môn học, 105 chủ đề"*. Reload Sidebar.
- **`ERROR`:** Trở về trạng thái `IDLE`. Hiện thông báo đỏ (Timeout / Sai JSON).

---

## 2.2. Module 2: Quản lý và Soạn thảo Câu hỏi (Question Editor Core)

Hệ thống cung cấp 2 phương thức nhập liệu: Nhập hàng loạt qua Excel và Soạn thảo thủ công.

### 2.2.1. Import hàng loạt từ file Excel (Bulk Import)
- **Công cụ Hỗ trợ:** Nút `[Tải File Mẫu (.xlsx)]` chứa cấu trúc các cột chuẩn (`Content`, `Option A`, `Option B`, `Correct Answer`, `Difficulty`, `Type`).
- **Luồng xử lý (Data Flow):** 
  - Người dùng Upload file `.xlsx`.
  - Frontend dùng thư viện `xlsx` để parse dữ liệu thành mảng JSON.
  - Gửi array qua lệnh Tauri IPC `import_questions_from_excel`.
  - Rust duyệt mảng, kiểm tra Validation (Bỏ trống đáp án, Trùng lặp), insert vào DB.
- **Giới hạn (Limitation):** Để đảm bảo tính chính xác cho ứng dụng Offline, tính năng Import Excel **chỉ hỗ trợ dạng văn bản thuần túy (Text-only)** cho Trắc nghiệm và Tự luận. Không hỗ trợ chèn ảnh trực tiếp từ file Excel. Ảnh cần được chèn thủ công sau khi import.

### 2.2.2. Soạn thảo Thủ công (Manual Input & Rich Text Editor)
Sử dụng TipTap (dựa trên ProseMirror) kết hợp MathLive để cung cấp môi trường soạn thảo chuyên nghiệp nhất.
- **Thanh Công Cụ (Toolbar) Đầy đủ:** 
  - Bôi đậm (Bold), In nghiêng (Italic), Gạch chân (Underline).
  - Chọn màu chữ (Text Color) và Màu nền (Highlight).
  - Căn lề (Align Left/Center/Right/Justify) và Thụt lề (Indent).
  - Danh sách không định dạng (Bulleted List) và Đánh số thứ tự (Numbered List).
- **Công thức Toán học Tiên tiến:** 
  - Tích hợp `MathLive` component. Người dùng có thể gọi một Pop-up bàn phím Toán học ảo (Virtual Math Keyboard) để gõ phân số, căn bậc, dấu tích phân một cách trực quan (WYSIWYG) mà không cần phải nhớ code LaTeX. Kết quả được render thành HTML hoặc SVG nhúng trực tiếp vào TipTap Editor.
- **Xử lý Hình ảnh (Drag & Drop Intercept):** 
  - Kéo thả ảnh -> Tauri I/O cắt ảnh lưu vào `QuizApp_Portable/images/uuid.png` -> Editor chèn thẻ `<img>` với src relative.

---

## 2.3. Module 3: Công cụ Sinh Đề (Exam Randomizer Engine)

Được thiết kế linh hoạt với 2 chế độ: **Thủ công (Manual)** và **Tự động (Automatic)**.

### 2.3.1. Chế độ Sinh đề Thủ công (Manual Generation)
- **Mục đích:** Dành cho giáo viên muốn kiểm soát 100% nội dung tờ đề.
- **Luồng thao tác:**
  - **Tạo đề mới:** Giáo viên bắt buộc nhập **Tên Đề thi** (Ví dụ: "Đề kiểm tra Giữa kỳ 1 Môn Toán Lớp 3") và **Người tạo** (Ví dụ: "Cô Hạnh").
  - Giao diện mở ra Ngân hàng câu hỏi thu nhỏ (Side-panel) đi kèm thanh Search.
  - Giáo viên có thể Lọc (Filter theo Lớp/Tuần) và gõ từ khóa (sử dụng FTS5 index) để tìm câu hỏi.
  - Click vào Checkbox của từng câu để ném (Add) câu đó sang phần Đề thi. Có thể kéo thả (Drag & Drop) để xếp lại thứ tự.

### 2.3.2. Chế độ Sinh đề Tự động (Automatic Generation)
Dành cho việc tạo đề kiểm tra hàng loạt trong tích tắc. Giáo viên sẽ điền vào một Form Cấu hình Tham số cực kỳ chi tiết (Exam Matrix Config):

1. **Thông tin Cơ bản:**
   - **Tên đề thi & Người tạo:** Bắt buộc nhập để lưu vào Cơ sở dữ liệu và in lên Header (Tiêu đề) của tờ đề.
   - **Môn học:** `Toán`, `Tiếng Việt`, hoặc `Hỗn hợp` (Đề thi tích hợp cả 2 môn).
   - **Loại đề kiểm tra:** `Giữa kỳ 1`, `Cuối kỳ 1`, `Giữa kỳ 2`, `Cuối kỳ 2`.
   - **Phân loại Độ khó:** `Cơ bản` (ưu tiên câu dễ/tb) hoặc `Nâng cao` (ưu tiên câu khó).

2. **Giới hạn Tri thức (Knowledge Scope):**
   - Từ `Tuần X` đến `Tuần Y`. Randomizer sẽ chỉ quét các câu hỏi có trường `week_number` nằm trong khoảng này.

3. **Ma trận Cấu trúc (Exam Matrix):**
   - **Đề Đơn môn:** Khai báo cụ thể số lượng câu hỏi cho mỗi dạng.
     - Trắc nghiệm: `10 câu`
     - Tự luận: `2 câu`
     - Đọc hiểu: `1 chùm (Đoạn văn)`
   - **Đề Hỗn hợp (Toán + Tiếng Việt):**
     - Xuất hiện thanh trượt (Slider) để cấu hình **Tỉ lệ Môn học**. Ví dụ: `60% Toán - 40% Tiếng Việt`. Hệ thống tự tính toán tổng số điểm/tổng số câu phân bổ tương ứng.

4. **Tùy chọn Nâng cao (Hard Constraints - Checkboxes):**
   - Bắt buộc có các điều kiện đặc thù để đảm bảo chất lượng đề thi.
   - `[x] Bắt buộc có câu Hình học (Toán)`
   - `[x] Bắt buộc có Bài tập Nối từ (Tiếng Việt)`
   - `[x] Đảo ngẫu nhiên vị trí đáp án A/B/C/D bên trong các câu Trắc nghiệm`.

### 2.3.3. Thuật toán Xử lý (Logic) & Edge Cases
- Randomizer Engine của Rust sẽ nhận toàn bộ `ExamMatrixConfig` dưới dạng JSON. Dùng query SQLite để gom các nhóm ID thỏa mãn điều kiện.
- **Edge Case (Khoảng trống tri thức):** Nếu user chọn *"Bắt buộc có câu Hình học"* nhưng trong Tuần X-Y không có câu nào mang nhãn Hình học -> Cảnh báo: *"Không tìm thấy câu hỏi Hình học nào trong phạm vi Tuần X đến Y. Bỏ qua điều kiện bắt buộc này?"*

---

## 2.4. Module 4: Tinh chỉnh Bản nháp (Interactive Exam Refinement)

- **Inline Editing:** Nhấp đúp chuột để sửa chữ trực tiếp trên tờ đề nháp. Tùy chọn Lưu cục bộ hoặc Cập nhật vào Ngân hàng gốc.
- **Random Swap (Đổi câu):** Nút xoay vòng cạnh mỗi câu hỏi để gọi lại Randomizer, lấy 1 câu hỏi tương đương (Cùng loại, độ khó, chủ đề) để thay thế tức thì.

---

## 2.5. Module 5: Xuất bản Đề (Exporting Pipelines)

- **Export HTML:** Xuất file tĩnh để học sinh làm bài trên trình duyệt, tự động báo Xanh/Đỏ và Lời giải.
- **Export PDF & DOCX:** Hệ thống xử lý tự động chèn khoảng trống (dòng kẻ `......`) cho câu tự luận. Tự động sinh trang phụ lục Đáp án ở cuối. Đóng gói file `.docx` kèm hình ảnh Local chuẩn chỉnh.
