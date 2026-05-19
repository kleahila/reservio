const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

const CLOCK_ROLES = ['STAFF', 'HOUSEKEEPER', 'RECEPTIONIST', 'TECHNICIAN', 'MANAGER'];

router.post('/clockin', authMiddleware, roleGuard(...CLOCK_ROLES), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const open = await db.staffShift.findFirst({
      where: { userId: req.user.userId, tenantId: req.tenant.id, clockOut: null },
    });
    if (open) return res.status(409).json({ error: 'Already clocked in' });
    const shift = await db.staffShift.create({
      data: { tenantId: req.tenant.id, userId: req.user.userId, clockIn: new Date() },
    });
    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clockout', authMiddleware, roleGuard(...CLOCK_ROLES), async (req, res) => {
  const { note } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    const open = await db.staffShift.findFirst({
      where: { userId: req.user.userId, tenantId: req.tenant.id, clockOut: null },
      orderBy: { clockIn: 'desc' },
    });
    if (!open) return res.status(404).json({ error: 'No open shift found' });
    const clockOut = new Date();
    const hoursWorked = (clockOut - open.clockIn) / 3_600_000;
    const shift = await db.staffShift.update({
      where: { id: open.id },
      data: {
        clockOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        note: note || null,
      },
    });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authMiddleware, roleGuard(...CLOCK_ROLES), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const shifts = await db.staffShift.findMany({
      where: { userId: req.user.userId, tenantId: req.tenant.id },
      orderBy: { clockIn: 'desc' },
      take: 100,
    });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER'), async (req, res) => {
  const { from, to } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const where = { tenantId: req.tenant.id };
    if (from || to) {
      where.clockIn = {};
      if (from) where.clockIn.gte = new Date(from);
      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        where.clockIn.lte = endOfDay;
      }
    }
    const shifts = await db.staffShift.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, email: true, role: true, username: true } } },
      orderBy: { clockIn: 'desc' },
    });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
