import fs from "fs";

export const appAndServerFile = (useTypescript) => {
  fs.writeFileSync(
    useTypescript ? "src/app.ts" : "src/app.js",
    `
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { middlewareErrorHandler } from "./middleware/error";

import swaggerUi from "swagger-ui-express";
import OPENAPI_DOCS_SPEC from "./swagger-docs/swagger";

export const app = express();

// body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(OPENAPI_DOCS_SPEC));

// Testing api
app.get("/api/test", (request: Request, response: Response) => {
  response.status(200).send({
    success: true,
    message: "Your API is working fine",
  });
});

// Unknown API route
app.all("*", (request: Request, response: Response) => {
  response.status(404).send({
    success: false,
    message: \`\${request.originalUrl} route you are trying to reach does not exist\`,
  });
});

app.use(middlewareErrorHandler);
`
  );
  console.log("Adding server.ts or server.js config file");
  fs.writeFileSync(
    useTypescript ? "src/server.ts" : "src/server.js",
    `
import { app } from "./app";
import "dotenv/config";
import connectDB from "./utils/db";

const PORT = process.env.PORT || 3000;
// create server
app.listen(PORT, () => {
  console.log(\`Server is connected at port \${PORT}\`);
  connectDB();
});
`
  );
};
