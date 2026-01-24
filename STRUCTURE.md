# Structure du projet Chantier Pro

## 📁 Organisation des dossiers

```
chantier-pro/
│
├── frontend/                    # Application React/TypeScript
│   ├── src/                    # Code source
│   │   ├── auth/              # Authentification
│   │   ├── components/        # Composants React
│   │   │   ├── ui/           # Composants UI shadcn
│   │   │   └── ...            # Composants métier
│   │   ├── contexts/          # Contextes React
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── lib/               # Utilitaires et logique métier
│   │   ├── pages/             # Pages de l'application
│   │   └── types/             # Types TypeScript
│   ├── public/                # Fichiers statiques
│   ├── index.html             # Point d'entrée HTML
│   ├── package.json           # Dépendances frontend
│   ├── vite.config.ts         # Configuration Vite
│   ├── tsconfig.json          # Configuration TypeScript
│   ├── tailwind.config.ts     # Configuration Tailwind
│   └── README.md              # Documentation frontend
│
├── server/                     # API REST Node.js/Express
│   ├── src/                   # Code source
│   │   ├── index.js           # Point d'entrée
│   │   ├── middleware/        # Middlewares
│   │   │   └── auth.js       # Authentification JWT
│   │   ├── db/                # Base de données
│   │   │   └── memory.js     # Stockage en mémoire (MVP)
│   │   └── routes/            # Routes API
│   │       ├── auth.js        # Routes authentification
│   │       ├── organizations.js # Routes organisations
│   │       ├── projects.js    # Routes projets
│   │       ├── dashboard.js   # Routes tableau de bord
│   │       └── exports.js    # Routes exports
│   ├── package.json           # Dépendances backend
│   ├── .env                    # Variables d'environnement (non versionné)
│   └── README.md              # Documentation backend
│
├── .gitignore                  # Fichiers ignorés par Git
├── README.md                   # Documentation principale
├── ROADMAP.md                  # Roadmap produit
├── SPECS_COLLABORATION.md      # Spécifications collaboration
├── IMPLEMENTATION.md           # Détails d'implémentation
└── STRUCTURE.md               # Ce fichier
```

## 🔍 Détails par dossier

### Frontend (`frontend/`)

**Technologies :**
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (gestion d'état serveur)
- shadcn/ui + Tailwind CSS
- Auth0 (authentification)

**Structure :**
- `src/auth/` : Composants d'authentification (AuthProvider, AuthGuard)
- `src/components/` : Tous les composants React
  - `ui/` : Composants UI réutilisables (shadcn)
  - Autres : Composants métier (ProjectCard, OrganizationSelector, etc.)
- `src/contexts/` : Contextes React (AuthContext, OrganizationContext)
- `src/hooks/` : Hooks personnalisés (useOrganizations, useProjects, etc.)
- `src/lib/` : Utilitaires et logique métier
  - `api.ts` : Client API pour communiquer avec le backend
  - `projects.ts` : Logique métier des projets
  - `scoring.ts` : Calcul des scores de traçabilité
  - `finance.ts` : Calculs financiers
  - `pdf.ts` : Génération de PDF
  - `migration.ts` : Script de migration LocalStorage → Backend
- `src/pages/` : Pages de l'application (Index, NotFound)
- `src/types/` : Types TypeScript partagés

### Backend (`server/`)

**Technologies :**
- Node.js + Express
- JWT (authentification)
- Stockage en mémoire (MVP)

**Structure :**
- `src/index.js` : Point d'entrée du serveur, configuration Express
- `src/middleware/auth.js` : Middleware de validation JWT
- `src/db/memory.js` : Base de données en mémoire (à remplacer par PostgreSQL)
- `src/routes/` : Routes API organisées par domaine
  - `auth.js` : Authentification
  - `organizations.js` : Gestion des organisations
  - `projects.js` : Gestion des projets
  - `dashboard.js` : Tableau de bord agence
  - `exports.js` : Exports CSV

## 🔄 Flux de données

```
Frontend (React)
    ↓ (HTTP + JWT)
API Backend (Express)
    ↓
Base de données (Memory/PostgreSQL)
```

## 📦 Dépendances

### Frontend
- Géré par `frontend/package.json`
- Installation : `cd frontend && npm install`

### Backend
- Géré par `server/package.json`
- Installation : `cd server && npm install`

## 🚀 Démarrage

### Développement

1. **Backend** (terminal 1) :
```bash
cd server
npm install
npm run dev
```

2. **Frontend** (terminal 2) :
```bash
cd frontend
npm install
npm run dev
```

### Production

1. **Backend** :
```bash
cd server
npm install
npm start
```

2. **Frontend** :
```bash
cd frontend
npm install
npm run build
# Servir le dossier dist/ avec un serveur web (nginx, etc.)
```

## 📝 Fichiers de configuration

### Frontend
- `vite.config.ts` : Configuration Vite (port, alias, plugins)
- `tsconfig.json` : Configuration TypeScript
- `tailwind.config.ts` : Configuration Tailwind CSS
- `postcss.config.js` : Configuration PostCSS
- `eslint.config.js` : Configuration ESLint
- `components.json` : Configuration shadcn/ui

### Backend
- `.env` : Variables d'environnement (non versionné)
- `package.json` : Scripts et dépendances

## 🔐 Sécurité

- Les tokens JWT sont stockés dans des cookies sécurisés côté frontend
- Le backend valide chaque requête avec le middleware d'authentification
- Les variables d'environnement sensibles ne sont pas versionnées

## 📚 Documentation

- **README.md** (racine) : Vue d'ensemble du projet
- **frontend/README.md** : Documentation complète du frontend
- **server/README.md** : Documentation complète du backend
- **ROADMAP.md** : Roadmap produit et évolutions
- **SPECS_COLLABORATION.md** : Spécifications détaillées
- **IMPLEMENTATION.md** : Détails d'implémentation

---

**Structure mise à jour le : 2024**
