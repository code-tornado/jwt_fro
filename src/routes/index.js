import { lazy, Suspense, useEffect } from "react";
import { Navigate, useNavigate, useRoutes } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider";
import { useAuthState, useSetRedirectTo } from "../hooks/redux";
import FullLayout from "../layouts/FullLayout";

const Login = lazy(() =>
  import("../component/auth/login").then((p) => ({ default: p.default }))
);

const CutOut = lazy(() =>
  import("../component/cutout").then((p) => ({ default: p.default }))
);

const CompareReport = lazy(() =>
  import("../component/compareRep").then((p) => ({ default: p.default }))
);

const AppRoute = ({ component: Component }) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

const AppRoutes = () => {
  const { tokens, redirectTo } = useAuthState();

  const navigate = useNavigate();
  const setRedirectTo = useSetRedirectTo();

  useEffect(() => {
    if (tokens?.accessToken && redirectTo && redirectTo !== "/login") {
      setRedirectTo("");
      navigate(redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, redirectTo]);

  const publicRoutes = useRoutes([
    {
      path: "/login",
      element: <AppRoute component={Login} />,
    },
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ]);

  const privateRoutes = useRoutes([
    {
      path: "/",
      element: <AppRoute component={CutOut} />,
    },
    {
      path: "/compare-report",
      element: <AppRoute component={CompareReport} />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <AuthProvider>
      {!tokens?.accessToken ? (
        publicRoutes
      ) : (
        <FullLayout>{privateRoutes}</FullLayout>
      )}
    </AuthProvider>
  );
};

export default AppRoutes;
