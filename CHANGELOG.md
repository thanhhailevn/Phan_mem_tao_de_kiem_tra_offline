# Nhật Ký Thay Đổi (Changelog) - AntiGravity Edu

Toàn bộ lịch sử các phiên bản phát hành và cập nhật sửa đổi giao diện, tính năng của Phần mềm tạo đề kiểm tra offline.

---

## [1.1.0] - 2026-07-18

### ✨ Tính Năng Mới
- **Bảng Master Table lớn duy nhất (Excel Grid View):**
  - Hợp nhất toàn bộ câu hỏi vào một bảng duy nhất thay vì các thẻ card rời rạc.
  - Mỗi câu hỏi tương ứng 1 hàng duy nhất; hiển thị cột dynamic thay đổi tự động theo Tab loại câu hỏi (`Trắc nghiệm`, `Tự luận`, `Đọc hiểu`, `Nối từ`).
  - Tô màu xanh lá nổi bật cho phương án đúng của MCQ.
  - Hover dòng làm nổi bật giúp duyệt ngân hàng lớn không bị lệch dòng.
- **TreeView Ngân Hàng Tự Dựng (Always Expanded):**
  - Tự động quét và gom nhóm câu hỏi thực tế theo môn học và lớp để dựng cây điều hướng.
  - Cây phân loại luôn hiển thị sẵn phân cấp Môn học -> Lớp học, click trực tiếp để lọc.
- **Bổ sung cột Độ khó (Difficulty) đồng bộ:**
  - Thêm cột `DoKho` vào các file Excel mẫu tải về.
  - Bổ sung cột Độ khó vào bảng xem trước khi import và dải bảng kết quả.
  - Form nhập thủ công đồng bộ hóa bộ chọn Độ khó.
- **Lưu trữ Session Offline:** Lập trình lưu tự động danh sách câu hỏi vào `localStorage` giúp bảo toàn 100% dữ liệu khi reload trang/tắt app.

### 🛡️ An Toàn & Bảo Mật Dữ Liệu
- **Hộp thoại xác nhận xóa:** Thêm thông báo `window.confirm` khi click xóa từng câu hỏi riêng lẻ.
- **Gỡ nút Dọn kho:** Gỡ bỏ nút "Xóa tất cả câu hỏi" nguy hiểm khỏi thanh công cụ.

### 💄 Sửa Lỗi Giao Diện & Visual
- **Khắc phục lỗi dính chữ:** Thêm spacing/gap giữa các Badge (`Trắc nghiệm`, `Dễ`, `Toán`, `Lớp 3`).
- **Đồng bộ Font chữ hệ thống:** Chuyển đổi toàn bộ font chữ về `system-ui` stack giúp nét chữ đều đặn, chuyên nghiệp.
- **Sửa lỗi sát lề:** Gia cố thêm padding/margin cho các thẻ Card, TreeView và Spacing Form.

---

## [1.0.0] - 2026-07-15
- Phiên bản phát hành đầu tiên (First release).
- Tích hợp khung Tauri + React + TypeScript + SQLite.
- Khởi tạo giao diện Sàn kiến thức và cấu trúc chương trình.
