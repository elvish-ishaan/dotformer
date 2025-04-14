import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Define the API base URL
const API_BASE_URL = "http://localhost:5000";

// Types
interface User {
  id: string;
  name: string | null;
  email: string;
  bio?: string;
  username?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper to get token from localStorage or cookies
const getToken = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('token') || localStorage.getItem('token');
  }
  return null;
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? getToken() : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Helper to save token
const saveToken = (token: string) => {
  // Save in cookie for server-side access (middleware)
  Cookies.set('token', token, { 
    expires: 7, // 7 days
    path: '/',
    sameSite: 'Lax'
  });
  
  // Also save in localStorage for client-side access
  localStorage.setItem('token', token);
};

// Helper to remove token
const removeToken = () => {
  Cookies.remove('token');
  localStorage.removeItem('token');
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Login failed');
      }

      // Store token
      if (data.data?.token) {
        saveToken(data.data.token);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Registration failed');
      }

      // Store token
      if (data.data?.token) {
        saveToken(data.data.token);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token
      removeToken();
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, clear it
          removeToken();
        }
        return rejectWithValue(data.error || 'Failed to fetch user profile');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch user profile');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      saveToken(action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeToken();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
    
    // Fetch user profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If token is invalid, clear authentication
        if (action.payload === 'No authentication token' || 
            (typeof action.payload === 'string' && action.payload.includes('token'))) {
          state.isAuthenticated = false;
          state.token = null;
        }
      });
  },
});

export const { setCredentials, clearCredentials, clearError } = authSlice.actions;

export default authSlice.reducer; 