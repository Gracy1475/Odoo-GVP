const express = require("express");
const routes = require("./routes");
const { initDb } = require("./utils/db");
const { sendSuccess } = require("./utils/response");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  return sendSuccess(res, "FleetFlow API is healthy", {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await initDb();

  const port = Number(process.env.API_PORT || 4000);
  app.listen(port, () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`FleetFlow backend listening on port ${port}`);
    }
  });
}

startServer().catch((error) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("Failed to start FleetFlow backend", error);
  }
  process.exit(1);
});

module.exports = { app };