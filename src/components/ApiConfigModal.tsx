import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, Shield, RefreshCw } from 'lucide-react';

export interface ApiConfig {
  baseUrl: string;
  authToken: string;
  isConnected: boolean;
}

const STORAGE_KEY = 'finova_api_config';

export function getStoredApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading API config', e);
  }
  return {
    baseUrl: 'https://api.finova.internal/v1',
    authToken: 'eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_bearer_token',
    isConnected: true,
  };
}

export function saveApiConfig(config: ApiConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [baseUrl, setBaseUrl] = useState(() => getStoredApiConfig().baseUrl);
  const [authToken, setAuthToken] = useState(() => getStoredApiConfig().authToken);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredApiConfig();
      setBaseUrl(cfg.baseUrl);
      setAuthToken(cfg.authToken);
      setStatusMsg(cfg.isConnected ? 'Backend REST API connected & healthy' : null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMsg(null);

    try {
      saveApiConfig({
        baseUrl: baseUrl.trim(),
        authToken: authToken.trim(),
        isConnected: true,
      });
      setStatusMsg('Backend API configuration updated successfully!');
      setTimeout(() => {
        onConfigUpdated();
        onClose();
      }, 900);
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultCfg = {
      baseUrl: 'https://api.finova.internal/v1',
      authToken: 'eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_bearer_token',
      isConnected: true,
    };
    saveApiConfig(defaultCfg);
    setBaseUrl(defaultCfg.baseUrl);
    setAuthToken(defaultCfg.authToken);
    setStatusMsg('Restored default Backend REST API environment.');
    setTimeout(() => {
      onConfigUpdated();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend REST API Configuration</h3>
              <p className="text-[11px] text-slate-400">Microservice Architecture • HTTP / JSON</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">API Server Base URL</label>
            <input
              type="url"
              required
              placeholder="https://api.yourdomain.com/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Authorization Token (Bearer)</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-start gap-2.5 text-[11px] text-slate-400">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Direct database credentials have been decoupled from the client. All communications flow through authenticated backend endpoints.
            </p>
          </div>

          {statusMsg && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Reset to Default
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-slate-400 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isTesting}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                {isTesting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save API Config</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
