export interface PromptTypes {
  useTypescript: boolean;
  framework: "Express" | "Fastify" | "Nest";
  database: "MongoDB" | "PostgreSQL" | "MySQL";
  orm: "Mongoose" | "Prisma" | "DrizzleORM";
}
