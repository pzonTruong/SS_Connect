# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG STUDENT SUCCESS CONNECT (SS CONNECT)

## 1. GIỚI THIỆU TỔNG QUAN

**SS Connect** được thiết kế nhằm mang lại trải nghiệm tư vấn 1-1 chuyên nghiệp, liền mạch giữa học viên và các cố vấn/chuyên gia. Hệ thống hỗ trợ từ khâu làm trắc nghiệm đánh giá năng lực, lựa chọn chuyên gia phù hợp, đặt lịch trực tuyến, theo dõi tiến trình tư vấn cho đến việc lưu trữ tài liệu hỗ trợ học tập.

## 2. CÁC VAI TRÒ NGƯỜI DÙNG TRONG HỆ THỐNG

Hệ thống phân quyền rõ ràng theo 3 nhóm đối tượng:
- **Học viên (Student / User)**: Tìm kiếm chuyên gia, đặt lịch tư vấn, làm Personal Quiz, xem lịch sử tư vấn và truy cập tài nguyên học tập.
- **Chuyên gia (Expert)**: Quản lý lịch làm việc, tiếp nhận thông tin học viên đặt lịch, thực hiện tư vấn và cập nhật trạng thái buổi tư vấn.
- **Quản trị viên (Admin)**: Quản lý tổng thể người dùng, danh sách chuyên gia, danh mục tài nguyên, lịch hẹn và theo dõi thống kê báo cáo hệ thống.

---

## 3. HƯỚNG DẪN DÀNH CHO HỌC VIÊN (STUDENT)

### 3.1 Đăng ký & Đăng nhập
1. **Đăng ký tài khoản mới**:
   - Truy cập `/register` (hoặc bấm **Đăng nhập** -> chọn **Đăng ký**).
   - Điền đầy đủ các thông tin: Họ tên, Email, Mật khẩu và Xác nhận mật khẩu.
   - Bấm **Đăng ký** để hoàn tất.
2. **Đăng nhập**:
   - Truy cập `/login`.
   - Nhập Email và Mật khẩu đã đăng ký.
3. **Quên mật khẩu**:
   - Tại trang Đăng nhập, bấm chọn **Quên mật khẩu?** (`/forgot-password`).
   - Nhập email để nhận hướng dẫn khôi phục mật khẩu.

---

### 3.2 Tìm kiếm & Xem thông tin Chuyên gia
- Truy cập mục **Experts** (`/experts`) trên thanh menu chính.
- Sử dụng ô tìm kiếm hoặc bộ lọc theo chuyên môn / lĩnh vực tư vấn.
- Nhấp vào card của một chuyên gia để xem chi tiết **Hồ sơ chuyên gia** (`/experts/:id`), bao gồm:
  - Tiểu sử, kinh nghiệm làm việc, học vấn.
  - Các kỹ năng chuyên môn và đánh giá từ học viên khác.
  - Khung giờ và lịch còn trống để đặt hẹn.

---

### 3.3 Đặt lịch tư vấn (Booking)
1. Tại trang chi tiết Chuyên gia hoặc khi nhấn **Book Now**, bấm **Đặt lịch tư vấn** (`/booking/:expertId`).
2. Chọn ngày, giờ tư vấn phù hợp theo khung thời gian trống của chuyên gia.
3. Điền các ghi chú hoặc chủ đề bạn muốn được tư vấn (giúp chuyên gia chuẩn bị tốt nhất).
4. Xác nhận đặt lịch. Sau khi thành công, hệ thống sẽ chuyển đến trang **Đặt lịch thành công** (`/booking-success`) và gửi thông tin xác nhận.

---

### 3.4 Quản lý lịch hẹn của tôi
- Vào menu **Dashboard / Lịch hẹn của tôi** (`/my-bookings`).
- Xem danh sách các buổi tư vấn:
  - **Sắp tới (Upcoming)**: Hiển thị thời gian, link cuộc họp (Google Meet/Zoom), thông tin chuyên gia.
  - **Đã hoàn thành / Đã hủy**: Cho phép xem lại lịch sử các buổi hẹn cũ.

---

### 3.5 Xem Lịch sử tư vấn
- Bấm vào Avatar tài khoản ở góc trên bên phải -> chọn **Lịch sử tư vấn** (`/consultation-history`).
- Tại đây, học viên có thể xem lại tổng hợp các buổi tư vấn đã tham gia, thông tin ghi chú từ chuyên gia và các đánh giá đã gửi.

---

### 3.6 Làm bài Trắc nghiệm cá nhân (Personal Quiz)
- Truy cập mục **Personal Quiz** (`/quiz`) trên thanh menu.
- Đây là bài trắc nghiệm giúp đánh giá năng lực, nhu cầu và định hướng học tập cá nhân.
- Học viên có thể làm bài trực tiếp qua biểu mẫu Google Form được tích hợp trên trang hoặc chọn **Mở Google Form tab mới**.
- Kết quả sẽ được ghi nhận tự động để các cố vấn thiết kế lộ trình học tập phù hợp nhất cho bạn.
---

### 3.8 Quản lý Hồ sơ & Cài đặt cá nhân
- **Hồ sơ cá nhân (`/profile`)**: Cập nhật ảnh đại diện, họ tên, số điện thoại, thông tin giới thiệu bản thân.
- **Cài đặt hệ thống (`/settings`)**: Tùy chỉnh thông báo, bảo mật tài khoản và tùy chọn giao diện.

---

## 4. HƯỚNG DẪN DÀNH CHO CHUYÊN GIA (EXPERT)

1. **Đăng nhập tài khoản Chuyên gia**: Sau khi đăng nhập, góc trên bên phải sẽ xuất hiện nút **Expert Dashboard** (`/expert-dashboard`).
2. **Quản lý danh sách Lịch tư vấn**:
   - Xem tổng quan số lượng buổi tư vấn sắp diễn ra, danh sách học viên đăng ký.
   - Cập nhật trạng thái buổi tư vấn (Xác nhận, Đã hoàn thành, Hủy).
   - Cung cấp đường dẫn phòng họp trực tuyến (Google Meet/Zoom) cho học viên.
3. **Cập nhật thông tin Chuyên gia**:
   - Chỉnh sửa thông tin chuyên môn, kinh nghiệm, khung giờ nhận tư vấn tại phần quản lý hồ sơ.

---

## 5. HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

1. **Truy cập Admin Dashboard** (`/admin-dashboard`):
   - Xuất hiện nút nhanh **Admin Dashboard** trên thanh điều hướng khi đăng nhập bằng tài khoản Quản trị.
2. **Quản lý Hệ thống**:
   - **Quản lý Người dùng & Phân quyền**: Xem, chỉnh sửa vai trò (User, Expert, Admin), kích hoạt/khóa tài khoản.
   - **Quản lý Chuyên gia**: Phê duyệt danh sách chuyên gia mới, cập nhật danh mục chuyên môn.
   - **Quản lý Lịch hẹn & Thống kê**: Theo dõi toàn bộ lịch hẹn tư vấn trên hệ thống, xem báo cáo tổng quan.
