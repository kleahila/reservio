const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getTenantClient } = require('../prisma/tenantClient');

router.get('/my', authMiddleware, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const logs = await db.activityLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const log = await db.activityLog.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
