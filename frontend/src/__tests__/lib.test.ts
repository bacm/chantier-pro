import { describe, it, expect } from 'vitest';
import {
  calculateDecisionImpact,
  getScoreRiskLevel,
  getRiskLevelLabel,
  getRiskLevelColor,
  getRiskLevelDescription,
  calculateScoreEvolution,
  getProblematicDecisions,
  getPositiveDecisions,
  DECISION_TYPE_LABELS,
  DECISION_TYPE_WEIGHTS,
} from '@/lib/scoring';
import { Decision } from '@/types';

// ─── calculateDecisionImpact ────────────────────────────────────────────────

describe('calculateDecisionImpact', () => {
  it('retourne un impact négatif sans validation ni preuve', () => {
    const impact = calculateDecisionImpact({
      type: 'modification',
      description: 'test',
      hasWrittenValidation: false,
      hasFinancialImpact: false,
      hasProofAttached: false,
    });
    expect(impact).toBeLessThan(0);
  });

  it('retourne un impact positif avec validation et preuve', () => {
    const impact = calculateDecisionImpact({
      type: 'modification',
      description: 'test',
      hasWrittenValidation: true,
      hasFinancialImpact: false,
      hasProofAttached: true,
    });
    expect(impact).toBeGreaterThan(0);
  });

  it('amplifie l\'impact quand hasFinancialImpact est true', () => {
    const base = calculateDecisionImpact({
      type: 'validation',
      description: 'test',
      hasWrittenValidation: true,
      hasFinancialImpact: false,
      hasProofAttached: true,
    });
    const withFinancial = calculateDecisionImpact({
      type: 'validation',
      description: 'test',
      hasWrittenValidation: true,
      hasFinancialImpact: true,
      hasProofAttached: true,
    });
    expect(Math.abs(withFinancial)).toBeGreaterThan(Math.abs(base));
  });

  it('counsel a un poids plus élevé que modification', () => {
    const counsel = Math.abs(
      calculateDecisionImpact({
        type: 'counsel',
        description: 'test',
        hasWrittenValidation: false,
        hasFinancialImpact: false,
        hasProofAttached: false,
      })
    );
    const modification = Math.abs(
      calculateDecisionImpact({
        type: 'modification',
        description: 'test',
        hasWrittenValidation: false,
        hasFinancialImpact: false,
        hasProofAttached: false,
      })
    );
    expect(counsel).toBeGreaterThan(modification);
  });
});

// ─── getScoreRiskLevel ──────────────────────────────────────────────────────

describe('getScoreRiskLevel', () => {
  it('retourne low pour score >= 75', () => {
    expect(getScoreRiskLevel(75)).toBe('low');
    expect(getScoreRiskLevel(100)).toBe('low');
  });

  it('retourne medium pour score entre 50 et 74', () => {
    expect(getScoreRiskLevel(50)).toBe('medium');
    expect(getScoreRiskLevel(74)).toBe('medium');
  });

  it('retourne high pour score < 50', () => {
    expect(getScoreRiskLevel(49)).toBe('high');
    expect(getScoreRiskLevel(0)).toBe('high');
  });
});

// ─── getRiskLevelLabel / getRiskLevelColor / getRiskLevelDescription ────────

describe('getRiskLevelLabel', () => {
  it('retourne le bon label pour chaque niveau', () => {
    expect(getRiskLevelLabel('low')).toBe('Sécurisé');
    expect(getRiskLevelLabel('medium')).toBe('Vigilance');
    expect(getRiskLevelLabel('high')).toBe('À risque');
  });
});

describe('getRiskLevelColor', () => {
  it('retourne des classes emerald pour low', () => {
    expect(getRiskLevelColor('low')).toContain('emerald');
  });

  it('retourne des classes amber pour medium', () => {
    expect(getRiskLevelColor('medium')).toContain('amber');
  });

  it('retourne des classes red pour high', () => {
    expect(getRiskLevelColor('high')).toContain('red');
  });
});

describe('getRiskLevelDescription', () => {
  it('retourne une description non vide pour chaque niveau', () => {
    expect(getRiskLevelDescription('low')).toBeTruthy();
    expect(getRiskLevelDescription('medium')).toBeTruthy();
    expect(getRiskLevelDescription('high')).toBeTruthy();
  });
});

// ─── calculateScoreEvolution ────────────────────────────────────────────────

describe('calculateScoreEvolution', () => {
  const baseProject = {
    id: '1',
    organizationId: 'org-1',
    createdBy: 'user-1',
    name: 'Test',
    address: '1 rue test',
    projectType: 'individual' as const,
    status: 'ongoing' as const,
    calibration: {
      contractSigned: 'yes' as const,
      scopeDefined: 'yes' as const,
      crFormalized: 'yes' as const,
      writtenValidationRequired: 'yes' as const,
      proofsCentralized: 'yes' as const,
      decisionsTraceable: 'yes' as const,
      financialImpactsDocumented: 'yes' as const,
    },
    createdAt: new Date(),
    companies: [],
    decisions: [],
    reports: [],
    snags: [],
    payments: [],
    currentRiskLevel: 'low' as const,
  };

  it('retourne une valeur positive si currentScore > initialScore', () => {
    expect(calculateScoreEvolution({ ...baseProject, initialScore: 70, currentScore: 85 })).toBe(15);
  });

  it('retourne une valeur négative si currentScore < initialScore', () => {
    expect(calculateScoreEvolution({ ...baseProject, initialScore: 80, currentScore: 65 })).toBe(-15);
  });

  it('retourne 0 si les scores sont égaux', () => {
    expect(calculateScoreEvolution({ ...baseProject, initialScore: 75, currentScore: 75 })).toBe(0);
  });
});

// ─── getProblematicDecisions / getPositiveDecisions ─────────────────────────

const makeDecision = (scoreImpact: number, type: Decision['type'] = 'modification'): Decision => ({
  id: String(scoreImpact),
  type,
  description: 'test',
  hasWrittenValidation: false,
  hasFinancialImpact: false,
  hasProofAttached: false,
  createdAt: new Date(),
  scoreImpact,
});

describe('getProblematicDecisions', () => {
  it('retourne uniquement les décisions à impact négatif', () => {
    const result = getProblematicDecisions([
      makeDecision(5), makeDecision(-3), makeDecision(-7), makeDecision(0),
    ]);
    expect(result).toHaveLength(2);
    expect(result.every((d) => d.scoreImpact < 0)).toBe(true);
  });

  it('trie par scoreImpact croissant (pire en premier)', () => {
    const result = getProblematicDecisions([makeDecision(-3), makeDecision(-7), makeDecision(-1)]);
    expect(result[0].scoreImpact).toBe(-7);
    expect(result[2].scoreImpact).toBe(-1);
  });
});

describe('getPositiveDecisions', () => {
  it('retourne uniquement les décisions à impact positif', () => {
    const result = getPositiveDecisions([makeDecision(5), makeDecision(-3), makeDecision(2)]);
    expect(result).toHaveLength(2);
    expect(result.every((d) => d.scoreImpact > 0)).toBe(true);
  });

  it('trie par scoreImpact décroissant (meilleur en premier)', () => {
    const result = getPositiveDecisions([makeDecision(3), makeDecision(8), makeDecision(1)]);
    expect(result[0].scoreImpact).toBe(8);
    expect(result[2].scoreImpact).toBe(1);
  });
});

// ─── DECISION_TYPE_LABELS / DECISION_TYPE_WEIGHTS ───────────────────────────

describe('DECISION_TYPE_LABELS', () => {
  it('contient un label pour chaque type de décision', () => {
    (['modification', 'validation', 'counsel', 'financial', 'reception'] as const).forEach(
      (type) => expect(DECISION_TYPE_LABELS[type]).toBeTruthy()
    );
  });
});

describe('DECISION_TYPE_WEIGHTS', () => {
  it('counsel est le type avec le poids le plus élevé', () => {
    const max = Math.max(...Object.values(DECISION_TYPE_WEIGHTS));
    expect(DECISION_TYPE_WEIGHTS.counsel).toBe(max);
  });
});
