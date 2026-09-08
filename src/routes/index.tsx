import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard";
import { getSnapshot } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getSnapshot();
    } catch {
      return null;
    }
  },
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <Dashboard initial={initial} />;
}
