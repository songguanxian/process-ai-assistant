import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const localAppData = process.env.LOCALAPPDATA ?? "";
const chromiumCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  join(localAppData, "ms-playwright", "chromium-1187", "chrome-win", "chrome.exe"),
  join(localAppData, "ms-playwright", "chromium-1181", "chrome-win", "chrome.exe")
].filter(Boolean);

const executablePath = chromiumCandidates.find((candidate) => existsSync(candidate));

export default defineConfig({
  testDir: "./tests",
  timeout: 20_000,
  use: {
    baseURL: process.env.DEMO_URL ?? "http://127.0.0.1:5174",
    launchOptions: executablePath ? { executablePath } : {}
  }
});
