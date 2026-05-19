const router = require('express').Router();
const cron = require('node-cron');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient, prisma } = require('../prisma/tenantClient');

// GET — no auth required, tenant header only
router.get('/', async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.parkingSpot.findMany());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { label, pricePerNight } = req.body;
  if (!label || pricePerNight == null) return res.status(400).json({ error: 'label and pricePerNight required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const newSpot = await db.parkingSpot.create({ data: { label, pricePerNight } });
    res.status(201).json(newSpot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.parkingSpot.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/price', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { pricePerNight } = req.body;
  if (pricePerNight == null) return res.status(400).json({ error: 'pricePerNight required' });
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.parkingSpot.update({ where: { id: req.params.id }, data: { pricePerNight } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/price', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { pricePerNight, price } = req.body;
  const p = pricePerNight ?? price;
  if (p == null) return res.status(400).json({ error: 'pricePerNight required' });
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.parkingSpot.update({ where: { id: req.params.id }, data: { pricePerNight: Number(p) } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/lock', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const spot = await db.parkingSpot.findFirst({ where: { id: req.params.id } });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.status === 'TAKEN') return res.status(409).json({ error: 'Spot is taken' });
    if (spot.status === 'LOCKED' && spot.lockedUntil && spot.lockedUntil > new Date()) {
      return res.status(409).json({ error: 'Spot is already locked' });
    }
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    res.json(await db.parkingSpot.update({ where: { id: req.params.id }, data: { status: 'LOCKED', lockedUntil } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/confirm', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const spot = await db.parkingSpot.findFirst({ where: { id: req.params.id } });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.status !== 'LOCKED') return res.status(409).json({ error: 'Spot must be locked first' });
    res.json(await db.parkingSpot.update({ where: { id: req.params.id }, data: { status: 'TAKEN', lockedUntil: null } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/release', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const spot = await db.parkingSpot.findFirst({ where: { id: req.params.id } });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.status !== 'LOCKED') return res.status(409).json({ error: 'Spot is not locked' });
    res.json(await db.parkingSpot.update({ where: { id: req.params.id }, data: { status: 'AVAILABLE', lockedUntil: null } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cron.schedule('* * * * *', async () => {
  try {
    await prisma.parkingSpot.updateMany({
      where: { status: 'LOCKED', lockedUntil: { lt: new Date() } },
      data: { status: 'AVAILABLE', lockedUntil: null },
    });
  } catch (err) {
    console.error('Parking lock cleanup error:', err.message);
  }
});

module.exports = router;
