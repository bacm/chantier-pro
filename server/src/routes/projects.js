import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memory.js';

const router = express.Router();

// Helper to check project access
function hasProjectAccess(userId, projectId, requiredRole = 'viewer') {
  const project = db.getProject(projectId);
  if (!project) return false;
  
  // Check organization membership
  const membership = db.getMembershipByUserAndOrg(userId, project.organizationId);
  if (!membership || membership.status !== 'active') return false;
  
  // Check project-specific access override
  const projectAccess = db.getProjectAccessByUser(projectId, userId);
  if (projectAccess) {
    // Project access overrides organization role
    const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
    return roleHierarchy[projectAccess.role] >= roleHierarchy[requiredRole];
  }
  
  // Use organization role
  const roleMap = {
    owner: 'owner',
    moe: 'editor',
    assistant: 'editor',
    read_only: 'viewer',
  };
  
  const effectiveRole = roleMap[membership.role] || 'viewer';
  const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
  return roleHierarchy[effectiveRole] >= roleHierarchy[requiredRole];
}

// Get projects for an organization
router.get('/organization/:orgId', (req, res) => {
  try {
    const { orgId } = req.params;
    const { referentMoeId, status, year, page = 1, limit = 20 } = req.query;
    
    // Check organization access
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const filters = {};
    if (referentMoeId) filters.referentMoeId = referentMoeId;
    if (status) filters.status = status;
    if (year) filters.year = parseInt(year);
    
    let projects = db.getProjectsByOrganization(orgId, filters);
    
    // Pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginatedProjects = projects.slice(start, end);
    
    res.json({
      projects: paginatedProjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: projects.length,
        totalPages: Math.ceil(projects.length / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'viewer')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/organization/:orgId', (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Check organization access (need moe, assistant, or owner)
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!['owner', 'moe', 'assistant'].includes(membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to create projects' });
    }
    
    const projectData = req.body;
    
    const project = {
      id: uuidv4(),
      organizationId: orgId,
      createdBy: req.user.id,
      referentMoeId: projectData.referentMoeId,
      name: projectData.name,
      address: projectData.address,
      projectType: projectData.projectType,
      status: projectData.status,
      calibration: projectData.calibration,
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
      contractualEndDate: projectData.contractualEndDate ? new Date(projectData.contractualEndDate) : undefined,
      estimatedEndDate: projectData.estimatedEndDate ? new Date(projectData.estimatedEndDate) : undefined,
      companies: projectData.companies || [],
      decisions: projectData.decisions || [],
      reports: projectData.reports || [],
      snags: projectData.snags || [],
      payments: projectData.payments || [],
      initialScore: projectData.initialScore || 50,
      currentScore: projectData.currentScore || 50,
      currentRiskLevel: projectData.currentRiskLevel || 'medium',
    };
    
    db.createProject(project);
    
    // Create activity
    db.createActivity({
      id: uuidv4(),
      projectId: project.id,
      userId: req.user.id,
      action: 'created',
      entityType: 'project',
      entityId: project.id,
      description: `Projet "${project.name}" créé`,
      createdAt: new Date(),
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.patch('/:id', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'editor')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updates = { ...req.body };
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.organizationId;
    
    // Convert date strings to Date objects
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.contractualEndDate) updates.contractualEndDate = new Date(updates.contractualEndDate);
    if (updates.estimatedEndDate) updates.estimatedEndDate = new Date(updates.estimatedEndDate);
    
    const updated = db.updateProject(req.params.id, updates);
    
    // Create activity
    db.createActivity({
      id: uuidv4(),
      projectId: project.id,
      userId: req.user.id,
      action: 'updated',
      entityType: 'project',
      entityId: project.id,
      description: `Projet "${project.name}" modifié`,
      metadata: { fields: Object.keys(updates) },
      createdAt: new Date(),
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is owner of project or organization
    const membership = db.getMembershipByUserAndOrg(req.user.id, project.organizationId);
    const isOrgOwner = membership && membership.role === 'owner';
    const isProjectOwner = hasProjectAccess(req.user.id, project.id, 'owner');
    
    if (!isOrgOwner && !isProjectOwner) {
      return res.status(403).json({ error: 'Only owners can delete projects' });
    }
    
    db.deleteProject(req.params.id);
    
    // Delete related accesses
    const accesses = db.getProjectAccesses(req.params.id);
    accesses.forEach(a => db.deleteProjectAccess(a.id));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project access list
router.get('/:id/access', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'viewer')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const accesses = db.getProjectAccesses(req.params.id);
    const accessList = accesses.map(a => {
      const user = db.getUser(a.userId);
      return {
        ...a,
        user: user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        } : null,
      };
    }).filter(a => a.user);
    
    res.json({ accesses: accessList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add project access
router.post('/:id/access', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'owner')) {
      return res.status(403).json({ error: 'Only project owners can grant access' });
    }
    
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }
    
    const access = {
      id: uuidv4(),
      projectId: project.id,
      userId,
      role,
      grantedBy: req.user.id,
      grantedAt: new Date(),
      createdAt: new Date(),
    };
    
    db.createProjectAccess(access);
    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove project access
router.delete('/:id/access/:accessId', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'owner')) {
      return res.status(403).json({ error: 'Only project owners can remove access' });
    }
    
    db.deleteProjectAccess(req.params.accessId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project activities
router.get('/:id/activities', (req, res) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!hasProjectAccess(req.user.id, project.id, 'viewer')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const activities = db.getProjectActivities(req.params.id);
    const activitiesWithUsers = activities.map(a => {
      const user = db.getUser(a.userId);
      return {
        ...a,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        } : null,
      };
    });
    
    res.json({ activities: activitiesWithUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as projectsRouter };
