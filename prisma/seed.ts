import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
  // ---- Users ----
  // aisha: org owner, owns Project Alpha
  // ben: org member, reviewer on Project Alpha AND Project Beta
  // carla: org member, but NOT on Project Beta — this is your "should be denied" user
  const aisha = await db.user.upsert({
    where: { email: "aisha@easyslr.dev" },
    update: {},
    create: { email: "aisha@easyslr.dev", name: "Aisha (Org Owner)" },
  });

  const ben = await db.user.upsert({
    where: { email: "ben@easyslr.dev" },
    update: {},
    create: { email: "ben@easyslr.dev", name: "Ben (Reviewer)" },
  });

  const carla = await db.user.upsert({
    where: { email: "carla@easyslr.dev" },
    update: {},
    create: { email: "carla@easyslr.dev", name: "Carla (No Beta Access)" },
  });

  // ---- Organizations ----
  const orgOne = await db.organization.upsert({
    where: { slug: "cardio-research-group" },
    update: {},
    create: { name: "Cardio Research Group", slug: "cardio-research-group" },
  });

  const orgTwo = await db.organization.upsert({
    where: { slug: "digital-health-lab" },
    update: {},
    create: { name: "Digital Health Lab", slug: "digital-health-lab" },
  });

  // ---- Org-level memberships ----
  await db.membership.upsert({
    where: { userId_organizationId: { userId: aisha.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: aisha.id, organizationId: orgOne.id, role: "OWNER" },
  });

  await db.membership.upsert({
    where: { userId_organizationId: { userId: ben.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: ben.id, organizationId: orgOne.id, role: "MEMBER" },
  });

  await db.membership.upsert({
    where: { userId_organizationId: { userId: carla.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: carla.id, organizationId: orgOne.id, role: "MEMBER" },
  });

  // carla also belongs to orgTwo, just to prove org-membership alone
  // doesn't grant project access
  await db.membership.upsert({
    where: { userId_organizationId: { userId: carla.id, organizationId: orgTwo.id } },
    update: {},
    create: { userId: carla.id, organizationId: orgTwo.id, role: "MEMBER" },
  });

  // ---- Projects ----
  let projectAlpha = await db.project.findFirst({
    where: { name: "Project Alpha - Cardiac Telehealth Review", organizationId: orgOne.id },
  });
  if (!projectAlpha) {
    projectAlpha = await db.project.create({
      data: { name: "Project Alpha - Cardiac Telehealth Review", organizationId: orgOne.id },
    });
  }

  let projectBeta = await db.project.findFirst({
    where: { name: "Project Beta - Digital Adherence Review", organizationId: orgOne.id },
  });
  if (!projectBeta) {
    projectBeta = await db.project.create({
      data: { name: "Project Beta - Digital Adherence Review", organizationId: orgOne.id },
    });
  }

  // ---- Project-level memberships ----
  // Alpha: aisha (owner), ben (reviewer) — carla deliberately excluded
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: aisha.id, projectId: projectAlpha.id } },
    update: {},
    create: { userId: aisha.id, projectId: projectAlpha.id, role: "OWNER" },
  });
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: ben.id, projectId: projectAlpha.id } },
    update: {},
    create: { userId: ben.id, projectId: projectAlpha.id, role: "REVIEWER" },
  });

  // Beta: aisha (owner), ben (reviewer) — carla still excluded here too,
  // this is the project you'll use to prove she gets denied
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: aisha.id, projectId: projectBeta.id } },
    update: {},
    create: { userId: aisha.id, projectId: projectBeta.id, role: "OWNER" },
  });
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: ben.id, projectId: projectBeta.id } },
    update: {},
    create: { userId: ben.id, projectId: projectBeta.id, role: "REVIEWER" },
  });

  // ---- A couple of seed articles so the table isn't empty on first load ----
  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectAlpha.id, pmid: "38910001" } },
    update: {},
    create: {
      projectId: projectAlpha.id,
      pmid: "38910001",
      title: "Digital adherence tools for diabetes care: a randomized trial",
      authors: "Rao A; Chen L; Smith J",
      firstAuthor: "Rao A",
      journal: "Journal of Digital Health",
      publicationYear: 2024,
      doi: "10.1000/jdh.2024.001",
      status: "UNSCREENED",
    },
  });

  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectAlpha.id, pmid: "38910002" } },
    update: {},
    create: {
      projectId: projectAlpha.id,
      pmid: "38910002",
      title: "Remote monitoring after cardiac surgery",
      authors: "Williams P; Kumar S",
      firstAuthor: "Williams P",
      journal: "Clinical Cardiology Review",
      publicationYear: 2023,
      doi: "10.1000/ccr.2023.014",
      status: "INCLUDED",
    },
  });

  console.log("Seed complete:");
  console.log({
    users: { aisha: aisha.email, ben: ben.email, carla: carla.email },
    orgs: { orgOne: orgOne.slug, orgTwo: orgTwo.slug },
    projects: { projectAlpha: projectAlpha.id, projectBeta: projectBeta.id },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });