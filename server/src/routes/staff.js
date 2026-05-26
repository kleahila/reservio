const router = require('express').Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { generateUsername } = require('../utils/generateUsername');
const { logActivity } = require('../services/activityLog');

const guard = [authMiddleware, roleGuard('HOTEL_ADMIN')];
const readGuard = [authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER', 'RECEPTIONIST')];
const ALLOWED_ROLES = ['RECEPTIONIST', 'HOUSEKEEPER', 'TECHNICIAN', 'MANAGER', 'STAFF'];

router.get('/', ...readGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const staff = await db.user.findMany({
      where: { role: { notIn: ['GUEST', 'SUPER_ADMIN'] } },
      select: { id: true, fullName: true, email: true, username: true, role: true, active: true, createdAt: true },
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', ...guard, async (req, res) => {
  const { fullName, email, role } = req.body;
  let { password } = req.body;
  if (!fullName || !email || !role) {
    return res.status(400).json({ error: 'fullName, email, role required' });
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${ALLOWED_ROLES.join(', ')}` });
  }
  // Generate a temporary password if the admin didn't supply one.
  // Format: "welcome" + 4 random lowercase letters (numberless, like
  // the forgot-password flow). Returned to the admin so they can share it.
  let generated = false;
  if (!password) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    password = 'welcome' + suffix;
    generated = true;
  }
  const db = getTenantClient(req.tenant.id);
  try {
    const existing = await db.user.findFirst({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // Generate username for staff
    const allUsers = await db.user.findMany({ select: { username: true } });
    const existingUsernames = allUsers.map((u) => u.username).filter(Boolean);
    const username = generateUsername(fullName, existingUsernames);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { fullName, email, passwordHash, role, username },
      select: { id: true, fullName: true, email: true, role: true, active: true, username: true },
    });

    await logActivity(req.tenant.id, req.user.userId, 'STAFF_CREATED', 'User', user.id, { role, username });
    res.status(201).json({ ...user, ...(generated ? { tempPassword: password } : {}) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', ...guard, async (req, res) => {
  const { fullName, email, role } = req.body;
  if (role && !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { fullName, email, role },
      select: { id: true, fullName: true, email: true, role: true, username: true, active: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate: both PUT and PATCH so the frontend's PATCH call reaches it.
async function deactivateHandler(req, res) {
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { active: false },
      select: { id: true, fullName: true, active: true },
    });
    await logActivity(req.tenant.id, req.user.userId, 'STAFF_DEACTIVATED', 'User', req.params.id, { fullName: user.fullName });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
router.route('/:id/deactivate').put(...guard, deactivateHandler).patch(...guard, deactivateHandler);

router.delete('/:id', ...guard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { active: false },
      select: { id: true, fullName: true, active: true },
    });
    await logActivity(req.tenant.id, req.user.userId, 'STAFF_DEACTIVATED', 'User', req.params.id, { fullName: user.fullName });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
