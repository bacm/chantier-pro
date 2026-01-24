# Spécifications - Collaboration & Multi-utilisateurs

**Version:** 1.0  
**Date:** 2024  
**Statut:** En rédaction

---

## 1. Vue d'ensemble

### 1.1 Objectif

Permettre à une agence de Maîtres d'Œuvre (MOE) d'utiliser Chantier Pro **à plusieurs** avec un système de partage de projets, de gestion des rôles et de collaboration au sein d'une organisation.

### 1.2 Périmètre

Cette spécification couvre :
- La création et la gestion d'organisations (agences)
- Le système de rôles et permissions
- Le partage de projets entre membres d'une organisation
- Le tableau de bord agence multi-projets
- L'export de données agrégées
- La migration des données existantes depuis LocalStorage

### 1.3 Contraintes

- Compatibilité avec l'authentification Auth0 existante
- Migration progressive des données (pas de perte)
- Performance maintenue malgré le passage au backend
- Sécurité renforcée (contrôle d'accès par organisation/projet)

---

## 2. Modèles de données

### 2.1 Schéma conceptuel

```
User (Auth0)
  └── Membership (n:n avec Organization)
        └── Organization (Agence)
              └── ProjectAccess (n:n avec Project)
                    └── Project
```

### 2.2 Modèles détaillés

#### 2.2.1 User (Utilisateur)

**Source:** Auth0 (utilise le `sub` comme identifiant unique)

```typescript
interface User {
  id: string;              // Auth0 sub (ex: "google-oauth2|123456789")
  email: string;           // Email de l'utilisateur
  name: string;            // Nom complet
  avatar?: string;         // URL de l'avatar
  createdAt: Date;         // Date de première connexion à Chantier Pro
  lastLoginAt?: Date;       // Dernière connexion
}
```

**Stockage:** Table `users` dans la base de données (synchronisé avec Auth0)

#### 2.2.2 Organization (Organisation / Agence)

```typescript
interface Organization {
  id: string;              // UUID
  name: string;            // Nom de l'agence
  slug: string;            // Identifiant URL-friendly (unique)
  description?: string;     // Description optionnelle
  logoUrl?: string;        // Logo de l'agence
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;       // User ID du créateur (devient Owner)
  settings: {
    allowPublicInvites: boolean;  // Permet aux membres d'inviter
    defaultRole: OrganizationRole; // Rôle par défaut pour nouveaux membres
  };
}
```

**Règles métier:**
- Un utilisateur peut créer plusieurs organisations
- Un utilisateur peut être membre de plusieurs organisations
- Le créateur devient automatiquement `owner`
- Le `slug` doit être unique au niveau global

#### 2.2.3 Membership (Adhésion à une organisation)

```typescript
interface Membership {
  id: string;              // UUID
  organizationId: string;
  userId: string;
  role: OrganizationRole;  // owner | moe | assistant | read_only
  invitedBy?: string;      // User ID de l'inviteur
  invitedAt?: Date;        // Date d'invitation
  joinedAt: Date;          // Date d'acceptation
  status: 'pending' | 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}
```

**Règles métier:**
- Un utilisateur ne peut avoir qu'un seul `Membership` actif par organisation
- Le statut `pending` permet de gérer les invitations non acceptées
- Un `owner` ne peut pas être supprimé tant qu'il est le seul owner

#### 2.2.4 Project (Projet) - Modifié

```typescript
interface Project {
  id: string;              // UUID
  organizationId: string;  // NOUVEAU: Organisation propriétaire
  createdBy: string;       // NOUVEAU: User ID du créateur
  referentMoeId?: string;  // NOUVEAU: User ID du MOE référent (optionnel)
  
  // Champs existants (inchangés)
  name: string;
  address: string;
  projectType: 'individual' | 'tertiary' | 'renovation';
  status: ProjectStatus;
  calibration: ProjectCalibration;
  createdAt: Date;
  updatedAt: Date;         // NOUVEAU: Date de dernière modification
  startDate?: Date;
  contractualEndDate?: Date;
  estimatedEndDate?: Date;
  companies: Company[];
  decisions: Decision[];
  reports: SiteReport[];
  snags: Snag[];
  payments: PaymentApplication[];
  initialScore: number;
  currentScore: number;
  currentRiskLevel: RiskLevel;
}
```

**Règles métier:**
- Un projet appartient à une seule organisation
- Un projet peut avoir un MOE référent (optionnel)
- Tous les membres de l'organisation ont accès au projet par défaut (via `ProjectAccess`)

#### 2.2.5 ProjectAccess (Accès au projet)

```typescript
interface ProjectAccess {
  id: string;              // UUID
  projectId: string;
  userId: string;
  role: ProjectRole;        // 'owner' | 'editor' | 'viewer'
  grantedBy: string;       // User ID qui a accordé l'accès
  grantedAt: Date;
  createdAt: Date;
}
```

**Règles métier:**
- Permet de surcharger les permissions au niveau projet
- Par défaut, tous les membres de l'organisation ont accès (pas besoin d'entrée explicite)
- Permet d'accorder des accès spécifiques à des utilisateurs externes (futur)

#### 2.2.6 ProjectActivity (Activité sur le projet)

```typescript
interface ProjectActivity {
  id: string;              // UUID
  projectId: string;
  userId: string;          // Auteur de l'action
  action: ActivityAction;  // 'created' | 'updated' | 'deleted' | 'decision_added' | etc.
  entityType: string;      // 'project' | 'decision' | 'company' | 'report' | 'snag' | 'payment'
  entityId?: string;       // ID de l'entité concernée
  description: string;     // Description lisible de l'action
  metadata?: Record<string, any>; // Données additionnelles
  createdAt: Date;
}
```

**Usage:** Historique d'audit, timeline d'activité, notifications

---

## 3. Rôles et permissions

### 3.1 Rôles au niveau Organisation

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **owner** | Propriétaire de l'organisation | Toutes les permissions + gestion de l'organisation, suppression, gestion des membres |
| **moe** | Maître d'Œuvre | Création/édition de projets, gestion opérationnelle complète |
| **assistant** | Assistant(e) administratif(ve) | Gestion documentaire, saisie de données, pas de suppression de projets |
| **read_only** | Consultation uniquement | Lecture seule sur tous les projets de l'organisation |

### 3.2 Rôles au niveau Projet (surcharge)

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **owner** | Propriétaire du projet | Toutes les permissions + suppression du projet |
| **editor** | Éditeur | Création, modification, pas de suppression |
| **viewer** | Lecteur | Consultation uniquement |

### 3.3 Matrice de permissions détaillée

#### 3.3.1 Gestion de l'organisation

| Action | owner | moe | assistant | read_only |
|--------|-------|-----|-----------|-----------|
| Voir les paramètres | ✅ | ❌ | ❌ | ❌ |
| Modifier les paramètres | ✅ | ❌ | ❌ | ❌ |
| Supprimer l'organisation | ✅ | ❌ | ❌ | ❌ |
| Inviter des membres | ✅ | ✅* | ❌ | ❌ |
| Gérer les membres (rôles) | ✅ | ❌ | ❌ | ❌ |
| Retirer des membres | ✅ | ❌ | ❌ | ❌ |

*Si `allowPublicInvites` est activé dans les paramètres

#### 3.3.2 Gestion des projets

| Action | owner | moe | assistant | read_only |
|--------|-------|-----|-----------|-----------|
| Créer un projet | ✅ | ✅ | ✅ | ❌ |
| Voir tous les projets | ✅ | ✅ | ✅ | ✅ |
| Modifier un projet | ✅ | ✅ | ✅ | ❌ |
| Supprimer un projet | ✅ | ❌ | ❌ | ❌ |
| Exporter les données | ✅ | ✅ | ✅ | ✅ |
| Voir le dashboard agence | ✅ | ✅ | ✅ | ✅ |

#### 3.3.3 Actions sur un projet spécifique

| Action | owner | moe | assistant | read_only |
|--------|-------|-----|-----------|-----------|
| Modifier les infos projet | ✅ | ✅ | ✅ | ❌ |
| Ajouter/modifier décisions | ✅ | ✅ | ✅ | ❌ |
| Ajouter/modifier entreprises | ✅ | ✅ | ✅ | ❌ |
| Créer comptes-rendus | ✅ | ✅ | ✅ | ❌ |
| Gérer réserves | ✅ | ✅ | ✅ | ❌ |
| Gérer situations de paiement | ✅ | ✅ | ✅ | ❌ |
| Générer PDFs | ✅ | ✅ | ✅ | ✅ |
| Voir l'historique | ✅ | ✅ | ✅ | ✅ |

### 3.4 Calcul des permissions effectives

1. **Vérifier le rôle au niveau organisation** (`Membership.role`)
2. **Vérifier s'il existe une surcharge au niveau projet** (`ProjectAccess`)
3. **Appliquer la permission la plus restrictive** si conflit

**Exemple:**
- User A est `moe` dans l'organisation
- User A a `viewer` sur le projet X
- → User A ne peut que consulter le projet X (même s'il est `moe` globalement)

---

## 4. Cas d'usage fonctionnels

### 4.1 Création d'une organisation

**Acteur:** Utilisateur authentifié

**Scénario principal:**
1. L'utilisateur clique sur "Créer une organisation" ou "Créer une agence"
2. Formulaire de création :
   - Nom de l'agence (obligatoire)
   - Description (optionnel)
   - Upload de logo (optionnel)
3. Validation → Création de l'organisation
4. L'utilisateur devient automatiquement `owner`
5. Redirection vers le tableau de bord de l'organisation

**Règles métier:**
- Un utilisateur peut créer plusieurs organisations
- Le `slug` est généré automatiquement à partir du nom (normalisé, unique)
- Si le slug existe déjà, ajouter un suffixe numérique

### 4.2 Invitation d'un membre

**Acteur:** Owner ou MOE (si `allowPublicInvites` activé)

**Scénario principal:**
1. L'utilisateur accède à "Gestion des membres"
2. Clique sur "Inviter un membre"
3. Formulaire :
   - Email de l'invité (obligatoire)
   - Rôle à attribuer (obligatoire)
   - Message personnalisé (optionnel)
4. Envoi d'un email d'invitation avec lien unique
5. L'invité clique sur le lien → Création de compte si nécessaire → Acceptation
6. Le statut du `Membership` passe de `pending` à `active`

**Règles métier:**
- L'email doit être unique dans l'organisation
- Le lien d'invitation expire après 7 jours
- Si l'utilisateur existe déjà dans Auth0, il peut accepter directement
- Si l'utilisateur n'existe pas, il doit créer un compte Auth0 d'abord

### 4.3 Création d'un projet

**Acteur:** Utilisateur avec rôle `moe`, `assistant` ou `owner`

**Scénario principal:**
1. L'utilisateur sélectionne une organisation (si plusieurs)
2. Clique sur "Nouveau projet"
3. Le wizard de création s'ouvre (identique à l'existant)
4. À la fin du wizard :
   - Le projet est associé à l'organisation courante
   - Le créateur devient `owner` du projet
   - Un `ProjectActivity` est créé (`action: 'created'`)
5. Redirection vers la fiche projet

**Modifications du wizard:**
- Ajout d'un champ optionnel "MOE référent" (liste des membres `moe` de l'organisation)

### 4.4 Partage d'un projet

**Acteur:** Owner du projet ou Owner de l'organisation

**Scénario principal:**
1. Sur la fiche projet, section "Accès"
2. Liste des membres ayant accès (par défaut tous les membres de l'organisation)
3. Possibilité d'ajouter un accès spécifique :
   - Sélection d'un utilisateur (membre ou externe)
   - Attribution d'un rôle projet (`editor` ou `viewer`)
4. Possibilité de retirer un accès spécifique

**Règles métier:**
- Les membres de l'organisation ont accès par défaut (pas besoin d'entrée explicite)
- Les `ProjectAccess` permettent de surcharger les permissions ou d'ajouter des utilisateurs externes

### 4.5 Consultation du tableau de bord agence

**Acteur:** Membre de l'organisation

**Scénario principal:**
1. L'utilisateur sélectionne une organisation
2. Accès au tableau de bord agence
3. Affichage des KPIs :
   - Nombre total de projets
   - Nombre de projets à risque / en vigilance / sécurisés
   - Volume total marché HT + par année
   - Nombre de projets en retard (planning)
   - Nombre d'entreprises avec documents manquants
4. Filtres disponibles :
   - Par MOE référent
   - Par statut de projet
   - Par année de démarrage
5. Liste des projets avec indicateurs visuels

**Données affichées:**
- Carte par projet avec score, risque, MOE référent
- Graphiques (barres, donut) pour visualiser les métriques
- Lien vers chaque projet

### 4.6 Export de données

**Acteur:** Membre de l'organisation (sauf `read_only` pour certains exports)

**Scénario principal:**
1. Sur le tableau de bord agence, section "Exports"
2. Types d'export disponibles :
   - Liste des projets (CSV/Excel)
   - Liste par entreprise (CSV/Excel)
   - Liste des réserves par projet (CSV/Excel)
3. Sélection des filtres (mêmes que le tableau de bord)
4. Génération et téléchargement du fichier

**Format CSV/Excel:**
- Colonnes adaptées selon le type d'export
- Encodage UTF-8 avec BOM pour Excel
- Format de dates: DD/MM/YYYY

---

## 5. APIs nécessaires

### 5.1 Organisations

#### `GET /api/organizations`
Liste des organisations de l'utilisateur connecté

**Réponse:**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Agence MOE Dupont",
      "slug": "agence-moe-dupont",
      "role": "owner",
      "memberCount": 5,
      "projectCount": 12
    }
  ]
}
```

#### `POST /api/organizations`
Créer une organisation

**Body:**
```json
{
  "name": "Agence MOE Dupont",
  "description": "Agence spécialisée en rénovation",
  "logoUrl": "https://..."
}
```

#### `GET /api/organizations/:id`
Détails d'une organisation

#### `PATCH /api/organizations/:id`
Modifier une organisation (owner uniquement)

#### `DELETE /api/organizations/:id`
Supprimer une organisation (owner uniquement)

### 5.2 Membres

#### `GET /api/organizations/:id/members`
Liste des membres d'une organisation

**Réponse:**
```json
{
  "members": [
    {
      "id": "membership-uuid",
      "user": {
        "id": "auth0-sub",
        "email": "user@example.com",
        "name": "Jean Dupont",
        "avatar": "https://..."
      },
      "role": "moe",
      "status": "active",
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/organizations/:id/members/invite`
Inviter un membre

**Body:**
```json
{
  "email": "nouveau@example.com",
  "role": "moe",
  "message": "Bienvenue dans l'équipe !"
}
```

#### `PATCH /api/organizations/:id/members/:memberId`
Modifier le rôle d'un membre (owner uniquement)

#### `DELETE /api/organizations/:id/members/:memberId`
Retirer un membre (owner uniquement)

#### `POST /api/organizations/:id/members/accept-invitation`
Accepter une invitation (via token)

**Body:**
```json
{
  "token": "invitation-token"
}
```

### 5.3 Projets

#### `GET /api/organizations/:id/projects`
Liste des projets d'une organisation

**Query params:**
- `referentMoeId`: Filtrer par MOE référent
- `status`: Filtrer par statut
- `year`: Filtrer par année de démarrage
- `page`: Numéro de page
- `limit`: Nombre d'éléments par page

**Réponse:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Maison individuelle - Rue de la Paix",
      "status": "ongoing",
      "currentScore": 72,
      "currentRiskLevel": "medium",
      "referentMoe": {
        "id": "user-id",
        "name": "Jean Dupont"
      },
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### `POST /api/organizations/:id/projects`
Créer un projet

**Body:** Identique au modèle `Project` (sans `id`, `organizationId`, `createdBy`)

#### `GET /api/projects/:id`
Détails d'un projet

#### `PATCH /api/projects/:id`
Modifier un projet

#### `DELETE /api/projects/:id`
Supprimer un projet (owner uniquement)

#### `GET /api/projects/:id/access`
Liste des accès au projet

#### `POST /api/projects/:id/access`
Ajouter un accès au projet

**Body:**
```json
{
  "userId": "user-id",
  "role": "editor"
}
```

#### `DELETE /api/projects/:id/access/:accessId`
Retirer un accès au projet

### 5.4 Dashboard

#### `GET /api/organizations/:id/dashboard`
Données du tableau de bord agence

**Réponse:**
```json
{
  "kpis": {
    "totalProjects": 45,
    "projectsAtRisk": 3,
    "projectsInVigilance": 8,
    "projectsSecured": 34,
    "totalMarketValue": 2500000,
    "marketValueByYear": {
      "2024": 1200000,
      "2023": 1300000
    },
    "delayedProjects": 5,
    "companiesWithMissingDocs": 12
  },
  "projects": [...],
  "recentActivity": [...]
}
```

### 5.5 Exports

#### `GET /api/organizations/:id/exports/projects`
Export liste des projets (CSV/Excel)

**Query params:**
- `format`: `csv` ou `xlsx`
- Filtres identiques à `GET /api/organizations/:id/projects`

#### `GET /api/organizations/:id/exports/companies`
Export par entreprise

#### `GET /api/organizations/:id/exports/snags`
Export des réserves

### 5.6 Authentification

#### `GET /api/auth/me`
Informations de l'utilisateur connecté

**Réponse:**
```json
{
  "user": {
    "id": "auth0-sub",
    "email": "user@example.com",
    "name": "Jean Dupont",
    "avatar": "https://..."
  },
  "organizations": [...]
}
```

---

## 6. Règles métier détaillées

### 6.1 Gestion des organisations

1. **Création:**
   - Un utilisateur peut créer plusieurs organisations
   - Le créateur devient automatiquement `owner`
   - Le `slug` doit être unique (génération automatique)

2. **Suppression:**
   - Seul le `owner` peut supprimer une organisation
   - Il doit y avoir au moins un `owner` actif
   - La suppression entraîne la suppression de tous les projets (avec confirmation)

3. **Invitations:**
   - Les invitations expirent après 7 jours
   - Un utilisateur ne peut pas être invité deux fois dans la même organisation
   - Les invitations peuvent être révoquées avant acceptation

### 6.2 Gestion des projets

1. **Création:**
   - Un projet appartient à une seule organisation
   - Le créateur devient `owner` du projet
   - Le MOE référent est optionnel

2. **Modification:**
   - Les modifications créent des entrées dans `ProjectActivity`
   - Les champs sensibles (score, risque) sont recalculés automatiquement

3. **Suppression:**
   - Seul le `owner` du projet ou le `owner` de l'organisation peut supprimer
   - La suppression est définitive (pas de corbeille dans le MVP)

### 6.3 Permissions

1. **Héritage:**
   - Les membres héritent des permissions de leur rôle organisation
   - Les `ProjectAccess` permettent de surcharger

2. **Vérification:**
   - Toutes les opérations vérifient les permissions avant exécution
   - Les erreurs 403 sont renvoyées si accès refusé

### 6.4 Migration des données

1. **Projets existants (LocalStorage):**
   - Lors de la première connexion après migration, proposer de créer une organisation
   - Importer automatiquement les projets existants dans cette organisation
   - Le créateur devient `owner` de tous les projets importés

2. **Données utilisateur:**
   - Synchroniser les données Auth0 avec la table `users` à la première connexion
   - Mettre à jour `lastLoginAt` à chaque connexion

---

## 7. Contraintes de sécurité

### 7.1 Authentification

- Utilisation d'Auth0 pour l'authentification (inchangé)
- Validation du token JWT sur chaque requête API
- Expiration des tokens gérée côté serveur

### 7.2 Autorisation

- Vérification systématique des permissions avant chaque opération
- Les IDs d'organisation et de projet sont validés
- Les utilisateurs ne peuvent accéder qu'aux données de leurs organisations

### 7.3 Données sensibles

- Les données financières sont accessibles uniquement aux membres autorisés
- Les exports sont limités aux membres avec les permissions appropriées
- Audit trail via `ProjectActivity` pour traçabilité

### 7.4 Validation des entrées

- Validation côté serveur de tous les inputs
- Sanitization des données avant stockage
- Protection contre les injections SQL (ORM/requêtes paramétrées)

---

## 8. Migration des données

### 8.1 Stratégie de migration

**Phase 1: Préparation**
- Créer les tables backend nécessaires
- Mettre en place les APIs de base

**Phase 2: Migration progressive**
- Ajouter un bouton "Migrer mes projets" dans l'interface
- Lors du clic :
  1. Créer une organisation par défaut pour l'utilisateur
  2. Importer tous les projets du LocalStorage
  3. Associer chaque projet à l'organisation
  4. Marquer les projets comme migrés

**Phase 3: Bascule**
- Une fois tous les projets migrés, désactiver l'écriture dans LocalStorage
- Rediriger automatiquement vers le backend pour les nouvelles créations

### 8.2 Script de migration

```typescript
async function migrateUserProjects(userId: string) {
  // 1. Récupérer les projets depuis LocalStorage
  const localProjects = loadProjects();
  
  // 2. Créer une organisation par défaut
  const org = await createDefaultOrganization(userId);
  
  // 3. Importer chaque projet
  for (const project of localProjects) {
    await importProject(project, org.id, userId);
  }
  
  // 4. Marquer la migration comme terminée
  await markMigrationComplete(userId);
}
```

### 8.3 Rollback

- Conserver les données LocalStorage pendant la période de transition
- Possibilité de revenir en arrière si problème détecté
- Logs détaillés de la migration pour debugging

---

## 9. Tests et validation

### 9.1 Tests unitaires

- Modèles de données
- Calcul des permissions
- Validation des règles métier

### 9.2 Tests d'intégration

- Flux complets (création org → invitation → création projet)
- APIs avec authentification
- Migration des données

### 9.3 Tests de performance

- Chargement du tableau de bord avec 100+ projets
- Export de grandes quantités de données
- Requêtes concurrentes

### 9.4 Tests de sécurité

- Tentatives d'accès non autorisé
- Validation des tokens expirés
- Protection CSRF

---

## 10. Interface utilisateur

### 10.1 Sélecteur d'organisation

**Emplacement:** Header de l'application

**Comportement:**
- Dropdown avec liste des organisations de l'utilisateur
- Organisation courante mise en évidence
- Possibilité de créer une nouvelle organisation
- Badge avec nombre de projets si applicable

### 10.2 Tableau de bord agence

**Composants:**
- Cartes KPI (métriques principales)
- Graphiques (barres, donut)
- Liste des projets avec filtres
- Actions rapides (créer projet, exporter)

### 10.3 Gestion des membres

**Page dédiée:**
- Liste des membres avec rôles
- Bouton "Inviter un membre"
- Actions par membre (modifier rôle, retirer)
- Statut des invitations en attente

### 10.4 Fiche projet (modifiée)

**Ajouts:**
- Section "Accès" avec liste des membres ayant accès
- Indicateur du MOE référent
- Historique d'activité récente
- Badge de l'organisation propriétaire

---

## 11. Prochaines étapes

### 11.1 Phase 1 - MVP (0-3 mois)

1. **Backend:**
   - Mise en place de l'architecture (Node/NestJS ou BaaS)
   - Création des modèles de données
   - Implémentation des APIs de base

2. **Frontend:**
   - Sélecteur d'organisation
   - Création/gestion d'organisations
   - Tableau de bord agence
   - Gestion des membres

3. **Migration:**
   - Script de migration LocalStorage → Backend
   - Tests de migration

### 11.2 Phase 2 - Améliorations (3-6 mois)

- Notifications d'invitation par email
- Amélioration du tableau de bord (graphiques avancés)
- Recherche et filtres avancés
- Optimisations de performance

---

## 12. Questions ouvertes

1. **BaaS vs Backend custom:**
   - Supabase/Firebase pour accélérer le développement ?
   - Ou backend Node/NestJS pour plus de contrôle ?

2. **Notifications:**
   - In-app uniquement dans le MVP ?
   - Ou emails dès le début ?

3. **Limites:**
   - Nombre de projets par organisation ?
   - Nombre de membres par organisation ?
   - Taille des exports ?

4. **Utilisateurs externes:**
   - Permettre d'inviter des utilisateurs non-membres de l'organisation sur un projet spécifique ?
   - Ou limiter aux membres de l'organisation dans le MVP ?

---

**Document à valider avec l'équipe avant implémentation**
