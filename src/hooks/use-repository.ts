import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/api/categoryApi";
import { tagApi } from "@/api/tagApi";
import { documentApi } from "@/api/documentApi";
import { downloadHistoryApi } from "@/api/downloadHistoryApi";
import type { DocumentListParams } from "@/types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
    staleTime: 60_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagApi.list(),
    staleTime: 60_000,
  });
}

export interface DocumentQueryParams extends DocumentListParams {
  keyword?: string;
}

export function useDocuments(params: DocumentQueryParams) {
  const keyword = params.keyword?.trim() ?? "";
  return useQuery({
    queryKey: ["documents", { ...params, keyword }],
    queryFn: () =>
      keyword.length > 0
        ? documentApi.search({ ...params, keyword })
        : documentApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => documentApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useDownloadHistory() {
  return useQuery({
    queryKey: ["download-history"],
    queryFn: () => downloadHistoryApi.list(),
  });
}
