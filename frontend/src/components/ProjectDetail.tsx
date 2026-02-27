import { useState } from 'react';
import { addDays } from 'date-fns';
import { ArrowLeft, Plus, Download, Shield, AlertTriangle, TrendingUp, TrendingDown, Minus, Euro, Clock, Calendar, Wind, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Decision, Company, SiteReport, Snag, PaymentApplication } from '@/types';
import { getProjectTypeLabel, getProjectStatusLabel, updateProjectPlanning } from '@/lib/projects';
import { formatDate } from '@/lib/utils';
import { generateProjectStatusPDF, generateAcceptancePDF, generatePaymentCertificatePDF } from '@/lib/pdf';
import {
  getRiskLevelColor,
  getRiskLevelLabel,
  getRiskLevelDescription,
  getProblematicDecisions,
  calculateScoreEvolution,
} from '@/lib/scoring';
import { DecisionTimeline } from './DecisionTimeline';
import { AddDecisionDialog } from './AddDecisionDialog';
import { AddCompanyDialog } from './AddCompanyDialog';
import { CompanyList } from './CompanyList';
import { AddReportDialog } from './AddReportDialog';
import { ReportList } from './ReportList';
import { AddPlanningDialog } from './AddPlanningDialog';
import { SnagList } from './SnagList';
import { AddSnagDialog } from './AddSnagDialog';
import { FinancialOverview } from './FinancialOverview';
import { PaymentList } from './PaymentList';
import { AddPaymentDialog } from './AddPaymentDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail = ({ 
  project, 
  onBack,
}: ProjectDetailProps) => {
  const { toggleSnagStatus } = useProjectOperations(project.id);
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showEditPlanning, setShowEditPlanning] = useState(false);
  const [showAddSnag, setShowAddSnag] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  
  const evolution = calculateScoreEvolution(project);

  // Financial calculations
  const totalMarket = project.companies.reduce((sum, c) => sum + (c.contractAmount || 0), 0);
  const totalTMA = project.decisions
    .filter(d => d.hasFinancialImpact && d.amount)
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const budgetEvolution = totalMarket > 0 ? (totalTMA / totalMarket) * 100 : 0;

  // Planning & Weather calculations
  const badWeatherDays = project.reports.filter(r => r.isValidatedBadWeather).length;
  
  const getAdjustedContractualDate = () => {
    if (!project.contractualEndDate) return null;
    return addDays(project.contractualEndDate, badWeatherDays);
  };
  
  const adjustedContractualDate = getAdjustedContractualDate();

  const calculateDelay = () => {
    if (!adjustedContractualDate || !project.estimatedEndDate) return 0;
    const diffTime = project.estimatedEndDate.getTime() - adjustedContractualDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const delay = calculateDelay();

  const handleExportPDF = () => {
    generateProjectStatusPDF(project);
    toast.success('PDF généré', {
      description: 'Le rapport a été téléchargé.',
    });
  };

  const handleExportSnags = () => {
    generateAcceptancePDF(project);
    toast.success('Liste des réserves générée');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.address}</p>
          </div>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Score & Risk card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-foreground">
                  {project.currentScore}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Score actuel</div>
              </div>
              <div className="flex flex-col items-center">
                {evolution > 0 && <div className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-5 w-5" /><span className="font-medium">+{evolution}</span></div>}
                {evolution < 0 && <div className="flex items-center gap-1 text-red-600"><TrendingDown className="h-5 w-5" /><span className="font-medium">{evolution}</span></div>}
                {evolution === 0 && <div className="flex items-center gap-1 text-muted-foreground"><Minus className="h-5 w-5" /><span className="font-medium">0</span></div>}
                <div className="text-xs text-muted-foreground mt-1">vs. initial ({project.initialScore})</div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
                getRiskLevelColor(project.currentRiskLevel)
              )}>
                {project.currentRiskLevel === 'low' && <Shield className="h-4 w-4" />}
                {project.currentRiskLevel !== 'low' && <AlertTriangle className="h-4 w-4" />}
                {getRiskLevelLabel(project.currentRiskLevel)}
              </div>
              <p className="text-sm text-muted-foreground max-w-xs text-right">
                {getRiskLevelDescription(project.currentRiskLevel)}
              </p>
            </div>
          </div>
        </div>

        {/* Financial & Planning Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {totalMarket > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Euro className="h-4 w-4" /> Suivi Financier
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xl font-bold">{totalMarket.toLocaleString('fr-FR')} €</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Marchés HT</div>
                </div>
                <div>
                  <div className={cn("text-xl font-bold", budgetEvolution > 5 ? "text-red-600" : "text-foreground")}>
                    {budgetEvolution > 0 ? '+' : ''}{budgetEvolution.toFixed(1)} %
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Évol. Budget</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6 relative group">
            <button 
              onClick={() => setShowEditPlanning(true)}
              className="absolute top-4 right-4 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
            </button>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Suivi Planning
            </h3>
            {project.contractualEndDate ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xl font-bold">
                    {adjustedContractualDate ? formatDate(adjustedContractualDate) : '-'}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Fin Contractuelle {badWeatherDays > 0 ? '(décalée)' : ''}
                  </div>
                  {badWeatherDays > 0 && (
                    <div className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <Wind className="h-2.5 w-2.5" /> +{badWeatherDays}j intempéries
                    </div>
                  )}
                </div>
                <div>
                  <div className={cn("text-xl font-bold", delay > 0 ? "text-red-600" : "text-emerald-600")}>
                    {delay > 0 ? `+${delay} jours` : 'À l\'heure'}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Retard / Avance</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <p className="text-xs text-muted-foreground mb-2">Dates non définies</p>
                <Button variant="outline" size="sm" onClick={() => setShowEditPlanning(true)}>
                  Renseigner le planning
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Type</div>
            <div className="font-medium text-sm">{getProjectTypeLabel(project.projectType)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Statut</div>
            <div className="font-medium text-sm">{getProjectStatusLabel(project.status)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Intervenants</div>
            <div className="font-medium text-sm">{project.companies.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Rapports</div>
            <div className="font-medium text-sm">{project.reports?.length || 0}</div>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="decisions" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="decisions">Journal</TabsTrigger>
            <TabsTrigger value="companies">Intervenants</TabsTrigger>
            <TabsTrigger value="finance">Finances</TabsTrigger>
            <TabsTrigger value="reports">Visites</TabsTrigger>
            <TabsTrigger value="snags">Réserves (OPR)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="decisions" className="bg-card border border-border rounded-lg mt-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-lg">Décisions</h2>
              <Button onClick={() => setShowAddDecision(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="p-4">
              <DecisionTimeline decisions={project.decisions} />
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <CompanyList 
              companies={project.companies} 
              onAddCompany={() => setShowAddCompany(true)}
            />
          </TabsContent>

          <TabsContent value="finance">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg">Situation Financière</h2>
                <Button onClick={() => setShowAddPayment(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Saisir une situation
                </Button>
              </div>
              
              <FinancialOverview project={project} />
              
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-medium mb-4">Historique des situations</h3>
                <PaymentList 
                  project={project} 
                  payments={project.payments || []}
                  onGenerateCertificate={(p) => generatePaymentCertificatePDF(project, p)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportList
              reports={project.reports || []}
              companies={project.companies}
              project={project}
              onAddReport={() => setShowAddReport(true)}
            />
          </TabsContent>

          <TabsContent value="snags">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-t-lg border-b-0">
              <h2 className="font-display text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground" /> Suivi des Réserves
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportSnags}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter OPR
                </Button>
                <Button onClick={() => setShowAddSnag(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle réserve
                </Button>
              </div>
            </div>
            <div className="bg-card border border-border rounded-b-lg p-4">
              <SnagList 
                project={project} 
                onToggleSnag={toggleSnagStatus} 
                onAddSnag={() => setShowAddSnag(true)} 
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddDecisionDialog
          open={showAddDecision}
          onOpenChange={setShowAddDecision}
          companies={project.companies}
        />
        
        <AddCompanyDialog
          open={showAddCompany}
          onOpenChange={setShowAddCompany}
        />

        <AddReportDialog
          open={showAddReport}
          onOpenChange={setShowAddReport}
          companies={project.companies}
        />

        <AddPlanningDialog
          open={showEditPlanning}
          onOpenChange={setShowEditPlanning}
          project={project}
        />

        <AddSnagDialog
          open={showAddSnag}
          onOpenChange={setShowAddSnag}
          companies={project.companies}
        />
        
        <AddPaymentDialog
          open={showAddPayment}
          onOpenChange={setShowAddPayment}
          project={project}
        />
      </div>
    </div>
  );
};