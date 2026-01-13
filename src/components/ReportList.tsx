import { SiteReport, Company, WeatherType, Project } from '@/types';
import { formatDate } from '@/lib/projects';
import { generateSiteReportPDF } from '@/lib/pdf';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Calendar as CalendarIcon, Users, Download, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReportListProps {
  reports: SiteReport[];
  companies: Company[];
  project: Project;
  onAddReport: () => void;
}

const WeatherIcon = ({ type }: { type: WeatherType }) => {
  switch (type) {
    case 'sunny': return <Sun className="h-4 w-4 text-amber-500" />;
    case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
    case 'rain': return <CloudRain className="h-4 w-4 text-blue-500" />;
    case 'storm': return <CloudLightning className="h-4 w-4 text-purple-500" />;
    case 'snow': return <Snowflake className="h-4 w-4 text-cyan-500" />;
    default: return <Sun className="h-4 w-4" />;
  }
};

export const ReportList = ({ reports, companies, project, onAddReport }: ReportListProps) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucun rapport de chantier</p>
        <p className="text-xs mt-1 mb-4">Créez des rapports hebdomadaires pour suivre l'avancement</p>
        <Button variant="outline" size="sm" onClick={onAddReport}>
          <Plus className="h-3 w-3 mr-2" />
          Nouveau rapport
        </Button>
      </div>
    );
  }

  // Sort by date, newest first
  const sortedReports = [...reports].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getCompanyName = (id: string) => {
    const company = companies.find(c => c.id === id);
    return company ? `${company.trade} (${company.name})` : 'Entreprise inconnue';
  };

  const handleExportPDF = (report: SiteReport) => {
    generateSiteReportPDF(project, report);
    toast.success('Rapport exporté', {
      description: 'Le compte-rendu a été généré en PDF.',
    });
  };

  return (
    <div className="space-y-4">
      {sortedReports.map((report) => (
        <div key={report.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base font-medium px-3 py-1">
                {formatDate(report.date)}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                <WeatherIcon type={report.weather} />
                <span className="capitalize">{report.weather === 'rain' ? 'Pluie' : report.weather === 'sunny' ? 'Ensoleillé' : report.weather === 'cloudy' ? 'Nuageux' : report.weather === 'storm' ? 'Orage' : 'Neige'}</span>
                {report.temperature && <span>• {report.temperature}°C</span>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleExportPDF(report)}>
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Remarques & Avancement</h4>
            <p className="text-sm whitespace-pre-wrap">{report.generalRemarks || "Aucune remarque particulière."}</p>
          </div>

          {report.observations && report.observations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Observations détaillées
              </h4>
              <div className="space-y-1">
                {report.observations.map((obs) => (
                  <div key={obs.id} className="text-xs p-2 bg-muted/30 rounded flex items-start gap-2">
                    <span className="font-bold text-muted-foreground whitespace-nowrap min-w-[100px]">
                      {obs.companyId ? companies.find(c => c.id === obs.companyId)?.trade : 'Général'} :
                    </span>
                    <span>{obs.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground block mb-1">Présents sur site :</span>
                {report.presentCompanyIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.presentCompanyIds.map(id => (
                      <Badge key={id} variant="secondary" className="font-normal text-xs">
                        {getCompanyName(id)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm italic text-muted-foreground">Personne</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};