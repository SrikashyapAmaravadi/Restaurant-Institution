import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting clean database population with SuperAdmin and Student accounts only...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.bookingOrder.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('[SEED] Cleared existing records.');

  // 2. Institutions
  await prisma.institution.create({
    data: {
      id: 'inst-1',
      name: 'Bennett University',
      domain: '@bennett.edu.in',
      location: 'Plot 8-11, TechZone II, Greater Noida, UP 201310',
      activeUsers: 3420,
      partnerRestaurants: 0,
      status: 'ACTIVE',
      isPrimary: true
    }
  });

  await prisma.institution.create({
    data: {
      id: 'inst-2',
      name: 'Shiv Nadar University',
      domain: '@snu.edu.in',
      location: 'NH91, Tehsil Dadri, Gautam Buddha Nagar, UP 203207',
      activeUsers: 1840,
      partnerRestaurants: 0,
      status: 'PILOT',
      isPrimary: false
    }
  });

  console.log('[SEED] Created institutions: Bennett University, Shiv Nadar University');

  // 3. Core Users with password "password123"
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 3a. Super Admin
  await prisma.user.create({
    data: {
      id: 'usr-superadmin-1',
      email: 'superadmin@bennett.edu.in',
      passwordHash,
      name: 'Dr. A. K. Sharma',
      role: 'SUPER_ADMIN',
      roleLabel: 'Platform Governance & Super Admin',
      department: 'Office of Dean & Campus Operations',
      institution: 'Bennett University',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/superadmin'
    }
  });

  // 3b. Verified Student User
  const studentUser = await prisma.user.create({
    data: {
      id: 'usr-student-1',
      email: 'priya.sharma@bennett.edu.in',
      passwordHash,
      name: 'Priya Sharma',
      role: 'STUDENT',
      roleLabel: 'Student (Bennett University)',
      department: 'B.Tech CSE · 2nd Year',
      rollNumber: 'BU24CSE0082',
      institution: 'Bennett University',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/dashboard'
    }
  });

  // 3c. Bennett Scholar / Student SSO Demo User
  await prisma.user.create({
    data: {
      id: 'usr-student-bennett',
      email: 'student@bennett.edu.in',
      passwordHash,
      name: 'Bennett Scholar',
      role: 'STUDENT',
      roleLabel: 'Student (Bennett University)',
      department: 'B.Tech Computer Science · 2nd Year',
      rollNumber: 'BU24CSE0001',
      institution: 'Bennett University',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/dashboard'
    }
  });

  // 3d. Unverified Student User (for testing Verification Flow)
  const unverifiedStudent = await prisma.user.create({
    data: {
      id: 'usr-student-2',
      email: 'rohan.deshmukh@bennett.edu.in',
      passwordHash,
      name: 'Rohan Deshmukh',
      role: 'STUDENT',
      roleLabel: 'Student (Bennett University)',
      department: 'B.Tech CSE · 1st Year',
      rollNumber: 'BU25CSE0114',
      institution: 'Bennett University',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      verified: false,
      homePath: '/verify'
    }
  });

  // 3e. Faculty Member (Awaiting Clearance)
  const facultyUser = await prisma.user.create({
    data: {
      id: 'usr-faculty-1',
      email: 'radhika.nair@bennett.edu.in',
      passwordHash,
      name: 'Dr. Radhika Nair',
      role: 'STUDENT',
      roleLabel: 'Faculty (Bennett University)',
      department: 'Dept of Biotechnology & Sciences',
      rollNumber: 'FAC-BIO-104',
      institution: 'Bennett University',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      verified: false,
      homePath: '/verify'
    }
  });

  console.log('[SEED] Created only Super Admin and Student accounts.');

  // 4. Verification Requests Queue (for Super Admin queue & Student verification testing)
  await prisma.verificationRequest.createMany({
    data: [
      {
        id: 'req-1',
        userId: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.department,
        idProof: 'BU-2024-CSE-0082',
        submitted: 'Yesterday, 11:30 AM',
        status: 'VERIFIED',
        verificationCode: '482100'
      },
      {
        id: 'req-2',
        userId: unverifiedStudent.id,
        name: unverifiedStudent.name,
        email: unverifiedStudent.email,
        role: unverifiedStudent.department,
        idProof: 'BU-2025-CSE-0114',
        submitted: 'Today, 09:15 AM',
        status: 'CODE_SENT',
        verificationCode: '849201'
      },
      {
        id: 'req-3',
        userId: facultyUser.id,
        name: facultyUser.name,
        email: facultyUser.email,
        role: facultyUser.department,
        idProof: 'BU-FAC-BIO-104',
        submitted: 'Today, 10:45 AM',
        status: 'PENDING',
        verificationCode: '314159'
      }
    ]
  });

  console.log('[SEED] Created verification requests in Super Admin queue');
  console.log('\n======================================================');
  console.log('[SEED] DATABASE SEEDED: ONLY SUPERADMIN & STUDENTS');
  console.log('No mock restaurants or mock staff accounts present.');
  console.log('======================================================');
  console.log('Super Admin:      superadmin@bennett.edu.in / password123');
  console.log('Student SSO:      student@bennett.edu.in    / password123');
  console.log('Student Verified: priya.sharma@bennett.edu.in / password123');
  console.log('======================================================\n');
}

main()
  .catch(e => {
    console.error('[SEED_ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
