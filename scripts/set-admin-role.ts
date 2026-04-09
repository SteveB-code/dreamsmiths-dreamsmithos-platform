import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);

  // Show all users and their roles
  const users = await sql`SELECT id, name, email, role FROM "user"`;
  console.log("Current users:");
  for (const u of users) {
    console.log(`  ${u.name} (${u.email}) — role: ${u.role}`);
  }

  // Set all current users to admin (Steve and any existing admins)
  const updated =
    await sql`UPDATE "user" SET role = 'admin' WHERE role != 'admin' RETURNING name, email`;
  if (updated.length > 0) {
    console.log("\nUpdated to admin:");
    for (const u of updated) {
      console.log(`  ${u.name} (${u.email})`);
    }
  } else {
    console.log("\nAll users already have admin role.");
  }

  await sql.end();
}

main().catch(console.error);
