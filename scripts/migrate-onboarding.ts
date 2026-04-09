// Migration script: add contractor onboarding tables
// (payment_method enum, contractor_profile, contractor_financial, legal_agreement)
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Creating payment_method enum...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE payment_method AS ENUM ('eft', 'upwork');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  console.log("Creating contractor_profile table...");
  await sql`
    CREATE TABLE IF NOT EXISTS contractor_profile (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES person(id) ON DELETE CASCADE,
      nickname text,
      physical_address text,
      id_number text,
      id_verification_url text,
      proof_of_address_url text,
      next_of_kin_name text,
      next_of_kin_phone text,
      next_of_kin_relationship text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `;

  console.log("Creating contractor_financial table...");
  await sql`
    CREATE TABLE IF NOT EXISTS contractor_financial (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES person(id) ON DELETE CASCADE,
      hourly_rate integer,
      payment_method payment_method,
      bank_name text,
      account_holder text,
      account_number text,
      branch_code text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `;

  console.log("Creating legal_agreement table...");
  await sql`
    CREATE TABLE IF NOT EXISTS legal_agreement (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      onboarding_journey_id uuid NOT NULL REFERENCES onboarding_journey(id) ON DELETE CASCADE,
      person_id uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
      agreement_type text NOT NULL,
      agreed_at timestamp,
      ip_address text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;

  console.log("Migration complete!");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
