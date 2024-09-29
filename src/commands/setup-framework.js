import { execSync } from "child_process";
import fs from "fs";
import ora from "ora";
import { appAndServerFile } from "../blueprints/express-setup-files.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { swaggerConfig } from "../utils/swagger.js";
import { swaggerTemplate } from "../blueprints/swagger-file-template.js";
import chalk from "chalk";

export const setupFramework = (framework, useTypescript) => {
  console.log(chalk.bgBlue(`Installing ${framework} framework...`));

  try {
    if (framework === "Nest") {
      execSync("npm install @nestjs/core @nestjs/common rxjs dotenv", {
        stdio: "inherit",
      });
      execSync("npm install @nestjs/cli --save-dev", {
        stdio: "inherit",
      });
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
      console.log(`${chalk.green("Setting up your express app...")}`);

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
      appAndServerFile(useTypescript);

      ErrorHandler(useTypescript);

      fs.mkdirSync("src/swagger-docs/swagger-api-docs");
      fs.mkdirSync("src/swagger-docs/swagger-schema-docs");

      swaggerConfig(useTypescript);
      swaggerTemplate();
    } else {
      execSync(`npm install ${framework.toLowerCase()}`, {
        stdio: "inherit",
      });
    }
  } catch (error) {
    chalk.red(`Failed to install ${framework}`);
    console.error(error);
  }
};
