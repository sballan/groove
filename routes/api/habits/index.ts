import { Handlers } from "$fresh/server.ts";
import { db } from "../../../lib/db.ts";
import { validateHabit, ValidationError } from "../../../lib/validation.ts";
import type { Habit } from "../../../lib/types.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const habits = await db.habits.getByUserId(userId);
      return new Response(JSON.stringify(habits), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch habits" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async POST(req) {
    try {
      const data = await req.json();

      // Validate the habit data
      validateHabit(data);

      const habit = await db.habits.create(data);

      return new Response(JSON.stringify(habit), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.error("Failed to create habit:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create habit" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};