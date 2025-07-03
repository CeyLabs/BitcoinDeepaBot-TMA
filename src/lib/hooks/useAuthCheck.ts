"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from '@/lib/auth';
import { useStore } from '@/lib/store';

/**
 * Custom hook to check authentication and redirect if not authenticated
 * @param redirectTo - Where to redirect if not authenticated (default: '/onboard')
 */
export const useAuthCheck = (redirectTo: string = '/onboard') => {
  const router = useRouter();
  const { setAuthToken, setIsExistingUser } = useStore();

  useEffect(() => {
    const token = getAuthTokenFromStorage();
    const isExisting = getIsExistingUserFromStorage();

    if (token) {
      // Set token in store if found in localStorage
      setAuthToken(token);
      setIsExistingUser(isExisting);
    } else {
      // Redirect if no token found
      router.push(redirectTo);
    }
  }, [router, redirectTo, setAuthToken, setIsExistingUser]);

  return {
    token: getAuthTokenFromStorage(),
    isAuthenticated: !!getAuthTokenFromStorage(),
  };
};
