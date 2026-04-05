'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 max-w-md w-full">
        <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 mb-1 font-mono break-all">{error.message}</p>
        {error.digest && <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>}
        <pre className="text-xs text-gray-500 bg-gray-50 rounded p-3 overflow-auto max-h-48 mb-4">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
