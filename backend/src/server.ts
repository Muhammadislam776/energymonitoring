import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './db/database';
import { initWebSocketServer } from './websocket/wsServer';

import authRoutes from './routes/authRoutes';
import buildingRoutes from './routes/buildingRoutes';
import floorRoutes from './routes/floorRoutes';
import roomRoutes from './routes/roomRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import meterRoutes from './routes/meterRoutes';
import energyRoutes from './routes/energyRoutes';
import anomalyRoutes from './routes/anomalyRoutes';
import forecastRoutes from './routes/forecastRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import alertRoutes from './routes/alertRoutes';
import reportRoutes from './routes/reportRoutes';
import exportRoutes from './routes/exportRoutes';
import userRoutes from './routes/userRoutes';
import tenantRoutes from './routes/tenantRoutes';
import settingRoutes from './routes/settingRoutes';
import copilotRoutes from './routes/copilotRoutes';
import simulatorRoutes from './routes/simulatorRoutes';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'EnergyTwin Digital Twin Energy Monitoring Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/simulator', simulatorRoutes);

// Serve compiled frontend production build if present
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize DB and WebSocket server
initDatabase();
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` EnergyTwin Backend API Server listening on port ${PORT}`);
  console.log(` WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
