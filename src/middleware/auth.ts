import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { verifyToken, hasPermission } from '../utils/auth';
import { getUserById } from '../utils/db';
import type { Bindings, UserRole, JWTPayload } from '../types';

// Extend Context to include user information
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload & { id: number };
    userId: number;
  }
}

// Authentication middleware
export const authMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  // Get token from Authorization header or cookie
  let token = c.req.header('Authorization');
  
  if (token && token.startsWith('Bearer ')) {
    token = token.substring(7);
  } else {
    // Try to get token from cookie
    token = getCookie(c, 'auth_token');
  }

  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'No token provided' }, 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
  }

  // Check if user still exists and is active
  const user = await getUserById(c.env.DB, payload.userId);
  if (!user || !user.active) {
    return c.json({ error: 'Unauthorized', message: 'User not found or inactive' }, 401);
  }

  // Set user info in context
  c.set('user', { ...payload, id: payload.userId, ...user });
  c.set('userId', payload.userId);
  
  await next();
});

// Role-based authorization middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401);
    }

    if (!hasPermission(user.role, roleArray)) {
      return c.json({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${roleArray.join(', ')}` 
      }, 403);
    }

    await next();
  });
};

// Admin only middleware
export const adminOnly = requireRole('admin');

// Manager+ middleware (manager, supervisor, admin)
export const managerPlus = requireRole(['manager', 'supervisor', 'admin']);

// Supervisor+ middleware (supervisor, admin)
export const supervisorPlus = requireRole(['supervisor', 'admin']);