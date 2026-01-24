import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Euro, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoeCockpitProps {
  projects: Project[];
}

export const MoeCockpit = ({ projects }: MoeCockpitProps) => {
  if (projects.length === 0) return null;

  // 1. Risks calculations
  const projectsAtRisk = projects.filter(p => p.currentRiskLevel === 'high').length;
  const averageScore = Math.round(projects.reduce((sum, p) => sum + p.currentScore, 0) / projects.length);

  // 2. Planning calculations
  const projectsWithDelay = projects.filter(p => {
    if (!p.contractualEndDate || !p.estimatedEndDate) return false;
    return p.estimatedEndDate > p.contractualEndDate;
  }).length;

  // 3. Financial calculations
  const totalVolume = projects.reduce((sum, p) => {
    return sum + p.companies.reduce((cSum, c) => cSum + (c.contractAmount || 0), 0);
  }, 0);
  
  const totalTMA = projects.reduce((sum, p) => {
    return sum + p.decisions
      .filter(d => d.hasFinancialImpact && d.amount)
      .reduce((dSum, d) => dSum + (d.amount || 0), 0);
  }, 0);

  const averageTmaPercent = totalVolume > 0 ? (totalTMA / totalVolume) * 100 : 0;

  // 4. Administrative calculations
  const totalCompanies = projects.reduce((sum, p) => sum + p.companies.length, 0);
  const companiesMissingInsurance = projects.reduce((sum, p) => {
    return sum + p.companies.filter(c => !c.hasInsurance).length;
  }, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {/* Risk KPI */}
      <Card className={cn(projectsAtRisk > 0 ? "border-red-200 bg-red-50/30" : "")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
          <CardTitle className="text-xs font-medium uppercase">Sécurité Juridique</CardTitle>
          <Shield className={cn("h-4 w-4", projectsAtRisk > 0 ? "text-red-500" : "text-emerald-500")} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projectsAtRisk > 0 ? `${projectsAtRisk} chantiers à risque` : 'Tout est sécurisé'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Score moyen agence : <span className="font-bold">{averageScore}/100</span>
          </p>
        </CardContent>
      </Card>

      {/* Planning KPI */}
      <Card className={cn(projectsWithDelay > 0 ? "border-amber-200 bg-amber-50/30" : "")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
          <CardTitle className="text-xs font-medium uppercase">Délais & Planning</CardTitle>
          <Clock className={cn("h-4 w-4", projectsWithDelay > 0 ? "text-amber-500" : "text-emerald-500")} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projectsWithDelay > 0 ? `${projectsWithDelay} chantiers en retard` : 'Aucun retard'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sur {projects.length} projets actifs
          </p>
        </CardContent>
      </Card>

      {/* Financial KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
          <CardTitle className="text-xs font-medium uppercase">Volume Géré (HT)</CardTitle>
          <Euro className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(totalVolume / 1000).toFixed(1)}k €
          </div>
          <p className={cn("text-xs mt-1", averageTmaPercent > 5 ? "text-red-600 font-medium" : "text-muted-foreground")}>
            TMA moyen : {averageTmaPercent.toFixed(1)}% {averageTmaPercent > 5 && '⚠️'}
          </p>
        </CardContent>
      </Card>

      {/* Admin KPI */}
      <Card className={cn(companiesMissingInsurance > 0 ? "border-red-200 bg-red-50/30" : "")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
          <CardTitle className="text-xs font-medium uppercase">Conformité Admin</CardTitle>
          <Building2 className={cn("h-4 w-4", companiesMissingInsurance > 0 ? "text-red-500" : "text-emerald-500")} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {companiesMissingInsurance > 0 ? `${companiesMissingInsurance} docs manquants` : '100% conforme'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sur {totalCompanies} entreprises engagées
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
