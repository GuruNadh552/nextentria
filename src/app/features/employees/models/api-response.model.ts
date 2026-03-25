export interface ApiResponse<T> {
  status_code: number;
  data: T;
}