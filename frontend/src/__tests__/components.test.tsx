import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ScoreDisplay } from '@/components/ScoreDisplay';
import { ProjectCard } from '@/components/ProjectCard';
import { NavLink } from '@/components/NavLink';
import { AddDecisionDialog } from '@/components/AddDecisionDialog';
import { AuthGuard } from '@/auth/AuthGuard';
import { Project, Company } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderWithRouter = (ui: React.ReactElement, { initialEntries = ['/'] } = {}) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: '1',
  organizationId: 'org-1',
  createdBy: 'user-1',
  name: 'Résidence Les Pins',
  address: '12 Rue de la Paix, Paris',
  projectType: 'individual',
  status: 'ongoing',
  calibration: {
    contractSigned: 'yes',
    scopeDefined: 'yes',
    crFormalized: 'yes',
    writtenValidationRequired: 'yes',
    proofsCentralized: 'yes',
    decisionsTraceable: 'yes',
    financialImpactsDocumented: 'yes',
  },
  createdAt: new Date('2024-01-01'),
  companies: [],
  decisions: [],
  reports: [],
  snags: [],
  payments: [],
  initialScore: 80,
  currentScore: 85,
  currentRiskLevel: 'low',
  ...overrides,
});

const testCompanies: Company[] = [
  { id: 'c1', name: 'Dupont BTP', trade: 'Gros œuvre', hasInsurance: true, hasContract: true },
];

// ─── ScoreDisplay ─────────────────────────────────────────────────────────────

describe('ScoreDisplay', () => {
  describe('mode complet (par défaut)', () => {
    it('affiche le score en pourcentage', () => {
      render(<ScoreDisplay score={82} riskLevel="low" />);
      expect(screen.getByText('82%')).toBeInTheDocument();
    });

    it('affiche le label du niveau de risque', () => {
      render(<ScoreDisplay score={82} riskLevel="low" />);
      expect(screen.getByText('Sécurisé')).toBeInTheDocument();
    });

    it('affiche la description du niveau de risque', () => {
      render(<ScoreDisplay score={45} riskLevel="high" />);
      expect(screen.getByText(/Action corrective nécessaire/i)).toBeInTheDocument();
    });

    it('affiche +N quand evolution est positive', () => {
      render(<ScoreDisplay score={80} riskLevel="low" evolution={5} />);
      expect(screen.getByText('+5')).toBeInTheDocument();
    });

    it('affiche -N quand evolution est négative', () => {
      render(<ScoreDisplay score={60} riskLevel="medium" evolution={-8} />);
      expect(screen.getByText('-8')).toBeInTheDocument();
    });

    it("n'affiche pas d'évolution quand evolution est 0 ou undefined", () => {
      render(<ScoreDisplay score={75} riskLevel="low" evolution={0} />);
      expect(screen.queryByText('+0')).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
    });
  });

  describe('mode compact', () => {
    it('affiche le score et le label de risque', () => {
      render(<ScoreDisplay score={60} riskLevel="medium" compact />);
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Vigilance')).toBeInTheDocument();
    });

    it('affiche l\'évolution positive', () => {
      render(<ScoreDisplay score={60} riskLevel="medium" compact evolution={3} />);
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it("n'affiche pas de description en compact", () => {
      render(<ScoreDisplay score={45} riskLevel="high" compact />);
      expect(screen.queryByText(/Action corrective/i)).not.toBeInTheDocument();
    });
  });
});

// ─── ProjectCard ──────────────────────────────────────────────────────────────

describe('ProjectCard', () => {
  it('affiche le nom et l\'adresse du projet', () => {
    render(<ProjectCard project={makeProject()} onClick={vi.fn()} />);
    expect(screen.getByText('Résidence Les Pins')).toBeInTheDocument();
    expect(screen.getByText('12 Rue de la Paix, Paris')).toBeInTheDocument();
  });

  it('affiche le score, le type et le statut', () => {
    render(
      <ProjectCard
        project={makeProject({ currentScore: 85, projectType: 'individual', status: 'ongoing' })}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Maison individuelle')).toBeInTheDocument();
    expect(screen.getByText('Projet en cours')).toBeInTheDocument();
  });

  it('affiche le niveau de risque correct', () => {
    const { rerender } = render(
      <ProjectCard project={makeProject({ currentRiskLevel: 'low' })} onClick={vi.fn()} />
    );
    expect(screen.getByText('Sécurisé')).toBeInTheDocument();

    rerender(<ProjectCard project={makeProject({ currentRiskLevel: 'high' })} onClick={vi.fn()} />);
    expect(screen.getByText('À risque')).toBeInTheDocument();
  });

  it('affiche le compteur de décisions avec pluriel correct', () => {
    render(<ProjectCard project={makeProject({ decisions: [] })} onClick={vi.fn()} />);
    expect(screen.getByText('0 décisions')).toBeInTheDocument();

    const oneDecision = [
      {
        id: '1', type: 'modification' as const, description: 'test',
        hasWrittenValidation: true, hasFinancialImpact: false, hasProofAttached: false,
        createdAt: new Date(), scoreImpact: 2,
      },
    ];
    const { rerender } = render(
      <ProjectCard project={makeProject({ decisions: oneDecision })} onClick={vi.fn()} />
    );
    expect(screen.getByText('1 décision')).toBeInTheDocument();
  });

  it('affiche l\'évolution positive et négative du score', () => {
    const { rerender } = render(
      <ProjectCard project={makeProject({ initialScore: 70, currentScore: 85 })} onClick={vi.fn()} />
    );
    expect(screen.getByText('+15')).toBeInTheDocument();

    rerender(
      <ProjectCard project={makeProject({ initialScore: 80, currentScore: 65 })} onClick={vi.fn()} />
    );
    expect(screen.getByText('-15')).toBeInTheDocument();
  });

  it("n'affiche pas d'évolution quand les scores sont égaux", () => {
    render(
      <ProjectCard project={makeProject({ initialScore: 75, currentScore: 75 })} onClick={vi.fn()} />
    );
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
    expect(screen.queryByText('-0')).not.toBeInTheDocument();
  });

  it('appelle onClick au clic', async () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={makeProject()} onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

// ─── NavLink ──────────────────────────────────────────────────────────────────

describe('NavLink', () => {
  it('rend un lien avec le texte et le href corrects', () => {
    renderWithRouter(<NavLink to="/projets">Mes projets</NavLink>);
    const link = screen.getByRole('link', { name: 'Mes projets' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/projets');
  });

  it('applique className de base', () => {
    renderWithRouter(
      <NavLink to="/projets" className="base-class">Projets</NavLink>
    );
    expect(screen.getByRole('link')).toHaveClass('base-class');
  });

  it('applique activeClassName sur la route active', () => {
    renderWithRouter(
      <NavLink to="/projets" className="base" activeClassName="active-link">Projets</NavLink>,
      { initialEntries: ['/projets'] }
    );
    expect(screen.getByRole('link')).toHaveClass('active-link');
  });

  it("n'applique pas activeClassName sur une route inactive", () => {
    renderWithRouter(
      <NavLink to="/projets" className="base" activeClassName="active-link">Projets</NavLink>,
      { initialEntries: ['/autre'] }
    );
    expect(screen.getByRole('link')).not.toHaveClass('active-link');
  });
});

// ─── AddDecisionDialog ────────────────────────────────────────────────────────

describe('AddDecisionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onDecisionAdded: vi.fn(),
  };

  it('affiche le titre et désactive le bouton de soumission si description vide', () => {
    render(<AddDecisionDialog {...defaultProps} />);
    expect(screen.getByText('Ajouter une décision')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ajouter la décision/i })).toBeDisabled();
  });

  it('active le bouton de soumission après saisie d\'une description', async () => {
    render(<AddDecisionDialog {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText(/Décrivez brièvement/i), 'Modification du plan');
    expect(screen.getByRole('button', { name: /Ajouter la décision/i })).not.toBeDisabled();
  });

  it('appelle onOpenChange(false) au clic sur Annuler', async () => {
    const onOpenChange = vi.fn();
    render(<AddDecisionDialog {...defaultProps} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('révèle le champ montant quand "Impact financier" est activé', async () => {
    render(<AddDecisionDialog {...defaultProps} />);
    expect(screen.queryByPlaceholderText('0.00')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: /Impact financier/i }));
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('révèle les champs de preuve quand "Preuve jointe" est activé', async () => {
    render(<AddDecisionDialog {...defaultProps} />);
    expect(screen.queryByPlaceholderText(/Photo fissure/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: /Preuve jointe/i }));
    expect(screen.getByPlaceholderText(/Photo fissure/i)).toBeInTheDocument();
  });

  it('soumet la décision et ferme la dialog', async () => {
    const onDecisionAdded = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AddDecisionDialog {...defaultProps} onDecisionAdded={onDecisionAdded} onOpenChange={onOpenChange} />
    );

    await userEvent.type(screen.getByPlaceholderText(/Décrivez brièvement/i), 'Changement de matériaux');
    await userEvent.click(screen.getByRole('button', { name: /Ajouter la décision/i }));

    expect(onDecisionAdded).toHaveBeenCalledOnce();
    const [decision] = onDecisionAdded.mock.calls[0];
    expect(decision.description).toBe('Changement de matériaux');
    expect(decision.type).toBe('modification');
    expect(decision.id).toBeTruthy();
    expect(decision.createdAt).toBeInstanceOf(Date);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('affiche l\'aperçu d\'impact (négatif par défaut, positif avec validation + preuve)', async () => {
    render(<AddDecisionDialog {...defaultProps} />);
    expect(screen.getByText(/Impact négatif/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: /Validation écrite/i }));
    await userEvent.click(screen.getByRole('switch', { name: /Preuve jointe/i }));
    expect(screen.getByText(/Impact positif/i)).toBeInTheDocument();

    // Désactiver la validation repasse en négatif
    await userEvent.click(screen.getByRole('switch', { name: /Validation écrite/i }));
    expect(screen.getByText(/Impact négatif/i)).toBeInTheDocument();
  });

  it('affiche/masque le sélecteur d\'entreprise selon la prop companies', () => {
    const { rerender } = render(<AddDecisionDialog {...defaultProps} companies={testCompanies} />);
    expect(screen.getByText(/Entreprise concernée/i)).toBeInTheDocument();

    rerender(<AddDecisionDialog {...defaultProps} companies={[]} />);
    expect(screen.queryByText(/Entreprise concernée/i)).not.toBeInTheDocument();
  });
});

// ─── AuthGuard ────────────────────────────────────────────────────────────────

describe('AuthGuard', () => {
  it('affiche ses enfants sans modification', () => {
    render(
      <AuthGuard>
        <span>Contenu protégé</span>
        <span>Deuxième enfant</span>
      </AuthGuard>
    );
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.getByText('Deuxième enfant')).toBeInTheDocument();
  });
});
