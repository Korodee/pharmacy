import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { getAuthConfig } from './authConfig';

function getJwtSecret() {
  try {
    const authConfig = getAuthConfig();
    return new TextEncoder().encode(authConfig.jwtSecret);
  } catch (error) {
    // Fallback for development only - should not happen in production
    console.error('Error getting auth config:', error);
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET must be configured in environment variables');
    }
    return new TextEncoder().encode(secret);
  }
}

export async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const JWT_SECRET = getJwtSecret();
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const payload = await verifyToken(request);
  return payload !== null && payload.role === 'admin';
}
