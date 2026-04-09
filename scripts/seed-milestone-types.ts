// Seed script: insert default milestone types (idempotent)
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const defaultTypes = [
  {
    name: "Quarterly Product Report",
    category: "reporting",
    frequency: "quarterly",
    default_owner_role: "Product Lead",
    artifact_required: true,
    artifact_mode: "single",
    scheduling_rule: "auto_quarterly",
  },
  {
    name: "Annual Product Report",
    category: "reporting",
    frequency: "annual",
    default_owner_role: "Product Lead",
    artifact_required: true,
    artifact_mode: "single",
    scheduling_rule: "auto_annual",
  },
  {
    name: "Annual Technical Review",
    category: "internal",
    frequency: "annual",
    default_owner_role: "Architect",
    artifact_required: true,
    artifact_mode: "single",
    scheduling_rule: "manual",
  },
  {
    name: "User Research / Feedback",
    category: "client",
    frequency: "annual",
    default_owner_role: "Product Lead",
    artifact_required: true,
    artifact_mode: "multiple",
    scheduling_rule: "manual",
  },
  {
    name: "Internal Roadmap Prep Workshop",
    category: "internal",
    frequency: "annual",
    default_owner_role: "Product Lead",
    artifact_required: true,
    artifact_mode: "multiple",
    scheduling_rule: "manual",
  },
  {
    name: "Client Roadmap Workshop",
    category: "client",
    frequency: "annual",
    default_owner_role: "Product Lead",
    artifact_required: true,
    artifact_mode: "multiple",
    scheduling_rule: "manual",
  },
];

async function seed() {
  for (const t of defaultTypes) {
    console.log(`Seeding milestone type: ${t.name}`);
    await sql`
      INSERT INTO milestone_type (
        name, category, frequency, default_owner_role,
        artifact_required, artifact_mode, scheduling_rule
      ) VALUES (
        ${t.name},
        ${t.category}::milestone_category,
        ${t.frequency}::milestone_frequency,
        ${t.default_owner_role},
        ${t.artifact_required},
        ${t.artifact_mode}::milestone_artifact_mode,
        ${t.scheduling_rule}::milestone_scheduling_rule
      )
      ON CONFLICT DO NOTHING
    `;
  }

  console.log("Seed complete!");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
