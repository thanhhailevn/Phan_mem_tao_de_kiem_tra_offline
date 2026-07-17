# 1. Project Discovery & Vision (Đặc tả Dự án và Tầm nhìn)

## 1.1. Executive Summary (Tóm tắt Chấp hành)

Dự án **Portable Quiz Generator** (Phần mềm Tạo đề kiểm tra) ra đời nhằm giải quyết một "nút thắt cổ chai" mang tính hệ thống đối với giáo viên Tiểu học tại Việt Nam: Việc soạn thảo, lưu trữ và tái sử dụng hệ thống câu hỏi, đặc biệt là hệ thống công thức Toán học và các đoạn Ngữ liệu Đọc hiểu Tiếng Việt. 

Phần lớn các giải pháp hiện tại trên thị trường đi theo hướng SaaS (Software as a Service - Cloud based) có thu phí, hoặc là các phần mềm Offline thế hệ cũ (WinForms) cồng kềnh, giao diện lỗi thời và không hỗ trợ chèn ảnh/công thức linh hoạt.

Dự án này mang đến một **kiến trúc Offline-First** hoàn toàn mới, dựa trên lõi **Tauri (Rust)** và **React**, giúp mang lại trải nghiệm Web hiện đại ngay trên một ứng dụng Desktop cực kỳ gọn nhẹ (< 30MB). Tầm nhìn dài hạn của dự án là trở thành "Chiếc cặp số kỹ thuật số" của mỗi giáo viên: Chỉ cần copy thư mục phần mềm vào USB, cắm vào bất cứ máy tính nào cũng có thể ngay lập tức tạo ra một đề kiểm tra hoàn chỉnh với đầy đủ đáp án và lời giải, định dạng PDF/DOCX chuyên nghiệp, không cần phụ thuộc vào kết nối Internet hay hệ thống máy chủ bên thứ ba.

---

## 1.2. User Personas (Chân dung Người dùng)

Hệ thống được thiết kế dựa trên sự thấu cảm sâu sắc với 3 nhóm người dùng chính:

### Persona A: Cô Hạnh - Giáo viên Chủ nhiệm Lớp 3 (Nhóm cốt lõi)
- **Đặc điểm:** Bận rộn, áp lực với sổ sách. Không quá rành về công nghệ sâu, sợ cài đặt phần mềm phức tạp hoặc dính virus.
- **Nhu cầu (Pain points):** Cần một kho lưu trữ câu hỏi Toán và Tiếng Việt có sẵn khung theo chương trình sách giáo khoa GDPT 2018 (Ví dụ: Tuần 5 - Học bảng nhân 3). Cuối tuần, cô cần tạo nhanh 1 đề kiểm tra 15 phút gồm 10 câu trắc nghiệm và 2 câu tự luận để in ra giấy cho học sinh mang về nhà làm. 
- **Kỳ vọng:** Nhấn nút là ra đề. Nếu thấy 1 câu không ưng ý, có thể bấm nút "Đổi câu khác" ngay trên tờ đề nháp. Xuất ra file DOCX để cô có thể copy logo trường học vào.

### Persona B: Anh Minh - Gia sư Tự do / Trung tâm bồi dưỡng (Nhóm nâng cao)
- **Đặc điểm:** Dạy nhiều nhóm học sinh ở nhiều trình độ khác nhau. Giỏi công nghệ.
- **Nhu cầu:** Cần tạo các bộ đề có cấu trúc cực kỳ đặc thù (Ví dụ: Đề thi chuyên Toán 100% tự luận, hoặc đề Tiếng Việt có đoạn văn đọc hiểu rất dài kèm 5 câu hỏi nối từ).
- **Kỳ vọng:** Phần mềm có trình soạn thảo Rich Text đỉnh cao, hỗ trợ phím tắt, paste ảnh trực tiếp không bị vỡ định dạng. Có khả năng sao lưu (Backup) thư mục ảnh dễ dàng.

### Persona C: Chị Lan - Phụ huynh có con học Lớp 3 (Nhóm sử dụng thụ động)
- **Đặc điểm:** Đi làm công sở, muốn kèm con học buổi tối.
- **Nhu cầu:** Tải các bộ đề mà giáo viên chia sẻ (dạng HTML tĩnh) để mở lên iPad hoặc Laptop cho con làm trực tiếp.
- **Kỳ vọng:** File HTML xuất ra phải đẹp mắt, khi con click nộp bài phải tự chấm điểm, hiện màu Xanh (Đúng), Đỏ (Sai) và hiển thị Lời giải chi tiết (Explanation) bên dưới.

---

## 1.3. Scope Boundaries (Phạm vi Dự án)

Việc xác định ranh giới (Boundaries) là yếu tố sống còn để ngăn chặn hội chứng "Feature Creep" (Phình to tính năng mất kiểm soát).

### 1.3.1. In-Scope (Nằm trong phạm vi phát triển)
Hệ thống **SẼ LÀM** những việc sau:
1. **Khởi tạo Sàn kiến thức tự động:** Cung cấp giao diện để nhập API URL (hoặc Github Raw Link) để phần mềm tải cấu trúc chuẩn của chương trình học và đổ vào Database nội bộ.
2. **Quản lý Media Local an toàn:** Cắt và lưu trữ ảnh do người dùng chèn vào một thư mục riêng biệt (`assets/images`) nằm cùng cấp với file thực thi, đảm bảo tính Portable tuyệt đối.
3. **Randomizer Engine (Thuật toán sinh đề):** Bốc ngẫu nhiên câu hỏi dựa trên Tỉ lệ dạng câu (Trắc nghiệm/Tự luận/Nối từ), Tuần học và Độ khó. Đảm bảo tính nguyên vẹn của "Câu hỏi chùm" (Đọc hiểu).
4. **Interactive Draft (Bản nháp tương tác):** Giao diện thao tác trực tiếp trên Đề thi (Inline Edit, Kéo thả đổi vị trí, Đảo câu).
5. **Xuất bản:** Render ra HTML (Offline Interactivity), PDF (In ấn khổ A4) và DOCX (OpenXML chỉnh sửa).

### 1.3.2. Out-of-Scope (Nằm ngoài phạm vi)
Hệ thống **KIÊN QUYẾT KHÔNG LÀM** những việc sau (Giải trình kiến trúc):
1. **Cloud Sync Database (Đồng bộ Đám mây đa thiết bị):** 
   - *Lý do:* Phát sinh chi phí duy trì Server/Database (AWS/GCP), vi phạm triết lý Offline-first. Giải pháp thay thế là người dùng tự chép folder `app.db` vào Google Drive của cá nhân.
2. **Hệ thống Quản lý Học sinh / Sổ điểm (LMS/CMS):**
   - *Lý do:* Làm phức tạp hóa Database (phải có bảng User, Role, Score, Class). Đây là phần mềm "Tạo đề", không phải nền tảng thi trực tuyến e-Learning.
3. **Quét nhận dạng ký tự (OCR) từ file PDF ảnh:**
   - *Lý do:* Nằm ngoài khả năng xử lý của môi trường local nhẹ nhàng, đòi hỏi thư viện AI nặng (như Tesseract) làm mất tính Portable (< 30MB). Người dùng phải tự gõ hoặc copy/paste nội dung văn bản.

---

## 1.4. Success Metrics (Thước đo Thành công)

Các chỉ số phi chức năng (Non-Functional Requirements - NFR) được giám sát chặt chẽ:

| Chỉ số (Metric) | Tiêu chuẩn Chấp nhận (SLA) | Lý do Kiến trúc |
| :--- | :--- | :--- |
| **Dung lượng Bộ cài** | `< 50 MB` | Đảm bảo tính nhẹ nhàng, tải nhanh trên mạng yếu. (Sử dụng Tauri thay vì Electron). |
| **Tốc độ Randomizer** | `< 1 giây` (cho kho 10,000 câu hỏi) | Tối ưu hóa truy vấn SQLite, đánh Index chính xác. Đảm bảo UI không bị treo (ANR). |
| **Tốc độ Tìm kiếm (FTS)** | `< 50 mili-giây` | Sử dụng SQLite FTS5 (Full-Text Search) để tìm kiếm nội dung câu hỏi Real-time khi gõ ký tự. |
| **Độ độc lập Media** | `100% Relative Paths` | Copy toàn bộ thư mục App sang máy tính khác, toàn bộ hình ảnh trong đề vẫn hiển thị bình thường. Không dính Absolute Path (`C:\Users\...`). |
| **UX Responsiveness** | Mọi tương tác tải/lưu > 200ms phải có Loading State / Spinner. | Tránh việc người dùng nhấn nút nhiều lần (Double Submit) gây crash Database transaction. |
