// Centralized authentication configuration
// All credentials should come from environment variables

export interface AuthConfig {
  username: string;
  password: string;
  jwtSecret: string;
  jwtExpiration: string;
}

export function getAuthConfig(): AuthConfig {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiration = process.env.JWT_EXPIRATION || '24h';

  // Validate required environment variables
  if (!username || !password) {
    throw new Error(
      'ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables'
    );
  }

  if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    throw new Error(
      'JWT_SECRET must be set to a strong random value in environment variables. ' +
      'Generate with: openssl rand -base64 32'
    );
  }

  return {
    username,
    password,
    jwtSecret,
    jwtExpiration,
  };
}

