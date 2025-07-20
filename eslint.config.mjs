import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { withNuxt } = await import(
  resolve(__dirname, ".nuxt/eslint.config.mjs")
);

export default withNuxt([eslintPluginPrettierRecommended]);
