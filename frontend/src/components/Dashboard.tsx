import React, { useState, useEffect } from 'react';
import StatusCard from './StatusCard';
import type { APIStatusLog } from '../types';

const Dashboard: React.FC = () => {
  const [statusData, setStatusData] = useState<APIStatusLog>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://api-status-monitor.arungupta.workers.dev/api/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatusData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const triggerMonitoring = async () => {
    try {
      const response = await fetch('https://api-status-monitor.arungupta.workers.dev/api/trigger', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger monitoring');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Status</h1>
          <p className="text-gray-600">Real-time monitoring of public APIs</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={triggerMonitoring}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Trigger Check
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center text-sm text-gray-500 mb-8">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Debug: Show how many APIs are loaded */}
        <p className="text-center text-xs text-gray-400 mb-2">
          APIs loaded: {Object.keys(statusData).length}
        </p>

        {/* Legend */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <span className="mr-6">🟢 UP</span>
          <span className="mr-6">🟡 DEGRADED</span>
          <span>🔴 DOWN</span>
        </div>

        {/* Loading */}
        {loading && Object.keys(statusData).length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading API status...</p>
          </div>
        ) : (
          /* Simple3 Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-1/4 mx-auto">
            {Object.entries(statusData).map(([apiName, statuses]) => {
              const latestStatus = statuses[0];
              if (!latestStatus) return null;
              return (
                <StatusCard
                  key={apiName}
                  apiName={apiName}
                  status={latestStatus}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 