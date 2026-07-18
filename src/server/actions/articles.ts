"use server";

import { db } from "~/server/db";
import { requireUserId } from "~/server/auth/current-user";
import { requireProjectAccess } from "~/server/auth/require-project-access";

export async function listProjectArticles(projectId: string) {
  const userId = await requireUserId();
  await requireProjectAccess(userId, projectId);

  return db.article.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}