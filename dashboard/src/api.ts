import axios from "axios";
import type { Summary, AdminUser, GridDetail, GridProgress } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${
    import.meta.env.VITE_ADMIN_TOKEN || ""
  }`;
  return config;
});

export async function getSummary(): Promise<Summary> {
  const { data } = await api.get<Summary>("/admin/summary");
  return data;
}

export async function getUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/admin/users");
  return data;
}

export async function getUserGrids(userId: number): Promise<GridProgress[]> {
  const { data } = await api.get<GridProgress[]>(`/admin/users/${userId}/grids`);
  return data;
}

export async function getGrid(id: string): Promise<GridDetail> {
  const { data } = await api.get<GridDetail>(`/admin/grids/${id}`);
  return data;
}
