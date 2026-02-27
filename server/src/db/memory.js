// Base de données en mémoire pour le MVP
// À remplacer par une vraie base de données (PostgreSQL, MongoDB, etc.) en production

let users = new Map();
let organizations = new Map();
let memberships = new Map();
let projects = new Map();
let projectAccesses = new Map();
let projectActivities = new Map();

// Helper functions
export const db = {
  // Users
  createUser: (user) => {
    users.set(user.id, { ...user, createdAt: new Date(), lastLoginAt: new Date() });
    return user;
  },
  
  getUser: (id) => {
    return users.get(id) || null;
  },

  getUserByEmail: (email) => {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },
  
  updateUser: (id, updates) => {
    const user = users.get(id);
    if (user) {
      users.set(id, { ...user, ...updates, updatedAt: new Date() });
      return users.get(id);
    }
    return null;
  },
  
  // Organizations
  createOrganization: (org) => {
    organizations.set(org.id, org);
    return org;
  },
  
  getOrganization: (id) => {
    return organizations.get(id) || null;
  },
  
  getOrganizationBySlug: (slug) => {
    for (const org of organizations.values()) {
      if (org.slug === slug) return org;
    }
    return null;
  },
  
  updateOrganization: (id, updates) => {
    const org = organizations.get(id);
    if (org) {
      organizations.set(id, { ...org, ...updates, updatedAt: new Date() });
      return organizations.get(id);
    }
    return null;
  },
  
  deleteOrganization: (id) => {
    return organizations.delete(id);
  },
  
  getUserOrganizations: (userId) => {
    const userMemberships = Array.from(memberships.values())
      .filter(m => m.userId === userId && m.status === 'active');
    
    return userMemberships.map(m => {
      const org = organizations.get(m.organizationId);
      if (!org) return null;
      return {
        ...org,
        role: m.role,
        memberCount: Array.from(memberships.values())
          .filter(mem => mem.organizationId === org.id && mem.status === 'active').length,
        projectCount: Array.from(projects.values())
          .filter(p => p.organizationId === org.id).length,
      };
    }).filter(Boolean);
  },
  
  // Memberships
  createMembership: (membership) => {
    memberships.set(membership.id, membership);
    return membership;
  },
  
  getMembership: (id) => {
    return memberships.get(id) || null;
  },
  
  getMembershipsByOrganization: (organizationId) => {
    return Array.from(memberships.values())
      .filter(m => m.organizationId === organizationId);
  },
  
  getMembershipByUserAndOrg: (userId, organizationId) => {
    for (const m of memberships.values()) {
      if (m.userId === userId && m.organizationId === organizationId) {
        return m;
      }
    }
    return null;
  },
  
  updateMembership: (id, updates) => {
    const membership = memberships.get(id);
    if (membership) {
      memberships.set(id, { ...membership, ...updates, updatedAt: new Date() });
      return memberships.get(id);
    }
    return null;
  },
  
  deleteMembership: (id) => {
    return memberships.delete(id);
  },
  
  // Projects
  createProject: (project) => {
    projects.set(project.id, project);
    return project;
  },
  
  getProject: (id) => {
    return projects.get(id) || null;
  },
  
  getProjectsByOrganization: (organizationId, filters = {}) => {
    let results = Array.from(projects.values())
      .filter(p => p.organizationId === organizationId);
    
    if (filters.referentMoeId) {
      results = results.filter(p => p.referentMoeId === filters.referentMoeId);
    }
    
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }
    
    if (filters.year) {
      results = results.filter(p => {
        const year = p.startDate ? new Date(p.startDate).getFullYear() : null;
        return year === filters.year;
      });
    }
    
    return results;
  },
  
  updateProject: (id, updates) => {
    const project = projects.get(id);
    if (project) {
      projects.set(id, { ...project, ...updates, updatedAt: new Date() });
      return projects.get(id);
    }
    return null;
  },
  
  deleteProject: (id) => {
    return projects.delete(id);
  },
  
  // ProjectAccess
  createProjectAccess: (access) => {
    projectAccesses.set(access.id, access);
    return access;
  },
  
  getProjectAccesses: (projectId) => {
    return Array.from(projectAccesses.values())
      .filter(a => a.projectId === projectId);
  },
  
  getProjectAccessByUser: (projectId, userId) => {
    for (const access of projectAccesses.values()) {
      if (access.projectId === projectId && access.userId === userId) {
        return access;
      }
    }
    return null;
  },
  
  deleteProjectAccess: (id) => {
    return projectAccesses.delete(id);
  },
  
  // ProjectActivity
  createActivity: (activity) => {
    projectActivities.set(activity.id, activity);
    return activity;
  },
  
  getProjectActivities: (projectId, limit = 50) => {
    return Array.from(projectActivities.values())
      .filter(a => a.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },
  
  // Utility
  clear: () => {
    users.clear();
    organizations.clear();
    memberships.clear();
    projects.clear();
    projectAccesses.clear();
    projectActivities.clear();
  }
};
