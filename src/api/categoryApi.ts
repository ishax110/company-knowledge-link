import { apiClient } from "./apiClient";
import type { Category } from "@/types/api";

export const categoryApi = {
  async list() {
    const { data } = await apiClient.get<Category[] | { categories: Category[] }>("/categories");
    return Array.isArray(data) ? data : (data.categories ?? []);
  },
  async create(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post<Category>("/categories", payload);
    return data;
  },
  async update(id: string, payload: { name?: string; description?: string }) {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },
};
