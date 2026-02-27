import { Project, RiskLevel, CalibrationResponse, SiteReport, WeatherType, Company, Decision, Snag, PaymentApplication } from '@/types';
import { formatDate, formatDateTime, getProjectTypeLabel, getProjectStatusLabel } from './projects';
import { getRiskLevelLabel, DECISION_TYPE_LABELS, getProblematicDecisions, getPositiveDecisions } from './scoring';
import { getCompanyContractTotal, calculatePaymentDetails } from './finance';

const escapeHtml = (str: string | undefined | null): string => {
  if (str === undefined || str === null) {
    return '';
  }
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

export const generatePaymentCertificatePDF = (project: Project, payment: PaymentApplication) => {
  const company = project.companies.find(c => c.id === payment.companyId);
  if (!company) return;

  const { contractTotal, currentAmount, previousAmount, netAmount, retenueAmount, monthlyAmount } = (() => {
    // Re-calculate details locally or use helper
    // We need 'monthlyAmount' (Amount of THIS payment) which is Current - Previous
    // The helper 'calculatePaymentDetails' gives us current, retenue, net (of current cumulative? no, net is usually "Net to Pay this month").
    // Let's check calculatePaymentDetails in finance.ts.
    // It returns: { contractTotal, currentAmount, currentPercentage, retenueAmount, netAmount (current - retenue) }
    // It does NOT calculate "This Month" explicitly, only Cumulative Net.
    // Wait, Payment Certificate is usually for the *difference* (the amount to pay NOW).
    
    const details = calculatePaymentDetails(project, payment);
    const prev = payment.previousCumulativeAmount || 0;
    const monthly = details.currentAmount - prev;
    const retenueOnMonthly = payment.hasRetenueGarantie ? monthly * 0.05 : 0;
    const netToPay = monthly - retenueOnMonthly;

    return {
      contractTotal: details.contractTotal,
      currentAmount: details.currentAmount,
      previousAmount: prev,
      monthlyAmount: monthly,
      retenueAmount: retenueOnMonthly,
      netAmount: netToPay
    };
  })();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Certificat de Paiement n°${payment.number} - ${company.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
          padding: 40px;
          max-width: 850px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #1a1a2e;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title-box {
          text-align: right;
        }
        .certif-title {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          color: #1a1a2e;
          margin-bottom: 5px;
        }
        .project-info {
          font-size: 11pt;
          font-weight: bold;
        }
        .company-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 30px;
          border: 1px solid #ddd;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        th {
          text-align: left;
          background: #f1f5f9;
          font-weight: bold;
        }
        .amount-col {
          text-align: right;
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }
        .total-row {
          background: #e2e8f0;
          font-weight: bold;
          font-size: 11pt;
        }
        .footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .sign-box {
          border: 1px solid #ccc;
          width: 200px;
          height: 120px;
          padding: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div style="font-size: 10pt; color: #666; margin-bottom: 5px;">PROJET</div>
          <div class="project-info">${escapeHtml(project.name)}</div>
          <div>${escapeHtml(project.address)}</div>
        </div>
        <div class="title-box">
          <div class="certif-title">Certificat de Paiement N°${payment.number}</div>
          <div>Date : ${formatDate(payment.date)}</div>
          <div>Période : ${payment.period.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div class="company-box">
        <div style="font-size: 9pt; color: #666; text-transform: uppercase; margin-bottom: 5px;">Titulaire du lot ${escapeHtml(company.trade)}</div>
        <div style="font-size: 12pt; font-weight: bold;">${escapeHtml(company.name)}</div>
        ${company.hasContract ? '<div style="color: #059669; font-size: 9pt; margin-top: 5px;">✓ Marché signé</div>' : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Désignation</th>
            <th class="amount-col">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Montant du Marché Initial</td>
            <td class="amount-col">${(company.contractAmount || 0).toLocaleString('fr-FR')} €</td>
          </tr>
          <tr>
            <td>Montant des Avenants validés</td>
            <td class="amount-col">${(contractTotal - (company.contractAmount || 0)).toLocaleString('fr-FR')} €</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td><strong>Montant du Marché à jour</strong></td>
            <td class="amount-col">${contractTotal.toLocaleString('fr-FR')} €</td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Décompte de la situation</th>
            <th class="amount-col">Montant HT</th>
            <th class="amount-col">%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Avancement cumulé à ce jour</td>
            <td class="amount-col">${currentAmount.toLocaleString('fr-FR')} €</td>
            <td class="amount-col">${((currentAmount / contractTotal) * 100).toFixed(2)} %</td>
          </tr>
          <tr>
            <td>Avancement précédent</td>
            <td class="amount-col">- ${previousAmount.toLocaleString('fr-FR')} €</td>
            <td class="amount-col"></td>
          </tr>
          <tr style="font-weight: bold;">
            <td>Montant de l'acompte (différence)</td>
            <td class="amount-col">${monthlyAmount.toLocaleString('fr-FR')} €</td>
            <td class="amount-col"></td>
          </tr>
          ${payment.hasRetenueGarantie ? `
            <tr>
              <td>Retenue de Garantie (5%)</td>
              <td class="amount-col" style="color: #dc2626;">- ${retenueAmount.toLocaleString('fr-FR')} €</td>
              <td class="amount-col"></td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td>NET À PAYER (HT)</td>
            <td class="amount-col" style="color: #1a1a2e;">${netAmount.toLocaleString('fr-FR')} €</td>
            <td class="amount-col"></td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 9pt; color: #666; margin-bottom: 30px;">
        Note : La TVA est à ajouter au montant HT selon le taux en vigueur (généralement 20%).
        <br/>Ce certificat est délivré pour valider l'avancement des travaux et permettre la facturation.
      </div>

      <div class="footer">
        <div class="sign-box">
          <strong>Le Maître d'Œuvre</strong>
          <div style="font-size: 8pt; margin-top: 5px;">Bon pour acompte de <br/><b>${netAmount.toLocaleString('fr-FR')} € HT</b></div>
          <div style="margin-top: 40px; font-size: 8pt;">Date et Signature :</div>
        </div>
        <div class="sign-box">
          <strong>Le Maître d'Ouvrage</strong>
          <div style="font-size: 8pt; margin-top: 5px;">Bon pour accord</div>
          <div style="margin-top: 40px; font-size: 8pt;">Date et Signature :</div>
        </div>
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

export const generateAcceptancePDF = (project: Project) => {
  const snags = project.snags || [];
  const openSnags = snags.filter(s => !s.isCleared);
  const clearedSnags = snags.filter(s => s.isCleared);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Liste des Réserves - ${project.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
          padding: 30px;
          max-width: 850px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #1a1a2e;
          padding-bottom: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
        }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          background: #1a1a2e;
          color: white;
          padding: 5px 10px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th { background: #eee; font-size: 9pt; }
        .status-cleared { color: #059669; font-weight: bold; }
        .status-open { color: #dc2626; font-weight: bold; }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: space-around;
          font-size: 9pt;
        }
        .sign-box {
          border: 1px solid #ddd;
          width: 200px;
          height: 100px;
          margin-top: 10px;
          padding: 5px;
          font-size: 8pt;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 style="font-size: 18pt; color: #1a1a2e;">LISTE DES RÉSERVES (OPR)</h1>
          <div style="font-size: 12pt; font-weight: bold; margin-top: 5px;">${escapeHtml(project.name)}</div>
        </div>
        <div style="text-align: right;">
          <div>Édité le ${formatDate(new Date())}</div>
          <div style="font-weight: bold; margin-top: 5px;">
            Taux de levée : ${snags.length > 0 ? Math.round((clearedSnags.length / snags.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">1. Réserves en cours (${openSnags.length})</div>
        ${openSnags.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Lot</th>
                <th>Localisation</th>
                <th>Description du défaut</th>
                <th>Date constat</th>
              </tr>
            </thead>
            <tbody>
              ${openSnags.map(s => `
                <tr>
                  <td>${escapeHtml(project.companies.find(c => c.id === s.companyId)?.trade || '-')}</td>
                  <td>${escapeHtml(s.location || '-')}</td>
                  <td>${escapeHtml(s.description)}</td>
                  <td>${formatDate(s.foundDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>Aucune réserve en cours.</p>'}
      </div>

      <div class="section">
        <div class="section-title">2. Réserves levées (${clearedSnags.length})</div>
        ${clearedSnags.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Lot</th>
                <th>Description</th>
                <th>Date levée</th>
              </tr>
            </thead>
            <tbody>
              ${clearedSnags.map(s => `
                <tr>
                  <td>${escapeHtml(project.companies.find(c => c.id === s.companyId)?.trade || '-')}</td>
                  <td>${escapeHtml(s.description)}</td>
                  <td class="status-cleared">${s.clearedDate ? formatDate(s.clearedDate) : 'Oui'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>Aucune réserve levée.</p>'}
      </div>

      <div class="footer">
        <div>
          <strong>Le Maître d'Ouvrage</strong>
          <div class="sign-box">Signature & Bon pour accord</div>
        </div>
        <div>
          <strong>Le Maître d'Œuvre</strong>
          <div class="sign-box">Signature</div>
        </div>
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
        <div class="subtitle">${escapeHtml(project.name)}</div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Adresse</div>
          <div class="meta-value">${escapeHtml(project.address)}</div>
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
              <div class="decision-desc">${escapeHtml(d.description)}</div>
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
              <div class="decision-desc">${escapeHtml(d.description)}</div>
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
          ${project.calibration.insuranceVerified ? `
          <div class="calibration-item">
            <span>Assurances entreprises vérifiées</span>
            <span>${formatCalibrationResponse(project.calibration.insuranceVerified)}</span>
          </div>
          ` : ''}
          ${project.calibration.docFiled ? `
          <div class="calibration-item">
            <span>DOC déposée</span>
            <span>${formatCalibrationResponse(project.calibration.docFiled)}</span>
          </div>
          ` : ''}
          ${project.calibration.pcDisplayed ? `
          <div class="calibration-item">
            <span>PC affiché</span>
            <span>${formatCalibrationResponse(project.calibration.pcDisplayed)}</span>
          </div>
          ` : ''}
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

export const generateSiteReportPDF = (project: Project, report: SiteReport) => {
  const presentCompanies = project.companies.filter(c => report.presentCompanyIds.includes(c.id));
  
  // Find previous report date to capture decisions since then
  const sortedReports = [...project.reports].sort((a, b) => a.date.getTime() - b.date.getTime());
  const currentIndex = sortedReports.findIndex(r => r.id === report.id);
  const previousReportDate = currentIndex > 0 ? sortedReports[currentIndex - 1].date : project.createdAt;
  
  // Capture decisions since last report
  const decisionsSinceLastReport = project.decisions.filter(d => 
    d.createdAt > previousReportDate && d.createdAt <= report.date
  );

  const getWeatherLabel = (type: WeatherType) => {
    switch (type) {
      case 'sunny': return 'Ensoleillé ☀️';
      case 'cloudy': return 'Nuageux ☁️';
      case 'rain': return 'Pluie 🌧️';
      case 'storm': return 'Orage ⛈️';
      case 'snow': return 'Neige ❄️';
      default: return type;
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Compte-Rendu de Chantier - ${project.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
          padding: 30px;
          max-width: 850px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #1a1a2e;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .header h1 {
          font-size: 20pt;
          text-transform: uppercase;
          color: #1a1a2e;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          background: #1a1a2e;
          color: white;
          padding: 5px 10px;
          margin-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          background: #f4f4f9;
          padding: 15px;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #eee;
          font-size: 9pt;
        }
        .company-present {
          background: #d1fae5;
          color: #065f46;
          font-weight: bold;
          text-align: center;
        }
        .observation-item {
          margin-bottom: 8px;
          padding-left: 15px;
          position: relative;
        }
        .observation-item:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #1a1a2e;
          font-weight: bold;
        }
        .decision-box {
          border: 1px solid #fbbf24;
          background: #fffbeb;
          padding: 10px;
          margin-bottom: 10px;
          border-left: 5px solid #fbbf24;
        }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 8pt;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Compte-Rendu N°${project.reports.length - project.reports.indexOf(report)}</h1>
          <div style="font-size: 14pt; font-weight: bold;">${escapeHtml(project.name)}</div>
          <div style="color: #666;">${escapeHtml(project.address)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12pt; font-weight: bold;">Visite du ${formatDate(report.date)}</div>
          <div style="margin-top: 5px;">
            Météo : ${getWeatherLabel(report.weather)} ${report.temperature ? `(${report.temperature}°C)` : ''}
            ${report.isValidatedBadWeather ? '<br/><span style="color: #d97706; font-weight: bold;">⚠️ JOUR D\'INTEMPÉRIE VALIDÉ</span>' : ''}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">1. Situation des Intervenants</div>
        <table>
          <thead>
            <tr>
              <th>Lot / Corps d'état</th>
              <th>Entreprise</th>
              <th style="width: 100px; text-align: center;">Présence</th>
            </tr>
          </thead>
          <tbody>
            ${project.companies.map(c => `
              <tr>
                <td>${escapeHtml(c.trade)}</td>
                <td>${escapeHtml(c.name)}</td>
                <td class="${report.presentCompanyIds.includes(c.id) ? 'company-present' : ''}">
                  ${report.presentCompanyIds.includes(c.id) ? 'PRÉSENT' : 'Absent'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${decisionsSinceLastReport.length > 0 ? `
        <div class="section">
          <div class="section-title">2. Actes & Décisions de la période</div>
          ${decisionsSinceLastReport.map(d => `
            <div class="decision-box">
              <strong>${DECISION_TYPE_LABELS[d.type]}</strong> - ${formatDate(d.createdAt)}<br/>
              ${escapeHtml(d.description)}
              ${d.companyId ? `<br/><small>Concerne : ${escapeHtml(project.companies.find(c => c.id === d.companyId)?.name)}</small>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">3. Observations par lot</div>
        ${project.companies.map(c => {
          const companyObs = report.observations.filter(o => o.companyId === c.id);
          if (companyObs.length === 0) return '';
          return `
            <div style="margin-bottom: 15px;">
              <h3 style="font-size: 10pt; color: #1a1a2e; border-bottom: 1px solid #eee; margin-bottom: 5px;">${escapeHtml(c.trade)} - ${escapeHtml(c.name)}</h3>
              ${companyObs.map(o => `
                <div class="observation-item">${escapeHtml(o.text)}</div>
              `).join('')}
            </div>
          `;
        }).join('')}
        
        ${report.observations.filter(o => !o.companyId).length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 10pt; color: #1a1a2e; border-bottom: 1px solid #eee; margin-bottom: 5px;">Général</h3>
            ${report.observations.filter(o => !o.companyId).map(o => `
              <div class="observation-item">${escapeHtml(o.text)}</div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">4. Remarques générales & Avancement</div>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">
          ${escapeHtml(report.generalRemarks || 'Néant.')}
        </div>
      </div>

      <div class="footer">
        Document établi par le Maître d'Œuvre. Les entreprises disposent de 48h pour formuler leurs réserves éventuelles.
        <br/>Généré par Chantier Pro le ${formatDate(new Date())}
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
