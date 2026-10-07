import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

import { checkSupabaseStatus } from '../services/supabase';

const router = Router();

// GET /api/settings
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.user?.tenant_id || 'tenant-metropolis-01';

  let settings = db.prepare('SELECT * FROM system_settings WHERE tenant_id = ?').get(tenantId) as any;
  if (!settings) {
    settings = {
      cost_per_kwh: 0.16,
      carbon_factor: 0.42,
      peak_demand_threshold: 650.0,
      daily_target_kwh: 4200.0,
      email_alerts: 1,
      in_app_alerts: 1,
      simulator_speed: 1.0
    };
  }

  // Also fetch organization details
  const org = db.prepare('SELECT * FROM organizations LIMIT 1').get();

  const sbStatus = await checkSupabaseStatus();

  return res.json({
    settings,
    organization: org,
    integrations: {
      supabaseCloud: {
        status: sbStatus.connected ? 'Connected' : 'Offline',
        projectUrl: 'https://qwvajvktwxvbzsheikxj.supabase.co',
        projectId: 'qwvajvktwxvbzsheikxj',
        info: sbStatus.info
      },
      modbusGateway: 'Connected (Port 502 / TCP)',
      bacnetIp: 'Online (BACnet/IP 47808)',
      mqttBroker: 'Connected (tls://broker.energytwin.io)',
      activeMetersCount: 24,
      webSocketServer: 'Active (ws://localhost:5000)'
    }
  });
});

// GET /api/settings/supabase/test
router.get('/supabase/test', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  const status = await checkSupabaseStatus();
  return res.json(status);
});

// PUT /api/settings
router.put('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.user?.tenant_id || 'tenant-metropolis-01';
  const { cost_per_kwh, carbon_factor, peak_demand_threshold, daily_target_kwh, email_alerts, in_app_alerts } = req.body;

  db.prepare(`
    INSERT INTO system_settings (id, tenant_id, cost_per_kwh, carbon_factor, peak_demand_threshold, daily_target_kwh, email_alerts, in_app_alerts, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      cost_per_kwh = excluded.cost_per_kwh,
      carbon_factor = excluded.carbon_factor,
      peak_demand_threshold = excluded.peak_demand_threshold,
      daily_target_kwh = excluded.daily_target_kwh,
      email_alerts = excluded.email_alerts,
      in_app_alerts = excluded.in_app_alerts,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    `sett-${tenantId}`, tenantId,
    cost_per_kwh || 0.16, carbon_factor || 0.42,
    peak_demand_threshold || 650.0, daily_target_kwh || 4200.0,
    email_alerts !== undefined ? (email_alerts ? 1 : 0) : 1,
    in_app_alerts !== undefined ? (in_app_alerts ? 1 : 0) : 1
  );

  // Add audit log
  db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, resource, details)
    VALUES (?, ?, ?, ?, 'SETTINGS_UPDATE', 'System Settings', 'Updated tariff rates & thresholds')
  `).run(`aud-${Date.now()}`, tenantId, req.user?.id, req.user?.name);

  return res.json({ message: 'Settings saved successfully' });
});

// GET /api/settings/audit-logs
router.get('/audit-logs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.prepare(`
    SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50
  `).all();

  return res.json(logs);
});

export default router;
