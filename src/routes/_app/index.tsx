import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col gap-4 py-16">
      <p className="text-sm font-medium text-muted-foreground">Tractorbeam Quickstart</p>
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">Start building.</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        A lightweight React starter with working examples and a focused set of defaults.
      </p>
    </div>
  );
}
