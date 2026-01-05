import { Project } from '@/types';
import { formatDate, formatDateTime } from './projects';

export const generatePDF = async (project: Project): Promise<void> => {
  // Create a printable HTML document
  const printContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Journal des Décisions - ${project.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.6; 
          color: #1a1a2e;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #1a1a2e;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        .meta {
          margin-top: 16px;
          font-size: 13px;
        }
        .meta-row {
          display: flex;
          margin-bottom: 4px;
        }
        .meta-label {
          font-weight: 600;
          width: 80px;
        }
        .decision {
          border-left: 3px solid #c5a347;
          padding-left: 20px;
          margin-bottom: 28px;
        }
        .decision-header {
          font-size: 12px;
          color: #c5a347;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .decision-content {
          font-size: 15px;
          margin-bottom: 8px;
        }
        .decision-author {
          font-size: 13px;
          color: #666;
          font-style: italic;
        }
        .attachments {
          margin-top: 8px;
          font-size: 12px;
          color: #888;
        }
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #888;
          text-align: center;
        }
        .legal-notice {
          margin-top: 32px;
          padding: 16px;
          background: #f8f8f6;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Journal des Décisions de Chantier</h1>
        <p class="subtitle">${project.name}</p>
        <div class="meta">
          <div class="meta-row">
            <span class="meta-label">Adresse :</span>
            <span>${project.address}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Client :</span>
            <span>${project.client}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Créé le :</span>
            <span>${formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div class="decisions">
        ${project.decisions.length === 0 ? '<p style="color: #888; font-style: italic;">Aucune décision enregistrée.</p>' : ''}
        ${project.decisions.map(decision => `
          <div class="decision">
            <div class="decision-header">${formatDateTime(decision.createdAt)}</div>
            <div class="decision-content">${decision.content}</div>
            <div class="decision-author">— ${decision.author}</div>
            ${decision.attachments.length > 0 ? `
              <div class="attachments">
                Pièces jointes : ${decision.attachments.map(a => a.name).join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="legal-notice">
        <strong>Mention légale :</strong> Ce document constitue un journal chronologique des décisions prises sur le chantier. 
        Chaque entrée est horodatée automatiquement au moment de sa création. 
        Ce document peut être utilisé comme élément de preuve en cas de litige.
      </div>

      <div class="footer">
        Document généré le ${formatDateTime(new Date())} • ${project.decisions.length} décision(s) enregistrée(s)
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
