// Quick script to create technology tables since drizzle-kit push has path issues
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function push() {
  console.log("Creating technology table...");
  await sql`
    CREATE TABLE IF NOT EXISTS technology (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      category text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;

  console.log("Creating person_technology table...");
  await sql`
    CREATE TABLE IF NOT EXISTS person_technology (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
      technology_id uuid NOT NULL REFERENCES technology(id) ON DELETE CASCADE
    )
  `;

  console.log("Creating platform_technology table...");
  await sql`
    CREATE TABLE IF NOT EXISTS platform_technology (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      platform_id uuid NOT NULL REFERENCES platform(id) ON DELETE CASCADE,
      technology_id uuid NOT NULL REFERENCES technology(id) ON DELETE CASCADE
    )
  `;

  console.log("Seeding technologies...");
  const techs = [
    // Frontend
    { name: "React", category: "frontend" },
    { name: "Next.js", category: "frontend" },
    { name: "Angular", category: "frontend" },
    { name: "Vue.js", category: "frontend" },
    { name: "Svelte", category: "frontend" },
    { name: "HTML/CSS", category: "frontend" },
    { name: "Tailwind CSS", category: "frontend" },
    // Mobile
    { name: "Flutter", category: "mobile" },
    { name: "React Native", category: "mobile" },
    { name: "Swift/iOS", category: "mobile" },
    { name: "Kotlin/Android", category: "mobile" },
    // Backend
    { name: "Node.js", category: "backend" },
    { name: ".NET", category: "backend" },
    { name: "Python", category: "backend" },
    { name: "Java", category: "backend" },
    { name: "PHP/Laravel", category: "backend" },
    { name: "Go", category: "backend" },
    { name: "Ruby on Rails", category: "backend" },
    // Cloud
    { name: "Azure", category: "cloud" },
    { name: "AWS", category: "cloud" },
    { name: "Google Cloud", category: "cloud" },
    { name: "Vercel", category: "cloud" },
    // Database
    { name: "PostgreSQL", category: "database" },
    { name: "MySQL", category: "database" },
    { name: "MongoDB", category: "database" },
    { name: "SQL Server", category: "database" },
    // Other
    { name: "Docker", category: "other" },
    { name: "Kubernetes", category: "other" },
    { name: "GraphQL", category: "other" },
    { name: "WordPress", category: "other" },
  ];

  for (const t of techs) {
    await sql`INSERT INTO technology (name, category) VALUES (${t.name}, ${t.category}) ON CONFLICT (name) DO NOTHING`;
  }

  console.log(`Seeded ${techs.length} technologies.`);
  console.log("Done!");
  await sql.end();
}

push().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
