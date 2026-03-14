// Shared constants

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;

export const INVITATION_STATUS = ['pending', 'accepted', 'declined'] as const;
