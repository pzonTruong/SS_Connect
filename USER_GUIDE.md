# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG STUDENT SUCCESS CONNECT (SS CONNECT)

---

## 1. GIỚI THIỆU TỔNG QUAN

**Student Success Connect (SS Connect)** là nền tảng kết nối trực tuyến 1-1 chuyên nghiệp giữa **Học viên (Student)** và **Chuyên gia / Cố vấn (Expert)**. Nền tảng được xây dựng nhằm hỗ trợ học viên giải quyết các thách thức trong học tập, phát triển kỹ năng mềm, định hướng nghề nghiệp và tham vấn tâm lý học đường.

### 1.1. Các Tính Năng Nổi Bật
- **Gợi ý Chuyên gia bằng AI (AI Recommendation)**: Đề xuất chuyên gia phù hợp dựa trên nhu cầu, mục tiêu học tập và hồ sơ cá nhân của học viên.
- **Trắc nghiệm Đánh giá Năng lực (Personal Quiz)**: Giúp học viên tự đánh giá điểm mạnh, điểm yếu và nhu cầu tư vấn.
- **Đặt lịch Tư vấn Trực tuyến 24/7 (Booking System)**: Tìm kiếm, chọn khung giờ rảnh và đặt lịch hẹn chỉ trong vài thao tác.
- **Quản lý Buổi tư vấn Trực quan**: Tích hợp đường dẫn phòng họp (Google Meet / Zoom), quản lý trạng thái lịch hẹn linh hoạt.
- **Kho Tài nguyên Học tập (Resources)**: Cung cấp cẩm nang, tài liệu và kiến thức chuyên sâu phục vụ quá trình học tập.
- **Đánh giá & Phản hồi (Reviews & Rating)**: Minh bạch chất lượng tư vấn qua hệ thống nhận xét và chấm điểm sao.

---

## 2. PHÂN QUYỀN & VAI TRÒ NGƯỜI DÙNG

Hệ thống được thiết kế phân quyền chặt chẽ theo 3 nhóm đối tượng:

| Vai Trò | Mã Quyền | Quyền Hạn & Chức Năng Chính |
| :--- | :--- | :--- |
| **Học viên (Student)** | `Student` / `User` | Tìm kiếm chuyên gia, làm bài quiz, đặt lịch tư vấn, tham gia buổi họp, xem lịch sử & gửi đánh giá, quản lý hồ sơ cá nhân. |
| **Chuyên gia (Expert)** | `Expert` | Tiếp nhận/Từ chối yêu cầu đặt lịch, cập nhật khung giờ làm việc rảnh, cập nhật link phòng họp, xem lịch tư vấn cá nhân, quản lý hồ sơ chuyên môn. |
| **Quản trị viên (Admin)**| `Admin` | Quản lý toàn bộ tài khoản người dùng, phê duyệt hồ sơ chuyên gia mới, kiểm soát lịch hẹn toàn hệ thống, quản lý tài nguyên và xem thống kê báo cáo. |

---

## 3. HƯỚNG DẪN DÀNH CHO HỌC VIÊN (STUDENT)

### 3.1. Đăng Ký, Đăng Nhập & Xác Thực Tài Khoản

#### 1. Đăng ký tài khoản mới (`/register`)
1. Truy cập trang chủ SS Connect, nhấn nút **Đăng ký** trên thanh menu (Navigation Bar).
2. Nhập các thông tin bắt buộc:
   - **Họ và tên**: Tên hiển thị trên hệ thống.
   - **Địa chỉ Email**: Email cá nhân chính thức (dùng để nhận OTP và thông báo).
   - **Mật khẩu & Xác nhận mật khẩu**: Tối thiểu 6 ký tự.
3. Nhấn nút **Đăng ký (Register)**. 
4. **Xác minh Email qua OTP**: Hệ thống sẽ gửi một mã OTP (One-Time Password) gồm 6 chữ số tới email của bạn. Nhập mã OTP vào ô xác minh để kích hoạt tài khoản.

#### 2. Đăng nhập (`/login`)
1. Truy cập trang **Đăng nhập**.
2. Nhập **Email** và **Mật khẩu** đã đăng ký.
3. Nhấn **Đăng nhập**. Khi thành công, hệ thống lưu phiên đăng nhập (JWT Token) và chuyển hướng bạn về Trang chủ hoặc Dashboard.

#### 3. Quên mật khẩu & Đặt lại mật khẩu (`/forgot-password`)
1. Tại màn hình đăng nhập, chọn liên kết **Quên mật khẩu?**.
2. Nhập **Email** đã đăng ký tài khoản.
3. Kiểm tra hòm thư điện tử để lấy liên kết / mã xác minh khôi phục mật khẩu (Reset Token).
4. Nhập mật khẩu mới và xác nhận lại để hoàn tất khôi phục.

---

### 3.2. Tìm Kiếm & Tra Cứu Chuyên Gia (`/experts`)

1. Chọn mục **Experts (Chuyên gia)** trên thanh menu chính.
2. **Bộ lọc & Tìm kiếm**:
   - **Ô tìm kiếm**: Gõ tên chuyên gia, từ khóa chuyên môn hoặc lĩnh vực bạn cần tư vấn.
   - **Lọc theo Chuyên môn (Category/Skill)**: Chọn các mảng như *Lập trình, Tiếng Anh, Kỹ năng mềm, Định hướng nghề nghiệp, Tâm lý học đường...*
3. **Tính năng Gợi ý AI (AI Expert Recommendation)**:
   - Nhấn vào nút **Gợi ý bằng AI** trên giao diện danh sách chuyên gia.
   - Hệ thống sẽ tự động phân tích dữ liệu hồ sơ và nhu cầu của bạn để đưa ra danh sách các Chuyên gia có độ tương thích cao nhất.
4. **Xem Chi tiết Hồ sơ Chuyên gia (`/experts/:id`)**:
   - Nhấp vào card của chuyên gia mong muốn để xem:
     - **Tiểu sử & Kinh nghiệm**: Quá trình làm việc, bằng cấp, chứng chỉ.
     - **Kỹ năng cốt lõi**: Danh mục kỹ năng nổi bật.
     - **Lịch rảnh (Available Slots)**: Các khung giờ chuyên gia tiếp nhận tư vấn.
     - **Đánh giá từ Học viên khác**: Điểm đánh giá trung bình (sao) và danh sách phản hồi thực tế.

---

### 3.3. Quy Trình Đặt Lịch Tư Vấn (Booking Process - `/booking/:expertId`)

#### Bước 1: Chọn Chuyên gia & Bấm Đặt lịch
- Tại trang thông tin chi tiết chuyên gia, nhấn nút **Book Now (Đặt lịch tư vấn)**.

#### Bước 2: Chọn Thời Gian Tư Vấn
- **Chọn Ngày (Date)**: Lựa chọn ngày làm việc khả dụng trên lịch.
- **Chọn Khung Giờ (Time Slot)**: Lựa chọn ca tư vấn còn trống (ví dụ: `09:00 - 10:00`, `14:00 - 15:00`).

#### Bước 3: Điền Thông Tin Chủ Đề Tư Vấn
- **Chủ đề chính**: Nêu ngắn gọn vấn đề bạn gặp phải (Ví dụ: *Hỏi về lộ trình học ReactJS*, *Tư vấn viết CV xin việc*).
- **Ghi chú chi tiết (Notes)**: Mô tả chi tiết mong muốn, câu hỏi chuẩn bị trước hoặc đính kèm link tài liệu cần chuyên gia xem trước.

#### Bước 4: Xác Nhận & Hoàn Tất
- Nhấn **Xác nhận đặt lịch**.
- Hệ thống xử lý và chuyển hướng đến trang **Đặt lịch thành công (`/booking-success`)**.
- Email xác nhận tự động kèm mã lịch hẹn sẽ được gửi đến email của bạn.

---

### 3.4. Quản Lý Lịch Hẹn Của Tôi (`/my-bookings`)

Vào menu **Lịch hẹn của tôi** từ thanh điều hướng để theo dõi tiến trình:

- **Danh sách trạng thái**:
  - `Pending (Chờ xác nhận)`: Yêu cầu vừa gửi, chờ chuyên gia tiếp nhận.
  - `Confirmed (Đã xác nhận)`: Chuyên gia đã đồng ý tư vấn. Đường dẫn phòng họp (Google Meet / Zoom) sẽ hiển thị tại đây.
  - `Completed (Đã hoàn thành)`: Buổi tư vấn đã kết thúc thành công.
  - `Cancelled (Đã hủy)`: Lịch hẹn bị hủy bởi học viên hoặc chuyên gia.
- **Thao tác nhanh**:
  - **Tham gia cuộc họp**: Nhấn nút **Vào phòng họp** khi đến giờ hẹn (dành cho buổi hẹn trạng thái `Confirmed`).
  - **Hủy lịch hẹn**: Chọn **Hủy đặt lịch** nếu bạn có công việc đột xuất (nên thực hiện trước giờ hẹn ít nhất 2 tiếng).

---

### 3.5. Lịch Sử Tư Vấn & Viết Đánh Giá (`/consultation-history`)

1. Truy cập **Lịch sử tư vấn** (`/consultation-history`) từ menu tài khoản cá nhân.
2. Xem lại danh sách toàn bộ các buổi hẹn đã kết thúc (`Completed`).
3. **Gửi Đánh giá & Phản hồi**:
   - Nhấn nút **Đánh giá chuyên gia (Review)** tại buổi hẹn tương ứng.
   - **Chấm điểm sao**: Từ 1 đến 5 sao.
   - **Viết nhận xét**: Chia sẻ cảm nhận về mức độ nhiệt tình, kiến thức và giá trị buổi tư vấn mang lại.
   - Nhấn **Gửi đánh giá**. Nhận xét của bạn sẽ xuất hiện công khai trên hồ sơ của chuyên gia.

---

### 3.6. Làm Bài Trắc Nghiệm Cá Nhân (Personal Quiz - `/quiz`)

1. Truy cập mục **Personal Quiz** trên thanh điều hướng.
2. Đọc hướng dẫn bài trắc nghiệm khảo sát năng lực và định hướng.
3. Thực hiện trả lời các câu hỏi khảo sát trực tiếp trên giao diện hoặc qua biểu mẫu Google Form được tích hợp.
4. Nhấn **Gửi bài (Submit)**. 
5. Kết quả trắc nghiệm sẽ là cơ sở dữ liệu giúp AI và Chuyên gia xây dựng lộ trình học tập / tư vấn tối ưu nhất cho bạn.

---

### 3.7. Kho Tài Nguyên Học Tập (`/resources`)

- Truy cập mục **Resources (Tài nguyên)** để tra cứu các tài liệu học tập, bài viết hướng dẫn, mẫu CV, tài liệu ôn tập được biên soạn bởi đội ngũ cố vấn chuyên môn.
- Cho phép tìm kiếm tài liệu theo chủ đề và tải về hoàn toàn miễn phí.

---

### 3.8. Quản Lý Hồ Sơ & Cài Đặt Cá Nhân (`/profile` & `/settings`)

- **Trang Hồ sơ cá nhân (`/profile`)**:
  - Cập nhật ảnh đại diện (Avatar).
  - Chỉnh sửa Họ tên, Số điện thoại, Ngày sinh, Địa chỉ.
  - Cập nhật tiểu sử ngắn (Bio) và mục tiêu phát triển cá nhân.
- **Trang Cài đặt hệ thống (`/settings`)**:
  - Đổi mật khẩu tài khoản.
  - Cài đặt tùy chọn nhận thông báo qua Email.
  - Thiết lập chế độ giao diện (Sáng / Tối).

---

## 4. HƯỚNG DẪN DÀNH CHO CHUYÊN GIA (EXPERT)

### 4.1. Truy Cập Bảng Điều Khiển Chuyên Gia (`/expert-dashboard`)

Sau khi đăng nhập bằng tài khoản có vai trò `Expert`, thanh menu phía trên sẽ hiển thị lối truy cập nhanh vào **Expert Dashboard**.

### 4.2. Quản Lý Yêu Cầu Đặt Lịch
- **Danh sách Yêu cầu mới (`Pending`)**:
  - Xem danh sách học viên đăng ký tư vấn, bao gồm: Tên học viên, ngày giờ chọn, chủ đề tư vấn và ghi chú.
  - Nhấn **Chấp nhận (Approve/Confirm)** để tiếp nhận lịch hẹn, hoặc **Từ chối (Decline)** kèm lý do phù hợp.
- **Cập nhật Đường dẫn Phòng họp (Meeting Link)**:
  - Khi chấp nhận lịch hẹn, chuyên gia nhập link cuộc họp trực tuyến (Google Meet, Zoom, MS Teams...).
  - Link họp sẽ tự động đồng bộ sang giao diện lịch hẹn của Học viên.
- **Cập nhật Trạng thái Buổi hẹn**:
  - Khi buổi tư vấn kết thúc, chuyển trạng thái buổi hẹn sang **Completed (Hoàn thành)** để lưu vào lịch sử.

### 4.3. Quản Lý Khung Giờ Khả Dụng (Availability Slots)
- Chuyên gia chủ động thêm mới, chỉnh sửa hoặc xóa các khoảng thời gian rảnh theo ngày trong tuần.
- Các khung giờ này sẽ hiển thị trực tiếp cho học viên lựa chọn khi đặt lịch.

### 4.4. Cập Nhật Hồ Sơ Chuyên Môn
- Cập nhật danh mục lĩnh vực chuyên sâu, bằng cấp, chứng chỉ và thành tựu cá nhân để tăng độ uy tín với học viên.

---

## 5. HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

### 5.1. Bảng Điều Khiển Quản Trị (`/admin-dashboard`)

Tài khoản vai trò `Admin` có quyền truy cập trang quản trị hệ thống với đầy đủ các công cụ kiểm soát:

1. **Thống Kê Tổng Quan (Analytics Overview)**:
   - Tổng số người dùng (Học viên & Chuyên gia).
   - Tổng số lượt đặt lịch tư vấn và tỷ lệ hoàn thành.
   - Thống kê lượt làm bài quiz và sử dụng tài nguyên.
2. **Quản Lý Người Dùng (User Management)**:
   - Xem danh sách tất cả tài khoản trong hệ thống.
   - Tìm kiếm, lọc tài khoản theo vai trò (`Student`, `Expert`, `Admin`).
   - Khóa (Block) hoặc Kích hoạt (Activate) tài khoản vi phạm chính sách.
   - Phân quyền / Thay đổi vai trò người dùng.
3. **Phê Duyệt & Quản Lý Chuyên Gia (Expert Approvals)**:
   - Xem danh sách đăng ký làm chuyên gia mới gửi lên hệ thống.
   - Kiểm tra bằng cấp, thông tin xác minh và chọn **Phê duyệt (Approve)** hoặc **Từ chối (Reject)**.
4. **Quản Lý Lịch Hẹn & Xử Lý Khiếu Nại**:
   - Tra cứu toàn bộ lịch hẹn hệ thống.
   - Can thiệp hủy hoặc điều chỉnh thông tin lịch hẹn khi có sự cố kỹ thuật hoặc khiếu nại giữa 2 bên.

---

## 6. CÁC TRANG THÔNG TIN & TRỢ GIÚP

- **Trang Chủ (`/`)**: Giới thiệu nền tảng, danh sách chuyên gia nổi bật, quy trình làm việc và cảm nhận của học viên.
- **Trang Liên Hệ (`/contact`)**: Gửi phản hồi, đóng góp ý kiến hoặc yêu cầu hỗ trợ kỹ thuật trực tiếp tới đội ngũ vận hành.
- **Câu Hỏi Thường Gặp (`/faq`)**: Tổng hợp các câu hỏi phổ biến và lời giải đáp chi tiết về tài khoản, đặt lịch và thanh toán/chi phí (nếu có).
- **Chính Sách Bảo Mật (`/privacy-policy`)**: Cam kết bảo mật thông tin cá nhân và dữ liệu cuộc hẹn.
- **Điều Khoản Dịch Vụ (`/terms-of-service`)**: Quyền hạn, trách nhiệm và quy định chung khi tham gia nền tảng.

---

## 7. CÁC CÂU HỎI THƯỜNG GẶP & XỬ LÝ LỖI (TROUBLESHOOTING)

### 7.1. Tôi không nhận được mã OTP xác minh email khi đăng ký?
- **Nguyên nhân**: Email rơi vào hộp thư rác (Spam/Junk) hoặc địa chỉ email bị gõ sai.
- **Cách khắc phục**: 
  1. Kiểm tra kỹ thư mục **Spam/Junk/Promotions** trong email.
  2. Bấm nút **Gửi lại mã OTP (Resend OTP)** sau 60 giây.
  3. Nếu vẫn không nhận được, kiểm tra xem địa chỉ email gõ đúng chưa và thử lại.

### 7.2. Đến giờ hẹn nhưng nút "Vào phòng họp" không hoạt động hoặc không có link?
- **Nguyên nhân**: Chuyên gia chưa cập nhật link phòng họp hoặc lịch hẹn chưa ở trạng thái `Confirmed`.
- **Cách khắc phục**: Kiểm tra trạng thái lịch hẹn tại `/my-bookings`. Nếu trạng thái là `Confirmed` nhưng chưa thấy link, vui lòng gửi tin nhắn hỗ trợ tại trang `/contact` hoặc liên hệ admin.

### 7.3. Tôi muốn hủy lịch hẹn tư vấn thì phải làm sao?
- Truy cập `/my-bookings`, tìm buổi hẹn cần hủy và chọn **Hủy đặt lịch**. Hệ thống sẽ chuyển trạng thái buổi hẹn sang `Cancelled` và gửi thông báo tới chuyên gia.

---

## 8. BẢNG MÃ TRẠNG THÁI LỊCH HẸN (APPENDIX)

| Trạng Thái (Status) | Mô Tả | Thao Tác Khả Dụng |
| :--- | :--- | :--- |
| `Pending` | Lịch hẹn mới tạo, chờ chuyên gia duyệt. | Student: Hủy lịch.<br>Expert: Chấp nhận / Từ chối. |
| `Confirmed` | Chuyên gia đã duyệt & đính kèm link họp. | Student & Expert: Bấm link vào phòng họp, Hủy lịch. |
| `Completed` | Buổi tư vấn đã diễn ra hoàn tất. | Student: Viết nhận xét & chấm sao đánh giá. |
| `Cancelled` | Buổi tư vấn đã bị hủy. | Xem lại thông tin trong lịch sử. |

---
*Tài liệu Hướng dẫn sử dụng Hệ thống SS Connect - Cập nhật mới nhất tháng 08/2026.*

