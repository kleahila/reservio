require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const cron = require('node-cron');

const tenantResolver = require('./middleware/tenantResolver');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');
const parkingRoutes = require('./routes/parking');
const sunbedRoutes = require('./routes/sunbeds');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const housekeepingRoutes = require('./routes/housekeeping');
const pricingRoutes = require('./routes/pricing');
const analyticsRoutes = require('./routes/analytics');
const staffRoutes = require('./routes/staff');
const superadminRoutes = require('./routes/superadmin');
const shiftRoutes = require('./routes/shifts');
const maintenanceRoutes = require('./routes/maintenance');
const roomBlockRoutes = require('./routes/roomBlocks');
const guestRoutes = require('./routes/guests');
const reviewRoutes = require('./routes/reviews');
const activityLogRoutes = require('./routes/activityLog');
const notificationRoutes = require('./routes/notifications');
const { initSocket } = require('./socket');
const { runPricingEngine } = require('./services/pricingEngine');
const { prisma } = require('./prisma/tenantClient');

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    ...(process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : []),
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public tenants endpoint — no auth, no tenant resolver
app.get('/api/public/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { active: true },
      select: { id: true, name: true, subdomain: true, plan: true },
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Super admin login — no tenant resolver, queries global prisma
app.post('/api/admin/login', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await prisma.user.findFirst({ where: { email, role: 'SUPER_ADMIN', active: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user.id, tenantId: null, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', tenantResolver, authRoutes);
app.use('/api/rooms', tenantResolver, roomRoutes);
app.use('/api/reservations', tenantResolver, reservationRoutes);
app.use('/api/parking', tenantResolver, parkingRoutes);
app.use('/api/sunbeds', tenantResolver, sunbedRoutes);
app.use('/api/services', tenantResolver, serviceRoutes);
app.use('/api/orders', tenantResolver, orderRoutes);
app.use('/api/tasks', tenantResolver, housekeepingRoutes);
app.use('/api/pricing', tenantResolver, pricingRoutes);
app.use('/api/analytics', tenantResolver, analyticsRoutes);
app.use('/api/staff', tenantResolver, staffRoutes);
app.use('/api/admin', superadminRoutes);
app.use('/api/shifts', tenantResolver, shiftRoutes);
app.use('/api/maintenance', tenantResolver, maintenanceRoutes);
app.use('/api/room-blocks', tenantResolver, roomBlockRoutes);
app.use('/api/guests', tenantResolver, guestRoutes);
app.use('/api/reviews', tenantResolver, reviewRoutes);
app.use('/api/activity', tenantResolver, activityLogRoutes);
app.use('/api/notifications', tenantResolver, notificationRoutes);

cron.schedule('0 0 * * *', () => {
  console.log('[Cron] Running daily pricing engine...');
  runPricingEngine();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Reservio API listening on port ${PORT}`);
});
