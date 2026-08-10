import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { LoadingSpinner } from "@/components/common/loading";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { isAuthenticated, isReady, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true });
    }
  }, [isReady, isAuthenticated, navigate, pathname]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    logout();
    navigate({ to: "/login", replace: true });
  }

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoadingSpinner /> Loading workspace…
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar onSignOut={handleSignOut} />
        <SidebarInset className="min-w-0">
          <TopBar onSignOut={handleSignOut} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
