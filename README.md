# create-node-app

`create-node-app` is a powerful CLI tool that helps developers quickly scaffold a Node.js project with integrated database configuration, ORM setup, and optional TypeScript support. The tool also includes support for popular frameworks such as Express, Fastify, and Nest, as well as built-in Swagger documentation configuration for API development.

## Features

- **Framework Choices**: Select from popular Node.js frameworks like Express, Fastify, and Nest.
- **Database Integration**: Set up MongoDB, PostgreSQL, or MySQL with ease.
- **ORM Support**: Automatically configure ORM like Mongoose, Prisma, or DrizzleORM.
- **TypeScript or JavaScript**: Choose whether to set up the project with TypeScript or JavaScript.
- **Swagger Documentation**: Automatically includes Swagger API docs setup with customizable folder structure for your APIs endpoint and Schemas.
- **Linting and Formatting**: Integrated ESLint and Prettier setup for code quality.
- **Environment Configuration**: Pre-configured `.env` sample file for setting up environment variables.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (or **yarn**)

## Installation

You can install `create-node-app` via **npx**, **yarn**, or **pnpm**:

### Usage
```bash
npx create-node-app@latest
yarn create create-node-app
pnpm dlx create-node-app@latest
```
After running the command, follow the prompts to configure your project you'll be asked to select:
**Framework: Express, Fastify, or Nest**.
**Database: MongoDB, PostgreSQL, or MySQL**.
**ORM: Mongoose, Prisma, or DrizzleORM**.
**TypeScript or JavaScript**.

## Folder Structure

The CLI generates a project with the following folder structure

```
my-app/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── swagger-docs/
│   │   ├── swagger-api-docs/
│   │   └── swagger-schema-docs/
│   └── utils/
│
├── .env.sample
├── .gitignore
├── package.json
├── tsconfig.json (if using TypeScript)
└── README.md
```

## Swagger Documentation
The project includes built-in Swagger documentation configuration to help you document and visualize your API. By default, the Swagger docs are available at:
```bash
    /api-docs
```

## Environment Variables

You can configure your environment by copying the .env.sample file to .env and setting the appropriate values for your project.

```bash
    cp .env.sample .env
```

## Available Scripts

Here are some useful npm scripts to help you manage the project:

- **Start the development server**:
  ```bash
  npm run dev
  ```

- **Build the project**:
  ```bash
  npm run build
  ```

- **Lint your code**:
  ```bash
  npm run lint
  ```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature-branch).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
