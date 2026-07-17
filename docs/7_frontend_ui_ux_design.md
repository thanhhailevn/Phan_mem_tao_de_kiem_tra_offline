# 7. Đặc tả Giao diện, Form và Trải nghiệm (UI/UX Blueprint)

Tài liệu này đặc tả chi tiết (Screen-by-screen blueprint) các thành phần giao diện, cách bố trí (Layout) của các form, dialog, và quy tắc Xác thực dữ liệu (Validation Rules) dựa trên hệ thống Radix UI / Shadcn.

---

## 7.1. Màn hình Ngân hàng Câu hỏi (Question Bank Dashboard)
Đây là màn hình trung tâm của giáo viên khi mở phần mềm.

- **Layout:**
  - **Sidebar (Trái - 250px):** Hiển thị Cây thư mục Sàn kiến thức (Toán/Tiếng Việt -> Lớp -> Tuần).
  - **Main Content (Phải):** Danh sách câu hỏi.
- **Thành phần Main Content:**
  - **Top Bar:** 
    - Thanh Tìm kiếm (Search bar) bự ở giữa. Placeholder: *"Tìm theo nội dung câu hỏi..."*.
    - Button `[+ Thêm Câu Hỏi Mới]` (Primary Color).
    - Button `[Import Excel]` (Outline/Secondary).
  - **Data Table:** 
    - Cột: ID, Nội dung vắn tắt (Truncated Text), Dạng bài, Độ khó, Hành động (Sửa/Xóa).
    - Phân trang (Pagination): 20 dòng/trang.
- **Vi-tương-tác (Micro-interaction):** Khi rê chuột (Hover) vào một dòng, xuất hiện tooltip hiển thị trước toàn bộ nội dung câu hỏi (Preview Popup) mà không cần click vào.

---

## 7.2. Dialog Form: Soạn thảo Câu hỏi Thủ công (Manual Editor)
Màn hình này sử dụng TipTap và mở dưới dạng Modal Popup hoặc Slide-over (Vuốt từ phải sang).

- **Cấu trúc Form:**
  - **Dạng câu hỏi (Select Dropdown):** Trắc nghiệm, Tự luận, Nối từ, Đọc hiểu. Mặc định: Trắc nghiệm.
  - **Nội dung câu hỏi (TipTap Rich Text Editor):**
    - Toolbar cố định phía trên: `B`, `I`, `U`, `A` (Color), `Bullets`, `Numbered`, `Indent`.
    - Nút `[∑ Toán học]`: Click vào mở ra Bàn phím ảo (Virtual Keyboard của MathLive).
    - Drop Zone: Có thể kéo thả ảnh trực tiếp vào khung này.
  - **Khu vực Đáp án (Render động theo Dạng câu hỏi):**
    - Nếu là Trắc nghiệm: 4 ô Textbox A, B, C, D. Bên cạnh mỗi ô có một Radio Button để tick chọn Đáp án đúng.
    - Nếu là Nối từ: 2 cột Trái - Phải. Nút `[+ Thêm cặp nối]`.
    - Nếu là Tự luận: Ô Textbox cho "Lời giải chi tiết" và Input Number cho "Số dòng kẻ trống (Solution Space)".
  - **Độ khó (Radio Group):** Dễ (Màu Lục), Trung bình (Màu Cam), Khó (Màu Đỏ).
- **Validation Rules (Luật xác thực):**
  - Nội dung câu hỏi: Bắt buộc (Không được để trống). Max 5000 ký tự.
  - Đáp án trắc nghiệm: Phải nhập đủ 4 ô, và bắt buộc phải tick 1 đáp án đúng. (Hiện chữ đỏ `"Vui lòng chọn 1 đáp án đúng"` nếu quên).

---

## 7.3. Dialog Form: Import Excel
- **Bố cục:**
  - Nút `[Tải File Mẫu (.xlsx)]` ở góc phải trên.
  - **Drag & Drop Zone (Vùng thả file):** Khung đứt nét bự ở giữa. Chữ mờ *"Kéo thả file Excel vào đây hoặc click để chọn file"*.
- **Luồng xử lý & UI State:**
  - Khi đang parse: Hiện Progress Bar (Thanh tiến trình).
  - Khi hoàn tất: Bảng Data Table review kết quả.
    - Dòng thành công: Hiện tick xanh.
    - Dòng lỗi (Lỗi thiếu đáp án, sai format độ khó): Dòng bôi màu Đỏ nhạt. Cột cuối hiện text *"Lỗi: Thiếu đáp án đúng"*. 
  - Nút `[Xác nhận Nhập x/y câu hợp lệ]`: Chỉ import những câu không bị lỗi.

---

## 7.4. Màn hình Cấu hình Sinh Đề (Exam Generator Configuration)

Chia thành 2 Tabs rõ rệt: **Tự động** và **Thủ công**. Form Tự động là phức tạp nhất.

### 7.4.1. Thông tin chung (Top Section)
- **Tên đề thi (Input Text):** Placeholder: *"Đề kiểm tra giữa kỳ 1..."* (Bắt buộc, Max 100 ký tự).
- **Người tạo (Input Text):** Tự động nhớ tên đã gõ lần trước nhờ localStorage. (Bắt buộc).

### 7.4.2. Tab Tự Động (Automatic Engine Form)
- **Row 1 - Phạm vi:** 
  - Select Môn (Toán, TV, Hỗn hợp). 
  - Select Kỳ thi. 
  - Dual Slider (Thanh trượt đôi): Từ Tuần `[ 1 ]` đến Tuần `[ 18 ]`.
- **Row 2 - Ma trận:**
  - Nếu chọn Đơn môn: 4 ô Input Number tương ứng (Trắc nghiệm, Tự luận, Nối, Đọc hiểu). Có số đếm tổng số câu hiện ra ngay bên cạnh.
  - Nếu chọn Hỗn hợp: Thêm một thanh trượt Tỉ lệ. Kéo trái là 100% Toán, kéo phải là 100% Tiếng Việt.
- **Row 3 - Hard Constraints (Tùy chọn Bắt buộc):**
  - Dạng Checkboxes.
  - `[x] Bắt buộc có câu Hình học` (Icon: Cảnh báo, Tooltip: *"Nếu chọn, hệ thống có thể báo lỗi nếu trong kho không có câu Hình học nào"*).
  - `[x] Trộn thứ tự đáp án (A,B,C,D)`.

### 7.4.3. Màn hình Tờ Đề Tương Tác (Interactive Draft)
Sau khi bấm `[Sinh Đề]`, chuyển sang màn hình này.
- **Layout Split-pane:**
  - Trái (70%): Preview tờ đề y hệt bản in A4 (Nền trắng, viền đổ bóng như tờ giấy).
  - Phải (30%): Khung tùy chọn Export (PDF/DOCX/HTML).
- **Inline Edit (Sửa tại chỗ):** Double-click vào câu 1, biến thành TipTap editor viền xanh dương. Nhấn Enter để lưu.
- **Nút Tráo Câu (Ma thuật):** Nút tròn bên lề phải mỗi câu hỏi (Icon Rotate). Khi bấm -> Icon quay vòng (Spin animation) 0.5s -> Nội dung câu hỏi mờ đi (Opacity 0.5) và Fade-in thành câu hỏi mới cùng dạng. Dưới góc phải màn hình nảy lên Toast: *"Đã thay bằng 1 câu hình học khác tương đương"*.
