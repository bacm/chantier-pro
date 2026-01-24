# Chantier Pro - Frontend

Application React/TypeScript pour la gestion et la traçabilité juridique des projets de construction pour les Maîtres d'Œuvre (MOE).

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Auth0 configuré (pour l'authentification)
- Backend API en cours d'exécution (voir `../server/README.md`)

### Installation

```bash
# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine du dossier `frontend/` :

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience
VITE_API_URL=http://localhost:3001/api
```

### Démarrage

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

L'application démarre sur le port **8080** par défaut.

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── auth/              # Authentification (AuthProvider, AuthGuard)
│   ├── components/         # Composants React
│   │   ├── ui/           # Composants UI shadcn
│   │   ├── AppLayout.tsx
│   │   ├── OrganizationSelector.tsx
│   │   ├── OrganizationDashboard.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectCreationWizard.tsx
│   │   └── ...
│   ├── contexts/          # Contextes React
│   │   ├── AuthContext.tsx
│   │   └── OrganizationContext.tsx
│   ├── hooks/             # Hooks personnalisés
│   │   ├── useOrganizations.ts
│   │   ├── useProjects.ts
│   │   ├── useDashboard.ts
│   │   └── ...
│   ├── lib/               # Utilitaires et logique métier
│   │   ├── api.ts         # Client API
│   │   ├── projects.ts    # Gestion des projets
│   │   ├── scoring.ts     # Calcul des scores
│   │   ├── finance.ts     # Calculs financiers
│   │   ├── pdf.ts         # Génération PDF
│   │   └── migration.ts   # Migration LocalStorage → Backend
│   ├── pages/             # Pages de l'application
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── types/             # Types TypeScript
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── App.tsx            # Composant racine
│   └── main.tsx           # Point d'entrée
├── public/                # Fichiers statiques
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## 🛠️ Technologies utilisées

### Core
- **React 18** avec TypeScript
- **Vite** (build tool)
- **React Router** (navigation)
- **TanStack Query** (gestion d'état serveur)

### UI/UX
- **shadcn/ui** (composants UI)
- **Tailwind CSS** (styling)
- **Radix UI** (composants accessibles)
- **Lucide React** (icônes)

### Authentification
- **Auth0 React SDK**
- **Google OAuth**

### Utilitaires
- **date-fns** (manipulation de dates)
- **Zod** (validation de schémas)
- **React Hook Form** (formulaires)
- **js-cookie** (gestion des cookies)

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_AUTH0_DOMAIN` | Domaine Auth0 | ✅ |
| `VITE_AUTH0_CLIENT_ID` | Client ID Auth0 | ✅ |
| `VITE_AUTH0_AUDIENCE` | Audience Auth0 | ✅ |
| `VITE_API_URL` | URL de l'API backend | ✅ |

### Alias TypeScript

Le projet utilise l'alias `@/` pour les imports depuis `src/` :

```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';
```

## 📦 Scripts disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement

# Build
npm run build        # Build de production
npm run build:dev    # Build en mode développement

# Qualité
npm run lint         # Linter le code

# Prévisualisation
npm run preview      # Prévisualise le build de production
```

## 🏗️ Architecture

### Gestion d'état

- **TanStack Query** : Gestion des données serveur (cache, mutations, synchronisation)
- **React Context** : État global (authentification, organisation courante)
- **Local State** : État local des composants (React hooks)

### Communication avec le backend

Le client API (`src/lib/api.ts`) centralise toutes les requêtes HTTP vers le backend :

```typescript
import { projectsApi } from '@/lib/api';

// Utilisation dans un composant
const { data } = useProjects(organizationId);
```

### Hooks personnalisés

- `useOrganizations()` - Gestion des organisations
- `useProjects(orgId)` - Liste des projets
- `useProject(id)` - Détails d'un projet
- `useDashboard(orgId)` - Tableau de bord agence
- `useCreateProject()` - Création de projet
- `useUpdateProject()` - Mise à jour de projet

## 🎨 Composants principaux

### Layout
- `AppLayout` - Layout principal avec header et navigation

### Organisations
- `OrganizationSelector` - Sélecteur d'organisation
- `OrganizationDashboard` - Tableau de bord agence

### Projets
- `ProjectCard` - Carte de projet
- `ProjectDetail` - Détails d'un projet
- `ProjectCreationWizard` - Assistant de création de projet

### Autres
- `MoeCockpit` - Tableau de bord global
- `DecisionTimeline` - Timeline des décisions
- `FinancialOverview` - Vue financière
- `CompanyList` - Liste des entreprises
- `ReportList` - Liste des comptes-rendus
- `SnagList` - Liste des réserves

## 🔐 Authentification

L'application utilise Auth0 pour l'authentification. Le token JWT est stocké dans un cookie sécurisé et envoyé automatiquement avec chaque requête API.

### Flux d'authentification

1. L'utilisateur se connecte via Auth0
2. Le token est stocké dans un cookie
3. Le token est envoyé dans le header `Authorization` de chaque requête API
4. Le backend valide le token et autorise/refuse l'accès

## 📱 Responsive Design

L'application est responsive et s'adapte aux différentes tailles d'écran :
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🧪 Tests

```bash
# À venir : tests unitaires et d'intégration
npm test
```

## 🐛 Débogage

### Outils de développement

- **React DevTools** : Inspection des composants React
- **TanStack Query DevTools** : Inspection du cache et des requêtes
- **Console du navigateur** : Logs et erreurs

### Problèmes courants

**Erreur CORS** : Vérifier que `VITE_API_URL` pointe vers le bon backend et que CORS est configuré côté serveur.

**Token expiré** : Se déconnecter et se reconnecter pour obtenir un nouveau token.

**Données non mises à jour** : Vérifier que TanStack Query invalide bien le cache après les mutations.

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation TanStack Query](https://tanstack.com/query)
- [Documentation shadcn/ui](https://ui.shadcn.com/)
- [Documentation Auth0](https://auth0.com/docs)

## 🔄 Migration depuis LocalStorage

Un script de migration est disponible pour migrer les projets depuis LocalStorage vers le backend :

```typescript
import { migrateProjectsToBackend } from '@/lib/migration';

await migrateProjectsToBackend(organizationId, userId);
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `dist/`.

### Variables d'environnement en production

Assurez-vous de configurer toutes les variables d'environnement nécessaires dans votre plateforme de déploiement.

---

**Développé pour Chantier Pro - Application de traçabilité juridique pour Maîtres d'Œuvre**
