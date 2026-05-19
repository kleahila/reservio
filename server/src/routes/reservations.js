const router = require('express').Router();
const { randomUUID } = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { emit } = require('../socket');
const { logActivity } = require('../services/activityLog');

const STAFF_ROLES = ['STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'];

router.get('/', authMiddleware, roleGuard('STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = new Date(startDate);
      if (endDate) where.checkIn.lte = new Date(endDate);
    }
    const reservations = await db.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, username: true } },
        room: { select: { id: true, type: true, description: true } },
      },
      orderBy: { checkIn: 'desc' },
    });
    const shaped = reservations.map((r) => ({
      ...r,
      guest: { fullName: r.user?.fullName, username: r.user?.username, email: r.user?.email },
      room: { type: r.room?.type, number: r.room?.description, id: r.room?.id },
    }));
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservations = await db.reservation.findMany({
      where: { userId: req.user.userId },
      include: {
        room: { select: { id: true, type: true, description: true } },
        orders: { include: { service: true } },
      },
      orderBy: { checkIn: 'desc' },
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const { roomId, roomIds, checkIn, checkOut, breakfastIncluded = false, breakfastPrice } = req.body;

  const targetRoomIds = roomIds?.length ? roomIds : (roomId ? [roomId] : []);
  if (!targetRoomIds.length || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'roomId (or roomIds), checkIn, checkOut required' });
  }

  const db = getTenantClient(req.tenant.id);
  try {
    // Check if guest is blacklisted
    const guestUser = await db.user.findFirst({ where: { id: req.user.userId }, select: { blacklisted: true } });
    if (guestUser?.blacklisted) {
      return res.status(403).json({ error: 'Guest account is restricted from making reservations' });
    }

    const groupId = targetRoomIds.length > 1 ? randomUUID() : null;
    const created = [];

    for (const rid of targetRoomIds) {
      // Check active reservation overlap
      const overlap = await db.reservation.findFirst({
        where: {
          roomId: rid,
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lt: new Date(checkOut) },
          checkOut: { gt: new Date(checkIn) },
        },
      });
      if (overlap) return res.status(409).json({ error: `Room is not available for these dates` });

      // Check room blocks
      const blocked = await db.roomBlock.findFirst({
        where: {
          roomId: rid,
          startDate: { lt: new Date(checkOut) },
          endDate: { gt: new Date(checkIn) },
        },
      });
      if (blocked) return res.status(409).json({ error: `Room is blocked for these dates: ${blocked.reason || 'unavailable'}` });

      const reservation = await db.reservation.create({
        data: {
          userId: req.user.userId,
          roomId: rid,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          groupId,
          breakfastIncluded: !!breakfastIncluded,
          breakfastPrice: breakfastIncluded ? (breakfastPrice ?? 15) : null,
        },
      });
      created.push(reservation);
      await logActivity(req.tenant.id, req.user.userId, 'RESERVATION_CREATED', 'Reservation', reservation.id, { roomId: rid });
    }

    res.status(201).json(created.length === 1 ? created[0] : created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/confirm', authMiddleware, roleGuard('STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMED' },
    });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CONFIRMED' });
    await logActivity(req.tenant.id, req.user.userId, 'RESERVATION_CONFIRMED', 'Reservation', reservation.id, {});
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/checkin', authMiddleware, roleGuard('STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CHECKED_IN' },
    });
    await db.room.update({ where: { id: reservation.roomId }, data: { status: 'OCCUPIED' } });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CHECKED_IN' });
    await logActivity(req.tenant.id, req.user.userId, 'RESERVATION_CHECKED_IN', 'Reservation', reservation.id, { roomId: reservation.roomId });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/checkout', authMiddleware, roleGuard('STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CHECKED_OUT' },
    });
    await db.room.update({ where: { id: reservation.roomId }, data: { status: 'AVAILABLE' } });
    await db.housekeepingTask.create({
      data: { roomId: reservation.roomId, priority: 1, urgency: false },
    });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CHECKED_OUT' });
    await logActivity(req.tenant.id, req.user.userId, 'RESERVATION_CHECKED_OUT', 'Reservation', reservation.id, { roomId: reservation.roomId });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', authMiddleware, roleGuard('GUEST', 'STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const existing = await db.reservation.findFirst({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Reservation not found' });
    if (req.user.role === 'GUEST' && existing.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Cannot cancel another guest\'s reservation' });
    }
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CANCELLED' });
    await logActivity(req.tenant.id, req.user.userId, 'RESERVATION_CANCELLED', 'Reservation', reservation.id, {});
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
