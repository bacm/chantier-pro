import { RiskLevel } from '@/types';
import { getRiskLevelColor, getRiskLevelLabel, getRiskLevelDescription } from '@/lib/scoring';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  riskLevel: RiskLevel;
  evolution?: number;
  compact?: boolean;
}

export const ScoreDisplay = ({ score, riskLevel, evolution, compact = false }: ScoreDisplayProps) => {
  const colorClasses = getRiskLevelColor(riskLevel);
  
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses}`}>
        <span className="text-lg font-bold">{score}%</span>
        <span className="text-sm font-medium">{getRiskLevelLabel(riskLevel)}</span>
        {evolution !== undefined && evolution !== 0 && (
          <span className={`flex items-center text-xs ${evolution > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {evolution > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {evolution > 0 ? '+' : ''}{evolution}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-6 text-center ${colorClasses}`}>
      <div className="text-5xl font-bold mb-2">{score}%</div>
      <div className="text-sm font-medium mb-3">Score de traçabilité</div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-current/10">
        <span className="font-semibold">{getRiskLevelLabel(riskLevel)}</span>
        {evolution !== undefined && evolution !== 0 && (
          <span className={`flex items-center text-sm ${evolution > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {evolution > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {evolution > 0 ? '+' : ''}{evolution}
          </span>
        )}
      </div>
      <p className="text-sm mt-4 opacity-80">{getRiskLevelDescription(riskLevel)}</p>
    </div>
  );
};
