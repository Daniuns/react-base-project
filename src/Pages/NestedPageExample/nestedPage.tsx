import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useRepository } from "@/features/repositories/queries/repository.queries";

const NestedPage = () => {
  const navigate = useNavigate();
  const repositoryQuery = useRepository("TanStack", "query");

  if (repositoryQuery.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center" aria-busy="true">
        <p className="text-sm text-muted-foreground">Loading repository…</p>
      </main>
    );
  }

  if (repositoryQuery.isError) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-3 px-6">
        <h1 className="text-2xl font-semibold">Could not load the example</h1>
        <p className="text-sm text-destructive">
          {repositoryQuery.error.message}
        </p>
        <Button
          className="w-fit"
          onClick={() => void repositoryQuery.refetch()}
        >
          Try again
        </Button>
      </main>
    );
  }

  const repository = repositoryQuery.data;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 px-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {repository.fullName}
          </h1>
          {repositoryQuery.isFetching ? (
            <span className="text-xs text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>
        <p className="text-muted-foreground">
          {repository.description ?? "No description."}
        </p>
        <p className="text-sm">{repository.stars.toLocaleString()} stars</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void navigate("another-nested-page")}>
          Open nested route
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.open(repository.url, "_blank", "noopener,noreferrer")
          }
        >
          Open repository
        </Button>
      </div>

      <Outlet context={repository} />
    </main>
  );
};

export default NestedPage;
