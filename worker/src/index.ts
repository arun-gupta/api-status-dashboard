import { createAPIEndpoints } from './apis';
import { monitorAllAPIs } from './monitor';
import { APIStatus } from './types';

interface Env {
  API_STATUS_KV: KVNamespace;
  OPENAI_API_KEY?: string;
  STRIPE_API_KEY?: string;
  ENV?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // API endpoint to get status
    if (url.pathname === '/api/status') {
      try {
        const statusData = await getStatusFromKV(env.API_STATUS_KV);
        return new Response(JSON.stringify(statusData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch status' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Manual trigger endpoint
    if (url.pathname === '/api/trigger' && request.method === 'POST') {
      try {
        await handleScheduledCheck(env);
        return new Response(JSON.stringify({ message: 'Monitoring triggered successfully' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to trigger monitoring' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Serve the dashboard
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>API Status Dashboard</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .status-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status-indicator { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 8px; }
            .status-up { background: #10b981; }
            .status-down { background: #ef4444; }
            .status-degraded { background: #f59e0b; }
            .metrics { margin-top: 15px; font-size: 14px; color: #666; }
            .refresh-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }
            .refresh-btn:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>API Status Dashboard</h1>
              <button class="refresh-btn" onclick="refreshStatus()">Refresh Status</button>
            </div>
            <div id="status-grid" class="status-grid">
              <div>Loading...</div>
            </div>
          </div>
          <script>
            async function refreshStatus() {
              try {
                const response = await fetch('/api/status');
                const data = await response.json();
                displayStatus(data);
              } catch (error) {
                console.error('Failed to fetch status:', error);
              }
            }

            function displayStatus(data) {
              const grid = document.getElementById('status-grid');
              grid.innerHTML = '';

              Object.entries(data).forEach(([apiName, statuses]) => {
                const latestStatus = statuses[0]; // Most recent status
                if (!latestStatus) return;

                const card = document.createElement('div');
                card.className = 'status-card';
                
                const statusClass = latestStatus.status === 'up' ? 'status-up' : 
                                  latestStatus.status === 'down' ? 'status-down' : 'status-degraded';
                
                card.innerHTML = \`
                  <h3>
                    <span class="status-indicator \${statusClass}"></span>
                    \${apiName}
                  </h3>
                  <div class="metrics">
                    <div>Status: \${latestStatus.status.toUpperCase()}</div>
                    <div>HTTP: \${latestStatus.httpStatus}</div>
                    <div>Latency: \${latestStatus.latency}ms</div>
                    <div>Last Check: \${new Date(latestStatus.timestamp).toLocaleString()}</div>
                    \${latestStatus.rateLimit ? \`
                      <div>Rate Limit: \${latestStatus.rateLimit.remaining || 'N/A'}/\${latestStatus.rateLimit.limit || 'N/A'}</div>
                    \` : ''}
                    <div>Content Valid: \${latestStatus.contentValidation.valid ? '✓' : '✗'}</div>
                    \${latestStatus.error ? \`<div style="color: red;">Error: \${latestStatus.error}</div>\` : ''}
                  </div>
                \`;
                
                grid.appendChild(card);
              });
            }

            // Load status on page load
            refreshStatus();
            
            // Auto-refresh every 30 seconds
            setInterval(refreshStatus, 30000);
          </script>
        </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleScheduledCheck(env);
  },
};

async function handleScheduledCheck(env: Env): Promise<void> {
  const apiEndpoints = createAPIEndpoints(env);
  const statuses = await monitorAllAPIs(apiEndpoints);
  
  for (const status of statuses) {
    const key = `status:${status.name}`;
    const existingData = await env.API_STATUS_KV.get(key, { type: 'json' }) as APIStatus[] || [];
    
    // Keep only the last 24 entries (one per hour for 24 hours)
    const updatedData = [status, ...existingData.slice(0, 23)];
    
    await env.API_STATUS_KV.put(key, JSON.stringify(updatedData));
  }
}

async function getStatusFromKV(kv: KVNamespace): Promise<Record<string, APIStatus[]>> {
  const statusData: Record<string, APIStatus[]> = {};
  
  // We need to get the endpoints to know which APIs to fetch
  // For now, we'll use a default set without environment variables
  const defaultEndpoints = createAPIEndpoints({});
  
  for (const endpoint of defaultEndpoints) {
    const key = `status:${endpoint.name}`;
    const data = await kv.get(key, { type: 'json' }) as APIStatus[] || [];
    statusData[endpoint.name] = data;
  }
  
  return statusData;
} 