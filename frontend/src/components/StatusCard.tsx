import React from 'react';
import type { APIStatus } from '../types';

interface StatusCardProps {
  apiName: string;
  status: APIStatus;
}

const StatusCard: React.FC<StatusCardProps> = ({ apiName, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-500';
      case 'down':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{apiName}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {getStatusText(status.status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>HTTP Status:</span>
          <span className={`font-medium ${
            status.httpStatus >= 200 && status.httpStatus < 300 
              ? 'text-green-600' 
              : status.httpStatus >= 500 
                ? 'text-red-600' 
                : 'text-yellow-600'
          }`}>
            {status.httpStatus}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Latency:</span>
          <span className={`font-medium ${
            status.latency < 1000 ? 'text-green-600' : 
            status.latency < 3000 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {status.latency}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span>Content Valid:</span>
          <span className={`font-medium ${status.contentValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
            {status.contentValidation.valid ? '✓' : '✗'}
          </span>
        </div>

        {status.rateLimit && (
          <div className="flex justify-between">
            <span>Rate Limit:</span>
            <span className="font-medium text-gray-700">
              {status.rateLimit.remaining || 'N/A'}/{status.rateLimit.limit || 'N/A'}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Last Check:</span>
          <span className="font-medium text-gray-700">
            {new Date(status.timestamp).toLocaleString()}
          </span>
        </div>

        {status.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
            Error: {status.error}
          </div>
        )}

        {!status.contentValidation.valid && status.contentValidation.errors.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
            <div className="font-medium mb-1">Validation Errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {status.contentValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCard; 