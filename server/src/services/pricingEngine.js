const { prisma } = require('../prisma/tenantClient');

async function runPricingEngine() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { active: true, plan: { in: ['PREMIUM', 'CUSTOM'] } },
    });

    for (const tenant of tenants) {
      const totalRooms = await prisma.room.count({ where: { tenantId: tenant.id } });
      if (totalRooms === 0) continue;

      const occupiedRooms = await prisma.room.count({
        where: { tenantId: tenant.id, status: 'CHECKED_IN' },
      });
      const occupancy = occupiedRooms / totalRooms;

      const rules = await prisma.pricingRule.findMany({
        where: { tenantId: tenant.id, enabled: true, occupancyThreshold: { lte: occupancy } },
      });

      if (rules.length === 0) {
        console.log(`[PricingEngine] Tenant ${tenant.name}: occupancy ${(occupancy * 100).toFixed(1)}% — no rules triggered`);
        continue;
      }

      const totalAdjustment = rules.reduce((sum, r) => sum + r.adjustmentPercent, 0);
      const rooms = await prisma.room.findMany({ where: { tenantId: tenant.id } });

      for (const room of rooms) {
        const newPrice = room.pricePerNight * (1 + totalAdjustment / 100);
        await prisma.room.update({ where: { id: room.id }, data: { pricePerNight: newPrice } });
      }

      console.log(`[PricingEngine] Tenant ${tenant.name}: occupancy ${(occupancy * 100).toFixed(1)}% — applied ${totalAdjustment}% adjustment to ${rooms.length} rooms`);
    }
  } catch (err) {
    console.error('[PricingEngine] Error:', err.message);
  }
}

module.exports = { runPricingEngine };
