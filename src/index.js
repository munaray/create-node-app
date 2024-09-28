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
  .command("new <project-name>")
  .description("create a new Node.js project")
  .action(async (projectName) => {
    const projectPath = path.join(process.cwd(), projectName);
    let spinner;

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

      spinner.text = "Running npm init...";
      execSync("npm init -y", { stdio: "inherit" });
      fs.writeFileSync(
        "package.json",
        JSON.stringify({
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
        })
      );

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
        console.log("Setting up TypeScript...");
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
        console.log("TypeScript setup completed!");
      } else {
        fs.writeFileSync(
          "src/index.js",
          "// Entry point\nconsole.log('Hello JavaScript!');"
        );
        execSync("npm install nodemon --save-dev", { stdio: "inherit" });
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
            stdio: "inherit",
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
import routes from "./routes/index";

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
    message: \${request.originalUrl} route you are trying to reach does not exist,
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

const PORT = process.env.PORT || 3001;
// create server
app.listen(PORT, () => {
  console.log(Server is connected at port \${PORT});
  connectDB();
});
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
      console.error(Error loading \${file}, error);
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
      console.error(Error loading \${file}, error);
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
    description: CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup
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

# // swagger.ts or swagger.js

const userSchema = yamlSchemaDocuments["sample-schema"];
follow this method to integrate all your yaml files
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
      console.log(Database connected to \${data.connection.host});
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

      // Initialize git and make the first commit
      spinner.text = "Initializing git repository...";
      execSync("git init", { stdio: "inherit" });
      execSync("git add .", { stdio: "inherit" });
      execSync('git commit -m "Initial commit from Node app"', {
        stdio: "inherit",
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
