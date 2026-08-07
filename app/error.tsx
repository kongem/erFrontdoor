'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold text-rose-900">
          Something went wrong
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          An unexpected error occurred while rendering this page.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-white border border-rose-300 text-rose-800 text-xs font-bold rounded-xl transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
