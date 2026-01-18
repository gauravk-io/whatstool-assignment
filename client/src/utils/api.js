const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Get JWT token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Set JWT token in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem("token");
};

/**
 * Decode JWT token to get user info
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get user info from token
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getUserFromToken();
  return user && user.role === "admin";
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
};

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

/**
 * Auth API calls
 */
export const authAPI = {
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
};

/**
 * Team API calls
 */
export const teamAPI = {
  getTeam: async () => {
    return apiRequest("/team");
  },

  inviteMember: async (email) => {
    return apiRequest("/invite", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  removeMember: async (userId) => {
    return apiRequest(`/team/${userId}`, {
      method: "DELETE",
    });
  },

  getInvitation: async (token) => {
    return apiRequest(`/invite/${token}`);
  },

  acceptInvitation: async (token, name, password) => {
    return apiRequest("/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token, name, password }),
    });
  },
};
