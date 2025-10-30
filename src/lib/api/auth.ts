import { LoginCredentials, User } from '@/types/auth';
import { mockUsers, MOCK_PASSWORD } from '@/lib/mock/auth';

// Login API (Mock)
export async function login(credentials: LoginCredentials): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Find user
  const user = mockUsers.find((u) => u.email === credentials.email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password (in real app, this would be done on server with hash comparison)
  if (credentials.password !== MOCK_PASSWORD) {
    throw new Error('Invalid email or password');
  }

  return user;
}

// Logout API (Mock)
export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// Save user to localStorage
export function saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Remove user from localStorage
export function removeUser(): void {
  localStorage.removeItem('user');
}
