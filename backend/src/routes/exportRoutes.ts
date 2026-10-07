import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// In-memory or database export log history
const exportHistory: Array<{
  id: string;
  dataset: string;
  format: string;
  recordsCount: number;
  exportedBy: string;
  timestamp: string;
  fileSize: string;
}> = [
  {
    id: 'exp-01',
    dataset: 'Consumption History (30 Days)',
    format: 'CSV',
    recordsCount: 360,
    exportedBy: 'Sarah Jenkins',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    fileSize: '48.2 KB'
  },
  {
    id: 'exp-02',
    dataset: 'Smart Meter Telemetry Fleet',
    format: 'XLSX',
    recordsCount: 24,
    exportedBy: 'David Miller',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    fileSize: '18.6 KB'
  },
  {
    id: 'exp-03',
    dataset: 'AI Anomalies & Evidence Log',
    format: 'PDF',
    recordsCount: 4,
    exportedBy: 'Elena Rostova',
    timestamp: new Date(Date.now() - 3600000 * 32).toISOString(),
    fileSize: '124.0 KB'
  }
];

// GET /api/exports/history
router.get('/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(exportHistory);
});

// POST /api/exports/generate
router.post('/generate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { dataset, format = 'CSV', buildingId = 'bldg-ettower-01' } = req.body;
  if (!dataset) {
    return res.status(400).json({ error: 'Dataset is required' });
  }

  let dataRows: any[] = [];
  let filename = `energytwin_${dataset.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

  if (dataset === 'consumption_history' || dataset === 'Consumption History') {
    dataRows = db.prepare(`
      SELECT er.timestamp, m.id as meter_id, m.meter_type, er.power as power_kw,
             (er.power * 2) as kwh, er.voltage, er.current, er.power_factor
      FROM energy_readings er
      LEFT JOIN meters m ON er.meter_id = m.id
      WHERE er.building_id = ?
      ORDER BY er.timestamp DESC
      LIMIT 500
    `).all(buildingId);
  } else if (dataset === 'meter_readings' || dataset === 'Smart Meters') {
    dataRows = db.prepare(`
      SELECT id, meter_type, status, voltage, current, power, energy, power_factor, frequency, last_reading
      FROM meters WHERE building_id = ?
    `).all(buildingId);
  } else if (dataset === 'equipment' || dataset === 'Equipment Fleet') {
    dataRows = db.prepare(`
      SELECT id, name, type, rated_power, current_power, status, efficiency, runtime_hours
      FROM equipment WHERE building_id = ?
    `).all(buildingId);
  } else if (dataset === 'anomalies' || dataset === 'AI Anomalies') {
    dataRows = db.prepare(`
      SELECT id, title, severity, detected_at, measured_value, expected_value, difference_pct, confidence, status
      FROM anomalies WHERE building_id = ?
    `).all(buildingId);
  } else if (dataset === 'alerts' || dataset === 'Operational Alerts') {
    dataRows = db.prepare(`
      SELECT id, type, severity, title, location, current_value, threshold, status, created_at
      FROM alerts WHERE building_id = ?
    `).all(buildingId);
  } else if (dataset === 'recommendations' || dataset === 'AI Recommendations') {
    dataRows = db.prepare(`
      SELECT id, title, potential_saving_pct, monthly_saving_usd, confidence, priority, status
      FROM recommendations WHERE building_id = ?
    `).all(buildingId);
  } else {
    dataRows = db.prepare(`
      SELECT id, timestamp, predicted_value, lower_bound, upper_bound, confidence
      FROM forecasts WHERE building_id = ? LIMIT 48
    `).all(buildingId);
  }

  const newEntry = {
    id: `exp-${Date.now()}`,
    dataset,
    format: format.toUpperCase(),
    recordsCount: dataRows.length,
    exportedBy: req.user?.name || 'Administrator',
    timestamp: new Date().toISOString(),
    fileSize: `${(dataRows.length * 0.15).toFixed(1)} KB`
  };

  exportHistory.unshift(newEntry);

  return res.json({
    log: newEntry,
    filename: `${filename}.${format.toLowerCase()}`,
    records: dataRows
  });
});

export default router;
