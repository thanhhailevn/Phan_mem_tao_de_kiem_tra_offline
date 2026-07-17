# QUY ĐỊNH DỰ ÁN (PROJECT RULES)

Tài liệu này quy định các tiêu chuẩn và nguyên tắc làm việc bắt buộc đối với toàn bộ nhân sự (bao gồm cả AI Agents) khi tham gia vào dự án **Phần mềm Tạo đề kiểm tra**.

## 1. Yêu cầu Bắt buộc Về Kỹ Năng (.skills)

Dự án này sử dụng hệ thống Multi-Agent Orchestration thông qua thư mục `.skills`. **TẤT CẢ** các công việc từ phân tích, thiết kế, đến lập trình đều phải tuân thủ nghiêm ngặt quy trình sau:

> [!CAUTION]
> Tuyệt đối không được phép tiến hành viết code, sửa script, hay thay đổi cấu trúc thư mục nếu chưa hoàn thành bước kiểm tra và áp dụng Skill.

### Quy trình áp dụng Skill:
1. **Auto-Discovery (Varredura):** Ngay khi nhận được một yêu cầu mới từ người dùng (ví dụ: "Thiết kế CSDL", "Tối ưu hóa UI", "Viết API"), Agent **BẮT BUỘC** phải tự động tìm kiếm trong thư mục `.skills` (hoặc dùng `scan_registry.py` theo hệ thống `agent-orchestrator`) để tìm các kỹ năng liên quan nhất.
2. **Nghiên cứu Skill (Review):** Nếu tìm thấy kỹ năng phù hợp (ví dụ: `database-architect`, `docs-architect`, `backend-dev-guidelines`), Agent phải đọc nội dung file `SKILL.md` của kỹ năng đó để nắm bắt quy tắc chuyên môn (Ví dụ: đặt tên biến, chuẩn hóa API, nguyên tắc Clean Architecture).
3. **Thực thi (Execute):** Chỉ sau khi đã xác nhận và nạp đầy đủ tri thức từ `.skills`, Agent mới được phép thiết kế và tiến hành viết/sửa source code.

## 2. Tiêu chuẩn Mã nguồn (Codebase Standards)
- **Frontend (Tauri + React):** 
  - Tuân thủ nghiêm ngặt các quy tắc trong `frontend-dev-guidelines`.
  - Không sử dụng các UI Library quá nặng nếu không cần thiết. Ưu tiên TailwindCSS + Radix UI / Shadcn.
  - Giao diện mặc định phải có Dark Mode.
- **Backend (Rust):**
  - Tuân thủ `backend-dev-guidelines` và `systems-programming-rust-project`.
  - Mọi thao tác IPC (Inter-Process Communication) giữa Rust và React phải định nghĩa Type/Struct an toàn ở cả hai bên.
- **Database (SQLite):**
  - Không lưu trữ tệp tin nhị phân (Ảnh, Media) trực tiếp trong CSDL (Blob).
  - Tệp tĩnh phải được lưu tại thư mục `assets` song song với file thực thi hoặc trong không gian AppData.

## 3. Quản lý Tài liệu (Documentation)
- Mọi quyết định thay đổi về cấu trúc hệ thống, CSDL hoặc tính năng lớn đều phải được cập nhật ngay lập tức vào thư mục `/docs/`.
- Phải áp dụng kỹ năng `docs-architect` để đảm bảo tài liệu được viết ở mức độ chi tiết (ngang tầm chuyên gia), có minh họa cấu trúc rõ ràng.

## 4. Xử lý Lỗi (Error Handling & Debugging)
- Khi gặp lỗi biên dịch hoặc runtime, Agent phải áp dụng kỹ năng `debugger` và `debugging-and-error-recovery`.
- Không được phép đoán mò lỗi. Bắt buộc phải thu thập đầy đủ Error Trace, phân tích nguyên nhân gốc rễ (Root Cause) trước khi đề xuất giải pháp.
