// Migration script: add playbook_item table and related enums
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Creating playbook_category enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE playbook_category AS ENUM ('getting_started', 'development', 'client_work', 'operations', 'design', 'general');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating playbook_content_type enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE playbook_content_type AS ENUM ('video', 'sop', 'template', 'guide', 'policy');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating playbook_item table...");
  await sql`
    CREATE TABLE IF NOT EXISTS playbook_item (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      category playbook_category NOT NULL,
      content_type playbook_content_type NOT NULL,
      external_url text,
      file_url text,
      file_name text,
      file_size integer,
      mime_type text,
      markdown_content text,
      audience text NOT NULL DEFAULT 'management,product_lead,employee,contractor',
      sort_order integer NOT NULL DEFAULT 0,
      created_by text REFERENCES "user"(id),
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
