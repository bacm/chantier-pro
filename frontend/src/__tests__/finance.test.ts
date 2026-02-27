import { describe, it, expect } from 'vitest';
import { getCompanyContractTotal, getNextPaymentNumber, calculatePaymentDetails, getProjectFinancialProgress } from '../lib/finance';
import { Project, Company, Decision, PaymentApplication } from '../types';

describe('Finance Library', () => {
  const mockCompany: Company = {
    id: 'comp-1',
    name: 'Test Company',
    trade: 'Carpentry',
    hasInsurance: true,
    hasContract: true,
    contractAmount: 10000,
  };

  const mockProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    address: '123 Test St',
    projectType: 'individual',
    status: 'new',
    calibration: {} as any,
    createdAt: new Date(),
    companies: [mockCompany],
    decisions: [],
    reports: [],
    snags: [],
    payments: [],
    initialScore: 50,
    currentScore: 50,
    currentRiskLevel: 'medium',
  };

  describe('getCompanyContractTotal', () => {
    it('should return base contract amount when no amendments exist', () => {
      const total = getCompanyContractTotal(mockProject, 'comp-1');
      expect(total).toBe(10000);
    });

    it('should include financial amendments for the specific company', () => {
      const projectWithAmendments: Project = {
        ...mockProject,
        decisions: [
          {
            id: 'dec-1',
            type: 'financial',
            companyId: 'comp-1',
            hasFinancialImpact: true,
            amount: 2000,
            scoreImpact: 0,
            description: 'Amendment 1',
            hasWrittenValidation: true,
            hasProofAttached: true,
            createdAt: new Date(),
          } as Decision,
          {
            id: 'dec-2',
            type: 'financial',
            companyId: 'comp-2', // Different company
            hasFinancialImpact: true,
            amount: 5000,
            scoreImpact: 0,
            description: 'Amendment 2',
            hasWrittenValidation: true,
            hasProofAttached: true,
            createdAt: new Date(),
          } as Decision,
        ],
      };
      const total = getCompanyContractTotal(projectWithAmendments, 'comp-1');
      expect(total).toBe(12000);
    });
  });

  describe('getNextPaymentNumber', () => {
    it('should return 1 when no payments exist for the company', () => {
      expect(getNextPaymentNumber(mockProject, 'comp-1')).toBe(1);
    });

    it('should return the next sequential number', () => {
      const projectWithPayments: Project = {
        ...mockProject,
        payments: [
          { id: 'p1', companyId: 'comp-1', number: 1 } as PaymentApplication,
          { id: 'p2', companyId: 'comp-1', number: 3 } as PaymentApplication, // Jumped number
        ],
      };
      expect(getNextPaymentNumber(projectWithPayments, 'comp-1')).toBe(4);
    });
  });

  describe('calculatePaymentDetails', () => {
    it('should calculate correct amounts with retenue de garantie', () => {
      const payment: PaymentApplication = {
        id: 'p1',
        companyId: 'comp-1',
        number: 1,
        date: new Date(),
        period: new Date(),
        submittedAmount: 1000,
        validatedAmount: 1000,
        hasRetenueGarantie: true,
        status: 'validated',
      };
      const details = calculatePaymentDetails(mockProject, payment);
      expect(details.contractTotal).toBe(10000);
      expect(details.currentAmount).toBe(1000);
      expect(details.currentPercentage).toBe(10);
      expect(details.retenueAmount).toBe(50); // 5% of 1000
      expect(details.netAmount).toBe(950);
    });

    it('should calculate correct amounts without retenue de garantie', () => {
      const payment: PaymentApplication = {
        id: 'p1',
        companyId: 'comp-1',
        number: 1,
        date: new Date(),
        period: new Date(),
        submittedAmount: 1000,
        validatedAmount: 1000,
        hasRetenueGarantie: false,
        status: 'validated',
      };
      const details = calculatePaymentDetails(mockProject, payment);
      expect(details.retenueAmount).toBe(0);
      expect(details.netAmount).toBe(1000);
    });
  });

  describe('getProjectFinancialProgress', () => {
    it('should calculate overall project progress correctly', () => {
      const company2: Company = {
        id: 'comp-2',
        name: 'Company 2',
        trade: 'Plumbing',
        hasInsurance: true,
        hasContract: true,
        contractAmount: 20000,
      };
      const projectWithMultiple: Project = {
        ...mockProject,
        companies: [mockCompany, company2],
        payments: [
          { id: 'p1', companyId: 'comp-1', number: 1, validatedAmount: 5000, status: 'validated' } as PaymentApplication,
          { id: 'p2', companyId: 'comp-2', number: 1, validatedAmount: 4000, status: 'validated' } as PaymentApplication,
        ],
      };
      const progress = getProjectFinancialProgress(projectWithMultiple);
      expect(progress.totalContract).toBe(30000);
      expect(progress.totalValidated).toBe(9000);
      expect(progress.percentage).toBe(30);
    });

    it('should only use the latest validated payment for each company', () => {
      const projectWithMultiplePayments: Project = {
        ...mockProject,
        payments: [
          { id: 'p1', companyId: 'comp-1', number: 1, validatedAmount: 5000, status: 'validated' } as PaymentApplication,
          { id: 'p2', companyId: 'comp-1', number: 2, validatedAmount: 8000, status: 'validated' } as PaymentApplication,
        ],
      };
      const progress = getProjectFinancialProgress(projectWithMultiplePayments);
      expect(progress.totalValidated).toBe(8000);
    });
  });
});
