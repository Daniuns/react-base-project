import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Replace with the project's observability provider.
    console.error("Uncaught application error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-dvh place-items-center px-6">
          <section className="max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              Reload the page. If the problem persists, contact support.
            </p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
