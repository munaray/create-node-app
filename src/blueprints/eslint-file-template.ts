import fs from "fs";

export const eslintFile = (useTypescript: boolean) => {
  const eslint = useTypescript ? "eslint.config.mjs" : "eslint.config.js";
  const eslintContent = useTypescript
    ? `import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".config/*", "build/*"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      semi: ["error"],
      quotes: ["error", "double"],
    },
  },
];`
    : `import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: [".config", "build", "dist"],
  },
  { files: ["**/*.{js,mjs,cjs}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      semi: ["error"],
      quotes: ["error", "double"],
    },
  },
];`;

  fs.writeFileSync(eslint, eslintContent);
};
