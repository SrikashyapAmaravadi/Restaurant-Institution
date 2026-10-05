import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting clean database population...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.bookingOrder.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany().catch(() => {});
  await prisma.restaurantMember.deleteMany().catch(() => {});
  await prisma.refreshToken.deleteMany().catch(() => {});
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
      type: 'UNIVERSITY',
      discountPercent: 20,
      activeUsers: 3420,
      partnerRestaurants: 1,
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
      type: 'UNIVERSITY',
      discountPercent: 10,
      activeUsers: 1840,
      partnerRestaurants: 0,
      status: 'PILOT',
      isPrimary: false
    }
  });

  console.log('[SEED] Created institutions.');

  // 3. Demo Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      id: 1,
      name: 'The Spice Garden',
      tagline: 'Authentic North Indian & Continental Cuisine',
      cuisine: 'North Indian',
      price: '₹₹',
      rating: 4.5,
      reviews: 128,
      distance: 0.3,
      isOpen: true,
      hasOffer: true,
      offerLabel: '20% Off for Students',
      address: 'Bennett University Campus, Food Court Block A',
      phone: '+91 98765 43210',
      hours: '9:00 AM – 10:00 PM',
      capacity: 60,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
      description: 'A vibrant campus dining experience offering authentic Indian flavors and continental fare in a modern, cozy setting.'
    }
  });

  // Tables
  await prisma.restaurantTable.createMany({
    data: [
      { id: 'T-01', restaurantId: 1, capacity: 2, type: 'Window Seat', isOccupied: false },
      { id: 'T-02', restaurantId: 1, capacity: 4, type: 'Standard Booth', isOccupied: false },
      { id: 'T-03', restaurantId: 1, capacity: 4, type: 'Standard Booth', isOccupied: false },
      { id: 'T-04', restaurantId: 1, capacity: 6, type: 'Large Round Table', isOccupied: false },
      { id: 'T-05', restaurantId: 1, capacity: 2, type: 'Counter Seat', isOccupied: false },
    ]
  });

  // Menu Items
  await prisma.menuItem.createMany({
    data: [
      { id: 'sg1', restaurantId: 1, category: 'Mains', name: 'Butter Chicken', desc: 'Slow-cooked tender chicken in a rich tomato cream sauce', price: 280, isVeg: false, badge: 'Bestseller' },
      { id: 'sg2', restaurantId: 1, category: 'Mains', name: 'Paneer Tikka Masala', desc: 'Cottage cheese cubes in a spiced tomato-onion gravy', price: 240, isVeg: true, badge: 'Chef Special' },
      { id: 'sg3', restaurantId: 1, category: 'Mains', name: 'Dal Makhani', desc: 'Black lentils slow-cooked overnight with cream and butter', price: 180, isVeg: true },
      { id: 'sg4', restaurantId: 1, category: 'Breads', name: 'Garlic Naan', desc: 'Leavened bread topped with garlic and fresh coriander', price: 60, isVeg: true },
      { id: 'sg5', restaurantId: 1, category: 'Breads', name: 'Tawa Roti', desc: 'Whole wheat flatbread cooked on a griddle', price: 30, isVeg: true },
      { id: 'sg6', restaurantId: 1, category: 'Starters', name: 'Veg Samosa (2 pcs)', desc: 'Crispy pastry filled with spiced potatoes and peas', price: 60, isVeg: true },
      { id: 'sg7', restaurantId: 1, category: 'Starters', name: 'Chicken Wings', desc: 'Grilled spicy wings with house dipping sauce', price: 220, isVeg: false },
      { id: 'sg8', restaurantId: 1, category: 'Beverages', name: 'Mango Lassi', desc: 'Fresh mango blended with creamy yogurt', price: 90, isVeg: true, badge: 'Popular' },
      { id: 'sg9', restaurantId: 1, category: 'Beverages', name: 'Masala Chai', desc: 'Spiced tea brewed with ginger, cardamom, and milk', price: 40, isVeg: true },
    ]
  });

  console.log('[SEED] Created demo restaurant with tables and menu.');

  // 4. Users
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Super Admin
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
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/superadmin'
    }
  });

  // Restaurant Admin
  const restAdmin = await prisma.user.create({
    data: {
      id: 'usr-restadmin-1',
      email: 'admin@spicegarden.com',
      passwordHash,
      name: 'Arjun Mehta',
      role: 'RESTAURANT_ADMIN',
      roleLabel: 'Restaurant Admin — The Spice Garden',
      department: 'The Spice Garden',
      restaurantId: restaurant.id,
      institution: 'Bennett University',
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/admin'
    }
  });

  // Restaurant Staff
  const restStaff = await prisma.user.create({
    data: {
      id: 'usr-reststaff-1',
      email: 'staff@spicegarden.com',
      passwordHash,
      name: 'Preethi Nair',
      role: 'RESTAURANT_STAFF',
      roleLabel: 'Floor Staff — The Spice Garden',
      department: 'The Spice Garden',
      restaurantId: restaurant.id,
      institution: 'Bennett University',
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/admin'
    }
  });

  // Wire RestaurantMember records (tenancy enforcement)
  await prisma.restaurantMember.createMany({
    data: [
      { restaurantId: restaurant.id, userId: restAdmin.id, role: 'RESTAURANT_ADMIN', status: 'ACTIVE' },
      { restaurantId: restaurant.id, userId: restStaff.id, role: 'RESTAURANT_STAFF', status: 'ACTIVE' },
    ]
  });

  // Students
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
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/dashboard'
    }
  });

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
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/dashboard'
    }
  });

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
      institutionId: 'inst-1',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      verified: false,
      homePath: '/verify'
    }
  });

  // Verification Requests
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
        status: 'PENDING',
      }
    ]
  });

  console.log('\n======================================================');
  console.log('[SEED] DATABASE SEEDED SUCCESSFULLY');
  console.log('======================================================');
  console.log('SUPER ADMIN   superadmin@bennett.edu.in  / password123');
  console.log('REST ADMIN    admin@spicegarden.com      / password123');
  console.log('REST STAFF    staff@spicegarden.com      / password123');
  console.log('STUDENT (OTP) any @bennett.edu.in email  → OTP: 123456');
  console.log('STUDENT (PWD) priya.sharma@bennett.edu.in/ password123');
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
