import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { existsSync } from "fs";
import { AddressInfo } from "net";
import { resolve } from "./utils";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Cross-Origin-Opener-Policy", "same-origin");
    res.append("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });

  if (existsSync(resolve(__dirname, "public"))) {
    console.log("public folder", resolve(__dirname, "public"));
    app.use(express.static(resolve(__dirname, "public")));
  }
  const server = app.listen(+APP_CROSSWORDS_PORT || 3011, () => {
    const url = `http://localhost:${(server.address() as AddressInfo).port}`;
    console.log(`server running at port ${url}`);
  });

  return { app, server };
}
