import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/rooms
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { floorId, buildingId, type } = req.query;

  let query = `
    SELECT r.*, f.name as floor_name, f.floor_number, b.name as building_name,
      (SELECT COALESCE(SUM(current_power), 0) FROM equipment WHERE room_id = r.id) as current_power_kw,
      (SELECT COUNT(*) FROM equipment WHERE room_id = r.id) as equipment_count,
      (SELECT COUNT(*) FROM alerts WHERE location LIKE '%' || r.room_number || '%' AND status != 'resolved') as active_alerts_count
    FROM rooms r
    JOIN floors f ON r.floor_id = f.id
    JOIN buildings b ON r.building_id = b.id
    WHERE 1=1
  `;

  const params: any[] = [];
  if (floorId) {
    query += ` AND r.floor_id = ? `;
    params.push(floorId);
  }
  if (buildingId) {
    query += ` AND r.building_id = ? `;
    params.push(buildingId);
  }
  if (type) {
    query += ` AND r.type = ? `;
    params.push(type);
  }

  query += ` ORDER BY f.floor_number ASC, r.room_number ASC`;
  const rooms = db.prepare(query).all(...params);

  return res.json(rooms);
});

// GET /api/rooms/:id (Detailed view for Digital Twin side panel)
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const room = db.prepare(`
    SELECT r.*, f.name as floor_name, f.floor_number, b.name as building_name,
      (SELECT COALESCE(SUM(current_power), 0) FROM equipment WHERE room_id = r.id) as current_power_kw
    FROM rooms r
    JOIN floors f ON r.floor_id = f.id
    JOIN buildings b ON r.building_id = b.id
    WHERE r.id = ?
  `).get(id) as any;

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Equipment in this room
  const equipment = db.prepare(`
    SELECT e.*, m.status as meter_status
    FROM equipment e
    LEFT JOIN meters m ON e.connected_meter_id = m.id
    WHERE e.room_id = ?
  `).all(id);

  // Active alerts for this room
  const alerts = db.prepare(`
    SELECT * FROM alerts
    WHERE (location LIKE '%' || ? || '%' OR location LIKE '%' || ? || '%')
      AND status != 'resolved'
    ORDER BY created_at DESC
  `).all(room.name, room.room_number);

  // Recent anomalies
  const anomalies = db.prepare(`
    SELECT * FROM anomalies
    WHERE building_id = ? AND (title LIKE '%' || ? || '%' OR explanation LIKE '%' || ? || '%')
    ORDER BY detected_at DESC
    LIMIT 5
  `).all(room.building_id, room.name, room.room_number);

  // Calculate efficiency score
  const target = room.energy_target || 50;
  const current = room.current_power_kw || 10;
  const efficiencyScore = Math.max(60, Math.min(99, Math.round(100 - ((current / target) * 20))));

  return res.json({
    ...room,
    efficiency_score: efficiencyScore,
    equipment,
    alerts,
    anomalies
  });
});

// POST /api/rooms
router.post('/', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { floor_id, building_id, name, room_number, type, area, occupancy_capacity, temperature, energy_target } = req.body;
  if (!floor_id || !name || !room_number || !type) {
    return res.status(400).json({ error: 'Floor ID, name, room number, and type are required' });
  }

  const floor = db.prepare('SELECT building_id FROM floors WHERE id = ?').get(floor_id) as any;
  const bldgId = building_id || floor?.building_id || 'bldg-ettower-01';
  const newId = `rm-${room_number.toLowerCase()}-${Date.now()}`;

  db.prepare(`
    INSERT INTO rooms (id, floor_id, building_id, name, room_number, type, area, occupancy_capacity, current_occupancy, temperature, energy_target)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId, floor_id, bldgId, name, room_number, type,
    area || 400, occupancy_capacity || 10, Math.round((occupancy_capacity || 10) * 0.5),
    temperature || 22.0, energy_target || 35.0
  );

  const created = db.prepare('SELECT * FROM rooms WHERE id = ?').get(newId);
  return res.status(201).json(created);
});

// PUT /api/rooms/:id
router.put('/:id', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, area, occupancy_capacity, current_occupancy, temperature, energy_target } = req.body;

  db.prepare(`
    UPDATE rooms
    SET name = COALESCE(?, name),
        type = COALESCE(?, type),
        area = COALESCE(?, area),
        occupancy_capacity = COALESCE(?, occupancy_capacity),
        current_occupancy = COALESCE(?, current_occupancy),
        temperature = COALESCE(?, temperature),
        energy_target = COALESCE(?, energy_target)
    WHERE id = ?
  `).run(name, type, area, occupancy_capacity, current_occupancy, temperature, energy_target, id);

  const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;
