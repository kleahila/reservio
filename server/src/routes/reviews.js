const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');

router.post('/', authMiddleware, roleGuard('GUEST'), async (req, res) => {
  const { roomId, rating, comment } = req.body;
  if (!roomId || !rating) return res.status(400).json({ error: 'roomId and rating required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

  const db = getTenantClient(req.tenant.id);
  try {
    const checkedOut = await db.reservation.findFirst({
      where: { roomId, userId: req.user.userId, status: 'CHECKED_OUT' },
    });
    if (!checkedOut) return res.status(403).json({ error: 'No completed stay found for this room' });

    const review = await db.roomReview.create({
      data: { roomId, userId: req.user.userId, rating: parseInt(rating), comment: comment || null },
    });

    // Recalculate average rating
    const agg = await db.roomReview.findMany({ where: { roomId }, select: { rating: true } });
    const avg = agg.reduce((s, r) => s + r.rating, 0) / agg.length;
    await db.room.update({ where: { id: roomId }, data: { averageRating: Math.round(avg * 10) / 10 } });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/room/:roomId', async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reviews = await db.roomReview.findMany({
      where: { roomId: req.params.roomId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    res.json({ reviews, averageRating: avg ? Math.round(avg * 10) / 10 : null, count: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const reviews = await db.roomReview.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        room: { select: { type: true, description: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
