import { Project, PaymentApplication, Company, Decision } from '@/types';

// Calculate the total contract amount for a company including amendments
export const getCompanyContractTotal = (project: Project, companyId: string): number => {
  const company = project.companies.find(c => c.id === companyId);
  if (!company) return 0;

  const baseAmount = company.contractAmount || 0;
  
  // Sum financial decisions (avenants) linked to this company
  const amendments = project.decisions
    .filter(d => d.type === 'financial' && d.companyId === companyId && d.hasFinancialImpact && d.amount)
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return baseAmount + amendments;
};

// Get the next payment number for a company
export const getNextPaymentNumber = (project: Project, companyId: string): number => {
  const companyPayments = (project.payments || [])
    .filter(p => p.companyId === companyId)
    .sort((a, b) => b.number - a.number);
  
  return companyPayments.length > 0 ? companyPayments[0].number + 1 : 1;
};

// Calculate payment details
export const calculatePaymentDetails = (
  project: Project, 
  payment: PaymentApplication
) => {
  const contractTotal = getCompanyContractTotal(project, payment.companyId);
  
  // Previous cumulative amount (from previous validated payments)
  // Or utilize the stored 'previousCumulativeAmount' if we trust it, 
  // but recalculating ensures consistency if history changes.
  // Ideally, previousCumulativeAmount is a snapshot at creation.
  
  const currentAmount = payment.validatedAmount;
  const currentPercentage = contractTotal > 0 ? (currentAmount / contractTotal) * 100 : 0;
  
  // Retenue de garantie (5%)
  const retenueAmount = payment.hasRetenueGarantie ? currentAmount * 0.05 : 0;
  
  const netAmount = currentAmount - retenueAmount;
  
  return {
    contractTotal,
    currentAmount,
    currentPercentage,
    retenueAmount,
    netAmount
  };
};

// Add or update a payment in the project
export const savePaymentToProject = (project: Project, payment: PaymentApplication): Project => {
  const existingIndex = (project.payments || []).findIndex(p => p.id === payment.id);
  let newPayments = [...(project.payments || [])];

  if (existingIndex >= 0) {
    newPayments[existingIndex] = payment;
  } else {
    newPayments.push(payment);
  }
  
  // Sort by date/number? Not strictly necessary if we filter/sort on display
  return {
    ...project,
    payments: newPayments
  };
};

export const getProjectFinancialProgress = (project: Project) => {
  const totalContract = project.companies.reduce((sum, c) => sum + getCompanyContractTotal(project, c.id), 0);
  
  // Sum of latest validated payments for each company
  let totalValidated = 0;
  
  project.companies.forEach(c => {
    const payments = (project.payments || [])
      .filter(p => p.companyId === c.id && (p.status === 'validated' || p.status === 'paid'))
      .sort((a, b) => b.number - a.number);
      
    if (payments.length > 0) {
      totalValidated += payments[0].validatedAmount;
    }
  });

  return {
    totalContract,
    totalValidated,
    percentage: totalContract > 0 ? (totalValidated / totalContract) * 100 : 0
  };
};
