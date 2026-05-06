const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { emit } = require('../socket');

router.get('/', authMiddleware, async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const db = getTenantClient(req.tenant.id);

  try {
    let excludedRoomIds = [];
    if (checkIn && checkOut) {
      const overlapping = await db.reservation.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lt: new Date(checkOut) },
          checkOut: { gt: new Date(checkIn) },
        },
        select: { roomId: true },
      });
      excludedRoomIds = overlapping.map((r) => r.roomId);
    }

    const rooms = await db.room.findMany({
      where: excludedRoomIds.length ? { id: { notIn: excludedRoomIds } } : {},
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const room = await db.room.findFirst({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { type, description, pricePerNight, photos = [] } = req.body;
  if (!type || pricePerNight == null) return res.status(400).json({ error: 'type and pricePerNight required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const room = await db.room.create({ data: { type, description, pricePerNight, photos } });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, roleGuard('HOTEL_ADMIN', 'STAFF'), async (req, res) => {
  const { type, description, pricePerNight, photos, status } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    const room = await db.room.update({
      where: { id: req.params.id },
      data: { type, description, pricePerNight, photos, status },
    });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authMiddleware, roleGuard('STAFF', 'HOTEL_ADMIN'), async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const room = await db.room.update({ where: { id: req.params.id }, data: { status } });
    emit(req.tenant.id, 'roomStatusUpdated', { roomId: room.id, status: room.status });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.room.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
