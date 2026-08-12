import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, LayoutGrid, List, SearchX, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { PaginationBar } from "@/components/common/pagination-bar";
import { CardsSkeleton, TableSkeleton } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentCard } from "@/components/documents/document-card";
import { useDocuments } from "@/hooks/use-repository";
import { useDocumentActions } from "@/hooks/use-document-actions";
import type { DocumentItem } from "@/types/api";

type SortValue = "newest" | "oldest" | "title-asc" | "title-desc";

const SORT_OPTIONS: Record<SortValue, { sortBy: string; order: "asc" | "desc"; label: string }> = {
  newest: { sortBy: "createdAt", order: "desc", label: "Newest first" },
  oldest: { sortBy: "createdAt", order: "asc", label: "Oldest first" },
  "title-asc": { sortBy: "title", order: "asc", label: "Title A–Z" },
  "title-desc": { sortBy: "title", order: "desc", label: "Title Z–A" },
};

export const Route = createFileRoute("/_app/documents/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string | undefined; page?: number; limit?: number; sort?: SortValue } => ({
    q: typeof search["q"] === "string" && search["q"] ? (search["q"] as string) : undefined,
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    limit: [10, 20, 50].includes(Number(search["limit"])) ? Number(search["limit"]) : 10,
    sort: (Object.keys(SORT_OPTIONS).includes(String(search["sort"]))
      ? String(search["sort"])
      : "newest") as SortValue,
  }),

  head: () => ({
    meta: [
      { title: "Documents — Knowledge Repository" },
      {
        name: "description",
        content: "Browse, search, sort and manage every document in the company repository.",
      },
      { property: "og:title", content: "Documents — Knowledge Repository" },
      {
        property: "og:description",
        content: "Server-side search, sorting and pagination across company documents.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { q, page, limit, sort } = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "grid">("table");
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null);
  const { download, remove, downloadingId, deletingId } = useDocumentActions();

  const sortConfig = SORT_OPTIONS[sort as SortValue];
  const query = useDocuments({
    page,
    limit,
    sortBy: sortConfig.sortBy,
    order: sortConfig.order,
    ...(q ? { keyword: q } : {}),
  });

  const documents = query.data?.documents ?? [];
  const searching = Boolean(q);

  type SearchUpdate = {
    q?: string | undefined;
    page?: number;
    limit?: number;
    sort?: SortValue;
  };

  function updateSearch(next: SearchUpdate) {
    navigate({
      to: "/documents",
      search: (prev: Record<string, unknown>) => ({ ...prev, ...next }),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Everything stored in the repository, searchable and paginated on the server."
        actions={
          <Button asChild>
            <Link to="/upload">
              <Upload className="size-4" /> Upload document
            </Link>
          </Button>
        }
      />

      <div className="panel space-y-4 p-4">
        <SearchBar
          value={q ?? ""}
          onChange={(value) => updateSearch({ q: value.trim() || undefined, page: 1 })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(value) => updateSearch({ sort: value as SortValue, page: 1 })}>
              <SelectTrigger className="h-9 w-[170px]" aria-label="Sort documents">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                  <SelectItem key={value} value={value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {searching ? (
              <span className="text-sm text-muted-foreground">
                Results for <span className="font-medium text-foreground">“{q}”</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              aria-label="Card view"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {query.isLoading ? (
        view === "table" ? (
          <div className="panel overflow-hidden">
            <TableSkeleton />
          </div>
        ) : (
          <CardsSkeleton />
        )
      ) : query.isError ? (
        <div className="panel">
          <EmptyState
            icon={FileText}
            title="Documents could not be loaded"
            description="The repository service returned an error. Check your connection and retry."
            action={
              <Button variant="outline" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : documents.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={searching ? SearchX : FileText}
            title={searching ? "No matching documents" : "No documents yet"}
            description={
              searching
                ? `Nothing matched “${q}”. Try a different keyword, category or tag.`
                : "Upload your first document to start building the repository."
            }
            action={
              searching ? (
                <Button variant="outline" onClick={() => updateSearch({ q: undefined, page: 1 })}>
                  Clear search
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="size-4" /> Upload document
                  </Link>
                </Button>
              )
            }
          />
        </div>
      ) : view === "table" ? (
        <div className="panel overflow-hidden">
          <DocumentTable
            documents={documents}
            onDownload={download}
            onDelete={setPendingDelete}
            downloadingId={downloadingId}
          />
          <PaginationBar
            currentPage={query.data?.currentPage ?? page}
            totalPages={query.data?.totalPages ?? 1}
            totalDocuments={query.data?.totalDocuments ?? documents.length}
            pageSize={query.data?.pageSize ?? limit}
            onPageChange={(next) => updateSearch({ page: next })}
            onPageSizeChange={(size) => updateSearch({ limit: size, page: 1 })}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDownload={download}
                onDelete={setPendingDelete}
                downloading={downloadingId === doc._id}
              />
            ))}
          </div>
          <div className="panel">
            <PaginationBar
              currentPage={query.data?.currentPage ?? page}
              totalPages={query.data?.totalPages ?? 1}
              totalDocuments={query.data?.totalDocuments ?? documents.length}
              pageSize={query.data?.pageSize ?? limit}
              onPageChange={(next) => updateSearch({ page: next })}
              onPageSizeChange={(size) => updateSearch({ limit: size, page: 1 })}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this document?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” and its stored file will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete document"
        loading={Boolean(pendingDelete && deletingId === pendingDelete._id)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const ok = await remove(pendingDelete);
          if (ok) setPendingDelete(null);
        }}
      />
    </div>
  );
}
