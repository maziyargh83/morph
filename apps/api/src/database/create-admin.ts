import { eq } from "drizzle-orm";
import { createAuth } from "../auth.ts";
import { createDatabase } from "./client.ts";
import { user } from "./schema.ts";

const email = required("ADMIN_EMAIL").toLowerCase();
const name = process.env.ADMIN_NAME?.trim() || "Morph Admin";

const { db, pool } = createDatabase();

try {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!existing) {
    const password = required("ADMIN_PASSWORD");
    if (password.length < 8) {
      throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
    }

    const auth = createAuth(db);
    await auth.api.signUpEmail({ body: { email, password, name } });
  }

  await db
    .update(user)
    .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
    .where(eq(user.email, email));

  console.log(`Admin access granted to ${email}.`);
} finally {
  await pool.end();
}

function required(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
