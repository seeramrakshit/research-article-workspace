"use server";

import { db } from "~/server/db";
import { requireUserId } from "~/server/auth/current-user";
import { requireProjectAccess } from "~/server/auth/require-project-access";
import { articleSearchParamsSchema, type ArticleSearchParams } from "~/lib/articles/search-params";

export async function listProjectArticles(projectId: string, rawParams: unknown = {}) {
  const userId = await requireUserId();
  await requireProjectAccess(userId, projectId); // still the first thing that runs

  const params = articleSearchParamsSchema.parse(rawParams);

  return db.article.findMany({
    where: {
      projectId, // the actual access boundary — everything below is just UX
      ...(params.status !== "ALL" ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: "insensitive" } },
              { authors: { contains: params.q, mode: "insensitive" } },
              { journal: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { [params.sort]: params.dir },
  });
}

export async function updateArticleStatus(
  articleId: string,
  projectId: string,
  status: "UNSCREENED" | "INCLUDED" | "EXCLUDED" | "MAYBE",
) {
  const userId = await requireUserId();
  await requireProjectAccess(userId, projectId); // REVIEWER is enough — default minRole

  // Belt-and-suspenders: confirm the article actually belongs to the
  // project we just checked access for, so a caller can't pass a
  // projectId they have access to alongside an articleId from a
  // different project they don't.
  const article = await db.article.findFirst({ where: { id: articleId, projectId } });
  if (!article) throw new Error("Article not found in this project.");

  return db.article.update({ where: { id: articleId }, data: { status } });
}

export async function addReviewNote(articleId: string, projectId: string, body: string) {
  const userId = await requireUserId();
  await requireProjectAccess(userId, projectId);

  const article = await db.article.findFirst({ where: { id: articleId, projectId } });
  if (!article) throw new Error("Article not found in this project.");

  if (!body.trim()) throw new Error("Note cannot be empty.");

  return db.reviewNote.create({
    data: { articleId, userId, body: body.trim() },
  });
}