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
      
      // Replace with your actual Cloudflare Worker URL when deployed
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
      // Replace with your actual Cloudflare Worker URL when deployed
      const response = await fetch('https://api-status-monitor.arungupta.workers.dev/api/trigger', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Wait a moment for the monitoring to complete, then refresh
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger monitoring');
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && Object.keys(statusData).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Status Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Real-time monitoring of public APIs
          </p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
            
            <button
              onClick={triggerMonitoring}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Trigger Monitoring
            </button>
          </div>

          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Status Grid */}
        {Object.keys(statusData).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(statusData).map(([apiName, statuses]) => {
              const latestStatus = statuses[0]; // Most recent status
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No API status data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 