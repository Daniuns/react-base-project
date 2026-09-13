import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          React base project
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          A production-minded React foundation
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Vite, TypeScript, TanStack Query, shadcn/ui and a tested token refresh
          flow are ready to adapt to your next application.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void navigate("/creatures")}>
          Creatures example
        </Button>
        <Button variant="outline" onClick={() => void navigate("/nested-page")}>
          Nested route example
        </Button>
        <Button variant="outline" onClick={() => void navigate("/private")}>
          Protected route
        </Button>
      </div>
    </main>
  );
};

export default Home;
