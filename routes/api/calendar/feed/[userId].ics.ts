import { Handlers } from "$fresh/server.ts";
import { db } from "../../../../lib/db.ts";
import { ScheduleGenerator } from "../../../../lib/scheduler.ts";
import { generateCalendarFeed } from "../../../../lib/ical.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { userId } = ctx.params;

    try {
      // Get user
      const user = await db.users.getById(userId);
      if (!user) {
        return new Response("User not found", { status: 404 });
      }

      // Get user's active habits
      const habits = await db.habits.getByUserId(userId);
      const activeHabits = habits.filter(h => h.active);

      // Get recent completions (for better scheduling)
      const completions = await db.completions.getByUserId(userId);

      // Generate schedule for the next 30 days
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      endDate.setHours(23, 59, 59, 999);

      // Generate schedule
      const generator = new ScheduleGenerator(
        user,
        activeHabits,
        completions,
        startDate,
        endDate
      );
      const events = generator.generateSchedule();

      // Generate iCal feed
      const icalContent = generateCalendarFeed(
        events,
        user.name,
        user.timezone
      );

      // Return as .ics file
      return new Response(icalContent, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": `attachment; filename="${user.name.replace(/\s+/g, '-')}-groove-habits.ics"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("Failed to generate calendar feed:", error);
      return new Response("Failed to generate calendar feed", { status: 500 });
    }
  },
};