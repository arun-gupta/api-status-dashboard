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