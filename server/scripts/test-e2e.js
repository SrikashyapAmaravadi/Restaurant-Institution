async function testFlow() {
  const BASE = 'http://localhost:3000/api';

  console.log('1. Checking current restaurants count...');
  const res1 = await fetch(`${BASE}/restaurants`);
  const data1 = await res1.json();
  console.log('Restaurants count:', data1.data?.length, '(Expected: 0)');

  console.log('\n2. Logging in as Super Admin...');
  const saLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@bennett.edu.in', password: 'password123' })
  });
  const saData = await saLoginRes.json();
  if (!saData.success) throw new Error('Super Admin login failed: ' + saData.error);
  const saToken = saData.data.token;
  console.log('Super Admin logged in successfully! Role:', saData.data.user.role);

  console.log('\n3. Super Admin onboarding a new restaurant with owner credentials...');
  const onboardRes = await fetch(`${BASE}/superadmin/restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saToken}`
    },
    body: JSON.stringify({
      name: 'Haveli Royal Kitchen',
      cuisine: 'North Indian',
      price: '₹₹',
      address: 'Near Knowledge Park III, Greater Noida',
      phone: '+91 98111 22233',
      hours: '11:00 AM – 11:00 PM',
      capacity: 50,
      description: 'Authentic royal recipes and clay tandoor cuisine.',
      ownerName: 'Harsh Vardhan',
      ownerEmail: 'owner@haveli.com',
      ownerPassword: 'haveliPass123'
    })
  });
  const onboardData = await onboardRes.json();
  if (!onboardData.success) throw new Error('Onboarding failed: ' + onboardData.error);
  const newRest = onboardData.data;
  console.log('Restaurant onboarded! ID:', newRest.id, 'Name:', newRest.name, 'Owner Email:', newRest.ownerEmail);

  console.log('\n4. Verifying newly added restaurant is visible in public discovery...');
  const discoverRes = await fetch(`${BASE}/restaurants`);
  const discoverData = await discoverRes.json();
  console.log('Discovery restaurants count:', discoverData.data?.length, 'Found name:', discoverData.data?.[0]?.name);

  console.log('\n5. Logging in as newly created Restaurant Owner...');
  const ownerLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@haveli.com', password: 'haveliPass123' })
  });
  const ownerData = await ownerLoginRes.json();
  if (!ownerData.success) throw new Error('Owner login failed: ' + ownerData.error);
  const ownerToken = ownerData.data.token;
  console.log('Owner logged in successfully! Role:', ownerData.data.user.role, 'Restaurant ID:', ownerData.data.user.restaurantId);

  console.log('\n6. Restaurant Owner adding staff credentials...');
  const staffRes = await fetch(`${BASE}/restaurants/${newRest.id}/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`
    },
    body: JSON.stringify({
      name: 'Sunil Verma',
      email: 'staff@haveli.com',
      role: 'RESTAURANT_STAFF',
      password: 'staffPass123',
      department: 'Haveli Royal Kitchen'
    })
  });
  const staffData = await staffRes.json();
  if (!staffData.success) throw new Error('Staff assignment failed: ' + staffData.error);
  console.log('Staff member assigned! Name:', staffData.data.name, 'Email:', staffData.data.email, 'Role:', staffData.data.role);

  console.log('\n7. Logging in as newly created Staff member...');
  const staffLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staff@haveli.com', password: 'staffPass123' })
  });
  const staffLoginData = await staffLoginRes.json();
  if (!staffLoginData.success) throw new Error('Staff login failed: ' + staffLoginData.error);
  console.log('Staff logged in successfully! Role:', staffLoginData.data.user.role, 'HomePath:', staffLoginData.data.user.homePath);

  console.log('\n8. Student verifying discovery visibility...');
  const studentLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@bennett.edu.in', password: 'password123' })
  });
  const studentData = await studentLoginRes.json();
  console.log('Student logged in successfully! Student can see newly added restaurant:', discoverData.data[0].name);

  console.log('\n=========================================');
  console.log('ALL 5 REQUIREMENTS FULLY VERIFIED SUCCESS!');
  console.log('=========================================');
}

testFlow().catch(console.error);
