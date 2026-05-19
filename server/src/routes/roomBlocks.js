const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

const adminGuard = [authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER')];

router.get('/', ...adminGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const blocks = await db.roomBlock.findMany({
      include: { room: { select: { id: true, type: true, description: true } } },
      orderBy: { startDate: 'asc' },
    });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { roomId, startDate, endDate, reason } = req.body;
  if (!roomId || !startDate || !endDate) return res.status(400).json({ error: 'roomId, startDate, endDate required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const block = await db.roomBlock.create({
      data: { roomId, startDate: new Date(startDate), endDate: new Date(endDate), reason },
      include: { room: { select: { id: true, type: true, description: true } } },
    });
    res.status(201).json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.roomBlock.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
