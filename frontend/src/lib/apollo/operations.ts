import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      clerkId
      email
      plan
      createdAt
    }
  }
`;

export const MY_API_KEYS = gql`
  query MyApiKeys {
    myApiKeys {
      id
      name
      keyPrefix
      createdAt
      lastUsed
      isActive
    }
  }
`;

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($name: String!) {
    createApiKey(name: $name) {
      id
      name
      keyPrefix
      createdAt
      lastUsed
      isActive
    }
  }
`;

export const REVOKE_API_KEY = gql`
  mutation RevokeApiKey($id: ID!) {
    revokeApiKey(id: $id)
  }
`;

export type PlanType = "FREE" | "PRO" | "BUSINESS";

export interface ApiKeyFields {
	id: string;
	name: string;
	keyPrefix: string;
	createdAt: string;
	lastUsed: string | null;
	isActive: boolean;
}

export interface MeQueryData {
	me: {
		id: string;
		clerkId: string;
		email: string;
		plan: PlanType;
		createdAt: string;
	} | null;
}

export interface MyApiKeysQueryData {
	myApiKeys: ApiKeyFields[];
}

export interface CreateApiKeyMutationData {
	createApiKey: ApiKeyFields;
}

export interface RevokeApiKeyMutationData {
	revokeApiKey: boolean;
}
