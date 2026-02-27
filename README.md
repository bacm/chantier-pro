# Chantier Pro

**Chantier Pro** est une application web métier conçue pour les **Maîtres d'Œuvre (MOE)** et architectes. Sa mission est de sécuriser juridiquement le suivi de chantier grâce à un journal de décisions horodaté, une évaluation continue du risque et une gestion rigoureuse de la traçabilité.

## 🎯 Valeur Ajoutée : La Sécurité Juridique

En cas de litige (sinistre, retard, malfaçon), la responsabilité du MOE est souvent engagée. **Chantier Pro** protège le professionnel en garantissant :
- **La preuve par l'écrit** : Chaque décision orale est tracée et associée à une preuve.
- **L'alerte en temps réel** : Un algorithme calcule un score de traçabilité qui alerte dès que le projet devient juridiquement "à risque".
- **La centralisation** : Toutes les pièces critiques (assurances, validations, avenants) sont regroupées par projet.

---

## 🚀 Fonctionnalités Détaillées

### 1. Algorithme de Scoring et Traçabilité
Le cœur de l'application est son système de **Score de Traçabilité (0-100)**.
- **Score Initial** : Calculé lors de la création du projet basé sur le cadre contractuel et administratif (ex: PC affiché, assurances vérifiées).
- **Impact des Décisions** : Chaque nouvelle décision impacte le score :
    - **Positif** : Validation écrite présente + Preuve jointe.
    - **Négatif** : Décision sans validation écrite ou sans preuve matérielle.
- **Niveaux de Risque** :
    - 🟢 **Sécurisé** (≥ 75) : Documentation solide.
    - 🟡 **Vigilance** (50-74) : Manques documentaires détectés.
    - 🔴 **À risque** (< 50) : Danger juridique immédiat, action corrective requise.

### 2. Assistant de Création de Projet (Wizard)
Un processus en 6 étapes pour cadrer juridiquement le chantier dès le départ :
1.  **Phase** : Projet neuf ou reprise d'un projet en cours.
2.  **Identification** : Nom, adresse, type (Individuel, Tertiaire, Rénovation) et dates clés.
3.  **Cadre Contractuel** : Signature du contrat, définition des missions, exigence de validation écrite.
4.  **Démarrage & Administratif** : Vérification des assurances (RC Pro, Décennale), DOC (Déclaration d'Ouverture de Chantier), affichage du Permis de Construire.
5.  **Maturité Documentaire** : Évaluation de la capacité à tracer les preuves.
6.  **Calcul du Score Initial** : Génération immédiate du niveau de risque de départ.

### 3. Journal des Décisions (Timeline)
Traçabilité exhaustive classée par types :
- **TMA / Modifications** : Changements demandés par le client ou acquéreur.
- **Visa / Validation Technique** : Avis du MOE sur les documents d'exécution.
- **Devoir de Conseil / Alerte** : Tracé crucial où le MOE alerte son client d'un risque ou d'une non-conformité.
- **Impact Financier** : Tout ce qui génère un avenant ou un surcoût.
- **Réception / Livraison** : Étapes de fin de chantier.

### 4. Gestion Financière et Situations (Finance)
- **Situations de Travaux** : Suivi des demandes de paiement des entreprises.
- **Retenue de Garantie (5%)** : Calcul automatique et suivi de la retenue légale en France.
- **Certificats de Paiement** : Génération des montants validés HT/TTC.
- **Avancement** : Suivi du pourcentage d'avancement par lot (corps d'état).

### 5. Suivi de Chantier et Rapports
- **Comptes-Rendus (CR)** : Création de rapports de visite incluant la météo (crucial pour justifier les intempéries et les décalages de planning).
- **Observations par Lot** : Liste des points à traiter par entreprise.
- **Gestion des Réserves (OPR)** : Suivi des non-conformités lors de la réception jusqu'à leur levée totale.

### 6. Collaboration Multi-Utilisateurs
- **Gestion par Organisations** : Pour les cabinets d'architectes ou agences de maîtrise d'œuvre.
- **Rôles Granulaires** :
    - `Owner` : Gestion de l'agence et des abonnements.
    - `MOE` : Gestion complète des projets et décisions.
    - `Assistant` : Saisie des données, rapports et suivi administratif.
    - `Read Only` : Consultation (pour les clients ou partenaires).

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 18 avec TypeScript.
- **Build Tool** : Vite.
- **UI** : **shadcn/ui** + **Tailwind CSS** (basé sur Radix UI).
- **State Management** : **TanStack Query** (Server state) + React Context (Global state).
- **Formulaires** : React Hook Form + Zod.
- **Graphiques** : Recharts.
- **Icônes** : Lucide React.

### Backend
- **Serveur** : Node.js avec Express.
- **Authentification** : JWT (JSON Web Tokens) avec stockage sécurisé des mots de passe (bcrypt).
- **Base de données** : Stockage en mémoire (Map) pour le MVP, prêt pour migration PostgreSQL.
- **Génération Documentaire** : Export CSV et génération de PDF (logique métier intégrée).

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- npm ou bun

### Installation rapide
```bash
# 1. Cloner le projet
git clone [url-du-repo]

# 2. Lancer le backend
cd server
npm install
npm run dev

# 3. Lancer le frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

---

## 📝 Licence
Propriété de Chantier Pro. Tous droits réservés.
