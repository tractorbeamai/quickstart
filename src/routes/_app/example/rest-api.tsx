import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/example/rest-api")({
  component: TanStackQueryDemo,
});

interface Person {
  name: string;
  height: string;
  birth_year: string;
}

const skeletonRows = ["a", "b", "c", "d", "e"];

function TanStackQueryDemo() {
  // A plain client-side fetch from a public REST API, cached by TanStack Query.
  const { data: people, isPending } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await fetch("https://swapi.dev/api/people");
      const body: { results: Person[] } = await response.json();
      return body.results;
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col py-8">
      <Card>
        <CardHeader>
          <CardTitle>Star Wars characters</CardTitle>
          <CardDescription>
            Fetched in the browser from the public SWAPI REST API with TanStack Query.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Height (cm)</TableHead>
                <TableHead>Birth year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? skeletonRows.map((row) => (
                    <TableRow key={row}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : people?.map((person) => (
                    <TableRow key={person.name}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.height}</TableCell>
                      <TableCell>{person.birth_year}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
