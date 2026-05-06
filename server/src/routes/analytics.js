const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const featureGate = require('../middleware/featureGate');
const { getTenantClient } = require('../prisma/tenantClient');

const guard = [authMiddleware, featureGate('PREMIUM'), roleGuard('HOTEL_ADMIN')];

router.get('/summary', ...guard, async (req, res) => {
  const { startDate, endDate } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const where = Object.keys(dateFilter).length ? { checkIn: dateFilter } : {};

    const totalBookings = await db.reservation.count({ where });

    const revenueReservations = await db.reservation.findMany({
      where: { ...where, status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] } },
      include: { room: true },
    });

    const dailyRevenue = revenueReservations.reduce((sum, r) => {
      const nights = Math.ceil((new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60 * 24));
      return sum + r.room.pricePerNight * nights;
    }, 0);

    const totalRooms = await db.room.count();
    const checkedInRooms = await db.room.count({ where: { status: 'OCCUPIED' } });
    const occupancyPercent = totalRooms > 0 ? (checkedInRooms / totalRooms) * 100 : 0;

    res.json({
      totalBookings,
      dailyRevenue,
      occupancyPercent: parseFloat(occupancyPercent.toFixed(2)),
      exportUrl: '/api/analytics/export',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', ...guard, async (req, res) => {
  const { startDate, endDate } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const where = Object.keys(dateFilter).length ? { checkIn: dateFilter } : {};

    const reservations = await db.reservation.findMany({
      where,
      include: { user: true, room: true },
    });

    const header = 'id,guestName,guestEmail,roomType,checkIn,checkOut,status,pricePerNight\n';
    const rows = reservations.map((r) =>
      [r.id, r.user.fullName, r.user.email, r.room.type, r.checkIn.toISOString(), r.checkOut.toISOString(), r.status, r.room.pricePerNight].join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reservations.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
