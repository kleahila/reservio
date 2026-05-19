const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const featureGate = require('../middleware/featureGate');
const { getTenantClient } = require('../prisma/tenantClient');

const guard = [authMiddleware, featureGate('PREMIUM'), roleGuard('HOTEL_ADMIN', 'MANAGER')];

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

router.get('/calendar', ...guard, async (req, res) => {
  const { year, month } = req.query;
  const db = getTenantClient(req.tenant.id);
  try {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const daysInMonth = new Date(y, m, 0).getDate();

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59);

    const totalRooms = await db.room.count();

    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m - 1, d);
      const dateStr = date.toISOString().slice(0, 10);

      const reservations = await db.reservation.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
          checkIn: { lte: new Date(y, m - 1, d, 23, 59) },
          checkOut: { gte: new Date(y, m - 1, d, 0, 0) },
        },
        select: { id: true },
      });

      const occupancyPercent = totalRooms > 0
        ? Math.round((reservations.length / totalRooms) * 100)
        : 0;

      result.push({ date: dateStr, occupancyPercent, reservationCount: reservations.length });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
