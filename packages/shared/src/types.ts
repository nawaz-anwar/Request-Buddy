// Shared TypeScript types

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, 'admin' | 'editor' | 'viewer'>;
  memberIds: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Collection {
  id: string;
  name: string;
  workspaceId: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Folder {
  id: string;
  name: string;
  collectionId: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  workspaceId: string;
  collectionId?: string;
  folderId?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  auth?: any;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Environment {
  id: string;
  name: string;
  workspaceId: string;
  variables: Record<string, string>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface HistoryEntry {
  id: string;
  workspaceId: string;
  requestId?: string;
  method: string;
  url: string;
  status: number;
  timestamp: Date;
  duration: number;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterId: string;
  inviterEmail: string;
  inviteeEmail: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
}
