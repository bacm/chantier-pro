import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AuditAnswer, AuditResponse, AuditResult } from '@/types';
import { AUDIT_QUESTIONS, calculateAuditResult, getCategories, getQuestionsByCategory } from '@/lib/audit';

interface AuditQuestionnaireProps {
  onComplete: (result: AuditResult) => void;
  onCancel: () => void;
}

export const AuditQuestionnaire = ({ onComplete, onCancel }: AuditQuestionnaireProps) => {
  const categories = getCategories();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<AuditAnswer[]>([]);

  const currentCategory = categories[currentCategoryIndex];
  const categoryQuestions = getQuestionsByCategory(currentCategory);
  const totalQuestions = AUDIT_QUESTIONS.length;
  const answeredCount = answers.length;
  const progress = (answeredCount / totalQuestions) * 100;

  const getAnswer = (questionId: string): AuditResponse | undefined => {
    return answers.find((a) => a.questionId === questionId)?.response;
  };

  const setAnswer = (questionId: string, response: AuditResponse) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, response }];
    });
  };

  const canProceed = categoryQuestions.every((q) => getAnswer(q.id) !== undefined);
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  const handleNext = () => {
    if (isLastCategory) {
      const result = calculateAuditResult(answers);
      onComplete(result);
    } else {
      setCurrentCategoryIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Catégorie {currentCategoryIndex + 1} sur {categories.length}
          </span>
          <span className="font-medium">
            {answeredCount} / {totalQuestions} questions
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category title */}
      <div className="border-b pb-4">
        <h2 className="font-display text-2xl font-semibold">{currentCategory}</h2>
        <p className="text-muted-foreground mt-1">
          Répondez à chaque question selon la situation actuelle de votre chantier.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {categoryQuestions.map((question, index) => (
          <Card key={question.id} className="p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed">{question.question}</p>
              </div>

              <RadioGroup
                value={getAnswer(question.id)}
                onValueChange={(v) => setAnswer(question.id, v as AuditResponse)}
                className="flex gap-4 pl-9"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                  <Label
                    htmlFor={`${question.id}-yes`}
                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Oui
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${question.id}-no`} />
                  <Label
                    htmlFor={`${question.id}-no`}
                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Non
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="na" id={`${question.id}-na`} />
                  <Label
                    htmlFor={`${question.id}-na`}
                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <MinusCircle className="h-4 w-4 text-muted-foreground" />
                    N/A
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          {currentCategoryIndex > 0 && (
            <Button variant="ghost" onClick={handlePrevious}>
              Précédent
            </Button>
          )}
        </div>
        <Button onClick={handleNext} disabled={!canProceed}>
          {isLastCategory ? 'Voir les résultats' : 'Suivant'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
