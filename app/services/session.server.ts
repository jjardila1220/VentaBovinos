import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "~/db/index.ts";
import { users } from "~/db/schema/users.ts";
import { eq } from "drizzle-orm";

const DEV_SESSION_SECRET = "solo-para-desarrollo-local-no-usar-en-produccion";
const sessionSecret = process.env.SESSION_SECRET || DEV_SESSION_SECRET;

// Un secreto público o ausente permitiría falsificar cookies de sesión.
if (process.env.NODE_ENV === "production" && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error("SESSION_SECRET es obligatorio en producción y debe tener al menos 32 caracteres.");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__ganadocarnes_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}

export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId ? Number(userId) : null;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || null;
  } catch (error) {
    console.error("Error retrieving session user:", error);
    return null;
  }
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<number> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}
