# Chantier Pro

Application web moderne pour la gestion et la traçabilité juridique des projets de construction, conçue spécifiquement pour les Maîtres d'Œuvre (MOE).

## 🎯 Vue d'ensemble

Chantier Pro permet aux Maîtres d'Œuvre de suivre la traçabilité juridique de leurs projets de construction, d'évaluer les risques et de générer les documents nécessaires pour protéger leur responsabilité professionnelle.

## 📁 Structure du projet

Ce projet est organisé en deux parties principales :

```
chantier-pro/
├── frontend/          # Application React/TypeScript
│   ├── src/          # Code source du frontend
│   ├── public/       # Fichiers statiques
│   ├── package.json  # Dépendances frontend
│   └── README.md     # Documentation frontend
│
├── server/           # API REST Node.js/Express
│   ├── src/         # Code source du backend
│   ├── package.json # Dépendances backend
│   └── README.md    # Documentation backend
│
├── ROADMAP.md        # Roadmap produit
├── SPECS_COLLABORATION.md  # Spécifications collaboration
├── IMPLEMENTATION.md # Détails d'implémentation
└── README.md         # Ce fichier
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Auth0 configuré (pour l'authentification)

### Installation

#### 1. Backend

```bash
cd server
npm install
```

Créer un fichier `server/.env` :
```env
PORT=3001
FRONTEND_URL=http://localhost:8080
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-audience
NODE_ENV=development
```

Démarrer le backend :
```bash
npm run dev
```

Le serveur démarre sur le port **3001**.

#### 2. Frontend

```bash
cd frontend
npm install
```

Créer un fichier `frontend/.env` :
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience
VITE_API_URL=http://localhost:3001/api
```

Démarrer le frontend :
```bash
npm run dev
```

L'application démarre sur le port **8080**.

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité

- **Authentification Auth0** : Connexion sécurisée via Auth0 avec support Google OAuth
- **Gestion des rôles** : Système de rôles et permissions (owner, moe, assistant, read_only)
- **Sessions persistantes** : Maintien de la session utilisateur

### 👥 Collaboration multi-utilisateurs

- **Organisations** : Création et gestion d'organisations (agences)
- **Membres** : Invitation et gestion des membres avec rôles
- **Partage de projets** : Projets partagés au sein d'une organisation
- **Tableau de bord agence** : Vue synthétique multi-projets avec KPIs

### 📊 Tableau de bord MOE

Vue d'ensemble globale avec indicateurs clés :

- **Sécurité Juridique** : Nombre de chantiers à risque et score moyen de l'agence
- **Délais & Planning** : Suivi des retards de livraison
- **Volume Géré** : Montant total des marchés HT et pourcentage de TMA
- **Conformité Administrative** : Vérification des documents manquants (assurances, contrats)

### 🏗️ Gestion de projets

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
- **Journal des décisions** : Timeline chronologique
- **Gestion des entreprises** : Liste des intervenants
- **Suivi financier** : Marchés, situations, certificats de paiement
- **Comptes-rendus de visite** : Rapports avec météo et observations
- **Gestion des réserves** : Suivi des OPR (Observations et Réserves)
- **Suivi du planning** : Dates clés et calcul des retards

### 📄 Export de données

- **Export CSV** : Liste des projets, entreprises, réserves
- **Génération PDF** : État de traçabilité, certificats de paiement, comptes-rendus

## 🛠️ Technologies utilisées

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (gestion d'état serveur)
- shadcn/ui + Tailwind CSS (UI)
- Auth0 (authentification)

### Backend
- Node.js + Express
- JWT (authentification)
- Stockage en mémoire (MVP - à migrer vers PostgreSQL)

## 📚 Documentation

- **[Frontend README](frontend/README.md)** - Documentation complète du frontend
- **[Backend README](server/README.md)** - Documentation complète du backend
- **[ROADMAP.md](ROADMAP.md)** - Roadmap produit et évolutions prévues
- **[SPECS_COLLABORATION.md](SPECS_COLLABORATION.md)** - Spécifications détaillées de la collaboration
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Détails de l'implémentation

## 🔧 Configuration

### Variables d'environnement

#### Backend (`server/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:8080
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-audience
NODE_ENV=development
```

#### Frontend (`frontend/.env`)
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Développement

### Scripts disponibles

#### Backend
```bash
cd server
npm run dev    # Mode développement
npm start      # Mode production
```

#### Frontend
```bash
cd frontend
npm run dev    # Mode développement
npm run build  # Build de production
npm run lint   # Linter le code
```

## 🚨 Notes importantes

### Base de données

⚠️ **Le backend utilise actuellement un stockage en mémoire (Map JavaScript).**

- ✅ Parfait pour le développement et les tests
- ❌ Les données sont **perdues au redémarrage du serveur**
- 🔄 Pour la production, migrer vers PostgreSQL ou MongoDB

### Authentification

L'authentification utilise Auth0. En développement, le backend accepte directement les tokens Google OAuth. En production, configurer Auth0 correctement.

## 🔄 Migration des données

Un script de migration est disponible pour migrer les projets depuis LocalStorage vers le backend :

```typescript
import { migrateProjectsToBackend } from '@/lib/migration';
await migrateProjectsToBackend(organizationId, userId);
```

## 📝 Contribution

Ce projet est conçu pour les Maîtres d'Œuvre et suit les pratiques de traçabilité juridique en vigueur en France.

## 📄 Licence

[À définir]

---

**Développé pour améliorer la traçabilité juridique des projets de construction**
