import axios from "axios"

// Importa la URL del backend desde el entorno
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

// Fetch user data
export const fetchUserData = async () => {
  const token = localStorage.getItem("access_token")
  if (token) {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me/`, {
        // Endpoint actualizado
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Return the user data
    } catch (err) {
      console.error("Error fetching user data:", err) // Mensaje de error más específico
      return null // Return null if there's an error
    }
  }
  return null // Return null if no token is found
}

export const getUserName = async () => {
  const userData = await fetchUserData()
  if (userData) {
    return userData.username // Return the username
  } else {
    return null // If no user data is fetched, return null
  }
}

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token")
  const accessToken = localStorage.getItem("access_token")

  try {
    if (refreshToken && accessToken) {
      await axios.post(
        `${BACKEND_URL}/api/auth/logout/`,
        { refresh: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
    }
  } catch (err) {
    console.error("Error during logout:", err)
  } finally {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }
}
