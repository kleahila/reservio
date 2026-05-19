const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { logActivity } = require('../services/activityLog');

const adminGuard = [authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER', 'RECEPTIONIST')];
const manageGuard = [authMiddleware, roleGuard('HOTEL_ADMIN', 'MANAGER')];

router.get('/', ...adminGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const requests = await db.maintenanceRequest.findMany({
      include: {
        room: { select: { id: true, type: true, description: true } },
        reportedBy: { select: { id: true, fullName: true, username: true } },
        assignedTo: { select: { id: true, fullName: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authMiddleware, roleGuard('TECHNICIAN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const requests = await db.maintenanceRequest.findMany({
      where: { assignedToId: req.user.userId },
      include: {
        room: { select: { id: true, type: true, description: true } },
        reportedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', ...adminGuard, async (req, res) => {
  const { roomId, issue, category } = req.body;
  if (!roomId || !issue) return res.status(400).json({ error: 'roomId and issue required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const request = await db.maintenanceRequest.create({
      data: { roomId, reportedById: req.user.userId, issue, category: category || 'OTHER' },
      include: {
        room: { select: { id: true, type: true, description: true } },
        reportedBy: { select: { id: true, fullName: true } },
      },
    });
    await logActivity(req.tenant.id, req.user.userId, 'MAINTENANCE_CREATED', 'MaintenanceRequest', request.id, { issue, category });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/assign', ...manageGuard, async (req, res) => {
  const { assignedTo } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    const request = await db.maintenanceRequest.update({
      where: { id: req.params.id },
      data: { assignedToId: assignedTo || null },
      include: {
        room: { select: { id: true, type: true, description: true } },
        reportedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', authMiddleware, roleGuard('TECHNICIAN', 'HOTEL_ADMIN', 'MANAGER'), async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status required' });
  const db = getTenantClient(req.tenant.id);
  try {
    const data = { status };
    if (status === 'RESOLVED') data.resolvedAt = new Date();
    const request = await db.maintenanceRequest.update({
      where: { id: req.params.id },
      data,
      include: {
        room: { select: { id: true, type: true, description: true } },
      },
    });
    if (status === 'RESOLVED') {
      await logActivity(req.tenant.id, req.user.userId, 'MAINTENANCE_RESOLVED', 'MaintenanceRequest', request.id, { roomId: request.roomId });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
