import api from '@/lib/api';
import { getSubdomain } from '@/lib/subdomain';

export interface DashboardStats {
  suratMasuk: number;
  suratKeluar: number;
  pendaftarPpdb: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const subdomain = getSubdomain();
  const response = await api.get<DashboardStats>('/letters/dashboard/stats', {
    headers: {
      'X-Subdomain': subdomain,
    },
  });
  return response.data;
};
