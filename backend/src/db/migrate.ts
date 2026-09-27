import "dotenv/config";
import { closeDb, runMigrations, SCHEMA } from "./index";
import { logger } from "../lib/logger";

runMigrations()
  .then((applied) => {
    console.log(`Schema: ${SCHEMA}`);
    console.log(
      applied.length ? `Applied: ${applied.join(", ")}` : "Already up to date.",
    );
  })
  .catch((error) => {
    logger.error(error, "Migration command failed");
    process.exitCode = 1;
  })
  .finally(() => closeDb());
