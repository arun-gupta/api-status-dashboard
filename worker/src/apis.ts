import { APIEndpoint } from './types';

export const createAPIEndpoints = (env: any): APIEndpoint[] => [
  {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/models',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY || 'sk-test-placeholder'}`,
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
      'Authorization': `Bearer ${env.STRIPE_API_KEY || 'sk_test_placeholder'}`,
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