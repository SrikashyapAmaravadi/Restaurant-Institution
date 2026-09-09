import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting database population with institutional sample data...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.bookingOrder.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('[SEED] Cleared existing records.');

  // 2. Institutions
  const bennett = await prisma.institution.create({
    data: {
      id: 'inst-1',
      name: 'Bennett University',
      domain: '@bennett.edu.in',
      location: 'Plot 8-11, TechZone II, Greater Noida, UP 201310',
      activeUsers: 3420,
      partnerRestaurants: 4,
      status: 'ACTIVE',
      isPrimary: true
    }
  });

  const snu = await prisma.institution.create({
    data: {
      id: 'inst-2',
      name: 'Shiv Nadar University',
      domain: '@snu.edu.in',
      location: 'NH91, Tehsil Dadri, Gautam Buddha Nagar, UP 203207',
      activeUsers: 1840,
      partnerRestaurants: 2,
      status: 'PILOT',
      isPrimary: false
    }
  });

  console.log('[SEED] Created institutions: Bennett University, Shiv Nadar University');

  // 3. Users with password "password123"
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 3a. Super Admin
  const superAdminUser = await prisma.user.create({
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

  // 3b. Restaurant Admin (Owner)
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr-admin-1',
      email: 'owner@spicegarden.com',
      passwordHash,
      name: 'Vikram Singhania',
      role: 'RESTAURANT_ADMIN',
      roleLabel: 'Restaurant Owner & Manager',
      department: 'The Spice Garden',
      restaurantId: 1,
      institution: 'Bennett University Partner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/admin'
    }
  });

  // 3c. Restaurant Staff (Front Desk Host)
  const staffUser = await prisma.user.create({
    data: {
      id: 'usr-staff-1',
      email: 'staff@spicegarden.com',
      passwordHash,
      name: 'Rajesh Kumar',
      role: 'RESTAURANT_STAFF',
      roleLabel: 'Front-Desk Host & Service Desk',
      department: 'The Spice Garden Front Desk',
      restaurantId: 1,
      institution: 'Bennett University Partner',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      verified: true,
      homePath: '/management/staff'
    }
  });

  // 3d. Verified Student User
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

  // 3e. Unverified Student User (for testing Verification Flow)
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

  // 3f. Faculty Member (Awaiting Clearance)
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

  console.log('[SEED] Created 6 core RBAC accounts (Super Admin, Restaurant Admin, Staff, Verified Student, Unverified Student, Faculty)');

  // 4. Verification Requests Queue (for Super Admin queue & Student verification)
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
      },
      {
        id: 'req-4',
        name: 'Kabir Varma',
        email: 'kabir.varma@bennett.edu.in',
        role: 'MBA Tech · 1st Year',
        idProof: 'BU-2025-MBA-0042',
        submitted: 'Today, 11:00 AM',
        status: 'PENDING',
        verificationCode: null
      }
    ]
  });

  console.log('[SEED] Created 4 verification requests in Super Admin queue');

  // 5. Restaurants
  const r1 = await prisma.restaurant.create({
    data: {
      id: 1,
      name: 'The Spice Garden',
      tagline: 'Authentic Tandoor & Royal Mughlai Delicacies',
      cuisine: 'North Indian',
      price: '₹₹',
      rating: 4.8,
      reviews: 142,
      distance: 0.8,
      lat: 28.4520,
      lng: 77.5850,
      isOpen: true,
      hasOffer: true,
      offerLabel: '20% Student Discount',
      address: 'Shop 14, Sector Alpha Commercial Belt, Greater Noida',
      phone: '+91 98765 43210',
      hours: '11:30 AM – 11:00 PM',
      capacity: 45,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
      description: 'Renowned for hand-ground aromatic spices, clay-oven tandoori breads, and slow-simmered curries. A Bennett University favorite for celebrations and team dinners.',
      tagsJson: JSON.stringify(['North Indian', 'Tandoor Specialty', 'Halal & Pure Ghee', 'Campus Partner']),
      featuresJson: JSON.stringify(['Air Conditioned', 'Outdoor Patio', 'High-Speed Campus WiFi', 'Instant Booking Confirmation']),
      popularDishesJson: JSON.stringify(['Smoked Dal Makhani', 'Butter Chicken Masala', 'Garlic Butter Naan', 'Paneer Tikka Angara'])
    }
  });

  const r2 = await prisma.restaurant.create({
    data: {
      id: 2,
      name: 'The Deli Corner',
      tagline: 'Artisan Sourdough, Wood-Fired Pizza & Specialty Brews',
      cuisine: 'Continental',
      price: '₹₹',
      rating: 4.7,
      reviews: 215,
      distance: 0.5,
      lat: 28.4505,
      lng: 77.5830,
      isOpen: true,
      hasOffer: true,
      offerLabel: 'BOGO Pizza Combo',
      address: 'Gate 2 Commercial Plaza, Knowledge Park III, Greater Noida',
      phone: '+91 87654 32109',
      hours: '08:30 AM – 10:30 PM',
      capacity: 35,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80',
      description: 'Cozy artisanal bistro serving fresh Neapolitan pizzas, grilled herb paninis, single-origin Arabica pour-overs, and matcha lattes in a student-friendly workspace.',
      tagsJson: JSON.stringify(['Continental', 'Artisan Bakery', 'Specialty Coffee', 'Quiet Study Space']),
      featuresJson: JSON.stringify(['Laptop Charging Sockets', 'High-Speed WiFi', 'Indoor Booths', 'Pet Friendly']),
      popularDishesJson: JSON.stringify(['Truffle Wild Mushroom Pizza', 'Pesto Chicken Panini', 'Iced Hazelnut Latte'])
    }
  });

  const r3 = await prisma.restaurant.create({
    data: {
      id: 3,
      name: 'Mezze & More',
      tagline: 'Levantine Mezze, Crisp Falafel & Char-Grilled Skewers',
      cuisine: 'Mediterranean',
      price: '₹₹₹',
      rating: 4.6,
      reviews: 98,
      distance: 1.2,
      lat: 28.4540,
      lng: 77.5880,
      isOpen: true,
      hasOffer: true,
      offerLabel: 'Free Baklava Dessert',
      address: 'F-12, Knowledge Park II Avenue, Greater Noida',
      phone: '+91 76543 21098',
      hours: '12:00 PM – 11:00 PM',
      capacity: 40,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      heroImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
      description: 'Vibrant Mediterranean flavors featuring velvety silk hummus, crispy herb falafels, smoked chicken shawarma platters, and signature pistachio baklavas.',
      tagsJson: JSON.stringify(['Mediterranean', 'Levantine', 'Gourmet Platters', 'Organic Produce']),
      featuresJson: JSON.stringify(['Rooftop Seating', 'Live Charcoal Grill', 'Family Tables']),
      popularDishesJson: JSON.stringify(['Grand Mezze Platter', 'Smoked Lamb Kofta', 'Pistachio Baklava'])
    }
  });

  const r4 = await prisma.restaurant.create({
    data: {
      id: 4,
      name: 'Wok & Roll',
      tagline: 'Sizzling Asian Bowls, Dim Sum & Spicy Ramen',
      cuisine: 'Pan-Asian',
      price: '₹₹',
      rating: 4.4,
      reviews: 84,
      distance: 1.5,
      lat: 28.4480,
      lng: 77.5810,
      isOpen: true,
      hasOffer: false,
      offerLabel: null,
      address: 'Shop 22, Alpha Commercial Belt, Greater Noida',
      phone: '+91 65432 10987',
      hours: '12:00 PM – 10:30 PM',
      capacity: 30,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      heroImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1400&q=80',
      description: 'Handcrafted crystal dim sums, steaming miso and spicy shoyu ramen bowls, Korean crunchy chicken, and noodles tossed in high-heat wok aromatics.',
      tagsJson: JSON.stringify(['Pan-Asian', 'Ramen Station', 'Dim Sum', 'Late Night Bites']),
      featuresJson: JSON.stringify(['Open Kitchen', 'Boba Tea Counter', 'Fast Casual Seating']),
      popularDishesJson: JSON.stringify(['Tokyo Miso Ramen', 'Crispy Crystal Dim Sums', 'Thai Basil Fried Rice'])
    }
  });

  console.log('[SEED] Created 4 restaurants with geocodes, menus, and offer metadata');

  // 6. Floor Tables (for The Spice Garden - Restaurant 1)
  await prisma.restaurantTable.createMany({
    data: [
      { id: 'T-01', restaurantId: 1, capacity: 2, type: 'Patio Window', isOccupied: false },
      { id: 'T-02', restaurantId: 1, capacity: 2, type: 'Quiet Corner', isOccupied: false },
      { id: 'T-03', restaurantId: 1, capacity: 4, type: 'Standard Booth', isOccupied: false },
      { id: 'T-04', restaurantId: 1, capacity: 4, type: 'Window Booth', isOccupied: true },
      { id: 'T-05', restaurantId: 1, capacity: 2, type: 'Center Dining', isOccupied: false },
      { id: 'T-06', restaurantId: 1, capacity: 6, type: 'Family Table', isOccupied: false },
      { id: 'T-07', restaurantId: 1, capacity: 4, type: 'Garden View', isOccupied: false },
      { id: 'T-08', restaurantId: 1, capacity: 4, type: 'Center Lounge', isOccupied: false }
    ]
  });

  console.log('[SEED] Created 8 floor tables for The Spice Garden');

  // 7. Menu Items for The Spice Garden
  await prisma.menuItem.createMany({
    data: [
      { id: 'sg-1', restaurantId: 1, category: 'Clay Oven Starters', name: 'Paneer Tikka Angara', desc: 'Charcoal-smoked cottage cheese cubes marinated in Kashmiri chili and curd.', price: 280, isVeg: true, badge: 'Popular' },
      { id: 'sg-2', restaurantId: 1, category: 'Clay Oven Starters', name: 'Murgh Malai Tikka', desc: 'Cream-marinated tender chicken kebabs finished in clay tandoor.', price: 340, isVeg: false, badge: 'Chef Special' },
      { id: 'sg-3', restaurantId: 1, category: 'Clay Oven Starters', name: 'Tandoori Soya Chaap', desc: 'Protein-packed soya chunks seasoned with royal tandoori rub.', price: 250, isVeg: true, badge: 'High Protein' },
      { id: 'sg-4', restaurantId: 1, category: 'Main Courses', name: 'Dal Makhani Bukhara', desc: 'Slow-simmered black lentils cooked overnight with cultured farm butter.', price: 270, isVeg: true, badge: 'Signature' },
      { id: 'sg-5', restaurantId: 1, category: 'Main Courses', name: 'Old Delhi Butter Chicken', desc: 'Tandoori chicken simmered in rich satin tomato and cashew gravy.', price: 390, isVeg: false, badge: 'Must Try' },
      { id: 'sg-6', restaurantId: 1, category: 'Main Courses', name: 'Kadhai Paneer Shahi', desc: 'Fresh cottage cheese tossed with bell peppers and roasted ground coriander.', price: 290, isVeg: true },
      { id: 'sg-7', restaurantId: 1, category: 'Artisan Breads', name: 'Garlic Butter Naan', desc: 'Crispy leavened bread brushed with farm butter and minced garlic.', price: 75, isVeg: true },
      { id: 'sg-8', restaurantId: 1, category: 'Artisan Breads', name: 'Stuffed Amritsari Kulcha', desc: 'Crisp layered tandoor bread stuffed with spiced potato and onion.', price: 95, isVeg: true, badge: 'Staff Pick' },
      { id: 'sg-9', restaurantId: 1, category: 'Rice & Biryani', name: 'Awadhi Dum Biryani (Chicken)', desc: 'Fragrant aged basmati rice layered with saffron chicken and kewra essence.', price: 360, isVeg: false },
      { id: 'sg-10', restaurantId: 1, category: 'Rice & Biryani', name: 'Subz Handi Biryani', desc: 'Garden vegetables and basmati cooked on slow charcoal dum.', price: 290, isVeg: true },
      { id: 'sg-11', restaurantId: 1, category: 'Beverages & Desserts', name: 'Fresh Mint Lime Soda', desc: 'Chilled bubbly soda with crushed fresh mint leaves and rock salt.', price: 90, isVeg: true },
      { id: 'sg-12', restaurantId: 1, category: 'Beverages & Desserts', name: 'Royal Kesari Kulfi', desc: 'Dense saffron and pistachio ice cream on stick served with chilled rabri.', price: 120, isVeg: true, badge: 'Sweet Tooth' }
    ]
  });

  console.log('[SEED] Created 12 menu items across 4 categories');

  // 8. Bookings & Pre-Orders
  const b1 = await prisma.booking.create({
    data: {
      id: 'DB-4821',
      restaurantId: 1,
      restaurantName: 'The Spice Garden',
      restaurantImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      userId: studentUser.id,
      guestName: 'Priya Sharma',
      guestEmail: 'priya.sharma@bennett.edu.in',
      date: 'Thu, 4 Sep 2026',
      time: '1:00 PM',
      guests: 3,
      status: 'CONFIRMED',
      specialRequest: 'Window booth preferred for university project group',
      tableAssigned: 'T-04',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DB-4821-BENNETT-VERIFIED'
    }
  });

  await prisma.bookingOrder.createMany({
    data: [
      { bookingId: b1.id, name: 'Dal Makhani Bukhara', price: 270, quantity: 1 },
      { bookingId: b1.id, name: 'Garlic Butter Naan', price: 75, quantity: 2 },
      { bookingId: b1.id, name: 'Fresh Mint Lime Soda', price: 90, quantity: 2 }
    ]
  });

  const bPast = await prisma.booking.create({
    data: {
      id: 'DB-4650',
      restaurantId: 2,
      restaurantName: 'The Deli Corner',
      restaurantImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      userId: studentUser.id,
      guestName: 'Priya Sharma',
      guestEmail: 'priya.sharma@bennett.edu.in',
      date: 'Mon, 18 Aug 2026',
      time: '12:30 PM',
      guests: 4,
      status: 'COMPLETED',
      tableAssigned: 'T-01',
      specialRequest: 'Quiet workspace corner preferred'
    }
  });

  await prisma.payment.create({
    data: {
      bookingId: bPast.id,
      method: 'UPI',
      transactionId: 'TXN-UPI-884210',
      subtotal: 980,
      discount: 196,
      tax: 39,
      totalAmount: 823,
      status: 'PAID'
    }
  });

  console.log('[SEED] Created active and completed bookings with items and UPI transaction');

  // 9. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        type: 'booking',
        title: 'Booking Confirmed!',
        body: 'The Spice Garden confirmed reservation DB-4821 for Thu, 4 Sep at 1:00 PM (3 Guests).',
        read: false
      },
      {
        userId: studentUser.id,
        type: 'system',
        title: 'Bennett Institutional Clearance',
        body: 'Super Admin Governance has verified your institutional pass with Tier-1 dining privileges.',
        read: true
      },
      {
        userId: unverifiedStudent.id,
        type: 'system',
        title: 'Passkey Issued by Super Admin',
        body: 'Your 6-digit institutional clearance passkey is 849201. Please enter it to verify your account.',
        read: false
      }
    ]
  });

  console.log('[SEED] Created in-app notifications');
  console.log('\n======================================================');
  console.log('[SEED] DATABASE SEEDED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Credentials Summary:');
  console.log('1. Super Admin:      superadmin@bennett.edu.in / password123');
  console.log('2. Restaurant Admin: owner@spicegarden.com     / password123');
  console.log('3. Front Desk Staff: staff@spicegarden.com     / password123');
  console.log('4. Verified Student: priya.sharma@bennett.edu.in / password123');
  console.log('5. Unverified Student: rohan.deshmukh@bennett.edu.in / password123 (Passkey: 849201)');
  console.log('6. Faculty Member:   radhika.nair@bennett.edu.in / password123 (Passkey: 314159)');
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
