#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const silentExec = (command) => execSync(command, { stdio: "inherit" });

async function init() {
  console.log("\n📦 Welcome to Express + TypeScript Project Generator!\n");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "folder",
      message: "Enter folder name:",
      default: "backend",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Choose a package manager:",
      choices: ["npm", "yarn", "pnpm", "bun"],
    },
  ]);

  const { packageManager } = answers;
  const rawFolderName = answers.folder;
  const projectName = rawFolderName.trim().toLowerCase().replace(/\s+/g, "-"); // replace spaces with dashes
  const projectPath = path.join(process.cwd(), projectName);


  fs.mkdirSync(projectPath, { recursive: true });
  process.chdir(projectPath);

  console.log(
    `\n🚀 Creating Express + TypeScript project in: ${projectName}\n`
  );

  if (packageManager == "bun") {
    // Init project
    silentExec("bun init -y");
    silentExec("bun add express cors dotenv");
    silentExec("bun add -d @types/express @types/cors nodemon");

    fs.mkdirSync("src", { recursive: true });
    fs.renameSync("index.ts", "src/index.ts");

    fs.writeFileSync(
      "src/index.ts",
      `import * as dotenv from "dotenv";
import express, { json } from 'express';
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(port, () => {
  console.log(\`🚀 Server is running at http://localhost:\${port}\`);
});
`
    );

    fs.writeFileSync(
      "nodemon.json",
      `{
  "watch": ["src"],
  "ext": "ts",
  "exec": "bun ./src/"
}`
    );

    fs.writeFileSync(
      ".env",
      "PORT=3000\n# Add your environment variables here\n"
    );

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "nodemon",
      start: "bun src/index.ts",
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  } else {
    // Init project
    switch (packageManager) {
      case "yarn":
        silentExec("yarn init -y");
        break;
      case "pnpm":
        silentExec("npm init -y");
        break;
      default:
        silentExec("npm init -y");
    }

    // Install dependencies
    const install = (pkgs, dev = false) => {
      const cmd =
        packageManager === "yarn"
          ? `yarn add ${dev ? "-D" : ""} ${pkgs}`
          : packageManager === "pnpm"
          ? `pnpm add ${dev ? "-D" : ""} ${pkgs}`
          : `npm install ${dev ? "-D" : ""} ${pkgs}`;
      silentExec(cmd);
    };

    install("express cors dotenv");
    install(
      "@types/express @types/node @types/cors ts-node nodemon typescript",
      true
    );

    
    silentExec("npx tsc --init");
    

    // Setup files
    fs.mkdirSync("src", { recursive: true });

    fs.writeFileSync(
      "src/index.ts",
      `import * as dotenv from "dotenv";
import express, { json } from 'express';
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(port, () => {
  console.log(\`🚀 Server is running at http://localhost:\${port}\`);
});
`
    );

    fs.writeFileSync(".gitignore", `node_modules\ndist\n.env\n`);

    fs.writeFileSync(
      "nodemon.json",
      `{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node ./src/"
}`
    );

    fs.writeFileSync(
      "tsconfig.json",
      JSON.stringify(
        {
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./src",
            module: "CommonJS",
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            skipLibCheck: true,
            target: "ES6",
            strict: true,
          },
        },
        null,
        2
      )
    );

    fs.writeFileSync(
      ".env",
      "PORT=3000\n# Add your environment variables here\n"
    );

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      start: "tsc && node dist/index.js",
      dev: "nodemon -x ts-node src/",
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  console.log("\n✅ Express TypeScript template setup complete!");
  console.log("\n👉 Next steps:");
  console.log(`cd ${projectName}`);
  console.log(`${packageManager} run dev  # Start in development mode`);
  console.log(`${packageManager} start    # Build and run the project\n`);
}

init();
