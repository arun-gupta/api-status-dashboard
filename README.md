# API Status Dashboard

A comprehensive web application that monitors public APIs (OpenAI, GitHub, Stripe, HuggingFace, DockerHub, OpenWeatherMap) using Cloudflare Workers and displays real-time status information.

## 🌐 Live Demo

**View the live dashboard**: [https://api-status-monitor.arungupta.workers.dev/](https://api-status-monitor.arungupta.workers.dev/)

## Architecture Overview

This project follows a **serverless architecture** with clear separation between client and server components:

### 🖥️ Frontend (Client)
- **Technology**: React + TypeScript + Tailwind CSS
- **Purpose**: User interface for displaying API status information
- **Features**:
  - Real-time status display with auto-refresh (30s intervals)
  - Manual refresh and trigger monitoring buttons
  - Responsive design for all devices
  - Clean, minimal interface similar to status pages

### ⚡ Backend (Server)
- **Technology**: Cloudflare Workers + TypeScript
- **Purpose**: API monitoring, data storage, and serving the frontend
- **Features**:
  - Scheduled API monitoring (every 5 minutes)
  - HTTP status checking, latency measurement, rate limit detection
  - Content validation for expected response formats
  - Persistent data storage using Cloudflare KV
  - RESTful API endpoints for frontend communication

### 🔄 Client-Server Communication

```
┌─────────────────┐    HTTP Requests    ┌──────────────────┐
│   React App     │ ◄─────────────────► │ Cloudflare Worker│
│   (Frontend)    │                     │   (Backend)      │
└─────────────────┘                     └──────────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
┌─────────────────┐                     ┌──────────────────┐
│   Browser       │                     │   Cloudflare KV  │
│   (Client)      │                     │   (Database)     │
└─────────────────┘                     └──────────────────┘
```

**API Endpoints**:
- `GET /api/status` - Frontend fetches current API status data
- `POST /api/trigger` - Frontend triggers immediate API monitoring
- `GET /` - Serves the React application

**Data Flow**:
1. **Scheduled Monitoring**: Worker runs every 5 minutes to check all APIs
2. **Data Storage**: Results stored in Cloudflare KV with timestamps
3. **Frontend Polling**: React app fetches latest data every 30 seconds
4. **Real-time Updates**: Dashboard displays current status with color-coded indicators

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

For APIs that require authentication (OpenAI and Stripe), you can set up API keys as environment variables:

### Local Development Setup

1. **Create a local .env file**:
   ```bash
   cd worker
   cp .env.example .env
   ```

2. **Edit the .env file** with your actual API keys:
   ```bash
   # API Keys for local development
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   STRIPE_API_KEY=sk_test_your-actual-stripe-key-here
   ```

3. **Start local development**:
   ```bash
   npm run dev
   ```

### Production Setup

1. **Via Wrangler CLI**:
   ```bash
   cd worker
   wrangler secret put OPENAI_API_KEY
   wrangler secret put STRIPE_API_KEY
   ```

2. **Via Cloudflare Dashboard**:
   - Go to your Cloudflare Workers dashboard
   - Select your worker
   - Go to Settings > Variables
   - Add the environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `STRIPE_API_KEY`: Your Stripe secret key

### API Key Requirements

#### OpenAI API Key
1. **OpenAI Platform**: Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Sign in or create account**: Use your OpenAI account credentials
3. **Create new API key**: Click "Create new secret key"
4. **Copy the key**: The key starts with `sk-` (e.g., `sk-1234567890ef...`)
5. **Store securely**: Add to your `.env` file or Cloudflare secrets

**Note**: OpenAI API keys are free to create but usage is charged per request. Monitor your usage in the [OpenAI Usage Dashboard](https://platform.openai.com/usage).

#### Stripe API Key
1. **Stripe Dashboard**: Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. **Sign in to Stripe**: Use your Stripe account credentials
3. **Choose environment**:
   - **Test mode**: Use `sk_test_...` keys for development (free)
   - **Live mode**: Use `sk_live_...` keys for production (real transactions)
4. **Create new key**: Click "Create secret key" or use existing keys
5. **Copy the key**: The key starts with `sk_test_` or `sk_live_`
6. **Store securely**: Add to your `.env` file or Cloudflare secrets

**Note**: 
- Test keys are free and safe to use for development
- Live keys should only be used in production and kept secure
- You can view your API usage in the [Stripe Dashboard](https://dashboard.stripe.com/developers)

### Security Notes

- Never commit API keys to version control
- The `.env` file is already in `.gitignore` and will not be committed
- Use Wrangler secrets or Cloudflare environment variables for production
- The worker will use placeholder values if keys are not provided
- APIs without valid keys will show authentication errors in the dashboard

### Optional APIs

If you don't want to set up API keys, the following APIs will work without authentication:
- GitHub (public endpoints)
- HuggingFace (public endpoints)
- DockerHub (public endpoints)
- OpenWeatherMap (public endpoints)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 