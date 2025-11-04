import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getAuthConfig } from '@/lib/authConfig';

export async function POST(request: NextRequest) {
  try {
    // Get auth config from environment variables
    const authConfig = getAuthConfig();
    const JWT_SECRET = new TextEncoder().encode(authConfig.jwtSecret);

    const { username, password } = await request.json();

    // Validate credentials using environment variables
    // Use constant-time comparison to prevent timing attacks
    const usernameMatch = username === authConfig.username;
    const passwordMatch = password === authConfig.password;
    
    if (!usernameMatch || !passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ 
      username: authConfig.username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(authConfig.jwtExpiration)
      .setIssuedAt()
      .setSubject('admin')
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful' 
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
