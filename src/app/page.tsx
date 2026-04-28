import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Viridis Media
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Project management dashboard
        </h1>
        <p className="text-muted-foreground">
          Stage 1 scaffold is up. Auth, workspaces, and the kanban board are coming next.
        </p>
      </div>
      <div className="flex gap-3">
        <Button>Primary action</Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </main>
  );
}
