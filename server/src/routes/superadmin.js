const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { prisma } = require('../prisma/tenantClient');
const { logActivity } = require('../services/activityLog');

const guard = [authMiddleware, roleGuard('SUPER_ADMIN')];

router.get('/tenants', ...guard, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, reservations: true, rooms: true } },
      },
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tenants', ...guard, async (req, res) => {
  const { name, subdomain, plan = 'BASIC' } = req.body;
  if (!name || !subdomain) return res.status(400).json({ error: 'name and subdomain required' });
  try {
    const tenant = await prisma.tenant.create({ data: { name, subdomain, plan } });
    console.log(`[Invitation] New tenant created: ${tenant.name} (${tenant.subdomain}). Send invitation to admin.`);
    res.status(201).json(tenant);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Subdomain already in use' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id/approve', ...guard, async (req, res) => {
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { active: true } });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id/suspend', ...guard, async (req, res) => {
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { active: false } });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tenants/:id', ...guard, async (req, res) => {
  try {
    await prisma.tenant.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id/plan', ...guard, async (req, res) => {
  const { plan } = req.body;
  if (!['BASIC', 'PREMIUM', 'CUSTOM'].includes(plan)) {
    return res.status(400).json({ error: 'plan must be BASIC, PREMIUM, or CUSTOM' });
  }
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { plan } });
    await logActivity(null, req.user.userId, 'PLAN_CHANGED', 'Tenant', req.params.id, { plan });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', ...guard, async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const totalReservations = await prisma.reservation.count();
    const planBreakdown = await prisma.tenant.groupBy({
      by: ['plan'],
      _count: { _all: true },
    });
    res.json({
      totalTenants,
      totalReservations,
      planBreakdown: planBreakdown.map((p) => ({ plan: p.plan, count: p._count._all })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', ...guard, async (req, res) => {
  try {
    const [activeTenants, totalUsers, tenants] = await Promise.all([
      prisma.tenant.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.tenant.findMany({
        include: { _count: { select: { reservations: true, rooms: true } } },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalReservationsToday = await prisma.reservation.count({
      where: { checkIn: { gte: today, lt: tomorrow } },
    });

    res.json({
      activeTenants,
      totalReservationsToday,
      totalUsers,
      tenants: tenants.map((t) => ({
        name: t.name,
        plan: t.plan,
        active: t.active,
        roomCount: t._count.rooms,
        reservationCount: t._count.reservations,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', ...guard, async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
