import { gql } from "graphql-tag";

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type Query {
    me: User
    models: [Model!]!
    agents: [Agent!]!
  }

  type Mutation {
    ask(prompt: String!, model: ModelName): Message!
    startVoiceSession: VoiceSession!
    createAgent(name: String!, soul: String!): Agent!
  }

  type Subscription {
    stream(prompt: String!, model: ModelName): StreamChunk!
  }

  enum ModelName {
    MARY
    MAYA
    NIKKI
  }

  type Message {
    role: String!
    content: String!
    voiceUrl: String
  }

  type VoiceSession {
    id: ID!
  }

  type Agent {
    id: ID!
    name: String!
  }

  type StreamChunk {
    text: String!
    done: Boolean!
  }

  type Model {
    name: ModelName!
    displayName: String!
    thinking: Boolean!
  }

  type User {
    id: ID!
    tier: String!
    voiceExchangesUsed: Int!
    voiceExchangesLimit: Int
  }
`;
