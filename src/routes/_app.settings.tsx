import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/api/apiClient";
import { initialsOf } from "@/lib/format";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Profile & settings — Knowledge Repository" },
      {
        name: "description",
        content: "Your account details, role and repository connection settings.",
      },
      { property: "og:title", content: "Profile & settings — Knowledge Repository" },
      { property: "og:description", content: "Account information and session controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile & settings" description="Your account and workspace details." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initialsOf(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{user?.name ?? "—"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
              <Badge variant="secondary" className="mt-2">
                {user?.role ?? "USER"}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="truncate font-mono text-xs">{user?.id ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{user?.role ?? "USER"}</dd>
            </div>
          </dl>

          <Button variant="outline" className="mt-6" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Connection</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This client talks to the Knowledge Repository API. The endpoint is configured through the
            <span className="font-mono"> VITE_API_BASE_URL</span> environment variable.
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">API base URL</dt>
              <dd className="mt-1 break-all font-mono text-xs">{API_BASE_URL}</dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Upload constraints
              </dt>
              <dd className="mt-1">PDF, DOC, DOCX, PPT, PPTX · max 10 MB per file</dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Session handling
              </dt>
              <dd className="mt-1">
                Your access token is kept in browser storage and cleared automatically when the
                server rejects it.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
