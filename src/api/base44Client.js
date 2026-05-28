import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44 = createClient({
  appId: appParams.appId,
  appBaseUrl: appParams.appBaseUrl,
  headers: {
    api_key: import.meta.env.VITE_BASE44_API_KEY,
  },
});
