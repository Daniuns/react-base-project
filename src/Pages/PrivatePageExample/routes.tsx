import { Route } from "react-router";
import PrivatePage from "./privatePage";
import ProtectedRoute from "@/Router/protectedRoute";

const PrivatePageRoutes = () => {
  return (
    <Route
      path="/private"
      element={
        <ProtectedRoute>
          <PrivatePage />
        </ProtectedRoute>
      }
    />
  );
};

export default PrivatePageRoutes;
