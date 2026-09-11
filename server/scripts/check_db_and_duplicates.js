import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import prisma from '../src/config/db.js';

async function checkDatabase() {
  console.log('=== 1. DATABASE CONNECTIVITY CHECK ===');
  console.log('DATABASE_URL is defined:', !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log('Target URL:', masked);
  }

  const startTime = Date.now();
  try {
    // 1. Raw query to check database responsiveness
    await prisma.$queryRaw`SELECT 1 as connected`;
    const elapsed = Date.now() - startTime;
    console.log(`[SUCCESS] Database connected successfully in ${elapsed}ms!`);
  } catch (err) {
    console.error('[ERROR] Database connection failed:', err.message);
    return;
  }

  console.log('\n=== 2. TABLE COUNTS & RECORD INSPECTION ===');
  const counts = {
    users: await prisma.user.count(),
    institutions: await prisma.institution.count(),
    restaurants: await prisma.restaurant.count(),
    restaurantTables: await prisma.restaurantTable.count(),
    menuItems: await prisma.menuItem.count(),
    bookings: await prisma.booking.count(),
    bookingOrders: await prisma.bookingOrder.count(),
    payments: await prisma.payment.count(),
    offers: await prisma.offer.count(),
    notifications: await prisma.notification.count(),
    verificationRequests: await prisma.verificationRequest.count(),
    reviews: await prisma.review.count(),
    auditLogs: await prisma.auditLog.count()
  };
  console.table(counts);

  console.log('\n=== 3. CHECKING FOR DUPLICATES ===');

  // Check Users by email
  const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  const usersByEmail = {};
  for (const u of allUsers) {
    const key = u.email.toLowerCase().trim();
    if (!usersByEmail[key]) usersByEmail[key] = [];
    usersByEmail[key].push(u);
  }
  const duplicateUsers = Object.entries(usersByEmail).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate User emails: ${duplicateUsers.length}`);
  for (const [email, list] of duplicateUsers) {
    console.log(`  Duplicate user email: "${email}" (${list.length} instances)`);
    // Keep the earliest or most complete, delete others
    const sorted = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing duplicate user ID: ${rem.id}`);
      await prisma.user.delete({ where: { id: rem.id } });
    }
  }

  // Check Institutions by domain or name
  const allInstitutions = await prisma.institution.findMany();
  const instByDomain = {};
  for (const inst of allInstitutions) {
    const key = (inst.domain || inst.name).toLowerCase().trim();
    if (!instByDomain[key]) instByDomain[key] = [];
    instByDomain[key].push(inst);
  }
  const duplicateInsts = Object.entries(instByDomain).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Institutions: ${duplicateInsts.length}`);
  for (const [key, list] of duplicateInsts) {
    console.log(`  Duplicate institution "${key}" (${list.length} instances)`);
    const sorted = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing duplicate institution ID: ${rem.id}`);
      await prisma.institution.delete({ where: { id: rem.id } });
    }
  }

  // Check Restaurants by name & address
  const allRestaurants = await prisma.restaurant.findMany({ include: { tables: true, menuItems: true } });
  const restByName = {};
  for (const r of allRestaurants) {
    const key = r.name.toLowerCase().trim();
    if (!restByName[key]) restByName[key] = [];
    restByName[key].push(r);
  }
  const duplicateRestaurants = Object.entries(restByName).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Restaurants: ${duplicateRestaurants.length}`);
  for (const [name, list] of duplicateRestaurants) {
    console.log(`  Duplicate restaurant: "${name}" (${list.length} instances)`);
    const sorted = list.sort((a, b) => a.id - b.id);
    const primary = sorted[0];
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing duplicate restaurant ID: ${rem.id}`);
      await prisma.restaurant.delete({ where: { id: rem.id } });
    }
  }

  // Check Menu Items by restaurantId + name
  const allMenuItems = await prisma.menuItem.findMany();
  const menuByName = {};
  for (const m of allMenuItems) {
    const key = `${m.restaurantId}__${m.name.toLowerCase().trim()}`;
    if (!menuByName[key]) menuByName[key] = [];
    menuByName[key].push(m);
  }
  const duplicateMenuItems = Object.entries(menuByName).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Menu Items: ${duplicateMenuItems.length}`);
  for (const [key, list] of duplicateMenuItems) {
    console.log(`  Duplicate menu item: "${list[0].name}" in restId ${list[0].restaurantId} (${list.length} instances)`);
    const toRemove = list.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing duplicate menu item ID: ${rem.id}`);
      await prisma.menuItem.delete({ where: { id: rem.id } });
    }
  }

  // Check Restaurant Tables by restaurantId + id
  const allTables = await prisma.restaurantTable.findMany();
  const tablesByKey = {};
  for (const t of allTables) {
    const key = `${t.restaurantId}__${t.id.toLowerCase().trim()}`;
    if (!tablesByKey[key]) tablesByKey[key] = [];
    tablesByKey[key].push(t);
  }
  const duplicateTables = Object.entries(tablesByKey).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Restaurant Tables: ${duplicateTables.length}`);

  // Check Offers by promoCode
  const allOffers = await prisma.offer.findMany();
  const offersByCode = {};
  for (const o of allOffers) {
    const key = o.promoCode.toUpperCase().trim();
    if (!offersByCode[key]) offersByCode[key] = [];
    offersByCode[key].push(o);
  }
  const duplicateOffers = Object.entries(offersByCode).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Offers: ${duplicateOffers.length}`);
  for (const [code, list] of duplicateOffers) {
    console.log(`  Duplicate promoCode: "${code}" (${list.length} instances)`);
    const sorted = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing duplicate offer ID: ${rem.id}`);
      await prisma.offer.delete({ where: { id: rem.id } });
    }
  }

  // Check Bookings by id
  const allBookings = await prisma.booking.findMany({ include: { orders: true } });
  const bookingsByKey = {};
  for (const b of allBookings) {
    const key = b.id;
    if (!bookingsByKey[key]) bookingsByKey[key] = [];
    bookingsByKey[key].push(b);
  }
  const duplicateBookings = Object.entries(bookingsByKey).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Bookings: ${duplicateBookings.length}`);

  // Check BookingOrders for duplicate dish lines within the same booking
  let duplicateOrdersCount = 0;
  for (const b of allBookings) {
    const dishMap = {};
    for (const ord of b.orders) {
      const dKey = ord.name.toLowerCase().trim();
      if (!dishMap[dKey]) dishMap[dKey] = [];
      dishMap[dKey].push(ord);
    }
    for (const [dName, dList] of Object.entries(dishMap)) {
      if (dList.length > 1) {
        duplicateOrdersCount++;
        console.log(`  Merging duplicate order item "${dName}" in booking ${b.id} (${dList.length} rows)`);
        // Merge quantities into first item and delete the rest
        const totalQty = dList.reduce((sum, item) => sum + item.quantity, 0);
        await prisma.bookingOrder.update({
          where: { id: dList[0].id },
          data: { quantity: totalQty }
        });
        for (const rem of dList.slice(1)) {
          await prisma.bookingOrder.delete({ where: { id: rem.id } });
        }
      }
    }
  }
  console.log(`- Duplicate Booking Order Lines merged: ${duplicateOrdersCount}`);

  // Check VerificationRequests by email
  const allVerifs = await prisma.verificationRequest.findMany();
  const verifByEmail = {};
  for (const v of allVerifs) {
    const key = v.email.toLowerCase().trim();
    if (!verifByEmail[key]) verifByEmail[key] = [];
    verifByEmail[key].push(v);
  }
  const duplicateVerifs = Object.entries(verifByEmail).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Verification Requests: ${duplicateVerifs.length}`);
  for (const [email, list] of duplicateVerifs) {
    console.log(`  Duplicate verification request for email: "${email}" (${list.length} instances)`);
    const sorted = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // keep newest
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing older duplicate verification ID: ${rem.id}`);
      await prisma.verificationRequest.delete({ where: { id: rem.id } });
    }
  }

  // Check Reviews by restaurantId + userId
  const allReviews = await prisma.review.findMany();
  const reviewsByKey = {};
  for (const rev of allReviews) {
    const key = `${rev.restaurantId}__${rev.userId}`;
    if (!reviewsByKey[key]) reviewsByKey[key] = [];
    reviewsByKey[key].push(rev);
  }
  const duplicateReviews = Object.entries(reviewsByKey).filter(([_, list]) => list.length > 1);
  console.log(`- Duplicate Reviews: ${duplicateReviews.length}`);
  for (const [key, list] of duplicateReviews) {
    console.log(`  Duplicate reviews by same user for same restaurant: ${key} (${list.length} instances)`);
    const sorted = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // keep latest
    const toRemove = sorted.slice(1);
    for (const rem of toRemove) {
      console.log(`    Removing older duplicate review ID: ${rem.id}`);
      await prisma.review.delete({ where: { id: rem.id } });
    }
  }

  console.log('\n=== 4. SUMMARY & CLEANUP COMPLETE ===');
  console.log('Database connectivity: OK');
  console.log('Duplicates check & cleanup: DONE');
}

checkDatabase()
  .catch(err => {
    console.error('Fatal error during database check:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
