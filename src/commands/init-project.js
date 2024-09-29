// commands/initProject.js
import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { execSync } from "child_process";
import { createBasicFiles } from "../blueprints/basic-file-templates.js";

export const initProject = async (projectName) => {
  const spinner = ora("Creating project directory...").start();
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    spinner.fail(`Project folder ${projectName} already exists.`);
    return;
  }

  try {
    // Create project folder
    fs.mkdirSync(projectPath);
    process.chdir(projectPath);

    // Initialize npm
    console.log(`${chalk.bgBlue("\nRunning npm init...")}`);
    execSync("npm init -y", { stdio: "ignore" });
    console.log("\nnpm initialized successfully");

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

    // Create the basic files
    createBasicFiles(projectName);
    spinner.succeed("Project initialized successfully!");
  } catch (error) {
    spinner.fail("Project creation failed!");
    console.error(error);
  }
};
