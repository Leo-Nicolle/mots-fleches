import { Express } from "express";
import { Server } from "http";
import { createHttpTerminator } from 'http-terminator';

/**
 * Controller for ping and exiting the server
 */
export default function exitController({
  app,
  server,
}: {
  app: Express;
  server: Server;
}) {
  const terminator = createHttpTerminator({ server });
  /**
   * Ping the server
   */
  app.get("/ping", async (req, res) => {
    res.status(200).send("Server is alive");
  });
  /**
   * Kill the server
   */
  app.get("/kill", async (req, res) => {
    res.status(200).send("Server is shutting down");
    console.log("Server is shutting down");
    terminator.terminate();
  });
}
