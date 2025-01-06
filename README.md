# Stock Management API

Une API RESTful pour la gestion de stock et des ventes.

## Table des matières
- [Installation](#installation)
- [Usage](#usage)
- [Documentation de l'API](#documentation-de-lapi)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Dépendances](#dépendances)
## Installation

### Prérequis
- [Node.js](https://nodejs.org/) version `20.x` ou supérieure
- [npm](https://www.npmjs.com/) version `10.7.x` ou supérieure ou [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) version `14.x` ou supérieure

### Cloner le dépôt
```bash
git clone git@t-dev.epitest.eu:COT_1/T-DEV-702-Api.git
cd T-DEV-702-Api
```

### Installation des dépendances
```bash
npm install
```

### Configuration de l'environnement
Créez un fichier .env à la racine du projet avec les variables suivantes :
```bash
APP_NAME="Secure Sante"
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=mydatabase
JWT_SECRET=mysecretkey
```

## Usage

### Démarrer le serveur
```bash
npm run start
```

L'API sera accessible à http://localhost:3000.

### Schéma de Réponse de l'API
Les réponses de l'API suivent un format standard pour assurer la cohérence. Les schémas de réponse sont définis comme suit :

### 1. Réponse de Succès

#### a. Réponse avec un Objet Simple
Lorsque l'API retourne un seul objet (ex. un utilisateur), la réponse est structurée comme suit :

**Réponse HTTP 200 OK**
```json
{
  "status_code": 200,
  "timestamp": "2024-08-20T12:34:56Z",
  "message": "Succès",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

#### b. Réponse avec une Liste d'Objets
Pour les réponses contenant une liste d'objets (ex. liste des utilisateurs), la structure est :

**Réponse HTTP 200 OK**

```json
{
  "status_code": 200,
  "timestamp": "2024-08-20T12:34:56Z",
  "message": "Succès",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  ]
}
```

#### c. Réponse avec Pagination
Lorsque les données sont paginées, la réponse inclut des informations sur la pagination :

**Réponse HTTP 200 OK**

```json
{
  "status_code": 200,
  "timestamp": "2024-08-20T12:34:56Z",
  "message": "Succès",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com"
      }
    ],
    "current_page": 1,
    "last_page": 5,
    "total_items": 50,
    "per_page": 10
  }
}
```

### 2. Réponse d'Erreur
Les erreurs sont renvoyées avec un format standard qui inclut le code d'état HTTP, un message d'erreur, et éventuellement des détails supplémentaires.

```json
{
  "status_code": 404,
  "timestamp": "2024-08-20T12:34:56Z",
  "message": "Ressource non trouvée",
  "error": "Not Found"
}
```

## Tests

### Exécution des tests
1. Lancez les tests unitaires :
```bash
npm run test
```
2. Lancez les tests d'intégration :
```bash
npm run test:integration
```
3. Lancez les tests unitaires :
```bash
npm run test:coverage
```

## Structure du projet
```bash
src/
├── common/                    # Modules et utilitaires communs
│   ├── decorators/            # Décorateurs personnalisés
│   ├── dto/                   # Objets de transfert de données
│   ├── exceptions/            # Gestion des exceptions
│   ├── filters/               # Filtres globaux pour les erreurs
│   ├── guards/                # Gardes pour la sécurité et l'accès
│   ├── interceptors/          # Intercepteurs pour les réponses et les logs
│   ├── interfaces/            # Interfaces pour les types partagés
│   ├── middleware/            # Middlewares pour les requêtes HTTP
│   ├── pipes/                 # Pipes pour la transformation et la validation
│   └── utils/                 # Utilitaires généraux
├── config/                    # Configuration de l'application
│   ├── configuration.module.ts
│   ├── configuration.service.ts
│   └── configurations/        # Différentes configurations d'environnement
│       ├── development.ts
│       ├── production.ts
│       └── test.ts
├── core/                      # Services et modules essentiels
│   ├── logger/                # Service de journalisation
│   ├── database/              # Configuration de la base de données
│   ├── cache/                 # Gestion du cache
│   └── core.module.ts
├── features/                   # Modules fonctionnels
│   ├── auth/                  # Module d'authentification
│   │   ├── dto/               # DTOs pour l'authentification
│   │   ├── entities/          # Entités pour la persistance
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   ├── users/                 # Module utilisateur
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── repositories/
│   └── ...                    # Autres modules fonctionnels
├── main.ts                    # Fichier principal pour démarrer l'application
├── app.module.ts              # Module racine de l'application
└── test/                      # Tests unitaires et d'intégration
    ├── e2e/                   # Tests end-to-end
    └── unit/                  # Tests unitaires

```

## Dépendances

- `express` : Framework web pour Node.js.
- `typeorm` : ORM pour TypeScript et JavaScript (ES7+).
- `jsonwebtoken` : Génération et vérification des tokens JWT.
- `jest` : Framework de test pour JavaScript.
