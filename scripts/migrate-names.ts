import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Step 1: Add firstName and lastName columns...");
  await sql`ALTER TABLE person ADD COLUMN IF NOT EXISTS first_name text`;
  await sql`ALTER TABLE person ADD COLUMN IF NOT EXISTS last_name text`;

  console.log("Step 2: Migrate existing data from full_name...");
  // Split full_name into first_name and last_name
  const people = await sql`SELECT id, full_name FROM person WHERE first_name IS NULL OR last_name IS NULL`;
  for (const p of people) {
    const parts = (p.full_name as string).trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    await sql`UPDATE person SET first_name = ${firstName}, last_name = ${lastName} WHERE id = ${p.id}`;
    console.log(`  Migrated: ${p.full_name} → "${firstName}" "${lastName}"`);
  }

  console.log("Step 3: Make columns NOT NULL...");
  await sql`ALTER TABLE person ALTER COLUMN first_name SET NOT NULL`;
  await sql`ALTER TABLE person ALTER COLUMN last_name SET NOT NULL`;

  console.log("Step 4: Drop old full_name column...");
  await sql`ALTER TABLE person DROP COLUMN IF EXISTS full_name`;

  console.log("Done!");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
