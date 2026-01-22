# Chantier Pro - Application de Traçabilité Juridique pour Maîtres d'Œuvre

Application web moderne pour la gestion et la traçabilité juridique des projets de construction, conçue spécifiquement pour les Maîtres d'Œuvre (MOE).

## 🎯 Vue d'ensemble

Chantier Pro permet aux Maîtres d'Œuvre de suivre la traçabilité juridique de leurs projets de construction, d'évaluer les risques et de générer les documents nécessaires pour protéger leur responsabilité professionnelle.

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité

- **Authentification Auth0** : Connexion sécurisée via Auth0 avec support Google OAuth
- **Gestion des rôles** : Système de rôles et permissions
- **Sessions persistantes** : Maintien de la session utilisateur

### 📊 Tableau de bord MOE

Vue d'ensemble globale avec indicateurs clés :

- **Sécurité Juridique** : Nombre de chantiers à risque et score moyen de l'agence
- **Délais & Planning** : Suivi des retards de livraison
- **Volume Géré** : Montant total des marchés HT et pourcentage de TMA (Travaux Modificatifs Additionnels)
- **Conformité Administrative** : Vérification des documents manquants (assurances, contrats)

### 🏗️ Gestion de projets

#### Création de projet (Wizard en 6 étapes)

1. **Type de projet** : Nouveau projet ou projet en cours
2. **Identification** : Nom, adresse, type d'opération (maison individuelle, rénovation, petit tertiaire), dates de démarrage et fin contractuelle
3. **Cadre contractuel** : 
   - Contrat MOE signé
   - Missions définies par écrit
   - Compte-rendu formalisé prévu
   - Validation écrite requise
4. **Situation actuelle** :
   - Pour nouveaux projets : Vérification assurances, DOC déposée, Permis de Construire affiché
   - Pour projets en cours : Décisions sans validation, travaux démarrés, avenants oraux
5. **Documentation** : Centralisation des preuves, traçabilité des décisions, documentation des impacts financiers
6. **Confirmation** : Affichage du score initial et du niveau de risque

#### Vue détaillée du projet

- **Score de traçabilité** : Score actuel avec évolution depuis l'initial
- **Niveau de risque** : Indicateur visuel (Sécurisé / Vigilance / À risque)
- **Informations projet** : Type, statut, nombre d'intervenants, nombre de rapports

### 📝 Journal des décisions

Suivi chronologique de toutes les décisions prises sur le projet :

- **Types de décisions** :
  - Modification (Client/TMA)
  - Visa technique / Validation
  - Devoir de conseil / Alerte
  - Impact financier / Avenant
  - Réception / Livraison

- **Informations par décision** :
  - Description détaillée
  - Entreprise concernée (optionnel)
  - Validation écrite (oui/non)
  - Impact financier et montant
  - Preuve attachée avec label et URL
  - Impact sur le score de traçabilité

- **Timeline visuelle** : Affichage chronologique avec indicateurs de risque

### 🏢 Gestion des intervenants

- **Liste des entreprises** : Toutes les entreprises intervenant sur le projet
- **Informations par entreprise** :
  - Nom et corps d'état (lot)
  - Contact (nom, email, téléphone)
  - Statut assurance (RC Pro + Décennale)
  - Statut contrat (marché signé)
  - Montant du marché HT
- **Ajout d'entreprises** : Formulaire complet pour ajouter de nouveaux intervenants

### 💰 Suivi financier

#### Vue d'ensemble financière

- **Marché Global HT** : Total des marchés incluant les avenants
- **Facturé à date** : Montant validé avec pourcentage d'avancement
- **Reste à payer** : Calcul automatique du solde

#### Détail par entreprise

- Tableau récapitulatif avec :
  - Marché initial + avenants
  - Montant réalisé validé
  - Pourcentage d'avancement avec barre de progression
  - Reste à faire

#### Situations de travaux

- **Saisie de situations** :
  - Numéro de situation
  - Date et période concernée
  - Montant demandé HT et pourcentage cumulé
  - Montant validé HT et pourcentage cumulé
  - Montant cumulé précédent
  - Statut (brouillon, soumis, validé, rejeté, payé)
  - Retenue de garantie (5% standard)
  - Commentaires

- **Historique des situations** : Liste complète avec statuts et dates
- **Génération de certificats de paiement** : Export PDF professionnel avec :
  - Détail du marché initial et avenants
  - Décompte de la situation
  - Calcul de la retenue de garantie
  - Net à payer HT
  - Espaces de signature MOE et MO

### 📋 Comptes-rendus de visite

- **Création de rapports** :
  - Date de visite
  - Conditions météorologiques (ensoleillé, nuageux, pluie, orage, neige)
  - Température
  - Validation jour d'intempérie (décalage automatique du planning)
  - Liste des entreprises présentes
  - Observations par lot
  - Remarques générales

- **Historique des visites** : Liste chronologique avec météo et présences
- **Export PDF** : Génération de comptes-rendus professionnels avec :
  - Situation des intervenants
  - Actes et décisions de la période
  - Observations détaillées par lot
  - Remarques générales

### 📌 Gestion des réserves (OPR)

- **Suivi des réserves** :
  - Description du défaut
  - Entreprise concernée
  - Localisation précise
  - Date de constat
  - Statut (en cours / levée)
  - Date de levée

- **Taux de levée** : Calcul automatique du pourcentage de réserves levées
- **Export PDF** : Liste des réserves avec séparation réserves en cours / levées

### 📅 Suivi du planning

- **Dates clés** :
  - Date de démarrage (OS)
  - Date de fin contractuelle
  - Date de fin estimée réelle

- **Calcul automatique des retards** :
  - Ajustement pour jours d'intempéries validés
  - Calcul du retard/avance en jours
  - Indicateurs visuels (rouge pour retard, vert pour à l'heure)

- **Modification du planning** : Mise à jour facile des dates

### 📄 Export PDF

Génération de documents professionnels :

1. **État de traçabilité** :
   - Score actuel et évolution
   - Niveau de risque
   - Décisions à risque et conformes
   - Calibration initiale
   - Informations projet complètes

2. **Certificat de paiement** :
   - Détail du marché et avenants
   - Décompte de la situation
   - Calcul de la retenue de garantie
   - Net à payer avec espaces de signature

3. **Liste des réserves (OPR)** :
   - Réserves en cours
   - Réserves levées
   - Taux de levée
   - Espaces de signature

4. **Compte-rendu de visite** :
   - Situation des intervenants
   - Décisions de la période
   - Observations par lot
   - Remarques générales

### 🎯 Système de scoring

- **Score initial** : Calculé lors de la création du projet basé sur :
  - Statut du projet (nouveau/en cours)
  - Type d'opération
  - Réponses à la calibration (cadre contractuel, démarrage, maturité documentaire)

- **Évolution du score** : Impact dynamique de chaque décision :
  - Points positifs pour décisions bien documentées
  - Points négatifs pour décisions à risque
  - Poids selon le type de décision
  - Multiplicateur pour impacts financiers

- **Niveaux de risque** :
  - **Sécurisé** (≥75) : Projet bien documenté, traçabilité suffisante
  - **Vigilance** (50-74) : Certaines décisions manquent de documentation
  - **À risque** (<50) : Plusieurs décisions à risque détectées

## 🛠️ Technologies utilisées

- **Frontend** :
  - React 18 avec TypeScript
  - Vite (build tool)
  - React Router (navigation)
  - TanStack Query (gestion d'état serveur)

- **UI/UX** :
  - shadcn/ui (composants UI)
  - Tailwind CSS (styling)
  - Radix UI (composants accessibles)
  - Lucide React (icônes)

- **Authentification** :
  - Auth0 React SDK
  - Google OAuth

- **Gestion de données** :
  - LocalStorage (persistance locale)
  - React Hooks (état local)

- **Génération PDF** :
  - HTML/CSS vers PDF (via print window)

- **Utilitaires** :
  - date-fns (manipulation de dates)
  - Zod (validation de schémas)
  - React Hook Form (formulaires)

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+ et npm
- Compte Auth0 configuré (pour l'authentification)

### Installation

```bash
# Cloner le repository
git clone <URL_DU_REPO>
cd chantier-pro

# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine :

```env
VITE_AUTH0_DOMAIN=votre-domaine.auth0.com
VITE_AUTH0_CLIENT_ID=votre-client-id
VITE_AUTH0_AUDIENCE=votre-audience
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

## 📁 Structure du projet

```
chantier-pro/
├── src/
│   ├── auth/              # Authentification (AuthProvider, AuthGuard)
│   ├── components/        # Composants React
│   │   ├── ui/           # Composants UI shadcn
│   │   ├── MoeCockpit.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectCreationWizard.tsx
│   │   └── ...
│   ├── contexts/          # Contextes React
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et logique métier
│   │   ├── projects.ts   # Gestion des projets
│   │   ├── scoring.ts    # Calcul des scores
│   │   ├── finance.ts    # Calculs financiers
│   │   └── pdf.ts        # Génération PDF
│   ├── pages/            # Pages de l'application
│   ├── types/            # Types TypeScript
│   └── main.tsx          # Point d'entrée
├── public/               # Fichiers statiques
└── package.json          # Dépendances et scripts
```

## 🎨 Fonctionnalités avancées

### Calcul automatique des retards

Le système ajuste automatiquement la date de fin contractuelle en fonction des jours d'intempéries validés dans les comptes-rendus de visite.

### Suivi des avenants

Les décisions de type "Impact financier" sont automatiquement intégrées dans le calcul du marché total de chaque entreprise.

### Détection des décisions problématiques

L'application identifie automatiquement les décisions qui font baisser le score et les met en évidence pour action corrective.

### Validation des situations

Système complet de workflow pour les situations de travaux : brouillon → soumis → validé → payé.

## 📊 Métriques et KPIs

Le tableau de bord MOE calcule automatiquement :

- Nombre de projets à risque
- Score moyen de l'agence
- Nombre de projets en retard
- Volume total géré (HT)
- Pourcentage moyen de TMA
- Nombre d'entreprises avec documents manquants

## 🔒 Sécurité et conformité

- Authentification sécurisée via Auth0
- Données stockées localement (LocalStorage)
- Validation des données avec Zod
- Gestion des erreurs et états de chargement

## 📝 Notes importantes

- Les données sont stockées localement dans le navigateur
- Les PDF sont générés côté client
- L'authentification nécessite une configuration Auth0
- Le scoring est basé sur les bonnes pratiques MOE françaises

## 🤝 Contribution

Ce projet est conçu pour les Maîtres d'Œuvre et suit les pratiques de traçabilité juridique en vigueur en France.

## 📄 Licence

[À définir]

---

**Développé pour améliorer la traçabilité juridique des projets de construction**
