const router = require('express').Router();
const cron = require('node-cron');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient, prisma } = require('../prisma/tenantClient');

router.get('/', authMiddleware, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.sunbed.findMany());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { label, zone } = req.body;
  if (!label || !zone) return res.status(400).json({ error: 'label and zone required' });
  const db = getTenantClient(req.tenant.id);
  try {
    res.status(201).json(await db.sunbed.create({ data: { label, zone } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.sunbed.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/lock', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const sunbed = await db.sunbed.findFirst({ where: { id: req.params.id } });
    if (!sunbed) return res.status(404).json({ error: 'Sunbed not found' });
    if (sunbed.status === 'TAKEN') return res.status(409).json({ error: 'Sunbed is taken' });
    if (sunbed.status === 'LOCKED' && sunbed.lockedUntil && sunbed.lockedUntil > new Date()) {
      return res.status(409).json({ error: 'Sunbed is already locked' });
    }
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    res.json(await db.sunbed.update({ where: { id: req.params.id }, data: { status: 'LOCKED', lockedUntil } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/confirm', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const { date, slot } = req.body;
  if (!date || !slot) return res.status(400).json({ error: 'date and slot required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const sunbed = await db.sunbed.findFirst({ where: { id: req.params.id } });
    if (!sunbed) return res.status(404).json({ error: 'Sunbed not found' });
    if (sunbed.status !== 'LOCKED') return res.status(409).json({ error: 'Sunbed must be locked first' });

    const [updated, sunbedRes] = await Promise.all([
      db.sunbed.update({ where: { id: req.params.id }, data: { status: 'TAKEN', lockedUntil: null } }),
      db.sunbedReservation.create({
        data: { userId: req.user.userId, sunbedId: req.params.id, date: new Date(date), slot },
      }),
    ]);
    res.status(201).json({ sunbed: updated, reservation: sunbedRes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/release', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const sunbed = await db.sunbed.findFirst({ where: { id: req.params.id } });
    if (!sunbed) return res.status(404).json({ error: 'Sunbed not found' });
    if (sunbed.status !== 'LOCKED') return res.status(409).json({ error: 'Sunbed is not locked' });
    res.json(await db.sunbed.update({ where: { id: req.params.id }, data: { status: 'AVAILABLE', lockedUntil: null } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cron.schedule('* * * * *', async () => {
  try {
    await prisma.sunbed.updateMany({
      where: { status: 'LOCKED', lockedUntil: { lt: new Date() } },
      data: { status: 'AVAILABLE', lockedUntil: null },
    });
  } catch (err) {
    console.error('Sunbed lock cleanup error:', err.message);
  }
});

module.exports = router;
