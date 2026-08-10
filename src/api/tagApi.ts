import { apiClient } from "./apiClient";
import type { Tag } from "@/types/api";

export const tagApi = {
  async list() {
    const { data } = await apiClient.get<Tag[] | { tags: Tag[] }>("/tags");
    return Array.isArray(data) ? data : (data.tags ?? []);
  },
  async create(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post<Tag>("/tags", payload);
    return data;
  },
  async update(id: string, payload: { name?: string; description?: string }) {
    const { data } = await apiClient.put<Tag>(`/tags/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await apiClient.delete(`/tags/${id}`);
    return data;
  },
};
