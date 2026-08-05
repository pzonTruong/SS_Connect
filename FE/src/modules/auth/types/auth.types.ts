export interface AuthPayload {
  email: string;
  password: string;
}

export interface CurrentUser {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
