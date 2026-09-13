import { useOutletContext } from "react-router";
import type { Repository } from "@/features/repositories/api/repository.schemas";

const AnotherNestedPage = () => {
  const repository = useOutletContext<Repository>();

  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground">
      <h2 className="font-medium">Nested route</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        It reuses {repository.fullName} from the parent outlet context without a
        second observer or request.
      </p>
    </section>
  );
};

export default AnotherNestedPage;
