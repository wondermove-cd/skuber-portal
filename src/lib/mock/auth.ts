import { User } from '@/types/auth';

export const mockUsers: User[] = [
  // WM 유저
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

  // 리셀러 유저 (메가존)
  {
    id: 'reseller-admin-001',
    email: 'admin@megazone.com',
    role: 'reseller_admin',
    name: 'Megazone Admin',
    resellerId: 'reseller-megazone',
    resellerName: 'Megazone Cloud',
  },
  {
    id: 'reseller-editor-001',
    email: 'editor@megazone.com',
    role: 'reseller_editor',
    name: 'Megazone Editor',
    resellerId: 'reseller-megazone',
    resellerName: 'Megazone Cloud',
  },
  {
    id: 'reseller-viewer-001',
    email: 'viewer@megazone.com',
    role: 'reseller_viewer',
    name: 'Megazone Viewer',
    resellerId: 'reseller-megazone',
    resellerName: 'Megazone Cloud',
  },
];

// 비밀번호는 모두 동일하게 설정 (실제로는 해시화되어야 함)
export const MOCK_PASSWORD = 'admin123';
