import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 86400000 // 24h
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // For development, accept Google OAuth tokens directly
    // In production, validate against Auth0
    if (process.env.NODE_ENV === 'development') {
      const decoded = jwt.decode(token, { complete: true });
      if (decoded) {
        req.user = {
          id: decoded.payload.sub,
          email: decoded.payload.email,
          name: decoded.payload.name,
        };
        return next();
      }
    }

    // Production: Validate with Auth0
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: 'Token validation failed' });
  }
};
