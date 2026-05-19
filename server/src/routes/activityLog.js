const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient, prisma } = require('../prisma/tenantClient');

router.get('/', authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
