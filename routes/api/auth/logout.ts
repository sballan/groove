import { Handlers } from "$fresh/server.ts";
import { deleteSession, getSessionIdFromCookie, clearSessionCookie } from "../../../lib/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    const cookieHeader = req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (sessionId) {
      await deleteSession(sessionId);
    }

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearSessionCookie(),
        },
      }
    );
  },
};