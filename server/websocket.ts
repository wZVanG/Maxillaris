import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Project, Task } from "@db/schema";

interface WebSocketMessage {
  type: "PROJECT_UPDATED" | "TASK_UPDATED" | "PROJECT_CREATED" | "TASK_CREATED";
  payload: Project | Task;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'  // Set a specific path for our WebSocket
  });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return {
    broadcast: (message: WebSocketMessage) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    },
  };
}