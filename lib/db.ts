// lib/db.ts
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { User, Widget, ClashRoyaleChallenge, BonusHunt, BonusHuntSlot } from "./models";

interface Database {
  users: User;
  widgets: Widget;
  clash_royale_challenges: ClashRoyaleChallenge;
  bonus_hunts: BonusHunt;
  bonus_hunt_slots: BonusHuntSlot;
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
