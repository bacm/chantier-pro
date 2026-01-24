import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { organizationsRouter } from './routes/organizations.js';
import { projectsRouter } from './routes/projects.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { exportsRouter } from './routes/exports.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
