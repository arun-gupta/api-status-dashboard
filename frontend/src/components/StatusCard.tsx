import React from 'react';
import type { APIStatus } from '../types';

interface StatusCardProps {
  apiName: string;
  status: APIStatus;
}

// Logo mapping for each API
const apiLogos: { [key: string]: string } = {
  OpenAI: 'https://seeklogo.com/images/O/openai-logo-8B9BFEDC26-seeklogo.com.png',
  GitHub: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  Stripe: '/logos/stripe.png',
  HuggingFace: '/logos/huggingface.png',
  DockerHub: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
  OpenWeatherMap: 'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png',
};

const StatusCard: React.FC<StatusCardProps> = ({ apiName, status }) => {
  const logoUrl = apiLogos[apiName];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${apiName} logo`} 
              className="w-8 h-8 max-w-[32px] max-h-[32px] mr-2 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          <h3 className="text-lg font-semibold text-gray-900">{apiName}</h3>
        </div>
        
        <div className="text-xl font-bold mb-4">
          {status.status === 'up' && <span title="UP">🟢</span>}
          {status.status === 'degraded' && <span title="DEGRADED">🟡</span>}
          {status.status === 'down' && <span title="DOWN">🔴</span>}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center px-6 py-3 border-r border-gray-200">
              <span className="text-gray-500 text-xs uppercase tracking-wide mb-1">Response</span>
              <span className="font-semibold text-lg text-gray-900">{status.latency}ms</span>
            </div>
            <div className="flex flex-col items-center px-6 py-3">
              <span className="text-gray-500 text-xs uppercase tracking-wide mb-1">Status</span>
              <span className="font-semibold text-lg text-gray-900">{status.httpStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard; 