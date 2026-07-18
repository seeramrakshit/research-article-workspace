import { describe, it, expect, beforeAll, vi } from "vitest";
import { db } from "~/server/db";
import { listProjectArticles } from "./articles";
import { ForbiddenError } from "~/server/auth/require-project-access";

// This mocks requireUserId's session lookup so the test can act as
// a specific seeded user without going through real NextAuth sign-in.
vi.mock("~/server/auth/current-user", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/server/auth/current-user")>();
  return { ...actual, requireUserId: vi.fn() };
});
import { requireUserId } from "~/server/auth/current-user";

describe("listProjectArticles authorization", () => {
  let carlaId: string;
  let benId: string;
  let projectBetaId: string;

  beforeAll(async () => {
    const carla = await db.user.findUniqueOrThrow({ where: { email: "carla@easyslr.dev" } });
    const ben = await db.user.findUniqueOrThrow({ where: { email: "ben@easyslr.dev" } });
    const projectBeta = await db.project.findFirstOrThrow({
      where: { name: { contains: "Beta" } },
    });
    carlaId = carla.id;
    benId = ben.id;
    projectBetaId = projectBeta.id;
  });

  it("denies a user with no ProjectMember row on the project", async () => {
    vi.mocked(requireUserId).mockResolvedValue(carlaId);

    await expect(listProjectArticles(projectBetaId)).rejects.toThrow(ForbiddenError);
  });

  it("allows a user who is a project member", async () => {
    vi.mocked(requireUserId).mockResolvedValue(benId);

    await expect(listProjectArticles(projectBetaId)).resolves.toBeInstanceOf(Array);
  });
});