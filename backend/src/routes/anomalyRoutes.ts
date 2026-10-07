import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/anomalies
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, severity, status } = req.query;

  let query = `
    SELECT a.*, b.name as building_name, f.name as floor_name,
           e.name as equipment_name, e.type as equipment_type,
           m.meter_type
    FROM anomalies a
    JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN equipment e ON a.equipment_id = e.id
    LEFT JOIN meters m ON a.meter_id = m.id
    WHERE 1=1
  `;

  const params: any[] = [];
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

  query += ` ORDER BY a.detected_at DESC`;
  const rows = db.prepare(query).all(...params) as any[];

  const anomalies = rows.map(r => ({
    ...r,
    evidence: JSON.parse(r.evidence_json || '{}')
  }));

  return res.json(anomalies);
});

// GET /api/anomalies/:id (Deep AI explanation & Evidence timeline)
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const row = db.prepare(`
    SELECT a.*, b.name as building_name, f.name as floor_name,
           e.name as equipment_name, e.type as equipment_type,
           m.meter_type
    FROM anomalies a
    JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN equipment e ON a.equipment_id = e.id
    LEFT JOIN meters m ON a.meter_id = m.id
    WHERE a.id = ?
  `).get(id) as any;

  if (!row) {
    return res.status(404).json({ error: 'Anomaly not found' });
  }

  return res.json({
    ...row,
    evidence: JSON.parse(row.evidence_json || '{}')
  });
});

// PUT /api/anomalies/:id/status
router.put('/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'investigating', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE anomalies SET status = ? WHERE id = ?').run(status, id);
  const updated = db.prepare('SELECT * FROM anomalies WHERE id = ?').get(id);

  return res.json(updated);
});

export default router;
