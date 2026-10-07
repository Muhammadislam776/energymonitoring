import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { broadcastEvent } from '../websocket/wsServer';
import { runSeed } from '../db/seed';

const router = Router();

// POST /api/simulator/trigger-spike
router.post('/trigger-spike', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { equipmentId = 'eq-003', spikeKw = 52.4 } = req.body;

  const eq = db.prepare('SELECT * FROM equipment WHERE id = ?').get(equipmentId) as any;
  if (!eq) {
    return res.status(404).json({ error: 'Equipment not found' });
  }

  // Update equipment power and status
  db.prepare(`
    UPDATE equipment
    SET current_power = ?, status = 'warning'
    WHERE id = ?
  `).run(spikeKw, equipmentId);

  // Create anomaly
  const anomId = `anom-${Date.now()}`;
  const diffPct = Number((((spikeKw - eq.rated_power) / eq.rated_power) * 100).toFixed(1));

  db.prepare(`
    INSERT INTO anomalies (id, meter_id, equipment_id, building_id, floor_id, severity, title, detected_at, measured_value, expected_value, difference_pct, confidence, explanation, evidence_json, status)
    VALUES (?, ?, ?, ?, ?, 'high', ?, datetime('now'), ?, ?, ?, 96.0, ?, ?, 'active')
  `).run(
    anomId, eq.connected_meter_id, eq.id, eq.building_id, eq.floor_id,
    `${eq.name} Sudden Thermal Load Surge`,
    spikeKw, eq.rated_power, diffPct,
    `${eq.name} spiked to ${spikeKw} kW (+${diffPct}% above rated ${eq.rated_power} kW). High thermal load detected.`,
    JSON.stringify({
      historicalBaseline: `${eq.rated_power} kW nominal`,
      spikeDelta: `+${(spikeKw - eq.rated_power).toFixed(1)} kW`,
      triggerReason: 'Manual simulator event injection'
    })
  );

  // Create alert
  const alertId = `alt-${Date.now()}`;
  db.prepare(`
    INSERT INTO alerts (id, tenant_id, building_id, type, severity, title, message, location, current_value, threshold, status)
    VALUES (?, ?, ?, 'anomaly_detected', 'critical', ?, ?, ?, ?, ?, 'new')
  `).run(
    alertId, req.user?.tenant_id || 'tenant-metropolis-01', eq.building_id,
    `Spike Anomaly Detected on ${eq.name}`,
    `${eq.name} is drawing ${spikeKw} kW (threshold: ${eq.rated_power} kW).`,
    `${eq.name}`, spikeKw, eq.rated_power
  );

  // Broadcast WebSocket events
  broadcastEvent('equipment.updated', { id: eq.id, power: spikeKw, status: 'warning' });
  broadcastEvent('anomaly.detected', {
    id: anomId,
    title: `${eq.name} Sudden Thermal Load Surge`,
    measured: spikeKw,
    expected: eq.rated_power
  });
  broadcastEvent('alert.created', {
    id: alertId,
    severity: 'critical',
    title: `Spike Anomaly Detected on ${eq.name}`,
    message: `${eq.name} is drawing ${spikeKw} kW.`
  });

  return res.json({
    message: `Injected spike of ${spikeKw} kW on ${eq.name}. Anomaly and Alert generated.`,
    equipmentId: eq.id,
    anomalyId: anomId,
    alertId
  });
});

// POST /api/simulator/reset
router.post('/reset', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  runSeed();
  broadcastEvent('system.reset', { message: 'Database reset to initial demo baseline' });
  return res.json({ message: 'Database and simulator state reset successfully' });
});

export default router;
