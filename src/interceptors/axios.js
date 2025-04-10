import axios from "axios";
import { AuthService } from "../services";

// Set the base URL for all requests
axios.defaults.baseURL = "https://cutoutbison.ca/";

// Set the Authorization header for all requests
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  "access_token"
)}`;

// Set Content-Type header globally
axios.defaults.headers.common["Content-Type"] = "application/json";

// Interceptor to refresh token if 401 Unauthorized occurs
let refresh = false;
axios.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    if (error.response && error.response.status === 401 && !refresh) {
      refresh = true;
      try {
        // Attempt to refresh the access token
        const data = await AuthService.refresh();
        if (data?.access) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.access}`;
          return axios(error.config); // Retry the failed request
        }
      } catch (refreshError) {
        console.error("Refresh token invalid or expired", refreshError);
        localStorage.clear(); // Clear tokens if refresh fails
      }
    }
    refresh = false;
    return Promise.reject(error); // Reject the promise for other errors
  }
);
