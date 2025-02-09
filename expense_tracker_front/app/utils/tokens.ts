import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (refresh) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          refresh: refresh,
        }
      );

      alert("Token refreshed successfully");
      // Update localStorage with the new tokens
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error("No refresh token available");
  }
};

export const setupTokenRefresh = (): void => {
  const accessToken = localStorage.getItem("access_token"); // Correcting the key to match refreshToken

  if (accessToken) { 
    const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken); // Type-safe decoding
    const expiresIn = decoded.exp! * 1000 - Date.now(); // `exp` is in seconds, convert to ms
    console.log("Token expires in:", expiresIn); // Debugging

    if (expiresIn > 0) {
      // Schedule refresh and re-run setup
      setTimeout(() => {
        refreshToken()
          .then(() => setupTokenRefresh()) // Only re-run setup after successful refresh
          .catch((err) => console.error("Token refresh failed:", err));
      }, expiresIn - 60000); // Refresh 1 minute before expiration
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
      return decoded.exp! * 1000 > Date.now(); // Check if the token is still valid
    } catch (err) {
      console.error("Invalid token:", err);
      return false;
    }
  }
  return false;
};