/**
 * Pruebas unitarias para el servicio gRPC de estadísticas
 * 
 * Este archivo verifica el funcionamiento correcto de:
 * - Conexión al servidor gRPC
 * - Obtención de estadísticas por usuario
 * - Manejo de errores y casos límite
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getStatistics } from '../grpc/client';
import { startGrpcServer } from '../grpc/server';
import { db } from '@db';
import { users, projects, tasks } from '@db/schema';

describe('gRPC Statistics Service', () => {
  let server: any;

  beforeAll(async () => {
    // Iniciar servidor gRPC en un puerto de prueba
    server = await startGrpcServer(50052);
    
    // Crear datos de prueba
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(users);

    const [user] = await db.insert(users).values({
      username: 'testuser',
      password: 'hashedpass'
    }).returning();

    const [project] = await db.insert(projects).values({
      title: 'Test Project',
      description: 'A test project',
      userId: user.id
    }).returning();

    await db.insert(tasks).values([
      {
        title: 'Task 1',
        description: 'Test task 1',
        projectId: project.id,
        completed: true
      },
      {
        title: 'Task 2',
        description: 'Test task 2',
        projectId: project.id,
        completed: false
      }
    ]);
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(users);
    
    // Cerrar servidor gRPC
    if (server) {
      await new Promise(resolve => server.tryShutdown(resolve));
    }
  });

  it('should return correct statistics for a user', async () => {
    const [user] = await db.select().from(users);
    const stats = await getStatistics(user.id);

    expect(stats).toEqual({
      project_count: 1,
      task_count: 2,
      completed_task_count: 1
    });
  });

  it('should handle non-existent users', async () => {
    await expect(getStatistics(999999)).rejects.toThrow();
  });
});
