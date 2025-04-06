import store from "../redux/store";
import { AUTH_ACTIONS } from "../redux/action-types";
import { setToken } from "../redux/actions";
import axios from "axios";

export class AuthService {

  static async refresh() {
    try {
      const { data } = await axios.post("/token/refresh/", {
        refresh: localStorage.getItem("refresh_token"),
      });
      store.dispatch(
        setToken({
          accessToken: data.access,
          refreshToken: data.refresh,
        })
      );
      return data;
    } catch {
      store.dispatch(setToken(null));
    }
  }

  static logout() {
    axios.post(
      "/api/logout/",
      {
        refresh_token: localStorage.getItem("refresh_token"),
      },
      { headers: { "Content-Type": "application/json" } },
      { withCredentials: true }
    );
    store.dispatch(setToken(null));
  }
}
