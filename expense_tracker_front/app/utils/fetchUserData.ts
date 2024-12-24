import axios from "axios";

// Fetch user data
export const fetchUserData = async () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the user data
    } catch (err) {
      console.error(err);
      return null; // Return null if there's an error
    }
  }
  return null; // Return null if no token is found
};

export const getUserName = async () => {
  const userData = await fetchUserData();
  if (userData) {
    return userData.username; // Return the username
  } else {
    return null; // If no user data is fetched, return null
  }
};
