"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    posthog.capture("client_error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-500">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-gray-400">
          Error ID: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorPage;
