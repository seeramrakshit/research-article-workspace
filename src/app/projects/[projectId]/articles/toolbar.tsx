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
    <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative flex-1 w-full">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search titles, authors, journals..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto self-stretch">
        <select
          defaultValue={searchParams.get("status") ?? "ALL"}
          onChange={(e) => updateParam("status", e.target.value)}
          className="flex-1 md:flex-none rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="UNSCREENED">Unscreened</option>
          <option value="INCLUDED">Included</option>
          <option value="EXCLUDED">Excluded</option>
          <option value="MAYBE">Maybe</option>
        </select>

        <select
          defaultValue={searchParams.get("sort") ?? "createdAt"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="flex-1 md:flex-none rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer"
        >
          <option value="createdAt">Date Added</option>
          <option value="title">Title</option>
          <option value="publicationYear">Year</option>
          <option value="firstAuthor">First Author</option>
        </select>
      </div>

      {isPending && (
        <span className="text-xs font-semibold text-violet-600 animate-pulse bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
          Updating...
        </span>
      )}
    </div>
  );
}