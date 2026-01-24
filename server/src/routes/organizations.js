import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memory.js';

const router = express.Router();

// Helper to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (db.getOrganizationBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// Get all organizations for current user
router.get('/', (req, res) => {
  try {
    const organizations = db.getUserOrganizations(req.user.id);
    res.json({ organizations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization by ID
router.get('/:id', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is member
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const memberCount = db.getMembershipsByOrganization(org.id)
      .filter(m => m.status === 'active').length;
    const projectCount = db.getProjectsByOrganization(org.id).length;
    
    res.json({
      ...org,
      role: membership.role,
      memberCount,
      projectCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create organization
router.post('/', (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const slug = ensureUniqueSlug(generateSlug(name));
    
    const org = {
      id: uuidv4(),
      name,
      slug,
      description,
      logoUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id,
      settings: {
        allowPublicInvites: false,
        defaultRole: 'read_only',
      },
    };
    
    db.createOrganization(org);
    
    // Create membership for creator as owner
    const membership = {
      id: uuidv4(),
      organizationId: org.id,
      userId: req.user.id,
      role: 'owner',
      joinedAt: new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.createMembership(membership);
    
    res.status(201).json({
      ...org,
      role: 'owner',
      memberCount: 1,
      projectCount: 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update organization
router.patch('/:id', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is owner
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can update organization' });
    }
    
    const updates = { ...req.body };
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    // Regenerate slug if name changed
    if (updates.name && updates.name !== org.name) {
      updates.slug = ensureUniqueSlug(generateSlug(updates.name));
    }
    
    const updated = db.updateOrganization(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete organization
router.delete('/:id', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is owner
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can delete organization' });
    }
    
    // Delete all related data
    const memberships = db.getMembershipsByOrganization(org.id);
    memberships.forEach(m => db.deleteMembership(m.id));
    
    const orgProjects = db.getProjectsByOrganization(org.id);
    orgProjects.forEach(p => db.deleteProject(p.id));
    
    db.deleteOrganization(org.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get members
router.get('/:id/members', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is member
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const memberships = db.getMembershipsByOrganization(org.id);
    const members = memberships.map(m => {
      const user = db.getUser(m.userId);
      return {
        ...m,
        user: user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        } : null,
      };
    }).filter(m => m.user);
    
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite member (simplified - just creates pending membership)
router.post('/:id/members/invite', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check permissions
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (membership.role !== 'owner' && (!org.settings.allowPublicInvites || membership.role !== 'moe')) {
      return res.status(403).json({ error: 'Insufficient permissions to invite members' });
    }
    
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    
    // Check if user already has membership
    // In real implementation, we'd look up user by email first
    // For MVP, we'll create a pending membership
    
    const newMembership = {
      id: uuidv4(),
      organizationId: org.id,
      userId: email, // Temporary: use email as ID until user accepts
      role,
      invitedBy: req.user.id,
      invitedAt: new Date(),
      joinedAt: null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.createMembership(newMembership);
    
    res.status(201).json({
      id: newMembership.id,
      email,
      role,
      status: 'pending',
      invitedAt: newMembership.invitedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member role
router.patch('/:id/members/:memberId', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is owner
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can update member roles' });
    }
    
    const memberMembership = db.getMembership(req.params.memberId);
    if (!memberMembership || memberMembership.organizationId !== org.id) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const updated = db.updateMembership(req.params.memberId, { role });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member
router.delete('/:id/members/:memberId', (req, res) => {
  try {
    const org = db.getOrganization(req.params.id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is owner
    const membership = db.getMembershipByUserAndOrg(req.user.id, org.id);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can remove members' });
    }
    
    const memberMembership = db.getMembership(req.params.memberId);
    if (!memberMembership || memberMembership.organizationId !== org.id) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Prevent removing the last owner
    if (memberMembership.role === 'owner') {
      const owners = db.getMembershipsByOrganization(org.id)
        .filter(m => m.role === 'owner' && m.status === 'active');
      if (owners.length === 1) {
        return res.status(400).json({ error: 'Cannot remove the last owner' });
      }
    }
    
    db.deleteMembership(req.params.memberId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as organizationsRouter };
