import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const refreshToken = async (): Promise<string> => {
  const refresh = localStorage.getItem("refresh_token");
  if (refresh) {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/token/refresh/`,
        {
          refresh: refresh,
        }
      );
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      return response.data.access;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        const errorDetail = err.response.data?.detail; 

        if (statusCode === 404 && errorDetail === "User associated with refresh token does not exist. Please log in again.") {
          console.log("Refresh token error: User does not exist (404).");
          throw new Error("User associated with refresh token does not exist. Please log in again.");
        } else if (statusCode === 401 || statusCode === 400) {
          // Si el backend devuelve 401 o 400 por token inválido/expirado
          console.log("Refresh token invalid or expired (401/400).");
          throw new Error("Refresh token invalid or expired. Please log in again.");
        }
      }
      throw err;
    }
  } else {
    console.log("No refresh token available");
    throw new Error("No refresh token available. Please log in.");
  }
};

let refreshTimeout: NodeJS.Timeout | null = null;

export const setupTokenRefresh = (): void => {
  // Clear any existing timeout to prevent duplicates
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  const accessToken = localStorage.getItem("access_token");

  if (accessToken && isTokenValid()) {
    try {
      const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const expiresIn = decoded.exp! * 1000 - Date.now();
      
      // Schedule refresh 1 minute before expiration (minimum 60 seconds from now)
      const refreshTime = Math.max(expiresIn - 60000, 10000); // At least 10 seconds from now
      
      console.log(`Token refresh scheduled in ${Math.floor(refreshTime / 1000)} seconds`);
      
      refreshTimeout = setTimeout(async () => {
        try {
          await refreshToken();
          setupTokenRefresh(); // Setup next refresh cycle
        } catch (err) {
          console.error("Scheduled token refresh failed:", err);
          // Clear tokens on refresh failure
          clearAuthTokens();
          // Redirect to login page
          window.location.href = "/";
        }
      }, refreshTime);
    } catch (err) {
      console.error("Error setting up token refresh:", err);
    }
  }
};

export const clearTokenRefresh = (): void => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  clearTokenRefresh();
};

export const checkAuthenticationStatus = async (): Promise<boolean> => {
  const refreshTokenValue = localStorage.getItem("refresh_token");
  
  // No refresh token means user is not authenticated
  if (!refreshTokenValue) {
    return false;
  }

  // Check if current access token is valid
  if (isTokenValid()) {
    // Token is valid, setup automatic refresh and return authenticated
    setupTokenRefresh();
    return true;
  }

  // Access token is expired or invalid, try to refresh
  try {
    await refreshToken();
    // Refresh successful, setup automatic refresh
    setupTokenRefresh();
    return true;
  } catch (error) {
    // Refresh failed, clear all tokens
    console.log("Authentication failed during token refresh:", error);
    clearAuthTokens();
    return false;
  }
};

export const isTokenValid = (): boolean => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    try {
      const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      return decoded.exp! * 1000 > Date.now();
    } catch (err) {
      console.error("Invalid token:", err);
      return false;
    }
  }
  return false;
};
