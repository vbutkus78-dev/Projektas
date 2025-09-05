import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JWTPayload, UserRole } from '../types';

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canAccessRequest(userRole: UserRole, userId: number, requestUserId: number): boolean {
  // Admin and supervisors can access all requests
  if (userRole === 'admin' || userRole === 'supervisor') {
    return true;
  }
  
  // Managers can access requests in their approval workflow
  if (userRole === 'manager') {
    return true;
  }
  
  // Accounting can access all requests for invoice management
  if (userRole === 'accounting') {
    return true;
  }
  
  // Employees can only access their own requests
  return userId === requestUserId;
}