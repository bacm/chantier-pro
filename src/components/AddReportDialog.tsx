import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Trash2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SiteReport, WeatherType, Company, SiteObservation } from '@/types';
import { createSiteReport } from '@/lib/projects';

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportAdded: (report: SiteReport) => void;
  companies: Company[];
}

const WEATHER_OPTIONS: { value: WeatherType; label: string; icon: any }[] = [
  { value: 'sunny', label: 'Ensoleillé', icon: Sun },
  { value: 'cloudy', label: 'Nuageux', icon: Cloud },
  { value: 'rain', label: 'Pluie', icon: CloudRain },
  { value: 'storm', label: 'Orage', icon: CloudLightning },
  { value: 'snow', label: 'Neige', icon: Snowflake },
];

export const AddReportDialog = ({ open, onOpenChange, onReportAdded, companies }: AddReportDialogProps) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [temperature, setTemperature] = useState<string>('');
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [presentCompanyIds, setPresentCompanyIds] = useState<string[]>([]);
  
  // Observations state
  const [observations, setObservations] = useState<Omit<SiteObservation, 'id'>[]>([]);
  const [newObsText, setNewObsText] = useState('');
  const [newObsCompanyId, setNewObsCompanyId] = useState<string>('none');

  const handleCompanyToggle = (companyId: string) => {
    setPresentCompanyIds(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const addObservation = () => {
    if (!newObsText.trim()) return;
    setObservations(prev => [
      ...prev,
      {
        companyId: newObsCompanyId === 'none' ? undefined : newObsCompanyId,
        text: newObsText.trim(),
        isDone: false
      }
    ]);
    setNewObsText('');
  };

  const removeObservation = (index: number) => {
    setObservations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report = createSiteReport(
      new Date(date),
      weather,
      presentCompanyIds,
      generalRemarks.trim(),
      observations,
      temperature ? parseFloat(temperature) : undefined
    );
    
    onReportAdded(report);

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setWeather('sunny');
    setTemperature('');
    setGeneralRemarks('');
    setPresentCompanyIds([]);
    setObservations([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nouveau rapport de chantier</DialogTitle>
          <DialogDescription>
            Enregistrez les conditions, les présents et les observations par lot.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp">Température (°C)</Label>
              <Input
                id="temp"
                type="number"
                placeholder="Ex: 20"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Météo</Label>
            <Select value={weather} onValueChange={(v) => setWeather(v as WeatherType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEATHER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Entreprises présentes</Label>
            {companies.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune entreprise assignée au projet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-32 overflow-y-auto bg-muted/30">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`company-${company.id}`} 
                      checked={presentCompanyIds.includes(company.id)}
                      onCheckedChange={() => handleCompanyToggle(company.id)}
                    />
                    <Label 
                      htmlFor={`company-${company.id}`} 
                      className="font-normal cursor-pointer truncate text-xs"
                    >
                      {company.trade}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Observations */}
          <div className="space-y-3 border-t pt-4">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Observations par lot
            </Label>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={newObsCompanyId} onValueChange={setNewObsCompanyId}>
                  <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Lot concerné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Général</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Nouvelle observation..." 
                  value={newObsText}
                  onChange={(e) => setNewObsText(e.target.value)}
                  className="h-9 text-xs"
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addObservation(); } }}
                />
                <Button type="button" size="sm" onClick={addObservation} className="h-9">
                  Ajouter
                </Button>
              </div>

              {observations.length > 0 && (
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {observations.map((obs, index) => (
                    <div key={index} className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded text-xs group">
                      <div className="flex-1">
                        <span className="font-semibold text-muted-foreground mr-2">
                          {obs.companyId ? companies.find(c => c.id === obs.companyId)?.trade : 'Général'} :
                        </span>
                        {obs.text}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeObservation(index)}
                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="remarks">Remarques générales / Avancement</Label>
            <Textarea
              id="remarks"
              placeholder="Avancement global, points bloquants, sécurité..."
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Créer le rapport
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
