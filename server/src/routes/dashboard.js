import express from 'express';
import { db } from '../db/memory.js';

const router = express.Router();

// Get dashboard data for an organization
router.get('/organization/:orgId', (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Check organization access
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const projects = db.getProjectsByOrganization(orgId);
    
    // Calculate KPIs
    const totalProjects = projects.length;
    const projectsAtRisk = projects.filter(p => p.currentRiskLevel === 'high').length;
    const projectsInVigilance = projects.filter(p => p.currentRiskLevel === 'medium').length;
    const projectsSecured = projects.filter(p => p.currentRiskLevel === 'low').length;
    
    // Calculate total market value
    let totalMarketValue = 0;
    const marketValueByYear = {};
    
    projects.forEach(project => {
      project.companies.forEach(company => {
        const amount = company.contractAmount || 0;
        totalMarketValue += amount;
        
        // Add avenants from decisions
        project.decisions.forEach(decision => {
          if (decision.hasFinancialImpact && decision.amount) {
            totalMarketValue += decision.amount;
          }
        });
        
        // Group by year
        if (project.startDate) {
          const year = new Date(project.startDate).getFullYear();
          if (!marketValueByYear[year]) {
            marketValueByYear[year] = 0;
          }
          marketValueByYear[year] += amount;
        }
      });
    });
    
    // Count delayed projects
    const now = new Date();
    const delayedProjects = projects.filter(p => {
      if (!p.contractualEndDate) return false;
      const endDate = new Date(p.contractualEndDate);
      return endDate < now;
    }).length;
    
    // Count companies with missing documents
    const companiesWithMissingDocs = new Set();
    projects.forEach(project => {
      project.companies.forEach(company => {
        if (!company.hasInsurance || !company.hasContract) {
          companiesWithMissingDocs.add(company.id);
        }
      });
    });
    
    // Get recent activities (last 10)
    const allActivities = [];
    projects.forEach(project => {
      const activities = db.getProjectActivities(project.id, 10);
      allActivities.push(...activities);
    });
    allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = allActivities.slice(0, 10).map(a => {
      const user = db.getUser(a.userId);
      const project = db.getProject(a.projectId);
      return {
        ...a,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        } : null,
        project: project ? {
          id: project.id,
          name: project.name,
        } : null,
      };
    });
    
    res.json({
      kpis: {
        totalProjects,
        projectsAtRisk,
        projectsInVigilance,
        projectsSecured,
        totalMarketValue,
        marketValueByYear,
        delayedProjects,
        companiesWithMissingDocs: companiesWithMissingDocs.size,
      },
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        currentScore: p.currentScore,
        currentRiskLevel: p.currentRiskLevel,
        referentMoeId: p.referentMoeId,
        createdAt: p.createdAt,
      })),
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as dashboardRouter };
