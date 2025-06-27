export type UserRole = 'admin' | 'guru' | 'kepala sekolah';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}