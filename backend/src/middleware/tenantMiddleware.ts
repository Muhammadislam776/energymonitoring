import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { db } from '../db/database';

export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Super admin can access all tenants, unless explicitly filtering
  if (req.user.role === 'super_admin') {
    return next();
  }

  // For tenant users, ensure they only access their tenant's resources
  const userTenantId = req.user.tenant_id;
  if (!userTenantId) {
    return res.status(403).json({ error: 'Access denied: User has no assigned tenant' });
  }

  // Verify building ownership if buildingId is passed in params, query, or body
  const buildingId = (req.params.buildingId || req.query.buildingId || req.body.building_id || req.body.buildingId) as string;
  if (buildingId) {
    const bldg = db.prepare('SELECT tenant_id FROM buildings WHERE id = ?').get(buildingId) as any;
    if (bldg && bldg.tenant_id !== userTenantId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access resources belonging to another tenant'
      });
    }
  }

  next();
}
