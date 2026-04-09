// Migration script: add milestone tables, enums, and planning fields to platform
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  // ── Enums ──────────────────────────────────────────────────

  console.log("Creating milestone_category enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE milestone_category AS ENUM ('reporting', 'client', 'internal');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating milestone_frequency enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE milestone_frequency AS ENUM ('quarterly', 'annual');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating milestone_scheduling_rule enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE milestone_scheduling_rule AS ENUM ('auto_quarterly', 'auto_annual', 'manual');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating milestone_artifact_mode enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE milestone_artifact_mode AS ENUM ('single', 'multiple');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating milestone_status enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE milestone_status AS ENUM ('scheduled', 'upcoming', 'due', 'overdue', 'complete');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  // ── Platform table: new planning columns ───────────────────

  console.log("Adding planning columns to platform table...");
  await sql`
    ALTER TABLE platform
      ADD COLUMN IF NOT EXISTS financial_year_start_day integer,
      ADD COLUMN IF NOT EXISTS financial_year_start_month integer,
      ADD COLUMN IF NOT EXISTS budget_preparation_month integer,
      ADD COLUMN IF NOT EXISTS strategic_planning_window_start integer,
      ADD COLUMN IF NOT EXISTS strategic_planning_window_end integer,
      ADD COLUMN IF NOT EXISTS planning_cycle_notes text
  `;

  // ── milestone_type table ───────────────────────────────────

  console.log("Creating milestone_type table...");
  await sql`
    CREATE TABLE IF NOT EXISTS milestone_type (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      category milestone_category NOT NULL,
      frequency milestone_frequency NOT NULL,
      default_owner_role text NOT NULL,
      artifact_required boolean NOT NULL DEFAULT true,
      artifact_mode milestone_artifact_mode NOT NULL DEFAULT 'single',
      scheduling_rule milestone_scheduling_rule NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `;

  // ── milestone table ────────────────────────────────────────

  console.log("Creating milestone table...");
  await sql`
    CREATE TABLE IF NOT EXISTS milestone (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      platform_id uuid NOT NULL REFERENCES platform(id) ON DELETE CASCADE,
      milestone_type_id uuid NOT NULL REFERENCES milestone_type(id) ON DELETE CASCADE,
      financial_year text NOT NULL,
      status milestone_status NOT NULL DEFAULT 'scheduled',
      due_date timestamp,
      completed_date timestamp,
      completed_by text REFERENCES "user"(id),
      completed_late boolean NOT NULL DEFAULT false,
      owner_person_id uuid REFERENCES person(id) ON DELETE SET NULL,
      notes text,
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
