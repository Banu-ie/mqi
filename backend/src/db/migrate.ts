import "dotenv/config";
import { closeDb, runMigrations, SCHEMA } from "./index";

runMigrations()
  .then((applied) => {
    console.log(`Schema: ${SCHEMA}`);
    console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Already up to date.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
