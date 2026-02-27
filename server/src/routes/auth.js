import express from 'express';
import { db } from '../db/memory.js';

const router = express.Router();

const DEV_USER = {
  id: 'dev-user-1',
  email: 'dev@chantier-pro.fr',
  name: 'Utilisateur Dev',
  avatar: undefined,
};

// Get current user info
router.get('/me', async (req, res) => {
  try {
    let user = db.getUser(DEV_USER.id);

    // Create user if doesn't exist
    if (!user) {
      user = db.createUser(DEV_USER);
    } else {
      db.updateUser(DEV_USER.id, { lastLoginAt: new Date() });
    }

    const organizations = db.getUserOrganizations(DEV_USER.id);

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
