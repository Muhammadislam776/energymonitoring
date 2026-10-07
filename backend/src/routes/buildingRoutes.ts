import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/buildings
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let query = `
    SELECT b.*, t.name as tenant_name,
      (SELECT COUNT(*) FROM floors WHERE building_id = b.id) as floors_count,
      (SELECT COUNT(*) FROM rooms WHERE building_id = b.id) as rooms_count,
      (SELECT COUNT(*) FROM equipment WHERE building_id = b.id) as equipment_count,
      (SELECT COUNT(*) FROM meters WHERE building_id = b.id) as meters_count,
      (SELECT COUNT(*) FROM alerts WHERE building_id = b.id AND status != 'resolved') as active_alerts_count,
      (SELECT COALESCE(SUM(power), 0) FROM meters WHERE building_id = b.id) as current_power_kw,
      (SELECT COALESCE(SUM(energy), 0) FROM energy_readings WHERE building_id = b.id AND timestamp >= date('now', 'start of day')) as today_kwh
    FROM buildings b
    LEFT JOIN tenants t ON b.tenant_id = t.id
  `;

  let params: any[] = [];
  if (user.role === 'tenant') {
    query += ` WHERE b.tenant_id = ? `;
    params.push(user.tenant_id);
  }

  query += ` ORDER BY b.created_at ASC`;
  const buildings = db.prepare(query).all(...params);

  return res.json(buildings);
});

// GET /api/buildings/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  let query = `
    SELECT b.*, t.name as tenant_name,
      (SELECT COUNT(*) FROM floors WHERE building_id = b.id) as floors_count,
      (SELECT COUNT(*) FROM rooms WHERE building_id = b.id) as rooms_count,
      (SELECT COUNT(*) FROM equipment WHERE building_id = b.id) as equipment_count,
      (SELECT COUNT(*) FROM meters WHERE building_id = b.id) as meters_count,
      (SELECT COUNT(*) FROM alerts WHERE building_id = b.id AND status != 'resolved') as active_alerts_count,
      (SELECT COALESCE(SUM(power), 0) FROM meters WHERE building_id = b.id) as current_power_kw
    FROM buildings b
    LEFT JOIN tenants t ON b.tenant_id = t.id
    WHERE b.id = ?
  `;

  const building = db.prepare(query).get(id) as any;
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }

  // Tenant access verification
  if (user.role === 'tenant' && building.tenant_id !== user.tenant_id) {
    return res.status(403).json({ error: 'Access denied to this building' });
  }

  // Fetch floors
  const floors = db.prepare(`
    SELECT f.*,
      (SELECT COUNT(*) FROM rooms WHERE floor_id = f.id) as rooms_count,
      (SELECT COALESCE(SUM(power), 0) FROM meters WHERE floor_id = f.id) as current_power_kw
    FROM floors f
    WHERE f.building_id = ?
    ORDER BY f.floor_number ASC
  `).all(id);

  return res.json({ ...building, floors });
});

// POST /api/buildings
router.post('/', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { name, address, area, floors_count, tenant_id } = req.body;
  if (!name || !address || !area) {
    return res.status(400).json({ error: 'Name, address, and area are required' });
  }

  const newId = `bldg-${Date.now()}`;
  const assignedTenant = tenant_id || req.user!.tenant_id || 'tenant-metropolis-01';

  db.prepare(`
    INSERT INTO buildings (id, tenant_id, name, address, area, floors_count, efficiency_score, status)
    VALUES (?, ?, ?, ?, ?, ?, 85, 'operational')
  `).run(newId, assignedTenant, name, address, area, floors_count || 1);

  const created = db.prepare('SELECT * FROM buildings WHERE id = ?').get(newId);
  return res.status(201).json(created);
});

// PUT /api/buildings/:id
router.put('/:id', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, address, area, efficiency_score, status } = req.body;

  db.prepare(`
    UPDATE buildings
    SET name = COALESCE(?, name),
        address = COALESCE(?, address),
        area = COALESCE(?, area),
        efficiency_score = COALESCE(?, efficiency_score),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, address, area, efficiency_score, status, id);

  const updated = db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
  return res.json(updated);
});

export default router;
