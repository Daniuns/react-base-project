import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/features/auth/use-auth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center" aria-busy="true">
        <p className="text-sm text-muted-foreground">Restoring session…</p>
      </main>
    );
  }

  if (status === "anonymous") {
    return (
      <Navigate
        to="/login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
