import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useAuthState,
  useSetRedirectTo,
} from "../../hooks/redux";
import { AuthService } from "../../services";

export const ACCESS_TOKEN_KEY =
  process.env.REACT_APP_ACCESS_TOKEN || "access_token";
export const REFRESH_TOKEN_KEY =
  process.env.REACT_APP_REFRESH_TOKEN || "refresh_token";

const AuthProvider = ({ children }) => {
  const { tokens } = useAuthState();
  const setRedirectTo = useSetRedirectTo();
  const location = useLocation();

  useEffect(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (refreshToken) {
      AuthService.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tokens === undefined || !tokens?.accessToken || !tokens?.refreshToken) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }, [tokens]);

  useEffect(() => {
    if (!tokens?.accessToken && location.pathname !== "/login") {
      setRedirectTo(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, tokens]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default AuthProvider;
