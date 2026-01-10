import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useApi = () => {
  const { token, getAuthHeaders } = useAuth();

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    
    // Add Content-Type for JSON body
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    return response;
  }, [token, getAuthHeaders]);

  return { apiCall, API_URL };
};

export default useApi;
