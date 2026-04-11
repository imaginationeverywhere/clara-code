import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    clerkId: String!
    email: String!
    firstName: String
    lastName: String
    createdAt: String!
  }

  type ApiKey {
    id: ID!
    name: String!
    keyPreview: String!
    lastUsedAt: String
    createdAt: String!
  }

  type WaitlistEntry {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Query {
    me: User
    myApiKeys: [ApiKey!]!
    health: String!
  }

  type Mutation {
    joinWaitlist(email: String!, name: String, role: String): WaitlistEntry!
    createApiKey(name: String!): String!
    revokeApiKey(id: ID!): Boolean!
  }
`;
