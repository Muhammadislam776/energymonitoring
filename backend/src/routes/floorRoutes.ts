import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/floors
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId } = req.query;

  let query = `
    SELECT f.*, b.name as building_name,
      (SELECT COUNT(*) FROM rooms WHERE floor_id = f.id) as rooms_count,
      (SELECT COALESCE(SUM(current_power), 0) FROM equipment WHERE floor_id = f.id) as current_power_kw,
      (SELECT COALESCE(SUM(occupancy_capacity), 0) FROM rooms WHERE floor_id = f.id) as total_capacity,
      (SELECT COALESCE(SUM(current_occupancy), 0) FROM rooms WHERE floor_id = f.id) as current_occupancy_total
    FROM floors f
    JOIN buildings b ON f.building_id = b.id
  `;

  const params: any[] = [];
  if (buildingId) {
    query += ` WHERE f.building_id = ? `;
    params.push(buildingId);
  }

  query += ` ORDER BY f.floor_number ASC`;
  const floors = db.prepare(query).all(...params);

  return res.json(floors);
});

// GET /api/floors/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const floor = db.prepare(`
    SELECT f.*, b.name as building_name
    FROM floors f
    JOIN buildings b ON f.building_id = b.id
    WHERE f.id = ?
  `).get(id) as any;

  if (!floor) {
    return res.status(404).json({ error: 'Floor not found' });
  }

  // Get rooms on this floor
  const rooms = db.prepare(`
    SELECT r.*,
      (SELECT COALESCE(SUM(current_power), 0) FROM equipment WHERE room_id = r.id) as current_power_kw,
      (SELECT COUNT(*) FROM equipment WHERE room_id = r.id) as equipment_count,
      (SELECT COUNT(*) FROM alerts WHERE location LIKE '%' || r.room_number || '%' AND status != 'resolved') as alerts_count
    FROM rooms r
    WHERE r.floor_id = ?
    ORDER BY r.room_number ASC
  `).all(id);

  return res.json({ ...floor, rooms });
});

// POST /api/floors
router.post('/', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { building_id, name, floor_number, area, occupancy, energy_target } = req.body;
  if (!building_id || !name || floor_number === undefined) {
    return res.status(400).json({ error: 'Building ID, name, and floor number are required' });
  }

  const newId = `fl-${Date.now()}`;
  db.prepare(`
    INSERT INTO floors (id, building_id, name, floor_number, area, occupancy, energy_target)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(newId, building_id, name, floor_number, area || 5000, occupancy || 0, energy_target || 500);

  const created = db.prepare('SELECT * FROM floors WHERE id = ?').get(newId);
  return res.status(201).json(created);
});

// PUT /api/floors/:id
router.put('/:id', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, area, occupancy, energy_target } = req.body;

  db.prepare(`
    UPDATE floors
    SET name = COALESCE(?, name),
        area = COALESCE(?, area),
        occupancy = COALESCE(?, occupancy),
        energy_target = COALESCE(?, energy_target)
    WHERE id = ?
  `).run(name, area, occupancy, energy_target, id);

  const updated = db.prepare('SELECT * FROM floors WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;
