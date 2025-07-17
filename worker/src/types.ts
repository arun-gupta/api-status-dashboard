export interface APIEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  expectedFields?: string[];
  timeout?: number;
}

export interface APIStatus {
  name: string;
  timestamp: number;
  status: 'up' | 'down' | 'degraded';
  httpStatus: number;
  latency: number;
  rateLimit?: {
    limit?: string;
    remaining?: string;
    reset?: string;
  };
  contentValidation: {
    valid: boolean;
    errors: string[];
  };
  error?: string;
}

export interface APIStatusLog {
  [apiName: string]: APIStatus[];
} 