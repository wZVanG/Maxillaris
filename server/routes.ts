import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupWebSocket } from "./websocket";
import { db } from "@db";
import { projects, tasks, projectCollaborators, users } from "@db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wsServer = setupWebSocket(httpServer);

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
        collaborators: {
          with: {
            user: true
          }
        },
      },
      where: or(
        eq(projects.userId, req.user!.id),
        sql`${projects.id} IN (
          SELECT project_id 
          FROM ${projectCollaborators} 
          WHERE user_id = ${req.user!.id}
        )`
      ),
    });

    res.json(userProjects);
  });

  // Project Collaborators
  app.post("/api/projects/:projectId/collaborators", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const { username } = req.body;

    // Verificar que el usuario es el dueño del proyecto
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
      return res.status(404).send("Project not found or you're not the owner");
    }

    // Buscar al usuario por username
    const [userToAdd] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!userToAdd) {
      return res.status(404).send("User not found");
    }

    // Verificar si ya es colaborador
    const [existingCollaborator] = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userToAdd.id)
        )
      )
      .limit(1);

    if (existingCollaborator) {
      return res.status(400).send("User is already a collaborator");
    }

    // Añadir colaborador
    const [collaborator] = await db
      .insert(projectCollaborators)
      .values({
        projectId,
        userId: userToAdd.id,
      })
      .returning();

    wsServer.broadcast({
      type: "COLLABORATOR_ADDED",
      payload: {
        projectId,
        collaborator: {
          ...collaborator,
          user: userToAdd,
        },
      },
    });

    res.json(collaborator);
  });

  app.delete("/api/projects/:projectId/collaborators/:userId", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const collaboratorId = parseInt(req.params.userId);

    // Verificar que el usuario es el dueño del proyecto
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
      return res.status(404).send("Project not found or you're not the owner");
    }

    // Eliminar colaborador
    await db
      .delete(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, collaboratorId)
        )
      );

    wsServer.broadcast({
      type: "COLLABORATOR_REMOVED",
      payload: {
        projectId,
        userId: collaboratorId,
      },
    });

    res.json({ message: "Collaborator removed successfully" });
  });

  // Tasks
  app.post("/api/projects/:projectId/tasks", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const { title, description } = req.body;

    // Verificar que el usuario es dueño o colaborador del proyecto
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          or(
            eq(projects.userId, req.user!.id),
            sql`${projectId} IN (
              SELECT project_id 
              FROM ${projectCollaborators} 
              WHERE user_id = ${req.user!.id}
            )`
          )
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).send("Project not found or you don't have access");
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
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          eq(tasks.id, taskId),
          or(
            eq(projects.userId, req.user!.id),
            sql`${projects.id} IN (
              SELECT project_id 
              FROM ${projectCollaborators} 
              WHERE user_id = ${req.user!.id}
            )`
          )
        )
      )
      .limit(1);

    if (!task) {
      return res.status(404).send("Task not found or you don't have access");
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
    const userId = req.user!.id;

    // Get projects where user is owner or collaborator
    const [projectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        or(
          eq(projects.userId, userId),
          sql`${projects.id} IN (
            SELECT project_id 
            FROM ${projectCollaborators} 
            WHERE user_id = ${userId}
          )`
        )
      );

    // Get tasks from those projects
    const [taskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        or(
          eq(projects.userId, userId),
          sql`${projects.id} IN (
            SELECT project_id 
            FROM ${projectCollaborators} 
            WHERE user_id = ${userId}
          )`
        )
      );

    const [completedTaskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          or(
            eq(projects.userId, userId),
            sql`${projects.id} IN (
              SELECT project_id 
              FROM ${projectCollaborators} 
              WHERE user_id = ${userId}
            )`
          ),
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