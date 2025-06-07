export type UserRole = 'admin' | 'guru' | 'kepala sekolah';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}