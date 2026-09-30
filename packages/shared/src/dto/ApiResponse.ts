export interface ApiResponse<T = unknown> {
  Success: boolean;
  Message: string;
  Data?: T;
}
