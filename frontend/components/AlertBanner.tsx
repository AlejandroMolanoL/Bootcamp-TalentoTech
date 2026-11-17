'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function AlertBanner() {
  const { globalError, globalSuccess, clearAlerts } = useAuth();

  if (!globalError && !globalSuccess) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {globalError && (
        <div className="flex items-center justify-between p-4 mb-3 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{globalError}</span>
          </div>
          <button
            onClick={clearAlerts}
            className="text-red-500 hover:text-red-700 p-1 rounded-md transition"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalSuccess && (
        <div className="flex items-center justify-between p-4 mb-3 text-sm text-emerald-800 rounded-lg bg-emerald-50 border border-emerald-200 shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{globalSuccess}</span>
          </div>
          <button
            onClick={clearAlerts}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md transition"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
