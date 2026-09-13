import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

const PrivatePage = () => {
  const { signOut } = useAuth();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-6">
      <p className="text-sm font-medium text-muted-foreground">
        Protected route
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Your session is active
      </h1>
      <p className="text-muted-foreground">
        This page is rendered only after the authentication provider restores a
        valid access token.
      </p>
      <Button className="w-fit" variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </main>
  );
};

export default PrivatePage;
