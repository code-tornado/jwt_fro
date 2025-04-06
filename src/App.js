import "./App.css";

import { Suspense } from "react";
import AppRoutes from "./routes";

function App() {
  return (
    <Suspense>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
