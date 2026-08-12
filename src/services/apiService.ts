// Google Apps Script API Service for SMART RT 07 RW 11 GPA NGIJO
// Interacts with deployed Apps Script Web App (doGet / doPost)
// TAHAP 6D — SECRET & API SECURITY HARDENING:
// - No secrets, tokens, or API keys stored in client-side localStorage or JS bundles
// - All sensitive operations route through Google Apps Script ScriptProperties

export interface GASApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  error?: string;
}

const STORAGE_KEY_WEBAPP_URL = 'SMART_RT_GAS_WEBAPP_URL';
const DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx_SMART_RT07_EXEC/exec';

export const isPlaceholderGasUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  return (
    trimmed === '' ||
    trimmed.includes('AKfycbx_SMART_RT07_EXEC') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('example.com') ||
    !trimmed.startsWith('https://script.google.com/macros/s/')
  );
};

export const getGasWebappUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_WEBAPP_URL) || DEFAULT_WEBAPP_URL;
};

export const setGasWebappUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY_WEBAPP_URL, url.trim());
};

export const testGasConnection = async (url?: string): Promise<GASApiResponse> => {
  const targetUrl = url || getGasWebappUrl();
  if (isPlaceholderGasUrl(targetUrl)) {
    return {
      success: false,
      errorCode: 'BACKEND_NOT_CONNECTED',
      message: 'Backend belum terhubung. Silakan atur Google Apps Script WebApp URL di Pengaturan Sistem.',
      data: { status: 'NOT_CONNECTED', url: targetUrl }
    };
  }
  try {
    const response = await fetch(`${targetUrl}?action=ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      return {
        success: false,
        errorCode: 'HTTP_ERROR',
        message: 'Terjadi kesalahan koneksi backend GAS.'
      };
    }
    const result = await response.json();
    return result;
  } catch (err: any) {
    console.warn('[GAS Sync] Connection test warning:', err?.message || err);
    return {
      success: false,
      errorCode: 'CONNECTION_FAILED',
      message: 'Gagal terhubung ke GAS Backend server.'
    };
  }
};

export const syncDataWithGAS = async (action: string, payload?: any): Promise<GASApiResponse> => {
  const url = getGasWebappUrl();

  if (isPlaceholderGasUrl(url)) {
    return {
      success: false,
      errorCode: 'BACKEND_NOT_CONNECTED',
      message: 'Backend belum terhubung. Konfigurasikan URL Apps Script WebApp di Pengaturan Sistem.',
      data: { status: 'NOT_CONNECTED', action }
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        payload
      })
    });

    if (!response.ok) {
      return {
        success: false,
        errorCode: 'SYNC_ERROR',
        message: 'Terjadi kesalahan pada backend GAS.'
      };
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.warn(`[GAS Sync] Network notification for ${action}:`, error?.message || error);
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      message: 'Gagal terhubung ke server GAS backend.'
    };
  }
};

