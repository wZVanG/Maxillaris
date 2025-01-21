/**
 * Pruebas unitarias para el servicio gRPC de estadísticas
 * 
 * Este archivo verifica el correcto funcionamiento del servicio de estadísticas,
 * incluyendo la conexión gRPC y el cálculo de métricas.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { credentials } from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { startGrpcServer } from '../grpc/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Statistics gRPC Service', () => {
  let server: any;
  let client: any;

  beforeAll(async () => {
    // Iniciar el servidor gRPC en un puerto de prueba
    const testPort = 50052;
    server = await startGrpcServer(testPort);

    // Cargar la definición del proto
    const packageDefinition = protoLoader.loadSync(
      path.resolve(__dirname, '../../proto/statistics.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    // Crear el cliente gRPC
    const proto = grpc.loadPackageDefinition(packageDefinition);
    client = new proto.statistics.StatisticsService(
      `localhost:${testPort}`,
      credentials.createInsecure()
    );
  });

  afterAll(() => {
    if (server) {
      server.forceShutdown();
    }
  });

  it('should return correct statistics for a user', (done) => {
    client.getStatistics({ userId: 1 }, (err: any, response: any) => {
      expect(err).toBeNull();
      expect(response).toHaveProperty('projectCount');
      expect(response).toHaveProperty('taskCount');
      expect(response).toHaveProperty('completedTaskCount');
      expect(typeof response.projectCount).toBe('number');
      done();
    });
  });

  it('should handle invalid user IDs gracefully', (done) => {
    client.getStatistics({ userId: -1 }, (err: any, _response: any) => {
      expect(err).not.toBeNull();
      expect(err.code).toBe(grpc.status.INVALID_ARGUMENT);
      done();
    });
  });

  it('should update statistics in real-time', async () => {
    // Primera lectura
    const stats1 = await new Promise((resolve, reject) => {
      client.getStatistics({ userId: 1 }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });

    // Crear un nuevo proyecto (esto debería actualizar las estadísticas)
    await db.insert(projects).values({
      title: 'Test Project',
      description: 'Test Description',
      userId: 1,
    });

    // Segunda lectura
    const stats2 = await new Promise((resolve, reject) => {
      client.getStatistics({ userId: 1 }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });

    expect(stats2.projectCount).toBe(stats1.projectCount + 1);
  });
});
