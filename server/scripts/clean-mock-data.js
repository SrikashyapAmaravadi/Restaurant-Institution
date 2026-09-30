import prisma from '../src/config/db.js';

async function clean() {
  console.log('Cleaning mock dining data...');
  const delPayments = await prisma.payment.deleteMany();
  console.log('Deleted payments:', delPayments.count);
  const delOrders = await prisma.bookingOrder.deleteMany();
  console.log('Deleted bookingOrders:', delOrders.count);
  const delBookings = await prisma.booking.deleteMany();
  console.log('Deleted bookings:', delBookings.count);
  const delReviews = await prisma.review.deleteMany();
  console.log('Deleted reviews:', delReviews.count);
  const delOffers = await prisma.offer.deleteMany();
  console.log('Deleted offers:', delOffers.count);
  const delMenus = await prisma.menuItem.deleteMany();
  console.log('Deleted menuItems:', delMenus.count);
  const delTables = await prisma.restaurantTable.deleteMany();
  console.log('Deleted restaurantTables:', delTables.count);
  const delRestaurants = await prisma.restaurant.deleteMany();
  console.log('Deleted restaurants:', delRestaurants.count);

  // Delete all non-superadmin and non-student users
  const delUsers = await prisma.user.deleteMany({
    where: {
      role: { notIn: ['SUPER_ADMIN', 'STUDENT'] }
    }
  });
  console.log('Deleted mock staff/admin users:', delUsers.count);

  const remainingUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log('Remaining users in database:');
  console.table(remainingUsers);

  const remainingRestaurants = await prisma.restaurant.findMany();
  console.log('Remaining restaurants in database:', remainingRestaurants.length);
}

clean()
  .catch(err => {
    console.error('Clean error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
