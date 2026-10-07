import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { JWT_SECRET, authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare(`
    SELECT u.*, t.name as tenant_name 
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE u.email = ?
  `).get(email) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Update last login
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  // Generate JWT token (expires in 7 days)
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      organization_name: user.organization_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      tenant_name: user.tenant_name,
      organization_name: user.organization_name,
      status: user.status
    }
  });
});

// POST /api/auth/signup
router.post('/signup', (req: Request, res: Response) => {
  const { name, email, password, organization, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check email collision
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const assignedRole = ['super_admin', 'facility_manager', 'energy_manager', 'tenant'].includes(role)
    ? role
    : 'facility_manager';

  // Get default tenant
  const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get() as any;
  const tenantId = tenant?.id || 'tenant-metropolis-01';

  const newId = `usr-${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, tenant_id, organization_name, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(newId, name, email, passwordHash, assignedRole, tenantId, organization || 'Enterprise Client');

  const token = jwt.sign(
    {
      id: newId,
      name,
      email,
      role: assignedRole,
      tenant_id: tenantId,
      organization_name: organization
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: {
      id: newId,
      name,
      email,
      role: assignedRole,
      tenant_id: tenantId,
      organization_name: organization,
      status: 'active'
    }
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.tenant_id, u.organization_name, u.status, u.last_login,
           t.name as tenant_name
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE u.id = ?
  `).get(req.user!.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  // Return simulated success regardless of existence to prevent enumeration
  return res.json({
    message: 'If the email exists, a password reset link has been dispatched to your inbox.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ message: 'Password has been successfully updated. Please login with your new credentials.' });
});

export default router;
