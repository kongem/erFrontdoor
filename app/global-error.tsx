'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Application Error</h2>
          <p className="text-xs text-slate-600">
            A critical error occurred. Please try reloading the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
