import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { LoadingSpinner } from "@/components/common/loading";
import { useDocument } from "@/hooks/use-repository";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { categoryOf, fileExtension, formatBytes, formatDateTime, tagsOf } from "@/lib/format";

export const Route = createFileRoute("/_app/documents/$documentId/")({
  head: () => ({
    meta: [
      { title: "Document details — Knowledge Repository" },
      {
        name: "description",
        content: "Full metadata, file information and actions for a repository document.",
      },
      { property: "og:title", content: "Document details — Knowledge Repository" },
      {
        property: "og:description",
        content: "View, download, edit or delete a company document.",
      },
    ],
  }),
  component: DocumentDetailsPage,
});

function DocumentDetailsPage() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const { data: doc, isLoading, isError, error, refetch } = useDocument(documentId);
  const { download, remove, downloadingId, deletingId } = useDocumentActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="panel space-y-4 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="panel">
        <EmptyState
          icon={FileText}
          title="Document unavailable"
          description={
            (error as Error | null)?.message ??
            "This document could not be loaded. It may have been deleted."
          }
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button asChild>
                <Link to="/documents">Back to documents</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const category = categoryOf(doc);
  const tags = tagsOf(doc);

  const meta: Array<{ label: string; value: string }> = [
    { label: "Original filename", value: doc.originalName ?? doc.filename ?? "—" },
    { label: "File type", value: fileExtension(doc) },
    { label: "MIME type", value: doc.mimeType ?? "—" },
    { label: "File size", value: formatBytes(doc.size) },
    { label: "Created", value: formatDateTime(doc.createdAt) },
    { label: "Last updated", value: formatDateTime(doc.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/documents">
          <ArrowLeft className="size-4" /> Back to documents
        </Link>
      </Button>

      <div className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <FileText className="size-6" />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {doc.description || "No description provided."}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {category ? <Badge variant="secondary">{category.name}</Badge> : null}
                {tags.map((tag) => (
                  <Badge key={tag._id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {doc.filePath ? (
              <Button variant="outline" asChild>
                <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" /> Open
                </a>
              </Button>
            ) : null}
            <Button onClick={() => download(doc)} disabled={downloadingId === doc._id}>
              {downloadingId === doc._id ? <LoadingSpinner /> : <Download className="size-4" />}
              Download
            </Button>
            <Button variant="outline" asChild>
              <Link to="/documents/$documentId/edit" params={{ documentId: doc._id }}>
                <Pencil className="size-4" /> Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-muted/40 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this document?"
        description={`“${doc.title}” and its stored file will be permanently removed.`}
        confirmLabel="Delete document"
        loading={deletingId === doc._id}
        onConfirm={async () => {
          const ok = await remove(doc);
          if (ok) {
            setConfirmOpen(false);
            navigate({ to: "/documents" });
          }
        }}
      />
    </div>
  );
}
