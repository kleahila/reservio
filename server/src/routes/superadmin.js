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
    // Derive a `status` string for the UI from the `active` boolean.
    const enriched = tenants.map((t) => ({
      ...t,
      status: t.active ? 'Active' : 'Suspended',
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tenants', ...guard, async (req, res) => {
  const { name, subdomain } = req.body;
  let { plan = 'BASIC' } = req.body;
  if (!name || !subdomain) return res.status(400).json({ error: 'name and subdomain required' });
  plan = String(plan).toUpperCase();
  if (!['BASIC', 'PREMIUM', 'CUSTOM'].includes(plan)) plan = 'BASIC';
  try {
    const tenant = await prisma.tenant.create({ data: { name, subdomain, plan } });
    console.log(`[Invitation] New tenant created: ${tenant.name} (${tenant.subdomain}). Send invitation to admin.`);
    res.status(201).json({ ...tenant, status: tenant.active ? 'Active' : 'Suspended' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Subdomain already in use' });
    res.status(500).json({ error: err.message });
  }
});

async function approveHandler(req, res) {
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { active: true } });
    res.json({ ...tenant, status: 'Active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
router.route('/tenants/:id/approve').put(...guard, approveHandler).patch(...guard, approveHandler);

async function suspendHandler(req, res) {
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ ...tenant, status: 'Suspended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
router.route('/tenants/:id/suspend').put(...guard, suspendHandler).patch(...guard, suspendHandler);

router.delete('/tenants/:id', ...guard, async (req, res) => {
  try {
    await prisma.tenant.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    // Tenant has reservations/users/rooms — same FK pattern as Room delete.
    if (err.code === 'P2003' || err.code === 'P2014' || /foreign key|constraint|violates/i.test(err.message || '')) {
      return res.status(409).json({
        error: 'This tenant has users, rooms, or reservations linked to it and cannot be deleted. Suspend it instead.',
      });
    }
    res.status(500).json({ error: err.message });
  }
});

async function planHandler(req, res) {
  let { plan } = req.body;
  plan = plan ? String(plan).toUpperCase() : plan;
  if (!['BASIC', 'PREMIUM', 'CUSTOM'].includes(plan)) {
    return res.status(400).json({ error: 'plan must be BASIC, PREMIUM, or CUSTOM' });
  }
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { plan } });
    await logActivity(null, req.user.userId, 'PLAN_CHANGED', 'Tenant', req.params.id, { plan });
    res.json({ ...tenant, status: tenant.active ? 'Active' : 'Suspended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
router.route('/tenants/:id/plan').put(...guard, planHandler).patch(...guard, planHandler);

router.get('/analytics', ...guard, async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { active: true } });
    const suspendedTenants = await prisma.tenant.count({ where: { active: false } });
    const totalReservations = await prisma.reservation.count();
    const planBreakdown = await prisma.tenant.groupBy({
      by: ['plan'],
      _count: { _all: true },
    });
    // Object form expected by the frontend chart.
    const planDistribution = Object.fromEntries(
      planBreakdown.map((p) => [p.plan, p._count._all]),
    );
    // Rough MRR estimate by plan tier (illustrative; real billing isn't modelled).
    const planPrices = { BASIC: 50, PREMIUM: 150, CUSTOM: 400 };
    const mrr = planBreakdown.reduce(
      (sum, p) => sum + (planPrices[p.plan] || 0) * p._count._all,
      0,
    );
    res.json({
      totalTenants,
      activeTenants,
      suspendedTenants,
      pendingApproval: 0, // not modelled in schema
      totalReservations,
      mrr,
      planDistribution,
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
