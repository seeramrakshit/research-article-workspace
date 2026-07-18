import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/projects");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-xs font-semibold text-violet-700 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse"></span>
          Introducing EasySLR Review Workspace
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Systematic Literature Reviews, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Simplified.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The collaborative workspace designed for research teams. Import article databases, screen titles and abstracts, manage duplicates, and audit your review workflow in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-center"
          >
            Access Workspace →
          </Link>
          <Link
            href="https://github.com/t3-oss/create-t3-app"
            target="_blank"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 transition-all text-center"
          >
            Learn More
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-800">Fast Screening</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Screen articles instantly with keyboard-friendly Include, Exclude, or Maybe options.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-800">Immutable Notes</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Add review notes for full transparency. Audit trails are preserved per article.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-800">Smart Deduplication</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Resolve matching DOI or PMID conflicts automatically during database import.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
