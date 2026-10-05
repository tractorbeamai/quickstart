import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/example/rest-api")({
  component: TanStackQueryDemo,
});

function TanStackQueryDemo() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json() as Promise<{ results: { name: string }[] }>)
        .then((d) => d.results),
    initialData: [],
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl">People list from Swapi</h1>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}
