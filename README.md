# Chantier Pro

Application web moderne pour la gestion et la traçabilité juridique des projets de construction, conçue spécifiquement pour les Maîtres d'Œuvre (MOE).

## Vue d'ensemble

Chantier Pro permet aux Maîtres d'Œuvre de suivre la traçabilité juridique de leurs projets de construction, d'évaluer les risques et de générer les documents nécessaires pour protéger leur responsabilité professionnelle.

## Structure du projet

```
chantier-pro/
├── frontend/          # Application React/TypeScript
│   ├── src/
│   │   ├── auth/          # Contexte d'authentification
│   │   ├── components/    # Composants React
│   │   ├── contexts/      # Contextes (Organisation)
│   │   ├── hooks/         # Hooks React personnalisés
│   │   ├── lib/           # Client API, logique métier, PDF
│   │   ├── pages/         # Pages
│   │   └── types/         # Interfaces TypeScript
│   └── package.json
│
├── server/            # API REST Node.js/Express
│   ├── src/
│   │   ├── db/            # Base de données en mémoire
│   │   ├── middleware/    # Middleware d'authentification
│   │   └── routes/        # Endpoints API
│   └── package.json
│
└── docs/              # Documentation
```

## Démarrage rapide

### Prérequis

- Node.js 18+ et npm

### Installation

#### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Le serveur démarre sur le port **3001**.

#### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application démarre sur le port **8080**.

## Fonctionnalités principales

### Collaboration multi-utilisateurs

- **Organisations** : Création et gestion d'organisations (agences)
- **Membres** : Invitation et gestion des membres avec rôles (owner, moe, assistant, read_only)
- **Partage de projets** : Projets partagés au sein d'une organisation
- **Tableau de bord agence** : Vue synthétique multi-projets avec KPIs

### Tableau de bord MOE

Vue d'ensemble globale avec indicateurs clés :

- **Sécurité Juridique** : Nombre de chantiers à risque et score moyen de l'agence
- **Délais & Planning** : Suivi des retards de livraison
- **Volume Géré** : Montant total des marchés HT et pourcentage de TMA
- **Conformité Administrative** : Vérification des documents manquants (assurances, contrats)

### Gestion de projets

#### Création de projet (Wizard en 6 étapes)

1. **Type de projet** : Nouveau projet ou projet en cours
2. **Identification** : Nom, adresse, type d'opération, dates
3. **Cadre contractuel** : Contrat, missions, validation écrite
4. **Situation actuelle** : Assurances, DOC, permis ou décisions existantes
5. **Documentation** : Centralisation des preuves et traçabilité
6. **Confirmation** : Score initial et niveau de risque

#### Vue détaillée du projet

- **Score de traçabilité** : Score actuel avec évolution
- **Niveau de risque** : Indicateur visuel (Sécurisé / Vigilance / À risque)
- **Journal des décisions** : Timeline chronologique (6 types : modifications, validations, conseils, impacts financiers, réceptions)
- **Gestion des entreprises** : Liste des intervenants
- **Suivi financier** : Marchés, situations, certificats de paiement, retenue de garantie
- **Comptes-rendus de visite** : Rapports avec météo et observations
- **Gestion des réserves** : Suivi des OPR
- **Suivi du planning** : Dates clés et calcul des retards

### Export de données

- **Export CSV** : Liste des projets, entreprises, réserves
- **Génération PDF** : État de traçabilité, certificats de paiement, comptes-rendus

## Technologies

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (gestion d'état serveur)
- shadcn/ui + Tailwind CSS (UI)
- React Hook Form + Zod (formulaires et validation)
- Recharts (graphiques)

### Backend
- Node.js + Express
- Stockage en mémoire (MVP)

## Variables d'environnement

#### Backend (`server/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

## Scripts disponibles

#### Backend
```bash
cd server
npm run dev    # Mode développement (avec hot reload)
npm start      # Mode production
```

#### Frontend
```bash
cd frontend
npm run dev          # Mode développement
npm run build        # Build de production
npm run lint         # Linter le code
npm test             # Lancer les tests (run unique)
npm run test:watch   # Lancer les tests en mode watch
```

## Notes importantes

### Base de données

Le backend utilise actuellement un stockage en mémoire (Map JavaScript).

- Parfait pour le développement et les tests
- Les données sont **perdues au redémarrage du serveur**
- Pour la production, migrer vers PostgreSQL

## Licence

[A définir]
