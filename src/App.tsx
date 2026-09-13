import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AuthProvider } from "@/features/auth/auth-provider";
import { queryClient } from "@/lib/query-client";
import { AppRouter } from "@/Router/appRouter";

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
