// Konfigurasi API untuk Laravel Backend
export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  LOGOUT: `${API_BASE_URL}/logout`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/user`,
  USER_UPDATE: `${API_BASE_URL}/user/update`,
  
  // Movies endpoints
  MOVIES: `${API_BASE_URL}/movies`,
  MOVIE_DETAIL: (id) => `${API_BASE_URL}/movies/${id}`,
  
  // Schedules endpoints
  SCHEDULES: `${API_BASE_URL}/schedules`,
  
  // Bookings endpoints
  BOOKINGS: `${API_BASE_URL}/bookings`,
  BOOKING_HISTORY: `${API_BASE_URL}/bookings/history`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_MOVIES: `${API_BASE_URL}/admin/movies`,
  ADMIN_SCHEDULES: `${API_BASE_URL}/admin/schedules`,
};

// Helper function untuk membuat request dengan token
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
      // Token expired atau tidak valid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};