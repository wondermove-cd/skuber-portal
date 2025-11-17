import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContextType, LoginCredentials, User } from '@/types/auth';
import * as authApi from '@/lib/api/auth';
import { mockUsers } from '@/lib/mock/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Restore user from localStorage on initial load or auto-login with URL params
  useEffect(() => {
    // Check for auto-login parameter
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');

    if (roleParam) {
      // Find user with matching role
      const autoLoginUser = mockUsers.find(u => u.role === roleParam);
      if (autoLoginUser) {
        authApi.saveUser(autoLoginUser);
        setUser(autoLoginUser);
        setIsLoading(false);
        return;
      }
    }

    // Normal user restoration from localStorage
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, [location.search]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authApi.login(credentials);
      authApi.saveUser(user);
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.removeUser();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
