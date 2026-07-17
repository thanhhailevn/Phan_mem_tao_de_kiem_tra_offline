# 3. Technology Stack & Architecture Decisions (ADR)

Tài liệu này ghi lại các Quyết định Kiến trúc (Architecture Decision Records) nhằm giải trình lý do đằng sau việc lựa chọn từng công nghệ cốt lõi và các đánh đổi (Trade-offs).

---

## 3.1. Quyết định Khung Ứng dụng (Application Framework)

### Quyết định: Chọn Tauri (v2) thay cho Electron
- **Vấn đề:** Ứng dụng Desktop truyền thống (WinForms) quá khó để thiết kế UI hiện đại, trong khi Electron làm file cài đặt bị phình to (>100MB) và tốn RAM, không thân thiện với máy tính cũ của đa số giáo viên.
- **Giải pháp - Tauri:** Giao diện Web được render bởi `WebView2` (có sẵn trên Windows) thay vì nhúng toàn bộ trình duyệt Chromium. 
- **Đánh đổi (Trade-offs):** 
  - *Lợi thế:* Bộ cài siêu nhẹ (<30MB), tốc độ khởi động tức thì, RAM tiêu thụ ở mức tối thiểu. Bảo mật tuyệt đối vì Rust Core không cho phép Webview tự ý chọc vào File System nếu chưa khai báo (Capabilities).
  - *Bất lợi:* Giao diện trên các máy tính dùng Windows 7 (không có WebView2) có thể không hoạt động ổn định. Đòi hỏi Developer phải biết ngôn ngữ hệ thống là Rust.

---

## 3.2. Quyết định Frontend (State & UI)

### Quyết định 1: React 18 + Zustand thay cho Redux
- **Lý do:** Dự án không có nhu cầu Time-travel debugging của Redux. Zustand mang lại Boilerplate code cực thấp, hiệu năng cao và dễ dàng chia nhỏ Store (như `useCurriculumStore`, `useExamStore`). Mọi state phức tạp đều được xử lý gọn nhẹ thông qua custom hooks.

### Quyết định 2: Editor sử dụng TipTap (ProseMirror) thay cho Quill/TinyMCE
- **Lý do:** 
  - Quill quá đóng, khó can thiệp sâu. TinyMCE quá nặng nề.
  - TipTap hoàn toàn Headless (không có giao diện mặc định), cho phép ta thiết kế UI Dark Mode tự do 100% bằng TailwindCSS. Cấu trúc Node-based của ProseMirror giúp việc bắt giữ (intercept) sự kiện Paste Ảnh hoặc Parse công thức Toán học `KaTeX` trở nên vững chãi, không lo bị bể HTML.

---

## 3.3. Quyết định Database (Storage)

### Quyết định: Chọn SQLite với FTS5 thay vì File-based JSON
- **Vấn đề:** Ngân hàng câu hỏi có thể phình to lên 50.000 - 100.000 câu theo năm tháng.
- **Lý do chọn SQLite:** Lưu trữ cục bộ dạng file `app.db` cực kỳ mạnh mẽ, hỗ trợ Indexing chuẩn ACID.
- **FTS5 (Full-Text Search):** Việc tìm kiếm một câu hỏi bằng chuỗi `LIKE '%abc%'` trên 100k bản ghi sẽ gây giật lag UI. FTS5 tạo ra một Bảng Ảo (Virtual Table) đánh chỉ mục từng từ (Tokenized Index), giúp việc gõ Search Query trên thanh tìm kiếm trả về kết quả dưới `50ms`.

---

## 3.4. Cấu trúc Triển khai & Tính Di Động (Portability Architecture)

Dự án phải tuân thủ chuẩn **USB-Portable** (Copy & Run).

### Cấu trúc Thư mục Định danh:
```text
Portable_Quiz_App/
├── QuizApp.exe               # File nhị phân lõi được biên dịch từ Rust
├── database/
│   └── app.db                # Database duy nhất, lưu toàn bộ cấu hình và text
├── images/                   # Thư mục Vàng (Golden Folder) chứa ảnh của Ngân hàng câu hỏi
│   ├── img-9b1deb4d.png
│   └── img-1b9d6bcd.jpg
```

### Nguyên tắc Bất biến (Immutability Rules):
1. **Tuyệt đối không lưu Base64 vào Database:** Một bức ảnh Base64 chiếm hàng Megabyte Text, khiến SQLite File phình to gấp 3 lần, làm chậm toàn bộ ứng dụng khi gọi lệnh SELECT.
2. **Relative Path Only:** Đường dẫn lưu trong cột `content` của bảng `questions` BẮT BUỘC phải là dạng `images/img-uuid.png`. Không bao giờ lưu `C:\Users\Admin\Desktop\...` bởi vì khi mang sang máy khác ổ đĩa C sẽ bị đứt gãy.
3. **Rust I/O Manager:** Bất cứ khi nào FrontEnd gửi yêu cầu chèn ảnh, Rust I/O phải copy file ảnh gốc, đổi tên thành UUID Hash, và ném vào `images/`. Mọi sự ràng buộc về file ảnh do Rust kiểm soát hoàn toàn.
