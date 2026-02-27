import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Project, ProjectStatus, ProjectCalibration, CalibrationResponse } from '@/types';
import { createProjectFromCalibration } from '@/lib/projects';
import { getScoreRiskLevel, getRiskLevelLabel, getRiskLevelColor, calculateInitialScore } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface ProjectCreationWizardProps {
  onComplete: (project: Partial<Project>) => void;
  onCancel: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  'Type de projet',
  'Identification',
  'Cadre contractuel',
  'Situation actuelle',
  'Documentation',
  'Confirmation',
];

export const ProjectCreationWizard = ({ onComplete, onCancel }: ProjectCreationWizardProps) => {
  const [step, setStep] = useState<Step>(0);
  
  // Step 0
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  
  // Step 1
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState<Project['projectType'] | null>(null);
  const [startDate, setStartDate] = useState('');
  const [contractualEndDate, setContractualEndDate] = useState('');
  
  // Step 2 - Contractual calibration
  const [contractSigned, setContractSigned] = useState<CalibrationResponse | null>(null);
  const [scopeDefined, setScopeDefined] = useState<CalibrationResponse | null>(null);
  const [crFormalized, setCrFormalized] = useState<CalibrationResponse | null>(null);
  const [writtenValidationRequired, setWrittenValidationRequired] = useState<CalibrationResponse | null>(null);
  
  // Step 3 - Démarrage MOE
  const [insuranceVerified, setInsuranceVerified] = useState<CalibrationResponse | null>(null);
  const [docFiled, setDocFiled] = useState<CalibrationResponse | null>(null);
  const [pcDisplayed, setPcDisplayed] = useState<CalibrationResponse | null>(null);
  
  // Step 4 - Ongoing project
  const [decisionsWithoutValidation, setDecisionsWithoutValidation] = useState<CalibrationResponse | null>(null);
  const [workStarted, setWorkStarted] = useState<CalibrationResponse | null>(null);
  const [oralChanges, setOralChanges] = useState<CalibrationResponse | null>(null);
  
  // Step 5 - Documentary maturity
  const [proofsCentralized, setProofsCentralized] = useState<CalibrationResponse | null>(null);
  const [decisionsTraceable, setDecisionsTraceable] = useState<CalibrationResponse | null>(null);
  const [financialImpactsDocumented, setFinancialImpactsDocumented] = useState<CalibrationResponse | null>(null);

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return status !== null;
      case 1:
        return name.trim() !== '' && address.trim() !== '' && projectType !== null;
      case 2:
        return contractSigned !== null && scopeDefined !== null && 
               crFormalized !== null && writtenValidationRequired !== null;
      case 3:
        if (status === 'new') {
          return insuranceVerified !== null && docFiled !== null && pcDisplayed !== null;
        } else {
          return decisionsWithoutValidation !== null && workStarted !== null && oralChanges !== null;
        }
      case 4:
        return proofsCentralized !== null && decisionsTraceable !== null && financialImpactsDocumented !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const buildCalibration = (): ProjectCalibration => {
    return {
      contractSigned: contractSigned!,
      scopeDefined: scopeDefined!,
      crFormalized: crFormalized!,
      writtenValidationRequired: writtenValidationRequired!,
      ...(status === 'new' ? {
        insuranceVerified: insuranceVerified!,
        docFiled: docFiled!,
        pcDisplayed: pcDisplayed!,
      } : {
        decisionsWithoutValidation: decisionsWithoutValidation!,
        workStarted: workStarted!,
        oralChanges: oralChanges!,
      }),
      proofsCentralized: proofsCentralized!,
      decisionsTraceable: decisionsTraceable!,
      financialImpactsDocumented: financialImpactsDocumented!,
    };
  };

  const getPreviewScore = (): number => {
    if (step < 5) return 50;
    const calibration = buildCalibration();
    return calculateInitialScore(status!, projectType!, calibration);
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((step + 1) as Step);
    } else {
      const calibration = buildCalibration();
      const project = createProjectFromCalibration(
        name.trim(),
        address.trim(),
        projectType!,
        status!,
        calibration,
        startDate ? new Date(startDate) : undefined,
        contractualEndDate ? new Date(contractualEndDate) : undefined
      );
      // Return partial project (backend will add id, organizationId, etc.)
      const { id, createdAt, ...projectData } = project;
      onComplete({
        ...projectData,
        createdAt: new Date(),
      });
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    } else {
      onCancel();
    }
  };

  const renderResponseOptions = (
    value: CalibrationResponse | null,
    onChange: (v: CalibrationResponse) => void,
    id: string
  ) => (
    <RadioGroup
      value={value || ''}
      onValueChange={(v) => onChange(v as CalibrationResponse)}
      className="flex gap-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="yes" id={`${id}-yes`} />
        <Label htmlFor={`${id}-yes`} className="cursor-pointer font-normal">Oui</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id={`${id}-no`} />
        <Label htmlFor={`${id}-no`} className="cursor-pointer font-normal">Non</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="unknown" id={`${id}-unknown`} />
        <Label htmlFor={`${id}-unknown`} className="cursor-pointer font-normal">Je ne sais pas</Label>
      </div>
    </RadioGroup>
  );

  const previewScore = getPreviewScore();
  const previewRiskLevel = getScoreRiskLevel(previewScore);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl text-foreground">Nouveau projet</h1>
            <span className="text-sm text-muted-foreground">
              Étape {step + 1} sur {STEPS.length}
            </span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">{STEPS[step]}</p>
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6 min-h-[400px]">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Ce projet est-il nouveau ou déjà en cours ?</h2>
                <p className="text-muted-foreground text-sm">
                  Cette information détermine le calcul de votre score initial.
                </p>
              </div>
              <RadioGroup
                value={status || ''}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
                className="grid gap-4"
              >
                <label
                  htmlFor="status-new"
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                    status === 'new' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <RadioGroupItem value="new" id="status-new" className="mt-1" />
                  <div>
                    <div className="font-medium">Nouveau projet</div>
                    <div className="text-sm text-muted-foreground">
                      Le chantier n'a pas encore démarré. Score initial plus élevé.
                    </div>
                  </div>
                </label>
                <label
                  htmlFor="status-ongoing"
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                    status === 'ongoing' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <RadioGroupItem value="ongoing" id="status-ongoing" className="mt-1" />
                  <div>
                    <div className="font-medium">Projet en cours</div>
                    <div className="text-sm text-muted-foreground">
                      Des décisions ont déjà été prises. Score ajusté selon le risque accumulé.
                    </div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Identification du projet</h2>
                <p className="text-muted-foreground text-sm">
                  Ces informations permettent d'identifier le dossier.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Villa Martin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Ex: 12 rue des Lilas, 75001 Paris"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Démarrage (OS)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fin contractuelle</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={contractualEndDate}
                      onChange={(e) => setContractualEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type d'opération</Label>
                  <RadioGroup
                    value={projectType || ''}
                    onValueChange={(v) => setProjectType(v as Project['projectType'])}
                    className="grid gap-3"
                  >
                    {[
                      { value: 'individual', label: 'Maison individuelle' },
                      { value: 'renovation', label: 'Rénovation' },
                      { value: 'tertiary', label: 'Petit tertiaire' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        htmlFor={`type-${option.value}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          projectType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <RadioGroupItem value={option.value} id={`type-${option.value}`} />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Cadre contractuel</h2>
                <p className="text-muted-foreground text-sm">
                  Ces éléments définissent le niveau de protection de base.
                </p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Contrat MOE signé avec le client ?</Label>
                  {renderResponseOptions(contractSigned, setContractSigned, 'contract')}
                </div>
                <div className="space-y-2">
                  <Label>Missions clairement définies par écrit ?</Label>
                  {renderResponseOptions(scopeDefined, setScopeDefined, 'scope')}
                </div>
                <div className="space-y-2">
                  <Label>Compte-rendu de réunion formalisé prévu ?</Label>
                  {renderResponseOptions(crFormalized, setCrFormalized, 'cr')}
                </div>
                <div className="space-y-2">
                  <Label>Validation écrite du client requise pour les décisions ?</Label>
                  {renderResponseOptions(writtenValidationRequired, setWrittenValidationRequired, 'validation')}
                </div>
              </div>
            </div>
          )}

          {step === 3 && status === 'new' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Démarrage du projet</h2>
                <p className="text-muted-foreground text-sm">
                  Points de contrôle critiques pour le Maître d'Œuvre avant ouverture.
                </p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Assurances (RC Pro + Décennale) entreprises vérifiées ?</Label>
                  {renderResponseOptions(insuranceVerified, setInsuranceVerified, 'insurance')}
                </div>
                <div className="space-y-2">
                  <Label>Déclaration d'Ouverture de Chantier (DOC) déposée ?</Label>
                  {renderResponseOptions(docFiled, setDocFiled, 'doc')}
                </div>
                <div className="space-y-2">
                  <Label>Permis de Construire affiché sur le terrain ?</Label>
                  {renderResponseOptions(pcDisplayed, setPcDisplayed, 'pc')}
                </div>
              </div>
            </div>
          )}

          {step === 3 && status === 'ongoing' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Situation du projet en cours</h2>
                <p className="text-muted-foreground text-sm">
                  Ces éléments estiment le risque déjà accumulé.
                </p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Des décisions ont-elles déjà été prises sans validation écrite ?</Label>
                  {renderResponseOptions(decisionsWithoutValidation, setDecisionsWithoutValidation, 'decisions')}
                </div>
                <div className="space-y-2">
                  <Label>Des travaux ont-ils déjà commencé ?</Label>
                  {renderResponseOptions(workStarted, setWorkStarted, 'work')}
                </div>
                <div className="space-y-2">
                  <Label>Des avenants ont-ils été faits oralement ?</Label>
                  {renderResponseOptions(oralChanges, setOralChanges, 'oral')}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Maturité documentaire</h2>
                <p className="text-muted-foreground text-sm">
                  Ces éléments détectent les zones de risque cachées.
                </p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Les preuves (mails, CR, photos) sont-elles centralisées ?</Label>
                  {renderResponseOptions(proofsCentralized, setProofsCentralized, 'proofs')}
                </div>
                <div className="space-y-2">
                  <Label>Les décisions passées sont-elles retraçables ?</Label>
                  {renderResponseOptions(decisionsTraceable, setDecisionsTraceable, 'traceable')}
                </div>
                <div className="space-y-2">
                  <Label>Les impacts financiers sont-ils documentés ?</Label>
                  {renderResponseOptions(financialImpactsDocumented, setFinancialImpactsDocumented, 'financial')}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl mb-2">Récapitulatif</h2>
                <p className="text-muted-foreground text-sm">
                  Voici l'évaluation initiale de votre projet.
                </p>
              </div>

              {/* Project info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projet</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="font-medium">
                    {status === 'new' ? 'Nouveau projet' : 'Projet en cours'}
                  </span>
                </div>
              </div>

              {/* Score display */}
              <div className="text-center py-6">
                <div className="text-6xl font-display font-bold text-foreground mb-2">
                  {previewScore}
                </div>
                <div className="text-sm text-muted-foreground mb-4">Score initial</div>
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
                  getRiskLevelColor(previewRiskLevel)
                )}>
                  {previewRiskLevel === 'low' && <Shield className="h-4 w-4" />}
                  {previewRiskLevel === 'medium' && <AlertTriangle className="h-4 w-4" />}
                  {previewRiskLevel === 'high' && <AlertTriangle className="h-4 w-4" />}
                  <span className="font-medium">{getRiskLevelLabel(previewRiskLevel)}</span>
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Ce score est basé sur vos réponses initiales.
                  <br />
                  <strong className="text-foreground">Il évoluera avec chaque décision ajoutée.</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 0 ? 'Annuler' : 'Précédent'}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {step === 5 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Créer le projet
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
