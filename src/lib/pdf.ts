import { Project } from '@/types';
import { formatDate, formatDateTime, getProjectTypeLabel } from './projects';
import { AUDIT_QUESTIONS, getRiskLevelLabel, getRiskLevelDescription, getFailedQuestions, getCategories } from './audit';

export const generateAuditPDF = (project: Project): void => {
  if (!project.auditResult) return;

  const { auditResult } = project;
  const failedQuestions = getFailedQuestions(auditResult.answers);
  const categories = getCategories();

  const getRiskColor = () => {
    switch (auditResult.riskLevel) {
      case 'low':
        return '#16a34a';
      case 'medium':
        return '#ca8a04';
      case 'high':
        return '#dc2626';
    }
  };

  const getRiskBgColor = () => {
    switch (auditResult.riskLevel) {
      case 'low':
        return '#f0fdf4';
      case 'medium':
        return '#fefce8';
      case 'high':
        return '#fef2f2';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Rapport d'audit - ${project.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Georgia', serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #1e293b;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #1e293b;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24pt;
          font-weight: normal;
          margin-bottom: 5px;
        }
        .header .subtitle {
          font-size: 12pt;
          color: #64748b;
        }
        .meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .meta-item {
          margin-bottom: 10px;
        }
        .meta-label {
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .meta-value {
          font-size: 11pt;
          font-weight: 600;
        }
        .score-section {
          text-align: center;
          padding: 30px;
          margin-bottom: 30px;
          background: ${getRiskBgColor()};
          border-radius: 12px;
          border: 2px solid ${getRiskColor()};
        }
        .score-value {
          font-size: 48pt;
          font-weight: bold;
          color: ${getRiskColor()};
        }
        .score-label {
          font-size: 14pt;
          color: #1e293b;
          margin-top: 5px;
        }
        .risk-level {
          display: inline-block;
          padding: 8px 20px;
          margin-top: 15px;
          background: ${getRiskColor()};
          color: white;
          border-radius: 20px;
          font-size: 12pt;
          font-weight: 600;
        }
        .risk-description {
          margin-top: 15px;
          font-size: 11pt;
          color: #475569;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 14pt;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .category {
          margin-bottom: 20px;
        }
        .category-title {
          font-size: 11pt;
          font-weight: 600;
          color: #475569;
          margin-bottom: 10px;
        }
        .question-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .question-text {
          flex: 1;
          padding-right: 20px;
        }
        .answer {
          font-weight: 600;
          min-width: 60px;
          text-align: right;
        }
        .answer-yes { color: #16a34a; }
        .answer-no { color: #dc2626; }
        .answer-na { color: #64748b; }
        .risk-item {
          padding: 15px;
          margin-bottom: 10px;
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          border-radius: 0 8px 8px 0;
        }
        .risk-item-question {
          font-weight: 600;
          margin-bottom: 8px;
        }
        .risk-item-recommendation {
          font-size: 10pt;
          color: #475569;
        }
        .recommendation-prefix {
          font-weight: 600;
          color: #16a34a;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 9pt;
          color: #64748b;
          text-align: center;
        }
        .legal-notice {
          margin-top: 30px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 9pt;
          color: #64748b;
        }
        @media print {
          body { padding: 20px; }
          .score-section { break-inside: avoid; }
          .risk-item { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport d'Audit de Traçabilité</h1>
        <div class="subtitle">Évaluation des risques juridiques du chantier</div>
      </div>

      <div class="meta">
        <div>
          <div class="meta-item">
            <div class="meta-label">Chantier</div>
            <div class="meta-value">${project.name}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Adresse</div>
            <div class="meta-value">${project.address}</div>
          </div>
        </div>
        <div>
          <div class="meta-item">
            <div class="meta-label">Client</div>
            <div class="meta-value">${project.client}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Type de chantier</div>
            <div class="meta-value">${getProjectTypeLabel(project.projectType)}</div>
          </div>
        </div>
      </div>

      <div class="score-section">
        <div class="score-value">${auditResult.score}%</div>
        <div class="score-label">Score de traçabilité</div>
        <div class="risk-level">Risque ${getRiskLevelLabel(auditResult.riskLevel)}</div>
        <div class="risk-description">${getRiskLevelDescription(auditResult.riskLevel)}</div>
      </div>

      ${failedQuestions.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Risques identifiés (${failedQuestions.length})</h2>
        ${failedQuestions.map((q) => `
          <div class="risk-item">
            <div class="risk-item-question">${q.question}</div>
            <div class="risk-item-recommendation">
              <span class="recommendation-prefix">→ Action :</span> ${q.recommendation}
            </div>
          </div>
        `).join('')}
      </div>
      ` : `
      <div class="section">
        <h2 class="section-title">Risques identifiés</h2>
        <p style="color: #16a34a; font-weight: 600;">Aucun risque majeur identifié. Votre traçabilité est conforme.</p>
      </div>
      `}

      <div class="section">
        <h2 class="section-title">Détail de l'audit</h2>
        ${categories.map((category) => {
          const categoryQuestions = AUDIT_QUESTIONS.filter((q) => q.category === category);
          return `
            <div class="category">
              <div class="category-title">${category}</div>
              ${categoryQuestions.map((q) => {
                const answer = auditResult.answers.find((a) => a.questionId === q.id);
                const responseText = answer?.response === 'yes' ? 'Oui' : answer?.response === 'no' ? 'Non' : 'N/A';
                const responseClass = answer?.response === 'yes' ? 'answer-yes' : answer?.response === 'no' ? 'answer-no' : 'answer-na';
                return `
                  <div class="question-row">
                    <div class="question-text">${q.question}</div>
                    <div class="answer ${responseClass}">${responseText}</div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>

      <div class="legal-notice">
        <strong>Avertissement :</strong> Ce rapport constitue une aide à l'évaluation de votre traçabilité documentaire. 
        Il ne remplace pas un conseil juridique professionnel. Les recommandations sont indicatives et doivent être 
        adaptées au contexte spécifique de chaque chantier. Ce document a été généré le ${formatDateTime(auditResult.answeredAt)}.
      </div>

      <div class="footer">
        Audit généré le ${formatDate(auditResult.answeredAt)} • Chantier créé le ${formatDate(project.createdAt)}
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
