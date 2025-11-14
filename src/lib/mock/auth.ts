import { User } from '@/types/auth';

export const mockUsers: User[] = [
  // WM users
  {
    id: 'wm-admin-001',
    email: 'admin@wondermove.com',
    role: 'wm_admin',
    name: 'WM Admin',
  },
  {
    id: 'wm-editor-001',
    email: 'editor@wondermove.com',
    role: 'wm_editor',
    name: 'WM Editor',
  },
  {
    id: 'wm-viewer-001',
    email: 'viewer@wondermove.com',
    role: 'wm_viewer',
    name: 'WM Viewer',
  },

  // Reseller users (Megazone)
  {
    id: 'reseller-admin-001',
    email: 'admin@megazone.com',
    role: 'reseller_admin',
    name: 'Megazone Admin',
    resellerId: '1', // Megazone reseller id
    resellerName: 'Megazone',
  },
  {
    id: 'reseller-editor-001',
    email: 'editor@megazone.com',
    role: 'reseller_editor',
    name: 'Megazone Editor',
    resellerId: '1', // Megazone reseller id
    resellerName: 'Megazone',
  },
  {
    id: 'reseller-viewer-001',
    email: 'viewer@megazone.com',
    role: 'reseller_viewer',
    name: 'Megazone Viewer',
    resellerId: '1', // Megazone reseller id
    resellerName: 'Megazone',
  },
];

// All accounts use the same password (in production, this should be hashed)
export const MOCK_PASSWORD = 'admin123';

// Function to add a new user to the mock users array
export function addUser(newUser: Omit<User, 'id'>): User {
  // Generate a unique ID based on role and existing users
  const rolePrefix = newUser.role.split('_')[0]; // 'wm' or 'reseller'
  const roleType = newUser.role.split('_')[1]; // 'admin', 'editor', or 'viewer'
  const existingCount = mockUsers.filter((u) => u.role === newUser.role).length;
  const id = `${rolePrefix}-${roleType}-${String(existingCount + 1).padStart(3, '0')}`;

  const user: User = {
    id,
    ...newUser,
  };

  mockUsers.push(user);
  return user;
}

// Function to get all users (for checking duplicates)
export function getAllUsers(): User[] {
  return mockUsers;
}
