import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Project, Task } from "@db/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.REPL_ID || "your-secret-key";

interface WebSocketMessage {
  type: "PROJECT_UPDATED" | "TASK_UPDATED" | "PROJECT_CREATED" | "TASK_CREATED" | "AUTH";
  payload?: Project | Task;
  token?: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAuthenticated?: boolean;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on("connection", (ws: AuthenticatedWebSocket) => {
    console.log("New WebSocket connection");

    ws.on("message", (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());

        if (data.type === 'AUTH' && data.token) {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET) as { userId: number };
            ws.userId = decoded.userId;
            ws.isAuthenticated = true;
            console.log(`WebSocket authenticated for user ${ws.userId}`);
          } catch (error) {
            console.error('Invalid WebSocket authentication token');
            ws.close();
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return {
    broadcast: (message: WebSocketMessage) => {
      wss.clients.forEach((client: AuthenticatedWebSocket) => {
        if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
          client.send(JSON.stringify(message));
        }
      });
    },
  };
}