import { apiClient } from "./apiClient";
import type { DownloadHistoryEntry } from "@/types/api";

export const downloadHistoryApi = {
  async list() {
    const { data } = await apiClient.get<
      DownloadHistoryEntry[] | { history?: DownloadHistoryEntry[]; downloads?: DownloadHistoryEntry[] }
    >("/download-history");
    if (Array.isArray(data)) return data;
    return data.history ?? data.downloads ?? [];
  },
};
