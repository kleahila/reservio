const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { logActivity } = require('../services/activityLog');

const staffGuard = [authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER', 'RECEPTIONIST')];

router.get('/', ...staffGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const guests = await db.user.findMany({
      where: { role: 'GUEST' },
      select: { id: true, fullName: true, email: true, username: true, blacklisted: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/blacklist', authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER'), async (req, res) => {
  const { reason } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    await db.user.update({ where: { id: req.params.id }, data: { blacklisted: true } });
    const entry = await db.guestBlacklist.create({
      data: { userId: req.params.id, reason: reason || null },
    });
    await logActivity(req.tenant.id, req.user.userId, 'GUEST_BLACKLISTED', 'User', req.params.id, { reason });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/blacklist', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.user.update({ where: { id: req.params.id }, data: { blacklisted: false } });
    await db.guestBlacklist.deleteMany({ where: { userId: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
