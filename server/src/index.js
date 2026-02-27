import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db/postgres.js';
import { organizationsRouter } from './routes/organizations.js';
import { projectsRouter } from './routes/projects.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { exportsRouter } from './routes/exports.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

// Seed data (idempotent — skips if admin already exists)
const seed = async () => {
  const existing = await db.getUserByEmail('admin@example.com');
  if (existing) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  const userId = uuidv4();
  const orgId = uuidv4();

  await db.createUser({
    id: userId,
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin User',
  });

  await db.createOrganization({
    id: orgId,
    name: 'Ma Première Organisation',
    slug: 'ma-premiere-org',
    description: 'Organisation par défaut pour le développement',
  });

  await db.createMembership({
    id: uuidv4(),
    userId,
    organizationId: orgId,
    role: 'admin',
    status: 'active',
  });

  console.log('Database seeded with admin@example.com / password123');
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: true, // Reflect origin for easier debugging in dev
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/organizations', authenticateToken, organizationsRouter);
app.use('/api/projects', authenticateToken, projectsRouter);
app.use('/api/dashboard', authenticateToken, dashboardRouter);
app.use('/api/exports', authenticateToken, exportsRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
