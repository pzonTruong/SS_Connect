# SS_Connect - Tài liệu Tổng quan Tính năng Hệ thống

## 1. Giới thiệu Dự án
SS_Connect là nền tảng kết nối trực tuyến giữa Học sinh (Student) và Chuyên gia / Cố vấn (Expert). Hệ thống cung cấp giải pháp toàn diện cho việc tìm kiếm chuyên gia, gợi ý chuyên gia thông minh bằng AI, đặt lịch tư vấn, theo dõi lịch sử làm việc và đánh giá chất lượng tư vấn.

---

## 2. Danh sách Tính năng Chính

### 2.1. Xác thực và Bảo mật Hệ thống (Authentication & Authorization)
- **Đăng ký tài khoản**: Hỗ trợ xác minh sở hữu email bằng mã OTP (One-Time Password).
- **Đăng nhập hai lớp**: Cơ chế đăng nhập an toàn kết hợp OTP và phương thức xác thực JWT (JSON Web Token).
- **Quản lý mật khẩu**: Chức năng quên mật khẩu và đặt lại mật khẩu an toàn thông qua Email Reset Token.
- **Phân quyền người dùng**: Phân quyền chi tiết dựa trên vai trò hệ thống (Student, Expert, Admin).

### 2.2. Tìm kiếm và Gợi ý Chuyên gia (Expert Directory & AI Recommendation)
- **Danh mục Chuyên gia**: Cho phép tra cứu, tìm kiếm và lọc danh sách chuyên gia theo lĩnh vực, kỹ năng và kinh nghiệm.
- **Hồ sơ Chuyên gia Chi tiết**: Hiển thị thông tin cá nhân, bằng cấp, chuyên môn và các khung giờ khả dụng.
- **Gợi ý bằng Trí tuệ Nhân tạo (AI Recommendation)**: Phân tích nhu cầu tư vấn của học sinh để đưa ra danh sách đề xuất chuyên gia phù hợp nhất.

### 2.3. Quản lý Đặt lịch Tư vấn (Booking System)
- **Đặt lịch hẹn**: Học sinh chủ động lựa chọn chuyên gia, ngày làm việc, khung giờ và nội dung tư vấn.
- **Quy trình Trạng thái Lịch hẹn**:
  - `Pending`: Chờ chuyên gia tiếp nhận.
  - `Confirmed`: Chuyên gia đã phê duyệt lịch hẹn.
  - `Completed`: Buổi tư vấn đã hoàn thành.
  - `Cancelled`: Lịch hẹn bị hủy bởi một trong hai bên.
- **Quản lý Lịch hẹn Cá nhân**: Trang danh sách lịch hẹn dành cho học sinh theo dõi và quản lý trạng thái các cuộc hẹn.

### 2.4. Lịch sử Tư vấn và Đánh giá (Consultation History & Reviews)
- **Nhật ký Tư vấn**: Lưu trữ chi tiết thông tin và lịch sử các buổi làm việc đã kết thúc.
- **Hệ thống Đánh giá**: Cho phép học sinh viết phản hồi, nhận xét và chấm điểm chất lượng tư vấn của chuyên gia sau mỗi phiên làm việc.

### 2.5. Bảng điều khiển Chuyên biệt (Dashboards)
- **Bảng điều khiển Chuyên gia (Expert Dashboard)**:
  - Tiếp nhận hoặc từ chối yêu cầu đặt lịch từ học sinh.
  - Quản lý lịch làm việc khả dụng và thông tin hồ sơ chuyên môn.
- **Bảng điều khiển Quản trị viên (Admin Dashboard)**:
  - Quản lý và theo dõi toàn bộ tài khoản trong hệ thống.
  - Phê duyệt hồ sơ chuyên gia mới.
  - Kiểm soát hoạt động và tuân thủ nền tảng.

### 2.6. Hồ sơ Cá nhân và Trang Phụ trợ (Profile & System Pages)
- **Quản lý Hồ sơ & Cài đặt**: Cập nhật thông tin cá nhân, ảnh đại diện và tùy chọn bảo mật tài khoản.
- **Các trang Thông tin & Chính sách**:
  - Trang chủ (Home Page)
  - Trang Tài nguyên (Resources)
  - Trang Liên hệ (Contact)
  - Chính sách Bảo mật (Privacy Policy)
  - Điều khoản Dịch vụ (Terms of Service)
  - Câu hỏi Thường gặp (FAQ)

---

## 3. Kiến trúc Công nghệ

| Phân hệ | Công nghệ Sử dụng |
| :--- | :--- |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT, Nodemailer |
| **Frontend** | React, TypeScript, Vite, React Router, CSS |
| **AI Integration** | AI Recommendation API Service |
