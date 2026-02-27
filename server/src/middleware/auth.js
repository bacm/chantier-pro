import jwt from 'jsonwebtoken';
import { db } from '../db/memory.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  jwt.verify(token, JWT_SECRET, async (err, userPayload) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // userPayload contains { userId: '...' }
    const user = db.getUser(userPayload.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user to request object (excluding password for security)
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
    next();
  });
};