import { credentials } from '@grpc/grpc-js';
import { loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/statistics.proto');

const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const statisticsProto = loadPackageDefinition(packageDefinition).statistics;

/**
 * Cliente gRPC para el servicio de estadísticas
 * 
 * Este cliente se conecta al servidor gRPC para obtener estadísticas
 * en tiempo real sobre proyectos y tareas. Utiliza el protocolo gRPC
 * para una comunicación más eficiente que REST.
 * 
 * @param userId - ID del usuario para obtener sus estadísticas
 * @returns Estadísticas del usuario incluyendo proyectos y tareas
 */
export async function getStatistics(userId: number): Promise<{
  project_count: number;
  task_count: number;
  completed_task_count: number;
}> {
  return new Promise((resolve, reject) => {
    // Create gRPC client
    const client = new (statisticsProto as any).StatisticsService(
      'localhost:50051',
      credentials.createInsecure()
    );

    // Make gRPC call
    client.getStatistics({ user_id: userId }, (error: any, response: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({
        project_count: response.project_count,
        task_count: response.task_count,
        completed_task_count: response.completed_task_count,
      });
    });
  });
}