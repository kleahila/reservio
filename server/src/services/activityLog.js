const { prisma } = require('../prisma/tenantClient');

async function logActivity(tenantId, userId, action, entity, entityId, metadata) {
  try {
    await prisma.activityLog.create({
      data: {
        tenantId: tenantId ?? null,
        userId: userId ?? null,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to log:', err.message);
  }
}

module.exports = { logActivity };
