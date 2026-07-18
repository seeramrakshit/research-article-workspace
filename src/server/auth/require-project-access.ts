import { db } from "~/server/db";
import type { ProjectRole } from "~/generated/prisma";

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this project.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

const ROLE_RANK: Record<ProjectRole, number> = {
  REVIEWER: 0,
  OWNER: 1,
};


export async function requireProjectAccess(
  userId: string,
  projectId: string,
  minRole: ProjectRole = "REVIEWER",
) {
  const membership = await db.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new ForbiddenError();
  }

  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new ForbiddenError(
      `This action requires ${minRole} access on this project.`,
    );
  }

  return membership;
}