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
├── src/
│   ├── config/           # Configuration de l'application (base de données, environnements, etc.)
│   │   ├── database.config.ts
│   │   └── environment.config.ts
│   ├── core/             # Composants principaux (middlewares, gestion des erreurs, etc.)
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── exceptions/
│   │   ├── services/
│   │   └── guards/
│   ├── database/         # Gestion de la base de données
│   │   ├── factories/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── subscribers/
│   ├── features/         # Modules fonctionnels (clients, factures, produits, services)
│   │   └── feature1/     # Exemple de module fonctionnel
|   │       ├── dto/      # Data Transfer Objects
|   │       ├── entities/ # Modèles de données
|   │       ├── enums/    # Énumérations
|   │       ├── repositories/    # Repositories
|   │       ├── feature1.container.ts   # Conteneur d'injection de dépendances à l'échelle du module
|   │       ├── feature1.controller.ts  # Contrôleur (gère les routes et les requêtes HTTP)
|   │       ├── feature1.routes.ts      # Routes (définit les endpoints et les middlewares associés)
|   │       └── feature1.service.ts     # Service (logique métier)
│   ├── shared/            # Code partagé entre différents modules
│   │   ├── utils/         # Fonctions utilitaires communes
│   │   ├── constants/     # Constantes globales
│   │   └── interfaces/    # Interfaces globales
│   ├── app.container.ts   # Conteneur d'injection de dépendances à l'échelle de l'application
│   ├── app.ts            # Point d'entrée de l'application
│   ├── server.ts         # Initialisation du serveur
├── tests/                # Tests (unitaires, d'intégration, etc.)
│   ├── unit/             # Tests unitaires
│   ├── integration/      # Tests d'intégration
│   └── e2e/              # Tests end-to-end
├── .env                  # Fichier d'environnement pour la production
├── .env.development      # Fichier d'environnement pour le développement
├── .env.production       # Fichier d'environnement pour la production
├── .env.testing          # Fichier d'environnement pour les tests
├── .gitignore            # Ignore les fichiers spécifiques dans Git
├── package.json          # Gestionnaire de packages (npm)
├── tsconfig.json         # Configuration TypeScript
└── README.md             # Documentation du projet
```

## Dépendances

- `express` : Framework web pour Node.js.
- `typeorm` : ORM pour TypeScript et JavaScript (ES7+).
- `jsonwebtoken` : Génération et vérification des tokens JWT.
- `jest` : Framework de test pour JavaScript.
