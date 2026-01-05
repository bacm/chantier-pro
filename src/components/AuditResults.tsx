import { AlertTriangle, CheckCircle2, Download, FileText, ArrowLeft, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/types';
import { formatDateTime, getProjectTypeLabel } from '@/lib/projects';
import { getRiskLevelLabel, getRiskLevelDescription, getFailedQuestions, AUDIT_QUESTIONS } from '@/lib/audit';
import { generateAuditPDF } from '@/lib/pdf';
import { cn } from '@/lib/utils';

interface AuditResultsProps {
  project: Project;
  onBack: () => void;
}

export const AuditResults = ({ project, onBack }: AuditResultsProps) => {
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
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-400',
          badge: 'bg-green-600',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-500',
          badge: 'bg-yellow-600',
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
          Retour aux chantiers
        </Button>
        <Button onClick={() => generateAuditPDF(project)} className="gap-2">
          <Download className="h-4 w-4" />
          Exporter le rapport PDF
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
        <div className="text-lg text-muted-foreground mb-4">Score de traçabilité</div>
        <div className={cn('inline-block px-4 py-2 rounded-full text-white font-medium', styles.badge)}>
          Risque {getRiskLevelLabel(auditResult.riskLevel)}
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
            Risques identifiés ({failedQuestions.length})
          </h3>
          <div className="space-y-3">
            {failedQuestions.map((question) => (
              <Card key={question.id} className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
                <p className="font-medium text-sm mb-2">{question.question}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-green-700 dark:text-green-400">→ Action : </span>
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
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Points conformes ({AUDIT_QUESTIONS.length - failedQuestions.length - auditResult.answers.filter(a => a.response === 'na').length})
          </h3>
          <div className="grid gap-2">
            {AUDIT_QUESTIONS.filter((q) => {
              const answer = auditResult.answers.find((a) => a.questionId === q.id);
              return answer?.response === 'yes';
            }).map((question) => (
              <div key={question.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{question.question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h4 className="font-medium mb-1">Rapport d'audit complet</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Téléchargez le rapport PDF pour documenter l'état de traçabilité de ce chantier. 
              Ce document peut être utilisé comme preuve de diligence en cas de litige.
            </p>
            <Button onClick={() => generateAuditPDF(project)} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le rapport
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
