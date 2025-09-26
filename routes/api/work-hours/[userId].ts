import { Handlers } from "$fresh/server.ts";
import { db } from "../../../lib/db.ts";
import { validateWorkHours, ValidationError } from "../../../lib/validation.ts";
import { getSessionIdFromCookie, getUserFromSession } from "../../../lib/auth.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const { userId } = ctx.params;

    // Verify the user is authenticated and accessing their own data
    const cookieHeader = req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionUser = await getUserFromSession(sessionId);
    if (!sessionUser || sessionUser.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await db.users.getById(userId);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ workHours: user.workHours || null }), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async PUT(req, ctx) {
    const { userId } = ctx.params;

    // Verify the user is authenticated and updating their own data
    const cookieHeader = req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionUser = await getUserFromSession(sessionId);
    if (!sessionUser || sessionUser.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const data = await req.json();
      const { workHours } = data;

      // Validate work hours
      if (workHours) {
        validateWorkHours(workHours);
      }

      // Update user's work hours
      const updatedUser = await db.users.update(userId, { workHours });

      if (!updatedUser) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Work hours updated successfully",
          workHours: updatedUser.workHours
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.error("Failed to update work hours:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update work hours" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};