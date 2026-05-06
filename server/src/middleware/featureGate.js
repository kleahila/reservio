const PLAN_RANK = { BASIC: 0, PREMIUM: 1, CUSTOM: 2 };

function featureGate(requiredPlan) {
  return (req, res, next) => {
    if (!req.tenant) return res.status(403).json({ error: 'No tenant context' });
    const tenantRank = PLAN_RANK[req.tenant.plan] ?? 0;
    const requiredRank = PLAN_RANK[requiredPlan] ?? 99;
    if (tenantRank < requiredRank) {
      return res.status(403).json({ error: `Plan upgrade required: ${requiredPlan}` });
    }
    next();
  };
}

module.exports = featureGate;
