import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../proto/statistics.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const statisticsProto = grpc.loadPackageDefinition(packageDefinition).statistics;

const client = new (statisticsProto as any).StatisticsService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

export function getStatistics(userId: number): Promise<{
  project_count: number;
  task_count: number;
  completed_task_count: number;
}> {
  return new Promise((resolve, reject) => {
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
