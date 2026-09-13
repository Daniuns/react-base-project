import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login, type LoginCredentials } from "./auth-api";
import { AuthContext, type AuthStatus } from "./auth-context";
import { subscribeToSessionExpired } from "./auth-events";
import { authenticatedApi } from "@/services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearAuthenticatedState = useCallback(() => {
    queryClient.clear();
    setStatus("anonymous");
  }, [queryClient]);

  useEffect(
    () => subscribeToSessionExpired(clearAuthenticatedState),
    [clearAuthenticatedState],
  );

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!authenticatedApi.hasSession()) {
        setStatus("anonymous");
        return;
      }

      try {
        await authenticatedApi.ensureAccessToken();

        if (active) {
          setStatus("authenticated");
        }
      } catch {
        if (active) {
          setStatus("anonymous");
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await login(credentials);
    authenticatedApi.setTokens(tokens);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    authenticatedApi.clearSession();
    clearAuthenticatedState();
  }, [clearAuthenticatedState]);

  const value = useMemo(
    () => ({ status, signIn, signOut }),
    [signIn, signOut, status],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
