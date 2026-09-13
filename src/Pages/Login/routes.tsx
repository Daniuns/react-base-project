import { Route } from "react-router";
import Login from "./login";

const LoginRoutes = () => {
  return <Route path="/login" element={<Login />} />;
};

export default LoginRoutes;
