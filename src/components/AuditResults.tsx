import { AlertTriangle, CheckCircle2, Download, ArrowLeft, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/types';
import { formatDateTime, getProjectTypeLabel } from '@/lib/projects';
import { getRiskLevelLabel, getRiskLevelDescription } from '@/lib/scoring';
import { getFailedQuestions, AUDIT_QUESTIONS } from '@/lib/audit';
import { cn } from '@/lib/utils';

interface AuditResultsProps {
  project: Project;
  onBack: () => void;
  onContinueToProject: () => void;
}

export const AuditResults = ({ project, onBack, onContinueToProject }: AuditResultsProps) => {
  if (!project.auditResult) return null;

  const { auditResult } = project;
  const failedQuestions = getFailedQuestions(auditResult.answers);

  const getRiskIcon = () => {
    switch (auditResult.riskLevel) {
      case 'low':
        return <ShieldCheck className="h-12 w-12" />;
      case 'medium':
        return <Shield className="h-12 w-12" />;
      case 'high':
        return <ShieldAlert className="h-12 w-12" />;
    }
  };

  const getRiskStyles = () => {
    switch (auditResult.riskLevel) {
      case 'low':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-600',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-500',
          badge: 'bg-amber-600',
        };
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-400',
          badge: 'bg-red-600',
        };
    }
  };

  const styles = getRiskStyles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Project info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Chantier</p>
          <p className="font-medium">{project.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Client</p>
          <p className="font-medium">{project.client}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
          <p className="font-medium">{getProjectTypeLabel(project.projectType)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Audit réalisé le</p>
          <p className="font-medium">{formatDateTime(auditResult.answeredAt)}</p>
        </div>
      </div>

      {/* Score card */}
      <Card className={cn('p-8 text-center', styles.bg, styles.border, 'border-2')}>
        <div className={cn('inline-flex mb-4', styles.text)}>
          {getRiskIcon()}
        </div>
        <div className="text-5xl font-display font-bold mb-2">{auditResult.score}%</div>
        <div className="text-lg text-muted-foreground mb-4">Score de traçabilité initial</div>
        <div className={cn('inline-block px-4 py-2 rounded-full text-white font-medium', styles.badge)}>
          {getRiskLevelLabel(auditResult.riskLevel)}
        </div>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
          {getRiskLevelDescription(auditResult.riskLevel)}
        </p>
      </Card>

      {/* Risks identified */}
      {failedQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Points d'attention ({failedQuestions.length})
          </h3>
          <div className="space-y-3">
            {failedQuestions.map((question) => (
              <Card key={question.id} className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
                <p className="font-medium text-sm mb-2">{question.question}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">→ Action : </span>
                  {question.recommendation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conformities */}
      {failedQuestions.length < AUDIT_QUESTIONS.length && (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Points conformes ({AUDIT_QUESTIONS.length - failedQuestions.length - auditResult.answers.filter(a => a.response === 'na').length})
          </h3>
          <div className="grid gap-2">
            {AUDIT_QUESTIONS.filter((q) => {
              const answer = auditResult.answers.find((a) => a.questionId === q.id);
              return answer?.response === 'yes';
            }).map((question) => (
              <div key={question.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{question.question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA to continue */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="text-center space-y-3">
          <h4 className="font-medium text-lg">Audit initial terminé</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Vous pouvez maintenant suivre l'évolution de la traçabilité en ajoutant les décisions prises sur ce chantier.
          </p>
          <Button onClick={onContinueToProject} size="lg">
            Accéder au suivi du projet
          </Button>
        </div>
      </Card>
    </div>
  );
};
