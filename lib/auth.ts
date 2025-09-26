import { db } from "./db.ts";
import type { User, Session } from "./types.ts";
import { validateEmail, validateString } from "./validation.ts";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export async function createUser(email: string, password: string, name: string, timezone: string): Promise<User> {
  validateEmail(email);
  validateString(password, "password", 6, 100);
  validateString(name, "name", 1, 100);
  validateString(timezone, "timezone", 1, 50);

  const existingUser = await db.users.getByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.users.create({
    email,
    name,
    timezone,
  });

  await db.kv.set(["user_passwords", user.id], hashedPassword);

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  validateEmail(email);
  validateString(password, "password", 1);

  const user = await db.users.getByEmail(email);
  if (!user) {
    return null;
  }

  const storedHash = await db.kv.get<string>(["user_passwords", user.id]);
  if (!storedHash.value) {
    return null;
  }

  const isValid = await verifyPassword(password, storedHash.value);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function createSession(userId: string): Promise<Session> {
  return await db.sessions.create(userId);
}

export async function getSession(sessionId: string): Promise<Session | null> {
  return await db.sessions.get(sessionId);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.sessions.delete(sessionId);
}

export async function getUserFromSession(sessionId: string): Promise<User | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  return await db.users.getById(session.userId);
}

export function getSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

export function clearSessionCookie(): string {
  return `session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session') {
      return value;
    }
  }
  return null;
}