import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupWebSocket } from "./websocket";
import { db } from "@db";
import { projects, tasks } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wsServer = setupWebSocket(httpServer);

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    next();
  };

  // Projects
  app.post("/api/projects", requireAuth, async (req, res) => {
    const { title, description } = req.body;
    const [project] = await db
      .insert(projects)
      .values({
        title,
        description,
        userId: req.user!.id,
      })
      .returning();

    wsServer.broadcast({
      type: "PROJECT_CREATED",
      payload: project,
    });

    res.json(project);
  });

  app.get("/api/projects", requireAuth, async (req, res) => {
    const userProjects = await db.query.projects.findMany({
      with: {
        tasks: true,
      },
      where: eq(projects.userId, req.user!.id),
    });

    res.json(userProjects);
  });

  // Tasks
  app.post("/api/projects/:projectId/tasks", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const { title, description } = req.body;

    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, req.user!.id)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).send("Project not found");
    }

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        projectId,
        userId: req.user!.id,
      })
      .returning();

    wsServer.broadcast({
      type: "TASK_CREATED",
      payload: task,
    });

    res.json(task);
  });

  app.patch("/api/tasks/:taskId", requireAuth, async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const { completed } = req.body;

    const [task] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.userId, req.user!.id)
        )
      )
      .limit(1);

    if (!task) {
      return res.status(404).send("Task not found");
    }

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
  app.get("/api/statistics", requireAuth, async (req, res) => {
    const [projectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, req.user!.id));

    const [taskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.userId, req.user!.id));

    const [completedTaskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, req.user!.id),
          eq(tasks.completed, true)
        )
      );

    res.json({
      projectCount: Number(projectCount.count),
      taskCount: Number(taskCount.count),
      completedTaskCount: Number(completedTaskCount.count),
    });
  });

  return httpServer;
}