import { ImportForm } from "./import-form";
import { db } from "~/server/db";
import Link from "next/link";

export default async function ImportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { organization: true },
  });

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10 space-y-6">
      {/* Breadcrumbs */}
      {project && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span>🏢</span>
          <span>{project.organization.name}</span>
          <span>/</span>
          <Link href={`/projects/${projectId}/articles`} className="hover:text-slate-500 transition-colors">
            {project.name}
          </Link>
          <span>/</span>
          <span className="text-slate-500">Import</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Import Article Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload a spreadsheet containing literature search results. Supports Excel (.xlsx) files.
          </p>
        </div>

        <ImportForm projectId={projectId} />
      </div>
    </div>
  );
}
