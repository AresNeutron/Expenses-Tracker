import axios from "axios";

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const accessToken = localStorage.getItem("access_token");
  if (!refreshToken || !accessToken) {
    alert("No tokens found. Please log in.");
    return;
  }
  try {
    // Send the refresh token to the backend for blacklisting
    await axios.post(
      "http://127.0.0.1:8000/api/logout/",
      {
        refresh: refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    alert("Logged out successfully");
  } catch (err) {
    console.error("Error during logout:", err);
  }
};
