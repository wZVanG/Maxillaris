import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = '/proto/statistics.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const statisticsProto = grpc.loadPackageDefinition(packageDefinition).statistics;

let client: any = null;

export function getStatisticsClient() {
  if (!client) {
    client = new (statisticsProto as any).StatisticsService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
  }
  return client;
}

export function getStatistics(userId: number): Promise<{
  project_count: number;
  task_count: number;
  completed_task_count: number;
}> {
  return new Promise((resolve, reject) => {
    const client = getStatisticsClient();
    client.getStatistics({ user_id: userId }, (error: any, response: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}
