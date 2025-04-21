#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

async function init() {
  console.log("\n📦 Welcome to Express + TypeScript Project Generator!\n");

  // Ask user for the folder name
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "folder",
      message: "Enter folder name:",
      default: "backend",
    },
  ]);

  const projectName = answers.folder;
  const projectPath = path.join(process.cwd(), projectName);

  // Create the project folder
  fs.mkdirSync(projectPath, { recursive: true });
  process.chdir(projectPath);

  const silentExec = (command) => execSync(command, { stdio: "ignore" });

  console.log(
    `\n🚀 Creating Express + TypeScript project in: ${projectName}\n`
  );

  silentExec("npm init -y");
  silentExec("npm i express cors dotenv");
  silentExec("npm i -D typescript @types/express @types/node @types/cors ts-node nodemon");
  silentExec("npx tsc --init"); 

  // // Initialize npm, TypeScript, and install dependencies
  // execSync("npm init -y", { stdio: "ignore" });
  // execSync("npx tsc --init", { stdio: "ignore" });
  // execSync("npm i express cors dotenv", { stdio: "ignore" });
  // execSync("npm i -D @types/express @types/node @types/cors ts-node nodemon", { stdio: "ignore" });

  // Create the `src` directory
  fs.mkdirSync("src", { recursive: true });

  // Create TypeScript entry file
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

  // Create `.gitignore`
  fs.writeFileSync(
    ".gitignore",
    `node_modules
dist
.env
  `
  );

  // Create `nodemon.json` for auto-reloading
  fs.writeFileSync(
    "nodemon.json",
    `{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node ./src/"
}
  `
  );

  // Update `tsconfig.json` to output compiled files to `dist/`
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

  // Create `.env` file
  fs.writeFileSync(
    ".env",
    `PORT=3000
# Add your environment variables here
`
  );

  // Update package.json with scripts
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.scripts = {
    ...packageJson.scripts,
    start: "tsc && node dist/index.js",
    dev: "nodemon -x ts-node src/",
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log("\n✅ Express TypeScript template setup complete!");
  console.log("\n👉 Next steps:");
  console.log(`cd ${projectName}`);
  console.log("npm run dev  # Start in development mode");
  console.log("npm start    # Build and run the project\n");
}

init();
