import Cookies from 'js-cookie';

/**
 * Get the authentication token from multiple sources (localStorage and cookies)
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First try to get from cookies (this works for server-side rendering)
  const cookieToken = Cookies.get('token');
  if (cookieToken) return cookieToken;
  
  // Then try localStorage
  return localStorage.getItem('token') || localStorage.getItem('authToken');
}

/**
 * Fetch with authentication token
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  console.log('Using auth token:', token ? 'Token exists' : 'No token');
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  try {
    console.log(`Making authenticated request to: ${url}`);
    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(`Network error while fetching ${url}:`, error);
    // Create a Response object to maintain the expected return type
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Network error: Unable to connect to the server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Set the authentication token in localStorage and cookies
 * @param token The token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  // Save in cookie for server-side access
  Cookies.set('token', token, { 
    expires: 7, // 7 days
    path: '/',
    sameSite: 'Lax'
  });
  
  // Also save in localStorage for client-side access
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token); // For backward compatibility
}

/**
 * Remove the authentication token from localStorage and cookies
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  // Remove from cookies
  Cookies.remove('token');
  
  // Remove from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
} 