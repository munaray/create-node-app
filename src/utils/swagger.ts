import fs from "fs";

export const swaggerConfig = (useTypescript: boolean) => {
  const swagger = useTypescript
    ? "src/swagger-docs/swagger.ts"
    : "src/swagger-docs/swagger.js";
  const swaggerContent = useTypescript
    ? `import YAML from "yamljs";
import path from "path";
import fs from "fs";

const yamlAPIDirectory = path.join(__dirname, "swagger-api-docs");
const yamlSchemaDirectory = path.join(__dirname, "swagger-schema-docs");

const yamlAPIDocuments: Record<string, any> = {};
const yamlSchemaDocuments: Record<string, any> = {};

// Read all files from the swagger-api-docs directory
fs.readdirSync(yamlAPIDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlAPIDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlAPIDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

// Read all files from the swagger-schema-docs directory
fs.readdirSync(yamlSchemaDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlSchemaDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlSchemaDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

const sampleAPI = yamlAPIDocuments["sample-api"];
const sampleSchema = yamlSchemaDocuments["sample-schema"];

const OPENAPI_DOCS_SPEC = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Create-Node-App-CLI tools",
    description: "CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup"
  },
  paths: {
    ...sampleAPI.paths,
  },
  components: {
    schemas: {
      ...sampleSchema.components.schemas,
    },
  },
};

export default OPENAPI_DOCS_SPEC;`
    : `import YAML from "yamljs";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const yamlAPIDirectory = path.join(__dirname, "swagger-api-docs");
const yamlSchemaDirectory = path.join(__dirname, "swagger-schema-docs");

const yamlAPIDocuments = {};
const yamlSchemaDocuments = {};

// Read all files from the swagger-api-docs directory
fs.readdirSync(yamlAPIDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlAPIDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlAPIDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

// Read all files from the swagger-schema-docs directory
fs.readdirSync(yamlSchemaDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlSchemaDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlSchemaDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error) {
      console.error(\`Error loading \${file}\`, error);
    }
  }
});

const sampleAPI = yamlAPIDocuments["sample-api"];
const sampleSchema = yamlSchemaDocuments["sample-schema"];

const OPENAPI_DOCS_SPEC = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Create-Node-App CLI tools",
    description: "CLI to scaffold a Node.js project with database, ORM and swagger ui documentation setup"
                ,
  },
  paths: {
    ...sampleAPI.paths,
  },
  components: {
    schemas: {
      ...sampleSchema.components.schemas,
    },
  },
};

export default OPENAPI_DOCS_SPEC;`;
  fs.writeFileSync(swagger, swaggerContent);
};
