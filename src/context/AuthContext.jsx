import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToAuth,
  signIn,
  register as registerUser,
  logOut,
  switchDemoUser
} from '../firebase/authService';
import { isLiveFirebase, configSource } from '../firebase/config';
import { DEMO_USERS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await signIn(email, password);
  };

  const register = async (email, password, displayName, campusRole) => {
    return await registerUser(email, password, displayName, campusRole);
  };

  const logout = async () => {
    return await logOut();
  };

  const selectDemoUser = (userIndexOrId) => {
    return switchDemoUser(userIndexOrId);
  };

  const value = {
    currentUser,
    loading,
    isLiveFirebase,
    configSource,
    demoUsers: DEMO_USERS,
    login,
    register,
    logout,
    selectDemoUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
