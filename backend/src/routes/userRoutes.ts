import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users
router.get('/', authMiddleware, requireRole(['super_admin', 'facility_manager']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.tenant_id, u.organization_name, u.status, u.last_login, u.created_at,
           t.name as tenant_name, t.code as tenant_code
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    ORDER BY u.created_at DESC
  `).all();

  return res.json(users);
});

// POST /api/users
router.post('/', authMiddleware, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, tenant_id, organization_name } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newId = `usr-${Date.now()}`;
  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, tenant_id, organization_name, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(newId, name, email, hash, role, tenant_id || null, organization_name || 'Enterprise');

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, resource, details)
    VALUES (?, ?, ?, ?, 'USER_CREATE', ?, ?)
  `).run(`aud-${Date.now()}`, req.user?.tenant_id, req.user?.id, req.user?.name, `User ${email}`, `Created with role ${role}`);

  const created = db.prepare('SELECT id, name, email, role, tenant_id, status FROM users WHERE id = ?').get(newId);
  return res.status(201).json(created);
});

// PUT /api/users/:id
router.put('/:id', authMiddleware, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, tenant_id, status } = req.body;

  db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        role = COALESCE(?, role),
        tenant_id = COALESCE(?, tenant_id),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, role, tenant_id, status, id);

  const updated = db.prepare('SELECT id, name, email, role, tenant_id, status FROM users WHERE id = ?').get(id);
  return res.json(updated);
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, requireRole(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user?.id) {
    return res.status(400).json({ error: 'Cannot delete current logged-in user' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res.json({ message: 'User deleted successfully' });
});

export default router;
