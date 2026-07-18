"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function Toolbar({ projectId }: { projectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /* search icon */ viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search articles..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>

      <select
        defaultValue={searchParams.get("status") ?? "ALL"}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-full border border-gray-200 px-4 py-2 text-sm"
      >
        <option value="ALL">All statuses</option>
        <option value="UNSCREENED">Unscreened</option>
        <option value="INCLUDED">Included</option>
        <option value="EXCLUDED">Excluded</option>
        <option value="MAYBE">Maybe</option>
      </select>

      <select
        defaultValue={searchParams.get("sort") ?? "createdAt"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-full border border-gray-200 px-4 py-2 text-sm"
      >
        <option value="createdAt">Date added</option>
        <option value="title">Title</option>
        <option value="publicationYear">Year</option>
        <option value="firstAuthor">First author</option>
      </select>

      {isPending && <span className="text-xs text-gray-400">Updating…</span>}
    </div>
  );
}