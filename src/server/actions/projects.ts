"use server";

import { db } from "~/server/db";
import { requireUserId } from "~/server/auth/current-user";

// Only returns projects the current user is actually a member of —
// scoped at the query level, not filtered after fetching everything.
export async function listMyProjects() {
  const userId = await requireUserId();

  return db.project.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true } },
      _count: { select: { articles: true } },
    },
  });
}