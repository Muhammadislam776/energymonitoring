import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/equipment
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, floorId, roomId, type, status, search } = req.query;

  let query = `
    SELECT e.*, r.name as room_name, r.room_number, f.name as floor_name, f.floor_number, b.name as building_name,
           m.meter_type, m.status as meter_status
    FROM equipment e
    JOIN rooms r ON e.room_id = r.id
    JOIN floors f ON e.floor_id = f.id
    JOIN buildings b ON e.building_id = b.id
    LEFT JOIN meters m ON e.connected_meter_id = m.id
    WHERE 1=1
  `;

  const params: any[] = [];
  if (buildingId) {
    query += ` AND e.building_id = ? `;
    params.push(buildingId);
  }
  if (floorId) {
    query += ` AND e.floor_id = ? `;
    params.push(floorId);
  }
  if (roomId) {
    query += ` AND e.room_id = ? `;
    params.push(roomId);
  }
  if (type) {
    query += ` AND e.type = ? `;
    params.push(type);
  }
  if (status) {
    query += ` AND e.status = ? `;
    params.push(status);
  }
  if (search) {
    query += ` AND (e.name LIKE '%' || ? || '%' OR e.type LIKE '%' || ? || '%') `;
    params.push(search, search);
  }

  query += ` ORDER BY e.name ASC`;
  const equipment = db.prepare(query).all(...params);

  return res.json(equipment);
});

// GET /api/equipment/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const eq = db.prepare(`
    SELECT e.*, r.name as room_name, r.room_number, f.name as floor_name, f.floor_number, b.name as building_name,
           m.meter_type, m.status as meter_status, m.voltage, m.current, m.power_factor
    FROM equipment e
    JOIN rooms r ON e.room_id = r.id
    JOIN floors f ON e.floor_id = f.id
    JOIN buildings b ON e.building_id = b.id
    LEFT JOIN meters m ON e.connected_meter_id = m.id
    WHERE e.id = ?
  `).get(id) as any;

  if (!eq) {
    return res.status(404).json({ error: 'Equipment not found' });
  }

  // Related anomalies
  const anomalies = db.prepare(`
    SELECT * FROM anomalies WHERE equipment_id = ? OR title LIKE '%' || ? || '%'
    ORDER BY detected_at DESC
  `).all(id, eq.name);

  return res.json({ ...eq, anomalies });
});

// PUT /api/equipment/:id
router.put('/:id', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, rated_power, current_power, status, efficiency } = req.body;

  db.prepare(`
    UPDATE equipment
    SET name = COALESCE(?, name),
        type = COALESCE(?, type),
        rated_power = COALESCE(?, rated_power),
        current_power = COALESCE(?, current_power),
        status = COALESCE(?, status),
        efficiency = COALESCE(?, efficiency)
    WHERE id = ?
  `).run(name, type, rated_power, current_power, status, efficiency, id);

  const updated = db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;
