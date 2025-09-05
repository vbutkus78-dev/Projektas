import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { verifyPassword, generateToken } from '../utils/auth';
import { getUserByEmail } from '../utils/db';
import { authMiddleware } from '../middleware/auth';
import type { Bindings, LoginRequest } from '../types';

const auth = new Hono<{ Bindings: Bindings }>();

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({
        error: 'Validation Error',
        message: 'Email and password are required'
      }, 400);
    }

    // Get user by email
    const user = await getUserByEmail(c.env.DB, email);
    if (!user) {
      return c.json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      }, 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Set cookie (optional - for web app convenience)
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 86400 // 24 hours
    });

    // Return user data without password hash
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'An error occurred during login'
    }, 500);
  }
});

// Logout endpoint
auth.post('/logout', (c) => {
  // Clear auth cookie
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0
  });

  return c.json({ message: 'Logged out successfully' });
});

// Get current user info
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Get fresh user data from database
    const currentUser = await getUserByEmail(c.env.DB, user.email);
    if (!currentUser) {
      return c.json({
        error: 'User Not Found',
        message: 'User no longer exists'
      }, 404);
    }

    const { password_hash, ...userWithoutPassword } = currentUser;
    return c.json(userWithoutPassword);

  } catch (error) {
    console.error('Get user error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user information'
    }, 500);
  }
});

// Refresh token endpoint
auth.post('/refresh', authMiddleware, (c) => {
  const user = c.get('user');
  
  // Generate new token
  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  });

  // Update cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 86400 // 24 hours
  });

  return c.json({ token });
});

export default auth;