const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

router.post('/', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const { serviceId, reservationId } = req.body;
  if (!serviceId || !reservationId) return res.status(400).json({ error: 'serviceId and reservationId required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const reservation = await db.reservation.findFirst({ where: { id: reservationId, userId: req.user.userId } });
    if (!reservation) return res.status(403).json({ error: 'Reservation not found or does not belong to you' });
    res.status(201).json(await db.order.create({ data: { userId: req.user.userId, serviceId, reservationId } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.order.findMany({ where: { userId: req.user.userId }, include: { service: true } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, roleGuard('HOTEL_ADMIN', 'STAFF'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.order.findMany({ include: { user: true, service: true, reservation: true } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
