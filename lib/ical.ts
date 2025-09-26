import type { ScheduledEvent } from "./scheduler.ts";

export class ICalGenerator {
  private events: ScheduledEvent[];
  private calendarName: string;
  private timezone: string;

  constructor(events: ScheduledEvent[], calendarName: string, timezone: string) {
    this.events = events;
    this.calendarName = calendarName;
    this.timezone = timezone;
  }

  generate(): string {
    const lines: string[] = [];

    // Calendar header
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Groove Habit Tracker//EN");
    lines.push(`X-WR-CALNAME:${this.calendarName}`);
    lines.push(`X-WR-TIMEZONE:${this.timezone}`);
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");

    // Add timezone definition
    lines.push("BEGIN:VTIMEZONE");
    lines.push(`TZID:${this.timezone}`);
    lines.push("END:VTIMEZONE");

    // Add events
    for (const event of this.events) {
      lines.push(...this.createEvent(event));
    }

    // Calendar footer
    lines.push("END:VCALENDAR");

    // Join with CRLF line endings as per iCal spec
    return lines.join("\r\n");
  }

  private createEvent(event: ScheduledEvent): string[] {
    const lines: string[] = [];

    // Generate unique ID for the event
    const uid = this.generateUID(event);

    // Format dates in iCal format (YYYYMMDDTHHMMSS)
    const startStr = this.formatDate(event.startTime);
    const endStr = this.formatDate(event.endTime);

    // Determine color based on category
    const color = this.getCategoryColor(event.category);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${this.formatDate(new Date())}`);
    lines.push(`DTSTART;TZID=${this.timezone}:${startStr}`);
    lines.push(`DTEND;TZID=${this.timezone}:${endStr}`);
    lines.push(`SUMMARY:${this.escapeText(event.habitName)}`);

    // Add description with category and priority
    const description = `Category: ${event.category}\\nPriority: ${event.priority}\\nDuration: ${event.duration} minutes`;
    lines.push(`DESCRIPTION:${this.escapeText(description)}`);

    // Add category
    lines.push(`CATEGORIES:${event.category.toUpperCase()}`);

    // Add priority (1=high, 5=medium, 9=low)
    const priorityMap = { high: 1, medium: 5, low: 9 };
    lines.push(`PRIORITY:${priorityMap[event.priority]}`);

    // Add color for calendar apps that support it
    lines.push(`COLOR:${color}`);

    // Add reminder 5 minutes before
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${this.escapeText(event.habitName)} starting soon`);
    lines.push("TRIGGER:-PT5M");
    lines.push("END:VALARM");

    lines.push("END:VEVENT");

    return lines;
  }

  private generateUID(event: ScheduledEvent): string {
    // Create a unique ID based on habit ID and start time
    const timestamp = event.startTime.getTime();
    const random = Math.random().toString(36).substring(2, 9);
    return `${event.habitId}-${timestamp}-${random}@groove.app`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  private escapeText(text: string): string {
    // Escape special characters as per iCal spec
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "");
  }

  private getCategoryColor(category: string): string {
    // Return color codes that work with various calendar apps
    switch (category) {
      case "people":
        return "#4CAF50"; // Green
      case "activities":
        return "#2196F3"; // Blue
      case "responsibilities":
        return "#FF9800"; // Orange
      default:
        return "#9C27B0"; // Purple
    }
  }
}

export function generateCalendarFeed(
  events: ScheduledEvent[],
  userName: string,
  timezone: string
): string {
  const generator = new ICalGenerator(
    events,
    `${userName}'s Groove Habits`,
    timezone
  );
  return generator.generate();
}