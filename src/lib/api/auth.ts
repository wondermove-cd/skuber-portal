import { LoginCredentials, User } from '@/types/auth';
import { mockUsers, MOCK_PASSWORD } from '@/lib/mock/auth';

// 로그인 API (Mock)
export async function login(credentials: LoginCredentials): Promise<User> {
  // 실제 API 호출을 시뮬레이션하기 위한 딜레이
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 사용자 찾기
  const user = mockUsers.find((u) => u.email === credentials.email);

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  // 비밀번호 확인 (실제로는 서버에서 해시 비교)
  if (credentials.password !== MOCK_PASSWORD) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  return user;
}

// 로그아웃 API (Mock)
export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// 현재 사용자 정보 가져오기 (localStorage에서)
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// 사용자 정보 저장
export function saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// 사용자 정보 제거
export function removeUser(): void {
  localStorage.removeItem('user');
}
