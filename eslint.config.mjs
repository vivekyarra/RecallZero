import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // RecallZero intentionally hydrates persisted demo state from localStorage once
  // on mount. Scope the React performance advisory to this one external-state bridge.
  {
    files: ["components/recall-zero-app.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([".next/**", "coverage/**", "playwright-report/**", "test-results/**", "services/**"]),
]);
