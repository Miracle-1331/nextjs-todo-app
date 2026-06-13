import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/layout.tsx", "!src/app/page.tsx"],
};

export default createJestConfig(config);
