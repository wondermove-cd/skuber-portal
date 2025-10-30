// WM 유저 역할
export type WMRole = 'wm_admin' | 'wm_editor' | 'wm_viewer';

// 리셀러 유저 역할
export type ResellerRole = 'reseller_admin' | 'reseller_editor' | 'reseller_viewer';

// 전체 역할
export type UserRole = WMRole | ResellerRole;

// 사용자 정보
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  resellerId?: string;
  resellerName?: string;
}

// 로그인 자격증명
export interface LoginCredentials {
  email: string;
  password: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
