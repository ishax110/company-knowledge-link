export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  description?: string;
  category?: Category | string | null;
  tags?: Array<Tag | string>;
  filename?: string;
  originalName?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  cloudinaryPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedDocuments {
  currentPage: number;
  pageSize: number;
  totalDocuments: number;
  totalPages: number;
  documents: DocumentItem[];
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface DocumentSearchParams extends DocumentListParams {
  keyword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message?: string;
  user: AuthUser;
}

export interface DownloadHistoryEntry {
  _id: string;
  document?: DocumentItem | string | null;
  user?: AuthUser | { _id?: string; name?: string; email?: string } | string | null;
  downloadedAt?: string;
  createdAt?: string;
  ipAddress?: string;
}

export interface FieldError {
  path?: string;
  msg?: string;
}
