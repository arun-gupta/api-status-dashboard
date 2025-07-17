import { APIEndpoint } from './types';

export const API_ENDPOINTS: APIEndpoint[] = [
  {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/models',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer sk-test', // This will fail but we can detect the response
    },
    expectedFields: ['object', 'data'],
    timeout: 10000,
  },
  {
    name: 'GitHub',
    url: 'https://api.github.com/zen',
    method: 'GET',
    expectedFields: [],
    timeout: 10000,
  },
  {
    name: 'Stripe',
    url: 'https://api.stripe.com/v1/balance',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer sk_test_', // This will fail but we can detect the response
    },
    expectedFields: ['object', 'available'],
    timeout: 10000,
  },
  {
    name: 'HuggingFace',
    url: 'https://huggingface.co/api/models',
    method: 'GET',
    expectedFields: [],
    timeout: 10000,
  },
  {
    name: 'DockerHub',
    url: 'https://hub.docker.com/v2/repositories/library/',
    method: 'GET',
    expectedFields: ['count', 'results'],
    timeout: 10000,
  },
  {
    name: 'OpenWeatherMap',
    url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=test',
    method: 'GET',
    expectedFields: ['weather', 'main'],
    timeout: 10000,
  },
]; 