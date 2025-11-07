# Testing the Backend Microservice

## Architecture Overview

The backend runs as a **hybrid application**:
- **HTTP/GraphQL Server**: Port 3030
- **TCP Microservice**: Port 4001

## How to Start

### Option 1: Development Mode (with hot reload)
```bash
npx nx serve backend
```

### Option 2: Production Build and Run
```bash
# Build
npx nx build backend

# Run
node apps/backend/dist/main.js
```

## How to Test

### Option 1: GraphQL Playground
1. Start the server: `npx nx serve backend`
2. Open browser: http://localhost:3030/graphql
3. Run queries/mutations in the playground

### Option 2: Using the test script
```bash
./test-graphql.sh
```

### Option 3: Manual curl commands

Hello Query:
```bash
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { hello }"}'
```

Create User (with password):
```bash
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createUser(email: \"test@example.com\", name: \"Test\", password: \"secret123\") }"}'
```

Login (email + password):
```bash
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@example.com\", password: \"secret123\") }"}'
```

The login mutation returns a JWT string. Use it in Authorization headers for protected endpoints:
```
Authorization: Bearer <token>
```

## How It Works

### Login Flow
1. GraphQL mutation `login(email: "...", password: "...")` hits `UserResolver`.
2. `UsersService.login` looks up the in-memory user by email.
3. It sends `comparePasswords` via TCP microservice to `AuthController` to validate the password against the stored hash.
4. If valid, it sends `generateToken` to get a signed JWT (with `sub` and `email`).
5. The token is returned to the client.

### User Creation
1. GraphQL mutation `createUser(email, name, password)` hits `UserResolver`.
2. `UsersService.create` sends `hashPassword` to the microservice to hash the password.
3. The user (email, name, passwordHash) is stored in an in-memory Map (demo only).

## Microservice Communication

The microservice communication uses **TCP transport** via `@nestjs/microservices`:

- Client: `UsersService` (sends messages)
- Server: `AuthController` (receives messages via `@MessagePattern`)
- Transport: TCP on `localhost:4001`
- Patterns: `hashPassword`, `comparePasswords`, `generateToken`

No separate microservice process needed - everything runs in one NestJS application!
