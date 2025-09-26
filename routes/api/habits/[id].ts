import { Handlers } from "$fresh/server.ts";
import { db } from "../../../lib/db.ts";
import { validateHabit, ValidationError } from "../../../lib/validation.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { id } = ctx.params;

    try {
      const habit = await db.habits.getById(id);

      if (!habit) {
        return new Response(
          JSON.stringify({ error: "Habit not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(habit), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to fetch habit:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch habit" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async PUT(req, ctx) {
    const { id } = ctx.params;

    try {
      const data = await req.json();

      // Validate the habit data (excluding fields that shouldn't be updated)
      const { id: _, createdAt, updatedAt, ...updateData } = data;
      validateHabit({ userId: "temp", ...updateData });

      const habit = await db.habits.update(id, updateData);

      if (!habit) {
        return new Response(
          JSON.stringify({ error: "Habit not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(habit), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.error("Failed to update habit:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update habit" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async DELETE(_req, ctx) {
    const { id } = ctx.params;

    try {
      const deleted = await db.habits.delete(id);

      if (!deleted) {
        return new Response(
          JSON.stringify({ error: "Habit not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(null, { status: 204 });
    } catch (error) {
      console.error("Failed to delete habit:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete habit" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};