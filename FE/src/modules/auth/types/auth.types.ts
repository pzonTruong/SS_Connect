export interface AuthPayload {
  email: string;
  password: string;
  role?: 'user' | 'expert' | 'admin';
}

export interface CurrentUser {
  _id: string;
  email: string;
  role: 'user' | 'expert' | 'admin';
  isEmailVerified: boolean;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
