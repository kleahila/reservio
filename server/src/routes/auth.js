const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const { getTenantClient } = require('../prisma/tenantClient');

router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, and password are required' });
  }

  const db = getTenantClient(req.tenant.id);
  try {
    const existing = await db.user.findFirst({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { fullName, email, passwordHash, role: 'GUEST' },
    });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.findFirst({ where: { email, active: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found with that email' });

    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += letters[Math.floor(Math.random() * letters.length)];
    const newPassword = 'reset' + suffix;

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });

    res.json({ message: 'Password reset', newPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const user = await db.user.findFirst({
      where: { id: req.user.userId },
      select: { id: true, fullName: true, email: true, username: true, role: true, tenantId: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
