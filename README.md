# Phần Mềm Tạo Đề Kiểm Tra Offline (AntiGravity Edu)

Hệ thống quản lý ngân hàng câu hỏi và tự động tạo đề thi offline chuyên nghiệp, được xây dựng trên nền tảng **Tauri + React + TypeScript + Rust (SQLite/rusqlite)**. 

Ứng dụng được thiết kế phẳng, gọn nhẹ, bảo mật dữ liệu tuyệt đối (lưu trữ offline) và sở hữu giao diện tối giản, hiện đại mang lại trải nghiệm người dùng tối ưu.

---

## ✨ Các Tính Năng Nổi Bật

### 1. Quản Lý Ngân Hàng Câu Hỏi Phân Cấp Chuyên Nghiệp
- **Cây phân loại tự động (Auto Classification Tree):** Tự động phân tích dữ liệu thực tế để dựng cây phân cấp 2 tầng `Môn Học > Lớp Học` đi kèm số lượng câu hỏi tương ứng trong thời gian thực.
- **Bảng Master tính lớn (Excel Spreadsheet Grid):** Hiển thị danh sách câu hỏi dạng bảng Master chuyên nghiệp, có cấu trúc cột tự động thay đổi động theo từng Tab loại câu hỏi (`Tất cả`, `Trắc nghiệm`, `Tự luận`, `Đọc hiểu`, `Nối từ`).
- **Lọc & Tìm kiếm mạnh mẽ:** Bộ lọc lồng ghép kết hợp cây thư mục, dải tab phân loại câu hỏi, pill độ khó (`Dễ`, `Trung bình`, `Khó`) và tìm kiếm từ khóa thời gian thực.
- **Bảo vệ dữ liệu:** Tích hợp hộp thoại xác nhận khi xóa câu hỏi đơn lẻ để chống thao tác sai lệch.

### 2. Phân Hệ Nhập Dữ Liệu Excel Hàng Loạt (Bulk Import)
- **Tải file mẫu tĩnh (4 mẫu chuyên biệt):** Tải trực tiếp file Excel mẫu tương ứng với từng loại câu hỏi:
  - *Mẫu Trắc nghiệm:* 8 cột chuẩn.
  - *Mẫu Tự luận:* Tối giản cho đề bài và đáp án gợi ý.
  - *Mẫu Đọc hiểu:* Cấu trúc gộp đoạn văn thông minh (Passage Merging).
  - *Mẫu Nối từ:* Kết nối cặp vế trái/phải bằng ký tự `|` và định dạng `0-1`.
- **Bộ kiểm duyệt dữ liệu Excel chặt chẽ:**
  - Tự động bỏ qua dòng trống không điền `STT` (chống lỗi rác Excel cuối trang).
  - Xác thực bắt buộc thông tin Môn học, Lớp, Độ khó, Câu hỏi, Phương án và Đáp án đúng.
  - Ràng buộc chéo trắc nghiệm (Nếu đáp án đúng là C/D thì tương ứng cột Đáp án C/D không được trống).
  - Kiểm tra giới hạn chỉ số kết nối vế trái/phải đối với câu hỏi Nối từ.
  - Giao diện Xem Trước (Preview Grid) hiển thị chi tiết các dòng lỗi kèm nhãn cảnh báo đỏ và tooltip giải thích lý do cụ thể.

### 3. Đồng Bộ Hóa & Khớp Font Hệ Thống
- Thiết kế giao diện phẳng, tối giản hóa đường viền, chống lỗi text sát lề bằng hệ thống padding/margin tiêu chuẩn.
- Loại bỏ toàn bộ các font rời rạc để đồng bộ hóa 100% font chữ hệ thống (`system-ui` stack).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React + TypeScript + Vite + Zustand (State Management)
- **Styling:** Vanilla CSS + Lucide Icons + React Dropzone
- **Office Integration:** SheetJS (`xlsx`) đọc & xuất Excel trực tiếp ở Client-side.
- **Backend/Desktop wrapper:** Tauri v2 + Rust (SQLite với rusqlite cho database offline).

---

## 🚀 Hướng Dẫn Cài Đặt & Phát Triển

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (Phiên bản v18 trở lên)
- [Rust & Cargo compiler](https://www.rust-lang.org/tools/install)
- Build Tools cho Windows (C++ Build Tools)

### Các Bước Cài Đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/thanhhailevn/Phan_mem_tao_de_kiem_tra_offline.git
   cd Phan_mem_tao_de_kiem_tra_offline
   ```

2. **Cài đặt các thư viện Node.js:**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng trong chế độ Development:**
   ```bash
   npm run tauri dev
   ```

4. **Đóng gói phiên bản Production (.exe / .msi):**
   ```bash
   npm run tauri build
   ```
   Bản cài đặt sau khi build thành công sẽ nằm trong thư mục `src-tauri/target/release/bundle/`.

---

## 📝 Giấy Phép
Dự án được bảo mật dữ liệu offline và phát triển độc quyền bởi AntiGravity Edu.
