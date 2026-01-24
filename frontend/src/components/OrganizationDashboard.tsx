import { useDashboard } from '@/hooks/useDashboard';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Building2, TrendingUp, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportsApi } from '@/lib/api';
import { toast } from 'sonner';

export function OrganizationDashboard() {
  const { currentOrganization } = useOrganization();
  const { data: dashboard, isLoading } = useDashboard(currentOrganization?.id || null);

  const handleExport = async (type: 'projects' | 'companies' | 'snags') => {
    if (!currentOrganization) return;
    
    try {
      let blob;
      let filename;
      
      switch (type) {
        case 'projects':
          blob = await exportsApi.exportProjects(currentOrganization.id);
          filename = `projets-${currentOrganization.slug}.csv`;
          break;
        case 'companies':
          blob = await exportsApi.exportCompanies(currentOrganization.id);
          filename = `entreprises-${currentOrganization.slug}.csv`;
          break;
        case 'snags':
          blob = await exportsApi.exportSnags(currentOrganization.id);
          filename = `reserves-${currentOrganization.slug}.csv`;
          break;
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export', { description: (error as Error).message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis, projects, recentActivity } = dashboard;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total projets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Projets actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets sécurisés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.projectsSecured}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.projectsInVigilance} en vigilance • {kpis.projectsAtRisk} à risque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume marché HT</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(kpis.totalMarketValue)}
            </div>
            <p className="text-xs text-muted-foreground">Total des marchés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets en retard</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis.delayedProjects}</div>
            <p className="text-xs text-muted-foreground">Retards détectés</p>
          </CardContent>
        </Card>
      </div>

      {/* Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports</CardTitle>
          <CardDescription>Téléchargez les données de l'organisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleExport('projects')} className="gap-2">
              <Download className="h-4 w-4" />
              Liste des projets
            </Button>
            <Button variant="outline" onClick={() => handleExport('companies')} className="gap-2">
              <Download className="h-4 w-4" />
              Liste des entreprises
            </Button>
            <Button variant="outline" onClick={() => handleExport('snags')} className="gap-2">
              <Download className="h-4 w-4" />
              Liste des réserves
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Projets</h2>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Aucun projet dans cette organisation</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge
                      variant={
                        project.currentRiskLevel === 'low'
                          ? 'default'
                          : project.currentRiskLevel === 'medium'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {project.currentRiskLevel === 'low'
                        ? 'Sécurisé'
                        : project.currentRiskLevel === 'medium'
                        ? 'Vigilance'
                        : 'À risque'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">{project.currentScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Statut</span>
                      <span className="capitalize">{project.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
