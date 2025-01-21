import path from 'path';
import { fileURLToPath } from 'url';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { db } from '@db';
import { projects, tasks } from '@db/schema';
import { eq, and, sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// En producción, no cargar el proto
const PROTO_PATH = process.env.NODE_ENV === 'production'
  ? null
  : path.join(__dirname, '../../proto/statistics.proto');

async function getStatistics(call: any, callback: any) {
  try {
    const userId = call.request.user_id;

    const [projectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [taskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const [completedTaskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, true)
        )
      );

    callback(null, {
      project_count: Number(projectCount.count),
      task_count: Number(taskCount.count),
      completed_task_count: Number(completedTaskCount.count),
    });
  } catch (error) {
    console.error('gRPC statistics error:', error);
    callback(error);
  }
}

export function startStatisticsServer(port: number = 50051) {
  // No iniciar el servidor gRPC en producción
  if (process.env.NODE_ENV === 'production') {
    console.log('gRPC server disabled in production');
    return null;
  }

  const packageDefinition = protoLoader.loadSync(PROTO_PATH!, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const statisticsProto = grpc.loadPackageDefinition(packageDefinition).statistics;
  const server = new grpc.Server();
  server.addService((statisticsProto as any).StatisticsService.service, { getStatistics });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      console.log(`gRPC server running at 0.0.0.0:${port}`);
      server.start();
    }
  );

  return server;
}