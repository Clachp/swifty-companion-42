import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { User42 } from '@/src/types/api.types';

interface ProfileContextType {
  cachedProfile: User42 | null;
  cacheProfile: (user: User42) => void;
  getCachedProfile: (login: string) => User42 | null;
  clearCache: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [cachedProfile, setCachedProfile] = useState<User42 | null>(null);

  const cacheProfile = (user: User42) => {
    setCachedProfile(user);
  };

  const getCachedProfile = (login: string): User42 | null => {
    if (cachedProfile && cachedProfile.login === login) {
      return cachedProfile;
    }
    return null;
  };

  const clearCache = () => {
    setCachedProfile(null);
  };

  return (
    <ProfileContext.Provider value={{ cachedProfile, cacheProfile, getCachedProfile, clearCache }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
