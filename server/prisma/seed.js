require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const PHOTOS = [
  'https://picsum.photos/seed/room1/800/600',
  'https://picsum.photos/seed/room2/800/600',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromToday(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pastStay(endDaysAgo) {
  const duration = randomBetween(2, 7);
  const checkOut = daysAgo(endDaysAgo);
  const checkIn  = daysAgo(endDaysAgo + duration);
  return [checkIn, checkOut];
}

function buildSlots(rooms, totalCount, endOffset = 0) {
  const occupied = {};
  rooms.forEach((r) => { occupied[r.id] = []; });

  const slots = [];
  let attempts = 0;

  while (slots.length < totalCount && attempts < totalCount * 20) {
    attempts++;
    const room = pickRandom(rooms);
    const duration = randomBetween(2, 6);
    const startDaysAgo = randomBetween(endOffset + duration, 90 + endOffset);
    const checkIn  = daysAgo(startDaysAgo);
    const checkOut = daysAgo(startDaysAgo - duration);

    const ciMs = checkIn.getTime();
    const coMs = checkOut.getTime();
    const overlaps = occupied[room.id].some(([s, e]) => ciMs < e && coMs > s);
    if (!overlaps) {
      occupied[room.id].push([ciMs, coMs]);
      slots.push({ room, checkIn, checkOut });
    }
  }
  return slots;
}

function buildShifts(userId, tenantId, count, noteChance = 0.3) {
  const shifts = [];
  const daysUsed = new Set();
  const notes = [
    'Room 301 needs extra towels stocked.',
    'VIP guest arriving tomorrow — suite prepared.',
    'Pool area cleaned and restocked.',
    'Maintenance requested for elevator button.',
    'Handover: lost & found item logged at reception.',
    'Breakfast setup completed early.',
    'Checked all fire extinguishers in east wing.',
    'Guest complained about noise in corridor — noted.',
  ];
  let attempts = 0;
  while (shifts.length < count && attempts < count * 10) {
    attempts++;
    const daysBack = randomBetween(1, 89);
    if (daysUsed.has(daysBack)) continue;
    const d = new Date(); d.setDate(d.getDate() - daysBack); d.setSeconds(0, 0);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    daysUsed.add(daysBack);
    const clockIn = new Date(d);
    clockIn.setHours(randomBetween(7, 9), randomBetween(0, 59));
    const hasClockOut = Math.random() > 0.12;
    let clockOut = null;
    let hoursWorked = null;
    let note = null;
    if (hasClockOut) {
      clockOut = new Date(clockIn);
      clockOut.setHours(clockIn.getHours() + randomBetween(7, 10), randomBetween(0, 59));
      hoursWorked = Math.round(((clockOut - clockIn) / 3_600_000) * 100) / 100;
      if (Math.random() < noteChance) note = pickRandom(notes);
    }
    shifts.push({ userId, tenantId, clockIn, clockOut, hoursWorked, note });
  }
  return shifts;
}

function generateUsername(fullName, existingUsernames) {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const firstName = parts[0] || 'user';
  const lastName = parts.slice(1).join('') || 'user';
  const existing = new Set(existingUsernames.map((u) => u.toLowerCase()));

  for (let fnLen = 1; fnLen <= firstName.length; fnLen++) {
    const candidate = firstName.slice(0, fnLen) + lastName.slice(0, 4);
    if (!existing.has(candidate)) return candidate;
  }
  for (let lnLen = 5; lnLen <= lastName.length; lnLen++) {
    const candidate = firstName.slice(0, 1) + lastName.slice(0, lnLen);
    if (!existing.has(candidate)) return candidate;
  }
  return firstName + lastName;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const hash = await bcrypt.hash('password123', SALT_ROUNDS);

  // ── Clear existing data ─────────────────────────────────────────────────────
  console.log('Clearing existing data…');
  await prisma.activityLog.deleteMany();
  await prisma.guestBlacklist.deleteMany();
  await prisma.roomBlock.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.roomReview.deleteMany();
  await prisma.staffShift.deleteMany();
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

  // ── Super Admin ─────────────────────────────────────────────────────────────
  console.log('Seeding super admin…');
  const existingSA = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!existingSA) {
    await prisma.user.create({
      data: { fullName: 'Klea Hila', email: 'superadmin@reservio.com', passwordHash: hash, role: 'SUPER_ADMIN' },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Tenant 1: Grand Tirana (PREMIUM)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('Seeding Grand Tirana…');
  const gt = await prisma.tenant.create({
    data: { name: 'Grand Tirana', subdomain: 'grandtirana', plan: 'PREMIUM', active: true },
  });

  const usernameTracker = [];
  function nextUsername(name) {
    const u = generateUsername(name, usernameTracker);
    usernameTracker.push(u);
    return u;
  }

  const [gtAdmin, gtStaff, gtHousekeeper, gtTechnician, gtManager, marco, sofia, anna, leon] = await Promise.all([
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Arben Koci',   email: 'admin@grandtirana.com',      passwordHash: hash, role: 'HOTEL_ADMIN',   username: nextUsername('Arben Koci') } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Mjeda Leka',   email: 'staff@grandtirana.com',      passwordHash: hash, role: 'RECEPTIONIST',  username: nextUsername('Mjeda Leka') } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Besa Hoxha',   email: 'housekeeper@grandtirana.com',passwordHash: hash, role: 'HOUSEKEEPER',   username: nextUsername('Besa Hoxha') } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Drin Kelmendi',email: 'technician@grandtirana.com', passwordHash: hash, role: 'TECHNICIAN',    username: nextUsername('Drin Kelmendi') } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Elira Shala',  email: 'manager@grandtirana.com',   passwordHash: hash, role: 'MANAGER',       username: nextUsername('Elira Shala') } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Marco Rossi',  email: 'marco@email.com',            passwordHash: hash, role: 'GUEST' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Sofia Müller', email: 'sofia@email.com',            passwordHash: hash, role: 'GUEST' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Anna Petrov',  email: 'anna@email.com',             passwordHash: hash, role: 'GUEST' } }),
    prisma.user.create({ data: { tenantId: gt.id, fullName: 'Leon Dubois',  email: 'leon@email.com',             passwordHash: hash, role: 'GUEST' } }),
  ]);

  // Rooms — Grand Tirana (10 rooms across 4 floors)
  const gtRooms = await Promise.all([
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard',  description: '101', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard',  description: '102', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard',  description: '103', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Standard',  description: '104', pricePerNight: 80,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',    description: '201', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',    description: '202', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Deluxe',    description: '203', pricePerNight: 140, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Suite',     description: '301', pricePerNight: 220, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Suite',     description: '302', pricePerNight: 220, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: gt.id, type: 'Penthouse', description: '401', pricePerNight: 380, status: 'AVAILABLE', photos: PHOTOS } }),
  ]);

  // 60 reservations spread over 3 months
  const gtGuests = [marco, sofia, anna, leon];
  const STATUSES_PAST = ['CONFIRMED', 'CHECKED_OUT', 'CHECKED_OUT', 'CANCELLED'];
  const gtSlots = buildSlots(gtRooms, 60);

  const gtReservations = [];
  for (const { room, checkIn, checkOut } of gtSlots) {
    const user   = pickRandom(gtGuests);
    const isPast = checkOut < new Date();
    const status = isPast ? pickRandom(STATUSES_PAST) : pickRandom(['CONFIRMED', 'CHECKED_IN']);
    const addBreakfast = Math.random() < 0.2;
    const res = await prisma.reservation.create({
      data: {
        tenantId: gt.id,
        userId: user.id,
        roomId: room.id,
        checkIn,
        checkOut,
        status,
        breakfastIncluded: addBreakfast,
        breakfastPrice: addBreakfast ? 15 : null,
      },
    });
    gtReservations.push(res);
  }

  // Extra: 4 CHECKED_IN (current) + 6 CONFIRMED (upcoming) — Grand Tirana
  console.log('Seeding Grand Tirana extra active/upcoming reservations…');
  const gtExtraRes = await Promise.all([
    prisma.reservation.create({ data: { tenantId: gt.id, userId: marco.id, roomId: gtRooms[0].id, checkIn: daysAgo(2),        checkOut: daysFromToday(3),  status: 'CHECKED_IN', breakfastIncluded: true,  breakfastPrice: 15   } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: sofia.id, roomId: gtRooms[4].id, checkIn: daysAgo(1),        checkOut: daysFromToday(4),  status: 'CHECKED_IN', breakfastIncluded: false, breakfastPrice: null } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: anna.id,  roomId: gtRooms[8].id, checkIn: daysAgo(3),        checkOut: daysFromToday(2),  status: 'CHECKED_IN', breakfastIncluded: true,  breakfastPrice: 15   } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: marco.id, roomId: gtRooms[9].id, checkIn: daysAgo(1),        checkOut: daysFromToday(5),  status: 'CHECKED_IN', breakfastIncluded: false, breakfastPrice: null } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: sofia.id, roomId: gtRooms[1].id, checkIn: daysFromToday(3),  checkOut: daysFromToday(7),  status: 'CONFIRMED',  breakfastIncluded: false, breakfastPrice: null } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: anna.id,  roomId: gtRooms[2].id, checkIn: daysFromToday(5),  checkOut: daysFromToday(9),  status: 'CONFIRMED',  breakfastIncluded: true,  breakfastPrice: 15   } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: marco.id, roomId: gtRooms[5].id, checkIn: daysFromToday(7),  checkOut: daysFromToday(11), status: 'CONFIRMED',  breakfastIncluded: false, breakfastPrice: null } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: sofia.id, roomId: gtRooms[6].id, checkIn: daysFromToday(10), checkOut: daysFromToday(14), status: 'CONFIRMED',  breakfastIncluded: true,  breakfastPrice: 15   } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: anna.id,  roomId: gtRooms[3].id, checkIn: daysFromToday(14), checkOut: daysFromToday(18), status: 'CONFIRMED',  breakfastIncluded: false, breakfastPrice: null } }),
    prisma.reservation.create({ data: { tenantId: gt.id, userId: sofia.id, roomId: gtRooms[8].id, checkIn: daysFromToday(20), checkOut: daysFromToday(24), status: 'CONFIRMED',  breakfastIncluded: false, breakfastPrice: null } }),
  ]);
  gtReservations.push(...gtExtraRes);

  // Services — Grand Tirana
  const gtServices = await Promise.all([
    prisma.service.create({ data: { tenantId: gt.id, name: 'Spa Massage',            category: 'Spa',          price: 60 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Room Service Breakfast', category: 'Room Service', price: 25 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Airport Transfer',       category: 'Transport',    price: 45 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Late Checkout',          category: 'Room Service', price: 45 } }),
    prisma.service.create({ data: { tenantId: gt.id, name: 'Spa Facial',             category: 'Spa',          price: 50 } }),
  ]);

  // 40 service orders
  const eligibleGtRes = gtReservations.filter((r) => r.status !== 'CANCELLED');
  for (let i = 0; i < 40 && i < eligibleGtRes.length; i++) {
    const res = eligibleGtRes[i % eligibleGtRes.length];
    await prisma.order.create({
      data: { tenantId: gt.id, userId: res.userId, serviceId: pickRandom(gtServices).id, reservationId: res.id },
    });
  }

  // Parking spots — Grand Tirana
  const gtParkingSpots = await Promise.all([
    ...['A1', 'A2', 'A3', 'A4', 'A5'].map((label) =>
      prisma.parkingSpot.create({ data: { tenantId: gt.id, label, pricePerNight: 10, status: 'AVAILABLE' } })
    ),
    ...['B1', 'B2', 'B3', 'B4', 'B5'].map((label) =>
      prisma.parkingSpot.create({ data: { tenantId: gt.id, label, pricePerNight: 15, status: 'AVAILABLE' } })
    ),
  ]);

  for (let i = 0; i < 3; i++) {
    const spot = gtParkingSpots[randomBetween(0, gtParkingSpots.length - 1)];
    await prisma.parkingSpot.update({ where: { id: spot.id }, data: { status: 'TAKEN' } });
  }

  // Sunbeds — Grand Tirana
  const gtSunbeds = await Promise.all([
    ...['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'].map((label) =>
      prisma.sunbed.create({ data: { tenantId: gt.id, label, zone: 'Pool A', status: 'AVAILABLE' } })
    ),
    ...['P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15'].map((label) =>
      prisma.sunbed.create({ data: { tenantId: gt.id, label, zone: 'Pool B', status: 'AVAILABLE' } })
    ),
  ]);

  // 20 sunbed reservations
  const SLOT_VALS = ['MORNING', 'AFTERNOON', 'FULL_DAY'];
  for (let i = 0; i < 20; i++) {
    const sunbed = pickRandom(gtSunbeds);
    const daysBack = randomBetween(1, 89);
    const date = daysAgo(daysBack);
    date.setHours(0, 0, 0, 0);
    const guest = pickRandom(gtGuests);
    try {
      await prisma.sunbedReservation.create({
        data: { tenantId: gt.id, userId: guest.id, sunbedId: sunbed.id, date, slot: pickRandom(SLOT_VALS) },
      });
    } catch { /* ignore duplicate */ }
  }

  // 15 housekeeping tasks
  for (let i = 0; i < 15; i++) {
    const room = pickRandom(gtRooms);
    await prisma.housekeepingTask.create({
      data: {
        tenantId: gt.id,
        roomId: room.id,
        priority: randomBetween(1, 3),
        urgency: Math.random() > 0.7,
        status: Math.random() > 0.5 ? 'DONE' : 'PENDING',
        assignedTo: Math.random() > 0.4 ? gtHousekeeper.id : null,
      },
    });
  }

  // Pricing rule — Grand Tirana
  await prisma.pricingRule.create({
    data: { tenantId: gt.id, occupancyThreshold: 0.8, adjustmentPercent: 20, enabled: true },
  });

  // 45 staff shifts — Grand Tirana
  console.log('Seeding Grand Tirana shifts…');
  const gtShiftData = [
    ...buildShifts(gtStaff.id, gt.id, 15),
    ...buildShifts(gtHousekeeper.id, gt.id, 15),
    ...buildShifts(gtTechnician.id, gt.id, 8),
    ...buildShifts(gtManager.id, gt.id, 7),
  ];
  await prisma.staffShift.createMany({ data: gtShiftData });

  // 5 RoomReviews — Grand Tirana
  console.log('Seeding Grand Tirana reviews…');
  const checkedOutGtRes = gtReservations.filter((r) => r.status === 'CHECKED_OUT');
  const reviewComments = [
    'Excellent stay! The room was spotless and the view was breathtaking.',
    'Great location and friendly staff. The breakfast was delicious.',
    'Room was comfortable but the AC was a bit noisy.',
    'Fantastic experience from check-in to check-out. Highly recommended.',
    'Nice hotel overall. The pool area is beautiful.',
  ];
  const reviewRatings = [5, 4, 3, 5, 4];
  const reviewedRoomIds = new Set();
  let reviewCount = 0;
  for (let i = 0; i < checkedOutGtRes.length && reviewCount < 5; i++) {
    const res = checkedOutGtRes[i];
    if (reviewedRoomIds.has(res.roomId)) continue;
    reviewedRoomIds.add(res.roomId);
    const rating = reviewRatings[reviewCount];
    await prisma.roomReview.create({
      data: {
        tenantId: gt.id,
        roomId: res.roomId,
        userId: res.userId,
        rating,
        comment: reviewComments[reviewCount],
        createdAt: daysAgo(randomBetween(1, 30)),
      },
    });
    await prisma.room.update({ where: { id: res.roomId }, data: { averageRating: rating } });
    reviewCount++;
  }

  // 3 MaintenanceRequests — Grand Tirana
  console.log('Seeding Grand Tirana maintenance…');
  const [gtMaint1, gtMaint2, gtMaint3] = await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        tenantId: gt.id,
        roomId: gtRooms[0].id,
        reportedById: gtStaff.id,
        issue: 'Light fixture flickering in bathroom',
        category: 'LIGHTS',
        status: 'OPEN',
        createdAt: daysAgo(3),
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        tenantId: gt.id,
        roomId: gtRooms[4].id,
        reportedById: gtStaff.id,
        assignedToId: gtTechnician.id,
        issue: 'Shower drain blocked — slow drainage',
        category: 'PLUMBING',
        status: 'IN_PROGRESS',
        createdAt: daysAgo(7),
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        tenantId: gt.id,
        roomId: gtRooms[7].id,
        reportedById: gtHousekeeper.id,
        assignedToId: gtTechnician.id,
        issue: 'Deep carpet cleaning required after checkout',
        category: 'CLEANING',
        status: 'RESOLVED',
        createdAt: daysAgo(14),
        resolvedAt: daysAgo(12),
      },
    }),
  ]);

  // 1 RoomBlock — Grand Tirana (room 301 = gtRooms[7])
  console.log('Seeding Grand Tirana room block…');
  await prisma.roomBlock.create({
    data: {
      tenantId: gt.id,
      roomId: gtRooms[7].id,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
      reason: 'Renovation',
      createdAt: new Date(),
    },
  });

  // 2 GuestBlacklist — Grand Tirana
  console.log('Seeding Grand Tirana blacklist…');
  await prisma.guestBlacklist.create({
    data: {
      tenantId: gt.id,
      userId: leon.id,
      reason: 'Property damage during stay — broken window in room 203',
      createdAt: daysAgo(15),
    },
  });
  await prisma.user.update({ where: { id: leon.id }, data: { blacklisted: true } });

  // 10 ActivityLog entries — Grand Tirana
  console.log('Seeding Grand Tirana activity logs…');
  const gtActivityEntries = [
    { tenantId: gt.id, userId: gtAdmin.id, action: 'ROOM_STATUS_CHANGED', entity: 'Room', entityId: gtRooms[0].id, metadata: JSON.stringify({ status: 'MAINTENANCE' }), createdAt: daysAgo(8) },
    { tenantId: gt.id, userId: gtStaff.id, action: 'RESERVATION_CONFIRMED', entity: 'Reservation', entityId: gtReservations[0]?.id, metadata: null, createdAt: daysAgo(7) },
    { tenantId: gt.id, userId: gtStaff.id, action: 'RESERVATION_CHECKED_IN', entity: 'Reservation', entityId: gtReservations[1]?.id, metadata: null, createdAt: daysAgo(6) },
    { tenantId: gt.id, userId: gtStaff.id, action: 'RESERVATION_CHECKED_OUT', entity: 'Reservation', entityId: gtReservations[2]?.id, metadata: null, createdAt: daysAgo(5) },
    { tenantId: gt.id, userId: gtHousekeeper.id, action: 'ROOM_CLEANED', entity: 'HousekeepingTask', entityId: null, metadata: JSON.stringify({ roomId: gtRooms[3].id }), createdAt: daysAgo(5) },
    { tenantId: gt.id, userId: gtAdmin.id, action: 'STAFF_CREATED', entity: 'User', entityId: gtTechnician.id, metadata: JSON.stringify({ role: 'TECHNICIAN' }), createdAt: daysAgo(30) },
    { tenantId: gt.id, userId: gtAdmin.id, action: 'GUEST_BLACKLISTED', entity: 'User', entityId: leon.id, metadata: JSON.stringify({ reason: 'Property damage' }), createdAt: daysAgo(15) },
    { tenantId: gt.id, userId: gtStaff.id, action: 'MAINTENANCE_CREATED', entity: 'MaintenanceRequest', entityId: gtMaint1.id, metadata: JSON.stringify({ issue: 'Light fixture' }), createdAt: daysAgo(3) },
    { tenantId: gt.id, userId: gtTechnician.id, action: 'MAINTENANCE_RESOLVED', entity: 'MaintenanceRequest', entityId: gtMaint3.id, metadata: null, createdAt: daysAgo(12) },
    { tenantId: gt.id, userId: gtAdmin.id, action: 'PRICING_RULE_CHANGED', entity: 'PricingRule', entityId: null, metadata: JSON.stringify({ threshold: 0.8, adjustment: 20 }), createdAt: daysAgo(45) },
  ];
  await prisma.activityLog.createMany({ data: gtActivityEntries });

  // ═══════════════════════════════════════════════════════════════════════════
  // Tenant 2: Hotel Riviera (BASIC)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('Seeding Hotel Riviera…');
  const hr = await prisma.tenant.create({
    data: { name: 'Hotel Riviera', subdomain: 'hotelriviera', plan: 'BASIC', active: true },
  });

  const hrUsernameTracker = [];
  function hrUsername(name) {
    const u = generateUsername(name, hrUsernameTracker);
    hrUsernameTracker.push(u);
    return u;
  }

  const [hrAdmin, hrStaff, hrHousekeeper, james, claire] = await Promise.all([
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Elsa Domi',    email: 'admin@hotelriviera.com',      passwordHash: hash, role: 'HOTEL_ADMIN',  username: hrUsername('Elsa Domi') } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Gent Marku',   email: 'staff@hotelriviera.com',      passwordHash: hash, role: 'RECEPTIONIST', username: hrUsername('Gent Marku') } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Lira Zeqo',    email: 'housekeeper@hotelriviera.com',passwordHash: hash, role: 'HOUSEKEEPER',  username: hrUsername('Lira Zeqo') } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'James Smith',  email: 'james@email.com',             passwordHash: hash, role: 'GUEST' } }),
    prisma.user.create({ data: { tenantId: hr.id, fullName: 'Claire Bonnet',email: 'claire@email.com',            passwordHash: hash, role: 'GUEST' } }),
  ]);

  // Rooms — Hotel Riviera (6 rooms)
  const hrRooms = await Promise.all([
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R101', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R102', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Standard', description: 'R103', pricePerNight: 65,  status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Deluxe',   description: 'R201', pricePerNight: 110, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Deluxe',   description: 'R202', pricePerNight: 110, status: 'AVAILABLE', photos: PHOTOS } }),
    prisma.room.create({ data: { tenantId: hr.id, type: 'Suite',    description: 'R301', pricePerNight: 180, status: 'AVAILABLE', photos: PHOTOS } }),
  ]);

  // 25 reservations — Hotel Riviera
  const hrGuests = [james, claire];
  const hrSlots  = buildSlots(hrRooms, 25);
  const hrReservations = [];
  for (const { room, checkIn, checkOut } of hrSlots) {
    const user   = pickRandom(hrGuests);
    const isPast = checkOut < new Date();
    const status = isPast ? pickRandom(STATUSES_PAST) : pickRandom(['CONFIRMED', 'CHECKED_IN']);
    const addBreakfast = Math.random() < 0.2;
    const res = await prisma.reservation.create({
      data: {
        tenantId: hr.id,
        userId: user.id,
        roomId: room.id,
        checkIn,
        checkOut,
        status,
        breakfastIncluded: addBreakfast,
        breakfastPrice: addBreakfast ? 15 : null,
      },
    });
    hrReservations.push(res);
  }

  // Services — Hotel Riviera
  const hrServices = await Promise.all([
    prisma.service.create({ data: { tenantId: hr.id, name: 'Room Service Breakfast', category: 'Room Service', price: 20 } }),
    prisma.service.create({ data: { tenantId: hr.id, name: 'Airport Transfer',       category: 'Transport',    price: 40 } }),
    prisma.service.create({ data: { tenantId: hr.id, name: 'Late Checkout',          category: 'Room Service', price: 45 } }),
  ]);

  // 15 service orders — Hotel Riviera
  const eligibleHrRes = hrReservations.filter((r) => r.status !== 'CANCELLED');
  for (let i = 0; i < 15 && i < eligibleHrRes.length; i++) {
    const res = eligibleHrRes[i % eligibleHrRes.length];
    await prisma.order.create({
      data: { tenantId: hr.id, userId: res.userId, serviceId: pickRandom(hrServices).id, reservationId: res.id },
    });
  }

  // Parking spots — Hotel Riviera
  const hrParkingSpots = await Promise.all(
    ['C1', 'C2', 'C3', 'C4'].map((label) =>
      prisma.parkingSpot.create({ data: { tenantId: hr.id, label, pricePerNight: 8, status: 'AVAILABLE' } })
    )
  );
  await prisma.parkingSpot.update({ where: { id: hrParkingSpots[0].id }, data: { status: 'TAKEN' } });

  // Sunbeds — Hotel Riviera
  const hrSunbeds = await Promise.all(
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((label) =>
      prisma.sunbed.create({ data: { tenantId: hr.id, label, zone: 'Terrace', status: 'AVAILABLE' } })
    )
  );

  // 10 sunbed reservations — Hotel Riviera
  for (let i = 0; i < 10; i++) {
    const sunbed = pickRandom(hrSunbeds);
    const daysBack = randomBetween(1, 89);
    const date = daysAgo(daysBack);
    date.setHours(0, 0, 0, 0);
    const guest = pickRandom(hrGuests);
    try {
      await prisma.sunbedReservation.create({
        data: { tenantId: hr.id, userId: guest.id, sunbedId: sunbed.id, date, slot: pickRandom(SLOT_VALS) },
      });
    } catch { /* ignore */ }
  }

  // 8 housekeeping tasks — Hotel Riviera
  for (let i = 0; i < 8; i++) {
    const room = pickRandom(hrRooms);
    await prisma.housekeepingTask.create({
      data: {
        tenantId: hr.id,
        roomId: room.id,
        priority: randomBetween(1, 3),
        urgency: Math.random() > 0.7,
        status: Math.random() > 0.5 ? 'DONE' : 'PENDING',
        assignedTo: Math.random() > 0.4 ? hrHousekeeper.id : null,
      },
    });
  }

  // 2 MaintenanceRequests — Hotel Riviera
  console.log('Seeding Hotel Riviera maintenance…');
  await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        tenantId: hr.id,
        roomId: hrRooms[0].id,
        reportedById: hrStaff.id,
        issue: 'TV remote not working',
        category: 'OTHER',
        status: 'OPEN',
        createdAt: daysAgo(2),
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        tenantId: hr.id,
        roomId: hrRooms[3].id,
        reportedById: hrHousekeeper.id,
        issue: 'Tap leaking in bathroom sink',
        category: 'PLUMBING',
        status: 'IN_PROGRESS',
        createdAt: daysAgo(5),
      },
    }),
  ]);

  // 1 GuestBlacklist — Hotel Riviera
  console.log('Seeding Hotel Riviera blacklist…');
  await prisma.guestBlacklist.create({
    data: {
      tenantId: hr.id,
      userId: claire.id,
      reason: 'No-show on three consecutive reservations without cancellation',
      createdAt: daysAgo(20),
    },
  });
  await prisma.user.update({ where: { id: claire.id }, data: { blacklisted: true } });

  // 20 staff shifts — Hotel Riviera
  console.log('Seeding Hotel Riviera shifts…');
  const hrShiftData = [
    ...buildShifts(hrStaff.id, hr.id, 10),
    ...buildShifts(hrHousekeeper.id, hr.id, 10),
  ];
  await prisma.staffShift.createMany({ data: hrShiftData });

  // 10 ActivityLog entries — Hotel Riviera
  console.log('Seeding Hotel Riviera activity logs…');
  const hrActivityEntries = [
    { tenantId: hr.id, userId: hrAdmin.id, action: 'ROOM_STATUS_CHANGED', entity: 'Room', entityId: hrRooms[0].id, metadata: JSON.stringify({ status: 'MAINTENANCE' }), createdAt: daysAgo(10) },
    { tenantId: hr.id, userId: hrStaff.id, action: 'RESERVATION_CONFIRMED', entity: 'Reservation', entityId: hrReservations[0]?.id, metadata: null, createdAt: daysAgo(9) },
    { tenantId: hr.id, userId: hrStaff.id, action: 'RESERVATION_CHECKED_IN', entity: 'Reservation', entityId: hrReservations[1]?.id, metadata: null, createdAt: daysAgo(8) },
    { tenantId: hr.id, userId: hrStaff.id, action: 'RESERVATION_CHECKED_OUT', entity: 'Reservation', entityId: hrReservations[2]?.id, metadata: null, createdAt: daysAgo(7) },
    { tenantId: hr.id, userId: hrHousekeeper.id, action: 'ROOM_CLEANED', entity: 'HousekeepingTask', entityId: null, metadata: JSON.stringify({ roomId: hrRooms[0].id }), createdAt: daysAgo(7) },
    { tenantId: hr.id, userId: hrAdmin.id, action: 'STAFF_CREATED', entity: 'User', entityId: hrHousekeeper.id, metadata: JSON.stringify({ role: 'HOUSEKEEPER' }), createdAt: daysAgo(60) },
    { tenantId: hr.id, userId: hrAdmin.id, action: 'GUEST_BLACKLISTED', entity: 'User', entityId: claire.id, metadata: JSON.stringify({ reason: 'No-show' }), createdAt: daysAgo(20) },
    { tenantId: hr.id, userId: hrStaff.id, action: 'MAINTENANCE_CREATED', entity: 'MaintenanceRequest', entityId: null, metadata: JSON.stringify({ issue: 'TV remote' }), createdAt: daysAgo(2) },
    { tenantId: hr.id, userId: hrAdmin.id, action: 'RESERVATION_CANCELLED', entity: 'Reservation', entityId: hrReservations[3]?.id, metadata: null, createdAt: daysAgo(4) },
    { tenantId: hr.id, userId: hrAdmin.id, action: 'PRICING_RULE_CHANGED', entity: 'PricingRule', entityId: null, metadata: JSON.stringify({ note: 'Manual pricing update' }), createdAt: daysAgo(30) },
  ];
  await prisma.activityLog.createMany({ data: hrActivityEntries });

  // ── Summary ──────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.room.count(),
    prisma.reservation.count(),
    prisma.order.count(),
    prisma.parkingSpot.count(),
    prisma.sunbed.count(),
    prisma.sunbedReservation.count(),
    prisma.housekeepingTask.count(),
    prisma.staffShift.count(),
    prisma.roomReview.count(),
    prisma.maintenanceRequest.count(),
    prisma.roomBlock.count(),
    prisma.guestBlacklist.count(),
    prisma.activityLog.count(),
  ]);

  const labels = ['Tenants', 'Users', 'Rooms', 'Reservations', 'Orders', 'ParkingSpots', 'Sunbeds', 'SunbedReservations', 'HousekeepingTasks', 'StaffShifts', 'RoomReviews', 'MaintenanceRequests', 'RoomBlocks', 'GuestBlacklists', 'ActivityLogs'];
  console.log('\nSeed complete:');
  labels.forEach((l, i) => console.log(`  ${l}: ${counts[i]}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
