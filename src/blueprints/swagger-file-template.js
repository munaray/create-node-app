import fs from "fs";

export const swaggerTemplate = () => {
  fs.writeFileSync(
    "src/swagger-docs/swagger-api-docs/sample-api.yaml",
    `# Sample API YAML File

# This is a sample api YAML file (sample-api.yaml) to demonstrate the structure for documenting your API.

# To organize your api effectively, create separate YAML files for each API Controller (e.g., user-api.yaml, course-api.yaml), handling specific responsibilities for users and courses endpoints respectively.

# Integrate these YAML files into your swagger.ts or swagger.js file to consolidate your API documentation.

# Example:
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: APIs related to Users

servers:
  - url: /api/v1
    description: Local development server

paths:
  /register:
    post:
      tags:
        - Authentication
      summary: Register a new user
      operationId: userRegistration
      requestBody:
        description: Data required to register a new user
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
                - confirmPassword
              properties:
                name:
                  type: string
                  example: "John Doe"
                  description: "The user's full name"
                email:
                  type: string
                  format: email
                  example: "john.doe@example.com"
                  description: "The user's email address"
                password:
                  type: string
                  format: password
                  description: "The user's password"
                  example: "StrongPassword123!"
                confirmPassword:
                  type: string
                  format: password
                  description: "Confirm the user's password"
                  example: "StrongPassword123!"
      responses:
        '201':
          description: User successfully registered
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Please check your email: john.doe@example.com to activate your account"
                  activationToken:
                    type: string
                    description: "The activation token sent to the user's email"
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        '400':
          description: Bad request - Validation error
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Passwords do not match"
        '409':
          description: Conflict - Email already exists
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Email already exists"
      security: []

# // swagger.ts or swagger.js
# const userAPI = yamlAPIDocuments["user-api"];

# follow this method to integrate all your yaml files`
  );
  fs.writeFileSync(
    "src/swagger-docs/swagger-schema-docs/sample-schema.yaml",
    `# Sample Schema YAML File

# This is a sample schema YAML file (sample-schema.yaml) to demonstrate the structure for documenting your API.

# To organize your schemas effectively, create separate YAML files for each schema (e.g., user-schema.yaml, course-schema.yaml), each handling specific responsibilities.

# Import these YAML files into your swagger.ts or swagger.js file to consolidate your API documentation.

# Example:
components:
  schemas:
    User:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          description: Name of the user
        email:
          type: string
          description: Email address of the user
          format: email
        password:
          type: string
          description: User's password (hashed, not returned by default)
          format: password
        avatar:
          type: object
          properties:
            public_id:
              type: string
              description: Public ID of the user's avatar
            url:
              type: string
              description: URL of the user's avatar
          description: Avatar of the user
        role:
          type: string
          description: Role of the user, defaults to "user"
          example: user
        isVerified:
          type: boolean
          description: Whether the user is verified
          default: false
        courses:
          type: array
          items:
            type: object
            properties:
              courseId:
                type: string
                description: The course ID associated with the user
        createdAt:
          type: string
          format: date-time
          description: Timestamp when the user was created
        updatedAt:
          type: string
          format: date-time
          description: Timestamp when the user was last updated


# // swagger.ts or swagger.js

#const userSchema = yamlSchemaDocuments["sample-schema"];
#follow this method to integrate all your yaml files
`
  );
};
