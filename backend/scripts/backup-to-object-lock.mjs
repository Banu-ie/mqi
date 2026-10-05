import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;
const bucket = process.env.BACKUP_S3_BUCKET;
if (!databaseUrl || !bucket) {
  throw new Error("DATABASE_URL and BACKUP_S3_BUCKET are required.");
}
const database = new URL(databaseUrl);
if (database.protocol !== "postgres:" && database.protocol !== "postgresql:") {
  throw new Error("DATABASE_URL must be a PostgreSQL connection URL.");
}
const retentionDays = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS) || 365);
const now = new Date();
const retainUntil = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
const stamp = now.toISOString().replace(/[-:.]/g, "").replace(/Z$/, "Z");
const key = `${process.env.BACKUP_S3_PREFIX || "mqicma"}/database-${stamp}.dump`;
const tempDir = await mkdtemp(path.join(os.tmpdir(), "mqicma-backup-"));
const dumpPath = path.join(tempDir, "database.dump");

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", windowsHide: true, env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

try {
  const pgEnv = {
    ...process.env,
    PGHOST: database.hostname,
    PGPORT: database.port || "5432",
    PGDATABASE: decodeURIComponent(database.pathname.replace(/^\//, "")),
    PGUSER: decodeURIComponent(database.username),
    PGPASSWORD: decodeURIComponent(database.password),
    ...(database.searchParams.has("sslmode")
      ? { PGSSLMODE: database.searchParams.get("sslmode") }
      : {}),
  };
  const dumpArgs = ["--format=custom", "--no-owner", "--no-acl", `--file=${dumpPath}`];
  if (process.env.BACKUP_PG_DUMP_DOCKER_IMAGE) {
    const containerDumpPath = `/backup/${path.basename(dumpPath)}`;
    const args = ["run", "--rm", "-v", `${tempDir}:/backup"];
    for (const name of ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGSSLMODE"])
      if (pgEnv[name]) args.push("-e", name);
    await run("docker", [
      ...args,
      process.env.BACKUP_PG_DUMP_DOCKER_IMAGE,
      "pg_dump",
      ...dumpArgs.map((arg) => arg === `--file=${dumpPath}` ? `--file=${containerDumpPath}` : arg),
    ], pgEnv);
  } else {
    await run("pg_dump", dumpArgs, pgEnv);
  }
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(dumpPath)) hash.update(chunk);
  const sha256 = hash.digest("hex");
  await run("aws", [
    "s3api", "put-object", "--bucket", bucket, "--key", key, "--body", dumpPath,
    "--object-lock-mode", "COMPLIANCE",
    "--object-lock-retain-until-date", retainUntil.toISOString(),
    "--metadata", `sha256=${sha256}`,
  ]);
  console.log(`Stored immutable backup s3://${bucket}/${key}; SHA-256 ${sha256}`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
