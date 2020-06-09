import fs from "fs";
import { down, up, config } from "migrate-mongo";
import { Connection } from "mongoose";
import path from "path";
import format from "date-fns/format";

const PREFIX_FORMAT = "yyyyMMddHHmmss";
const DEFAULT_MIGRATION_DIR = "src/migrations";
const DEFAULT_CONFIG_FILE_NAME = "migrate-mongo-config.js";

/**
 * Applies all unapplied migrations to the DB. Note that it passes the mongoose
 * connection in place of `MongoClient` due to being unable to access
 * that from mongoose.
 * @param connection mongoose connection to be used for migration
 */
export function migrateUp(connection: Connection) {
  // @ts-ignore replace client with connection
  return up(connection.db, connection);
}

/**
 * Undo the last applied migration. Note that it passes the mongoose
 * connection in place of `MongoClient` due to being unable to access
 * that from mongoose.
 * @param connection mongoose connection to be used for migration
 */
export function migrateDown(connection: Connection) {
  // @ts-ignore replace client with connection
  return down(connection.db, connection);
}

export async function create(description: string) {
  if (!description) {
    throw new Error("Missing parameter: description");
  }

  // where should we store the new migration
  await config.shouldExist();
  const migrationConfig = await config.read();
  const configuredDir = migrationConfig.migrationsDir?.replace("dist", "src") ?? DEFAULT_MIGRATION_DIR;
  const migrationsDir = path.isAbsolute(configuredDir) ? configuredDir : path.join(process.cwd(), configuredDir);

  try {
    await fs.promises.access(migrationsDir);
  } catch (err) {
    throw new Error(`migrations directory does not exist: ${migrationsDir}`);
  }

  // construct the file name
  const source = path.join(__dirname, "../samples/sample-migration.ts");
  const prefix = format(new Date(), PREFIX_FORMAT);
  const filename = `${prefix}-${description.split(" ").join("_")}.ts`;

  // copy sample file to new file
  const destination = path.join(migrationsDir, filename);
  await fs.promises.copyFile(source, destination);

  return filename;
}

export async function init() {
  const source = path.join(__dirname, `../samples/${DEFAULT_CONFIG_FILE_NAME}`);
  const destination = path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);

  await fs.promises.copyFile(source, destination);
  return fs.promises.mkdir(path.join(process.cwd(), "src/migrations"));
}
