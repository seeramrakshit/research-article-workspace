import Link from "next/link";
import { auth, signOut } from "~/server/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
            S
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            EasySLR
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user && (
            <Link
              href="/projects"
              className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors"
            >
              Projects
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{session.user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{session.user.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm border border-violet-200">
                {session.user.name?.[0] ?? session.user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/50 px-3 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
