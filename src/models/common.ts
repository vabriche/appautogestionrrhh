export type ApiStatus = "success" | "error";

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit?: number;
}

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  campo: string;
  error: string;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: ApiErrorDetail[];
}

export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
