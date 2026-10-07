import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/tenants
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const tenants = db.prepare(`
    SELECT t.*, o.name as organization_name,
      (SELECT COUNT(*) FROM buildings WHERE tenant_id = t.id) as buildings_count,
      (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as users_count
    FROM tenants t
    JOIN organizations o ON t.organization_id = o.id
  `).all();

  return res.json(tenants);
});

// GET /api/tenants/organizations
router.get('/organizations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgs = db.prepare('SELECT * FROM organizations').all();
  return res.json(orgs);
});

export default router;
