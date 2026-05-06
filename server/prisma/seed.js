require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const PHOTOS = [
  'https://picsum.photos/seed/room1/800/600',
  'https://picsum.photos/seed/room2/800/600',
];

function daysFromToday(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  const hash = await bcrypt.hash('password123', SALT_ROUNDS);

  // ── Clear existing data (in dependency order) ─────────────────────────────
  console.log('Clearing existing data...');
  await prisma.housekeepingTask.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sunbedReservation.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.sunbed.deleteMany();
  await prisma.parkingSpot.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } });
  await prisma.tenant.deleteMany();

  // ── Super Admin ───────────────────────────────────────────────────────────
  console.log('Seeding super admin...');
  const existingSuperAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: { fullName: 'Klea Hila', email: 'superadmin@reservio.com', passwordHash: hash, role: 'SUPER_ADMIN' },
    });
  }

  // ── Tenant 1: Grand Tirana ────────────────────────────────────────────────
  console.log('Seeding Grand Tirana...');
  const gt = await prisma.tenant.create({
    data: { name: 'Grand Tirana', subdomain: 'grandtirana', plan: 'PREMIUM', active: true },
  });

  const [gtAdmin, gtStaff, gtHousekeeper, marco, sofia] = await Promise.all([
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Arben Koci',  email: 'admin@grandtirana.com',      passwordHash: hash, role: 'HOTEL_ADMIN' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Mjeda Leka',  email: 'staff@grandtirana.com',      passwordHash: hash, role: 'STAFF' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Besa Hoxha',  email: 'housekeeper@grandtirana.com',passwordHash: hash, role: 'HOUSEKEEPER' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Marco Rossi', email: 'marco@email.com',            passwordHash: hash, role: 'GUEST' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Sofia Müller',email: 'sofia@email.com',            passwordHash: hash, role: 'GUEST' } }),
  ]);

  // Rooms — Grand Tirana
  const gtRooms = await Promise.all([
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard', description: '101', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard', description: '102', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard', description: '103', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard', description: '104', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',   description: '201', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',   description: '202', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',   description: '203', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Suite',    description: '301', pricePerNight: 220, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Suite',    description: '302', pricePerNight: 220, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Penthouse',description: '401', pricePerNight: 380, status: 'AVAILABLE', photos: PHOTOS } }),
  ]);

  const [gt101, gt102, gt103, gt104, gt201, gt202, gt203, gt301, gt302, gt401] = gtRooms;

  // Reservations — Grand Tirana
  const [marcoRes1, sofiaRes, marcoCheckedOut] = await Promise.all([
    prisma.reservation.create({ data: { tenantId: gt.id, userId: marco.id, roomId: gt101.id, checkIn: daysFromToday(1), checkOut: daysFromToday(4),  status: 'CONFIRMED' } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: sofia.id, roomId: gt201.id, checkIn: daysFromToday(0), checkOut: daysFromToday(2),  status: 'CHECKED_IN' } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: marco.id, roomId: gt102.id, checkIn: daysFromToday(-7),checkOut: daysFromToday(-5), status: 'CHECKED_OUT' } }),
  ]);

  // Parking spots — Grand Tirana
  await Promise.all([
    ...['A1','A2','A3','A4','A5'].map(label =>
      prisma.parkingSpot.create({ data: { tenantId: gt.id, label, pricePerNight: 10, status: 'AVAILABLE' } })
    ),
    ...['B1','B2','B3','B4','B5'].map(label =>
      prisma.parkingSpot.create({ data: { tenantId: gt.id, label, pricePerNight: 15, status: 'AVAILABLE' } })
    ),
  ]);

  // Sunbeds — Grand Tirana
  await Promise.all([
    ...['P1','P2','P3','P4','P5','P6','P7','P8'].map(label =>
      prisma.sunbed.create({ data: { tenantId: gt.id, label, zone: 'Pool A', status: 'AVAILABLE' } })
    ),
    ...['P9','P10','P11','P12','P13','P14','P15'].map(label =>
      prisma.sunbed.create({ data: { tenantId: gt.id, label, zone: 'Pool B', status: 'AVAILABLE' } })
    ),
  ]);

  // Services — Grand Tirana
  await Promise.all([
    prisma.service.create({ data: { tenantId: gt.id, name: 'Spa Massage',           category: 'Spa',          price: 60 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Room Service Breakfast', category: 'Room Service', price: 25 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Airport Transfer',       category: 'Transport',    price: 45 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Late Checkout',          category: 'Room Service', price: 30 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Spa Facial',             category: 'Spa',          price: 50 } }),
  ]);

  // Housekeeping tasks — Grand Tirana
  await Promise.all([
    prisma.housekeepingTask.create({ data: { tenantId: gt.id, roomId: gt201.id, priority: 1, urgency: false, status: 'PENDING' } }),
    prisma.housekeepingTask.create({ data: { tenantId: gt.id, roomId: gt102.id, priority: 2, urgency: true,  status: 'PENDING' } }),
  ]);

  // Pricing rule — Grand Tirana
  await prisma.pricingRule.create({
    data: { tenantId: gt.id, occupancyThreshold: 0.8, adjustmentPercent: 20, enabled: true },
  });

  // ── Tenant 2: Hotel Riviera ───────────────────────────────────────────────
  console.log('Seeding Hotel Riviera...');
  const hr = await prisma.tenant.create({
    data: { name: 'Hotel Riviera', subdomain: 'hotelriviera', plan: 'BASIC', active: true },
  });

  const [hrAdmin, hrStaff, hrHousekeeper, james] = await Promise.all([
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Elsa Domi',  email: 'admin@hotelriviera.com',      passwordHash: hash, role: 'HOTEL_ADMIN' } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Gent Marku', email: 'staff@hotelriviera.com',      passwordHash: hash, role: 'STAFF' } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Lira Zeqo',  email: 'housekeeper@hotelriviera.com',passwordHash: hash, role: 'HOUSEKEEPER' } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'James Smith',email: 'james@email.com',             passwordHash: hash, role: 'GUEST' } }),
  ]);

  // Rooms — Hotel Riviera
  const hrRooms = await Promise.all([
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R101', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R102', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R103', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Deluxe',   description: 'R201', pricePerNight: 110, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Deluxe',   description: 'R202', pricePerNight: 110, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Suite',    description: 'R301', pricePerNight: 180, status: 'OCCUPIED',  photos: PHOTOS } }),
  ]);

  const [hrR101, hrR102, hrR103, hrR201, hrR202, hrR301] = hrRooms;

  // Reservations — Hotel Riviera
  await Promise.all([
    prisma.reservation.create({ data: { tenantId: hr.id, userId: james.id, roomId: hrR301.id, checkIn: daysFromToday(0), checkOut: daysFromToday(3), status: 'CHECKED_IN' } }),
    prisma.reservation.create({ data: { tenantId: hr.id, userId: james.id, roomId: hrR201.id, checkIn: daysFromToday(5), checkOut: daysFromToday(8), status: 'CONFIRMED' } }),
  ]);

  // Parking spots — Hotel Riviera
  await Promise.all(
    ['C1','C2','C3','C4'].map(label =>
      prisma.parkingSpot.create({ data: { tenantId: hr.id, label, pricePerNight: 8, status: 'AVAILABLE' } })
    )
  );

  // Sunbeds — Hotel Riviera
  await Promise.all(
    ['T1','T2','T3','T4','T5','T6'].map(label =>
      prisma.sunbed.create({ data: { tenantId: hr.id, label, zone: 'Terrace', status: 'AVAILABLE' } })
    )
  );

  // Services — Hotel Riviera
  await Promise.all([
    prisma.service.create({ data: { tenantId: hr.id, name: 'Room Service Breakfast', category: 'Room Service', price: 20 } }),
    prisma.service.create({ data: { tenantId: hr.id, name: 'Airport Transfer',       category: 'Transport',    price: 40 } }),
  ]);

  // Housekeeping task — Hotel Riviera
  await prisma.housekeepingTask.create({
    data: { tenantId: hr.id, roomId: hrR301.id, priority: 1, urgency: false, status: 'PENDING' },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
