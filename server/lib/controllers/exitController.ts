import { Express } from "express";
import { Server } from "http";

function exit(server: Server, timeout = 10_000) {
  return setTimeout(() => {
    if (
      process.env.nobail ||
      APP_CROSSWORDS_MODE === "dev" ||
      APP_CROSSWORDS_MODE === "test"
    )
      return;
    server.close();
  }, timeout);
}

export default function gridController({
  app,
  server,
}: {
  app: Express;
  server: Server;
}) {
  let timeout = exit(server);
  app.get("/ping", async (req, res) => {
    clearTimeout(timeout);
    timeout = exit(server);
    res.send(200);
  });
}
