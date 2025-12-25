import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69435f6ac7fbd395c32b93a7", 
  requiresAuth: true // Ensure authentication is required for all operations
});
