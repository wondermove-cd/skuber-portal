// WM user roles
export type WMRole = 'wm_admin' | 'wm_editor' | 'wm_viewer';

// Reseller user roles
export type ResellerRole = 'reseller_admin' | 'reseller_editor' | 'reseller_viewer';

// All user roles
export type UserRole = WMRole | ResellerRole;

// User information
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  resellerId?: string;
  resellerName?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Authentication context type
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
