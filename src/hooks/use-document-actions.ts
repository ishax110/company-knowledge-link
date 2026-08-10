import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentApi } from "@/api/documentApi";
import { handleApiError } from "@/lib/handle-api-error";
import type { DocumentItem } from "@/types/api";

export function useDocumentActions() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function download(doc: DocumentItem) {
    setDownloadingId(doc._id);
    try {
      await documentApi.download(doc);
      toast.success("Download started", { description: doc.originalName ?? doc.title });
      queryClient.invalidateQueries({ queryKey: ["download-history"] });
    } catch (error) {
      handleApiError(error, "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  async function remove(doc: DocumentItem) {
    setDeletingId(doc._id);
    try {
      await documentApi.remove(doc._id);
      toast.success("Document deleted", { description: doc.title });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", doc._id] });
      return true;
    } catch (error) {
      handleApiError(error, "Delete failed");
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return { download, remove, downloadingId, deletingId };
}
