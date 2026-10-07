import { redirect } from "@remix-run/node";
import { db } from "~/db/index.ts";
import { users } from "~/db/schema/users.ts";
import { eq } from "drizzle-orm";
import { getUser, getSession, commitSession } from "./session.server.ts";

declare const Bun: any;

export async function hashPassword(password: string): Promise<string> {
  // En runtime Bun usamos Bun.password.hash
  if (typeof Bun !== "undefined" && Bun.password) {
    return Bun.password.hash(password, { algorithm: "argon2id" });
  }
  // Fallback si corre fuera de bun
  const crypto = await import("node:crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof Bun !== "undefined" && Bun.password) {
    try {
      return await Bun.password.verify(password, hash);
    } catch {
      return false;
    }
  }
  try {
    const crypto = await import("node:crypto");
    const [salt, key] = hash.split(":");
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return key === testHash;
  } catch {
    return false;
  }
}

export async function authenticate(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));

  if (!user || !user.active) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function createUserSession(userId: number, redirectTo: string, request: Request) {
  const session = await getSession(request);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

// Role guards (Requirement: Validados en server loaders y actions)
export async function requireAdmin(request: Request) {
  const user = await getUser(request);
  if (!user || user.role !== "Administrador") {
    // Si un cliente entra a una ruta administrativa, redirigir al inicio con un mensaje
    throw redirect("/?error=Acceso+restringido.+Se+requieren+permisos+de+Administrador.");
  }
  return user;
}

export async function requireStaff(request: Request) {
  const user = await getUser(request);
  if (!user || (user.role !== "Administrador" && user.role !== "Vendedor")) {
    throw redirect("/?error=Acceso+restringido.+Se+requieren+permisos+de+personal.");
  }
  return user;
}
