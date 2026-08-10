import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/common/loading";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Knowledge Repository — Internal Document Hub" },
      {
        name: "description",
        content:
          "Upload, organise, search and share company documents in one secure internal knowledge repository.",
      },
      { property: "og:title", content: "Knowledge Repository — Internal Document Hub" },
      {
        property: "og:description",
        content: "Secure internal document management: upload, categorise, search and download.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) return;
    navigate({ to: isAuthenticated ? "/dashboard" : "/login", replace: true });
  }, [isReady, isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
      <LoadingSpinner /> Opening Knowledge Repository…
    </div>
  );
}
