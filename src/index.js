#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .name("create-node-app")
  .description(
    "CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup"
  )
  .version("1.0.0");

program
  .command("[project-name]")
  .description("Create a new Node.js project")
  .action(async (projectName) => {
    // Prompt for project name if it's not provided
    if (!projectName) {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: `Enter your project name or use press enter to use default ${chalk.dim("›")}`,
          default: "my-app",
        },
      ]);
      projectName = answer.projectName;
    }

    let spinner;
    const projectPath = path.join(process.cwd(), projectName);

    try {
      // Check if project folder already exists
      if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Project folder ${projectName} already exists.`));
        return;
      }

      const { useTypescript, framework, database, orm } = await inquirer.prompt(
        [
          {
            type: "confirm",
            name: "useTypescript",
            message: "Do you want to use TypeScript?",
          },
          {
            type: "list",
            name: "framework",
            message: "Which Node.js framework would you like to use?",
            choices: ["Express", "Fastify", "Nest"],
          },
          {
            type: "list",
            name: "database",
            message: "Which database would you like to use?",
            choices: ["MongoDB", "PostgreSQL", "MySQL"],
          },
          {
            type: "list",
            name: "orm",
            message: "Which ORM would you like to use?",
            choices: (answers) => {
              if (answers.database === "MongoDB") {
                return ["Mongoose"];
              }
              return ["Prisma", "DrizzleORM"];
            },
          },
        ]
      );

      // Start spinner only after prompt
      spinner = ora("Initializing project...").start();

      // Create project folder and initialize npm project
      fs.mkdirSync(projectPath);
      process.chdir(projectPath);

      console.log(`${chalk.bgBlue("\nRunning npm init...")}`);
      execSync("npm init -y", { stdio: "ignore" });
      console.log("\nProject Initialized successfully");

      // Create basic project structure
      const srcDirs = [
        "controllers",
        "routes",
        "mails",
        "middleware",
        "schemas",
        "services",
        "swagger-docs",
        "utils",
      ];

      fs.mkdirSync("src");
      srcDirs.forEach((dir) => fs.mkdirSync(`src/${dir}`));

      // Create basic files
      const createBasicFiles = () => {
        fs.writeFileSync(
          "package.json",
          JSON.stringify(
            {
              name: `${projectName}`,
              version: "1.0.0",
              main: "server.js",
              module: "NodeNext",
              scripts: {
                test: 'echo "Error: no test specified" && exit 1',
                build: "tsc --build",
                start: "node ./build/server.js",
                dev: "nodemon ./src/server.ts",
                lint: "eslint",
              },
              keywords: [],
              author: "",
              license: "ISC",
              description: "",
            },
            null,
            2
          )
        );

        fs.writeFileSync(
          ".env.sample",
          `
PORT = 5000
ORIGIN = ["http://localhost:5000"]

NODE_DEV = development

// For MongoDB database
MONGODB_URL =

// For MySQL or PostgreSQL
DATABASE_URL =
DATABASE_PASSWORD =

// Redis for caching
REDIS_URL =

// JWT for secure authentication
JWT_ACTIVATION_SECRET =
JWT_ACCESS_TOKEN =
JWT_ACCESS_TOKEN_EXPIRE =
JWT_REFRESH_TOKEN =
JWT_REFRESH_TOKEN_EXPIRE =

// Sending mail using nodemailer
SMTP_HOST =
SMTP_PORT =
SMTP_SERVICES =
SMTP_MAIL =
SMTP_PASSWORD =
        `
        );
        fs.writeFileSync(".gitignore", "node_modules/\n.env\nbuild/\ndist/\n");
        fs.writeFileSync(
          ".prettierrc.json",
          JSON.stringify(
            {
              semi: true,
              singleQuote: false,
              tabWidth: 2,
              trailingComma: "es5",
              printWidth: 80,
            },
            null,
            2
          )
        );

        fs.writeFileSync(
          "README.md",
          `# ${projectName}\n\nGenerated with create-node-app CLI.\n`
        );
      };

      createBasicFiles();

      if (useTypescript) {
        spinner.text = "Setting up TypeScript...";
        console.log("Setting up TypeScript...");
        execSync(
          "npm install typescript @types/node ts-node nodemon --save-dev",
          { stdio: "ignore" }
        );
        fs.writeFileSync(
          "tsconfig.json",
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2020",
                module: "commonjs",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                outDir: "./build",
                baseUrl: "./",
                paths: {
                  "@/*": ["src/*"],
                },
              },
              include: ["src/**/*.ts"],
              exclude: ["node_modules", "build"],
            },
            null,
            2
          )
        );
        console.log("TypeScript setup completed!");
      } else {
        fs.writeFileSync(
          "src/index.js",
          "// Entry point\nconsole.log('Hello JavaScript!');"
        );
        execSync("npm install nodemon --save-dev", { stdio: "ignore" });
        console.log("JavaScript setup completed!");
      }

      spinner.text = `Installing ${framework} framework...`;

      if (framework === "Nest") {
        execSync("npm install @nestjs/core @nestjs/common rxjs dotenv", {
          stdio: "inherit",
        });
        execSync("npm install @nestjs/cli --save-dev", { stdio: "inherit" });
        fs.writeFileSync(
          "src/app.module.ts",
          `
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
`
        );
      } else if (framework === "Express") {
        spinner.text = "Setting up your express app...";
        execSync(
          `npm install express dotenv cors cookie-parser swagger-ui-express yamljs`,
          {
            stdio: "ignore",
          }
        );
        execSync(
          `npm install @types/express @types/dotenv @types/cors @types/cookie-parser @types/swagger-ui-express @types/yamljs --save-dev`,
          {
            stdio: "ignore",
          }
        );
        console.log("Adding app.ts or app.js config file");
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
        //
        spinner.text = "Implementing Error Handler middleware...";

        fs.writeFileSync(
          useTypescript
            ? "src/middleware/async-error.ts"
            : "src/middleware/async-error.js",
          `
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
  (asyncFunc: Function) =>
  (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(asyncFunc(request, response, next)).catch(next);
  };
 `
        );

        fs.writeFileSync(
          useTypescript ? "src/middleware/error.ts" : "src/middleware/error.js",
          `
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/error-handler";

export const middlewareErrorHandler = (
  err: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Set default error code and message if not set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Log the error for debugging purposes
  console.error("Error log:", err);

  // Wrong MongoDB ObjectId error (CastError)
  if (err.name === "CastError") {
    const message = \`Resource not found. Invalid: \${err.path}\`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value: any) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (MongoDB error)
  if (err.code === 11000) {
    const message = \`Duplicate field value entered: \${Object.keys(
      err.keyValue
    ).join(", ")}\`;
    err = new ErrorHandler(message, 400);
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // Missing required parameters
  if (err.name === "MissingRequiredParameters") {
    const message = "Missing required parameters.";
    err = new ErrorHandler(message, 400);
  }

  // Unauthorized access
  if (err.name === "UnauthorizedAccess") {
    const message = "Unauthorized access.";
    err = new ErrorHandler(message, 401);
  }

  // Forbidden access
  if (err.name === "ForbiddenAccess") {
    const message = "Forbidden access.";
    err = new ErrorHandler(message, 403);
  }

  // Send the error response
  response.status(err.statusCode).send({
    success: false,
    message: err.message,
  });
};
          `
        );

        fs.writeFileSync(
          "src/utils/error-handler.ts",
          `
          class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;

          `
        );

        spinner.text = "Configuring Swagger UI Documentation...";
        fs.mkdirSync("src/swagger-docs/swagger-api-docs");
        fs.mkdirSync("src/swagger-docs/swagger-schema-docs");

        fs.writeFileSync(
          useTypescript
            ? "src/swagger-docs/swagger.ts"
            : "src/swagger-docs/swagger.js",
          `
import YAML from "yamljs";
import path from "path";
import fs from "fs";

const yamlAPIDirectory = path.join(__dirname, "swagger-api-docs");
const yamlSchemaDirectory = path.join(__dirname, "swagger-schema-docs");

const yamlAPIDocuments: Record<string, any> = {};
const yamlSchemaDocuments: Record<string, any> = {};

// Read all files from the swagger-api-docs directory
fs.readdirSync(yamlAPIDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlAPIDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlAPIDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

// Read all files from the swagger-schema-docs directory
fs.readdirSync(yamlSchemaDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlSchemaDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlSchemaDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

const sampleAPI = yamlAPIDocuments["sample-api"];
const sampleSchema = yamlSchemaDocuments["sample-schema"];

const OPENAPI_DOCS_SPEC = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Create-Node-App CLI tools",
    description: "CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup"
                ,
  },
  paths: {
    ...sampleAPI.paths,
  },
  components: {
    schemas: {
      ...sampleSchema.components.schemas,
    },
  },
};

export default OPENAPI_DOCS_SPEC;

          `
        );
        fs.writeFileSync(
          "src/swagger-docs/swagger-api-docs/sample-api.yaml",
          `# Sample API YAML File

# This is a sample api YAML file (sample-api.yaml) to demonstrate the structure for documenting your API.

# To organize your api effectively, create separate YAML files for each API Controller (e.g., user-api.yaml, course-api.yaml), handling specific responsibilities for users and courses endpoints respectively.

# Integrate these YAML files into your swagger.ts or swagger.js file to consolidate your API documentation.

# Example:
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: APIs related to Users

servers:
  - url: /api/v1
    description: Local development server

paths:
  /register:
    post:
      tags:
        - Authentication
      summary: Register a new user
      operationId: userRegistration
      requestBody:
        description: Data required to register a new user
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
                - confirmPassword
              properties:
                name:
                  type: string
                  example: "John Doe"
                  description: "The user's full name"
                email:
                  type: string
                  format: email
                  example: "john.doe@example.com"
                  description: "The user's email address"
                password:
                  type: string
                  format: password
                  description: "The user's password"
                  example: "StrongPassword123!"
                confirmPassword:
                  type: string
                  format: password
                  description: "Confirm the user's password"
                  example: "StrongPassword123!"
      responses:
        '201':
          description: User successfully registered
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Please check your email: john.doe@example.com to activate your account"
                  activationToken:
                    type: string
                    description: "The activation token sent to the user's email"
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        '400':
          description: Bad request - Validation error
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Passwords do not match"
        '409':
          description: Conflict - Email already exists
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Email already exists"
      security: []

# // swagger.ts or swagger.js
# const userAPI = yamlAPIDocuments["user-api"];

# follow this method to integrate all your yaml files`
        );
        fs.writeFileSync(
          "src/swagger-docs/swagger-schema-docs/sample-schema.yaml",
          `# Sample Schema YAML File

# This is a sample schema YAML file (sample-schema.yaml) to demonstrate the structure for documenting your API.

# To organize your schemas effectively, create separate YAML files for each schema (e.g., user-schema.yaml, course-schema.yaml), each handling specific responsibilities.

# Import these YAML files into your swagger.ts or swagger.js file to consolidate your API documentation.

# Example:
components:
  schemas:
    User:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          description: Name of the user
        email:
          type: string
          description: Email address of the user
          format: email
        password:
          type: string
          description: User's password (hashed, not returned by default)
          format: password
        avatar:
          type: object
          properties:
            public_id:
              type: string
              description: Public ID of the user's avatar
            url:
              type: string
              description: URL of the user's avatar
          description: Avatar of the user
        role:
          type: string
          description: Role of the user, defaults to "user"
          example: user
        isVerified:
          type: boolean
          description: Whether the user is verified
          default: false
        courses:
          type: array
          items:
            type: object
            properties:
              courseId:
                type: string
                description: The course ID associated with the user
        createdAt:
          type: string
          format: date-time
          description: Timestamp when the user was created
        updatedAt:
          type: string
          format: date-time
          description: Timestamp when the user was last updated


# // swagger.ts or swagger.js

#const userSchema = yamlSchemaDocuments["sample-schema"];
#follow this method to integrate all your yaml files
`
        );
      } else {
        execSync(`npm install ${framework.toLowerCase()}`, {
          stdio: "inherit",
        });
      }

      spinner.text = `Installing ${orm} and setting up ${database}...`;
      console.log(`Installing ${orm} and setting up ${database}...`);
      if (orm === "Mongoose") {
        execSync("npm install mongoose", { stdio: "ignore" });
        fs.writeFileSync(
          useTypescript ? "src/utils/db.ts" : "src/utils/db.js",
          `
import mongoose from "mongoose";
import "dotenv/config";

const dbUrl: string = process.env.MONGODB_URL || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data) => {
      console.log(\`Database connected to \${data.connection.host}\`);
      });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
`
        );
      } else if (orm === "Prisma") {
        execSync("npm install prisma @prisma/client", { stdio: "inherit" });
        execSync("npx prisma init", { stdio: "inherit" });
      }

      spinner.text = "Setting up eslint...";
      execSync("npm init @eslint/config", { stdio: "inherit" });

      fs.writeFileSync(
        "eslint.config.mjs",
        `
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".config/*", "build/*"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      semi: ["error"],
      quotes: ["error", "double"],
    },
  },
];
`
      );

      // Initialize git and make the first commit
      spinner.text = "Initializing git repository...";
      execSync("git init", { stdio: "ignore" });
      execSync("git add .", { stdio: "ignore" });
      execSync('git commit -m "Initial commit from Node app"', {
        stdio: "ignore",
      });

      spinner.succeed(
        chalk.green(`Project ${projectName} created successfully!`)
      );
      console.log(chalk.blue("Next steps:"));
      console.log(`1. ${chalk.green(`cd ${projectName}`)}`);
      console.log(
        `3. ${chalk.green("npm run dev")} to start development server`
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to create the project"));
      console.error(error);
    }
  });

program.parse(process.argv);
