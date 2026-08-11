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

export const getGasWebappUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_WEBAPP_URL) || DEFAULT_WEBAPP_URL;
};

export const setGasWebappUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY_WEBAPP_URL, url.trim());
};

export const testGasConnection = async (url?: string): Promise<GASApiResponse> => {
  const targetUrl = url || getGasWebappUrl();
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
        message: 'Terjadi kesalahan. Silakan hubungi administrator.'
      };
    }
    const result = await response.json();
    return result;
  } catch (err: any) {
    console.error('GAS Connection Test Technical Error:', err);
    return {
      success: false,
      errorCode: 'CONNECTION_FAILED',
      message: 'Terjadi kesalahan. Silakan hubungi administrator.'
    };
  }
};

export const syncDataWithGAS = async (action: string, payload?: any): Promise<GASApiResponse> => {
  const url = getGasWebappUrl();
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
        message: 'Terjadi kesalahan. Silakan hubungi administrator.'
      };
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error(`GAS Sync ${action} Technical Error:`, error);
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      message: 'Terjadi kesalahan. Silakan hubungi administrator.'
    };
  }
};

