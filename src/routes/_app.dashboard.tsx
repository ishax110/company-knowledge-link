import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  FolderTree,
  Tags as TagsIcon,
  Upload,
  Download,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsSkeleton, TableSkeleton } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { SearchBar } from "@/components/common/search-bar";
import {
  useCategories,
  useDocuments,
  useDownloadHistory,
  useTags,
} from "@/hooks/use-repository";
import { categoryOf, formatBytes, formatDate, formatDateTime } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";
import type { DocumentItem } from "@/types/api";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Knowledge Repository" },
      {
        name: "description",
        content: "Overview of company documents, categories, tags and recent activity.",
      },
      { property: "og:title", content: "Dashboard — Knowledge Repository" },
      {
        property: "og:description",
        content: "Document statistics, recent uploads and quick actions.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const recent = useDocuments({ page: 1, limit: 6, sortBy: "createdAt", order: "desc" });
  const categories = useCategories();
  const tags = useTags();
  const history = useDownloadHistory();

  const documents = recent.data?.documents ?? [];
  const totalSize = documents.reduce((sum, doc) => sum + (doc.size ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live overview of everything stored in your company knowledge repository."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/documents">
                <FileText className="size-4" /> Browse documents
              </Link>
            </Button>
            <Button asChild>
              <Link to="/upload">
                <Upload className="size-4" /> Upload document
              </Link>
            </Button>
          </>
        }
      />

      <div className="panel p-4">
        <SearchBar
          value=""
          onChange={(value) => {
            if (value.trim()) navigate({ to: "/documents", search: { q: value.trim(), page: 1 } });
          }}
          placeholder="Search the whole repository — title, description, category or tag"
        />
      </div>

      {recent.isLoading || categories.isLoading || tags.isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total documents"
            value={recent.data?.totalDocuments ?? 0}
            hint={`${recent.data?.totalPages ?? 0} pages at ${recent.data?.pageSize ?? 0} per page`}
            icon={FileText}
          />
          <StatCard
            label="Categories"
            value={categories.data?.length ?? 0}
            hint="Available classification buckets"
            icon={FolderTree}
          />
          <StatCard
            label="Tags"
            value={tags.data?.length ?? 0}
            hint="Cross-cutting labels"
            icon={TagsIcon}
          />
          <StatCard
            label="Recorded downloads"
            value={history.data?.length ?? 0}
            hint="Across all users"
            icon={Download}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent documents</h2>
              <p className="text-sm text-muted-foreground">
                Newest uploads across the repository
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/documents">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </header>

          {recent.isLoading ? (
            <TableSkeleton rows={5} />
          ) : recent.isError ? (
            <EmptyState
              icon={FileText}
              title="Documents could not be loaded"
              description="The repository service did not respond. Try again in a moment."
              action={
                <Button variant="outline" onClick={() => recent.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload the first document to start building your repository."
              action={
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="size-4" /> Upload document
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((doc: DocumentItem) => (
                <li key={doc._id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/documents/$documentId"
                      params={{ documentId: doc._id }}
                      className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {categoryOf(doc)?.name ?? "Uncategorised"} · {formatBytes(doc.size)}
                    </p>
                  </div>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">
                    {formatDate(doc.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="font-semibold">Library snapshot</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Storage in recent uploads</dt>
                <dd className="font-medium">{formatBytes(totalSize)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Average file size</dt>
                <dd className="font-medium">
                  {documents.length ? formatBytes(Math.round(totalSize / documents.length)) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Max upload size</dt>
                <dd className="font-medium">10 MB</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(categories.data ?? []).slice(0, 6).map((category) => (
                <Badge key={category._id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold">Latest downloads</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/history">
                  <Clock className="size-4" /> History
                </Link>
              </Button>
            </header>
            {history.isLoading ? (
              <TableSkeleton rows={3} />
            ) : (history.data ?? []).length === 0 ? (
              <EmptyState
                icon={Download}
                title="No downloads recorded"
                description="Download activity will appear here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {(history.data ?? []).slice(0, 5).map((entry) => {
                  const doc = typeof entry.document === "object" ? entry.document : null;
                  return (
                    <li key={entry._id} className="px-5 py-3">
                      <p className="line-clamp-1 text-sm font-medium">
                        {doc?.title ?? "Removed document"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(entry.downloadedAt ?? entry.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
