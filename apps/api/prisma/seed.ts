import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Priority, PrismaClient, Status } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const WORKSPACE_SLUG = "dexter";

// Reproduces `rowSet()` in Pyramid Task App.dc.html — the same 3-item pattern
// backs the List groups, the Projects page, and every task's subtask table.
const ROW_PATTERN = [
  { priority: Priority.HIGH, dueDate: new Date("2026-09-12"), hasMember: "avatar" },
  { priority: Priority.LOW, dueDate: new Date("2026-09-15"), hasMember: "initials" },
  { priority: Priority.MEDIUM, dueDate: new Date("2026-09-18"), hasMember: "none" },
] as const;

const BOARD_COLUMNS: { status: Status; cards: { title: string; who: string; due: string; tags: string[] }[] }[] = [
  {
    status: Status.TODO,
    cards: [
      { title: "Write API Documentation", who: "Admin", due: "2026-07-29", tags: ["Deployment", "Deployment"] },
      { title: "Implement Search Function", who: "Admin", due: "2026-07-29", tags: ["Deployment", "Deployment"] },
      { title: "Deploy to Production", who: "Admin", due: "2026-07-29", tags: ["Deployment", "Deployment"] },
    ],
  },
  {
    status: Status.DOING,
    cards: [
      { title: "Code Review Completed", who: "Admin", due: "2026-07-29", tags: ["Deployment", "Deployment"] },
      { title: "Design Mockups Finalized", who: "Admin", due: "2026-07-29", tags: ["Deployment", "Deployment"] },
    ],
  },
  {
    status: Status.COMPLETED,
    cards: [
      { title: "Feature Testing Passed", who: "QA Team", due: "2026-07-30", tags: ["Testing", "Passed"] },
      { title: "UI Design Updated", who: "Designer", due: "2026-07-31", tags: ["Design", "Updated"] },
      { title: "Security Audit Scheduled", who: "Security", due: "2026-08-01", tags: ["Audit", "Scheduled"] },
    ],
  },
  {
    status: Status.ON_HOLD,
    cards: [
      { title: "UI Review Pending", who: "Design Team", due: "2026-08-02", tags: ["Review", "Blocked"] },
      { title: "Backend Migration", who: "Dev Team", due: "2026-08-04", tags: ["Developer", "Infra"] },
      { title: "User Feedback Review", who: "Product", due: "2026-08-06", tags: ["Research", "Queued"] },
      { title: "Performance Tuning", who: "Engineering", due: "2026-08-08", tags: ["Optimise", "Later"] },
    ],
  },
];

const PROJECT_NAMES = ["Design Homepage", "Develop Login Feature", "Test Payment Gateway"];
const LABEL_NAMES = ["Research", "Design", "Development", "Testing", "Deployment"];
const LIST_STATUSES = [Status.TODO, Status.DOING, Status.COMPLETED];

async function upsertUser(email: string, fullName: string, isGuest = false) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, fullName, isGuest },
  });
}

async function main() {
  // Wipe in FK-dependency order so re-running the seed is idempotent.
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const guest = await upsertUser("guest@pyramid.local", "Guest User", true);
  const teamUsers = Object.fromEntries(
    await Promise.all(
      ["Admin", "QA Team", "Designer", "Security", "Design Team", "Dev Team", "Product", "Engineering"].map(
        async (name) => [name, await upsertUser(`${name.toLowerCase().replace(/\s+/g, "-")}@pyramid.local`, name)],
      ),
    ),
  ) as Record<string, Awaited<ReturnType<typeof upsertUser>>>;
  const ankit = await upsertUser("ankit.dutta@pyramid.local", "Ankit Dutta");

  const workspace = await prisma.workspace.create({
    data: { name: "Dexter's Workspace", slug: WORKSPACE_SLUG },
  });

  await prisma.membership.create({
    data: { userId: guest.id, workspaceId: workspace.id, role: "OWNER" },
  });

  await prisma.userPreference.create({
    data: {
      userId: guest.id,
      listFields: { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false },
      boardFields: { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false },
      activeWorkspaceId: workspace.id,
    },
  });

  const labels = Object.fromEntries(
    await Promise.all(
      LABEL_NAMES.map(async (name) => [
        name,
        await prisma.label.create({ data: { workspaceId: workspace.id, name } }),
      ]),
    ),
  ) as Record<string, Awaited<ReturnType<typeof prisma.label.create>>>;

  // Projects double as the List/Projects-page row set (rowSet(taskNames) in the reference).
  const projectLeads = [teamUsers["Designer"].id, teamUsers["Product"].id, null];
  const projects = await Promise.all(
    PROJECT_NAMES.map((name, i) =>
      prisma.project.create({
        data: {
          workspaceId: workspace.id,
          name,
          priority: ROW_PATTERN[i].priority,
          dueDate: ROW_PATTERN[i].dueDate,
          leadId: projectLeads[i],
          position: i,
        },
      }),
    ),
  );

  // Board (refs 02, 12): 4 columns, cards keep their reference title/assignee/due/tags.
  let writeApiDocsTask: Awaited<ReturnType<typeof prisma.task.create>> | undefined;
  for (const column of BOARD_COLUMNS) {
    for (const [position, card] of column.cards.entries()) {
      const task = await prisma.task.create({
        data: {
          workspaceId: workspace.id,
          title: card.title,
          status: column.status,
          position,
          dueDate: new Date(card.due),
          assigneeId: teamUsers[card.who]?.id,
          tags: card.tags,
        },
      });
      if (card.title === "Write API Documentation") writeApiDocsTask = task;
    }
  }
  if (!writeApiDocsTask) throw new Error("seed: Write API Documentation card missing from BOARD_COLUMNS");

  // List (refs 04, 05, 09): each status group repeats the same 3 named rows, linked to their project.
  for (const status of LIST_STATUSES) {
    for (const [i, project] of projects.entries()) {
      await prisma.task.create({
        data: {
          workspaceId: workspace.id,
          projectId: project.id,
          title: project.name,
          status,
          priority: ROW_PATTERN[i].priority,
          dueDate: ROW_PATTERN[i].dueDate,
          position: i,
        },
      });
    }
  }

  // Task detail (refs 06, 08): enrich the "Write API Documentation" TODO card in place.
  await prisma.task.update({
    where: { id: writeApiDocsTask.id },
    data: {
      description:
        "Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.",
      priority: Priority.HIGH,
      dueDate: new Date("2026-07-31"),
      assigneeId: teamUsers["Designer"].id,
      reporterId: ankit.id,
      team: "Product",
      labels: { create: LABEL_NAMES.map((name) => ({ labelId: labels[name].id })) },
    },
  });

  const subtaskTitles = ["Subtask 1", "Subtask 2", "Subtask 3"];
  const subtaskAssignees = [teamUsers["Admin"].id, teamUsers["QA Team"].id, null];
  for (const [i, title] of subtaskTitles.entries()) {
    await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        parentId: writeApiDocsTask.id,
        title,
        priority: ROW_PATTERN[i].priority,
        dueDate: ROW_PATTERN[i].dueDate,
        assigneeId: subtaskAssignees[i],
        position: i,
      },
    });
  }

  await prisma.comment.create({
    data: {
      taskId: writeApiDocsTask.id,
      authorId: ankit.id,
      body: "Drafted the endpoint reference — needs a pass on auth examples.",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        taskId: writeApiDocsTask.id,
        actorId: ankit.id,
        verb: "priority_changed",
        meta: { from: "No priority", to: "Urgent" },
      },
      {
        taskId: writeApiDocsTask.id,
        actorId: ankit.id,
        verb: "posted_update",
        meta: { month: "Aug 2026" },
      },
    ],
  });

  console.log(`Seeded workspace "${workspace.slug}" for ${guest.email}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
