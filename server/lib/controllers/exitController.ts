import { Express } from "express";
import { Server } from "http";
import { createHttpTerminator } from 'http-terminator';


export default function exitController({
  app,
  server,
}: {
  app: Express;
  server: Server;
}) {
  const terminator = createHttpTerminator({ server });
  app.get("/ping", async (req, res) => {
    res.status(200).send("Server is alive");
  });
  app.get("/kill", async (req, res) => {
    res.status(200).send("Server is shutting down");
    console.log("Server is shutting down");
    terminator.terminate();
  });
}
