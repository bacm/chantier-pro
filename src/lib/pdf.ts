import { Project, RiskLevel } from '@/types';
import { DECISION_TYPE_LABELS, getProblematicDecisions, getRiskLevelLabel } from './scoring';
import { formatDate, formatDateTime, getProjectTypeLabel } from './projects';
import { AUDIT_QUESTIONS, getFailedQuestions, getCategories } from './audit';

export const generateProjectStatusPDF = (project: Project): void => {
  const problematicDecisions = getProblematicDecisions(project.decisions);
  const positiveDecisions = project.decisions.filter(d => d.scoreImpact > 0);
  const failedAuditQuestions = project.auditResult 
    ? getFailedQuestions(project.auditResult.answers)
    : [];
  
  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case 'low': return '#059669';
      case 'medium': return '#d97706';
      case 'high': return '#dc2626';
    }
  };

  const getRiskBackground = (level: RiskLevel): string => {
    switch (level) {
      case 'low': return '#d1fae5';
      case 'medium': return '#fef3c7';
      case 'high': return '#fee2e2';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>État de traçabilité - ${project.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
          line-height: 1.5; 
          color: #1e293b;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header { 
          border-bottom: 3px solid #1e3a5f; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .logo { 
          font-size: 24px; 
          font-weight: 700; 
          color: #1e3a5f;
          letter-spacing: -0.5px;
        }
        .document-title { 
          font-size: 20px; 
          color: #475569;
          margin-top: 8px;
        }
        .project-info { 
          background: #f8fafc; 
          padding: 20px; 
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .project-name { 
          font-size: 18px; 
          font-weight: 600;
          margin-bottom: 12px;
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 8px;
          font-size: 14px;
        }
        .info-label { color: #64748b; }
        .score-section {
          background: ${getRiskBackground(project.currentRiskLevel)};
          border: 2px solid ${getRiskColor(project.currentRiskLevel)};
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin-bottom: 30px;
        }
        .score-value {
          font-size: 48px;
          font-weight: 700;
          color: ${getRiskColor(project.currentRiskLevel)};
        }
        .score-label {
          font-size: 14px;
          color: #475569;
          margin-top: 4px;
        }
        .risk-badge {
          display: inline-block;
          background: ${getRiskColor(project.currentRiskLevel)};
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin-top: 12px;
        }
        .section { margin-bottom: 30px; }
        .section-title { 
          font-size: 16px; 
          font-weight: 600;
          color: #1e3a5f;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .risk-item {
          background: #fff5f5;
          border-left: 3px solid #dc2626;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 0 4px 4px 0;
        }
        .risk-item-title {
          font-weight: 500;
          color: #dc2626;
          font-size: 14px;
        }
        .risk-item-desc {
          font-size: 13px;
          color: #475569;
          margin-top: 4px;
        }
        .positive-item {
          background: #f0fdf4;
          border-left: 3px solid #059669;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 0 4px 4px 0;
        }
        .positive-item-title {
          font-weight: 500;
          color: #059669;
          font-size: 14px;
        }
        .decision-item {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        .decision-meta {
          color: #64748b;
          font-size: 12px;
          margin-top: 4px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        .stat-box {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e3a5f;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }
        .empty-state {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          padding: 20px;
        }
        @media print {
          body { padding: 20px; }
          .score-section { break-inside: avoid; }
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Traçabilité Chantier</div>
        <div class="document-title">État de traçabilité du projet</div>
      </div>

      <div class="project-info">
        <div class="project-name">${project.name}</div>
        <div class="info-grid">
          <div><span class="info-label">Adresse :</span> ${project.address}</div>
          <div><span class="info-label">Client :</span> ${project.client}</div>
          <div><span class="info-label">Type :</span> ${getProjectTypeLabel(project.projectType)}</div>
          <div><span class="info-label">Créé le :</span> ${formatDate(project.createdAt)}</div>
        </div>
      </div>

      <div class="score-section">
        <div class="score-value">${project.currentScore}%</div>
        <div class="score-label">Score de traçabilité</div>
        <div class="risk-badge">${getRiskLevelLabel(project.currentRiskLevel)}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${project.decisions.length}</div>
          <div class="stat-label">Décisions enregistrées</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #dc2626">${problematicDecisions.length}</div>
          <div class="stat-label">Décisions à risque</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #059669">${positiveDecisions.length}</div>
          <div class="stat-label">Décisions conformes</div>
        </div>
      </div>

      ${problematicDecisions.length > 0 ? `
        <div class="section">
          <div class="section-title">⚠️ Décisions à risque (documentation insuffisante)</div>
          ${problematicDecisions.map(d => `
            <div class="risk-item">
              <div class="risk-item-title">${DECISION_TYPE_LABELS[d.type]} (${d.scoreImpact} points)</div>
              <div class="risk-item-desc">${d.description}</div>
              <div class="decision-meta">
                ${formatDateTime(new Date(d.createdAt))}
                ${!d.hasWrittenValidation ? ' • Pas de validation écrite' : ''}
                ${!d.hasProofAttached ? ' • Pas de preuve jointe' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${failedAuditQuestions.length > 0 ? `
        <div class="section">
          <div class="section-title">📋 Points d'audit non conformes</div>
          ${failedAuditQuestions.map(q => `
            <div class="risk-item">
              <div class="risk-item-title">${q.category}</div>
              <div class="risk-item-desc">${q.question}</div>
              <div class="decision-meta">Recommandation : ${q.recommendation}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${positiveDecisions.length > 0 ? `
        <div class="section">
          <div class="section-title">✓ Décisions bien documentées</div>
          ${positiveDecisions.slice(0, 5).map(d => `
            <div class="positive-item">
              <div class="positive-item-title">${DECISION_TYPE_LABELS[d.type]} (+${d.scoreImpact} points)</div>
              <div class="risk-item-desc">${d.description}</div>
            </div>
          `).join('')}
          ${positiveDecisions.length > 5 ? `<p class="empty-state">Et ${positiveDecisions.length - 5} autres décisions conformes...</p>` : ''}
        </div>
      ` : ''}

      <div class="footer">
        Document généré le ${formatDateTime(new Date())} • Ce document est un état des lieux de la traçabilité et ne constitue pas un avis juridique.
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};
