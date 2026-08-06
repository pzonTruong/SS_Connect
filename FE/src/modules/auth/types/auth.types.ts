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

  // Expert fields
  title?: string;
  specialties?: string[];
  experienceYears?: number;
  achievements?: string[];
  consultingStyle?: string;
  consultingType?: ('online' | 'offline')[];
}

