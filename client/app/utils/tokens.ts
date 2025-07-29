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

export const setupTokenRefresh = (): void => {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken);
    const expiresIn = decoded.exp! * 1000 - Date.now();
    console.log("Token expires in:", expiresIn);

    if (expiresIn > 0) {
      // Schedule refresh and re-run setup
      setTimeout(() => {
        refreshToken()
          .then(() => setupTokenRefresh())
          .catch((err) => console.error("Token refresh failed:", err));
      }, expiresIn - 60000);
    } else {
      // Refresh immediately and re-run setup
      refreshToken()
        .then(() => setupTokenRefresh())
        .catch((err) => console.error("Token refresh failed:", err));
    }
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
