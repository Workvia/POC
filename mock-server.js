const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Minimal GraphQL schema to satisfy Twenty's queries
const typeDefs = `#graphql
  type Query {
    currentUser: User
    getObjectMetadataItems: [ObjectMetadataItem!]!
  }

  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    supportUserHash: String
    canImpersonate: Boolean
    canAccessFullAdminPanel: Boolean
    onboardingStatus: String
    userVars: String
    currentWorkspace: Workspace
    workspaceMember: WorkspaceMember
    workspaceMembers: [WorkspaceMember!]!
    deletedWorkspaceMembers: [WorkspaceMember!]!
    availableWorkspaces: [Workspace!]!
    currentUserWorkspace: UserWorkspace
  }

  type Workspace {
    id: ID!
    displayName: String!
    logo: String
    inviteHash: String
    allowImpersonation: Boolean
    activationStatus: String!
    featureFlags: [FeatureFlag!]!
    subdomain: String
    workspaceUrls: WorkspaceUrls!
    metadataVersion: Int!
  }

  type WorkspaceUrls {
    subdomainUrl: String!
    customUrl: String
  }

  type WorkspaceMember {
    id: ID!
    name: String
    colorScheme: String
    locale: String
    avatarUrl: String
  }

  type UserWorkspace {
    id: ID!
  }

  type FeatureFlag {
    id: ID!
    key: String!
    value: Boolean!
  }

  type ObjectMetadataItem {
    id: ID!
    nameSingular: String!
    namePlural: String!
    labelSingular: String!
    labelPlural: String!
    description: String
    icon: String
    isActive: Boolean!
    isSystem: Boolean!
    isCustom: Boolean!
    isRemote: Boolean!
    fields: [Field!]!
  }

  type Field {
    id: ID!
    name: String!
    label: String!
    type: String!
    isActive: Boolean!
  }
`;

// Mock resolvers
const resolvers = {
  Query: {
    currentUser: () => ({
      id: 'mock-user-id',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      supportUserHash: null,
      canImpersonate: false,
      canAccessFullAdminPanel: true,
      onboardingStatus: 'COMPLETED',
      userVars: null,
      currentWorkspace: {
        id: 'mock-workspace-id',
        displayName: 'Dev Workspace',
        logo: null,
        inviteHash: null,
        allowImpersonation: false,
        activationStatus: 'ACTIVE',
        featureFlags: [],
        subdomain: 'dev',
        workspaceUrls: {
          subdomainUrl: 'http://localhost:3001',
          customUrl: null,
        },
        metadataVersion: 1,
      },
      workspaceMember: {
        id: 'mock-member-id',
        name: 'Dev User',
        colorScheme: 'Light',
        locale: 'en',
        avatarUrl: null,
      },
      workspaceMembers: [],
      deletedWorkspaceMembers: [],
      availableWorkspaces: [],
      currentUserWorkspace: {
        id: 'mock-user-workspace-id',
      },
    }),
    getObjectMetadataItems: () => [
      {
        id: 'companies-id',
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
        description: 'A company',
        icon: 'IconBuildingSkyscraper',
        isActive: true,
        isSystem: true,
        isCustom: false,
        isRemote: false,
        fields: [],
      },
      {
        id: 'people-id',
        nameSingular: 'person',
        namePlural: 'people',
        labelSingular: 'Person',
        labelPlural: 'People',
        description: 'A person',
        icon: 'IconUser',
        isActive: true,
        isSystem: true,
        isCustom: false,
        isRemote: false,
        fields: [],
      },
    ],
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 3000 },
}).then(({ url }) => {
  console.log(`🚀 Mock GraphQL server ready at ${url}`);
});
