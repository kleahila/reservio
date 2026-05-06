const { prisma } = require('../prisma/tenantClient');

async function tenantResolver(req, res, next) {
  let subdomain = req.headers['x-tenant-subdomain'];

  if (!subdomain) {
    const host = req.headers.host || '';
    subdomain = host.split('.')[0];
  }

  if (!subdomain || subdomain === 'admin') {
    req.tenant = null;
    return next();
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    if (!tenant.active) return res.status(403).json({ error: 'Tenant suspended' });
    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = tenantResolver;
