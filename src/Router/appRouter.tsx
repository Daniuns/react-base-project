import { Routes } from "react-router";
import NestedPageRoutes from "@/Pages/NestedPageExample/routes";
import HomeRoutes from "@/Pages/Home/routes";
import LoginRoutes from "@/Pages/Login/routes";
import PrivatePageRoutes from "@/Pages/PrivatePageExample/routes";

export const AppRouter = () => (
  <Routes>
    {HomeRoutes()}
    {LoginRoutes()}
    {NestedPageRoutes()}
    {PrivatePageRoutes()}
  </Routes>
);
