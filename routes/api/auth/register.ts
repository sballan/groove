import { Handlers } from "$fresh/server.ts";
import { createUser, createSession, getSessionCookie } from "../../../lib/auth.ts";
import { ValidationError } from "../../../lib/validation.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const data = await req.json();
      const { email, password, name, timezone } = data;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: "Email, password, and name are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const user = await createUser(email, password, name, userTimezone);
      const session = await createSession(user.id);

      return new Response(
        JSON.stringify({ user, sessionId: session.id }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": getSessionCookie(session.id),
          },
        }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (error instanceof Error && error.message.includes("already exists")) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      console.error("Registration error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};