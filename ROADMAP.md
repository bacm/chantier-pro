## Roadmap produit – Chantier Pro (MOE)

Document de travail pour planifier les prochaines évolutions fonctionnelles et techniques de Chantier Pro, avec un focus sur les besoins spécifiques des Maîtres d’Œuvre (MOE) et des agences.

---

## 1. Vision produit & objectifs

- **Vision**  
  Faire de Chantier Pro l’outil de référence pour la **traçabilité juridique**, le **pilotage financier** et le **suivi opérationnel** des chantiers pour les MOE, de l’avant-projet à la fin de garantie décennale.

- **Objectifs métier principaux**
  - **Sécuriser juridiquement** le MOE par une traçabilité complète (décisions, preuves, documents, échanges).
  - **Maîtriser les risques** (planning, financier, contractuel, assurances, réserves).
  - **Industrialiser la production** (modèles, automatisation, exports, reporting).
  - **Améliorer la collaboration** au sein de l’agence et avec les entreprises / maîtres d’ouvrage.

- **Périmètre actuel (rappel synthétique)**
  - Authentification via Auth0 + Google OAuth.
  - Création de projets avec wizard et scoring initial.
  - Journal des décisions, score de traçabilité, niveaux de risque.
  - Gestion des entreprises (intervenants).
  - Suivi financier (marchés, situations, certificats de paiement, KPI globaux).
  - Comptes-rendus de visite et génération de PDF.
  - Gestion des réserves / OPR.
  - Suivi du planning (dates clés, retards, impact intempéries).

---

## 2. Axes stratégiques d’évolution

1. **Collaboration & multi-utilisateurs**  
   Passer d’un usage “solo” à un usage **agence** (plusieurs MOE, assistantes, direction).

2. **Gestion documentaire avancée**  
   Aller au-delà de simples URL : **uploads**, versionning, liens aux décisions, aux entreprises, aux réserves.

3. **Alertes, rappels & workflows**  
   Automatiser la détection et le suivi des risques et des échéances.

4. **Expérience terrain (mobile / offline)**  
   Permettre au MOE de tout saisir sur chantier (photos, réserves, visites) avec un UX optimisé.

5. **Intégrations externes & interopérabilité**  
   Connecter l’outil à l’écosystème existant (calendrier, email, GED, exports).

6. **Sécurité, conformité & pérennité des données**  
   Passer d’un stockage local à une architecture serveur robuste (hébergement, sauvegardes, RGPD, archivage décennal).

---

## 3. Découpage par phases

### 3.1 Phase 1 – MVP Agence (0 → 3 mois)

Objectif : permettre à une petite/moyenne agence de MOE d’utiliser Chantier Pro **à plusieurs** avec un minimum de frictions.

**3.1.1 Multi-utilisateurs & rôles agence**
- **Fonctionnel**
  - Création d’**organisations** (agences) :
    - Un utilisateur peut créer une agence et en devenir **Owner**.
    - Invitation d’autres utilisateurs (MOE, assistantes, direction).
  - **Rôles** proposés :
    - `owner` : toutes permissions sur l’agence.
    - `moe` : gestion opérationnelle des projets.
    - `assistant` : gestion documentaire et administratif.
    - `read_only` : consultation uniquement.
  - Association des projets à une agence + à un MOE référent.
  - Partage de projet entre plusieurs utilisateurs de la même agence.
- **Tech / Implémentation**
  - Introduire une **couche backend** minimale (si non existante) :
    - API REST simple (ex : Node/Express ou NestJS) ou BaaS (Supabase / Firebase) selon stratégie.
    - Modèles principaux :
      - `User`, `Organization`, `Membership`, `Project`, `ProjectAccess`.
  - Connexion Auth0 ↔ backend (utiliser le `sub` Auth0 comme clé utilisateur).
  - Migration progressive des données projet depuis LocalStorage vers la base serveur.

**3.1.2 Tableau de bord “Agence”**
- **Fonctionnel**
  - Vue synthétique **multi-projets** par agence :
    - Nombre total de projets.
    - Nombre de projets à risque / en vigilance / sécurisés.
    - Volume total marché HT + par année.
    - Nombre de projets en retard (planning).
    - Nombre d’entreprises avec documents manquants (assurance, contrats).
  - Filtres :
    - par MOE référent,
    - par statut de projet (en études / en travaux / livré / clos),
    - par année de démarrage.
- **Tech / Implémentation**
  - Endpoint d’agrégation (ou calcul côté front via TanStack Query selon volume) :
    - `GET /organizations/:id/dashboard`.
  - Cache et revalidation via TanStack Query.
  - Composants UI : cartes KPI + graphiques simples (ex : barres, donut).

**3.1.3 Export de données (CSV / Excel)**
- **Fonctionnel**
  - Export des **listes de projets** avec métriques principales.
  - Export par **entreprise** (marchés, situations, reste à faire).
  - Export des **réserves** par projet.
- **Tech / Implémentation**
  - Génération côté front (JS → CSV/XLSX) ou côté backend.
  - Téléchargement direct via navigateur.

---

### 3.2 Phase 2 – Gestion documentaire avancée (2 → 5 mois)

Objectif : centraliser réellement la documentation juridique et technique au sein de Chantier Pro.

**3.2.1 Upload & stockage de documents**
- **Fonctionnel**
  - Types de documents :
    - Contrats MOE, marchés entreprises, avenants.
    - Attestations d’assurance (RC Pro, décennale).
    - OS, plans, DOE, procès-verbaux, courriers importants.
  - Points d’attache :
    - Projet global.
    - Entreprise spécifique.
    - Décision spécifique.
    - Réserve / visite.
  - Métadonnées :
    - Type, date, auteur, version, tags libres.
- **Tech / Implémentation**
  - Stockage fichiers :
    - Option 1 : stockage objet (S3 / équivalent) + base de données pour les métadonnées.
    - Option 2 : BaaS (Supabase Storage, Firebase Storage).
  - API :
    - `POST /documents` (upload signé / presigned URL),
    - `GET /projects/:id/documents` (liste par contexte),
    - `DELETE /documents/:id`.
  - Gestion des droits :
    - Vérification des permissions par organisation et projet.

**3.2.2 Versionning de documents**
- **Fonctionnel**
  - Support des **versions** (ex : Plan V1, V2, V3).
  - Historique des remplacements (document obsolète / document courant).
  - Visualisation rapide de la dernière version + accès à l’historique.
- **Tech / Implémentation**
  - Modèle :
    - `Document` (concept) + `DocumentVersion` (instances).
  - Relation 1‑N entre `Document` et `DocumentVersion`.

**3.2.3 Liens documents ↔ décisions / réserves / visites**
- **Fonctionnel**
  - Sur une décision, possibilité d’**attacher** directement un ou plusieurs documents (OS signé, mail de validation, etc.).
  - Sur une réserve, ajout de photos / relevés.
  - Sur un compte-rendu de visite, joindre la feuille de présence signée.
- **Tech / Implémentation**
  - Tables de jonction (ex : `DecisionDocument`, `ReserveDocument`, `ReportDocument`).
  - UI : composants de sélection/attache de documents existants + upload direct.

---

### 3.3 Phase 3 – Alertes, rappels & workflows (4 → 7 mois)

Objectif : rendre l’outil proactif dans la gestion des risques et des échéances.

**3.3.1 Système d’alertes**
- **Fonctionnel**
  - Types d’alertes :
    - Assurances arrivant à échéance.
    - Retards planning dépassant un certain seuil.
    - Réserves non levées depuis X jours.
    - Situations validées mais non payées après X jours (optionnel).
  - Canaux :
    - Notifications in‑app.
    - Emails (optionnel au début, activable par agence).
  - Configuration :
    - Seuils paramétrables au niveau agence (ex : retard > 7 jours, réserves > 30 jours).
- **Tech / Implémentation**
  - Service périodique :
    - Cron côté backend (ou jobs planifiés) pour recalculer les alertes.
  - Stockage :
    - Table `Alert` (`type`, `status`, `target_type`, `target_id`, `created_at`, `resolved_at`).
  - UI :
    - Centre de notifications global + badges de notification par projet.

**3.3.2 Rappels & to‑do list**
- **Fonctionnel**
  - Création de **tâches** liées à un projet, une entreprise, une réserve, une décision.
  - Champs :
    - Titre, description, échéance, responsable (utilisateur), statut (à faire / en cours / fait).
  - Vue Kanban ou liste de tâches par projet.
- **Tech / Implémentation**
  - Modèle `Task` relié au projet + éventuellement à un objet cible (décision, réserve, etc.).
  - Endpoints CRUD + intégration dans le scoring (nombre de tâches en retard → impact risque).

**3.3.3 Workflows simples**
- **Fonctionnel**
  - Workflow pour les **décisions sensibles** :
    - Brouillon → À valider → Validé → Communiqué.
  - Workflow pour certaines **situations de travaux** :
    - Brouillon → Soumis → Validé → Payé.
  - Historique d’état avec horodatage et utilisateur.
- **Tech / Implémentation**
  - Ajout de champs `status`, `status_history` sur les entités concernées (ou table dédiée).
  - UI : timeline des changements d’état (similaire à la timeline des décisions).

---

### 3.4 Phase 4 – Expérience terrain (mobile / offline) (6 → 10 mois)

Objectif : permettre au MOE de travailler directement depuis le chantier, même avec une connectivité limitée.

**3.4.1 Optimisation mobile**
- **Fonctionnel**
  - Refonte/responsivisation des écrans clés :
    - Fiches projets (infos essentielles en premier).
    - Réserves / visites / prises de photos.
    - Saisie rapide de décisions/actions.
- **Tech / Implémentation**
  - Audit UX mobile.
  - Adaptation des composants `shadcn/ui` + Tailwind pour un usage tactile.
  - Tests de performance sur appareils mobiles.

**3.4.2 Mode offline (progressif)**
- **Fonctionnel**
  - Pouvoir :
    - Consulter la liste des projets déjà synchronisés.
    - Créer/modifier des réserves, visites, décisions en offline.
    - Ajouter des photos (stockage local temporaire).
  - Synchronisation automatique quand la connexion revient.
- **Tech / Implémentation**
  - PWA :
    - Service Worker, manifest, cache des assets.
  - Stockage offline :
    - IndexedDB / local storage structuré via une lib (ex : Dexie).
  - Mécanisme de **file d’actions** à synchroniser :
    - Queue locale d’actions (create/update) + résolution des conflits côté backend.

**3.4.3 Localisation des réserves sur plan (MVP)**
- **Fonctionnel**
  - Upload d’un plan (image ou PDF simplifié).
  - Positionnement d’un marqueur pour chaque réserve (X/Y en pourcentage).
  - Vue “plan” avec les réserves cliquables.
- **Tech / Implémentation**
  - Stockage des coordonnées dans le modèle des réserves.
  - UI : composant canvas / overlay sur image.

---

### 3.5 Phase 5 – Intégrations externes & écosystème (9 → 12 mois)

Objectif : connecter Chantier Pro aux outils existants des agences.

**3.5.1 Intégration Calendrier (Google / Outlook)**
- **Fonctionnel**
  - Synchronisation des **visites de chantier**, OPR, réceptions.
  - Option de rappel via l’agenda.
- **Tech / Implémentation**
  - OAuth + APIs Google Calendar / Microsoft Graph.
  - Modèle de liaison `CalendarIntegration` par utilisateur / organisation.

**3.5.2 Email & GED externe**
- **Fonctionnel**
  - Génération de **brouillons d’emails** : résumés de décisions, envoi de réserves à une entreprise, etc.
  - Lien vers les documents stockés sur :
    - Google Drive,
    - SharePoint / OneDrive,
    - autres GED (via URL).
- **Tech / Implémentation**
  - Démarrer avec de simples **liens générés** (mailto: + corps pré-rempli).
  - Éventuellement, intégration plus profonde (envoi direct via API).

**3.5.3 Export “dossier complet”**
- **Fonctionnel**
  - Export d’un **dossier de chantier complet** :
    - Décisions, rapports, réserves, certificats de paiement,
    - documents attachés,
    - logs principaux (qui a fait quoi, quand).
  - Format :
    - ZIP structuré par arborescence logique.
    - ou PDF maître avec annexes.
- **Tech / Implémentation**
  - Génération côté backend (+ éventuel worker pour les gros dossiers).
  - Stockage temporaire de l’archive téléchargeable.

---

## 4. Évolutions transverses (en continu)

### 4.1 Scoring & indicateurs

- Affiner les **algorithmes de scoring** :
  - Pondération par type de décision, type de projet, taille financière.
  - Intégration des alertes et tâches en retard dans le score global.
  - Paramétrage par agence (profile de risque).

### 4.2 Modèles de documents

- Modèles personnalisables pour :
  - Certificats de paiement.
  - Comptes-rendus de visite.
  - Listes de réserves / OPR.
  - États de traçabilité.
- Personnalisation :
  - Logo & coordonnées de l’agence.
  - Mentions légales & clauses types.

### 4.3 Performance & UX

- Optimisation des temps de chargement sur :
  - Liste des projets,
  - Timeline des décisions,
  - Historique des situations et réserves.
- Amélioration de la **gestion des états de chargement** (squelette / skeleton), des erreurs, du feedback utilisateur.

---

## 5. Architecture cible (high-level)

### 5.1 État actuel (simplifié)

- **Frontend** React + TypeScript (Vite, React Router, TanStack Query, shadcn/ui).
- **Données** majoritairement en **LocalStorage**.
- **Authentification** via Auth0 (Google OAuth).
- **PDF** générés côté client (print window).

### 5.2 État souhaité (12 mois)

- **Frontend** (inchangé sur le fond) :
  - PWA, gestion offline, architecture par fonctionnalités (feature‑based).
- **Backend** :
  - API REST ou GraphQL centralisant :
    - Utilisateurs, organisations, projets, entreprises, décisions, réserves, visites, situations, documents, tâches, alertes.
  - Job scheduler / workers pour :
    - Alertes périodiques, génération d’exports lourds.
- **Stockage** :
  - Base de données relationnelle (PostgreSQL par ex.).
  - Stockage fichiers (S3 ou équivalent / BaaS).
- **Sécurité / conformité** :
  - Authentification déléguée à Auth0.
  - Contrôle d’accès par organisation/projet.
  - Backups réguliers, rétention configurable, journalisation des accès.

---

## 6. Priorisation & jalons

### 6.1 Jalons proposés

1. **M1 – MVP Agence opérationnel** (3 mois)
   - Organisations, multi-utilisateurs, partage de projets.
   - Dashboard agence + premiers exports CSV.
   - Stockage projets sur backend (fin de la dépendance forte au LocalStorage).

2. **M2 – Document center MOE** (5 mois)
   - Upload de documents + attache aux projets / entreprises / décisions.
   - Premiers workflows documentaires simples (contrats, assurances).

3. **M3 – Outil proactif** (7 mois)
   - Système d’alertes + tâches.
   - Intégration des alertes dans le scoring de risque.

4. **M4 – Outil terrain** (10 mois)
   - UX mobile revue.
   - PWA + mode offline minimal (réserves / visites).

5. **M5 – Intégré à l’écosystème** (12 mois)
   - Intégration calendrier.
   - Exports “dossier complet”.

---

## 7. Risques & points de vigilance

- **Complexité technique du offline** :
  - Commencer par un **MVP offline** très ciblé (réserves + visites) avant d’étendre.
- **Stockage documentaire & coûts** :
  - Encadrer la taille et le type de fichiers.
  - Prévoir une stratégie de purge / archivage.
- **Adoption en agence** :
  - Prévoir un **onboarding simple** (import de projets, modèles par défaut).
  - Proposer des parcours guidés (tours, checklists).
- **Conformité juridique** :
  - Vérifier les besoins en termes d’archivage, probatoire, RGPD, notamment pour un usage en cas de litige.

---

## 8. Prochaines étapes concrètes

1. **Valider la roadmap** avec 2–3 MOE / agences pilotes (recueillir feedback & prioriser).
2. **Choisir l’architecture backend** (Node/Nest + Postgres vs BaaS) et mettre en place un premier socle.
3. **Implémenter la Phase 1 (MVP agence)** :
   - Modèles `Organization`, `User`, `Membership`, `Project`.
   - Migration des données projets vers le backend.
   - Dashboard agence + partages de projets.
4. **Itérer rapidement** avec un cycle build → démo → feedback toutes les 2–3 semaines.

