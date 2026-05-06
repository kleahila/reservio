const router = require('express').Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

const guard = [authMiddleware, roleGuard('HOTEL_ADMIN')];

router.get('/', ...guard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const staff = await db.user.findMany({
      where: { role: { not: 'GUEST' } },
      select: { id: true, fullName: true, email: true, role: true, active: true, createdAt: true },
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', ...guard, async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: 'fullName, email, password, role required' });
  }
  if (!['STAFF', 'HOUSEKEEPER'].includes(role)) {
    return res.status(400).json({ error: 'role must be STAFF or HOUSEKEEPER' });
  }
  const db = getTenantClient(req.tenant.id);
  try {
    const existing = await db.user.findFirst({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { fullName, email, passwordHash, role },
      select: { id: true, fullName: true, email: true, role: true, active: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', ...guard, async (req, res) => {
  const { fullName, role } = req.body;
  if (role && !['STAFF', 'HOUSEKEEPER', 'HOTEL_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { fullName, role },
      select: { id: true, fullName: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/deactivate', ...guard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { active: false },
      select: { id: true, fullName: true, active: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
