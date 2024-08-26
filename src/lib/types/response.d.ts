type ApiResponse<T = any> = {
  data?: T;
  meta?: ApiResponseMetadata;
  statusCode: number;
  message: string;
};

type ApiResponseMetadata = {
  total: number;
  current: number;
  size: number;
};
