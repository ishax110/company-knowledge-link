import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading";
import { useDownloadHistory } from "@/hooks/use-repository";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "Download history — Knowledge Repository" },
      {
        name: "description",
        content: "Audit trail of every document download recorded by the repository.",
      },
      { property: "og:title", content: "Download history — Knowledge Repository" },
      { property: "og:description", content: "Who downloaded which document, and when." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: history = [], isLoading, isError, refetch } = useDownloadHistory();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download history"
        description="Every download is recorded by the backend for auditing purposes."
      />

      <div className="panel overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <EmptyState
            icon={Download}
            title="History could not be loaded"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No downloads recorded yet"
            description="Download a document and the activity will show up here."
            action={
              <Button asChild variant="outline">
                <Link to="/documents">Browse documents</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead className="hidden md:table-cell">User</TableHead>
                  <TableHead>Downloaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => {
                  const doc = typeof entry.document === "object" ? entry.document : null;
                  const user = typeof entry.user === "object" ? entry.user : null;
                  return (
                    <TableRow key={entry._id}>
                      <TableCell>
                        {doc?._id ? (
                          <Link
                            to="/documents/$documentId"
                            params={{ documentId: doc._id }}
                            className="font-medium hover:underline"
                          >
                            {doc.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Removed document</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">
                        {user?.name ?? user?.email ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTime(entry.downloadedAt ?? entry.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
