import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Creature } from "@/features/creatures/api/creature.schemas";
import {
  useCreature,
  useCreatureNames,
} from "@/features/creatures/queries/creature.queries";

const pageSize = 100;

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold">{value ?? "—"}</dd>
    </div>
  );
}

function CreatureDetails({ creature }: { creature: Creature }) {
  return (
    <article className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          {creature.bestiaryClass ?? creature.creatureClass ?? "Creature"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          {creature.name}
        </h2>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DetailItem
          label="Hit points"
          value={creature.hitPoints?.toLocaleString()}
        />
        <DetailItem
          label="Experience"
          value={creature.experience?.toLocaleString()}
        />
        <DetailItem label="Attack" value={creature.attackType} />
        <DetailItem label="Occurrence" value={creature.occurrence} />
        <DetailItem label="Bestiary" value={creature.bestiaryLevel} />
        <DetailItem label="Speed" value={creature.speed} />
      </dl>

      {creature.description ? (
        <div className="space-y-2">
          <h3 className="font-semibold">About</h3>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {creature.description}
          </p>
        </div>
      ) : null}
    </article>
  );
}

const Creatures = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const namesQuery = useCreatureNames();
  const creatureQuery = useCreature(selectedName);

  const filteredNames = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const names = namesQuery.data ?? [];

    if (!normalizedSearch) {
      return names;
    }

    return names.filter((name) =>
      name.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [namesQuery.data, search]);

  const pageCount = Math.max(1, Math.ceil(filteredNames.length / pageSize));
  const visibleNames = filteredNames.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => void navigate("/")}
          >
            <ArrowLeft />
            Back to home
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tibia creatures
          </h1>
          <p className="text-muted-foreground">
            Select a creature to load its details from TibiaWiki.
          </p>
        </div>
      </header>

      <div className="grid min-h-[38rem] overflow-hidden rounded-xl border bg-card lg:grid-cols-[22rem_1fr]">
        <section
          className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0"
          aria-labelledby="creature-list-title"
        >
          <div className="space-y-3 border-b p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="creature-list-title" className="font-semibold">
                Creatures
              </h2>
              {namesQuery.data ? (
                <span className="text-xs text-muted-foreground">
                  {filteredNames.length.toLocaleString()} results
                </span>
              ) : null}
            </div>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                className="pl-9"
                placeholder="Search creatures…"
                aria-label="Search creatures"
              />
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-2 lg:h-[31rem]">
            {namesQuery.isPending ? (
              <p className="p-3 text-sm text-muted-foreground" aria-busy="true">
                Loading creatures…
              </p>
            ) : null}

            {namesQuery.isError ? (
              <div className="space-y-3 p-3">
                <p className="text-sm text-destructive">
                  Could not load the creatures.
                </p>
                <Button size="sm" onClick={() => void namesQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : null}

            {namesQuery.isSuccess && visibleNames.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                No creatures found.
              </p>
            ) : null}

            {visibleNames.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={selectedName === name}
                className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                onClick={() => setSelectedName(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {namesQuery.isSuccess && filteredNames.length > pageSize ? (
            <div className="flex items-center justify-between border-t p-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </section>

        <section
          className="grid min-h-96 place-items-center p-6 sm:p-10"
          aria-live="polite"
        >
          {!selectedName ? (
            <div className="max-w-sm space-y-2 text-center">
              <h2 className="text-xl font-semibold">Choose a creature</h2>
              <p className="text-sm text-muted-foreground">
                Its details will appear here without reloading the page.
              </p>
            </div>
          ) : null}

          {creatureQuery.isPending && selectedName ? (
            <p className="text-sm text-muted-foreground" aria-busy="true">
              Loading {selectedName}…
            </p>
          ) : null}

          {creatureQuery.isError ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-destructive">
                Could not load {selectedName}.
              </p>
              <Button onClick={() => void creatureQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : null}

          {creatureQuery.isSuccess ? (
            <CreatureDetails creature={creatureQuery.data} />
          ) : null}
        </section>
      </div>
    </main>
  );
};

export default Creatures;
