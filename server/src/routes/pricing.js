const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const featureGate = require('../middleware/featureGate');
const { getTenantClient } = require('../prisma/tenantClient');

const premiumGuard = [authMiddleware, featureGate('PREMIUM'), roleGuard('HOTEL_ADMIN')];

router.get('/rules', ...premiumGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.pricingRule.findMany());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rules', ...premiumGuard, async (req, res) => {
  const { occupancyThreshold, adjustmentPercent, enabled = true } = req.body;
  if (occupancyThreshold == null || adjustmentPercent == null) {
    return res.status(400).json({ error: 'occupancyThreshold and adjustmentPercent required' });
  }
  const db = getTenantClient(req.tenant.id);
  try {
    res.status(201).json(await db.pricingRule.create({ data: { occupancyThreshold, adjustmentPercent, enabled } }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rules/:id', ...premiumGuard, async (req, res) => {
  const { occupancyThreshold, adjustmentPercent, enabled } = req.body;
  const db = getTenantClient(req.tenant.id);
  try {
    res.json(await db.pricingRule.update({
      where: { id: req.params.id },
      data: { occupancyThreshold, adjustmentPercent, enabled },
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/rules/:id', ...premiumGuard, async (req, res) => {
  const db = getTenantClient(req.tenant.id);
  try {
    await db.pricingRule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
