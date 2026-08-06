/**
 * Seed script — creates student, admin, and expert accounts with mock data for testing.
 * Run with:  npx tsx src/scripts/seed.ts
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { BookingModel } from '../models/booking.model';
import { hashPassword } from '../utils/hash';

const TEST_USERS = [
  {
    email: 'user@ssconnect.dev',
    password: 'User1234!',
    displayName: 'Học Viên Demo',
    role: 'user' as const,
    phone: '0912345678',
    bio: 'Học viên lớp Web Fullstack tại MindX, mong muốn được tư vấn sửa CV và định hướng nghề nghiệp.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    isEmailVerified: true,
  },
  {
    email: 'admin@ssconnect.dev',
    password: 'Admin1234!',
    displayName: 'Admin Success Connect',
    role: 'admin' as const,
    phone: '0999888777',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    isEmailVerified: true,
  }
];

const EXPERTS = [
  {
    email: 'expert1@ssconnect.dev',
    password: 'Expert1234!',
    displayName: 'Nguyễn Thu Hà',
    role: 'expert' as const,
    phone: '0922233445',
    bio: '10+ năm kinh nghiệm tại các tập đoàn đa quốc gia. Chuyên tư vấn xây dựng thương hiệu cá nhân và định hướng lộ trình thăng tiến.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    isEmailVerified: true,
    title: 'Marketing Strategy',
    experienceYears: 10,
    specialties: ['Định hướng nghề nghiệp', 'Sửa CV', 'Phỏng vấn', 'Business Analysis'],
    achievements: [
      'Xây dựng thành công chiến dịch Marketing cho 5+ thương hiệu quốc gia',
      'Dẫn dắt và cố vấn cho 200+ học viên đạt học bổng và đỗ Big4'
    ],
    consultingStyle: 'Thực tế, định hướng mục tiêu rõ ràng và đồng hành sát sao cùng học viên.',
    consultingType: ['online', 'offline'] as ('online' | 'offline')[],
  },
  {
    email: 'expert2@ssconnect.dev',
    password: 'Expert1234!',
    displayName: 'Trần Minh Hoàng',
    role: 'expert' as const,
    phone: '0933344556',
    bio: 'Tech Lead tại TechCorp. Sẵn sàng hỗ trợ các bạn sinh viên IT thiết lập lộ trình học tập hiệu quả, tối ưu hóa code và chuẩn bị phỏng vấn.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
    isEmailVerified: true,
    title: 'Software Engineering',
    experienceYears: 8,
    specialties: ['Web Development', 'Sửa CV', 'Phỏng vấn', 'Job matching', 'Portfolio'],
    achievements: [
      'Tech Lead quản lý đội ngũ 15 kỹ sư phần mềm tại tập đoàn công nghệ lớn',
      'Thiết kế kiến trúc hệ thống xử lý hơn 1 triệu request/giây'
    ],
    consultingStyle: 'Chú trọng thực hành, phân tích logic sâu sắc và giải quyết vấn đề từ gốc.',
    consultingType: ['online', 'offline'] as ('online' | 'offline')[],
  },
  {
    email: 'expert3@ssconnect.dev',
    password: 'Expert1234!',
    displayName: 'Lê Ngọc Mai',
    role: 'expert' as const,
    phone: '0944455667',
    bio: 'Product Designer đam mê tạo ra các trải nghiệm người dùng tuyệt vời. Từng tư vấn xây dựng Portfolio ấn tượng cho hàng trăm học viên ứng tuyển.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    isEmailVerified: true,
    title: 'UX/UI Design',
    experienceYears: 6,
    specialties: ['Portfolio', 'Sửa CV', 'Job matching', 'Định hướng nghề nghiệp'],
    achievements: [
      'Thiết kế sản phẩm Fintech đạt giải thưởng thiết kế quốc tế 2024',
      'Hướng dẫn 50+ học viên trúng tuyển tại các studio thiết kế hàng đầu'
    ],
    consultingStyle: 'Truyền cảm hứng, tập trung vào tư duy lấy người dùng làm trung tâm (User-Centered Design).',
    consultingType: ['online'] as ('online' | 'offline')[],
  },
  {
    email: 'expert4@ssconnect.dev',
    password: 'Expert1234!',
    displayName: 'Phạm Quốc Bảo',
    role: 'expert' as const,
    phone: '0955566778',
    bio: 'Giám đốc tài chính với tầm nhìn chiến lược. Hỗ trợ sinh viên ngành tài chính ngân hàng chuẩn bị kiến thức chuyên sâu và phỏng vấn vị trí cao.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    isEmailVerified: true,
    title: 'Finance & Banking',
    experienceYears: 12,
    specialties: ['Định hướng nghề nghiệp', 'Phỏng vấn', 'Sửa CV', 'Business Analysis', 'Data Analysis'],
    achievements: [
      'Cựu Giám đốc tài chính 7 năm kinh nghiệm tại ngân hàng cổ phần lớn',
      'Cố vấn đầu tư và tái cấu trúc cho 10+ dự án lớn trị giá triệu USD'
    ],
    consultingStyle: 'Nghiêm túc, tư duy phản biện cao và phân tích sắc bén dựa trên số liệu thực tế.',
    consultingType: ['online', 'offline'] as ('online' | 'offline')[],
  }
];

const TIME_SLOTS = ['09:00', '10:00', '14:00', '15:00', '16:00'];
const DATES = [
  '2026-08-06',
  '2026-08-07',
  '2026-08-08',
  '2026-08-09',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14'
];

async function seed() {
  console.log('🌱 Connecting to database…');
  await mongoose.connect(env.mongoUri);
  console.log('✅ Connected.\n');

  console.log('🧹 Cleaning database collections…');
  await UserModel.deleteMany({});
  await BookingModel.deleteMany({});
  console.log('✅ Cleaned.\n');

  const createdUserDocs: any[] = [];
  const createdExpertDocs: any[] = [];

  // 1. Seed standard users (Student & Admin)
  for (const account of TEST_USERS) {
    const hashedPassword = await hashPassword(account.password);
    const userDoc = await UserModel.create({
      ...account,
      password: hashedPassword
    });
    createdUserDocs.push(userDoc);
    console.log(`➕ Created User [${account.role}] → ${account.email}`);
  }

  // 2. Seed Experts with Available Slots
  for (const exp of EXPERTS) {
    const hashedPassword = await hashPassword(exp.password);
    
    // Generate available slots (some booked, some free)
    const availableSlots = [];
    let slotCount = 0;
    for (const d of DATES) {
      for (const t of TIME_SLOTS) {
        // Leave most open, book a few randomly
        const isBookedRandom = slotCount % 8 === 0; // 1 in 8 slots will be set as booked initially
        availableSlots.push({
          date: d,
          time: t,
          booked: isBookedRandom
        });
        slotCount++;
      }
    }

    const expertDoc = await UserModel.create({
      ...exp,
      password: hashedPassword,
      availableSlots
    });
    createdExpertDocs.push(expertDoc);
    console.log(`➕ Created Expert [expert] → ${exp.email} (${availableSlots.length} slots)`);
  }

  // 3. Seed Mock Bookings
  const student = createdUserDocs.find(u => u.role === 'user');
  if (student && createdExpertDocs.length > 0) {
    console.log('\n📅 Seeding mock bookings…');

    const mockBookings = [
      {
        studentId: student._id,
        expertId: createdExpertDocs[0]._id, // Nguyễn Thu Hà
        studentName: student.displayName,
        studentEmail: student.email,
        studentPhone: student.phone,
        course: 'Marketing Manager Pro',
        major: 'Quản trị Kinh doanh',
        goals: 'Muốn biết cách sửa CV ngành Marketing để ứng tuyển vào tập đoàn đa quốc gia.',
        issues: 'CV hiện tại còn sơ sài, chưa nổi bật được dự án thực tế đã làm.',
        cvLink: 'https://drive.google.com/file/d/cv_demo_ha_nguyen/view',
        bookingType: 'Tư vấn sửa CV',
        date: '2026-08-06',
        time: '09:00',
        mode: 'online' as const,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Mong chị xem giúp phần kinh nghiệm dự án.',
        status: 'pending' as const, // Chờ xác nhận
      },
      {
        studentId: student._id,
        expertId: createdExpertDocs[1]._id, // Trần Minh Hoàng
        studentName: student.displayName,
        studentEmail: student.email,
        studentPhone: student.phone,
        course: 'Web Fullstack',
        major: 'Công nghệ thông tin',
        goals: 'Tư vấn lộ trình học nâng cao lên Node.js & React và chuẩn bị phỏng vấn Backend Developer.',
        issues: 'Biết HTML/CSS căn bản và Express nhưng chưa hiểu sâu về cơ chế bất đồng bộ và tối ưu cơ sở dữ liệu.',
        bookingType: 'Tư vấn lộ trình học thêm',
        date: '2026-08-07',
        time: '14:00',
        mode: 'online' as const,
        meetingLink: 'https://meet.google.com/xyz-qwe-asd',
        status: 'confirmed' as const, // Đã xác nhận
      },
      {
        studentId: student._id,
        expertId: createdExpertDocs[2]._id, // Lê Ngọc Mai
        studentName: student.displayName,
        studentEmail: student.email,
        studentPhone: student.phone,
        course: 'UX/UI Design',
        major: 'Mỹ thuật Công nghiệp',
        goals: 'Review portfolio Behance thiết kế app thương mại điện tử.',
        issues: 'Bố cục layout portfolio chưa liền mạch, chưa kể được câu chuyện sản phẩm (Design Storytelling).',
        cvLink: 'https://behance.net/portfolio_demo',
        bookingType: 'Tư vấn portfolio/GitHub/LinkedIn',
        date: '2026-08-08',
        time: '10:00',
        mode: 'online' as const,
        meetingLink: 'https://meet.google.com/uio-rty-fgh',
        status: 'completed' as const, // Đã hoàn thành
        postConsultationNotes: 'Học viên có khiếu thẩm mỹ tốt. Cần sắp xếp lại mạch quy trình nghiên cứu UX (User Research) trước khi vẽ UI. Đã chỉnh sửa bổ sung 3 slide.'
      }
    ];

    for (const b of mockBookings) {
      await BookingModel.create(b);
      console.log(`  └─ Created Booking status [${b.status}]: ${b.studentName} ↔ Chuyên gia ${createdExpertDocs.find(e => String(e._id) === String(b.expertId))?.displayName}`);
    }
  }

  console.log('\n--- Credentials for Demo ---');
  console.log(`  Admin   →  admin@ssconnect.dev   /   Admin1234!`);
  console.log(`  Student →  user@ssconnect.dev    /   User1234!`);
  console.log(`  Expert1 →  expert1@ssconnect.dev /   Expert1234! (Nguyễn Thu Hà)`);
  console.log(`  Expert2 →  expert2@ssconnect.dev /   Expert1234! (Trần Minh Hoàng)`);
  console.log(`  Expert3 →  expert3@ssconnect.dev /   Expert1234! (Lê Ngọc Mai)`);
  console.log(`  Expert4 →  expert4@ssconnect.dev /   Expert1234! (Phạm Quốc Bảo)`);
  console.log('----------------------------\n');

  await mongoose.disconnect();
  console.log('👋 Seeding finished.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
