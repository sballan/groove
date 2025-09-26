import type { Habit, HabitCategory, HabitPriority, User, WorkHours } from "./types.ts";

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "ValidationError";
  }
}

export function validateEmail(email: string): void {
  if (!email) {
    throw new ValidationError("email", "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("email", "Invalid email format");
  }
}

export function validateRequired(value: unknown, field: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(field, "Field is required");
  }
}

export function validateString(value: unknown, field: string, minLength = 0, maxLength = Infinity): void {
  validateRequired(value, field);

  if (typeof value !== "string") {
    throw new ValidationError(field, "Must be a string");
  }

  if (value.length < minLength) {
    throw new ValidationError(field, `Must be at least ${minLength} characters`);
  }

  if (value.length > maxLength) {
    throw new ValidationError(field, `Must be no more than ${maxLength} characters`);
  }
}

export function validateNumber(value: unknown, field: string, min = -Infinity, max = Infinity): void {
  validateRequired(value, field);

  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(field, "Must be a valid number");
  }

  if (value < min) {
    throw new ValidationError(field, `Must be at least ${min}`);
  }

  if (value > max) {
    throw new ValidationError(field, `Must be no more than ${max}`);
  }
}

export function validateHabitCategory(category: unknown): asserts category is HabitCategory {
  const validCategories: HabitCategory[] = ["people", "activities", "responsibilities"];

  if (!validCategories.includes(category as HabitCategory)) {
    throw new ValidationError("category", `Must be one of: ${validCategories.join(", ")}`);
  }
}

export function validateHabitPriority(priority: unknown): asserts priority is HabitPriority {
  const validPriorities: HabitPriority[] = ["low", "medium", "high"];

  if (!validPriorities.includes(priority as HabitPriority)) {
    throw new ValidationError("priority", `Must be one of: ${validPriorities.join(", ")}`);
  }
}

export function validateFrequencyType(type: unknown): asserts type is Habit["frequency"]["type"] {
  const validTypes = ["daily", "weekly", "monthly", "custom"];

  if (!validTypes.includes(type as string)) {
    throw new ValidationError("frequency.type", `Must be one of: ${validTypes.join(", ")}`);
  }
}

export function validateWeekdays(weekdays: unknown): asserts weekdays is number[] {
  if (!Array.isArray(weekdays)) {
    throw new ValidationError("frequency.weekdays", "Must be an array");
  }

  for (const day of weekdays) {
    if (typeof day !== "number" || day < 0 || day > 6) {
      throw new ValidationError("frequency.weekdays", "Weekdays must be numbers between 0-6 (Sunday=0)");
    }
  }
}

export function validateTimeString(time: unknown, field: string): void {
  if (typeof time !== "string") {
    throw new ValidationError(field, "Must be a string");
  }

  const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new ValidationError(field, "Must be in HH:MM format (24-hour)");
  }
}

export function validateUser(data: unknown): asserts data is Omit<User, "id" | "createdAt" | "updatedAt"> {
  if (!data || typeof data !== "object") {
    throw new ValidationError("user", "User data must be an object");
  }

  const user = data as Record<string, unknown>;

  validateEmail(user.email as string);
  validateString(user.name, "name", 1, 100);
  validateString(user.timezone, "timezone", 1, 50);

  if (user.workHours !== undefined) {
    validateWorkHours(user.workHours);
  }
}

export function validateWorkHours(data: unknown): asserts data is WorkHours {
  if (!data || typeof data !== "object") {
    throw new ValidationError("workHours", "Work hours must be an object");
  }

  const workHours = data as Record<string, unknown>;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  for (const day of days) {
    const dayHours = workHours[day];

    if (dayHours === null || dayHours === undefined) {
      continue; // null/undefined is valid (no work on this day)
    }

    if (typeof dayHours !== "object" || dayHours === null) {
      throw new ValidationError(`workHours.${day}`, "Must be an object with start and end times or null");
    }

    const hours = dayHours as Record<string, unknown>;
    validateTimeString(hours.start, `workHours.${day}.start`);
    validateTimeString(hours.end, `workHours.${day}.end`);

    // Validate that start time is before end time
    const start = hours.start as string;
    const end = hours.end as string;
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      throw new ValidationError(`workHours.${day}`, "Start time must be before end time");
    }
  }
}

export function validateHabit(data: unknown): asserts data is Omit<Habit, "id" | "createdAt" | "updatedAt"> {
  if (!data || typeof data !== "object") {
    throw new ValidationError("habit", "Habit data must be an object");
  }

  const habit = data as Record<string, unknown>;

  validateString(habit.userId, "userId", 1);
  validateString(habit.name, "name", 1, 100);

  if (habit.description !== undefined) {
    validateString(habit.description, "description", 0, 500);
  }

  validateHabitCategory(habit.category);
  validateHabitPriority(habit.priority);

  if (!habit.frequency || typeof habit.frequency !== "object") {
    throw new ValidationError("frequency", "Frequency is required and must be an object");
  }

  const frequency = habit.frequency as Record<string, unknown>;
  validateFrequencyType(frequency.type);
  validateNumber(frequency.interval, "frequency.interval", 1);

  if (frequency.type === "weekly" && frequency.weekdays !== undefined) {
    validateWeekdays(frequency.weekdays);
  }

  validateNumber(habit.duration, "duration", 1, 1440); // 1 minute to 24 hours

  if (!Array.isArray(habit.tags)) {
    throw new ValidationError("tags", "Tags must be an array");
  }

  for (const tag of habit.tags) {
    if (typeof tag !== "string") {
      throw new ValidationError("tags", "All tags must be strings");
    }
  }

  if (typeof habit.active !== "boolean") {
    throw new ValidationError("active", "Active must be a boolean");
  }
}