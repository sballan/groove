import { Handlers } from "$fresh/server.ts";
import { authenticateUser, createSession, getSessionCookie } from "../../../lib/auth.ts";
import { ValidationError } from "../../../lib/validation.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const data = await req.json();
      const { email, password } = data;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const user = await authenticateUser(email, password);

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Invalid email or password" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const session = await createSession(user.id);

      return new Response(
        JSON.stringify({ user, sessionId: session.id }),
        {
          status: 200,
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

      console.error("Login error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to login" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};