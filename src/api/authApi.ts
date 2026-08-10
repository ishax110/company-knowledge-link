import { apiClient } from "./apiClient";
import type { LoginResponse, RegisterResponse } from "@/types/api";

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const { data } = await apiClient.post<LoginResponse>("/users/login", payload);
    return data;
  },
  async register(payload: { name: string; email: string; password: string }) {
    const { data } = await apiClient.post<RegisterResponse>("/users/register", payload);
    return data;
  },
};
