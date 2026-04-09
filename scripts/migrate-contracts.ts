// Migration script: add contract table and contract_status enum
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Creating contract_status enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE contract_status AS ENUM ('active', 'expiring_soon', 'expired', 'renewed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating contract table...");
  await sql`
    CREATE TABLE IF NOT EXISTS contract (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      platform_id uuid NOT NULL REFERENCES platform(id) ON DELETE CASCADE,
      title text NOT NULL,
      file_url text,
      file_name text,
      file_size integer,
      mime_type text,
      start_date timestamp NOT NULL,
      end_date timestamp NOT NULL,
      status contract_status NOT NULL DEFAULT 'active',
      notes text,
      uploaded_by text REFERENCES "user"(id),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `;

  console.log("Migration complete!");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
