import express from 'express';
import { db } from '../db/memory.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    let user = db.getUser(decoded.sub);
    
    // Create user if doesn't exist
    if (!user) {
      user = db.createUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
      });
    } else {
      // Update last login
      db.updateUser(decoded.sub, { lastLoginAt: new Date() });
    }
    
    // Get user organizations
    const organizations = db.getUserOrganizations(decoded.sub);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      organizations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as authRouter };
