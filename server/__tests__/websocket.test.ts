/**
 * Pruebas unitarias para el servicio WebSocket
 * 
 * Este archivo verifica el funcionamiento correcto de:
 * - Conexión y autenticación de WebSocket
 * - Envío y recepción de mensajes
 * - Manejo de desconexiones
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { WebSocket } from 'ws';
import { setupWebSocket } from '../websocket';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

describe('WebSocket Service', () => {
  let server: any;
  let wss: any;
  const port = 50053;
  const JWT_SECRET = 'test-secret';

  beforeAll(() => {
    server = createServer();
    wss = setupWebSocket(server);
    server.listen(port);
  });

  afterAll(() => {
    server.close();
  });

  it('should authenticate client with valid token', (done) => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET);
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'AUTH',
        token
      }));
    });

    // Esperar un poco para la autenticación
    setTimeout(() => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    }, 100);
  });

  it('should close connection with invalid token', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'AUTH',
        token: 'invalid-token'
      }));
    });

    ws.on('close', () => {
      done();
    });
  });

  it('should broadcast messages to authenticated clients', (done) => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET);
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    let messageReceived = false;

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'AUTH',
        token
      }));

      // Simular broadcast después de la autenticación
      setTimeout(() => {
        wss.broadcast({
          type: 'PROJECT_UPDATED',
          payload: { id: 1, title: 'Updated Project' }
        });
      }, 100);
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'PROJECT_UPDATED') {
        messageReceived = true;
        expect(message.payload).toHaveProperty('title', 'Updated Project');
        ws.close();
      }
    });

    ws.on('close', () => {
      expect(messageReceived).toBe(true);
      done();
    });
  });
});
