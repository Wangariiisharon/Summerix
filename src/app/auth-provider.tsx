'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import firebaseApp, { fbAuth } from '@/firebase/configs';
import { AUTH_USER } from '@/models/auth-user';
import { getAuthUser } from '@/services/auth';
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from '@firebase/app-check';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  appCheck: AppCheck | null;
  authUser: AUTH_USER | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setAuthUser: Function;
}

const defaultContextValue: AuthContextType = {
  appCheck: null,
  authUser: null,
  isAuthenticated: false,
  isAuthLoading: true,
  // eslint-disable-next-line no-unused-vars
  setAuthUser: (_authUser: AUTH_USER | null) => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

type Props = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: Props) => {
  const [authUser, setAuthUser] = useState<AUTH_USER | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [appCheck, setAppCheck] = useState<AppCheck | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsAuthLoading(true);

    const unsubscribe = onAuthStateChanged(fbAuth, async (fUser) => {
      console.debug('onAuthStateChanged > fUser:', fUser);
      console.log('onAuthStateChanged > fUser:', fUser);

      if (fUser) {
        const authUser = await getAuthUser(fUser);
        // console.debug('onAuthStateChanged > authUser:', authUser);
        setAuthUser(authUser);
      } else {
        setAuthUser(null);
        router.push('/auth/sign-in'); // Redirect to sign-in screen
      }

      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        Object.assign(window, {
          FIREBASE_APPCHECK_DEBUG_TOKEN: process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN,
        });
      }

      const results = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY!),
        isTokenAutoRefreshEnabled: true,
      });
      setAppCheck(results);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        appCheck,
        authUser,
        isAuthenticated: !!authUser,
        isAuthLoading,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  return useContext(AuthContext);
}
