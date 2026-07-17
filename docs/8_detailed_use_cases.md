# 9. Đặc tả Ca Sử dụng Chi Tiết (Detailed Use Cases Specification)

Tài liệu này áp dụng tiêu chuẩn UML Use Case Specification để đặc tả tường tận từng thao tác, từng ngoại lệ và kết quả mong muốn của các luồng nghiệp vụ phức tạp nhất trong hệ thống.

---

## UC-01: Tải Template & Import Excel

**1. Tóm tắt:** Cho phép Giáo viên/Admin tải file Excel mẫu (.xlsx) và đẩy dữ liệu câu hỏi hàng loạt vào Ngân hàng.
**2. Actors:** Giáo viên, Admin.
**3. Tiền điều kiện:** Không.
**4. Main Success Scenario (Luồng thành công chính):**
   1. Người dùng bấm nút `[Import Excel]` trên màn hình Ngân hàng Câu hỏi.
   2. Hệ thống hiển thị Dialog Import.
   3. Người dùng bấm `[Tải File Mẫu]`. Hệ thống lưu file `template.xlsx` về máy tính.
   4. Người dùng điền dữ liệu (Nội dung, Đáp án A/B/C/D, Đáp án đúng, Độ khó) vào file Excel và lưu lại.
   5. Người dùng kéo-thả (Drag & Drop) file Excel vừa điền vào Dropzone trên Dialog.
   6. Hệ thống hiển thị thanh Progress Bar, bắt đầu đọc file (bằng thư viện `xlsx`).
   7. Hệ thống gọi xuống Rust Core (IPC) để Validate từng dòng.
   8. Hệ thống lưu thành công 100% các dòng vào CSDL.
   9. Giao diện hiển thị dấu Tick xanh và thông báo `"Đã thêm thành công X câu hỏi"`. Nút `[Đóng]` sáng lên.
**5. Alternative Flows (Luồng rẽ nhánh / Ngoại lệ):**
   - *5a. Lỗi sai định dạng file:* Nếu người dùng ném file `.doc` hoặc `.csv`, hệ thống chặn lại ngay ở vùng Dropzone, báo chữ đỏ `"Chỉ chấp nhận file .xlsx"`.
   - *5b. Có dòng dữ liệu không hợp lệ (Thiếu đáp án):*
     1. Ở bước 8, Rust phát hiện dòng số 5 bị trống cột "Đáp án đúng".
     2. Giao diện không hiện Tick xanh mà hiện một Bảng Data Table. 
     3. Những dòng đúng hiện Tick Xanh, dòng 5 bị bôi đỏ kèm text `"Lỗi: Dòng 5 thiếu Đáp án đúng"`.
     4. Giao diện hiện nút `[Xác nhận Nhập X câu đúng (Bỏ qua câu lỗi)]`. Người dùng bấm xác nhận.
**6. Hậu điều kiện:** Dữ liệu mới xuất hiện trong Bảng Ngân hàng Câu hỏi. Không có ảnh nào được import (Chỉ hỗ trợ text).

---

## UC-02: Soạn câu hỏi Trắc nghiệm (Manual MCQ)

**1. Tóm tắt:** Thêm thủ công 1 câu hỏi Trắc nghiệm, hỗ trợ chèn ảnh và công thức Toán.
**2. Actors:** Giáo viên.
**3. Tiền điều kiện:** Không.
**4. Main Success Scenario:**
   1. Nhấn `[+ Thêm Câu Hỏi Mới]`. Mở Form Editor. Mặc định loại câu là "Trắc nghiệm".
   2. Giáo viên gõ chữ vào Rich Text Editor. Bấm nút `∑` trên Toolbar, bàn phím Toán học ảo (MathLive) hiện ra, giáo viên bấm chọn công thức "Phân số", gõ "1/2".
   3. Giáo viên kéo một bức ảnh từ Desktop thả vào Editor. 
   4. Hệ thống (Rust) copy ảnh vào `/images/uuid.png` và chèn hiển thị ảnh lên Editor.
   5. Giáo viên nhập text vào 4 Textbox tương ứng: Đáp án A, B, C, D.
   6. Giáo viên click vào Radio Button cạnh Đáp án C để đánh dấu đây là Câu Đúng.
   7. Chọn Độ khó (Cơ bản). Bấm `[Lưu]`.
   8. Hệ thống lưu thành công (Mảng `options` trong SQLite lưu đủ 4 đáp án và cờ true/false). Đóng form, làm mới bảng.
**5. Alternative Flows:**
   - *5a. Quên chọn Đáp án đúng:*
     - Ở bước 7, khi bấm `[Lưu]`, Frontend Validation chặn lại. Hiện chữ đỏ nhấp nháy bên dưới các Textbox: `"Vui lòng chọn 1 đáp án đúng!"`. IPC không được gọi.
   - *5b. Lỗi tràn đĩa cứng khi chèn ảnh:*
     - Ở bước 4, Rust trả về lỗi IO. Toast thông báo góc màn hình: `"Không thể chèn ảnh: Ổ đĩa C đã đầy"`. Ảnh không xuất hiện trên Editor.
**6. Hậu điều kiện:** Câu hỏi có trong bảng. Ảnh nằm gọn trong folder `/images/`.

---

## UC-03: Soạn câu hỏi Tự luận (Manual Essay)

**1. Tóm tắt:** Thêm thủ công câu hỏi Tự luận, có chỗ cho học sinh viết tay.
**2. Luồng chính:**
   1. Mở Form. Chọn Loại câu: "Tự luận".
   2. Khu vực Đáp án thay đổi giao diện: Biến thành một Textarea bự để nhập "Lời giải Gợi ý (Rubric)".
   3. Bên dưới có thanh Input Number: `[Số dòng kẻ trống (Solution Space): 5 ]`.
   4. Nhập nội dung câu hỏi (Ví dụ: "Em hãy tả con mèo").
   5. Nhấn `[Lưu]`.
**3. Hậu điều kiện:** Lưu thành công. Khi Export đề thi này ra DOCX, hệ thống sẽ tự động in ra 5 dòng kẻ chấm chấm `...........` để học sinh làm bài.

---

## UC-04: Soạn câu hỏi Nối Từ / Nối Số (Matching)

**1. Tóm tắt:** Thiết kế câu hỏi nối cột A và cột B.
**2. Luồng chính:**
   1. Mở Form. Chọn "Nối từ".
   2. Khu vực đáp án hiện ra 2 Cột: Cột Trái và Cột Phải. Có 3 dòng mặc định.
   3. Giáo viên nhập cặp đúng với nhau trên cùng 1 dòng (Vd: Dòng 1 Trái: "Apple", Phải: "Quả táo").
   4. Giáo viên bấm nút `[+ Thêm cặp]` để có dòng số 4. Nhập "Banana" - "Quả chuối".
   5. Nhấn `[Lưu]`.
   6. Hệ thống lưu dưới dạng mảng JSON `[{"left": "Apple", "right": "Quả táo"}, ...]`.
**3. Alternative Flows:**
   - *Quên nhập vế Phải:* Nếu dòng 4 có chữ "Banana" nhưng vế Phải để trống, Form Validation chặn lại, bôi đỏ ô trống `"Vui lòng nhập đủ 2 vế"`.

---

## UC-05: Sinh Đề Tự Động (Automatic Exam Generation)

*(Đây là luồng xương sống, yêu cầu mức độ chi tiết cao nhất)*

**1. Tóm tắt:** Cấu hình ma trận tự động bốc câu hỏi từ Ngân hàng để ghép thành Đề hoàn chỉnh.
**2. Tiền điều kiện:** Ngân hàng phải có dữ liệu.
**3. Main Success Scenario:**
   1. Nhấn `[Tạo Đề Mới]` -> Bảng Cấu hình hiện ra.
   2. **Thông tin chung:** Nhập Tên Đề ("Đề giữa kỳ 1"), Người tạo ("Cô Hạnh").
   3. **Chọn Môn học:** Chọn **"Hỗn hợp"**.
   4. **Cấu hình Tuần:** Kéo Slider đôi từ `Tuần 1` đến `Tuần 10`.
   5. **Cấu hình Tỉ lệ Môn học (Đặc thù Hỗn hợp):** 
      - Xuất hiện thanh Slider môn học: Kéo về mức `[70% Toán - 30% Tiếng Việt]`.
   6. **Cấu hình Độ Khó:** 
      - Chọn "Tùy chỉnh (Custom)". Nhập `80% Cơ Bản`, `20% Nâng Cao`.
   7. **Cấu hình Checkbox Bắt buộc (Hard Constraints):**
      - Tick vào `[x] Đảo ngẫu nhiên vị trí đáp án (A,B,C,D) trong các câu Trắc nghiệm`.
      - Tick vào `[x] Bắt buộc có câu Hình học (Môn Toán)`.
   8. Nhấn nút `[Sinh Đề]`.
   9. Giao diện hiện Loading mờ (Backdrop blur) cùng dòng chữ *"Đang trộn đề..."*.
   10. Rust Core tiếp nhận Config. Thực hiện Query CSDL. Lọc, nhóm, và trộn ngẫu nhiên.
   11. Thành công. Trả về màn hình "Tờ Đề Tương Tác (Interactive Draft)".
**4. Alternative Flows (Lỗi Thuật toán Randomizer):**
   - *4a. Thiếu câu hỏi theo Tỉ lệ (Ví dụ: Thiếu câu Khó):*
     - Rust không gom đủ 20% câu Khó như yêu cầu. 
     - Lập tức ngắt (Abort). Trả về lỗi.
     - Toast UI hiện: `"Thất bại: Trong giới hạn Tuần 1-10, môn Toán chỉ có 2 câu Nâng cao (không đủ 20%). Vui lòng giảm tỉ lệ Nâng cao hoặc nới rộng giới hạn Tuần"`.
   - *4b. Thiếu điều kiện bắt buộc (Hình học):*
     - Không tìm thấy câu nào có nhãn Hình học trong Tuần 1-10.
     - Toast UI hiện: `"Thất bại: Không có câu Hình học nào trong Tuần 1-10. Vui lòng bỏ check tùy chọn bắt buộc"`.
**5. Hậu điều kiện:** Nếu thành công, một bản ghi mới được insert vào bảng `EXAMS` với chuỗi UUID các câu hỏi.

---

## UC-06: Sinh Đề Thủ Công (Manual Exam Generation)

**1. Tóm tắt:** Tự nhặt từng câu trong kho để bỏ vào tờ đề.
**2. Tiền điều kiện:** Không.
**3. Main Success Scenario:**
   1. Nhấn `[Tạo Đề Mới]`, nhập Tên Đề và Người tạo, chọn Tab **Thủ công**.
   2. Giao diện chia đôi màn hình (Split-pane): Trái là Tờ Đề Trống, Phải là Bảng Ngân hàng.
   3. Ở cột Phải, Giáo viên dùng thanh Tìm kiếm, gõ "Tính diện tích". (Hệ thống dùng FTS5 trả kết quả < 50ms).
   4. Giáo viên bấm nút `[+]` cạnh câu số 3 và câu số 5. 
   5. Cột Trái (Tờ đề) ngay lập tức xuất hiện 2 câu này.
   6. Giáo viên dùng chuột kéo câu 5 (Drag) lên trên câu 3 (Drop). Cột trái cập nhật thứ tự.
   7. Bấm `[Lưu Đề]`.
   8. Bảng `EXAMS` cập nhật mảng `question_ids` theo đúng thứ tự Giáo viên vừa kéo thả.
**4. Hậu điều kiện:** Đề thi được lưu và chuyển sang trạng thái chờ Xuất file (Export).
