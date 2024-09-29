import fs from "fs";

export const createBasicFiles = (projectName) => {
  fs.writeFileSync(
    "package.json",
    JSON.stringify(
      {
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
      },
      null,
      2
    )
  );

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
    JSON.stringify(
      {
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "es5",
        printWidth: 80,
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    "README.md",
    `# ${projectName}

This is a Node.js project generated with **Create Node App CLI**.

## Getting Started

To get started with this project, follow these steps:

1. **Install dependencies**:

   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

2. **Run the development server**:

   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

   Open [http://localhost:3000/test](http://localhost:3000/tset) with your browser to see the result.

You can start editing the project by modifying the files inside the \`src/\` directory. The server will auto-reload when you save your changes.

## Project Structure

The project is structured as follows:

\`\`\`
${projectName}/
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
\`\`\`

## Available Scripts

Here are some useful npm scripts to help you manage the project:

- **Start the development server**:
  \`\`\`bash
  npm run dev
  \`\`\`

- **Build the project**:
  \`\`\`bash
  npm run build
  \`\`\`

- **Lint your code**:
  \`\`\`bash
  npm run lint
  \`\`\`

## Learn More

To learn more about Node.js or the frameworks used in this project, take a look at the following resources:

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express Documentation](https://expressjs.com/) (or Fastify/Nest, depending on the framework chosen)

## Contributing

Contributions are welcome! If you find any issues or have suggestions to improve this project, feel free to open an issue or submit a pull request.

---

This project is licensed under the MIT License.
`
  );
};
