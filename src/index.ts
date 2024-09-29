#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import ora from "ora";
import { initProject } from "./commands/init-project";
import { setupFramework } from "./commands/setup-framework";
import { PromptTypes } from "./utils/types";
import { eslintFile } from "./blueprints/eslint-file-template";
import { mongoDBConfig } from "./utils/db";

const program = new Command();

program
  .name("create-node-app")
  .description(
    "CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup"
  )
  .version("1.0.0");

program
  .command("new [project-name]")
  .description("Create a new Node.js project")
  .action(async (projectName: string) => {
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

    try {
      const { useTypescript, framework, database, orm }: PromptTypes =
        await inquirer.prompt([
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
        ]);

      spinner = ora("Creating node app...").start();

      if (fs.existsSync(projectName)) {
        throw new Error(`Project name "${projectName}" already exists!`);
      } else {
        await initProject(projectName, useTypescript);
      }

      if (useTypescript) {
        console.log("Setting up TypeScript...");
        execSync(
          "npm install typescript @types/node ts-node nodemon --save-dev",
          { stdio: "ignore" }
        );

        console.log("TypeScript setup completed!");
      } else {
        execSync("npm install nodemon --save-dev", { stdio: "ignore" });
        console.log("JavaScript setup completed!");
      }

      setupFramework(framework, useTypescript);

      console.log(`Installing ${orm} and setting up ${database}...`);
      if (orm === "Mongoose") {
        execSync("npm install mongoose", { stdio: "ignore" });
        mongoDBConfig(useTypescript);
      } else if (orm === "Prisma") {
        execSync("npm install prisma @prisma/client", { stdio: "inherit" });
        execSync("npx prisma init", { stdio: "inherit" });
      }

      spinner.text = "Setting up eslint...";
      execSync("npm init @eslint/config", { stdio: "inherit" });
      eslintFile(useTypescript);

      // Initialize git and make the first commit
      spinner.text = "Initializing git repository...";
      execSync("git init", { stdio: "ignore" });
      execSync("git add .", { stdio: "ignore" });
      execSync("git commit -m 'Initial commit from Node app'", {
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
      spinner.stop();
    } catch (error) {
      spinner?.fail("Project creation failed!");
      console.error(error);
    }
  });

program.parse(process.argv);
