import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { listMyProjects } from "~/server/actions/projects";
import Link from "next/link";

export default async function ProjectsDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/projects");
  }

  const projects = await listMyProjects();

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Review Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a project workspace to begin or resume your screening workflow.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xl mb-4">
            📁
          </div>
          <h3 className="text-lg font-bold text-slate-800">No workspaces assigned</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            You do not have access to any projects. Please contact your organization administrator to get added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50/50 text-xs font-semibold text-indigo-700">
                  <span>🏢</span>
                  {project.organization.name}
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                  {project.name}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span>📄</span>
                  {project._count.articles} {project._count.articles === 1 ? "article" : "articles"}
                </div>
                <Link
                  href={`/projects/${project.id}/articles`}
                  className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Open Review Table
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
