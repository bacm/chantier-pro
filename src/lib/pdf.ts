import { Project, RiskLevel, CalibrationResponse } from '@/types';
import { formatDate, formatDateTime, getProjectTypeLabel, getProjectStatusLabel } from './projects';
import { getRiskLevelLabel, DECISION_TYPE_LABELS, getProblematicDecisions, getPositiveDecisions } from './scoring';

export const generateProjectStatusPDF = (project: Project) => {
  const problematicDecisions = getProblematicDecisions(project.decisions);
  const positiveDecisions = getPositiveDecisions(project.decisions);
  
  const formatCalibrationResponse = (response: CalibrationResponse): string => {
    switch (response) {
      case 'yes': return 'Oui';
      case 'no': return 'Non';
      case 'unknown': return 'Inconnu';
      default: return '-';
    }
  };
  
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
          font-family: 'Georgia', serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #1a1a2e;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #1a1a2e;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24pt;
          margin-bottom: 5px;
        }
        .header .subtitle {
          color: #666;
          font-size: 12pt;
        }
        .meta {
          display: flex;
          gap: 40px;
          margin-bottom: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .meta-item {
          flex: 1;
        }
        .meta-label {
          font-size: 9pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .meta-value {
          font-size: 11pt;
          font-weight: 600;
        }
        .score-section {
          text-align: center;
          padding: 30px;
          background: ${getRiskBackground(project.currentRiskLevel)};
          border: 2px solid ${getRiskColor(project.currentRiskLevel)};
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .score-value {
          font-size: 48pt;
          font-weight: bold;
          color: ${getRiskColor(project.currentRiskLevel)};
        }
        .score-label {
          font-size: 12pt;
          color: #666;
          margin-top: 4px;
        }
        .risk-badge {
          display: inline-block;
          background: ${getRiskColor(project.currentRiskLevel)};
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          font-size: 14pt;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        .decision-item {
          padding: 12px;
          margin-bottom: 10px;
          border-left: 3px solid;
          background: #f8f9fa;
        }
        .decision-item.negative { border-color: #ef4444; }
        .decision-item.positive { border-color: #10b981; }
        .decision-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .decision-type {
          font-weight: 600;
          font-size: 10pt;
        }
        .decision-impact {
          font-weight: 600;
          font-size: 10pt;
        }
        .decision-impact.negative { color: #ef4444; }
        .decision-impact.positive { color: #10b981; }
        .decision-desc {
          color: #333;
          font-size: 10pt;
        }
        .decision-meta {
          font-size: 9pt;
          color: #666;
          margin-top: 5px;
        }
        .calibration {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
        }
        .calibration-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .calibration-item:last-child {
          border-bottom: none;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 9pt;
          color: #666;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>État de traçabilité</h1>
        <div class="subtitle">${project.name}</div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Adresse</div>
          <div class="meta-value">${project.address}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Type</div>
          <div class="meta-value">${getProjectTypeLabel(project.projectType)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Statut</div>
          <div class="meta-value">${getProjectStatusLabel(project.status)}</div>
        </div>
      </div>

      <div class="score-section">
        <div class="score-label">Score de traçabilité</div>
        <div class="score-value">${project.currentScore}</div>
        <div class="score-label">sur 100 (initial: ${project.initialScore})</div>
        <div class="risk-badge">
          ${getRiskLevelLabel(project.currentRiskLevel)}
        </div>
      </div>

      ${problematicDecisions.length > 0 ? `
        <div class="section">
          <h2>⚠️ Décisions à risque (${problematicDecisions.length})</h2>
          ${problematicDecisions.map(d => `
            <div class="decision-item negative">
              <div class="decision-header">
                <span class="decision-type">${DECISION_TYPE_LABELS[d.type]}</span>
                <span class="decision-impact negative">${d.scoreImpact}</span>
              </div>
              <div class="decision-desc">${d.description}</div>
              <div class="decision-meta">
                ${formatDateTime(d.createdAt)} • 
                Validation écrite: ${d.hasWrittenValidation ? 'Oui' : 'Non'} • 
                Preuve: ${d.hasProofAttached ? 'Oui' : 'Non'}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${positiveDecisions.length > 0 ? `
        <div class="section">
          <h2>✓ Décisions conformes (${positiveDecisions.length})</h2>
          ${positiveDecisions.map(d => `
            <div class="decision-item positive">
              <div class="decision-header">
                <span class="decision-type">${DECISION_TYPE_LABELS[d.type]}</span>
                <span class="decision-impact positive">+${d.scoreImpact}</span>
              </div>
              <div class="decision-desc">${d.description}</div>
              <div class="decision-meta">${formatDateTime(d.createdAt)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section">
        <h2>Calibration initiale</h2>
        <div class="calibration">
          <div class="calibration-item">
            <span>Contrat MOE signé</span>
            <span>${formatCalibrationResponse(project.calibration.contractSigned)}</span>
          </div>
          <div class="calibration-item">
            <span>Missions définies par écrit</span>
            <span>${formatCalibrationResponse(project.calibration.scopeDefined)}</span>
          </div>
          <div class="calibration-item">
            <span>CR formalisés prévus</span>
            <span>${formatCalibrationResponse(project.calibration.crFormalized)}</span>
          </div>
          <div class="calibration-item">
            <span>Validation écrite requise</span>
            <span>${formatCalibrationResponse(project.calibration.writtenValidationRequired)}</span>
          </div>
          <div class="calibration-item">
            <span>Preuves centralisées</span>
            <span>${formatCalibrationResponse(project.calibration.proofsCentralized)}</span>
          </div>
          <div class="calibration-item">
            <span>Décisions traçables</span>
            <span>${formatCalibrationResponse(project.calibration.decisionsTraceable)}</span>
          </div>
          <div class="calibration-item">
            <span>Impacts financiers documentés</span>
            <span>${formatCalibrationResponse(project.calibration.financialImpactsDocumented)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Document généré le ${formatDateTime(new Date())}</p>
        <p>Ce document constitue un état des lieux de la traçabilité du projet à date. Il ne constitue pas un avis juridique.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
