const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getTenantClient } = require('../prisma/tenantClient');
const { emit } = require('../socket');

router.get('/', authMiddleware, roleGuard('HOUSEKEEPER', 'STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const tasks = await db.housekeepingTask.findMany({
      where: { status: 'PENDING' },
      orderBy: [{ urgency: 'desc' }, { priority: 'asc' }, { createdAt: 'asc' }],
      include: { room: true },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/urgent', authMiddleware, roleGuard('HOUSEKEEPER', 'STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const task = await db.housekeepingTask.update({
      where: { id: req.params.id },
      data: { urgency: true },
    });
    const sortedTasks = await db.housekeepingTask.findMany({
      where: { status: 'PENDING' },
      orderBy: [{ urgency: 'desc' }, { priority: 'asc' }, { createdAt: 'asc' }],
    });
    emit(req.tenant.id, 'taskUpdated', { taskId: task.id, urgency: true, sortedTasks });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/complete', authMiddleware, roleGuard('HOUSEKEEPER', 'STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    const task = await db.housekeepingTask.update({
      where: { id: req.params.id },
      data: { status: 'DONE' },
    });
    emit(req.tenant.id, 'taskCompleted', { taskId: task.id, roomId: task.roomId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pendingReservations = await db.reservation.findMany({
      where: {
        roomId: task.roomId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        checkIn: { gte: today, lt: tomorrow },
      },
    });

    for (const r of pendingReservations) {
      emit(req.tenant.id, 'earlyCheckinAlert', { roomId: task.roomId, guestUserId: r.userId });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/assign', authMiddleware, roleGuard('STAFF', 'RECEPTIONIST', 'MANAGER', 'HOTEL_ADMIN'), async (req, res) => {
  const { staffId } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    const task = await db.housekeepingTask.update({
      where: { id: req.params.id },
      data: { assignedTo: staffId ?? null },
      include: { room: true },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
