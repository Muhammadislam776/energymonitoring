import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/recommendations
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, status, priority } = req.query;

  let query = `
    SELECT r.*, b.name as building_name
    FROM recommendations r
    JOIN buildings b ON r.building_id = b.id
    WHERE 1=1
  `;

  const params: any[] = [];
  if (buildingId) {
    query += ` AND r.building_id = ? `;
    params.push(buildingId);
  }
  if (status) {
    query += ` AND r.status = ? `;
    params.push(status);
  }
  if (priority) {
    query += ` AND r.priority = ? `;
    params.push(priority);
  }

  query += ` ORDER BY r.monthly_saving_usd DESC`;
  const rows = db.prepare(query).all(...params) as any[];

  const recommendations = rows.map(r => ({
    ...r,
    evidence: JSON.parse(r.evidence_json || '[]')
  }));

  return res.json(recommendations);
});

// PUT /api/recommendations/:id/status
router.put('/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'task_created', 'implemented', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid recommendation status' });
  }

  db.prepare('UPDATE recommendations SET status = ? WHERE id = ?').run(status, id);

  // Add audit log
  db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, resource, details)
    VALUES (?, ?, ?, ?, 'RECOMMENDATION_STATUS', ?, ?)
  `).run(
    `aud-${Date.now()}`, req.user?.tenant_id, req.user?.id, req.user?.name,
    `Recommendation ${id}`, `Status changed to ${status}`
  );

  const updated = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id) as any;
  return res.json({
    ...updated,
    evidence: JSON.parse(updated.evidence_json || '[]')
  });
});

export default router;
