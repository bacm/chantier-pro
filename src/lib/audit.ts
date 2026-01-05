import { AuditQuestion, AuditAnswer, AuditResult, RiskLevel } from '@/types';

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  {
    id: 'q1',
    category: 'Validation client',
    question: 'Les modifications demandées par le client sont-elles validées par écrit (mail, courrier, avenant) ?',
    riskWeight: 3,
    recommendation: 'Obtenir une validation écrite du client pour chaque modification de programme ou de prestation.',
  },
  {
    id: 'q2',
    category: 'Validation client',
    question: 'Les choix techniques validés par le client sont-ils documentés avec sa signature ou son accord explicite ?',
    riskWeight: 3,
    recommendation: 'Faire signer un document de validation des choix techniques ou conserver un mail d\'approbation.',
  },
  {
    id: 'q3',
    category: 'Preuves datées',
    question: 'Disposez-vous de photos datées des étapes clés du chantier ?',
    riskWeight: 2,
    recommendation: 'Photographier systématiquement les étapes clés avec horodatage automatique activé.',
  },
  {
    id: 'q4',
    category: 'Preuves datées',
    question: 'Les comptes rendus de réunion sont-ils datés et diffusés dans les 48h ?',
    riskWeight: 2,
    recommendation: 'Envoyer les comptes rendus par mail dans les 48h suivant chaque réunion.',
  },
  {
    id: 'q5',
    category: 'Preuves datées',
    question: 'Les échanges importants (décisions, alertes) sont-ils conservés dans un format non modifiable ?',
    riskWeight: 3,
    recommendation: 'Archiver les mails importants en PDF et conserver les originaux dans une boîte dédiée.',
  },
  {
    id: 'q6',
    category: 'Traçabilité financière',
    question: 'Les devis modificatifs sont-ils systématiquement émis avant exécution des travaux ?',
    riskWeight: 3,
    recommendation: 'Toujours émettre un devis modificatif signé avant le démarrage de travaux supplémentaires.',
  },
  {
    id: 'q7',
    category: 'Traçabilité financière',
    question: 'Les conséquences financières des décisions client sont-elles tracées par écrit ?',
    riskWeight: 2,
    recommendation: 'Documenter par écrit l\'impact financier de chaque décision modifiant le budget initial.',
  },
  {
    id: 'q8',
    category: 'Alertes et réserves',
    question: 'Avez-vous émis des réserves écrites sur les risques identifiés ?',
    riskWeight: 3,
    recommendation: 'Formaliser par écrit toute alerte sur un risque technique, financier ou de délai.',
  },
  {
    id: 'q9',
    category: 'Alertes et réserves',
    question: 'Les non-conformités constatées sont-elles documentées avec preuves ?',
    riskWeight: 2,
    recommendation: 'Photographier et décrire par écrit chaque non-conformité constatée.',
  },
  {
    id: 'q10',
    category: 'Contractualisation',
    question: 'Le contrat de maîtrise d\'œuvre est-il signé avant le démarrage du chantier ?',
    riskWeight: 3,
    recommendation: 'S\'assurer que le contrat MOE est signé par toutes les parties avant tout démarrage.',
  },
  {
    id: 'q11',
    category: 'Contractualisation',
    question: 'La mission et ses limites sont-elles clairement définies dans le contrat ?',
    riskWeight: 2,
    recommendation: 'Vérifier que le périmètre de mission est explicitement décrit dans le contrat.',
  },
  {
    id: 'q12',
    category: 'Réception',
    question: 'Les procès-verbaux de réception sont-ils systématiquement établis et signés ?',
    riskWeight: 3,
    recommendation: 'Établir un PV de réception contradictoire signé par toutes les parties.',
  },
];

export const calculateAuditResult = (answers: AuditAnswer[]): AuditResult => {
  let totalWeight = 0;
  let earnedPoints = 0;

  AUDIT_QUESTIONS.forEach((question) => {
    const answer = answers.find((a) => a.questionId === question.id);
    if (answer && answer.response !== 'na') {
      totalWeight += question.riskWeight;
      if (answer.response === 'yes') {
        earnedPoints += question.riskWeight;
      }
    }
  });

  const score = totalWeight > 0 ? Math.round((earnedPoints / totalWeight) * 100) : 0;
  
  let riskLevel: RiskLevel;
  if (score >= 75) {
    riskLevel = 'low';
  } else if (score >= 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  return {
    score,
    riskLevel,
    answeredAt: new Date(),
    answers,
  };
};

export const getRiskLevelLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'Faible';
    case 'medium':
      return 'Moyen';
    case 'high':
      return 'Élevé';
  }
};

export const getRiskLevelDescription = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'Votre traçabilité est solide. Les principaux risques juridiques sont couverts.';
    case 'medium':
      return 'Des failles existent dans votre documentation. Des actions correctives sont recommandées.';
    case 'high':
      return 'Risque juridique important. Plusieurs éléments essentiels de traçabilité sont manquants.';
  }
};

export const getCategories = (): string[] => {
  return [...new Set(AUDIT_QUESTIONS.map((q) => q.category))];
};

export const getQuestionsByCategory = (category: string): AuditQuestion[] => {
  return AUDIT_QUESTIONS.filter((q) => q.category === category);
};

export const getFailedQuestions = (answers: AuditAnswer[]): AuditQuestion[] => {
  return AUDIT_QUESTIONS.filter((question) => {
    const answer = answers.find((a) => a.questionId === question.id);
    return answer && answer.response === 'no';
  });
};
