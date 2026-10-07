import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'energytwin-enterprise-secret-key-2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant';
  tenant_id: string | null;
  organization_name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    // Check if user still exists in database
    const user = db.prepare('SELECT id, name, email, role, tenant_id, organization_name, status FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User is inactive or not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

export function requireRole(allowedRoles: Array<'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Action requires one of [${allowedRoles.join(', ')}] permissions`
      });
    }
    next();
  };
}
