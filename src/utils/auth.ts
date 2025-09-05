import type { JWTPayload, UserRole } from '../types';

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Simple password hashing (demo only - not for production!)
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + 'deadbeef123456789abcdef123456789abcdef';
}

export async function hashPassword(password: string): Promise<string> {
  return simpleHash(password + 'salt');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Simple JWT implementation (for demo - in production use proper JWT library)
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 86400 }; // 24h
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    const expectedSig = btoa(`${parts[0]}.${parts[1]}.${JWT_SECRET}`);
    
    if (parts[2] !== expectedSig) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload as JWTPayload;
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