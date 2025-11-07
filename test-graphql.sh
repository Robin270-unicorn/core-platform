#!/bin/bash

# Test GraphQL Hello Query
echo "Testing Hello Query..."
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { hello }"}'

echo -e "\n\n"

# Create User Mutation
echo "Creating User..."
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createUser(email: \"test@example.com\", name: \"Test\", password: \"secret123\") }"}'

echo -e "\n\n"

# Test Login Mutation
echo "Testing Login Mutation..."
curl -X POST http://localhost:3030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@example.com\", password: \"secret123\") }"}'

echo -e "\n"
