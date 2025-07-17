/// <reference types="@cloudflare/workers-types" />

import { APIEndpoint, APIStatus } from './types';

export async function monitorAPI(endpoint: APIEndpoint): Promise<APIStatus> {
  const startTime = Date.now();
  let status: APIStatus = {
    name: endpoint.name,
    timestamp: startTime,
    status: 'down',
    httpStatus: 0,
    latency: 0,
    contentValidation: {
      valid: false,
      errors: [],
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 10000);

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: endpoint.headers,
      body: endpoint.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const latency = endTime - startTime;

    status.latency = latency;
    status.httpStatus = response.status;

    // Check availability
    if (response.status >= 200 && response.status < 300) {
      status.status = 'up';
    } else if (response.status >= 500) {
      status.status = 'down';
    } else {
      status.status = 'degraded';
    }

    // Extract rate limit headers
    const rateLimitHeaders = {
      limit: response.headers.get('x-ratelimit-limit') || 
             response.headers.get('ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining') || 
                 response.headers.get('ratelimit-remaining'),
      reset: response.headers.get('x-ratelimit-reset') || 
             response.headers.get('ratelimit-reset'),
    };

    if (rateLimitHeaders.limit || rateLimitHeaders.remaining || rateLimitHeaders.reset) {
      status.rateLimit = rateLimitHeaders;
    }

    // Content validation
    if (endpoint.expectedFields && endpoint.expectedFields.length > 0) {
      try {
        const data = await response.json();
        const validationErrors: string[] = [];

        for (const field of endpoint.expectedFields) {
          if (!(field in data)) {
            validationErrors.push(`Missing field: ${field}`);
          }
        }

        status.contentValidation = {
          valid: validationErrors.length === 0,
          errors: validationErrors,
        };
      } catch (parseError) {
        status.contentValidation = {
          valid: false,
          errors: ['Failed to parse JSON response'],
        };
      }
    } else {
      // For endpoints without expected fields, just check if response is valid
      status.contentValidation = {
        valid: response.ok,
        errors: [],
      };
    }

  } catch (error) {
    const endTime = Date.now();
    status.latency = endTime - startTime;
    status.status = 'down';
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return status;
}

export async function monitorAllAPIs(endpoints: APIEndpoint[]): Promise<APIStatus[]> {
  const promises = endpoints.map(endpoint => monitorAPI(endpoint));
  return Promise.all(promises);
} 