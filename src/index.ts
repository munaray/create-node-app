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
  .description("CLI to scaffold a Node.js project with database and ORM setup")
  .version("1.0.0");

program
  .command("new <project-name>")
  .description("create a new Node.js project")
  .action(async (projectName: string) => {
    const spinner = ora("Initializing project...").start();
    const projectPath = path.join(process.cwd(), projectName);

    try {
      // Check if project folder already exists
      if (fs.existsSync(projectPath)) {
        spinner.fail(
          chalk.red(`Project folder ${projectName} already exists.`)
        );
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

      spinner.text = `Creating project folder ${projectName}`;
      fs.mkdirSync(projectPath);
      process.chdir(projectPath);
      execSync("npm init -y", { stdio: "inherit" });

      // Create basic project structure in src folder
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

      // Add basic files
      const createBasicFiles = () => {
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
          ".prettierrc",
          JSON.stringify({
            semi: true,
            singleQuote: false,
            tabWidth: 2,
            trailingComma: "es5",
            printWidth: 80,
          })
        );
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
        fs.writeFileSync(
          "README.md",
          `# ${projectName}\n\nGenerated with create-node-app CLI.\n`
        );
      };

      createBasicFiles();

      if (useTypescript) {
        spinner.text = "Setting up TypeScript...";
        execSync(
          "npm install typescript @types/node ts-node nodemon --save-dev",
          { stdio: "inherit" }
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
      } else {
        fs.writeFileSync(
          "src/index.js",
          "// Entry point\nconsole.log('Hello JavaScript!');"
        );
        execSync("npm install nodemon --save-dev", { stdio: "inherit" });
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
      } else {
        execSync(
          `npm install ${framework.toLowerCase()} dotenv cors cookie-parser swagger-ui-express `,
          {
            stdio: "inherit",
          }
        );
        if (framework === "Express") {
          fs.writeFileSync(
            useTypescript ? "src/app.ts" : "src/app.js",
            `
import ${framework.toLowerCase()}, {Request, Response} from '${framework.toLowerCase()}';
import cors from "cors";
import cookieParser from "cookie-parser"
import "dotenv/config";
import {middlewareErrorHandler} from "./middleware/error"

// Pls make sure to add all your route end point into index.ts inside route folder
import routes from "./routes/index";

import swaggerUi from "swagger-ui-express";
import OPENAPI_DOCS from "./swagger-docs/swagger";

export const app = ${framework.toLowerCase()}();

// body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// routes
app.use("/api/v1", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(OPENAPI_DOCS));

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
    // Pls remove the quote from ${"request.originalUrl"} and delete this comment
    message: ${"request.originalUrl"} route you are trying to reach does not exist,
  });
});

app.use(middlewareErrorHandler);

`
          );
          fs.writeFileSync(
            "src/server.ts",
            `
import { app } from "./app";
import "dotenv/config";
import connectDB from "./utils/db";

const PORT = process.env.PORT || 3001;
// create server
app.listen(PORT, () => {
  console.log(Server is connected at port ${"PORT"});
  connectDB();
});
`
          );
        }
      }

      spinner.text = `Installing ${orm} and setting up ${database}...`;
      if (orm === "Mongoose") {
        execSync("npm install mongoose", { stdio: "inherit" });
        fs.writeFileSync(
          useTypescript ? "src/utils/db.ts" : "src/utils/db.js",
          `
import mongoose from "mongoose";
import "dotenv/config";

const dbUrl: string = process.env.MONGODB_URL || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data) => {
    // Pls remove the quote around data.connection.host
      console.log(Database connected to ${"data.connection.host"});
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

      spinner.succeed(
        chalk.green(`Project ${projectName} created successfully!`)
      );
      console.log(chalk.blue("Next steps:"));
      console.log(`1. ${chalk.green(`cd ${projectName}`)}`);
      console.log(`2. ${chalk.green("npm install")}`);
      console.log(
        `3. ${chalk.green("npm run dev")} to start development server`
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to create the project"));
      console.error(error);
    }
  });

program.parse(process.argv);
