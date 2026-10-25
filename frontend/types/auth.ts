export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type ApiUser = CurrentUser;
