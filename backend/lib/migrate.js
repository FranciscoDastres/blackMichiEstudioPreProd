import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, "..", "db", "migrations");

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   varchar(255) PRIMARY KEY,
        applied_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows } = await client.query("SELECT filename FROM schema_migrations");
    const applied = new Set(rows.map(r => r.filename));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".sql"))
      .sort();

    const pending = files.filter(f => !applied.has(f));
    if (pending.length === 0) {
      logger.info("Migraciones al día");
      return;
    }

    logger.info({ pending }, "Aplicando migraciones pendientes");

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        logger.info({ file }, "Migración aplicada");
      } catch (err) {
        await client.query("ROLLBACK");
        logger.fatal({ file, err }, "Migración falló — abortando arranque");
        throw err;
      }
    }
  } finally {
    client.release();
  }
}
