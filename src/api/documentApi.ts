import { apiClient, API_BASE_URL } from "./apiClient";
import type {
  DocumentItem,
  DocumentListParams,
  DocumentSearchParams,
  PaginatedDocuments,
} from "@/types/api";

/**
 * All Knowledge Repository document endpoints live here so paths can be
 * adjusted in one place if the backend changes.
 */
const ENDPOINTS = {
  list: "/documents",
  search: "/documents/search",
  byId: (id: string) => `/documents/${id}`,
  upload: "/documents/upload",
  download: (id: string) => `/documents/download/${id}`,
};

function toPaginated(
  data: PaginatedDocuments | DocumentItem[],
  fallback: { page: number; limit: number },
): PaginatedDocuments {
  if (Array.isArray(data)) {
    return {
      currentPage: fallback.page,
      pageSize: fallback.limit,
      totalDocuments: data.length,
      totalPages: 1,
      documents: data,
    };
  }
  return {
    currentPage: data.currentPage ?? fallback.page,
    pageSize: data.pageSize ?? fallback.limit,
    totalDocuments: data.totalDocuments ?? data.documents?.length ?? 0,
    totalPages: data.totalPages ?? 1,
    documents: data.documents ?? [],
  };
}

export interface DocumentPayload {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  file?: File | null;
}

function buildFormData(payload: DocumentPayload) {
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.category) form.append("category", payload.category);
  (payload.tags ?? []).forEach((tag) => form.append("tags", tag));
  if (payload.file) form.append("file", payload.file);
  return form;
}

export const documentApi = {
  async list(params: DocumentListParams = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const { data } = await apiClient.get<PaginatedDocuments | DocumentItem[]>(ENDPOINTS.list, {
      params: { page, limit, sortBy: params.sortBy, order: params.order },
    });
    return toPaginated(data, { page, limit });
  },

  async search(params: DocumentSearchParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const { data } = await apiClient.get<PaginatedDocuments | DocumentItem[]>(ENDPOINTS.search, {
      params: {
        keyword: params.keyword,
        page,
        limit,
        sortBy: params.sortBy,
        order: params.order,
      },
    });
    return toPaginated(data, { page, limit });
  },

  async getById(id: string) {
    const { data } = await apiClient.get<DocumentItem | { document: DocumentItem }>(
      ENDPOINTS.byId(id),
    );
    return (data as { document?: DocumentItem }).document ?? (data as DocumentItem);
  },

  async upload(payload: DocumentPayload, onProgress?: (percent: number) => void) {
    const { data } = await apiClient.post<DocumentItem | { document: DocumentItem }>(
      ENDPOINTS.upload,
      buildFormData(payload),
      {
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
    return (data as { document?: DocumentItem }).document ?? (data as DocumentItem);
  },

  async update(id: string, payload: DocumentPayload, onProgress?: (percent: number) => void) {
    const { data } = await apiClient.put<DocumentItem | { document: DocumentItem }>(
      ENDPOINTS.byId(id),
      buildFormData(payload),
      {
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
    return (data as { document?: DocumentItem }).document ?? (data as DocumentItem);
  },

  async remove(id: string) {
    const { data } = await apiClient.delete(ENDPOINTS.byId(id));
    return data;
  },

  /**
   * Hits the backend download endpoint (which records download history) and
   * saves the returned file. Falls back to opening the stored file URL when
   * the storage provider blocks a cross-origin blob read.
   */
  async download(doc: Pick<DocumentItem, "_id" | "originalName" | "filename" | "filePath">) {
    const filename = doc.originalName || doc.filename || `${doc._id}`;
    try {
      const response = await apiClient.get<Blob>(ENDPOINTS.download(doc._id), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return;
    } catch (error) {
      if (doc.filePath) {
        window.open(doc.filePath, "_blank", "noopener,noreferrer");
        return;
      }
      throw error;
    }
  },

  downloadUrl(id: string) {
    return `${API_BASE_URL}${ENDPOINTS.download(id)}`;
  },
};
