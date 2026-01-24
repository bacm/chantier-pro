# Chantier Pro - Backend API

API REST pour l'application Chantier Pro, permettant la gestion multi-utilisateurs et la collaboration au sein d'organisations (agences MOE).

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Auth0 configuré (pour l'authentification)

### Installation

```bash
# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine du dossier `server/` :

```env
PORT=3001
FRONTEND_URL=http://localhost:8080
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-audience
NODE_ENV=development
```

### Démarrage

```bash
# Mode développement (avec watch)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur le port **3001** par défaut.

## 📁 Structure du projet

```
server/
├── src/
│   ├── index.js              # Point d'entrée du serveur
│   ├── middleware/
│   │   └── auth.js           # Middleware d'authentification JWT
│   ├── db/
│   │   └── memory.js         # Base de données en mémoire (MVP)
│   └── routes/
│       ├── auth.js           # Routes d'authentification
│       ├── organizations.js  # Routes des organisations
│       ├── projects.js       # Routes des projets
│       ├── dashboard.js      # Routes du tableau de bord
│       └── exports.js        # Routes d'export CSV
├── package.json
└── README.md
```

## 🔐 Authentification

L'API utilise Auth0 pour l'authentification. Chaque requête (sauf `/api/auth/me`) nécessite un token JWT dans le header :

```
Authorization: Bearer <token>
```

En mode développement, le backend accepte directement les tokens Google OAuth. En production, configurez Auth0 correctement.

## 📡 Endpoints API

### Authentification

#### `GET /api/auth/me`
Récupère les informations de l'utilisateur connecté et ses organisations.

**Réponse :**
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

### Organisations

#### `GET /api/organizations`
Liste toutes les organisations de l'utilisateur connecté.

#### `POST /api/organizations`
Crée une nouvelle organisation.

**Body :**
```json
{
  "name": "Agence MOE Dupont",
  "description": "Description optionnelle",
  "logoUrl": "https://..."
}
```

#### `GET /api/organizations/:id`
Récupère les détails d'une organisation.

#### `PATCH /api/organizations/:id`
Modifie une organisation (owner uniquement).

#### `DELETE /api/organizations/:id`
Supprime une organisation (owner uniquement).

#### `GET /api/organizations/:id/members`
Liste les membres d'une organisation.

#### `POST /api/organizations/:id/members/invite`
Invite un nouveau membre.

**Body :**
```json
{
  "email": "nouveau@example.com",
  "role": "moe"
}
```

#### `PATCH /api/organizations/:id/members/:memberId`
Modifie le rôle d'un membre (owner uniquement).

#### `DELETE /api/organizations/:id/members/:memberId`
Retire un membre de l'organisation (owner uniquement).

### Projets

#### `GET /api/projects/organization/:orgId`
Liste les projets d'une organisation.

**Query params :**
- `referentMoeId` : Filtrer par MOE référent
- `status` : Filtrer par statut (new/ongoing)
- `year` : Filtrer par année de démarrage
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20)

#### `POST /api/projects/organization/:orgId`
Crée un nouveau projet.

**Body :** Objet `Project` (sans `id`, `organizationId`, `createdBy`)

#### `GET /api/projects/:id`
Récupère les détails d'un projet.

#### `PATCH /api/projects/:id`
Modifie un projet.

#### `DELETE /api/projects/:id`
Supprime un projet (owner uniquement).

#### `GET /api/projects/:id/access`
Liste les accès spécifiques au projet.

#### `POST /api/projects/:id/access`
Ajoute un accès spécifique au projet.

**Body :**
```json
{
  "userId": "user-id",
  "role": "editor"
}
```

#### `DELETE /api/projects/:id/access/:accessId`
Retire un accès spécifique au projet.

#### `GET /api/projects/:id/activities`
Récupère l'historique d'activité d'un projet.

### Dashboard

#### `GET /api/dashboard/organization/:orgId`
Récupère les données du tableau de bord agence.

**Réponse :**
```json
{
  "kpis": {
    "totalProjects": 45,
    "projectsAtRisk": 3,
    "projectsInVigilance": 8,
    "projectsSecured": 34,
    "totalMarketValue": 2500000,
    "marketValueByYear": {...},
    "delayedProjects": 5,
    "companiesWithMissingDocs": 12
  },
  "projects": [...],
  "recentActivity": [...]
}
```

### Exports

#### `GET /api/exports/organization/:orgId/projects`
Exporte la liste des projets en CSV.

**Query params :** Identiques à `GET /api/projects/organization/:orgId`

#### `GET /api/exports/organization/:orgId/companies`
Exporte la liste des entreprises en CSV.

#### `GET /api/exports/organization/:orgId/snags`
Exporte la liste des réserves en CSV.

## 🔒 Permissions

### Rôles au niveau Organisation

- **owner** : Toutes les permissions + gestion de l'organisation
- **moe** : Gestion opérationnelle complète des projets
- **assistant** : Gestion documentaire, pas de suppression
- **read_only** : Consultation uniquement

### Rôles au niveau Projet

- **owner** : Toutes les permissions + suppression
- **editor** : Création et modification
- **viewer** : Consultation uniquement

Les permissions au niveau projet peuvent surcharger les permissions de l'organisation.

## 💾 Base de données

**⚠️ Important :** Le backend utilise actuellement un stockage **en mémoire** (Map JavaScript). 

- ✅ Parfait pour le développement et les tests
- ❌ Les données sont **perdues au redémarrage du serveur**
- 🔄 Pour la production, remplacer par PostgreSQL ou MongoDB

### Migration vers une vraie base de données

Pour migrer vers PostgreSQL (recommandé) :

1. Installer `pg` et `knex` :
```bash
npm install pg knex
```

2. Créer un fichier de migration Knex
3. Remplacer les appels à `db.*` dans `src/db/memory.js` par des requêtes SQL
4. Configurer la connexion PostgreSQL dans `.env`

## 🧪 Tests

```bash
# À venir : tests unitaires et d'intégration
npm test
```

## 🐛 Débogage

### Logs

Les erreurs sont loggées dans la console. Pour plus de détails, ajouter :

```javascript
console.log('Debug:', data);
```

### Vérifier l'authentification

Tester avec curl :

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/me
```

## 📝 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | `3001` |
| `FRONTEND_URL` | URL du frontend (pour CORS) | `http://localhost:8080` |
| `AUTH0_DOMAIN` | Domaine Auth0 | Requis |
| `AUTH0_AUDIENCE` | Audience Auth0 | Requis |
| `NODE_ENV` | Environnement (development/production) | `development` |

## 🚨 Erreurs courantes

### "No token provided"
Le token JWT n'est pas présent dans le header `Authorization`. Vérifier que le frontend envoie bien le token.

### "Invalid token"
Le token est invalide ou expiré. Vérifier la configuration Auth0.

### "Access denied"
L'utilisateur n'a pas les permissions nécessaires pour cette action.

### CORS errors
Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend.

## 🔄 Prochaines étapes

- [ ] Migration vers PostgreSQL
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Rate limiting
- [ ] Validation des données avec Zod
- [ ] Logging structuré (Winston)
- [ ] Cache Redis pour les performances
- [ ] Webhooks pour les événements

## 📚 Ressources

- [Documentation Express](https://expressjs.com/)
- [Documentation Auth0](https://auth0.com/docs)
- [Spécifications complètes](../SPECS_COLLABORATION.md)

## 🤝 Contribution

Ce backend fait partie du projet Chantier Pro. Pour contribuer, voir le README principal du projet.

---

**Développé pour Chantier Pro - Application de traçabilité juridique pour Maîtres d'Œuvre**
