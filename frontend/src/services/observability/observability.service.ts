import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';

export const observabilityKeys = {
  all: ['observability'] as const,
  health: () => [...observabilityKeys.all, 'health'] as const,
  infrastructure: (service: string) => [...observabilityKeys.all, 'infra', service] as const,
  dashboard: (type: string) => [...observabilityKeys.all, 'dashboard', type] as const,
};

// Types based on the backend API
export interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    [key: string]: any;
  };
  message?: string;
}

export const fetchHealth = async (endpoint: string): Promise<HealthResponse> => {
  const start = performance.now();
  try {
    const response = await api.get(`/health${endpoint}`);
    const latency = Math.round(performance.now() - start);
    return { ...response.data, _latency: latency };
  } catch (error: any) {
    const latency = Math.round(performance.now() - start);
    return {
      success: false,
      data: { status: 'offline' },
      message: error.response?.data?.message || error.message || 'Service offline',
      _latency: latency
    } as any;
  }
};

export const fetchDashboard = async (type: string) => {
  try {
    const response = await api.get(`/api/v1/observability/dashboard`, { params: { type } });
    return response.data;
  } catch (error: any) {
    return {};
  }
};

// 30 Seconds Auto Refresh
const REFRESH_INTERVAL = 30000;

export const useSystemHealth = () => {
  return useQuery({
    queryKey: observabilityKeys.health(),
    queryFn: () => fetchHealth(''),
    refetchInterval: REFRESH_INTERVAL,
  });
};

export const useInfraHealth = (service: 'database' | 'redis' | 'queue' | 'storage' | 'ai') => {
  return useQuery({
    queryKey: observabilityKeys.infrastructure(service),
    queryFn: () => fetchHealth(`/${service}`),
    refetchInterval: REFRESH_INTERVAL,
  });
};

export const useDashboardMetrics = (type: 'WORKFLOW' | 'RUNTIME' | 'QUEUE' | 'AI') => {
  return useQuery({
    queryKey: observabilityKeys.dashboard(type),
    queryFn: () => fetchDashboard(type),
    refetchInterval: REFRESH_INTERVAL,
  });
};
