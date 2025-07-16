// lib/db.ts
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { User } from "./models";

interface Database {
  users: User;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }),
  }),
});

export default db;
