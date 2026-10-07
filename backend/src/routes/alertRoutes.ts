import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { broadcastEvent } from '../websocket/wsServer';

const router = Router();

// GET /api/alerts
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, severity, status, type, search } = req.query;
  const user = req.user!;

  let query = `
    SELECT a.*, b.name as building_name
    FROM alerts a
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE 1=1
  `;

  const params: any[] = [];
  if (user.role === 'tenant') {
    query += ` AND a.tenant_id = ? `;
    params.push(user.tenant_id);
  }
  if (buildingId) {
    query += ` AND a.building_id = ? `;
    params.push(buildingId);
  }
  if (severity) {
    query += ` AND a.severity = ? `;
    params.push(severity);
  }
  if (status) {
    query += ` AND a.status = ? `;
    params.push(status);
  }
  if (type) {
    query += ` AND a.type = ? `;
    params.push(type);
  }
  if (search) {
    query += ` AND (a.title LIKE '%' || ? || '%' OR a.location LIKE '%' || ? || '%' OR a.message LIKE '%' || ? || '%') `;
    params.push(search, search, search);
  }

  query += ` ORDER BY a.created_at DESC`;
  const alerts = db.prepare(query).all(...params);

  return res.json(alerts);
});

// PUT /api/alerts/:id/status
router.put('/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'acknowledged', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid alert status' });
  }

  db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, id);

  // Add audit log
  db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, resource, details)
    VALUES (?, ?, ?, ?, 'ALERT_STATUS', ?, ?)
  `).run(
    `aud-${Date.now()}`, req.user?.tenant_id, req.user?.id, req.user?.name,
    `Alert ${id}`, `Status changed to ${status}`
  );

  broadcastEvent('alert.updated', { id, status });

  const updated = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  return res.json(updated);
});

// POST /api/alerts (Manual or test alert trigger)
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { building_id, type, severity, title, message, location, current_value, threshold } = req.body;
  if (!title || !message || !location) {
    return res.status(400).json({ error: 'Title, message, and location are required' });
  }

  const alertId = `alt-${Date.now()}`;
  const tenantId = req.user?.tenant_id || 'tenant-metropolis-01';

  db.prepare(`
    INSERT INTO alerts (id, tenant_id, building_id, type, severity, title, message, location, current_value, threshold, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
  `).run(
    alertId, tenantId, building_id || 'bldg-ettower-01',
    type || 'high_consumption', severity || 'warning',
    title, message, location, current_value || 0, threshold || 0
  );

  const created = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);

  broadcastEvent('alert.created', created);

  return res.status(201).json(created);
});

export default router;
