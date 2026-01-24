import { Project } from '@/types';
import { getCompanyContractTotal } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface FinancialOverviewProps {
  project: Project;
}

export const FinancialOverview = ({ project }: FinancialOverviewProps) => {
  const companiesData = project.companies.map(company => {
    const contractTotal = getCompanyContractTotal(project, company.id);
    
    // Find latest validated payment
    const payments = (project.payments || [])
      .filter(p => p.companyId === company.id && (p.status === 'validated' || p.status === 'paid'))
      .sort((a, b) => b.number - a.number);
      
    const lastPayment = payments[0];
    const validatedAmount = lastPayment ? lastPayment.validatedAmount : 0;
    const progress = contractTotal > 0 ? (validatedAmount / contractTotal) * 100 : 0;
    const balance = contractTotal - validatedAmount;

    return {
      company,
      contractTotal,
      validatedAmount,
      progress,
      balance,
      lastPaymentDate: lastPayment?.date
    };
  });

  const totalContract = companiesData.reduce((acc, c) => acc + c.contractTotal, 0);
  const totalValidated = companiesData.reduce((acc, c) => acc + c.validatedAmount, 0);
  const totalProgress = totalContract > 0 ? (totalValidated / totalContract) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
              Marché Global (HT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContract.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dont {project.decisions.filter(d => d.type === 'financial' && d.hasFinancialImpact).length} avenants
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
              Facturé à date (HT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalValidated.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground mt-1">
              Soit {totalProgress.toFixed(1)}% d'avancement financier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
              Reste à payer (HT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(totalContract - totalValidated).toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead className="text-right">Marché (HT)</TableHead>
                <TableHead className="text-right">Réalisé (HT)</TableHead>
                <TableHead className="w-[100px] text-center">Avancement</TableHead>
                <TableHead className="text-right">Reste à faire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companiesData.map(({ company, contractTotal, validatedAmount, progress, balance }) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div>{company.name}</div>
                    <div className="text-xs text-muted-foreground">{company.trade}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {contractTotal.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">
                    {validatedAmount.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-2 w-[60px]" />
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {balance.toLocaleString('fr-FR')} €
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
