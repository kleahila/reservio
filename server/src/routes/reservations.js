const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { emit } = require('../socket');

router.get('/', authMiddleware, roleGuard('STAFF', 'HOTEL_ADMIN'), async (req, res) => {
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
    const reservations = await db.reservation.findMany({ where, include: { user: true, room: true } });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservations = await db.reservation.findMany({
      where: { userId: req.user.userId },
      include: { room: true },
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  if (!roomId || !checkIn || !checkOut) return res.status(400).json({ error: 'roomId, checkIn, checkOut required' });

  const db = getTenantClient(req.tenant.id);
  try {
    const overlap = await db.reservation.findFirst({
      where: {
        roomId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lt: new Date(checkOut) },
        checkOut: { gt: new Date(checkIn) },
      },
    });
    if (overlap) return res.status(409).json({ error: 'Room is not available for these dates' });

    const reservation = await db.reservation.create({
      data: { userId: req.user.userId, roomId, checkIn: new Date(checkIn), checkOut: new Date(checkOut) },
    });
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/confirm', authMiddleware, roleGuard('STAFF'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMED' },
    });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CONFIRMED' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/checkin', authMiddleware, roleGuard('STAFF'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CHECKED_IN' },
    });
    await db.room.update({ where: { id: reservation.roomId }, data: { status: 'OCCUPIED' } });
    emit(req.tenant.id, 'reservationUpdated', { reservationId: reservation.id, status: 'CHECKED_IN' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/checkout', authMiddleware, roleGuard('STAFF'), async (req, res) => {
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
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', authMiddleware, roleGuard('GUEST', 'STAFF'), async (req, res) => {
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
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
