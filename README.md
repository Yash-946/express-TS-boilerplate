# 📦 Express + TypeScript Project Generator

A zero-config CLI tool to bootstrap an Express.js project with TypeScript in seconds — choose your favorite package manager: `npm`, `yarn`, `pnpm`, or `bun`.

## 🧑‍💻 Usage

You can run the CLI with `npx`:
```bash
npx @yash946/express-ts
```

## ✨ Features

- ⚙️ **TypeScript pre-configured** - Ready-to-use TypeScript setup
- 🚀 **Express.js boilerplate** - Complete setup with CORS and dotenv
- 📦 **Multiple package managers** - Support for npm, yarn, pnpm, and bun
- 🔄 **Hot reloading** - Automatic restart on file changes
- 🗂️ **Clean project structure** - Organized `src/` and `dist/` folders
- 🎯 **Git integration** - Automatic Git repository initialization
- ✨ **Interactive CLI** - Beautiful prompts with loading animations
- 🎨 **Smart package management** - Optimized for each package manager

## 📦 Package Manager Support

### npm / yarn / pnpm
- Uses `nodemon` with `tsx` for hot reloading
- TypeScript compilation with `tsc`
- Full development environment setup

### bun
- Uses Bun's native `--watch` flag (no nodemon needed)
- Built-in TypeScript support
- Optimized build process with `bun build`

## 🚀 Generated Scripts

### For npm/yarn/pnpm projects:
```bash
npm run dev    # Start development server with hot reload
npm start      # Build and run production server
```

### For bun projects:
```bash
bun run dev    # Start development server with Bun's native watcher
bun run build  # Build project for production
bun run start  # Run production build
```

## 📁 Project Structure

```
your-project/
├── dist/                 # Compiled JavaScript (after build)
├── src/
│   └── index.ts          # Main application file
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── tsconfig.json        # TypeScript configuration
├── nodemon.json         # Nodemon config (npm/yarn/pnpm only)
└── package.json         # Project dependencies and scripts
```

## 🔧 What Gets Installed

### Dependencies
- `express` - Fast, unopinionated web framework
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable management

### Dev Dependencies
#### npm/yarn/pnpm:
- `@types/express`, `@types/node`, `@types/cors` - TypeScript definitions
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution engine
- `nodemon` - File watcher for development

#### bun:
- `@types/express`, `@types/cors` - TypeScript definitions
- Built-in TypeScript support (no additional packages needed)

## 🎯 Git Integration

The CLI automatically:
- Initializes a new Git repository
- Creates initial commit with all generated files
- Sets up proper `.gitignore` for Node.js projects

## ✨ CLI Experience

- 🎨 **Beautiful interface** with emojis and clear prompts
- ⏳ **Loading animations** during package installation
- ✅ **Progress indicators** for each setup step
- 🔇 **Silent installation** - no verbose logs cluttering output

---