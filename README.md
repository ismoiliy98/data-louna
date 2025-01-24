# Data Louna

[![CI](https://github.com/ismoiliy98/data-louna/actions/workflows/ci.yaml/badge.svg)](https://github.com/ismoiliy98/data-louna/actions/workflows/ci.yaml) ![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue) [![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

---
> **Backend API using Hono, Node.js (TypeScript), PostgreSQL, and Redis**

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Database Setup](#database-setup)
   - [Running the App](#running-the-app)
   - [Using Docker (Coming Soon)](#using-docker-coming-soon)
7. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Products](#products)
   - [Skinport](#skinport)
8. [Development & Tooling](#development--tooling)
   - [Scripts](#scripts)
   - [Linting & Formatting](#linting--formatting)
   - [Continuous Integration](#continuous-integration)
9. [License](#license)

---

## Overview

**Data Louna** is a backend API demonstrating:

- **Authentication** with session tokens stored in Redis.
- **Products** listing, reading, and purchasing logic using PostgreSQL.
- **Skinport API** integration with data caching. Data is refreshed periodically (every hour) to keep it up-to-date, minimizing redundant external calls.
- **TypeScript Strict** configuration for robust typing.
- **CI pipeline** that runs lints and checks via GitHub Actions.

---

## Key Features

1. **Session-Based Auth**  
   Utilizes Redis to store session tokens. Secure user authentication flows include **sign-up**, **login**, **logout**, and **password change**.

2. **Purchase Flow**  
   Users can purchase products if they have sufficient balance. Balances and stock counts are updated atomically in PostgreSQL.

3. **Skinport Integration**  
   Fetches CS:GO item data from the [Skinport API](https://skinport.com/). Cached data is refreshed every hour, ensuring minimal calls to the external service.

4. **Strict TypeScript Setup**  
   Helps catch bugs early and ensures high code quality.

5. **CI/CD Ready**  
   GitHub Actions run on push and pull requests for linting and checks. A Docker workflow will soon be added to build and push an OCI image to GitHub Container Registry (GHCR).

---

## Tech Stack

- **Runtime:** Node.js (>= 22.13.1)
- **Framework:** [Hono](https://hono.dev/)
- **Database:** PostgreSQL via [postgres.js](https://github.com/porsager/postgres)
- **Caching:** Redis
- **Language:** TypeScript (strict mode)
- **Linting/Formatting:** [Biome.js](https://biomejs.dev/)
- **CI/CD:** GitHub Actions

---

## Project Structure

Below is a simplified tree of the most important directories and files:

```bash
.
├── src
│   ├── app
│   │   ├── auth
│   │   │   ├── middlewares
│   │   │   ├── routes
│   │   │   ├── schemas
│   │   │   ├── types
│   │   │   └── utils
│   │   ├── products
│   │   │   ├── routes
│   │   │   └── schemas
│   │   └── skinport
│   │       ├── constants
│   │       ├── routes
│   │       ├── services
│   │       └── types
│   ├── constants
│   ├── lib
│   ├── types
│   └── index.ts
├── .github
│   └── workflows
│       └── ci.yaml
├── db.schema.sql
├── docker-compose.yaml
├── .env.sample
├── package.json
├── biome.json
├── pnpm-lock.yaml
├── tsconfig.json
└── ...
```

- **`src/app/auth`**: Authentication logic (routes, validators, sessions, etc.).
- **`src/app/products`**: Products management (CRUD, purchasing).
- **`src/app/skinport`**: Integration with Skinport API (services, caching).
- **`src/constants`**: Shared constants (environment, HTTP status, date/time).
- **`src/lib`**: Database and Redis client setup.
- **`src/index.ts`**: Entry point to bootstrap and run the Hono server.
- **`db.schema.sql`**: Simple schema for `users`, `products`, and `purchases`.
- **`.github/workflows/ci.yaml`**: GitHub Actions CI configuration.

---

## Environment Variables

Create a `.env` file in your root directory based on `.env.sample`:

```bash
DATABASE_URL="postgresql://postgres:123@127.0.0.1:5432/data-louna"
CACHE_URL="redis://127.0.0.1:6379/0"
SKINPORT_CLIENT_ID="<client_id>"
SKINPORT_CLIENT_SECRET="<client_secret>"

# Local dev only
PORT=3000
```

- **`DATABASE_URL`**: Connection string for PostgreSQL.
- **`CACHE_URL`**: Connection string for Redis.
- **`SKINPORT_CLIENT_ID` & `SKINPORT_CLIENT_SECRET`**: Credentials for Skinport API requests.
- **`PORT`**: Port for local development.

These variables are validated using `@t3-oss/env-core` at runtime.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 22.13.1)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/download)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ismoiliy98/data-louna.git
   cd data-louna
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Create your `.env` file** from `.env.sample`:

   ```bash
   cp .env.sample .env
   ```

4. **Update** the `.env` with your own values as needed.

### Database Setup

1. Ensure PostgreSQL is running.
2. Create a database named `data-louna` (or any custom name; update `DATABASE_URL` accordingly).
3. Run the schema:

   ```bash
   psql -d data-louna -f db.schema.sql
   ```

   Or, from the project root, something like:

   ```bash
   cat db.schema.sql | psql -d data-louna
   ```

### Running the App

```bash
# For local development:
pnpm dev

# This will start the server at http://localhost:3000 (by default).
```

```bash
# For production build:
pnpm build
pnpm start
```

### Using Docker (Coming Soon)

A **Dockerfile** is planned to be added to streamline container builds. It will allow:

- Building an OCI image via GitHub Actions.
- Publishing images to GHCR (GitHub Container Registry).
- Easy deployment to container environments (Kubernetes, Docker Swarm, etc.).

Stay tuned!

---

## API Endpoints

The server is accessible at `http://localhost:3000` by default. All routes are prefixed with `/api`.

### Auth

| Endpoint              | Method | Body                                     | Description                                      | Auth Required |
|-----------------------|--------|------------------------------------------|--------------------------------------------------|--------------|
| `/api/auth/signup`    | POST   | `{"username":"string","password":"string"}` | Registers a new user and returns a session token | ❌            |
| `/api/auth/login`     | POST   | `{"username":"string","password":"string"}` | Authenticates user and returns a session token   | ❌            |
| `/api/auth/logout`    | GET    | -                                        | Logs out the current user (invalidates session)  | ✅ (Bearer)   |
| `/api/auth/change-password` | POST   | `{"currentPassword":"string","newPassword":"string"}` | Changes user password                            | ✅ (Bearer)   |

**Example** – Sign up:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myUser",
    "password": "MyStr0ng!Pass"
  }'
```

**Example** – Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myUser",
    "password": "MyStr0ng!Pass"
  }'
# -> { "token": "xxxxx", "userId": 1, "message": "Login successful" }
```

---

### Products

| Endpoint                           | Method | Body                                        | Description                                         | Auth Required |
|------------------------------------|--------|---------------------------------------------|-----------------------------------------------------|--------------|
| `/api/products/list`              | GET    | -                                           | Returns a list of all products                      | ✅ (Bearer)   |
| `/api/products/:id`               | GET    | -                                           | Returns a specific product by ID                    | ✅ (Bearer)   |
| `/api/products/purchase`          | POST   | `{"productId": number, "quantity": number}` | Purchases a product if user balance and stock allow | ✅ (Bearer)   |

**Example** – List products:

```bash
curl -X GET http://localhost:3000/api/products/list \
  -H "Authorization: Bearer <your_session_token>"
```

---

### Skinport

| Endpoint                 | Method | Description                                | Auth Required |
|--------------------------|--------|--------------------------------------------|--------------|
| `/api/skinport/items`    | GET    | Returns a list of CS:GO items from cache   | ✅ (Bearer)   |

The data is cached for one hour and periodically refreshed in the background.

---

## Development & Tooling

### Scripts

In **`package.json`**, you have:

| Script       | Command                                        | Description                                         |
|--------------|------------------------------------------------|-----------------------------------------------------|
| `dev`        | `dotenv -v NODE_ENV=development -- tsx watch src/index.ts` | Starts local dev server with live reload via TSX.   |
| `build`      | `dotenv -v NODE_ENV=production -- tsup-node src/index.ts --clean` | Builds production files into `/dist`.               |
| `start`      | `NODE_ENV=production node dist/index.js`       | Starts the compiled production server.              |
| `ts:check`   | `tsc --noEmit`                                 | Type-checks the entire project using TypeScript.    |
| `biome:check`| `biome check .`                                | Runs Biome checks (lint & format checks).           |
| `biome:fix`  | `biome check . --fix`                          | Auto-fixes issues found by Biome.                   |
| `clean`      | `git clean -xdf node_modules dist`             | Removes `node_modules` and `dist`.                  |

### Linting & Formatting

This project uses [Biome.js](https://biomejs.dev/) to handle both **linting** and **formatting** in a unified way.  

- **Check**: `pnpm biome:check`  
- **Fix**: `pnpm biome:fix`

### Continuous Integration

The project uses **GitHub Actions** to run lint checks on each push and pull request. See [`.github/workflows/ci.yaml`](./.github/workflows/ci.yaml) for details. The pipeline:

1. Installs dependencies using `pnpm`.
2. Executes **TypeScript checks** (`pnpm ts:check`).
3. Executes **Biome** checks (`pnpm biome:check`).

In future, the CI will also **build a Docker image** and push it to GHCR for deployment.

---

## License

This project is licensed under the [MIT License](./LICENCE).  
Feel free to use, modify, and distribute it as you wish.

---

### Made with ❤️ by [bek](https://github.com/ismoiliy98) {align=center}
