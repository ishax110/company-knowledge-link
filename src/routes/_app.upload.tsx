import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { DocumentForm } from "@/components/documents/document-form";
import { documentApi, type DocumentPayload } from "@/api/documentApi";
import { normalizeError, type ApiError } from "@/api/apiClient";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({
    meta: [
      { title: "Upload document — Knowledge Repository" },
      {
        name: "description",
        content: "Upload PDF, DOC, DOCX, PPT or PPTX files with categories and tags.",
      },
      { property: "og:title", content: "Upload document — Knowledge Repository" },
      {
        property: "og:description",
        content: "Add a new document to the company knowledge repository.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  async function handleSubmit(payload: DocumentPayload) {
    setSubmitting(true);
    setApiError(null);
    setProgress(0);
    try {
      const created = await documentApi.upload(payload, setProgress);
      toast.success("Document uploaded", { description: payload.title });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (created?._id) {
        navigate({ to: "/documents/$documentId", params: { documentId: created._id } });
      } else {
        navigate({ to: "/documents" });
      }
    } catch (caught) {
      const normalized = normalizeError(caught);
      setApiError(normalized);
      toast.error("Upload failed", { description: normalized.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload document"
        description="Add a document to the repository with a category and any relevant tags. PDF, DOC, DOCX, PPT and PPTX up to 10 MB."
      />
      <div className="panel p-6">
        <DocumentForm
          mode="create"
          submitting={submitting}
          progress={progress}
          apiError={apiError}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/documents" })}
        />
      </div>
    </div>
  );
}
