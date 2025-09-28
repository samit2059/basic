'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode , useCallback,useMemo} from 'react';
import { getToken, removeToken, isTokenValid, AuthResponse } from '@/lib/auth';
import { getCurrentUser } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  token: string;
  // additional user fields if any
  bio?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // login: (token: string, userData: User) => void;
  setAuthData: (data: AuthResponse) => void;
  logout: () => void;
  // updateUser: (userData: User) => void;
}

// keys used for local storage
const AUTH_TOKEN_KEY = 'blog_auth_token';
const AUTH_USER_KEY = 'blog_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
// load session from local storage we have
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUserJson = localStorage.getItem(AUTH_USER_KEY);
    if(storedToken && storedUserJson ){
        try{
      const storedUser = JSON.parse(storedUserJson);// string into object
      setUser({...storedUser, token: storedToken}) // spread operator
    }
    catch(error){
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
    setIsLoading(false); // auth status is determined
  },[]);
  //   const initAuth = async () => {
  //     const token = getToken();
  //     if (token && isTokenValid(token)) {
  //       try {
  //         const userData = await getCurrentUser();
  //         setUser(userData);
  //         // setIsAuthenticated(true);
  //       } catch (error) {
  //         console.error('Failed to fetch user data:', error);
  //         removeToken();
  //       }
  //     }
  //     setIsLoading(false);
  //   };

  //   initAuth();
  // }, []);

  // save session to local storage
  const setAuthData = useCallback((data: AuthResponse) =>{
    // to store token and user in l.c
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

      const authenticatedUser: User = {
      ...data.user,
      token: data.token,
    };
    setUser(authenticatedUser);
  }, []);

  const login = (token: string, userData: User) => {
    setUser(userData);
    // setIsAuthenticated(true);
  };

  const removeTok = () =>{
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
  const logout = useCallback(() => {
    removeTok();
    // removeToken();
    setUser(null);
    // setIsAuthenticated(false);
  },[]);
const isAuthenticated = useMemo(() => !!user, [user]);

  // const updateUser = (userData: User) => {
  //   setUser(userData);
  // };

  const contextValue = useMemo(() =>({
    user,
    isAuthenticated,
    isLoading,
    setAuthData,
    logout,
  // updateUser,
  }), [user, isAuthenticated, isLoading, setAuthData, logout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};