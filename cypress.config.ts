import { defineConfig } from "cypress";

export default defineConfig({
  video: true,
  fixturesFolder: false,
  reporter: "mochawesome",

  reporterOptions: {
    reportDir: "reports",
    overwrite: false,
  },

  userAgent: "Chrome cypress",

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
