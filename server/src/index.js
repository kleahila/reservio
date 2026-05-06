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
const { initSocket } = require('./socket');
const { runPricingEngine } = require('./services/pricingEngine');

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
