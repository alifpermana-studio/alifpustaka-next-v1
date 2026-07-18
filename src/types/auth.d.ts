export interface User {
  userId: string; // for system use only
  name: string;
  username: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
