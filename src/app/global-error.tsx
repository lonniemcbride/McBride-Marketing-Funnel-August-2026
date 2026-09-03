"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-xl font-bold">Something went wrong.</h1>
            <p className="mt-2 text-black/60">Please refresh the page and try again.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
