import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { db } from "@db";
import { projects, tasks } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  const httpServer = createServer(app);
  const wsServer = setupWebSocket(httpServer);

  // Projects
  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { title, description } = req.body;
    const [project] = await db
      .insert(projects)
      .values({
        title,
        description,
        userId: req.user.id,
      })
      .returning();

    wsServer.broadcast({
      type: "PROJECT_CREATED",
      payload: project,
    });

    res.json(project);
  });

  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userProjects = await db.query.projects.findMany({
      with: {
        tasks: true,
      },
      where: eq(projects.userId, req.user.id),
    });

    res.json(userProjects);
  });

  // Tasks
  app.post("/api/projects/:projectId/tasks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const projectId = parseInt(req.params.projectId);
    const { title, description } = req.body;

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project || project.userId !== req.user.id) {
      return res.status(404).send("Project not found");
    }

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        projectId,
        userId: req.user.id,
      })
      .returning();

    wsServer.broadcast({
      type: "TASK_CREATED",
      payload: task,
    });

    res.json(task);
  });

  app.patch("/api/tasks/:taskId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const taskId = parseInt(req.params.taskId);
    const { completed } = req.body;

    const [updatedTask] = await db
      .update(tasks)
      .set({ completed })
      .where(eq(tasks.id, taskId))
      .returning();

    wsServer.broadcast({
      type: "TASK_UPDATED",
      payload: updatedTask,
    });

    res.json(updatedTask);
  });

  // Statistics
  app.get("/api/statistics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const projectCount = await db
      .select({ count: db.fn.count() })
      .from(projects)
      .where(eq(projects.userId, req.user.id));

    const taskCount = await db
      .select({ count: db.fn.count() })
      .from(tasks)
      .where(eq(tasks.userId, req.user.id));

    const completedTaskCount = await db
      .select({ count: db.fn.count() })
      .from(tasks)
      .where(eq(tasks.userId, req.user.id))
      .where(eq(tasks.completed, true));

    res.json({
      projectCount: parseInt(projectCount[0].count.toString()),
      taskCount: parseInt(taskCount[0].count.toString()),
      completedTaskCount: parseInt(completedTaskCount[0].count.toString()),
    });
  });

  return httpServer;
}
