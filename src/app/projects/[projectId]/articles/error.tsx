"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden = error.name === "ForbiddenError";
  const isUnauthenticated = error.name === "UnauthenticatedError";

  if (isUnauthenticated) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="mb-4 text-gray-600">You need to sign in to view this project.</p>
        <Link href="/api/auth/signin" className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="mb-2 font-medium text-gray-900">You don&apos;t have access to this project.</p>
        <p className="mb-4 text-sm text-gray-500">
          Ask a project owner to add you, or return to your projects.
        </p>
        <Link href="/projects" className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          Back to my projects
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-12 text-center">
      <p className="mb-4 text-gray-600">Something went wrong loading this page.</p>
      <button onClick={reset} className="rounded-full border px-4 py-2 text-sm">
        Try again
      </button>
    </div>
  );
}