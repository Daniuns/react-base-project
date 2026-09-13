import { Route } from "react-router";
import Home from "./home";

const HomeRoutes = () => {
  return <Route path="/" element={<Home />} />;
};

export default HomeRoutes;
