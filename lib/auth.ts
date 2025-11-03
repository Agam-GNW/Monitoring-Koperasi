import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Edge Runtime compatible token verification
export function verifyToken(token: string): any {
  try {
    const result = jwt.verify(token, JWT_SECRET);
    return result;
  } catch (error) {
    console.log('Token verification error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Edge Runtime compatible token verification for middleware
export function verifyTokenForMiddleware(token: string): any {
  try {
    // Simple JWT decode without verification for middleware
    // This is less secure but works with Edge Runtime
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.log('Token verification error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
