# API Status Dashboard

A comprehensive web application that monitors public APIs (OpenAI, GitHub, Stripe, HuggingFace, DockerHub, OpenWeatherMap) using Cloudflare Workers and displays real-time status information.

## Features

- **Real-time API Monitoring**: Pings APIs every 5 minutes using Cloudflare Workers
- **Comprehensive Status Tracking**:
  - Availability (HTTP 200 vs 5xx)
  - Latency measurements (edge benefit!)
  - Rate limit header detection
  - Content validation (expected fields)
- **Modern Dashboard**: React + TypeScript frontend with Tailwind CSS
- **Persistent Storage**: Cloudflare KV for storing uptime logs
- **Auto-refresh**: Dashboard updates every 30 seconds

## Project Structure

```
api-status-dashboard/
├── worker/                 # Cloudflare Worker (TypeScript)
│   ├── src/
│   │   ├── index.ts       # Main worker entry point
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── apis.ts        # API endpoint configurations
│   │   └── monitor.ts     # API monitoring logic
│   ├── package.json
│   ├── wrangler.toml      # Cloudflare configuration
│   └── tsconfig.json
├── frontend/              # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   └── StatusCard.tsx
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd api-status-dashboard

# Install all dependencies (worker + frontend)
npm run install:all

# Or install individually:
# Install worker dependencies
cd worker
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Cloudflare Worker

1. **Login to Cloudflare** (Required for KV namespace creation):
   ```bash
   cd worker
   wrangler login
   ```
   This will open your browser for OAuth authentication with Cloudflare. You'll need to authorize Wrangler to access your Cloudflare account.

2. **Create KV Namespace**:
   ```bash
   wrangler kv:namespace create API_STATUS_LOGS
   wrangler kv:namespace create API_STATUS_LOGS --preview
   ```

3. **Update wrangler.toml**:
   Replace the placeholder KV namespace IDs in `worker/wrangler.toml` with the actual IDs from step 2.

4. **Deploy the Worker**:
   ```bash
   wrangler deploy
   ```

### 3. Configure Frontend

1. **Update API Endpoints** (Optional):
   If you want to use the deployed worker instead of local development, update `frontend/src/components/Dashboard.tsx` to use your deployed Cloudflare Worker URL instead of `http://localhost:8787`.

2. **Start Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`

## API Endpoints

The Cloudflare Worker provides the following endpoints:

- `GET /` - Serves the dashboard HTML
- `GET /api/status` - Returns current API status data
- `POST /api/trigger` - Manually triggers API monitoring

## Monitored APIs

1. **OpenAI** - `/v1/models` endpoint
2. **GitHub** - `/zen` endpoint (public)
3. **Stripe** - `/v1/balance` endpoint
4. **HuggingFace** - `/api/models` endpoint
5. **DockerHub** - `/v2/repositories/library/` endpoint
6. **OpenWeatherMap** - Weather API endpoint

## Status Indicators

- 🟢 **UP** - HTTP 200-299, content validation passes
- 🟡 **DEGRADED** - HTTP 300-499, or content validation fails
- 🔴 **DOWN** - HTTP 500+, or connection errors

## Development

### Local Development

1. **Start Worker Locally**:
   ```bash
   cd worker
   wrangler dev
   ```
   The worker will be available at `http://localhost:8787`

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

3. **Start Both Simultaneously** (from project root):
   ```bash
   npm run dev
   ```
   This will start both the worker and frontend concurrently.

**Note**: Make sure to update the API endpoints in `frontend/src/components/Dashboard.tsx` to use `http://localhost:8787` when running locally, or your deployed worker URL when using the production version.

### Adding New APIs

1. Add the API configuration to `worker/src/apis.ts`
2. Update the types if needed in `worker/src/types.ts`
3. Redeploy the worker

## Deployment

### Cloudflare Worker

```bash
cd worker
wrangler deploy
```

### Frontend (Optional)

You can deploy the frontend to any static hosting service (Vercel, Netlify, etc.) or serve it directly from the Cloudflare Worker.

## Environment Variables

No environment variables are required for basic functionality. The APIs are configured to work with public endpoints or will show appropriate error states for endpoints requiring authentication.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 