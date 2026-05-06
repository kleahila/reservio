const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

router.get('/', authMiddleware, async (req, res) => {
  const { category } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const where = category ? { category } : {};
    res.json(await db.service.findMany({ where }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || price == null) return res.status(400).json({ error: 'name, category, price required' });
  const db = getTenantClient(req.tenant.id);
  try {
    res.status(201).json(await db.service.create({ data: { name, category, price } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const { name, category, price } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.service.update({ where: { id: req.params.id }, data: { name, category, price } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, roleGuard('HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
