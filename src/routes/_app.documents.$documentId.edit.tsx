import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { DocumentForm } from "@/components/documents/document-form";
import { documentApi, type DocumentPayload } from "@/api/documentApi";
import { normalizeError, type ApiError } from "@/api/apiClient";
import { useDocument } from "@/hooks/use-repository";
import { categoryOf, tagsOf } from "@/lib/format";

export const Route = createFileRoute("/_app/documents/$documentId/edit")({
  head: () => ({
    meta: [
      { title: "Edit document — Knowledge Repository" },
      {
        name: "description",
        content: "Update document metadata or replace the stored file in the repository.",
      },
      { property: "og:title", content: "Edit document — Knowledge Repository" },
      {
        property: "og:description",
        content: "Change title, description, category, tags or replace the file.",
      },
    ],
  }),
  component: EditDocumentPage,
});

function EditDocumentPage() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: doc, isLoading, isError } = useDocument(documentId);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  async function handleSubmit(payload: DocumentPayload) {
    setSubmitting(true);
    setApiError(null);
    setProgress(0);
    try {
      await documentApi.update(documentId, payload, setProgress);
      toast.success("Document updated", { description: payload.title });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      navigate({ to: "/documents/$documentId", params: { documentId } });
    } catch (caught) {
      const normalized = normalizeError(caught);
      setApiError(normalized);
      toast.error("Update failed", { description: normalized.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="panel space-y-4 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="panel">
        <EmptyState
          icon={FileText}
          title="Document unavailable"
          description="This document could not be loaded for editing."
          action={
            <Button asChild>
              <Link to="/documents">Back to documents</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/documents/$documentId" params={{ documentId }}>
          <ArrowLeft className="size-4" /> Back to document
        </Link>
      </Button>

      <PageHeader
        title="Edit document"
        description="Update metadata only, or replace the stored file at the same time."
      />

      <div className="panel p-6">
        <DocumentForm
          mode="edit"
          submitting={submitting}
          progress={progress}
          apiError={apiError}
          existingFileName={doc.originalName ?? doc.filename ?? ""}
          initialValues={{
            title: doc.title,
            description: doc.description ?? "",
            category: categoryOf(doc)?._id ?? "",
            tags: tagsOf(doc).map((tag) => tag._id),
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/documents/$documentId", params: { documentId } })}
        />
      </div>
    </div>
  );
}
