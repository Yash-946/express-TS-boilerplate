#!/usr/bin/env node

const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Async version with loading
async function execWithLoading(command, message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`${message} `);
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${message} ${frames[i++ % frames.length]}`);
  }, 100);
  
  try {
    await execAsync(command);
    clearInterval(interval);
    process.stdout.write(`\r${message} ✅\n`);
  } catch (error) {
    clearInterval(interval);
    process.stdout.write(`\r${message} ❌\n`);
    throw error;
  }
}

// Simple loading spinner for synchronous operations
function showLoading(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`${message} `);
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${message} ${frames[i++ % frames.length]}`);
  }, 100);
  
  return () => {
    clearInterval(interval);
    process.stdout.write(`\r${message} ✅\n`);
  };
}

async function init() {
  const startTime = Date.now();
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
    await execWithLoading("bun init -y", "Initializing project");
    
    await execWithLoading("bun add express cors dotenv", "Installing dependencies");
    await execWithLoading("bun add -d @types/express @types/cors", "Installing dev dependencies");

    const setupLoader = showLoading("Setting up project files");
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
      ".env",
      "# Add your environment variables here\nPORT=3000\n"
    );

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "bun --watch src/index.ts",
      start: "bun dist/index.js",
      build: "bun build src/index.ts --outdir=dist --target=bun",
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    setupLoader();

    // Initialize Git repository
    await execWithLoading("git init", "Initializing Git repository");
    await execWithLoading("git add .", "Adding files to Git");
    await execWithLoading('git commit -m "Initial commit"', "Creating initial commit");

  } else {
    // Init project
    let initCmd;
    switch (packageManager) {
      case "yarn":
        initCmd = "yarn init -y";
        break;
      case "pnpm":
        initCmd = "npm init -y";
        break;
      default:
        initCmd = "npm init -y";
    }
    await execWithLoading(initCmd, "Initializing project");

    // Install dependencies
    const installCmd = (pkgs, dev = false) => {
      return packageManager === "yarn"
        ? `yarn add ${dev ? "-D" : ""} ${pkgs}`
        : packageManager === "pnpm"
        ? `pnpm add ${dev ? "-D" : ""} ${pkgs}`
        : `npm install ${dev ? "-D" : ""} ${pkgs}`;
    };

    await execWithLoading(installCmd("express cors dotenv"), "Installing dependencies");
    await execWithLoading(
      installCmd("@types/express @types/node @types/cors tsx nodemon typescript", true),
      "Installing dev dependencies"
    );

    await execWithLoading("npx tsc --init", "Setting up TypeScript");
    

    // Setup files
    const setupLoader = showLoading("Setting up project files");
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
  "watch": ["src", ".env"],
  "ext": "ts,js,json,env",
  "ignore": [
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "dist/",
    "node_modules/",
    "*.log",
    "coverage/",
    ".git/"
  ],
  "exec": "tsx src/index.ts",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": 1000,
  "verbose": true,
  "restartable": "rs",
  "colours": true,
  "legacyWatch": false,
  "signal": "SIGTERM",
  "stdout": true
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
      "# Add your environment variables here\nPORT=3000\n"
    );

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      start: "tsc && node dist/index.js",
      dev: "nodemon",
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    setupLoader();

    // Initialize Git repository
    await execWithLoading("git init", "Initializing Git repository");
    await execWithLoading("git add .", "Adding files to Git");
    await execWithLoading('git commit -m "Initial commit"', "Creating initial commit");
  }
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(1);
  
  console.log("\n👉 Next steps:");
  console.log(`cd ${projectName}`);
  console.log(`${packageManager} run dev  # Start in development mode`);
  if(packageManager === "bun"){
    console.log(`${packageManager} run build    # Build the project`);
    console.log(`${packageManager} run start    # start the project`);
  }else{
    console.log(`${packageManager} start    # Build and run the project`);
  }
  console.log(`\n✨ Project created successfully in ${totalTime}s!\n`);
}

init();