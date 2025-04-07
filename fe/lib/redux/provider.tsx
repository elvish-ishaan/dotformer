'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { ReactNode, useEffect } from 'react';
import { fetchUserProfile } from './slices/authSlice';

export function ReduxProvider({ children }: { children: ReactNode }) {
  // Initialize auth state on app load
  useEffect(() => {
    // Check for token and fetch user profile if token exists
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(fetchUserProfile());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
} 