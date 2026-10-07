import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { broadcastEvent } from '../websocket/wsServer';

const router = Router();

// GET /api/meters
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, floorId, status, search } = req.query;

  let query = `
    SELECT m.*, b.name as building_name, f.name as floor_name, r.name as room_name, r.room_number,
           e.name as equipment_name, e.type as equipment_type
    FROM meters m
    JOIN buildings b ON m.building_id = b.id
    LEFT JOIN floors f ON m.floor_id = f.id
    LEFT JOIN rooms r ON m.room_id = r.id
    LEFT JOIN equipment e ON m.equipment_id = e.id
    WHERE 1=1
  `;

  const params: any[] = [];
  if (buildingId) {
    query += ` AND m.building_id = ? `;
    params.push(buildingId);
  }
  if (floorId) {
    query += ` AND m.floor_id = ? `;
    params.push(floorId);
  }
  if (status) {
    query += ` AND m.status = ? `;
    params.push(status);
  }
  if (search) {
    query += ` AND (m.id LIKE '%' || ? || '%' OR m.meter_type LIKE '%' || ? || '%') `;
    params.push(search, search);
  }

  query += ` ORDER BY m.id ASC`;
  const meters = db.prepare(query).all(...params);

  return res.json(meters);
});

// GET /api/meters/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const meter = db.prepare(`
    SELECT m.*, b.name as building_name, f.name as floor_name, r.name as room_name, r.room_number,
           e.name as equipment_name
    FROM meters m
    JOIN buildings b ON m.building_id = b.id
    LEFT JOIN floors f ON m.floor_id = f.id
    LEFT JOIN rooms r ON m.room_id = r.id
    LEFT JOIN equipment e ON m.equipment_id = e.id
    WHERE m.id = ?
  `).get(id) as any;

  if (!meter) {
    return res.status(404).json({ error: 'Meter not found' });
  }

  // Get recent 24 readings for chart
  const recentReadings = db.prepare(`
    SELECT timestamp, power, voltage, current, power_factor
    FROM energy_readings
    WHERE meter_id = ?
    ORDER BY timestamp DESC
    LIMIT 24
  `).all(id);

  return res.json({
    ...meter,
    recentReadings: recentReadings.reverse()
  });
});

// POST /api/meters/:id/toggle-disconnect (Interactive simulation feature!)
router.post('/:id/toggle-disconnect', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const meter = db.prepare('SELECT * FROM meters WHERE id = ?').get(id) as any;

  if (!meter) {
    return res.status(404).json({ error: 'Meter not found' });
  }

  const newStatus = meter.status === 'connected' ? 'disconnected' : 'connected';
  const newPower = newStatus === 'disconnected' ? 0.0 : 34.2;

  db.prepare(`
    UPDATE meters
    SET status = ?, power = ?, current = ?
    WHERE id = ?
  `).run(newStatus, newPower, newStatus === 'disconnected' ? 0 : 49.5, id);

  // If disconnected, generate an alert
  if (newStatus === 'disconnected') {
    const alertId = `alt-disc-${Date.now()}`;
    const userTenantId = req.user?.tenant_id || 'tenant-metropolis-01';

    db.prepare(`
      INSERT INTO alerts (id, tenant_id, building_id, type, severity, title, message, location, current_value, threshold, status)
      VALUES (?, ?, ?, 'meter_offline', 'critical', ?, ?, ?, 0.0, 1.0, 'new')
    `).run(
      alertId, userTenantId, meter.building_id,
      `Smart Meter ${meter.id} Telemetry Disconnected`,
      `Communication dropped for ${meter.meter_type}. Modbus heartbeat failed.`,
      `Meter ID: ${meter.id}`
    );

    broadcastEvent('alert.created', {
      id: alertId,
      severity: 'critical',
      title: `Smart Meter ${meter.id} Telemetry Disconnected`,
      message: `Communication dropped for ${meter.meter_type}.`,
      time: new Date().toISOString()
    });
  }

  broadcastEvent('meter.updated', {
    id,
    status: newStatus,
    power: newPower
  });

  const updatedMeter = db.prepare('SELECT * FROM meters WHERE id = ?').get(id);
  return res.json({ meter: updatedMeter, status: newStatus });
});

export default router;
