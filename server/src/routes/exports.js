import express from 'express';
import { db } from '../db/memory.js';

const router = express.Router();

// Helper to convert to CSV
function arrayToCSV(data, headers) {
  const headerRow = headers.join(',');
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

// Export projects list
router.get('/organization/:orgId/projects', (req, res) => {
  try {
    const { orgId } = req.params;
    const { format = 'csv', referentMoeId, status, year } = req.query;
    
    // Check organization access
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const filters = {};
    if (referentMoeId) filters.referentMoeId = referentMoeId;
    if (status) filters.status = status;
    if (year) filters.year = parseInt(year);
    
    const projects = db.getProjectsByOrganization(orgId, filters);
    
    const headers = ['Nom', 'Adresse', 'Type', 'Statut', 'Score', 'Niveau de risque', 'Date de création'];
    const data = projects.map(p => ({
      'Nom': p.name,
      'Adresse': p.address,
      'Type': p.projectType,
      'Statut': p.status,
      'Score': p.currentScore,
      'Niveau de risque': p.currentRiskLevel,
      'Date de création': new Date(p.createdAt).toLocaleDateString('fr-FR'),
    }));
    
    const csv = arrayToCSV(data, headers);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="projets-${orgId}-${Date.now()}.csv"`);
    res.send('\ufeff' + csv); // BOM for Excel
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export companies
router.get('/organization/:orgId/companies', (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Check organization access
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const projects = db.getProjectsByOrganization(orgId);
    const companiesMap = new Map();
    
    projects.forEach(project => {
      project.companies.forEach(company => {
        const key = `${company.name}-${company.trade}`;
        if (!companiesMap.has(key)) {
          companiesMap.set(key, {
            ...company,
            projects: [],
            totalMarketValue: 0,
          });
        }
        const entry = companiesMap.get(key);
        entry.projects.push(project.name);
        entry.totalMarketValue += company.contractAmount || 0;
        
        // Add avenants
        project.decisions.forEach(decision => {
          if (decision.companyId === company.id && decision.hasFinancialImpact && decision.amount) {
            entry.totalMarketValue += decision.amount;
          }
        });
      });
    });
    
    const headers = ['Nom', 'Corps d\'état', 'Contact', 'Email', 'Téléphone', 'Assurance', 'Contrat', 'Marché HT', 'Projets'];
    const data = Array.from(companiesMap.values()).map(c => ({
      'Nom': c.name,
      'Corps d\'état': c.trade,
      'Contact': c.contactName || '',
      'Email': c.email || '',
      'Téléphone': c.phone || '',
      'Assurance': c.hasInsurance ? 'Oui' : 'Non',
      'Contrat': c.hasContract ? 'Oui' : 'Non',
      'Marché HT': c.totalMarketValue.toFixed(2),
      'Projets': c.projects.join('; '),
    }));
    
    const csv = arrayToCSV(data, headers);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="entreprises-${orgId}-${Date.now()}.csv"`);
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export snags
router.get('/organization/:orgId/snags', (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Check organization access
    const membership = db.getMembershipByUserAndOrg(req.user.id, orgId);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const projects = db.getProjectsByOrganization(orgId);
    const snags = [];
    
    projects.forEach(project => {
      project.snags.forEach(snag => {
        const company = project.companies.find(c => c.id === snag.companyId);
        snags.push({
          projet: project.name,
          description: snag.description,
          entreprise: company?.name || 'Inconnue',
          localisation: snag.location || '',
          date_constat: new Date(snag.foundDate).toLocaleDateString('fr-FR'),
          statut: snag.isCleared ? 'Levée' : 'En cours',
          date_levée: snag.clearedDate ? new Date(snag.clearedDate).toLocaleDateString('fr-FR') : '',
        });
      });
    });
    
    const headers = ['Projet', 'Description', 'Entreprise', 'Localisation', 'Date de constat', 'Statut', 'Date de levée'];
    const csv = arrayToCSV(snags, headers);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reserves-${orgId}-${Date.now()}.csv"`);
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as exportsRouter };
